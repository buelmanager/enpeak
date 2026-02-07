#!/usr/bin/env python3
"""
가장 최근 블로그 실행 디렉토리 경로 출력

Usage:
    python latest_run.py [--base-dir homepage/blog]

Output:
    최신 run 디렉토리 경로 (예: homepage/blog/runs/2026-02-07)
    실행 없으면 exit code 1
"""

import argparse
import sys
from pathlib import Path


def latest_run(base_dir: str) -> str | None:
    runs_path = Path(base_dir) / "runs"
    if not runs_path.exists():
        return None

    dirs = sorted([d for d in runs_path.iterdir() if d.is_dir()], reverse=True)
    return str(dirs[0]) if dirs else None


def main():
    parser = argparse.ArgumentParser(description="최신 블로그 실행 디렉토리 조회")
    parser.add_argument("--base-dir", default="homepage/blog", help="블로그 기본 디렉토리")
    args = parser.parse_args()

    result = latest_run(args.base_dir)
    if result:
        print(result)
    else:
        print("실행 기록 없음", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
