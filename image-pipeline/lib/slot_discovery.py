from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

from bs4 import BeautifulSoup

from .io_utils import normalize_space, read_text, slugify


@dataclass
class Heading:
    tag: str
    text: str


def detect_site_types(files: Iterable[Path]) -> List[str]:
    types = set()
    for path in files:
        suffix = path.suffix.lower()
        if suffix in (".html", ".htm"):
            types.add("html")
        elif suffix in (".md", ".mdx"):
            types.add("markdown")
        elif suffix in (".jsx", ".tsx"):
            types.add("jsx")
    return sorted(types)


def list_content_files(base_dir: Path, roots: List[str], exclude_dirs: List[str]) -> List[Path]:
    exclude = {base_dir / d for d in exclude_dirs}
    files: List[Path] = []
    for root in roots:
        root_path = (base_dir / root).resolve()
        if root_path.is_file():
            files.append(root_path)
            continue
        if not root_path.exists():
            continue
        for path in root_path.rglob("*"):
            if path.is_dir():
                if any(part in exclude for part in path.parents):
                    continue
                continue
            if any(part in exclude for part in path.parents):
                continue
            if path.suffix.lower() in (".html", ".htm", ".md", ".mdx", ".jsx", ".tsx"):
                files.append(path)
    return sorted(set(files))


def _extract_headings_markdown(content: str) -> Tuple[str, List[Heading]]:
    h1 = ""
    headings: List[Heading] = []
    for line in content.splitlines():
        if line.startswith("# ") and not h1:
            h1 = normalize_space(line.replace("#", "", 1))
        if line.startswith("## "):
            headings.append(Heading(tag="h2", text=normalize_space(line.lstrip("#"))))
        if line.startswith("### "):
            headings.append(Heading(tag="h3", text=normalize_space(line.lstrip("#"))))
    return h1, headings


def _extract_headings_html(content: str) -> Tuple[str, List[Heading]]:
    soup = BeautifulSoup(content, "html.parser")
    h1_tag = soup.find("h1")
    h1_text = normalize_space(h1_tag.get_text(" ")) if h1_tag else ""
    headings = []
    for tag in soup.find_all(["h2", "h3"]):
        text = normalize_space(tag.get_text(" "))
        if text:
            headings.append(Heading(tag=tag.name.lower(), text=text))
    return h1_text, headings


def _extract_headings_jsx(content: str) -> Tuple[str, List[Heading]]:
    h1_match = re.search(r"<h1[^>]*>([^<]+)</h1>", content, flags=re.IGNORECASE)
    h1_text = normalize_space(h1_match.group(1)) if h1_match else ""
    headings: List[Heading] = []
    for match in re.finditer(r"<(h[23])[^>]*>([^<]+)</h[23]>", content, flags=re.IGNORECASE):
        tag = match.group(1).lower()
        text = normalize_space(match.group(2))
        if text and "{" not in text and "}" not in text:
            headings.append(Heading(tag=tag, text=text))
    return h1_text, headings


def extract_headings(content: str, content_type: str) -> Tuple[str, List[Heading]]:
    if content_type == "markdown":
        return _extract_headings_markdown(content)
    if content_type in ("html", "htm"):
        return _extract_headings_html(content)
    return _extract_headings_jsx(content)


def clean_text_for_words(content: str, content_type: str) -> str:
    if content_type == "markdown":
        text = re.sub(r"```.*?```", " ", content, flags=re.DOTALL)
        text = re.sub(r"`[^`]+`", " ", text)
        text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", " ", text)
        text = re.sub(r"\[[^\]]+\]\([^\)]+\)", " ", text)
        return normalize_space(text)
    if content_type in ("html", "htm"):
        soup = BeautifulSoup(content, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        return normalize_space(soup.get_text(" "))
    text = re.sub(r"<[^>]+>", " ", content)
    return normalize_space(text)


def word_count(text: str) -> int:
    return len([w for w in text.split() if w.strip()])


def count_images(content: str, content_type: str) -> int:
    if content_type == "markdown":
        return len(re.findall(r"!\[[^\]]*\]\([^\)]+\)", content))
    return len(re.findall(r"<img\b", content, flags=re.IGNORECASE))


def _risk_profile(words: int, image_count: int) -> Tuple[float, List[str]]:
    score = 0.0
    factors: List[str] = []
    if words < 250:
        score += 3
        factors.append("thin_content")
    elif words < 450:
        score += 2
        factors.append("light_content")
    if image_count >= 6:
        score += 2
        factors.append("image_heavy")
    elif image_count >= 3:
        score += 1
        factors.append("some_images")
    return score, factors


def _anchor_selector(tag: str, text: str) -> str:
    safe_text = text.replace('"', "\\\"")
    return f"{tag}:contains(\\\"{safe_text}\\\")"


def _slot_id(page_path: str, anchor_selector: str, anchor_index: int, insertion_mode: str, slot_key: str) -> str:
    base = "|".join(
        [normalize_space(page_path), normalize_space(anchor_selector), str(anchor_index), insertion_mode, slot_key]
    )
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:12]


def discover_slots_for_file(path: Path, base_dir: Path, config: Dict[str, Any]) -> List[Dict[str, Any]]:
    content = read_text(path)
    content_type = path.suffix.lower().lstrip(".")
    if content_type in ("html", "htm"):
        type_name = "html"
    elif content_type in ("md", "mdx"):
        type_name = "markdown"
    else:
        type_name = "jsx"

    h1, headings = extract_headings(content, type_name)
    clean_text = clean_text_for_words(content, type_name)
    words = word_count(clean_text)
    images = count_images(content, type_name)
    risk_score, risk_factors = _risk_profile(words, images)

    max_inline = max(1, int(config.get("images", {}).get("max_inline_images_per_1200_words", 2)))
    inline_limit = max(1, int((words / 1200.0) * max_inline))

    page_rel = str(path.resolve().relative_to(base_dir.resolve()))
    slots: List[Dict[str, Any]] = []

    if h1:
        anchor_selector = _anchor_selector("h1", h1)
        slot_key = "hero-1"
        slot_id = _slot_id(page_rel, anchor_selector, 1, "hero-container", slot_key)
        slots.append(
            {
                "slot_id": slot_id,
                "page_path": page_rel,
                "usage": "hero",
                "slot_key": slot_key,
                "anchor_text": h1,
                "anchor_selector": anchor_selector,
                "anchor_index": 1,
                "insertion_mode": "hero-container",
                "priority_level": "CRITICAL",
                "recommended_size": "1600x900",
                "aspect_ratio": "16:9",
                "alt_text": f"Photo illustrating {h1}",
                "risk_score": risk_score,
                "risk_factors": risk_factors,
                "ad_proximity_risk": "medium" if "adsbygoogle" in content else "low",
            }
        )

    seen_counts: Dict[str, int] = {}
    for heading in headings[:inline_limit]:
        key = f"{heading.tag}:{heading.text}"
        seen_counts[key] = seen_counts.get(key, 0) + 1
        anchor_index = seen_counts[key]
        anchor_selector = _anchor_selector(heading.tag, heading.text)
        slot_key = f"inline-{len(slots)}"
        slot_id = _slot_id(page_rel, anchor_selector, anchor_index, "after-heading", slot_key)
        slots.append(
            {
                "slot_id": slot_id,
                "page_path": page_rel,
                "usage": "inline",
                "slot_key": slot_key,
                "anchor_text": heading.text,
                "anchor_selector": anchor_selector,
                "anchor_index": anchor_index,
                "insertion_mode": "after-heading",
                "priority_level": "IMPORTANT",
                "recommended_size": "1200x800",
                "aspect_ratio": "4:3",
                "alt_text": f"Photo illustrating {heading.text}",
                "risk_score": risk_score,
                "risk_factors": risk_factors,
                "ad_proximity_risk": "medium" if "adsbygoogle" in content else "low",
            }
        )

    return slots


def build_repo_profile(files: List[Path], config: Dict[str, Any]) -> str:
    site_types = detect_site_types(files)
    content_roots = config.get("site", {}).get("content_roots", [])
    build_dirs = config.get("site", {}).get("build_dirs", [])
    total = len(files)

    lines = [
        "# Repo Profile",
        "",
        f"Detected site types: {', '.join(site_types) if site_types else 'none'}",
        f"Files scanned: {total}",
        "",
        "Content roots:",
    ]
    for root in content_roots:
        lines.append(f"- {root}")
    lines.append("")
    lines.append("Build directories:")
    for build in build_dirs:
        lines.append(f"- {build}")
    return "\n".join(lines) + "\n"
