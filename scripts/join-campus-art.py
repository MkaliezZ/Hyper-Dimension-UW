"""Reassemble the public dev.124 art ZIP and verify its SHA-256."""

import argparse
from hashlib import file_digest, sha256
import json
import os
from pathlib import Path
import tempfile


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("directory", nargs="?", type=Path, default=Path.cwd())
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
release = json.loads((root / "CAMPUS-ART-RELEASE.json").read_text(encoding="utf-8"))
destination = args.directory / release["file"]

if destination.exists():
    with destination.open("rb") as existing:
        if file_digest(existing, "sha256").hexdigest() != release["sha256"]:
            raise SystemExit(f"Existing different file preserved: {destination}")
    print(f"Verified {destination}")
    raise SystemExit(0)

parts = [(args.directory / item["file"], item) for item in release["volumes"]]
for path, item in parts:
    if not path.is_file() or path.stat().st_size != item["bytes"]:
        raise SystemExit(f"Missing or incomplete volume: {path.name}")

total = sha256()
temporary = None
try:
    with tempfile.NamedTemporaryFile(dir=args.directory, prefix=".join-campus-art-", delete=False) as joined:
        temporary = Path(joined.name)
        for path, item in parts:
            digest = sha256()
            with path.open("rb") as part:
                while chunk := part.read(1024 * 1024):
                    digest.update(chunk)
                    total.update(chunk)
                    joined.write(chunk)
            if digest.hexdigest() != item["sha256"]:
                raise SystemExit(f"Volume checksum mismatch: {path.name}")
    if temporary.stat().st_size != release["archiveBytes"] or total.hexdigest() != release["sha256"]:
        raise SystemExit("Reassembled ZIP checksum mismatch")
    os.link(temporary, destination)
    print(f"Reassembled and verified {destination}")
finally:
    if temporary is not None:
        temporary.unlink()
