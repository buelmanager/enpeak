#!/usr/bin/env python3
"""
run.yaml 상태 업데이트

Usage:
    python update_status.py --run-dir homepage/blog/runs/2026-02-07 --phase insight --status completed
    python update_status.py --run-dir homepage/blog/runs/2026-02-07 --add-topic "ai-agent" --topic-title "AI 에이전트 가이드"

Output:
    JSON 형식으로 업데이트 결과 출력
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    print(json.dumps({"error": "pyyaml 미설치", "install": "pip install pyyaml"}))
    sys.exit(1)

VALID_PHASES = ["collect", "insight", "review_insights", "research", "outline", "review_outlines", "write"]
VALID_STATUSES = ["pending", "in_progress", "completed", "skipped"]


def update_status(run_dir: str, phase: str = None, status: str = None, topic_slug: str = None, topic_title: str = None) -> dict:
    run_path = Path(run_dir) / "run.yaml"

    if not run_path.exists():
        return {"error": f"run.yaml 없음: {run_path}"}

    with open(run_path, "r", encoding="utf-8") as f:
        run_data = yaml.safe_load(f) or {}

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    if phase and status:
        if phase not in VALID_PHASES:
            return {"error": f"유효하지 않은 phase: {phase}", "valid": VALID_PHASES}
        if status not in VALID_STATUSES:
            return {"error": f"유효하지 않은 status: {status}", "valid": VALID_STATUSES}

        phases = run_data.setdefault("phases", {})
        phase_data = phases.setdefault(phase, {})
        phase_data["status"] = status

        if status == "in_progress" and not phase_data.get("started_at"):
            phase_data["started_at"] = now
        elif status == "completed":
            phase_data["completed_at"] = now

        all_statuses = [p.get("status") for p in phases.values()]
        if all(s == "completed" or s == "skipped" for s in all_statuses):
            run_data["status"] = "completed"
        elif any(s == "in_progress" for s in all_statuses):
            run_data["status"] = "in_progress"

    if topic_slug:
        topics = run_data.setdefault("topics", [])
        existing_slugs = {t["slug"] for t in topics}
        if topic_slug not in existing_slugs:
            topics.append({
                "slug": topic_slug,
                "title": topic_title or topic_slug,
                "added_at": now,
            })

    with open(run_path, "w", encoding="utf-8") as f:
        yaml.dump(run_data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    return {"status": "updated", "run_dir": run_dir, "run_data": run_data}


def main():
    parser = argparse.ArgumentParser(description="run.yaml 상태 업데이트")
    parser.add_argument("--run-dir", required=True, help="실행 디렉토리 경로")
    parser.add_argument("--phase", choices=VALID_PHASES, help="업데이트할 phase")
    parser.add_argument("--status", choices=VALID_STATUSES, help="새 상태")
    parser.add_argument("--add-topic", dest="topic_slug", help="추가할 토픽 slug")
    parser.add_argument("--topic-title", help="토픽 제목")
    args = parser.parse_args()

    if not args.phase and not args.topic_slug:
        print(json.dumps({"error": "--phase 또는 --add-topic 중 하나 필요"}))
        sys.exit(1)

    result = update_status(args.run_dir, args.phase, args.status, args.topic_slug, args.topic_title)
    print(json.dumps(result, ensure_ascii=False, indent=2, default=str))

    if "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
