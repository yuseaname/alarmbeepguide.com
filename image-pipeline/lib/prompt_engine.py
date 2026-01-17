from __future__ import annotations

import hashlib
from typing import Any, Dict, Tuple

from .io_utils import normalize_space


def hash_prompt(prompt: str) -> str:
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()


def _domain_constraints(text: str, config: Dict[str, Any]) -> Dict[str, Any]:
    constraints = config.get("constraints", {})
    keywords = [k.lower() for k in constraints.get("alarm_domain_keywords", [])]
    if not keywords:
        return {}
    lower = text.lower()
    if not any(k in lower for k in keywords):
        return {}
    return constraints.get("alarm_domain_rules", {})


def build_prompt(meta: Dict[str, Any], config: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    anchor = normalize_space(meta.get("anchor_text", ""))
    purpose = normalize_space(meta.get("purpose", ""))
    context = normalize_space(meta.get("source_context", ""))
    usage = meta.get("usage", "inline")

    topic = anchor or purpose or "this topic"
    usage_label = "hero" if usage == "hero" else "inline"

    constraints = meta.get("constraints") or {}
    auto_constraints = _domain_constraints(f"{anchor} {purpose} {context}", config)
    if auto_constraints and not constraints:
        constraints = auto_constraints

    prompt_lines = [
        f"Photorealistic {usage_label} image representing the real-world meaning of the topic: {topic}.",
        "",
        "First, interpret what this topic implies to a general audience in everyday life (e.g., confusion, problem-solving, reassurance, discovery, resolution). Then visually represent that meaning through a realistic moment or situation.",
        "",
        "The scene must depict a believable, real-life scenario where the topic would naturally apply, not a staged setup or symbolic arrangement of objects.",
        "",
        "Show a single, specific moment in time that a human would immediately recognize as related to the topic, such as a pause during problem-solving, a moment of inspection or realization, a before-or-after state, or subtle signs that an issue is being addressed.",
        "",
        "Avoid generic desk setups, flat-lay compositions, or repeated object arrangements.",
        "",
        "Camera:",
        "Full-frame camera, 35mm lens. Natural perspective, slight imperfections allowed. Human eye-level or contextual angle (not overhead).",
        "",
        "Lighting:",
        "Natural or practical indoor lighting. Time-of-day cues allowed. No dramatic, cinematic, or studio lighting.",
        "",
        "Strict constraints:",
        "- No visible text.",
        "- No UI elements or readable screens.",
        "- No diagrams, icons, or symbols.",
        "- No branding, logos, or overlays.",
        "- No symmetry-heavy or stock-photo compositions.",
        "",
        "Style:",
        "Strict photorealism. No CGI, no illustration, no surreal elements.",
        "",
        "The image should feel like a real photograph taken during an authentic moment related to the topic, clearly understandable without explanation.",
    ]

    if config.get("brand", {}).get("unique_composition_guardrail", False):
        prompt_lines.append("")
        prompt_lines.append(
            "Do not reuse visual compositions, object groupings, or scene layouts from previous images. Each image must feel like a different household and a different moment."
        )

    if constraints:
        reality = constraints.get("reality_constraints", [])
        not_allowed = constraints.get("not_allowed", [])
        if reality:
            prompt_lines.append("")
            prompt_lines.append("Reality constraints (must be true):")
            for rule in reality:
                prompt_lines.append(f"- {normalize_space(rule)}")
        if not_allowed:
            prompt_lines.append("")
            prompt_lines.append("Not allowed:")
            for rule in not_allowed:
                prompt_lines.append(f"- {normalize_space(rule)}")

    notes = normalize_space(config.get("brand", {}).get("notes", ""))
    if notes:
        prompt_lines.append("")
        prompt_lines.append(notes)

    prompt = "\n".join(prompt_lines)
    return prompt, constraints
