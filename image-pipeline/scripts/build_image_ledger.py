from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List

from bs4 import BeautifulSoup

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.io_utils import load_yaml, read_json, write_json, write_csv

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
SLOTS_DIR = BASE_DIR / "image-pipeline" / "prompts" / "slots"
INDEX_JSON = BASE_DIR / "image-pipeline" / "prompts" / "index.json"
MANIFEST_PATH = BASE_DIR / "image-pipeline" / "generated" / "manifest.json"
LEDGER_DIR = BASE_DIR / "image-pipeline" / "ledger"
LEDGER_JSON = LEDGER_DIR / "ledger.json"
LEDGER_CSV = LEDGER_DIR / "ledger.csv"
SUMMARY_JSON = LEDGER_DIR / "summary.json"
LEDGER_MD = LEDGER_DIR / "LEDGER.md"
LOCKED_PATH = LEDGER_DIR / "locked_slots.json"


def scan_html_for_slots(base_dir: Path) -> List[str]:
    slot_ids: List[str] = []
    for path in base_dir.rglob("*.html"):
        content = path.read_text(encoding="utf-8", errors="ignore")
        soup = BeautifulSoup(content, "html.parser")
        for tag in soup.find_all("img"):
            slot_id = tag.get("data-slot-id")
            if slot_id:
                slot_ids.append(slot_id)
    return slot_ids


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scan-html", action="store_true")
    args = parser.parse_args()

    config = load_yaml(CONFIG_PATH)
    base_dir = Path(config.get("site", {}).get("base_dir", ".")).resolve()

    slots = read_json(INDEX_JSON, default=[])
    manifest = read_json(MANIFEST_PATH, default={})
    manifest_entries = {e.get("slot_id"): e for e in manifest.get("entries", [])}
    locked = set(read_json(LOCKED_PATH, default=[]))

    placed = set()
    if args.scan_html:
        placed = set(scan_html_for_slots(base_dir))

    items: List[Dict[str, Any]] = []
    summary = {
        "total_slots": len(slots),
        "placed": 0,
        "generated_ready": 0,
        "needs_generation": 0,
        "stale_prompt_changed": 0,
        "failed_last_run": 0,
        "locked": 0,
    }

    for slot in slots:
        slot_id = slot.get("slot_id")
        status = "NEEDS_GENERATION"
        if slot_id in locked:
            status = "LOCKED"
            summary["locked"] += 1
        elif slot_id in placed:
            status = "PLACED"
            summary["placed"] += 1
        else:
            entry = manifest_entries.get(slot_id, {})
            if entry.get("status") == "success":
                status = "GENERATED_READY_TO_PLACE"
                summary["generated_ready"] += 1
            elif entry.get("status") == "stale":
                status = "STALE_PROMPT_CHANGED"
                summary["stale_prompt_changed"] += 1
            elif entry.get("status") == "failed":
                status = "FAILED_LAST_RUN"
                summary["failed_last_run"] += 1
            else:
                summary["needs_generation"] += 1

        items.append(
            {
                "slot_id": slot_id,
                "status": status,
                "page_path": slot.get("page_path"),
                "usage": slot.get("usage"),
                "prompt_hash": slot.get("prompt_hash"),
            }
        )

    write_json(LEDGER_JSON, {"summary": summary, "items": items})
    write_csv(LEDGER_CSV, items, ["slot_id", "status", "page_path", "usage", "prompt_hash"])
    write_json(SUMMARY_JSON, summary)

    lines = ["# Image Ledger", "", json.dumps(summary, indent=2)]
    LEDGER_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Slots: {len(slots)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
