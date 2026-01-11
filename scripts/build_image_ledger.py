import argparse
import json
import os
from typing import Dict, List

from _pipeline_utils import (
    load_config,
    load_locked_slots,
    list_content_files,
    score_slot,
    sha256,
    utc_now,
    write_csv,
    write_json,
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_PATH = os.path.join(BASE_DIR, "image-pipeline", "config.yaml")
INDEX_JSON = os.path.join(BASE_DIR, "image-prompts", "index.json")
SLOTS_DIR = os.path.join(BASE_DIR, "image-prompts", "slots")
MANIFEST_PATH = os.path.join(BASE_DIR, "generated-images", "manifest.json")
LEDGER_JSON = os.path.join(BASE_DIR, "image-ledger", "ledger.json")
LEDGER_CSV = os.path.join(BASE_DIR, "image-ledger", "ledger.csv")
SUMMARY_JSON = os.path.join(BASE_DIR, "image-ledger", "summary.json")
LEDGER_MD = os.path.join(BASE_DIR, "image-ledger", "LEDGER.md")
LOCKED_PATH = os.path.join(BASE_DIR, "image-ledger", "locked_slots.json")


def _read_json(path: str, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_meta(slot_id: str) -> Dict:
    path = os.path.join(SLOTS_DIR, slot_id, "meta.json")
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _scan_html_for_slots(config: Dict, slot_ids: List[str]) -> Dict[str, bool]:
    hits = {slot_id: False for slot_id in slot_ids}
    files = list_content_files(config, (".html", ".htm"))
    for path in files:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except OSError:
            continue
        for slot_id in slot_ids:
            if f"data-slot-id=\"{slot_id}\"" in content or f"data-slot-id='{slot_id}'" in content:
                hits[slot_id] = True
    return hits


def _top_slots(slots: List[Dict], top_n: int) -> List[Dict]:
    ranked = sorted(slots, key=lambda s: (-score_slot(s), s.get("slot_id", "")))
    return ranked[:top_n]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scan-html", action="store_true")
    args = parser.parse_args()

    config = load_config(CONFIG_PATH)
    index = _read_json(INDEX_JSON, [])
    if not index:
        print("No slots found in index.json")
        return 1

    manifest = _read_json(MANIFEST_PATH, {})
    manifest_status = {e.get("slot_id"): e.get("status") for e in manifest.get("entries", [])}

    slot_ids = [item.get("slot_id") for item in index]
    placed_lookup = _scan_html_for_slots(config, slot_ids) if args.scan_html else {sid: False for sid in slot_ids}

    locked = set(load_locked_slots(LOCKED_PATH))

    entries = []
    for item in index:
        slot_id = item.get("slot_id")
        meta = _load_meta(slot_id)
        prompt = meta.get("super_prompt") or meta.get("prompt") or ""
        prompt_hash = sha256(prompt) if prompt else ""

        slot_dir = os.path.join(BASE_DIR, "generated-images", "slots", slot_id)
        extension = config.get("images", {}).get("default_output_format", "png")
        image_path = os.path.join(slot_dir, f"image.{extension}")
        generated_meta_path = os.path.join(slot_dir, "meta.generated.json")
        generated_meta = _read_json(generated_meta_path, {})
        generated_prompt_hash = generated_meta.get("prompt_hash", "")

        generated_ok = os.path.exists(image_path) and generated_prompt_hash == prompt_hash and prompt_hash
        placed = placed_lookup.get(slot_id, False)

        status = "NEEDS_GENERATION"
        if slot_id in locked:
            status = "LOCKED"
        elif placed:
            status = "PLACED"
        elif manifest_status.get(slot_id) == "failed":
            status = "FAILED_LAST_RUN"
        elif generated_ok:
            status = "GENERATED_READY_TO_PLACE"
        elif os.path.exists(image_path) and generated_prompt_hash and generated_prompt_hash != prompt_hash:
            status = "STALE_PROMPT_CHANGED"

        entries.append(
            {
                "slot_id": slot_id,
                "page_path": item.get("page_path"),
                "usage": item.get("usage"),
                "priority_level": item.get("priority_level"),
                "status": status,
                "has_prompt": bool(meta.get("prompt")),
                "has_super_prompt": bool(meta.get("super_prompt")),
                "generated_image": os.path.exists(image_path),
                "placed": placed,
                "prompt_hash": prompt_hash,
                "generated_prompt_hash": generated_prompt_hash,
            }
        )

    summary = {
        "total_slots": len(entries),
        "placed": sum(1 for e in entries if e["status"] == "PLACED"),
        "generated_ready_to_place": sum(1 for e in entries if e["status"] == "GENERATED_READY_TO_PLACE"),
        "needs_generation": sum(1 for e in entries if e["status"] == "NEEDS_GENERATION"),
        "stale_prompt_changed": sum(1 for e in entries if e["status"] == "STALE_PROMPT_CHANGED"),
        "failed_last_run": sum(1 for e in entries if e["status"] == "FAILED_LAST_RUN"),
        "locked": sum(1 for e in entries if e["status"] == "LOCKED"),
    }

    top_n = config.get("pipeline", {}).get("top_n", 20)
    top_slots = _top_slots(index, top_n)
    top_ids = {s.get("slot_id") for s in top_slots}
    top_done = sum(1 for e in entries if e["slot_id"] in top_ids and e["status"] == "PLACED")

    ledger = {
        "generated_at": utc_now(),
        "summary": summary,
        "top_n": top_n,
        "top_n_placed": top_done,
        "entries": entries,
    }

    write_json(LEDGER_JSON, ledger)
    write_json(SUMMARY_JSON, summary)
    write_csv(
        LEDGER_CSV,
        entries,
        [
            "slot_id",
            "page_path",
            "usage",
            "priority_level",
            "status",
            "has_prompt",
            "has_super_prompt",
            "generated_image",
            "placed",
        ],
    )

    with open(LEDGER_MD, "w", encoding="utf-8") as f:
        f.write("# Image Ledger\n\n")
        f.write(f"Generated at: {ledger['generated_at']}\n\n")
        f.write("## Summary\n")
        for key, value in summary.items():
            f.write(f"- {key}: {value}\n")
        f.write(f"- top_n: {top_n}\n")
        f.write(f"- top_n_placed: {top_done}\n")
        f.write("\n")
        f.write("## Statuses\n")
        f.write("- PLACED\n- GENERATED_READY_TO_PLACE\n- NEEDS_GENERATION\n- STALE_PROMPT_CHANGED\n- FAILED_LAST_RUN\n- LOCKED\n")

    print(f"Ledger written: {LEDGER_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
