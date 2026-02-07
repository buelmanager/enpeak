# 블로그 워크플로우 데이터 스키마

## run.yaml

```yaml
created_at: "2026-02-07"
status: "initialized"  # initialized | in_progress | completed
phases:
  collect:
    status: "pending"     # pending | in_progress | completed | skipped
    started_at: null
    completed_at: null
  insight:
    status: "pending"
    started_at: null
    completed_at: null
  review_insights:
    status: "pending"
    started_at: null
    completed_at: null
  research:
    status: "pending"
    started_at: null
    completed_at: null
  outline:
    status: "pending"
    started_at: null
    completed_at: null
  review_outlines:
    status: "pending"
    started_at: null
    completed_at: null
  write:
    status: "pending"
    started_at: null
    completed_at: null
topics:
  - slug: "ai-agent-guide"
    title: "AI 에이전트 개발 가이드"
    added_at: "2026-02-07T10:00:00Z"
```

## source-index.yaml

```yaml
indexed_at: "2026-02-07"
count: 15
sources:
  - video_id: "abc123"
    title: "영상 제목"
    channel: "channelname"
    published_at: "2025-12-10T10:00:00Z"
    url: "https://youtube.com/watch?v=abc123"
    duration: "PT10M30S"
    has_transcript: true
    summary: |
      ## 서론
      - 내용 요약...
    source_path: ".reference/contents/channelname/abc123.yaml"
```

## insights.yaml

```yaml
extracted_at: "2026-02-07T10:30:00Z"
source_count: 15
insights:
  - id: "INS-001"
    title: "AI 에이전트가 소프트웨어 개발을 바꾸는 방법"
    summary: "여러 영상에서 공통적으로 다루는 AI 에이전트의 개발 프로세스 변화"
    sources:
      - video_id: "abc123"
        title: "영상 제목"
        relevance: "핵심 주제로 다룸"
    angles:
      - "개발자 생산성 향상 관점"
      - "코드 품질 변화 관점"
    tags: ["AI", "개발도구", "생산성"]
```

## selected.yaml

```yaml
selected_at: "2026-02-07T11:00:00Z"
topics:
  - insight_id: "INS-001"
    slug: "ai-agent-guide"
    title: "AI 에이전트가 소프트웨어 개발을 바꾸는 방법"
    angle: "개발자 생산성 향상 관점"
    user_note: "실무 사례 중심으로"
```

## research/{topic-slug}.yaml

```yaml
topic: "ai-agent-guide"
researched_at: "2026-02-07T12:00:00Z"
queries:
  - query: "AI agent software development 2026"
    language: "en"
  - query: "AI 에이전트 개발 도구 트렌드"
    language: "ko"
findings:
  trends:
    - point: "트렌드 내용"
      source: "출처 URL 또는 설명"
  expert_opinions:
    - who: "전문가 이름/출처"
      opinion: "의견 요약"
  statistics:
    - stat: "통계 수치"
      source: "출처"
  counterpoints:
    - point: "반론 내용"
      source: "출처"
  case_studies:
    - title: "사례 제목"
      summary: "사례 요약"
      source: "출처"
```

## outlines/{topic-slug}.yaml

```yaml
topic: "ai-agent-guide"
title: "AI 에이전트가 소프트웨어 개발을 바꾸는 방법"
created_at: "2026-02-07T13:00:00Z"
hook: "서두 훅 문장 - 독자를 끌어들이는 첫 문장"
sections:
  - heading: "섹션 제목"
    key_points:
      - point: "핵심 포인트"
        evidence: "근거 (리서치/영상 출처)"
    subsections:
      - heading: "소제목"
        key_points:
          - point: "핵심 포인트"
            evidence: "근거"
conclusion:
  summary: "핵심 요약 메시지"
  call_to_action: "독자 행동 유도"
seo:
  suggested_title: "SEO 최적화 제목"
  meta_description: "메타 설명 (160자 이내)"
  keywords: ["키워드1", "키워드2"]
estimated_length: "2500-3000자"
```

## feedback/{topic-slug}.yaml

```yaml
topic: "ai-agent-guide"
reviewed_at: "2026-02-07T14:00:00Z"
decision: "approved"  # approved | revision_requested | rejected
feedback: |
  자유 형식 피드백 텍스트
revision_notes:
  - section: "섹션 제목"
    note: "수정 요청 내용"
```

## YouTube 영상 원본 (참고)

`.reference/contents/{channel}/{video_id}.yaml` 구조는 `youtube-collector` 스킬의 `references/data-schema.md` 참조.

핵심 필드:
- `video_id`, `title`, `published_at`, `url`, `duration`
- `transcript.available`, `transcript.text` (전문)
- `summary.source`, `summary.content` (AI 생성 요약)
