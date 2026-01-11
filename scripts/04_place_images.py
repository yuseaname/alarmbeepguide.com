import argparse
import csv
import json
import os
import shutil
import time
from typing import Dict, List, Optional

from _pipeline_utils import (
    load_config,
    normalize_text,
    parse_size,
    pick_assets_dir,
    relative_url,
    utc_now,
)

try:
    from bs4 import BeautifulSoup
except ImportError:  # pragma: no cover - runtime dependency
    BeautifulSoup = None

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_PATH = os.path.join(BASE_DIR, "image-pipeline", "config.yaml")
SLOTS_DIR = os.path.join(BASE_DIR, "image-prompts", "slots")
DEFAULT_MANIFEST = os.path.join(BASE_DIR, "generated-images", "manifest.json")
PLACEMENT_REPORT = os.path.join(BASE_DIR, "generated-images", "placement-report.json")
PLACEMENT_REPORT_CSV = os.path.join(BASE_DIR, "generated-images", "placement-report.csv")
PLACEMENT_DRY_RUN = os.path.join(BASE_DIR, "generated-images", "placement-dry-run.json")
PLACEMENT_DRY_RUN_CSV = os.path.join(BASE_DIR, "generated-images", "placement-dry-run.csv")
PLACEMENT_PLAN = os.path.join(BASE_DIR, "image-pipeline", "PLACEMENT_PLAN.md")


def _read_json(path: str, default: Dict) -> Dict:
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_meta(slot_id: str) -> Optional[Dict]:
    meta_path = os.path.join(SLOTS_DIR, slot_id, "meta.json")
    if not os.path.exists(meta_path):
        return None
    with open(meta_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _contains_ad_marker(tag, markers: List[str]) -> bool:
    if not tag:
        return False
    marker_set = [m.lower() for m in markers]
    if any(m in (tag.get("class") or []) for m in marker_set):
        return True
    for attr, value in tag.attrs.items():
        if isinstance(value, list):
            value = " ".join(value)
        value_str = str(value).lower()
        if any(marker in value_str for marker in marker_set):
            return True
    text = "".join(tag.stripped_strings).lower()
    if any(marker in text for marker in marker_set):
        return True
    return False


def _is_adjacent_to_ads(tag, markers: List[str], separation: int) -> bool:
    if not tag or separation <= 0:
        return False
    prev = tag
    next_tag = tag
    for _ in range(separation):
        prev = prev.find_previous_sibling()
        next_tag = next_tag.find_next_sibling()
        if prev and _contains_ad_marker(prev, markers):
            return True
        if next_tag and _contains_ad_marker(next_tag, markers):
            return True
    return False


def _create_image_figure(soup, meta: Dict, src: str) -> object:
    usage = meta.get("usage")
    fig = soup.new_tag("figure")
    fig["class"] = ["generated-image-slot", f"generated-image-{usage}"]
    fig["data-slot-id"] = meta.get("slot_id")

    img = soup.new_tag("img")
    img["src"] = src
    img["alt"] = meta.get("alt_text") or ""
    img["loading"] = "eager" if usage == "hero" else "lazy"
    if usage == "hero":
        img["fetchpriority"] = "high"
    img["decoding"] = "async"
    img["data-slot-id"] = meta.get("slot_id")

    size = parse_size(meta.get("recommended_size", ""))
    if size:
        img["width"] = str(size[0])
        img["height"] = str(size[1])

    fig.append(img)
    return fig


def _find_heading(soup, anchor_text: str, anchor_index: int):
    target = normalize_text(anchor_text).lower()
    if not target:
        return None
    matches = []
    for tag in soup.find_all(["h2", "h3"]):
        if normalize_text(tag.get_text(" ")).lower() == target:
            matches.append(tag)
    if not matches:
        return None
    index = max(1, anchor_index or 1) - 1
    if index < len(matches):
        return matches[index]
    return matches[0]
    return None


def _find_nth_heading(soup, index: int):
    headings = soup.find_all(["h2", "h3"])
    if index < len(headings):
        return headings[index]
    return None


def _find_hero_container(soup):
    for tag in soup.find_all(True):
        class_list = " ".join(tag.get("class", [])).lower()
        tag_id = str(tag.get("id", "")).lower()
        if "hero" in class_list or tag_id.startswith("hero") or "hero" in tag_id:
            return tag
    return None


def _record_plan(plan_rows: List[str]) -> None:
    if not plan_rows:
        return
    os.makedirs(os.path.dirname(PLACEMENT_PLAN), exist_ok=True)
    with open(PLACEMENT_PLAN, "w", encoding="utf-8") as f:
        f.write("# Placement Plan\n\n")
        f.write("Manual placement required for non-HTML sources.\n\n")
        f.write("\n".join(plan_rows) + "\n")


def main() -> int:
    if BeautifulSoup is None:
        raise RuntimeError("beautifulsoup4 is required. Install with: pip install beautifulsoup4")

    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--backup", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    config = load_config(CONFIG_PATH)
    manifest = _read_json(args.manifest, {})
    entries = manifest.get("entries", [])
    if args.dry_run:
        selected_entries = [
            e for e in entries if e.get("selected") is True or e.get("status") == "success"
        ]
        entries_to_place = selected_entries
    else:
        entries_to_place = [e for e in entries if e.get("status") == "success"]

    if args.limit:
        entries_to_place = entries_to_place[: args.limit]

    assets_dir = pick_assets_dir(config)
    base_dir = os.path.abspath(config["site"]["base_dir"])
    ad_markers = config.get("adsense", {}).get("ad_markers", [])
    separation = int(config.get("adsense", {}).get("min_dom_separation_from_ads", 1))

    report_rows = []
    plan_rows = []

    for entry in entries_to_place:
        slot_id = entry.get("slot_id")
        meta = _load_meta(slot_id)
        if not meta:
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "missing_meta"})
            continue
        page_path = os.path.join(base_dir, meta.get("page_path", ""))
        extension = config.get("images", {}).get("default_output_format", "png")
        dest_filename = f"{slot_id}.{extension}"
        dest_path = os.path.join(assets_dir, dest_filename)
        src = relative_url(page_path, dest_path)
        if not page_path.lower().endswith((".html", ".htm")):
            plan_rows.append(
                f"- Slot {slot_id} ({meta.get('usage')}) in {meta.get('page_path')}: insert after {meta.get('anchor_text')}"
            )
            report_rows.append(
                {
                    "slot_id": slot_id,
                    "status": "planned",
                    "page": meta.get("page_path"),
                    "planned_position": meta.get("insertion_mode"),
                    "anchor_selector": meta.get("anchor_selector"),
                    "anchor_index": meta.get("anchor_index"),
                    "insertion_mode": meta.get("insertion_mode"),
                    "snippet_preview": f'<img src="{src}" alt="{meta.get("alt_text","")}" data-slot-id="{slot_id}" />',
                }
            )
            continue

        if not os.path.exists(page_path):
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "missing_page"})
            continue

        slot_dir = os.path.join(BASE_DIR, "generated-images", "slots", slot_id)
        image_path = os.path.join(slot_dir, f"image.{extension}")
        if not os.path.exists(image_path) and not args.dry_run:
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "missing_image"})
            continue

        if not args.dry_run:
            os.makedirs(assets_dir, exist_ok=True)
            shutil.copy2(image_path, dest_path)

        with open(page_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        soup = BeautifulSoup(content, "html.parser")

        if soup.find(attrs={"data-slot-id": slot_id}):
            report_rows.append({"slot_id": slot_id, "status": "skipped", "reason": "already_placed"})
            continue

        figure = _create_image_figure(soup, meta, src)
        snippet_preview = str(figure)

        inserted = False
        reason = ""
        planned_position = ""
        if meta.get("usage") == "hero":
            container = _find_hero_container(soup)
            if container and not _contains_ad_marker(container, ad_markers):
                planned_position = "hero-container"
                if not args.dry_run:
                    container.insert(0, figure)
                inserted = True
            else:
                h1 = soup.find("h1")
                if h1 and not _contains_ad_marker(h1.parent, ad_markers) and not _is_adjacent_to_ads(h1, ad_markers, separation):
                    planned_position = "after-h1"
                    if not args.dry_run:
                        h1.insert_after(figure)
                    inserted = True
                else:
                    main = soup.find("main") or soup.body
                    if main and not _contains_ad_marker(main, ad_markers):
                        planned_position = "main-start"
                        if not args.dry_run:
                            main.insert(0, figure)
                        inserted = True
        else:
            anchor = _find_heading(soup, meta.get("anchor_text", ""), int(meta.get("anchor_index", 1)))
            if not anchor:
                slot_key = meta.get("slot_key", "inline-1")
                try:
                    idx = int(slot_key.split("-")[1]) - 1
                except (IndexError, ValueError):
                    idx = 0
                anchor = _find_nth_heading(soup, idx)
            if anchor and not _contains_ad_marker(anchor.parent, ad_markers) and not _is_adjacent_to_ads(anchor, ad_markers, separation):
                planned_position = "after-heading"
                if not args.dry_run:
                    anchor.insert_after(figure)
                inserted = True
            else:
                reason = "anchor_not_found_or_ad_adjacent"

        if not inserted:
            report_rows.append(
                {
                    "slot_id": slot_id,
                    "status": "skipped",
                    "reason": reason or "unsafe",
                    "page": meta.get("page_path"),
                    "planned_position": planned_position,
                    "anchor_selector": meta.get("anchor_selector"),
                    "anchor_index": meta.get("anchor_index"),
                    "insertion_mode": meta.get("insertion_mode"),
                    "snippet_preview": snippet_preview,
                }
            )
            continue

        if args.backup and not args.dry_run:
            ts = int(time.time())
            shutil.copy2(page_path, f"{page_path}.bak.{ts}")

        if not args.dry_run:
            with open(page_path, "w", encoding="utf-8") as f:
                f.write(str(soup))

        report_rows.append(
            {
                "slot_id": slot_id,
                "status": "planned" if args.dry_run else "placed",
                "page": meta.get("page_path"),
                "planned_position": planned_position,
                "anchor_selector": meta.get("anchor_selector"),
                "anchor_index": meta.get("anchor_index"),
                "insertion_mode": meta.get("insertion_mode"),
                "snippet_preview": snippet_preview,
            }
        )

    report_path = PLACEMENT_DRY_RUN if args.dry_run else PLACEMENT_REPORT
    report_csv = PLACEMENT_DRY_RUN_CSV if args.dry_run else PLACEMENT_REPORT_CSV
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({"generated_at": utc_now(), "entries": report_rows}, f, indent=2, sort_keys=True)

    with open(report_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "slot_id",
                "status",
                "page",
                "reason",
                "planned_position",
                "anchor_selector",
                "anchor_index",
                "insertion_mode",
                "snippet_preview",
            ],
        )
        writer.writeheader()
        for row in report_rows:
            writer.writerow(row)

    _record_plan(plan_rows)

    print(f"Placement report written: {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
