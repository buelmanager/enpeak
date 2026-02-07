# 블로그 워크플로우 단계별 가이드

사용자는 3개의 커맨드만 실행하면 전체 워크플로우가 완료된다.

## 세션 1: `/blog-collect` (Step 1 + Step 2 자동 체이닝)

### Step 1. 실행 초기화 + 소스 인덱싱

```bash
python3 homepage/blog/scripts/init_run.py
python3 homepage/blog/scripts/index_sources.py --run-dir {run_path} --source-dir .reference/contents
python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --phase collect --status completed
```

### Step 2. 인사이트 추출 (자동 이어서 실행)

`insight-extractor` 서브에이전트를 Task 도구로 호출:

```
Task(subagent_type="insight-extractor", prompt="run_dir: {run_path}")
```

에이전트가 `source-index.yaml`을 읽고 `insights/insights.yaml`을 생성.
완료 후 insight phase를 completed로 업데이트.

사용자에게 안내: **`/blog-review-insights` 실행해 주세요**

---

## 세션 2: `/blog-review-insights` (Step 3 + Step 4 + Step 5 자동 체이닝)

### Step 3. 인사이트 검토 (Human Checkpoint)

인사이트 목록을 표시하고, 사용자가 선택.
`selected/selected.yaml` 생성.

### Step 4. 리서치 (선택 후 자동 실행)

`selected.yaml`의 각 토픽에 대해 `topic-researcher` 서브에이전트를 **병렬** 호출:

```
# 토픽이 여러 개면 동시 호출
Task(subagent_type="topic-researcher", prompt="topic_slug: {slug1}, run_dir: {run_path}")
Task(subagent_type="topic-researcher", prompt="topic_slug: {slug2}, run_dir: {run_path}")
```

### Step 5. 개요 작성 (리서치 완료 후 자동 실행)

리서치 완료된 각 토픽에 대해 `outline-writer` 서브에이전트 호출:

```
Task(subagent_type="outline-writer", prompt="topic_slug: {slug}, run_dir: {run_path}")
```

사용자에게 안내: **`/blog-review-outlines` 실행해 주세요**

---

## 세션 3: `/blog-review-outlines` (Step 6 + Step 7 자동 체이닝)

### Step 6. 개요 검토 (Human Checkpoint)

개요를 표시하고, 각 개요에 대해 승인/수정요청/삭제 피드백 수집.
`feedback/{slug}.yaml` 생성.

### Step 7. 글 작성 (피드백 후 자동 실행)

승인 또는 수정요청된 토픽에 대해 `article-writer` 서브에이전트 호출 (opus 모델):

```
Task(subagent_type="article-writer", prompt="topic_slug: {slug}, run_dir: {run_path}", model="opus")
```

---

## 상태 관리

모든 단계 전후로 `update_status.py` 실행:

```bash
python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --phase research --status in_progress
python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --phase research --status completed
python3 homepage/blog/scripts/update_status.py --run-dir {run_path} --add-topic {slug} --topic-title "제목"
```

## 세션 복원

새 세션에서 이전 작업을 이어갈 때:

1. `list_runs.py`로 실행 목록 확인
2. `run.yaml` 읽어서 마지막 완료 phase 확인
3. 다음 phase부터 재개
