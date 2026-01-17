from __future__ import annotations

from pathlib import Path
from typing import List

from bs4 import BeautifulSoup

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.io_utils import load_yaml, read_json, write_text

BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_PATH = BASE_DIR / "image-pipeline" / "config.yaml"
INDEX_JSON = BASE_DIR / "image-pipeline" / "prompts" / "index.json"
REPORT_PATH = BASE_DIR / "image-pipeline" / "generated" / "AUDIT_REPORT.md"


def audit_html(base_dir: Path) -> List[str]:
    issues = []
    for path in base_dir.rglob("*.html"):
        content = path.read_text(encoding="utf-8", errors="ignore")
        soup = BeautifulSoup(content, "html.parser")
        for img in soup.find_all("img"):
            if not img.get("data-slot-id"):
                continue
            if not img.get("width") or not img.get("height"):
                issues.append(f"Missing dimensions: {path}")
            if img.get("loading") not in ("lazy", "eager"):
                issues.append(f"Missing loading attr: {path}")
    return issues


def audit_prompts(index: List[dict]) -> List[str]:
    issues = []
    banned = ["logo", "watermark", "text overlay", "button"]
    for slot in index:
        prompt = slot.get("super_prompt") or ""
        if any(b in prompt.lower() for b in banned):
            issues.append(f"Prompt contains banned terms for slot {slot.get('slot_id')}")
    return issues


def main() -> int:
    config = load_yaml(CONFIG_PATH)
    base_dir = Path(config.get("site", {}).get("base_dir", ".")).resolve()
    index = read_json(INDEX_JSON, default=[])

    html_issues = audit_html(base_dir)
    prompt_issues = audit_prompts(index)

    lines = ["# Audit Report", "", "## HTML Checks"]
    if html_issues:
        lines.extend(f"- {issue}" for issue in html_issues)
    else:
        lines.append("- No HTML issues found.")

    lines.append("")
    lines.append("## Prompt Checks")
    if prompt_issues:
        lines.extend(f"- {issue}" for issue in prompt_issues)
    else:
        lines.append("- No prompt issues found.")

    write_text(REPORT_PATH, "\n".join(lines) + "\n")
    print("Audit complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
