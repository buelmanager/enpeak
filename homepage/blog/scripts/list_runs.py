#!/usr/bin/env python3
"""
블로그 실행 목록 및 상태 조회

Usage:
    python list_runs.py [--base-dir homepage/blog]
    python list_runs.py --run-date 2026-02-07

Output:
    JSON 형식으로 실행 목록/상태 출력
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print(json.dumps({"error": "pyyaml 미설치", "install": "pip install pyyaml"}))
    sys.exit(1)


def get_run_summary(run_path: Path) -> dict:
    run_yaml = run_path / "run.yaml"

    if not run_yaml.exists():
        return {"date": run_path.name, "status": "unknown", "error": "run.yaml 없음"}

    with open(run_yaml, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    phases = data.get("phases", {})
    phase_summary = {k: v.get("status", "unknown") for k, v in phases.items()}

    topics = data.get("topics", [])
    topic_slugs = [t.get("slug") for t in topics]

    articles = list((run_path / "articles").glob("*.md")) if (run_path / "articles").exists() else []

    return {
        "date": run_path.name,
        "status": data.get("status", "unknown"),
        "phases": phase_summary,
        "topics": topic_slugs,
        "articles_count": len(articles),
    }


def list_runs(base_dir: str, run_date: str = None) -> dict:
    runs_path = Path(base_dir) / "runs"

    if not runs_path.exists():
        return {"runs": [], "message": "실행 기록 없음"}

    if run_date:
        specific = runs_path / run_date
        if not specific.exists():
            return {"error": f"실행 없음: {run_date}"}
        return get_run_summary(specific)

    runs = []
    for run_dir in sorted(runs_path.iterdir(), reverse=True):
        if run_dir.is_dir():
            runs.append(get_run_summary(run_dir))

    return {"runs": runs, "total": len(runs)}


def main():
    parser = argparse.ArgumentParser(description="블로그 실행 목록 조회")
    parser.add_argument("--base-dir", default="homepage/blog", help="블로그 기본 디렉토리")
    parser.add_argument("--run-date", help="특정 실행 날짜 조회")
    args = parser.parse_args()

    result = list_runs(args.base_dir, args.run_date)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
