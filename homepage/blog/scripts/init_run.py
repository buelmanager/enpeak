#!/usr/bin/env python3
"""
블로그 워크플로우 실행 디렉토리 초기화

Usage:
    python init_run.py [--date YYYY-MM-DD] [--base-dir homepage/blog]

Output:
    JSON 형식으로 초기화 결과 출력
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


SUBDIRS = ["sources", "insights", "selected", "research", "outlines", "feedback", "articles"]

RUN_YAML_TEMPLATE = {
    "created_at": None,
    "status": "initialized",
    "phases": {
        "collect": {"status": "pending", "started_at": None, "completed_at": None},
        "insight": {"status": "pending", "started_at": None, "completed_at": None},
        "review_insights": {"status": "pending", "started_at": None, "completed_at": None},
        "research": {"status": "pending", "started_at": None, "completed_at": None},
        "outline": {"status": "pending", "started_at": None, "completed_at": None},
        "review_outlines": {"status": "pending", "started_at": None, "completed_at": None},
        "write": {"status": "pending", "started_at": None, "completed_at": None},
    },
    "topics": [],
}


def init_run(base_dir: str, run_date: str) -> dict:
    run_path = Path(base_dir) / "runs" / run_date

    if run_path.exists():
        return {"error": f"이미 존재하는 실행입니다: {run_path}", "run_path": str(run_path)}

    for subdir in SUBDIRS:
        (run_path / subdir).mkdir(parents=True, exist_ok=True)

    run_data = RUN_YAML_TEMPLATE.copy()
    run_data["created_at"] = run_date

    run_yaml_path = run_path / "run.yaml"
    with open(run_yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(run_data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    return {"run_path": str(run_path), "status": "initialized", "date": run_date}


def main():
    parser = argparse.ArgumentParser(description="블로그 실행 디렉토리 초기화")
    parser.add_argument("--date", default=str(date.today()), help="실행 날짜 (기본: 오늘)")
    parser.add_argument("--base-dir", default="homepage/blog", help="블로그 기본 디렉토리")
    args = parser.parse_args()

    result = init_run(args.base_dir, args.date)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
