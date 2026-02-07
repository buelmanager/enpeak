---
description: 블로그 워크플로우 Step 1 + 2 - 소스 수집 후 인사이트 추출까지 자동 실행
allowed-tools: Bash(python3:*), Task
---

## Task

블로그 워크플로우를 시작한다. 소스 수집(Step 1)과 인사이트 추출(Step 2)을 자동으로 체이닝하여 실행한다.

### Step 1: 실행 초기화 + 소스 인덱싱

1. 실행 디렉토리 초기화:
   ```bash
   python3 homepage/blog/scripts/init_run.py
   ```

2. 출력된 JSON에서 `run_path` 확인 후, 소스 인덱싱:
   ```bash
   python3 homepage/blog/scripts/index_sources.py --run-dir {run_path} --source-dir .reference/contents
   ```

3. 상태 업데이트:
   ```bash
   python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --phase collect --status completed
   ```

4. 인덱싱 결과 요약을 사용자에게 표시 (인덱싱된 영상 수, 채널 수)

### Step 2: 인사이트 추출 (자동 이어서 실행)

5. 상태 업데이트:
   ```bash
   python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --phase insight --status in_progress
   ```

6. `insight-extractor` 서브에이전트를 Task 도구로 호출:
   ```
   Task(subagent_type="insight-extractor", prompt="run_dir: {run_path}")
   ```

7. 서브에이전트 완료 후 상태 업데이트:
   ```bash
   python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --phase insight --status completed
   ```

8. 결과 요약:
   - 추출된 인사이트 수
   - 다음 단계 안내: **`/blog-review-insights` 를 실행하여 인사이트를 검토하고 블로그 주제를 선택하세요.**
