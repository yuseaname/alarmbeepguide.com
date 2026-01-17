from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.io_utils import load_yaml, write_json, write_csv, write_text
from lib.slot_discovery import build_repo_profile, discover_slots_for_file, list_content_files

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
SLOTS_DIR = BASE_DIR / "image-pipeline" / "prompts" / "slots"
INDEX_JSON = BASE_DIR / "image-pipeline" / "prompts" / "index.json"
INDEX_CSV = BASE_DIR / "image-pipeline" / "prompts" / "index.csv"
REPO_PROFILE = BASE_DIR / "image-pipeline" / "REPO_PROFILE.md"


def main() -> int:
    config = load_yaml(CONFIG_PATH)
    site = config.get("site", {})
    base_dir = Path(site.get("base_dir", ".")).resolve()

    content_files = list_content_files(
        base_dir,
        site.get("content_roots", []),
        site.get("exclude_dirs", []),
    )

    slots = []
    for path in content_files:
        slots.extend(discover_slots_for_file(path, base_dir, config))

    # write per-slot meta
    for slot in slots:
        slot_dir = SLOTS_DIR / slot["slot_id"]
        write_json(slot_dir / "meta.json", slot)

    # indexes
    write_json(INDEX_JSON, slots)
    fieldnames = [
        "slot_id",
        "page_path",
        "usage",
        "slot_key",
        "anchor_text",
        "anchor_selector",
        "anchor_index",
        "insertion_mode",
        "priority_level",
        "recommended_size",
        "aspect_ratio",
    ]
    write_csv(INDEX_CSV, slots, fieldnames)

    # repo profile
    profile = build_repo_profile(content_files, config)
    write_text(REPO_PROFILE, profile)

    print(f"Pages scanned: {len(content_files)}")
    print(f"Slots discovered: {len(slots)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
