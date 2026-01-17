from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.io_utils import load_yaml, read_json, write_json
from lib.prompt_engine import hash_prompt
from lib.openai_images import generate_image
from lib.image_postprocess import map_size, process_image

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
SLOTS_DIR = BASE_DIR / "image-pipeline" / "prompts" / "slots"
INDEX_JSON = BASE_DIR / "image-pipeline" / "prompts" / "index.json"
GENERATED_DIR = BASE_DIR / "image-pipeline" / "generated"
MANIFEST_PATH = GENERATED_DIR / "manifest.json"
LOCKED_PATH = BASE_DIR / "image-pipeline" / "ledger" / "locked_slots.json"
LOGS_PATH = GENERATED_DIR / "logs.jsonl"

ALLOWED_QUALITIES = {"low", "medium", "high", "auto"}
ALLOWED_SIZES = {"1024x1024", "1536x1024", "1024x1536", "auto"}


def score_slot(slot: Dict[str, Any]) -> int:
    score = 0
    if slot.get("usage") == "hero":
        score += 3
    if slot.get("priority_level") == "CRITICAL":
        score += 2
    if "index" in (slot.get("page_path") or "").lower() or "home" in (slot.get("page_path") or "").lower():
        score += 1
    return score


def load_locked() -> set:
    locked = read_json(LOCKED_PATH, default=[])
    return set(locked or [])


def estimate_cost_per_image(quality: str) -> float:
    if quality == "high":
        return 0.08
    if quality == "medium":
        return 0.04
    return 0.02


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--priority-only", action="store_true")
    parser.add_argument("--quality", default=None)
    parser.add_argument("--model", default=None)
    parser.add_argument("--size", default=None)
    parser.add_argument("--top-n", type=int, default=None)
    parser.add_argument("--max-slots", type=int, default=0)
    parser.add_argument("--budget-guard", type=float, default=0.0)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--report-priority", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    config = load_yaml(CONFIG_PATH)
    slots = read_json(INDEX_JSON, default=[])
    if not slots:
        print("No slots found. Run 01_discover_slots.py first.")
        return 1

    if args.priority_only:
        slots = [s for s in slots if s.get("priority_level") in ("CRITICAL", "IMPORTANT")]

    ranked = sorted(slots, key=lambda s: (-score_slot(s), s.get("slot_id", "")))
    top_n = args.top_n or config.get("pipeline", {}).get("top_n", 20)
    selected = ranked[:top_n]
    if args.max_slots:
        selected = selected[: args.max_slots]
    if args.budget_guard:
        allowed = int(args.budget_guard // estimate_cost_per_image(quality))
        selected = selected[: max(0, allowed)]

    if args.report_priority:
        report = [
            {
                "slot_id": s.get("slot_id"),
                "page_path": s.get("page_path"),
                "usage": s.get("usage"),
                "priority_level": s.get("priority_level"),
                "score": score_slot(s),
            }
            for s in selected
        ]
        print(report)

    model = args.model or os.environ.get("OPENAI_IMAGE_MODEL") or config.get("models", {}).get("default_model", "gpt-image-1")
    quality = args.quality or os.environ.get("OPENAI_IMAGE_QUALITY") or config.get("models", {}).get("default_quality", "medium")
    size_override = args.size or os.environ.get("OPENAI_IMAGE_SIZE") or config.get("models", {}).get("default_size", "1536x1024")

    if quality not in ALLOWED_QUALITIES:
        raise RuntimeError(f"Invalid quality '{quality}'. Allowed: {', '.join(sorted(ALLOWED_QUALITIES))}")
    if size_override not in ALLOWED_SIZES:
        raise RuntimeError(f"Invalid size '{size_override}'. Allowed: {', '.join(sorted(ALLOWED_SIZES))}")

    locked = load_locked()
    manifest_entries: List[Dict[str, Any]] = []

    for slot in selected:
        slot_id = slot.get("slot_id")
        meta_path = SLOTS_DIR / slot_id / "meta.json"
        meta = read_json(meta_path, default={})
        prompt = meta.get("super_prompt") or meta.get("prompt")
        if not prompt:
            manifest_entries.append({"slot_id": slot_id, "status": "failed", "reason": "missing_prompt"})
            continue

        prompt_hash = meta.get("prompt_hash") or hash_prompt(prompt)
        meta["prompt_hash"] = prompt_hash
        write_json(meta_path, meta)

        output_dir = GENERATED_DIR / "images" / "slots" / slot_id
        generated_meta_path = output_dir / "meta.generated.json"
        existing_meta = read_json(generated_meta_path, default={})

        if slot_id in locked and not args.force:
            manifest_entries.append({"slot_id": slot_id, "status": "skipped_locked"})
            continue

        if existing_meta.get("prompt_hash") == prompt_hash and not args.force:
            manifest_entries.append({"slot_id": slot_id, "status": "existing_valid"})
            continue
        if existing_meta and existing_meta.get("prompt_hash") and existing_meta.get("prompt_hash") != prompt_hash and not args.force:
            manifest_entries.append({"slot_id": slot_id, "status": "stale"})
            continue

        if args.dry_run:
            manifest_entries.append({"slot_id": slot_id, "status": "skipped_not_selected"})
            continue

        requested_size = meta.get("recommended_size", "1536x1024")
        generation_size = map_size(requested_size)
        image_bytes = generate_image(prompt, model, generation_size, quality, prompt_hash, LOGS_PATH)

        site_slug = Path(config.get("site", {}).get("base_dir", ".")).resolve().name
        page_slug = Path(meta.get("page_path", "")).stem
        paths = process_image(image_bytes, output_dir, requested_size, site_slug, page_slug, meta.get("slot_key", "slot"), slot_id)

        generated_meta = {
            "slot_id": slot_id,
            "prompt_hash": prompt_hash,
            "model": model,
            "quality": quality,
            "size": generation_size,
            "requested_size": requested_size,
            "files": paths,
        }
        write_json(generated_meta_path, generated_meta)
        manifest_entries.append({"slot_id": slot_id, "status": "success", "prompt_hash": prompt_hash})

    manifest = {"generated_at": None, "entries": manifest_entries}
    write_json(MANIFEST_PATH, manifest)

    print(f"Top {len(selected)} selected")
    print(f"Manifest entries: {len(manifest_entries)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
