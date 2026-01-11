# AdSense-Safe Image Pipeline

This pipeline installs a repo-agnostic image workflow that is deterministic, idempotent, and AdSense-safe.
It discovers image slots, refines prompts, generates the highest-priority images, places them safely,
and audits the result for performance and compliance.

## Non-negotiables
- Compliance-first: no deceptive UI, no ad-like imagery, and no ad code modifications.
- Performance-first: reserve space to avoid CLS; lazy-load inline images.
- Idempotent: reruns do not duplicate or break pages.
- Deterministic: same repo state produces the same slot IDs and Top 20 selection.
- Reversible: backups available for placement changes.
- Secrets: use `OPENAI_API_KEY` from environment only.

## Dependencies
- Python 3.8+
- `pip install pyyaml beautifulsoup4`
- Optional for optimization: `pip install pillow`

## Runbook
1) Discover slots:
   `python scripts/01_discover_slots.py`
2) Refine prompts:
   `python scripts/02_refine_prompts.py`
3) Generate Top 20 (safe default):
   `python scripts/03_generate_images.py --priority-only --quality medium --model gpt-image-1`
4) Place Top 20:
   `python scripts/04_place_images.py --manifest generated-images/manifest.json --limit 20 --backup`
   Dry run preview:
   `python scripts/04_place_images.py --manifest generated-images/manifest.json --limit 20 --dry-run`
5) Build ledger anytime:
   `python scripts/build_image_ledger.py --scan-html`
6) Polish + audit:
   `python scripts/05_polish_audit.py`

## How to avoid duplicates
- The ledger is canonical.
- `image-ledger/locked_slots.json` prevents regeneration unless `--force`.
- Generator marks existing-valid images as success in the manifest to allow placement without re-generation.

## Notes
- HTML placement is implemented. For Markdown/MDX or template-only sources, the placement script writes a plan file instead of editing.
- The pipeline never inserts images inside ad containers or immediately adjacent to ads.
