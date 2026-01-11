# Policy Guardrails

This pipeline is designed to keep image usage AdSense-safe and user-friendly.

## AdSense safety
- Never place images inside ad containers or immediately adjacent to ads.
- Do not create images that mimic ads, buttons, or UI controls.
- Do not add misleading labels or text overlays to images.
- Keep content navigable and avoid accidental-click layouts.

## Content integrity
- Images must be accurate and realistic for the topic.
- Avoid fabricated product claims or visually misleading scenes.
- No logos, watermarks, or brand marks unless explicitly allowed.

## Performance
- Reserve layout space for all images to prevent CLS.
- Lazy-load inline images.
- Prefer responsive sizing.

## Reversibility
- Placement script supports backups and idempotent edits.
- Ledger tracks all actions and states for easy rollback.
