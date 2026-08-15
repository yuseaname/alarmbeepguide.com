#!/usr/bin/env python3
"""AlarmBeepGuide affiliate wiring: 6 highest-intent pages (2026-08-15).

Chirping/end-of-life troubleshooting traffic converts to detector
replacement purchases. ASINs verified against amazon.com/dp URLs.
Anchor: '## Related Articles'. Idempotent.
"""
import re

JOBS = {
    "content/blog/10-year-sealed-battery-smoke-detector-chirping.md": (
        '{{< product-box asin="B08XY8VNPS" name="Kidde P4010ACSCO 10-Year Sealed Combo (2-Pack)" label="The no-chirp upgrade" description="Sealed 10-year lithium units cannot chirp for a low battery — the fix that ends the 3AM wake-ups for good. Wire-free interconnect, voice alerts, smoke + CO in one unit." button="Check price on Amazon" >}}'),
    "content/blog/co-detector-5-beeps-end-of-life.md": (
        '{{< product-box asin="B08KSM8Q5V" name="Kidde Nighthawk Plug-In CO Detector" label="The standard replacement" description="Five beeps means the sensor is done — not the batteries. This plug-in Nighthawk with digital display and battery backup is the drop-in most households choose when replacing an end-of-life unit." button="Check price on Amazon" >}}'),
    "content/blog/first-alert-smoke-detector-chirping.md": (
        '{{< product-box asin="B000MXJ498" name="First Alert SCO5CN Smoke + CO Combo" label="First Alert replacement path" description="When cleaning and fresh batteries do not stop the chirp, the unit is end-of-life. This battery combo is the like-for-like First Alert replacement — no rewiring, no new mounts." button="Check price on Amazon" >}}'),
    "content/blog/best-smoke-detector-replacement-hardwired.md": (
        '{{< product-box asin="B07CS2GZP7" name="Kidde KN-COSM-IBA Hardwired Combo" label="Our hardwired pick" description="Interconnectable hardwired smoke + CO with battery backup and voice warnings — the direct replacement for aging hardwired units, compatible with existing Kidde interconnect wiring." button="Check price on Amazon" >}}'),
    "content/blog/best-smoke-alarms-home-safety.md": (
        '{{< product-box asin="B018A3AEDG" name="Google Nest Protect (Wired, 2nd Gen)" label="Best smart pick" description="Phone alerts, self-testing, split-spectrum sensing, and a spoken warning instead of a shriek — the alarm that tells you dinner is burning before it tells the neighbors." button="Check price on Amazon" >}}'),
    "content/blog/carbon-monoxide-detector-4-beeps.md": (
        '{{< product-box asin="B08KSM8Q5V" name="Kidde Nighthawk Plug-In CO Detector" label="Add a second layer" description="Four beeps means CO is present right now. A plug-in digital-display unit for bedrooms and living areas adds the redundancy every CO plan needs after the event." button="Check price on Amazon" >}}'),
}

ANCHOR = "## Related Articles"
BOX_RE = re.compile(r"\{\{<\s*product-box", re.S)

changed, skipped = [], []
for path, box in JOBS.items():
    src = open(path).read()
    if BOX_RE.search(src):
        skipped.append(path); continue
    idx = src.rfind(ANCHOR)
    if idx == -1:
        skipped.append(path + " (no anchor)"); continue
    src = src[:idx] + box + "\n\n" + src[idx:]
    if "{{< affiliate-disclosure >}}" not in src:
        m = re.search(r"\A(?:\+\+\+.*?\+\+\+|---.*?---)\s*\n", src, re.S)
        if m:
            src = src[:m.end()] + "\n{{< affiliate-disclosure >}}\n" + src[m.end():]
    open(path, "w").write(src)
    changed.append(path)

print(f"changed={len(changed)} skipped={len(skipped)}")
for s in skipped: print("  SKIP " + s)
