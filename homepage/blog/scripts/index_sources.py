#!/usr/bin/env python3
"""
.reference/contents/의 YouTube 데이터를 경량 인덱스로 변환

Usage:
    python index_sources.py --run-dir homepage/blog/runs/2026-02-07 [--source-dir .reference/contents]

Output:
    JSON 형식으로 인덱싱 결과 출력
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    print(json.dumps({"error": "pyyaml 미설치", "install": "pip install pyyaml"}))
    sys.exit(1)


def index_sources(source_dir: str, run_dir: str) -> dict:
    source_path = Path(source_dir)
    run_path = Path(run_dir)

    if not source_path.exists():
        return {"error": f"소스 디렉토리 없음: {source_dir}", "indexed": 0}

    sources = []

    for channel_dir in sorted(source_path.iterdir()):
        if not channel_dir.is_dir():
            continue

        channel_handle = channel_dir.name

        for yaml_file in sorted(channel_dir.glob("*.yaml")):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)

                if not data or "video_id" not in data:
                    continue

                entry = {
                    "video_id": data.get("video_id"),
                    "title": data.get("title"),
                    "channel": channel_handle,
                    "published_at": data.get("published_at"),
                    "url": data.get("url"),
                    "duration": data.get("duration"),
                    "has_transcript": data.get("transcript", {}).get("available", False),
                    "summary": data.get("summary", {}).get("content") if data.get("summary") else None,
                    "source_path": str(yaml_file),
                }
                sources.append(entry)

            except Exception:
                continue

    sources.sort(key=lambda x: x.get("published_at") or "", reverse=True)

    index_data = {"indexed_at": str(date.today()), "count": len(sources), "sources": sources}

    index_path = run_path / "sources" / "source-index.yaml"
    index_path.parent.mkdir(parents=True, exist_ok=True)

    with open(index_path, "w", encoding="utf-8") as f:
        yaml.dump(index_data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    return {"index_path": str(index_path), "indexed": len(sources), "status": "success"}


def main():
    parser = argparse.ArgumentParser(description="YouTube 소스 데이터 인덱싱")
    parser.add_argument("--run-dir", required=True, help="실행 디렉토리 경로")
    parser.add_argument("--source-dir", default=".reference/contents", help="소스 디렉토리")
    args = parser.parse_args()

    result = index_sources(args.source_dir, args.run_dir)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
