from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

from lib.io_utils import load_yaml, read_json, write_csv, write_json
from lib.prompt_engine import hash_prompt
from lib.openai_images import generate_image
from lib.image_postprocess import map_size, process_image

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
SLOTS_DIR = BASE_DIR / "image-pipeline" / "prompts" / "slots"
INDEX_JSON = BASE_DIR / "image-pipeline" / "prompts" / "index.json"
INDEX_CSV = BASE_DIR / "image-pipeline" / "prompts" / "index.csv"
GENERATED_DIR = BASE_DIR / "image-pipeline" / "generated"
MANIFEST_PATH = GENERATED_DIR / "manifest.json"
LOCKED_PATH = BASE_DIR / "image-pipeline" / "ledger" / "locked_slots.json"
LOGS_PATH = GENERATED_DIR / "logs.jsonl"


def _normalize(text: str) -> str:
    return " ".join(text.split())


def _anchor_selector(tag: str, text: str) -> str:
    safe_text = text.replace('"', "\\\"")
    return f"{tag}:contains(\\\"{safe_text}\\\")"


def _slot_id(page_path: str, anchor_selector: str, anchor_index: int, insertion_mode: str, slot_key: str) -> str:
    base = "|".join([_normalize(page_path), _normalize(anchor_selector), str(anchor_index), insertion_mode, slot_key])
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:12]


def _base_meta(page_path: str, usage: str, slot_key: str, anchor_tag: str, anchor_text: str, anchor_index: int) -> Dict[str, Any]:
    anchor_selector = _anchor_selector(anchor_tag, anchor_text)
    insertion_mode = "hero-container" if usage == "hero" else "after-heading"
    slot_id = _slot_id(page_path, anchor_selector, anchor_index, insertion_mode, slot_key)
    return {
        "slot_id": slot_id,
        "page_path": page_path,
        "usage": usage,
        "slot_key": slot_key,
        "anchor_text": anchor_text,
        "anchor_selector": anchor_selector,
        "anchor_index": anchor_index,
        "insertion_mode": insertion_mode,
        "priority_level": "CRITICAL" if usage == "hero" else "IMPORTANT",
        "risk_score": 0,
        "risk_factors": [],
        "ad_proximity_risk": "low",
    }


def build_slots() -> List[Dict[str, Any]]:
    slots: List[Dict[str, Any]] = []

    article1 = "src/content/blog/how-long-do-smoke-detectors-last.md"
    h1_a1 = "How Long Do Smoke Detectors Last? 7-Year vs 10-Year Alarms Explained"
    slots.append({
        **_base_meta(article1, "hero", "hero-1", "h1", h1_a1, 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Smoke alarm mounted in a calm hallway, representing device lifespan.",
        "super_prompt": "Photorealistic editorial image of a clean, quiet residential hallway with a ceiling-mounted smoke alarm in focus, soft morning light, neutral gray-green palette, shallow depth of field, no logos, no readable text, realistic materials, 2026 editorial safety style.",
    })
    slots.append({
        **_base_meta(article1, "inline", "inline-1", "h2", "7-year vs 10-year models: what is actually different", 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Visual comparison of 7-year and 10-year smoke alarm lifespan categories.",
        "super_prompt": "Vector-style instructional diagram comparing two generic smoke alarms representing 7-year and 10-year lifespans, simple circular timeline arcs, no text, no numerals, muted gray-green palette, clean flat shapes, brand-agnostic.",
    })
    slots.append({
        **_base_meta(article1, "inline", "inline-2", "h2", "How to find the manufacture date on your alarm", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "Back of a smoke alarm showing where a date label is typically found.",
        "super_prompt": "Photorealistic close-up of the back of a generic smoke alarm, label area subtly outlined with a thin, translucent highlight (no text), neutral indoor lighting, no logos.",
    })
    slots.append({
        **_base_meta(article1, "inline", "inline-3", "h2", "End-of-life signals vs low-battery chirps", 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Timing comparison of low-battery chirps versus end-of-life beep patterns.",
        "super_prompt": "Minimal infographic timing comparison using dots and lines to show two beep patterns (single periodic vs clustered pattern), no readable text, soft neutral palette, clean grid alignment.",
    })
    slots.append({
        **_base_meta(article1, "inline", "inline-4", "h2", "Safe, simple replacement checklist", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "Hands replacing a ceiling-mounted smoke alarm safely.",
        "super_prompt": "Instructional illustration of anatomically correct hands twisting a ceiling-mounted smoke alarm off its bracket and replacing it, numbered callout circles without text, neutral indoor ceiling, brand-agnostic.",
    })

    article2 = "src/content/blog/when-to-replace-a-carbon-monoxide-detector.md"
    h1_a2 = "When to Replace a Carbon Monoxide Detector (Signs, Age Limits, and Safety Rules)"
    slots.append({
        **_base_meta(article2, "hero", "hero-1", "h1", h1_a2, 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Carbon monoxide detector on a hallway wall in soft daylight.",
        "super_prompt": "Photorealistic editorial image of a wall-mounted carbon monoxide detector in a tidy hallway, soft daylight, neutral gray-green palette, shallow depth of field, no logos, no readable text.",
    })
    slots.append({
        **_base_meta(article2, "inline", "inline-1", "h2", "How to check your detector age", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "CO detector backplate showing where the date label is typically located.",
        "super_prompt": "Photorealistic close-up of the back of a generic CO detector with a subtle translucent highlight around the label area (no text), neutral indoor lighting, brand-agnostic.",
    })
    slots.append({
        **_base_meta(article2, "inline", "inline-2", "h2", "Common warning signs that replacement is due", 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Visual summary of common CO detector replacement signs.",
        "super_prompt": "Minimal illustration of a CO detector with three abstract warning cues (age ring, chirp wave, small status light), icon-only shapes, no text, muted palette.",
    })
    slots.append({
        **_base_meta(article2, "inline", "inline-3", "h2", "Differences between plug-in, battery, and combo units", 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Comparison of plug-in, battery-only, and combo CO detector types.",
        "super_prompt": "Side-by-side illustration of three generic CO detector types: plug-in, battery-only, and combo smoke/CO, clean background, no logos, no readable text, consistent scale.",
    })
    slots.append({
        **_base_meta(article2, "inline", "inline-4", "h2", "Replacement steps that reduce false alarms", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "Hands replacing a CO detector on a wall.",
        "super_prompt": "Instructional illustration of anatomically correct hands removing a wall-mounted CO detector and installing a new one, numbered callout circles without text, neutral indoor wall.",
    })

    article3 = "src/content/blog/smoke-alarm-end-of-life-beeps.md"
    h1_a3 = "Smoke Alarm End-of-Life Beeps: What They Sound Like and What to Do Next"
    slots.append({
        **_base_meta(article3, "hero", "hero-1", "h1", h1_a3, 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Smoke alarm on a ceiling in soft, calm light.",
        "super_prompt": "Photorealistic editorial image of a ceiling-mounted smoke alarm with soft side lighting and shallow depth of field, neutral gray-green palette, no logos, no readable text, calm safety tone.",
    })
    slots.append({
        **_base_meta(article3, "inline", "inline-1", "h2", "What end-of-life beeps usually sound like", 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Abstract timing pattern representing an end-of-life beep sequence.",
        "super_prompt": "Minimal infographic timing graphic using dots and lines to show a clustered beep pattern, no text, muted neutral palette, clean spacing.",
    })
    slots.append({
        **_base_meta(article3, "inline", "inline-2", "h2", "How to check the manufacture date quickly", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "Back of a smoke alarm showing where the date label is typically located.",
        "super_prompt": "Photorealistic close-up of a generic smoke alarm back plate with a faint translucent outline around the date label area (no text), neutral indoor lighting, brand-agnostic.",
    })
    slots.append({
        **_base_meta(article3, "inline", "inline-3", "h2", "How end-of-life beeps differ from low-battery chirps", 1),
        "recommended_size": "1600x900",
        "aspect_ratio": "16:9",
        "alt_text": "Visual comparison of low-battery chirps versus end-of-life beep timing.",
        "super_prompt": "Minimal comparison graphic with two abstract beep timelines (single periodic vs clustered pattern), no text, soft neutral palette, aligned grid.",
    })
    slots.append({
        **_base_meta(article3, "inline", "inline-4", "h2", "Quick verification checklist", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "Visual checklist for confirming end-of-life beeps.",
        "super_prompt": "Instructional illustration of a smoke alarm with three numbered callout circles indicating check steps, no text, clean indoor ceiling background.",
    })
    slots.append({
        **_base_meta(article3, "inline", "inline-5", "h2", "What to do next: replacement-first steps", 1),
        "recommended_size": "1200x900",
        "aspect_ratio": "4:3",
        "alt_text": "Hands replacing a smoke alarm on a ceiling.",
        "super_prompt": "Photorealistic image of anatomically correct hands removing an old smoke alarm and installing a new one, neutral indoor ceiling, no logos, no readable text.",
    })

    for slot in slots:
        slot["prompt_hash"] = hash_prompt(slot["super_prompt"])

    return slots


def update_index(slots: List[Dict[str, Any]]) -> None:
    existing = read_json(INDEX_JSON, default=[])
    by_id = {s.get("slot_id"): s for s in existing}
    for slot in slots:
        by_id[slot["slot_id"]] = slot
    updated = list(by_id.values())
    write_json(INDEX_JSON, updated)

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
    write_csv(INDEX_CSV, updated, fieldnames)


def write_slot_meta(slots: List[Dict[str, Any]]) -> None:
    for slot in slots:
        slot_dir = SLOTS_DIR / slot["slot_id"]
        write_json(slot_dir / "meta.json", slot)


def generate_images(slots: List[Dict[str, Any]], config: Dict[str, Any], force: bool) -> List[Dict[str, Any]]:
    model = os.environ.get("OPENAI_IMAGE_MODEL") or config.get("models", {}).get("default_model", "gpt-image-1")
    quality = os.environ.get("OPENAI_IMAGE_QUALITY") or config.get("models", {}).get("default_quality", "medium")

    locked = set(read_json(LOCKED_PATH, default=[]))
    manifest_entries: List[Dict[str, Any]] = []

    for slot in slots:
        slot_id = slot["slot_id"]
        if slot_id in locked and not force:
            manifest_entries.append({"slot_id": slot_id, "status": "skipped_locked"})
            continue

        output_dir = GENERATED_DIR / "images" / "slots" / slot_id
        generated_meta_path = output_dir / "meta.generated.json"
        existing_meta = read_json(generated_meta_path, default={})
        if existing_meta.get("prompt_hash") == slot.get("prompt_hash") and not force:
            manifest_entries.append({"slot_id": slot_id, "status": "existing_valid"})
            continue

        requested_size = slot.get("recommended_size", "1536x1024")
        generation_size = map_size(requested_size)
        image_bytes = generate_image(slot["super_prompt"], model, generation_size, quality, slot["prompt_hash"], LOGS_PATH)

        site_slug = Path(config.get("site", {}).get("base_dir", ".")).resolve().name
        page_slug = Path(slot.get("page_path", "")).stem
        paths = process_image(image_bytes, output_dir, requested_size, site_slug, page_slug, slot.get("slot_key", "slot"), slot_id)

        generated_meta = {
            "slot_id": slot_id,
            "prompt_hash": slot.get("prompt_hash"),
            "model": model,
            "quality": quality,
            "size": generation_size,
            "requested_size": requested_size,
            "files": paths,
        }
        write_json(generated_meta_path, generated_meta)
        manifest_entries.append({"slot_id": slot_id, "status": "success", "prompt_hash": slot.get("prompt_hash")})

    manifest = {"generated_at": dt.datetime.utcnow().isoformat() + "Z", "entries": manifest_entries}
    write_json(MANIFEST_PATH, manifest)
    return manifest_entries


def run_plan(limit: int) -> None:
    script_path = Path(__file__).resolve().parents[0] / "04_place_images.py"
    subprocess.run([sys.executable, str(script_path), "--limit", str(limit)], check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--generate", action="store_true")
    parser.add_argument("--plan", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    load_dotenv(BASE_DIR / ".env")

    config = load_yaml(CONFIG_PATH)
    slots = build_slots()
    write_slot_meta(slots)
    update_index(slots)

    if args.generate:
        generate_images(slots, config, args.force)

    if args.plan:
        run_plan(len(slots))

    print(f"Slots prepared: {len(slots)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
