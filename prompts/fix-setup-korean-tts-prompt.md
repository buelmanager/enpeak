# Talk 페이지 한국어 상황 설정 + TTS 수정 프롬프트

## 상황
- Talk 페이지 이동 -> AI 첫번째 대화 -> 유저가 상황 답변 -> AI 두번째 대화에서 한글이 아닌 영어로 답변하는 버그

## 수정내용

### 수정 5: 상황 설정 페이지 한국어 강제
- 상황 설정하는 페이지에서는 모든 대화를 한국어로 하도록 (AI, 유저 모두)

### 수정 6: 한국어 TTS 피치 수정
- AI가 한글 TTS를 하는 음성의 피치가 너무 높은데, 좀더 자연스러운 목소리로 수정

### 수정 7: Edge TTS 설정 기능 추가
- 설정에서 Edge TTS에 대한 설정하는 기능을 추가

### 수정 8: 기존 TTS 설정 삭제
- 기존의 TTS 설정은 삭제 (기기 음성 모드 제거)

### 수정 9: 자체 검증
- 수정완료 후 검증을 자체적으로 수행

## 수정된 파일
- `backend/api/chat.py` - system_prompt 조건부 처리
- `frontend/src/contexts/TTSContext.tsx` - 한국어 피치 1.0, localStorage 마이그레이션
- `frontend/src/components/TTSSettingsModal.tsx` - HD 음성 전용으로 단순화
- `frontend/src/app/my/page.tsx` - 설정 버튼 텍스트 변경
