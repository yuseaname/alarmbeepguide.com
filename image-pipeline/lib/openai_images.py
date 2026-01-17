from __future__ import annotations

import base64
import json
import os
import time
from pathlib import Path
from typing import Dict

import requests

ALLOWED_QUALITIES = {"low", "medium", "high", "auto"}
ALLOWED_SIZES = {"1024x1024", "1536x1024", "1024x1536", "auto"}


def _validate(model: str, size: str, quality: str) -> None:
    if not model or not model.startswith("gpt-image-"):
        raise RuntimeError("Invalid model. Use GPT Image models only (gpt-image-*).")
    if quality not in ALLOWED_QUALITIES:
        raise RuntimeError(f"Invalid quality '{quality}'. Allowed: {', '.join(sorted(ALLOWED_QUALITIES))}")
    if size not in ALLOWED_SIZES:
        raise RuntimeError(f"Invalid size '{size}'. Allowed: {', '.join(sorted(ALLOWED_SIZES))}")


def generate_image(prompt: str, model: str, size: str, quality: str, prompt_hash: str, logs_path: Path) -> bytes:
    _validate(model, size, quality)
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "n": 1,
    }

    url = "https://api.openai.com/v1/images/generations"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    backoff = 2.0
    for attempt in range(5):
        resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
        if resp.status_code in (429, 500, 502, 503, 504):
            time.sleep(backoff)
            backoff *= 1.7
            continue
        if resp.status_code >= 400:
            raise RuntimeError(f"API Error {resp.status_code}: {resp.text}")
        data = resp.json()
        b64 = data["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64)
        _log_request(logs_path, model, size, quality, prompt_hash)
        return image_bytes

    raise RuntimeError("API Error: retries exhausted")


def _log_request(logs_path: Path, model: str, size: str, quality: str, prompt_hash: str) -> None:
    logs_path.parent.mkdir(parents=True, exist_ok=True)
    entry: Dict[str, str] = {
        "model": model,
        "size": size,
        "quality": quality,
        "prompt_hash": prompt_hash,
    }
    with logs_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
