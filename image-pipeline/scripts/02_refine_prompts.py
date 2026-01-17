from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.io_utils import load_yaml, read_json, write_json
from lib.prompt_engine import build_prompt, hash_prompt

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
SLOTS_DIR = BASE_DIR / "image-pipeline" / "prompts" / "slots"
INDEX_JSON = BASE_DIR / "image-pipeline" / "prompts" / "index.json"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--priority-only", action="store_true")
    parser.add_argument("--max-slots", type=int, default=0)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    config = load_yaml(CONFIG_PATH)
    slots = read_json(INDEX_JSON, default=[])

    if args.priority_only:
        slots = [s for s in slots if s.get("priority_level") in ("CRITICAL", "IMPORTANT")]
    if args.max_slots:
        slots = slots[: args.max_slots]

    updated = 0
    for slot in slots:
        slot_id = slot.get("slot_id")
        meta_path = SLOTS_DIR / slot_id / "meta.json"
        meta = read_json(meta_path, default={})
        if meta.get("super_prompt") and not args.force:
            continue
        prompt, constraints = build_prompt(meta, config)
        meta["super_prompt"] = prompt
        meta["prompt_hash"] = hash_prompt(prompt)
        meta["constraints"] = constraints
        write_json(meta_path, meta)
        updated += 1

    print(f"Super prompts updated: {updated}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
