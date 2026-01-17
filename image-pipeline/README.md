# AdSense Safe Image Pipeline (Portable v4)

This pipeline is deterministic, idempotent, reversible, and safe for AdSense. It discovers image slots, refines prompts, generates images using GPT Image models, and plans placement with CLS-safe markup. It is designed to be portable across repos by copying the `/image-pipeline/` folder.

## Non-negotiables
- Compliance first: no ad-like imagery, no deceptive UI, no misleading buttons.
- Performance first: avoid CLS/LCP regressions; inline images lazy-load; hero can be eager.
- Deterministic slot IDs and selection.
- Idempotent scripts (no duplicates on rerun unless inputs change).
- No secrets in code; uses `OPENAI_API_KEY` from env.
- Reversible: backups for edits; git-friendly diffs.
- Do not edit site files unless explicitly requested with `--apply`.

## Requirements
- Python 3.10+
- Install dependencies:
  - `python -m venv .venv`
  - `source .venv/bin/activate` (macOS/Linux)
  - `.venv\Scripts\activate` (Windows)
  - `pip install -r image-pipeline/requirements.txt`

## Environment
Copy `.env.example` to `.env` and set your API key.

```
OPENAI_API_KEY=put_your_key_here
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_QUALITY=medium
OPENAI_IMAGE_SIZE=1536x1024
```

## Run sequence
1) Discover slots
```
python image-pipeline/scripts/01_discover_slots.py
```

2) Refine prompts
```
python image-pipeline/scripts/02_refine_prompts.py --priority-only --max-slots 10
```

3) Generate images
```
python image-pipeline/scripts/03_generate_images.py --priority-only --quality medium --model gpt-image-1 --size 1536x1024 --max-slots 10 --force
```

4) Build ledger
```
python image-pipeline/scripts/build_image_ledger.py --scan-html
```

5) Placement plan (default plan-only)
```
python image-pipeline/scripts/04_place_images.py --limit 20
```

6) Polish + audit
```
python image-pipeline/scripts/05_polish_audit.py
```

## Notes
- Placement defaults to plan-only. Use `--apply` to modify HTML files and create backups.
- Generated assets live under `image-pipeline/generated/` and are ignored by git.
