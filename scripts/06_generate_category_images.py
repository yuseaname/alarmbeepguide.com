import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "images", "categories")

ALLOWED_SIZES = {"1024x1024", "1536x1024", "1024x1536", "auto"}
ALLOWED_QUALITIES = {"low", "medium", "high", "auto"}


def build_prompt(topic: str, scene: str, reality_constraints=None, not_allowed=None) -> str:
    reality_constraints = reality_constraints or []
    not_allowed = not_allowed or []
    constraints_block = ""
    if reality_constraints:
        constraints_block += "\nReality constraints (must be true):\n- " + "\n- ".join(reality_constraints)
    if not_allowed:
        constraints_block += "\n\nNot allowed:\n- " + "\n- ".join(not_allowed)
    return (
        f"Photorealistic hero image representing the real-world meaning of the topic: {topic}.\n\n"
        "First, interpret what this topic implies to a general audience in everyday life "
        "(confusion, problem-solving, reassurance, discovery, resolution). "
        "Then visually represent that meaning through a realistic moment or situation.\n\n"
        "The scene must depict a believable, real-life scenario where the topic would naturally apply, "
        "not a staged setup or symbolic arrangement of objects.\n\n"
        "Show a single, specific moment in time that a human would immediately recognize as related to the topic.\n\n"
        "Avoid generic desk setups, flat-lay compositions, or repeated object arrangements.\n\n"
        f"Scene: {scene}\n\n"
        "Camera:\n"
        "Full-frame camera, 35mm lens.\n"
        "Natural perspective, slight imperfections allowed.\n"
        "Human eye-level or contextual angle (not overhead).\n\n"
        "Lighting:\n"
        "Natural or practical indoor lighting.\n"
        "Time-of-day cues allowed.\n"
        "No dramatic, cinematic, or studio lighting.\n\n"
        "Strict constraints:\n"
        "- No visible text.\n"
        "- No UI elements or readable screens.\n"
        "- No diagrams, icons, or symbols.\n"
        "- No branding, logos, or overlays.\n"
        "- No symmetry-heavy or stock-photo compositions.\n\n"
        "Style:\n"
        "Strict photorealism.\n"
        "No CGI, no illustration, no surreal elements.\n\n"
        "The image should feel like a real photograph taken during an authentic moment related to the topic, "
        "clearly understandable without explanation."
        f"{constraints_block}\n\n"
        "Do not reuse visual compositions, object groupings, or scene layouts from previous images. "
        "Each image must feel like a different household and a different moment."
    )


CATEGORIES = [
    {
        "slug": "chirp-beep-codes",
        "topic": "Chirp and Beep Codes",
        "scene": (
            "A homeowner on a step stool in a hallway, pausing mid-troubleshoot while looking up at a ceiling-mounted "
            "smoke/CO alarm with the cover slightly open, suggesting a battery check or reset."
        ),
        "reality_constraints": [
            "Smoke/CO alarms are ceiling- or wall-mounted only.",
            "Alarms appear as real, round or square white plastic devices with a test button.",
            "If a kitchen is visible, the alarm is mounted on a ceiling or high wall.",
        ],
        "not_allowed": [
            "Alarm mounted on an oven door, stovetop, countertop, or appliance.",
            "Alarm used as a handheld device or tool.",
            "Ad-like or button-like imagery.",
        ],
    },
    {
        "slug": "fire-extinguishers",
        "topic": "Fire Extinguishers",
        "scene": (
            "A person in a clean hallway or utility room checking a wall-mounted fire extinguisher, "
            "hand near the gauge while inspecting it during routine safety prep."
        ),
        "reality_constraints": [
            "Fire extinguisher is wall-mounted or standing upright in a bracket.",
            "No flames or active fire in the scene.",
        ],
        "not_allowed": [
            "Extinguisher placed on a stovetop, oven, or countertop.",
            "Visible text or labels that can be read.",
        ],
    },
    {
        "slug": "home-flood-lights",
        "topic": "Home Flood Lights",
        "scene": (
            "Exterior of a house at dusk where a homeowner adjusts a motion sensor flood light mounted on a garage "
            "or exterior wall, suggesting a fix for false triggers."
        ),
        "reality_constraints": [
            "Flood light is mounted outdoors on a wall, eave, or garage exterior.",
            "No visible text on the fixture or controls.",
        ],
        "not_allowed": [
            "Studio lighting or staged product shots.",
            "Symmetry-heavy composition.",
        ],
    },
    {
        "slug": "weather-outage-alerts",
        "topic": "Weather and Outage Alerts",
        "scene": (
            "A quiet living room during a stormy evening with a person checking a small weather radio on a shelf, "
            "looking toward a window with rain outside, conveying preparedness."
        ),
        "reality_constraints": [
            "No readable screens or text on devices.",
            "No emergency icons or warning symbols.",
        ],
        "not_allowed": [
            "Overly dramatic disaster imagery.",
            "UI-like screens or overlays.",
        ],
    },
    {
        "slug": "household-alert-fixes",
        "topic": "Household Alert Fixes",
        "scene": (
            "A homeowner in a laundry room kneeling near a quiet appliance, pausing after a check or reset, "
            "with subtle signs of a resolved alert such as a closed panel and calm posture."
        ),
        "reality_constraints": [
            "No readable control panels or screens.",
            "No brand logos or model names visible.",
        ],
        "not_allowed": [
            "Generic tool flat-lays.",
            "Symbolic props that look staged.",
        ],
    },
]


def generate_image(prompt: str, model: str, size: str, quality: str) -> bytes:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    url = "https://api.openai.com/v1/images/generations"
    payload = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": 1,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:  # nosec - user-controlled
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        raise RuntimeError(f"API Error {e.code}: {error_body}") from e

    b64 = data["data"][0].get("b64_json")
    if not b64:
        raise RuntimeError(f"No b64_json returned. Got keys: {list(data['data'][0].keys())}")
    return base64.b64decode(b64)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1"))
    parser.add_argument("--size", default=os.getenv("OPENAI_IMAGE_SIZE", "1536x1024"))
    parser.add_argument("--quality", default=os.getenv("OPENAI_IMAGE_QUALITY", "medium"))
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only", action="append", default=[])
    args = parser.parse_args()

    if args.size not in ALLOWED_SIZES:
        raise RuntimeError(f"Invalid size '{args.size}'. Allowed: {', '.join(sorted(ALLOWED_SIZES))}")
    if args.quality not in ALLOWED_QUALITIES:
        raise RuntimeError(f"Invalid quality '{args.quality}'. Allowed: {', '.join(sorted(ALLOWED_QUALITIES))}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    selected = CATEGORIES
    if args.only:
        only_set = set(args.only)
        selected = [item for item in CATEGORIES if item["slug"] in only_set]

    for item in selected:
        prompt = build_prompt(
            item["topic"],
            item["scene"],
            item.get("reality_constraints"),
            item.get("not_allowed"),
        )
        output_path = os.path.join(OUTPUT_DIR, f"{item['slug']}.png")
        if os.path.exists(output_path) and not args.force:
            print(f"Skip {item['slug']} (exists). Use --force to overwrite.")
            continue

        if args.dry_run:
            print(f"[DRY RUN] {item['slug']} -> {output_path}")
            continue

        image_bytes = generate_image(prompt, args.model, args.size, args.quality)
        with open(output_path, "wb") as f:
            f.write(image_bytes)
        print(f"Wrote {output_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
