"""Restore dev.124 art from a verified delivery or public art pack without overwriting files."""
import argparse
from hashlib import file_digest, sha256
import json
import os
from pathlib import Path, PurePosixPath
import tempfile
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
source = parser.add_mutually_exclusive_group(required=True)
source.add_argument("--delivery", type=Path)
source.add_argument("--art-pack", type=Path)
args = parser.parse_args()
manifest = json.loads((ROOT / "CAMPUS-ART-FILES.json").read_text(encoding="utf-8"))
if manifest["format"] != "hyper-dimension.uw-local-art/v1":
    raise SystemExit("Unexpected campus art manifest")
archive_path = args.delivery or args.art_pack
items = manifest["files"]
archive_hash = manifest["deliveryArchiveSha256"]
if args.art_pack:
    public = json.loads((ROOT / "CAMPUS-ART-RELEASE.json").read_text(encoding="utf-8"))
    if public["sourceSha256"] != archive_hash:
        raise SystemExit("The public art release belongs to a different source version")
    archive_hash = public["sha256"]
with archive_path.open("rb") as stream:
    if file_digest(stream, "sha256").hexdigest() != archive_hash:
        raise SystemExit("The ZIP checksum does not match this source release")
if args.art_pack:
    with ZipFile(archive_path) as archive:
        packaged = json.loads(archive.read("UW-ART-MANIFEST.json"))
    if (packaged["format"] != "hyper-dimension.uw-public-art/v1"
            or packaged["originalDeliverySha256"] != manifest["deliveryArchiveSha256"]):
        raise SystemExit("Unexpected public art pack manifest")
    indexed = {item["path"]: item for item in items}
    items = packaged["files"]
    if len(items) != public["files"] or any(indexed.get(item["path"]) != item for item in items):
        raise SystemExit("The public art pack does not match the expected file list")

targets = {}
for item in items:
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
with ZipFile(archive_path) as archive:
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
