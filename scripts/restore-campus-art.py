"""Restore dev.124 art from a trusted local delivery without overwriting files."""
import argparse
from hashlib import file_digest, sha256
import json
import os
from pathlib import Path, PurePosixPath
import tempfile
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--delivery", required=True, type=Path)
args = parser.parse_args()
manifest = json.loads((ROOT / "CAMPUS-ART-FILES.json").read_text(encoding="utf-8"))
if manifest["format"] != "hyper-dimension.uw-local-art/v1":
    raise SystemExit("Unexpected campus art manifest")
with args.delivery.open("rb") as source:
    if file_digest(source, "sha256").hexdigest() != manifest["deliveryArchiveSha256"]:
        raise SystemExit("The ZIP checksum does not match this source release")

targets = {}
for item in manifest["files"]:
    name = item["path"]
    path = PurePosixPath(name)
    allowed = (
        name.startswith(("public/art-v0120/", "public/art-v0130/"))
        or name in {"public/kin-site-concrete.png", "public/pdl-bridge-precast.png"}
    )
    if (not allowed or path.is_absolute() or name != path.as_posix()
            or ".." in path.parts or "\\" in name or ":" in name or name.casefold() in targets):
        raise SystemExit("Unexpected or duplicate campus art path")
    target = ROOT.joinpath(*path.parts)
    if target.resolve() != target or not target.resolve().is_relative_to(ROOT):
        raise SystemExit(f"Path is outside this checkout or uses a link: {name}")
    targets[name.casefold()] = (item, target)
    if target.exists():
        with target.open("rb") as stream:
            if (target.stat().st_size != item["bytes"]
                    or file_digest(stream, "sha256").hexdigest() != item["sha256"]):
                raise SystemExit(f"Existing different file preserved: {name}")

restored = 0
with ZipFile(args.delivery) as archive:
    for item, target in targets.values():
        if target.exists():
            continue
        info = archive.getinfo(item["path"])
        if info.file_size != item["bytes"]:
            raise SystemExit(f"Unexpected file size: {item['path']}")
        target.parent.mkdir(parents=True, exist_ok=True)
        temp_path = None
        try:
            with archive.open(info) as source, tempfile.NamedTemporaryFile(
                prefix=".restore-art-", dir=target.parent, delete=False
            ) as temporary:
                temp_path = Path(temporary.name)
                digest = sha256()
                while chunk := source.read(1024 * 1024):
                    digest.update(chunk)
                    temporary.write(chunk)
            if digest.hexdigest() != item["sha256"]:
                raise SystemExit(f"Art checksum mismatch: {item['path']}")
            os.link(temp_path, target)
            restored += 1
        finally:
            if temp_path is not None:
                temp_path.unlink()
print(f"Verified {len(targets)} campus art files, restored {restored}.")
