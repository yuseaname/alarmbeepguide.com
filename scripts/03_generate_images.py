import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Dict, List, Tuple

from _pipeline_utils import (
    load_config,
    load_locked_slots,
    parse_size,
    score_slot,
    sha256,
    utc_now,
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_PATH = os.path.join(BASE_DIR, "image-pipeline", "config.yaml")
SLOTS_DIR = os.path.join(BASE_DIR, "image-prompts", "slots")
INDEX_JSON = os.path.join(BASE_DIR, "image-prompts", "index.json")
MANIFEST_PATH = os.path.join(BASE_DIR, "generated-images", "manifest.json")
LOCKED_PATH = os.path.join(BASE_DIR, "image-ledger", "locked_slots.json")

ALLOWED_SIZES = ["1024x1024", "1536x1024", "1024x1536", "auto"]
ALLOWED_QUALITIES = ["low", "medium", "high", "auto"]


def load_slots() -> List[Dict]:
    slots: List[Dict] = []
    slot_ids: List[str] = []
    if os.path.exists(INDEX_JSON):
        with open(INDEX_JSON, "r", encoding="utf-8") as f:
            index = json.load(f)
        slot_ids = [item.get("slot_id") for item in index if item.get("slot_id")]
    elif os.path.exists(SLOTS_DIR):
        slot_ids = os.listdir(SLOTS_DIR)

    for slot_id in slot_ids:
        meta_path = os.path.join(SLOTS_DIR, slot_id, "meta.json")
        if not os.path.exists(meta_path):
            continue
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        prompt = meta.get("super_prompt") or meta.get("prompt")
        if not prompt:
            continue
        meta["prompt_hash"] = sha256(prompt)
        meta["_prompt"] = prompt
        slots.append(meta)
    return slots


def select_slots(slots: List[Dict], top_n: int, priority_only: bool, max_slots: int) -> List[Dict]:
    filtered = slots
    if priority_only:
        filtered = [s for s in slots if s.get("priority_level") in ("CRITICAL", "IMPORTANT")]
    ranked = sorted(filtered, key=lambda s: (-score_slot(s), s.get("slot_id", "")))
    selected = ranked[:top_n]
    if max_slots:
        selected = selected[:max_slots]
    return selected


def estimate_cost_per_image(quality: str) -> float:
    if quality == "high":
        return 0.08
    if quality == "medium":
        return 0.04
    return 0.02


def size_for_prompt(meta: Dict, model: str = "gpt-image-1") -> str:
    size_hint = meta.get("recommended_size", "")
    
    # Model-specific size constraints
    if model.startswith("dall-e"):
        allowed = ["1024x1024", "1792x1024", "1024x1792"]
        landscape = "1792x1024"
        portrait = "1024x1792"
    else:
        allowed = ["1024x1024", "1536x1024", "1024x1536", "auto"]
        landscape = "1536x1024"
        portrait = "1024x1536"
    
    if size_hint in allowed:
        return size_hint
    parsed = parse_size(size_hint)
    if parsed:
        width, height = parsed
        ratio = width / float(height)
        if ratio > 1.2:
            return landscape
        if ratio < 0.85:
            return portrait
    return "1024x1024"


def generate_image(prompt: str, model: str, size: str, quality: str) -> bytes:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    if not (model or "").lower().startswith("gpt-image-"):
        raise RuntimeError("Invalid model. Use GPT Image models only (e.g., gpt-image-1).")

    if quality not in ALLOWED_QUALITIES:
        raise RuntimeError(f"Invalid quality '{quality}'. Allowed: {', '.join(ALLOWED_QUALITIES)}")
    if size not in ALLOWED_SIZES:
        raise RuntimeError(f"Invalid size '{size}'. Allowed: {', '.join(ALLOWED_SIZES)}")

    url = "https://api.openai.com/v1/images/generations"
    payload = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": 1,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:  # nosec - user-controlled
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"API Error {e.code}: {error_body}", file=sys.stderr)
        raise RuntimeError(f"API Error {e.code}: {error_body}") from e
    b64 = data["data"][0]["b64_json"]
    return base64.b64decode(b64)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--priority-only", action="store_true")
    parser.add_argument("--quality", choices=ALLOWED_QUALITIES, default=None)
    parser.add_argument("--model", default="gpt-image-1")
    parser.add_argument("--top-n", type=int, default=None)
    parser.add_argument("--max-slots", type=int, default=0)
    parser.add_argument("--budget-guard", type=float, default=0.0)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--report-priority", action="store_true")
    parser.add_argument("--regen-selected", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    config = load_config(CONFIG_PATH)
    top_n = args.top_n or config.get("pipeline", {}).get("top_n", 20)
    quality = args.quality or config.get("images", {}).get("default_quality_priority", "medium")
    if quality not in ALLOWED_QUALITIES:
        raise RuntimeError(f"Invalid quality '{quality}'. Allowed: {', '.join(ALLOWED_QUALITIES)}")

    slots = load_slots()
    if not slots:
        print("No slots found. Run 01_discover_slots.py first.")
        return 1

    selected = select_slots(slots, top_n, args.priority_only, args.max_slots)

    if args.budget_guard:
        estimated_cost = estimate_cost_per_image(quality) * len(selected)
        if estimated_cost > args.budget_guard:
            allowed = int(args.budget_guard // estimate_cost_per_image(quality))
            selected = selected[:max(0, allowed)]

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
        print(json.dumps(report, indent=2))

    locked = set(load_locked_slots(LOCKED_PATH))
    manifest_entries = []

    selected_ids = {s.get("slot_id") for s in selected}
    for slot in slots:
        slot_id = slot.get("slot_id")
        is_selected = slot_id in selected_ids
        prompt_hash = slot.get("prompt_hash")
        slot_dir = os.path.join(BASE_DIR, "generated-images", "slots", slot_id)
        image_path = os.path.join(slot_dir, f"image.{config.get('images', {}).get('default_output_format', 'png')}")
        meta_path = os.path.join(slot_dir, "meta.generated.json")
        existing_meta = None
        if os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                existing_meta = json.load(f)

        exists_and_valid = (
            os.path.exists(image_path)
            and existing_meta
            and existing_meta.get("prompt_hash") == prompt_hash
        )
        if not is_selected:
            status = "success" if exists_and_valid else "skipped_not_selected"
            source = "existing_valid" if exists_and_valid else "skipped"
            manifest_entries.append(
                {
                    "slot_id": slot_id,
                    "status": status,
                    "source": source,
                    "prompt_hash": prompt_hash,
                    "page_path": slot.get("page_path"),
                    "selected": False,
                }
            )
            continue

        if slot_id in locked and not args.force:
            if exists_and_valid:
                manifest_entries.append(
                    {
                        "slot_id": slot_id,
                        "status": "success",
                        "source": "existing_valid",
                        "prompt_hash": prompt_hash,
                        "page_path": slot.get("page_path"),
                        "selected": True,
                        "note": "locked",
                    }
                )
            else:
                manifest_entries.append(
                    {
                        "slot_id": slot_id,
                        "status": "skipped_not_selected",
                        "source": "skipped",
                        "prompt_hash": prompt_hash,
                        "page_path": slot.get("page_path"),
                        "selected": True,
                        "note": "locked",
                    }
                )
            continue

        if exists_and_valid and not args.regen_selected and not args.force:
            manifest_entries.append(
                {
                    "slot_id": slot_id,
                    "status": "success",
                    "source": "existing_valid",
                    "prompt_hash": prompt_hash,
                    "page_path": slot.get("page_path"),
                    "selected": True,
                }
            )
            continue

        if existing_meta and existing_meta.get("prompt_hash") != prompt_hash and not args.regen_selected and not args.force:
            manifest_entries.append(
                {
                    "slot_id": slot_id,
                    "status": "stale",
                    "source": "existing_invalid",
                    "prompt_hash": prompt_hash,
                    "page_path": slot.get("page_path"),
                    "selected": True,
                }
            )
            continue

        if args.dry_run:
            manifest_entries.append(
                {
                    "slot_id": slot_id,
                    "status": "skipped_not_selected",
                    "source": "dry_run",
                    "prompt_hash": prompt_hash,
                    "page_path": slot.get("page_path"),
                    "selected": True,
                }
            )
            continue

        os.makedirs(slot_dir, exist_ok=True)
        size = size_for_prompt(slot, args.model)
        # Remove size validation since we now handle it per-model in size_for_prompt
        try:
            image_bytes = generate_image(slot["_prompt"], args.model, size, quality)
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            meta_out = {
                "slot_id": slot_id,
                "prompt_hash": prompt_hash,
                "prompt": slot["_prompt"],
                "model": args.model,
                "size": size,
                "quality": quality,
                "generated_at": utc_now(),
            }
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(meta_out, f, indent=2, sort_keys=True)
            manifest_entries.append(
                {
                    "slot_id": slot_id,
                    "status": "success",
                    "source": "generated_now",
                    "prompt_hash": prompt_hash,
                    "page_path": slot.get("page_path"),
                    "selected": True,
                }
            )
        except (RuntimeError, urllib.error.HTTPError, urllib.error.URLError) as exc:
            manifest_entries.append(
                {
                    "slot_id": slot_id,
                    "status": "failed",
                    "source": "error",
                    "prompt_hash": prompt_hash,
                    "page_path": slot.get("page_path"),
                    "selected": True,
                    "error": str(exc),
                }
            )

    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    manifest = {
        "generated_at": utc_now(),
        "selected_slots": len(selected),
        "entries": manifest_entries,
    }
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, sort_keys=True)

    print(f"Top {len(selected)} selected")
    print(f"Manifest written: {MANIFEST_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
