from __future__ import annotations

import io
from pathlib import Path
from typing import Dict, Tuple

from PIL import Image

from .io_utils import slugify

LEGACY_MAP = {
    "1600x900": "1536x1024",
    "1200x800": "1536x1024",
    "1200x900": "1536x1024",
}


def map_size(requested: str) -> str:
    if requested in ("1024x1024", "1536x1024", "1024x1536", "auto"):
        return requested
    return LEGACY_MAP.get(requested, "1536x1024")


def _parse_size(size: str) -> Tuple[int, int]:
    parts = size.split("x")
    return int(parts[0]), int(parts[1])


def crop_to_aspect(img: Image.Image, target_ratio: float) -> Image.Image:
    width, height = img.size
    current_ratio = width / float(height)
    if abs(current_ratio - target_ratio) < 0.01:
        return img
    if current_ratio > target_ratio:
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        return img.crop((left, 0, left + new_width, height))
    new_height = int(width / target_ratio)
    top = (height - new_height) // 2
    return img.crop((0, top, width, top + new_height))


def process_image(
    image_bytes: bytes,
    output_dir: Path,
    output_size: str,
    site_slug: str,
    page_slug: str,
    slot_key: str,
    slot_id: str,
) -> Dict[str, str]:
    output_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    target_width, target_height = _parse_size(output_size)
    target_ratio = target_width / float(target_height)
    img = crop_to_aspect(img, target_ratio)
    img = img.resize((target_width, target_height), Image.LANCZOS)

    seo_base = "-".join(
        filter(None, [slugify(site_slug), slugify(page_slug), slugify(slot_key), slot_id])
    )

    png_path = output_dir / "image.png"
    webp_path = output_dir / "image.webp"
    seo_png = output_dir / f"{seo_base}.png"
    seo_webp = output_dir / f"{seo_base}.webp"

    img.save(png_path, format="PNG", optimize=True)
    img.save(webp_path, format="WEBP", quality=88)
    img.save(seo_png, format="PNG", optimize=True)
    img.save(seo_webp, format="WEBP", quality=88)

    return {
        "png": str(png_path),
        "webp": str(webp_path),
        "seo_png": str(seo_png),
        "seo_webp": str(seo_webp),
        "seo_base": seo_base,
        "width": str(target_width),
        "height": str(target_height),
    }
