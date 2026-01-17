from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Any, Dict, List

from bs4 import BeautifulSoup

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.io_utils import load_yaml, read_json, write_json, write_csv

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
MANIFEST_PATH = BASE_DIR / "image-pipeline" / "generated" / "manifest.json"
SLOTS_DIR = BASE_DIR / "image-pipeline" / "prompts" / "slots"
GENERATED_DIR = BASE_DIR / "image-pipeline" / "generated"
PLACEMENT_PLAN = GENERATED_DIR / "PLACEMENT_PLAN.md"
PLACEMENT_REPORT = GENERATED_DIR / "placement-report.json"
PLACEMENT_REPORT_CSV = GENERATED_DIR / "placement-report.csv"
BACKUP_DIR = GENERATED_DIR / "backups"


def pick_assets_dir(config: Dict[str, Any]) -> Path:
    base_dir = Path(config.get("site", {}).get("base_dir", ".")).resolve()
    candidates = config.get("assets", {}).get("images_dest_candidates", [])
    for candidate in candidates:
        path = base_dir / candidate
        if path.exists():
            return path
    return (base_dir / candidates[0]) if candidates else (base_dir / "assets" / "images" / "generated")


def relative_url(from_path: Path, to_path: Path) -> str:
    rel = to_path.relative_to(from_path.parent.resolve())
    return str(rel).replace("\\", "/")


def _find_heading(soup: BeautifulSoup, text: str, index: int) -> Any:
    matches = []
    target = " ".join(text.split()).lower()
    for tag in soup.find_all(["h2", "h3"]):
        if " ".join(tag.get_text(" ").split()).lower() == target:
            matches.append(tag)
    if not matches:
        return None
    idx = max(1, index or 1) - 1
    return matches[idx] if idx < len(matches) else matches[0]


def _is_adjacent_to_ads(tag, markers: List[str], separation: int) -> bool:
    if not tag or separation <= 0:
        return False
    prev = tag
    next_tag = tag
    for _ in range(separation):
        prev = prev.find_previous_sibling()
        next_tag = next_tag.find_next_sibling()
        for node in (prev, next_tag):
            if not node:
                continue
            attrs = " ".join(node.get("class", [])) + " " + " ".join(str(v) for v in node.attrs.values())
            if any(m.lower() in attrs.lower() for m in markers):
                return True
    return False


def _create_figure(soup: BeautifulSoup, meta: Dict[str, Any], src: str) -> Any:
    fig = soup.new_tag("figure")
    fig["data-slot-id"] = meta.get("slot_id")

    img = soup.new_tag("img")
    img["src"] = src
    img["alt"] = meta.get("alt_text", "")
    img["decoding"] = "async"
    img["data-slot-id"] = meta.get("slot_id")
    if meta.get("usage") == "hero":
        img["loading"] = "eager"
        img["fetchpriority"] = "high"
    else:
        img["loading"] = "lazy"

    size = meta.get("recommended_size", "")
    if "x" in size:
        w, h = size.split("x")
        img["width"] = w
        img["height"] = h

    fig.append(img)
    return fig


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    config = load_yaml(CONFIG_PATH)
    manifest = read_json(MANIFEST_PATH, default={})
    entries = [e for e in manifest.get("entries", []) if e.get("status") in ("success", "existing_valid")]
    if args.limit:
        entries = entries[: args.limit]

    assets_dir = pick_assets_dir(config)
    assets_dir.mkdir(parents=True, exist_ok=True)

    ad_markers = config.get("adsense", {}).get("ad_markers", [])
    separation = int(config.get("adsense", {}).get("min_dom_separation_from_ads", 1))

    report_rows: List[Dict[str, Any]] = []
    plan_rows: List[str] = []

    for entry in entries:
        slot_id = entry.get("slot_id")
        meta_path = SLOTS_DIR / slot_id / "meta.json"
        meta = read_json(meta_path, default={})
        page_path = BASE_DIR / meta.get("page_path", "")
        if not page_path.exists():
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "missing_page"})
            continue

        if page_path.suffix.lower() not in (".html", ".htm"):
            plan_rows.append(f"- Slot {slot_id} ({meta.get('usage')}) in {meta.get('page_path')}: insert after {meta.get('anchor_text')}")
            report_rows.append({"slot_id": slot_id, "status": "planned"})
            continue

        output_dir = GENERATED_DIR / "images" / "slots" / slot_id
        image_path = output_dir / "image.webp"
        if not image_path.exists():
            image_path = output_dir / "image.png"
        if not image_path.exists():
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "missing_image"})
            continue

        dest_path = assets_dir / image_path.name
        if args.apply:
            shutil.copy2(image_path, dest_path)

        with page_path.open("r", encoding="utf-8", errors="ignore") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

        heading = _find_heading(soup, meta.get("anchor_text", ""), int(meta.get("anchor_index", 1)))
        if not heading:
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "missing_heading"})
            continue

        if _is_adjacent_to_ads(heading, ad_markers, separation):
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "near_ads"})
            continue

        src = relative_url(page_path, dest_path)
        fig = _create_figure(soup, meta, src)
        heading.insert_after(fig)

        if args.apply:
            BACKUP_DIR.mkdir(parents=True, exist_ok=True)
            backup_path = BACKUP_DIR / f"{page_path.name}.bak"
            shutil.copy2(page_path, backup_path)
            page_path.write_text(str(soup), encoding="utf-8")
            report_rows.append({"slot_id": slot_id, "status": "placed"})
        else:
            report_rows.append({"slot_id": slot_id, "status": "planned"})

    if plan_rows:
        PLACEMENT_PLAN.write_text("# Placement Plan\n\n" + "\n".join(plan_rows) + "\n", encoding="utf-8")

    write_json(PLACEMENT_REPORT, {"entries": report_rows})
    write_csv(PLACEMENT_REPORT_CSV, report_rows, ["slot_id", "status", "reason"])

    print(f"Entries processed: {len(report_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
