import json
import os
import re
import sys
from typing import Any, Dict, List, Tuple

from _pipeline_utils import (
    ad_marker_present,
    compute_max_inline,
    detect_site_types,
    list_content_files,
    load_config,
    normalize_text,
    recommended_size_for_usage,
    safe_relpath,
    sha1_short,
    utc_now,
    word_count,
    write_csv,
    write_json,
)

try:
    from bs4 import BeautifulSoup
except ImportError:  # pragma: no cover - runtime dependency
    BeautifulSoup = None


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_PATH = os.path.join(BASE_DIR, "image-pipeline", "config.yaml")
SLOTS_DIR = os.path.join(BASE_DIR, "image-prompts", "slots")
INDEX_JSON = os.path.join(BASE_DIR, "image-prompts", "index.json")
INDEX_CSV = os.path.join(BASE_DIR, "image-prompts", "index.csv")
REPO_PROFILE = os.path.join(BASE_DIR, "image-pipeline", "REPO_PROFILE.md")


def _read_file(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _extract_headings_html(content: str) -> Tuple[str, List[Dict[str, str]]]:
    if BeautifulSoup is None:
        raise RuntimeError("beautifulsoup4 is required. Install with: pip install beautifulsoup4")
    soup = BeautifulSoup(content, "html.parser")
    h1 = soup.find("h1")
    h1_text = normalize_text(h1.get_text(" ")) if h1 else ""
    headings: List[Dict[str, str]] = []
    for tag in soup.find_all(["h2", "h3"]):
        text = normalize_text(tag.get_text(" "))
        if text:
            headings.append({"text": text, "tag": tag.name.lower()})
    return h1_text, headings


def _extract_headings_markdown(content: str) -> Tuple[str, List[Dict[str, str]]]:
    h1 = ""
    headings: List[Dict[str, str]] = []
    for line in content.splitlines():
        if line.startswith("# ") and not h1:
            h1 = normalize_text(line.replace("#", "", 1))
        if line.startswith("## ") or line.startswith("### "):
            tag = "h2" if line.startswith("## ") and not line.startswith("### ") else "h3"
            headings.append({"text": normalize_text(line.lstrip("#")), "tag": tag})
    return h1, headings


def _extract_headings_jsx(content: str) -> Tuple[str, List[Dict[str, str]]]:
    h1_match = re.search(r"<h1[^>]*>([^<]+)</h1>", content, flags=re.IGNORECASE)
    h1 = normalize_text(h1_match.group(1)) if h1_match else ""
    headings: List[Dict[str, str]] = []
    for match in re.finditer(r"<(h[23])[^>]*>([^<]+)</h[23]>", content, flags=re.IGNORECASE):
        tag = match.group(1).lower()
        text = normalize_text(match.group(2))
        if text and "{" not in text and "}" not in text:
            headings.append({"text": text, "tag": tag})
    return h1, headings


def _anchor_selector(tag: str, text: str) -> str:
    safe_text = text.replace("\"", "\\\"")
    return f"{tag}:contains(\\\"{safe_text}\\\")"


def _matches_exclude(text: str, patterns: List[str]) -> bool:
    if not text:
        return False
    lower = text.lower()
    for pattern in patterns:
        if pattern and pattern.lower() in lower:
            return True
    return False


def _extract_h1_candidates(content: str, content_type: str) -> List[str]:
    candidates: List[str] = []
    if content_type == "html":
        if BeautifulSoup is None:
            return candidates
        soup = BeautifulSoup(content, "html.parser")
        for tag in soup.find_all("h1"):
            text = normalize_text(tag.get_text(" "))
            if text:
                candidates.append(text)
        return candidates
    if content_type == "markdown":
        for line in content.splitlines():
            if line.startswith("# ") and not line.startswith("## "):
                text = normalize_text(line.replace("#", "", 1))
                if text:
                    candidates.append(text)
        return candidates
    for match in re.finditer(r"<h1[^>]*>([^<]+)</h1>", content, flags=re.IGNORECASE):
        text = normalize_text(match.group(1))
        if text and "{" not in text and "}" not in text:
            candidates.append(text)
    return candidates


def _page_risk_profile(content: str, clean_text: str, content_type: str) -> Tuple[float, List[str], int, int]:
    risk_score = 0.0
    risk_factors: List[str] = []
    words = word_count(clean_text)
    image_count = 0

    if content_type == "html":
        image_count = len(re.findall(r"<img\\b", content, flags=re.IGNORECASE))
    elif content_type == "markdown":
        image_count = len(re.findall(r"!\[[^\]]*\]\([^\)]+\)", content))
    else:
        image_count = len(re.findall(r"<img\\b", content, flags=re.IGNORECASE))

    if words < 250:
        risk_score += 3
        risk_factors.append("thin_content")
    elif words < 450:
        risk_score += 2
        risk_factors.append("light_content")

    if image_count >= 6:
        risk_score += 2
        risk_factors.append("image_heavy")
    elif image_count >= 3:
        risk_score += 1
        risk_factors.append("some_images")

    above_fold = content[:800]
    if re.search(r"<img\\b", above_fold, flags=re.IGNORECASE) or "![" in above_fold:
        risk_score += 1
        risk_factors.append("above_fold_crowding")

    return risk_score, risk_factors, words, image_count


def _clean_text_for_context(content: str, content_type: str) -> str:
    if content_type == "html":
        if BeautifulSoup is None:
            return normalize_text(content)
        soup = BeautifulSoup(content, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        body = soup.body or soup
        return normalize_text(body.get_text(" "))
    if content_type == "markdown":
        text = re.sub(r"```.*?```", " ", content, flags=re.DOTALL)
        text = re.sub(r"`[^`]+`", " ", text)
        text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", " ", text)
        text = re.sub(r"\[[^\]]+\]\([^\)]+\)", " ", text)
        return normalize_text(text)
    text = re.sub(r"<[^>]+>", " ", content)
    text = re.sub(r"{[^}]+}", " ", text)
    text = text.replace("{", " ").replace("}", " ")
    text = text.replace("<", " ").replace(">", " ")
    text = re.sub(r"`[^`]*`", " ", text)
    text = text.replace("`", " ")
    text = re.sub(r":\s*'[^']*'", " ", text)
    text = re.sub(r':\s*"[^"]*"', " ", text)
    text = re.sub(r"\b(import|export|const|let|function|return)\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(set|use)[A-Z][A-Za-z0-9_]+\b", " ", text)
    text = re.sub(r"\(null\)", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bnull\b", " ", text, flags=re.IGNORECASE)
    return normalize_text(text)


def _context_from_heading(content: str, heading: str) -> str:
    if not heading:
        return ""
    lower = content.lower()
    idx = lower.find(heading.lower())
    if idx == -1:
        return ""
    window = content[idx: idx + 800]
    sentences = re.split(r"(?<=[.!?])\s+", normalize_text(window))
    clean_sentences: List[str] = []
    for sentence in sentences:
        if len(sentence.split()) < 4:
            continue
        if re.search(r"[=(){}<>]", sentence):
            continue
        if re.search(r"\bnull\b", sentence, flags=re.IGNORECASE):
            continue
        clean_sentences.append(sentence)
        if len(clean_sentences) >= 2:
            break
    return " ".join(clean_sentences).strip()


def _determine_priority(is_home: bool, is_primary: bool, usage: str) -> str:
    if usage == "hero":
        if is_home:
            return "CRITICAL"
        if is_primary:
            return "IMPORTANT"
        return "IMPORTANT"
    if is_primary:
        return "IMPORTANT"
    return "LATER"


def _detect_primary_pages(paths: List[str]) -> Dict[str, bool]:
    primary: Dict[str, bool] = {}
    for path in paths:
        lower = path.lower()
        if lower.endswith("index.html"):
            primary[path] = True
        elif "homepage" in lower or "/home" in lower:
            primary[path] = True
        elif re.search(r"(pillar|category|blog|guide|article|page)", lower):
            primary[path] = True
        else:
            primary[path] = False
    return primary


def _detect_home_pages(paths: List[str]) -> Dict[str, bool]:
    home: Dict[str, bool] = {}
    for path in paths:
        lower = path.lower()
        if lower.endswith("/index.html") or lower.endswith("index.html"):
            home[path] = True
        elif "homepage" in lower or os.path.basename(lower).startswith("home"):
            home[path] = True
        else:
            home[path] = False
    return home


def _slot_id(page_path: str, slot_key: str, anchor_text: str) -> str:
    base = f"{page_path}|{slot_key}|{anchor_text}"
    return sha1_short(base)


def _build_meta(
    page_path: str,
    slot_key: str,
    usage: str,
    anchor_text: str,
    anchor_selector: str,
    anchor_index: int,
    insertion_mode: str,
    source_context: str,
    purpose: str,
    audience_hint: str,
    priority_level: str,
    ad_proximity_risk: str,
    risk_score: float,
    risk_factors: List[str],
) -> Dict[str, Any]:
    aspect_ratio, recommended_size = recommended_size_for_usage(usage)
    prompt = f"Photoreal {usage} image illustrating: {purpose}.".strip()
    return {
        "slot_id": _slot_id(page_path, slot_key, anchor_text),
        "page_path": page_path,
        "slot_key": slot_key,
        "usage": usage,
        "priority_level": priority_level,
        "anchor_text": anchor_text,
        "anchor_selector": anchor_selector,
        "anchor_index": anchor_index,
        "insertion_mode": insertion_mode,
        "source_context": source_context,
        "purpose": purpose,
        "audience_hint": audience_hint,
        "aspect_ratio": aspect_ratio,
        "recommended_size": recommended_size,
        "alt_text": f"Photo of {anchor_text}" if anchor_text else f"Photo illustrating {purpose}",
        "status": "draft",
        "ad_proximity_risk": ad_proximity_risk,
        "risk_score": risk_score,
        "risk_factors": risk_factors,
        "prompt": prompt,
        "discovered_at": utc_now(),
    }


def _merge_meta(existing: Dict[str, Any], incoming: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(existing)
    always_overwrite = {
        "anchor_text",
        "anchor_selector",
        "anchor_index",
        "insertion_mode",
        "source_context",
        "purpose",
        "priority_level",
        "ad_proximity_risk",
        "risk_score",
        "risk_factors",
        "aspect_ratio",
        "recommended_size",
        "usage",
        "slot_key",
        "page_path",
    }
    for key, value in incoming.items():
        if key in always_overwrite:
            merged[key] = value
        elif key not in merged or merged.get(key) in ("", None):
            merged[key] = value
    merged["updated_at"] = utc_now()
    return merged


def _slot_entries_from_file(
    path: str,
    content: str,
    markers: List[str],
    max_inline_per_1200: int,
    exclude_heading_patterns: List[str],
) -> List[Dict[str, Any]]:
    lower = path.lower()
    if lower.endswith((".html", ".htm")):
        h1, headings = _extract_headings_html(content)
        content_type = "html"
    elif lower.endswith((".md", ".mdx")):
        h1, headings = _extract_headings_markdown(content)
        content_type = "markdown"
    else:
        h1, headings = _extract_headings_jsx(content)
        content_type = "jsx"

    slots: List[Dict[str, Any]] = []
    clean_text = _clean_text_for_context(content, content_type)
    page_word_count = word_count(clean_text)
    max_inline = compute_max_inline(page_word_count, max_inline_per_1200)
    risk_score, risk_factors, _, _ = _page_risk_profile(content, clean_text, content_type)

    if not h1 and not headings:
        if content_type in ("html", "jsx"):
            return []
        if content_type == "markdown" and page_word_count < 200:
            return []

    h1_candidates = _extract_h1_candidates(content, content_type)
    anchor = ""
    anchor_tag = "h1"
    for candidate in h1_candidates:
        if not _matches_exclude(candidate, exclude_heading_patterns):
            anchor = candidate
            anchor_tag = "h1"
            break
    if not anchor:
        for heading in headings:
            text = heading.get("text", "")
            if not _matches_exclude(text, exclude_heading_patterns):
                anchor = text
                anchor_tag = heading.get("tag", "h2")
                break
    if not anchor:
        if content_type in ("html", "markdown"):
            anchor = os.path.splitext(os.path.basename(path))[0]
            anchor_tag = "h1"
        else:
            return []
    hero_context = _context_from_heading(clean_text, anchor)
    hero_purpose = f"Establish the topic: {anchor}" if anchor else "Establish the page topic"
    hero_ad_risk = "med" if ad_marker_present(content, markers) else "low"
    hero_selector = _anchor_selector(anchor_tag, anchor) if anchor else "h1"
    hero_insertion_mode = "hero-container" if anchor_tag == "h1" else "after-heading"

    slots.append(
        {
            "usage": "hero",
            "anchor_text": anchor,
            "anchor_selector": hero_selector,
            "anchor_index": 1,
            "insertion_mode": hero_insertion_mode,
            "source_context": hero_context,
            "purpose": hero_purpose,
            "ad_proximity_risk": hero_ad_risk,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
        }
    )

    heading_counts: Dict[str, int] = {}
    inline_count = 0
    for heading in headings:
        if inline_count >= max_inline:
            break
        text = heading.get("text", "")
        tag = heading.get("tag", "h2")
        if len(text.split()) < 2:
            continue
        key = f"{tag}:{text.lower()}"
        heading_counts[key] = heading_counts.get(key, 0) + 1
        anchor_index = heading_counts[key]
        context = _context_from_heading(clean_text, text)
        purpose = f"Illustrate {text}"
        window = context or text
        risk = "high" if ad_marker_present(window, markers) else ("med" if ad_marker_present(content, markers) else "low")
        slots.append(
            {
                "usage": "inline",
                "anchor_text": text,
                "anchor_selector": _anchor_selector(tag, text),
                "anchor_index": anchor_index,
                "insertion_mode": "after-heading",
                "source_context": context,
                "purpose": purpose,
                "ad_proximity_risk": risk,
                "risk_score": risk_score,
                "risk_factors": risk_factors,
            }
        )
        inline_count += 1

    return slots


def write_repo_profile(config: Dict[str, Any], files: List[str]) -> None:
    base_dir = os.path.abspath(config["site"]["base_dir"])
    site_types = detect_site_types(files)
    build_dirs = config["site"].get("build_dirs", [])
    content_roots = config["site"].get("content_roots", [])
    relative_files = [safe_relpath(path, base_dir) for path in files]
    primary_pages = [p for p in relative_files if re.search(r"(index\.html|homepage|home|blog|guide|pillar|category)", p, re.IGNORECASE)]

    lines = [
        "# Repo Profile",
        "",
        f"Generated at: {utc_now()}",
        "",
        "## Site detection",
        f"- Types: {', '.join(site_types) if site_types else 'unknown'}",
        f"- Content roots: {', '.join(content_roots)}",
        f"- Build dirs (ignored): {', '.join(build_dirs)}",
        "",
        "## Primary page candidates",
    ]
    if primary_pages:
        lines.extend([f"- {p}" for p in primary_pages[:25]])
    else:
        lines.append("- None detected")

    lines.append("")
    lines.append("## Content sample")
    for path in relative_files[:10]:
        lines.append(f"- {path}")

    os.makedirs(os.path.dirname(REPO_PROFILE), exist_ok=True)
    with open(REPO_PROFILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main() -> int:
    config = load_config(CONFIG_PATH)
    exts = (".html", ".htm", ".md", ".mdx", ".tsx", ".jsx")
    files = list_content_files(config, exts)
    if not files:
        print("No content files found in configured roots.")
        return 1

    markers = config.get("adsense", {}).get("ad_markers", [])
    max_inline_per_1200 = int(config.get("images", {}).get("max_inline_images_per_1200_words", 2))
    include_names = config.get("site", {}).get("jsx_include_name_patterns", [])
    include_paths = config.get("site", {}).get("jsx_include_path_patterns", [])
    exclude_paths = config.get("site", {}).get("jsx_exclude_path_patterns", [])
    exclude_page_patterns = config.get("site", {}).get("exclude_page_path_patterns", [])
    exclude_heading_patterns = config.get("site", {}).get("exclude_page_heading_patterns", [])
    base_dir = os.path.abspath(config["site"]["base_dir"])
    is_primary = _detect_primary_pages(files)
    is_home = _detect_home_pages(files)

    slots: List[Dict[str, Any]] = []
    for path in files:
        lower_path = path.lower()
        if exclude_page_patterns and any(p.lower() in lower_path for p in exclude_page_patterns):
            continue
        if lower_path.endswith((".tsx", ".jsx")):
            if exclude_paths and any(p.lower() in lower_path for p in exclude_paths):
                continue
            if include_paths and not any(p.lower() in lower_path for p in include_paths):
                continue
            if include_names:
                base = os.path.basename(path).lower()
                if not any(p.lower() in base for p in include_names):
                    continue
        content = _read_file(path)
        rel_path = safe_relpath(path, base_dir)
        entries = _slot_entries_from_file(
            path,
            content,
            markers,
            max_inline_per_1200,
            exclude_heading_patterns,
        )
        hero_index = 1
        inline_index = 1
        for entry in entries:
            usage = entry["usage"]
            slot_key = f"{usage}-{hero_index if usage == 'hero' else inline_index}"
            if usage == "hero":
                hero_index += 1
            else:
                inline_index += 1
            priority_level = _determine_priority(is_home[path], is_primary[path], usage)
            meta = _build_meta(
                rel_path,
                slot_key,
                usage,
                entry["anchor_text"],
                entry.get("anchor_selector", ""),
                int(entry.get("anchor_index", 1)),
                entry.get("insertion_mode", "after-heading"),
                entry["source_context"],
                entry["purpose"],
                "general audience",
                priority_level,
                entry["ad_proximity_risk"],
                float(entry.get("risk_score", 0)),
                entry.get("risk_factors", []),
            )
            slots.append(meta)

    existing_index = []
    if os.path.exists(INDEX_JSON):
        with open(INDEX_JSON, "r", encoding="utf-8") as f:
            try:
                existing_index = json.load(f)
            except json.JSONDecodeError:
                existing_index = []

    existing_by_id = {item.get("slot_id"): item for item in existing_index if item.get("slot_id")}

    final_slots: List[Dict[str, Any]] = []
    for slot in slots:
        slot_id = slot["slot_id"]
        slot_dir = os.path.join(SLOTS_DIR, slot_id)
        os.makedirs(slot_dir, exist_ok=True)
        meta_path = os.path.join(slot_dir, "meta.json")
        if os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                existing_meta = json.load(f)
            merged = _merge_meta(existing_meta, slot)
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(merged, f, indent=2, sort_keys=True)
            final_slots.append(merged)
        else:
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(slot, f, indent=2, sort_keys=True)
            final_slots.append(slot)

    final_slots = sorted(final_slots, key=lambda x: (x.get("page_path", ""), x.get("slot_key", "")))
    write_json(INDEX_JSON, final_slots)
    write_csv(
        INDEX_CSV,
        final_slots,
        [
            "slot_id",
            "page_path",
            "slot_key",
            "usage",
            "priority_level",
            "anchor_text",
            "anchor_selector",
            "anchor_index",
            "insertion_mode",
            "ad_proximity_risk",
            "risk_score",
            "status",
        ],
    )

    write_repo_profile(config, files)

    print(f"Pages scanned: {len(files)}")
    print(f"Slots discovered: {len(final_slots)}")
    print(f"Index written: {safe_relpath(INDEX_JSON, base_dir)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
