import os
import sys
from typing import Dict

from _pipeline_utils import load_config, normalize_text, utc_now

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_PATH = os.path.join(BASE_DIR, "image-pipeline", "config.yaml")
SLOTS_DIR = os.path.join(BASE_DIR, "image-prompts", "slots")
INDEX_JSON = os.path.join(BASE_DIR, "image-prompts", "index.json")


def build_super_prompt(meta: Dict, brand: Dict) -> Dict[str, str]:
    notes = brand.get("notes", "")
    guardrail = bool(brand.get("unique_composition_guardrail", False))

    anchor = normalize_text(meta.get("anchor_text", ""))
    purpose = normalize_text(meta.get("purpose", ""))
    context = normalize_text(meta.get("source_context", ""))
    usage = meta.get("usage", "hero")
    aspect_ratio = meta.get("aspect_ratio", "")
    size = meta.get("recommended_size", "")

    topic = anchor or purpose or "this topic"
    usage_label = "hero" if usage == "hero" else "inline"

    text_for_constraints = f"{anchor} {purpose} {context}".lower()
    constraints = meta.get("constraints") or {}
    auto_constraints = {}
    if any(
        term in text_for_constraints
        for term in [
            "smoke alarm",
            "smoke detector",
            "co detector",
            "carbon monoxide",
            "fire alarm",
            "alarm",
            "beep",
            "beeping",
            "chirp",
            "detector",
            "troubleshooting",
            "guides",
            "resources",
        ]
    ):
        auto_constraints = {
            "reality_constraints": [
                "Smoke/CO alarms are ceiling- or wall-mounted only.",
                "Do not place alarms on ovens, stoves, countertops, or appliances.",
                "Alarms appear as real, round or square white plastic devices with a test button.",
                "If a kitchen is visible, the alarm is mounted on a ceiling or high wall.",
            ],
            "not_allowed": [
                "Alarm mounted on an oven door, stovetop, countertop, or cabinet.",
                "Alarm used as a handheld device or tool.",
                "Ad-like or button-like imagery.",
            ],
        }
    if auto_constraints and not constraints:
        constraints = auto_constraints

    prompt_lines = [
        f"Photorealistic {usage_label} image representing the real-world meaning of the topic: {topic}.",
        "",
        "First, interpret what this topic implies to a general audience in everyday life "
        "(e.g., confusion, problem-solving, reassurance, discovery, resolution). "
        "Then visually represent that meaning through a realistic moment or situation.",
        "",
        "The scene must depict a believable, real-life scenario where the topic would naturally apply, "
        "not a staged setup or symbolic arrangement of objects.",
        "",
        "Show a single, specific moment in time that a human would immediately recognize as related to the topic, "
        "such as a pause during problem-solving, a moment of inspection or realization, "
        "a before-or-after state, or subtle signs that an issue is being addressed.",
        "",
        "Avoid generic desk setups, flat-lay compositions, or repeated object arrangements.",
        "",
        "People (if shown):",
        "Represent typical United States demographics.",
        "70% male, 30% female distribution.",
        "Show diverse American backgrounds reflecting the US population.",
        "",
        "Camera:",
        "Full-frame camera, 35mm lens.",
        "Natural perspective, slight imperfections allowed.",
        "Human eye-level or contextual angle (not overhead).",
        "",
        "Lighting:",
        "Natural or practical indoor lighting.",
        "Time-of-day cues allowed.",
        "No dramatic, cinematic, or studio lighting.",
        "",
        "Strict constraints:",
        "- No visible text.",
        "- No UI elements or readable screens.",
        "- No diagrams, icons, or symbols.",
        "- No branding, logos, or overlays.",
        "- No symmetry-heavy or stock-photo compositions.",
        "",
        "Style:",
        "Strict photorealism.",
        "No CGI, no illustration, no surreal elements.",
        "",
        "The image should feel like a real photograph taken during an authentic moment related to the topic, "
        "clearly understandable without explanation.",
    ]

    if constraints:
        reality_rules = constraints.get("reality_constraints", [])
        not_allowed = constraints.get("not_allowed", [])
        if reality_rules:
            prompt_lines.append("")
            prompt_lines.append("Reality constraints (must be true):")
            for rule in reality_rules:
                prompt_lines.append(f"- {normalize_text(rule)}")
        if not_allowed:
            prompt_lines.append("")
            prompt_lines.append("Not allowed:")
            for rule in not_allowed:
                prompt_lines.append(f"- {normalize_text(rule)}")

    if guardrail:
        prompt_lines.append("")
        prompt_lines.append(
            "Do not reuse visual compositions, object groupings, or scene layouts from previous images. "
            "Each image must feel like a different household and a different moment."
        )

    if notes:
        prompt_lines.append("")
        prompt_lines.append(normalize_text(notes))

    super_prompt = "\n".join(prompt_lines)

    technical_constraints = normalize_text(
        f"Aspect ratio {aspect_ratio}. Target size {size}."
    )

    return {
        "super_prompt": super_prompt,
        "technical_constraints": technical_constraints,
        "realism_profile": "strict_photoreal",
        "constraints": constraints,
    }


def main() -> int:
    force = "--force" in sys.argv
    config = load_config(CONFIG_PATH)
    brand = config.get("brand", {})

    if not os.path.exists(SLOTS_DIR):
        print("No slots directory found. Run 01_discover_slots.py first.")
        return 1

    updated = 0
    if os.path.exists(INDEX_JSON):
        with open(INDEX_JSON, "r", encoding="utf-8") as f:
            index = __import__("json").load(f)
        slot_ids = [item.get("slot_id") for item in index if item.get("slot_id")]
    else:
        slot_ids = os.listdir(SLOTS_DIR)

    for slot_id in slot_ids:
        meta_path = os.path.join(SLOTS_DIR, slot_id, "meta.json")
        if not os.path.exists(meta_path):
            continue
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = __import__("json").load(f)
        if meta.get("super_prompt") and not force:
            continue
        updates = build_super_prompt(meta, brand)
        meta.update(updates)
        meta["refined_at"] = utc_now()
        with open(meta_path, "w", encoding="utf-8") as f:
            __import__("json").dump(meta, f, indent=2, sort_keys=True)
        updated += 1

    print(f"Super prompts updated: {updated}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
