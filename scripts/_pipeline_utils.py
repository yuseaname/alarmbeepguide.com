import csv
import datetime
import hashlib
import json
import os
import re
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    import yaml
except ImportError:  # pragma: no cover - runtime dependency
    yaml = None


def utc_now() -> str:
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def load_yaml(path: str) -> Dict[str, Any]:
    if yaml is None:
        raise RuntimeError("PyYAML is required. Install with: pip install pyyaml")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def read_json(path: str, default: Any) -> Any:
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True)


def write_csv(path: str, rows: Iterable[Dict[str, Any]], fieldnames: List[str]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def safe_relpath(path: str, base: str) -> str:
    rel = os.path.relpath(path, base)
    return rel.replace(os.sep, "/")


def sha1_short(value: str, length: int = 12) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:length]


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def load_config(config_path: str) -> Dict[str, Any]:
    config = load_yaml(config_path)
    if config is None:
        raise RuntimeError("Config is empty")
    return config


def is_in_build_dir(path: str, build_dirs: List[str], base_dir: str) -> bool:
    abs_path = os.path.abspath(path)
    for build_dir in build_dirs:
        abs_build = os.path.abspath(os.path.join(base_dir, build_dir))
        if abs_path.startswith(abs_build + os.sep) or abs_path == abs_build:
            return True
    return False


def list_content_files(config: Dict[str, Any], exts: Tuple[str, ...]) -> List[str]:
    base_dir = os.path.abspath(config["site"]["base_dir"])
    build_dirs = config["site"].get("build_dirs", [])
    exclude_dirs = config["site"].get("exclude_dirs", [])
    abs_excludes = [os.path.abspath(os.path.join(base_dir, p)) for p in exclude_dirs]

    def is_excluded(path: str) -> bool:
        abs_path = os.path.abspath(path)
        for excluded in abs_excludes:
            if abs_path == excluded or abs_path.startswith(excluded + os.sep):
                return True
        return False

    files: List[str] = []
    for root in config["site"].get("content_roots", ["./"]):
        abs_root = os.path.abspath(os.path.join(base_dir, root))
        if not os.path.exists(abs_root):
            continue
        if os.path.isfile(abs_root):
            if abs_root.lower().endswith(exts) and not is_excluded(abs_root):
                files.append(abs_root)
            continue
        for dirpath, dirnames, filenames in os.walk(abs_root):
            if is_excluded(dirpath) or is_in_build_dir(dirpath, build_dirs, base_dir):
                dirnames[:] = []
                continue
            dirnames[:] = [
                d for d in dirnames if not is_excluded(os.path.join(dirpath, d))
            ]
            for name in filenames:
                if name.lower().endswith(exts):
                    full = os.path.join(dirpath, name)
                    if not is_in_build_dir(full, build_dirs, base_dir) and not is_excluded(full):
                        files.append(full)
    return sorted(set(files))


def detect_site_types(files: List[str]) -> List[str]:
    types = set()
    for path in files:
        lower = path.lower()
        if lower.endswith((".html", ".htm")):
            types.add("html")
        if lower.endswith((".md", ".mdx")):
            types.add("markdown")
        if lower.endswith((".tsx", ".jsx")):
            types.add("jsx")
    return sorted(types)


def extract_words(text: str) -> List[str]:
    return re.findall(r"[A-Za-z0-9']+", text)


def word_count(text: str) -> int:
    return len(extract_words(text))


def compute_max_inline(word_count_value: int, per_1200: int) -> int:
    if word_count_value < 450:
        return 0
    ratio = (word_count_value / 1200.0) * per_1200
    if ratio < 1:
        return 1
    return max(1, int(round(ratio)))


def ad_marker_present(text: str, markers: List[str]) -> bool:
    lower = text.lower()
    return any(marker.lower() in lower for marker in markers)


def recommended_size_for_usage(usage: str) -> Tuple[str, str]:
    if usage == "hero":
        return "16:9", "1600x900"
    return "4:3", "1200x900"


def parse_size(size_str: str) -> Optional[Tuple[int, int]]:
    match = re.match(r"^(\d+)x(\d+)$", size_str or "")
    if not match:
        return None
    return int(match.group(1)), int(match.group(2))


def pick_assets_dir(config: Dict[str, Any]) -> str:
    base_dir = os.path.abspath(config["site"]["base_dir"])
    candidates = config.get("assets", {}).get("images_dest_candidates", [])
    for candidate in candidates:
        abs_candidate = os.path.abspath(os.path.join(base_dir, candidate))
        if os.path.exists(abs_candidate):
            return abs_candidate
    if candidates:
        abs_candidate = os.path.abspath(os.path.join(base_dir, candidates[0]))
        os.makedirs(abs_candidate, exist_ok=True)
        return abs_candidate
    fallback = os.path.abspath(os.path.join(base_dir, "images/generated"))
    os.makedirs(fallback, exist_ok=True)
    return fallback


def relative_url(from_path: str, to_path: str) -> str:
    rel = os.path.relpath(to_path, os.path.dirname(from_path))
    return rel.replace(os.sep, "/")


def score_slot(meta: Dict[str, Any]) -> float:
    score = 0.0
    usage = meta.get("usage")
    priority = meta.get("priority_level")
    page_path = meta.get("page_path", "")
    ad_risk = meta.get("ad_proximity_risk", "low")
    risk_score = float(meta.get("risk_score", 0) or 0)

    if usage == "hero":
        score += 100
    else:
        score += 40

    if priority == "CRITICAL":
        score += 80
    elif priority == "IMPORTANT":
        score += 40

    normalized_path = page_path.lower()
    if normalized_path.endswith("index.html") or "homepage" in normalized_path or "/home" in normalized_path:
        score += 30
    if "blog" in normalized_path or "pillar" in normalized_path or "category" in normalized_path:
        score += 15

    depth = normalized_path.count("/")
    score += max(0, 10 - depth)

    if ad_risk == "high":
        score -= 10
    elif ad_risk == "med":
        score -= 5

    if risk_score >= 4:
        score -= 15
    elif risk_score >= 2:
        score -= 8
    elif risk_score >= 1:
        score -= 4

    return score


def load_locked_slots(path: str) -> List[str]:
    data = read_json(path, [])
    if not isinstance(data, list):
        return []
    return [str(x) for x in data]
