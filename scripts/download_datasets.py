"""
오픈소스 데이터셋 다운로드 및 변환
- MultiWOZ 2.2: 호텔, 레스토랑, 여행 대화
- Tatoeba: 영어-한국어 예문
- DialogSum: 일상 대화 요약

목표: 5000+ 청크 RAG용 데이터
"""

import json
import os
from pathlib import Path
from typing import List, Dict

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "rag_chunks"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def download_multiwoz():
    """MultiWOZ 2.2 다운로드 및 변환"""
    print("\n" + "=" * 60)
    print("MultiWOZ 2.2 다운로드 중...")
    print("=" * 60)

    try:
        from datasets import load_dataset
        dataset = load_dataset("pfb30/multi_woz_v22", trust_remote_code=True)

        chunks = []
        domains = ["hotel", "restaurant", "attraction", "taxi", "train"]

        for split in ["train", "validation"]:
            for item in dataset[split]:
                services = item.get("services", [])

                # 대화 추출
                turns = item.get("turns", {})
                utterances = turns.get("utterance", [])
                speakers = turns.get("speaker", [])

                if not utterances:
                    continue

                # 대화를 청크로 변환
                dialogue_text = []
                for i, (utt, speaker) in enumerate(zip(utterances, speakers)):
                    role = "System" if speaker == 1 else "User"
                    dialogue_text.append(f"{role}: {utt}")

                # 도메인별 분류
                for domain in services:
                    if domain in domains:
                        chunk = {
                            "id": f"multiwoz_{item.get('dialogue_id', '')}_{domain}",
                            "source": "multiwoz",
                            "domain": domain,
                            "category": map_domain_to_category(domain),
                            "type": "dialogue",
                            "content": "\n".join(dialogue_text),
                            "metadata": {
                                "turns": len(utterances),
                                "services": services
                            }
                        }
                        chunks.append(chunk)

                if len(chunks) >= 2000:  # 최대 2000개
                    break

            if len(chunks) >= 2000:
                break

        print(f"MultiWOZ: {len(chunks)} 청크 생성")
        return chunks

    except Exception as e:
        print(f"MultiWOZ 로드 실패: {e}")
        return []


def download_dialogsum():
    """DialogSum 다운로드 및 변환"""
    print("\n" + "=" * 60)
    print("DialogSum 다운로드 중...")
    print("=" * 60)

    try:
        from datasets import load_dataset
        dataset = load_dataset("knkarthick/dialogsum")

        chunks = []

        for item in dataset["train"]:
            dialogue = item.get("dialogue", "")
            summary = item.get("summary", "")
            topic = item.get("topic", "general")

            if dialogue:
                chunk = {
                    "id": f"dialogsum_{item.get('id', len(chunks))}",
                    "source": "dialogsum",
                    "domain": "daily",
                    "category": "daily",
                    "type": "dialogue",
                    "content": dialogue,
                    "summary": summary,
                    "metadata": {
                        "topic": topic
                    }
                }
                chunks.append(chunk)

            if len(chunks) >= 1500:
                break

        print(f"DialogSum: {len(chunks)} 청크 생성")
        return chunks

    except Exception as e:
        print(f"DialogSum 로드 실패: {e}")
        return []


def download_tatoeba():
    """Tatoeba 영어-한국어 문장 다운로드"""
    print("\n" + "=" * 60)
    print("Tatoeba 영어-한국어 문장 다운로드 중...")
    print("=" * 60)

    try:
        from datasets import load_dataset
        dataset = load_dataset("tatoeba", lang1="en", lang2="ko")

        chunks = []

        for item in dataset["train"]:
            translation = item.get("translation", {})
            en = translation.get("en", "")
            ko = translation.get("ko", "")

            if en and ko and len(en) > 5:
                # 카테고리 자동 분류
                category = categorize_sentence(en)
                level = estimate_level(en)

                chunk = {
                    "id": f"tatoeba_{len(chunks)}",
                    "source": "tatoeba",
                    "domain": category,
                    "category": category,
                    "type": "sentence_pair",
                    "content": en,
                    "translation": ko,
                    "metadata": {
                        "level": level,
                        "word_count": len(en.split())
                    }
                }
                chunks.append(chunk)

            if len(chunks) >= 2000:
                break

        print(f"Tatoeba: {len(chunks)} 청크 생성")
        return chunks

    except Exception as e:
        print(f"Tatoeba 로드 실패: {e}")
        return generate_fallback_sentences()


def map_domain_to_category(domain: str) -> str:
    """도메인을 카테고리로 매핑"""
    mapping = {
        "hotel": "travel",
        "restaurant": "daily",
        "attraction": "travel",
        "taxi": "travel",
        "train": "travel",
        "bus": "travel",
        "hospital": "daily",
        "police": "emergency"
    }
    return mapping.get(domain, "daily")


def categorize_sentence(sentence: str) -> str:
    """문장 카테고리 자동 분류"""
    s = sentence.lower()

    if any(w in s for w in ["hotel", "reservation", "book", "room", "check-in"]):
        return "travel"
    elif any(w in s for w in ["restaurant", "food", "eat", "menu", "order", "coffee"]):
        return "food"
    elif any(w in s for w in ["airport", "flight", "plane", "ticket", "boarding"]):
        return "travel"
    elif any(w in s for w in ["work", "office", "meeting", "boss", "job", "salary"]):
        return "business"
    elif any(w in s for w in ["doctor", "hospital", "sick", "pain", "medicine"]):
        return "health"
    elif any(w in s for w in ["shop", "buy", "price", "store", "sale"]):
        return "shopping"
    elif any(w in s for w in ["hello", "hi", "bye", "thank", "sorry", "please"]):
        return "greeting"
    else:
        return "daily"


def estimate_level(sentence: str) -> str:
    """문장 난이도 추정"""
    words = sentence.split()
    word_count = len(words)

    # 복잡한 단어/구문 체크
    advanced_words = ["although", "however", "nevertheless", "consequently",
                      "furthermore", "whereas", "moreover", "therefore"]
    has_advanced = any(w.lower() in advanced_words for w in words)

    if word_count <= 5:
        return "A1"
    elif word_count <= 10 and not has_advanced:
        return "A2"
    elif word_count <= 15:
        return "B1"
    elif word_count <= 20 or has_advanced:
        return "B2"
    else:
        return "C1"


def generate_fallback_sentences() -> List[Dict]:
    """Tatoeba 로드 실패시 대체 데이터"""
    print("대체 예문 데이터 생성 중...")

    # 기본 예문 (확장)
    basic_sentences = [
        ("Hello, how are you?", "안녕하세요, 어떻게 지내세요?", "greeting", "A1"),
        ("I'm fine, thank you.", "잘 지내요, 감사합니다.", "greeting", "A1"),
        ("What's your name?", "이름이 뭐예요?", "greeting", "A1"),
        ("Nice to meet you.", "만나서 반가워요.", "greeting", "A1"),
        ("Where are you from?", "어디서 왔어요?", "greeting", "A1"),
        ("I'm from Korea.", "한국에서 왔어요.", "greeting", "A1"),
        ("Can you help me?", "도와주실 수 있나요?", "request", "A1"),
        ("How much is this?", "이거 얼마예요?", "shopping", "A1"),
        ("Where is the bathroom?", "화장실 어디예요?", "daily", "A1"),
        ("I don't understand.", "이해가 안 돼요.", "daily", "A1"),

        ("Could you speak more slowly?", "좀 더 천천히 말씀해 주시겠어요?", "request", "A2"),
        ("I'd like to make a reservation.", "예약하고 싶어요.", "travel", "A2"),
        ("What time does it open?", "몇 시에 열어요?", "daily", "A2"),
        ("Can I pay by credit card?", "카드로 결제할 수 있나요?", "shopping", "A2"),
        ("I'm looking for a hotel.", "호텔을 찾고 있어요.", "travel", "A2"),
        ("How long does it take?", "얼마나 걸려요?", "travel", "A2"),
        ("Could you recommend something?", "뭔가 추천해 주시겠어요?", "request", "A2"),
        ("I have a reservation under Kim.", "김으로 예약했어요.", "travel", "A2"),
        ("What's the WiFi password?", "와이파이 비밀번호가 뭐예요?", "daily", "A2"),
        ("Is breakfast included?", "조식 포함인가요?", "travel", "A2"),

        ("I apologize for the inconvenience.", "불편을 드려 죄송합니다.", "business", "B1"),
        ("Would you mind if I sat here?", "여기 앉아도 될까요?", "daily", "B1"),
        ("I'm afraid there's been a mistake.", "실수가 있었던 것 같아요.", "business", "B1"),
        ("Could you elaborate on that point?", "그 점에 대해 자세히 설명해 주시겠어요?", "business", "B1"),
        ("In my opinion, this is the best option.", "제 생각에는 이게 최선의 선택이에요.", "opinion", "B1"),
        ("I'm looking forward to working with you.", "함께 일하게 되어 기대됩니다.", "business", "B1"),
        ("Let me check my schedule and get back to you.", "일정 확인하고 다시 연락드릴게요.", "business", "B1"),
        ("I'd appreciate it if you could send me the details.", "상세 내용을 보내주시면 감사하겠습니다.", "business", "B1"),

        ("Notwithstanding the challenges, we achieved our goals.", "어려움에도 불구하고 목표를 달성했습니다.", "business", "B2"),
        ("I would be inclined to disagree with that assessment.", "그 평가에 동의하지 않는 편입니다.", "opinion", "B2"),
        ("The implications of this decision are far-reaching.", "이 결정의 영향은 광범위합니다.", "business", "B2"),
        ("We need to take into account various factors.", "다양한 요소를 고려해야 합니다.", "business", "B2"),
    ]

    chunks = []
    for i, (en, ko, category, level) in enumerate(basic_sentences):
        chunks.append({
            "id": f"fallback_{i}",
            "source": "generated",
            "domain": category,
            "category": category,
            "type": "sentence_pair",
            "content": en,
            "translation": ko,
            "metadata": {
                "level": level,
                "word_count": len(en.split())
            }
        })

    return chunks


def create_vocabulary_chunks() -> List[Dict]:
    """기존 단어 데이터를 청크로 변환"""
    print("\n" + "=" * 60)
    print("단어 데이터 청크화...")
    print("=" * 60)

    vocab_file = Path(__file__).parent.parent / "data" / "collected" / "vocabulary" / "vocabulary_all.json"

    chunks = []

    if vocab_file.exists():
        with open(vocab_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        for word_data in data.get("words", []):
            chunk = {
                "id": f"vocab_{word_data['word']}",
                "source": "vocabulary",
                "domain": "vocabulary",
                "category": "vocabulary",
                "type": "vocabulary",
                "content": f"{word_data['word']}: {word_data.get('meaning', '')}",
                "word": word_data["word"],
                "meaning": word_data.get("meaning", ""),
                "example": word_data.get("example", ""),
                "metadata": {
                    "level": word_data.get("level", "A1"),
                    "pos": word_data.get("pos", "")
                }
            }
            chunks.append(chunk)

    print(f"단어: {len(chunks)} 청크 생성")
    return chunks


def create_idiom_chunks() -> List[Dict]:
    """기존 숙어 데이터를 청크로 변환"""
    print("\n" + "=" * 60)
    print("숙어 데이터 청크화...")
    print("=" * 60)

    idioms_file = Path(__file__).parent.parent / "data" / "collected" / "idioms" / "all_expressions.json"

    chunks = []

    if idioms_file.exists():
        with open(idioms_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 숙어
        for idiom in data.get("idioms", []):
            chunk = {
                "id": f"idiom_{idiom['idiom'].replace(' ', '_')}",
                "source": "idioms",
                "domain": idiom.get("category", "daily"),
                "category": "expression",
                "type": "idiom",
                "content": f"{idiom['idiom']}: {idiom.get('meaning', '')}",
                "expression": idiom["idiom"],
                "meaning": idiom.get("meaning", ""),
                "example": idiom.get("example", ""),
                "metadata": {
                    "difficulty": idiom.get("difficulty", "intermediate")
                }
            }
            chunks.append(chunk)

        # 동사구
        for pv in data.get("phrasal_verbs", []):
            chunk = {
                "id": f"pv_{pv['verb'].replace(' ', '_')}",
                "source": "phrasal_verbs",
                "domain": "daily",
                "category": "expression",
                "type": "phrasal_verb",
                "content": f"{pv['verb']}: {pv.get('meaning', '')}",
                "expression": pv["verb"],
                "meaning": pv.get("meaning", ""),
                "examples": pv.get("examples", []),
                "metadata": {
                    "difficulty": pv.get("difficulty", "intermediate")
                }
            }
            chunks.append(chunk)

    print(f"숙어/동사구: {len(chunks)} 청크 생성")
    return chunks


def create_scenario_chunks() -> List[Dict]:
    """기존 시나리오를 청크로 변환"""
    print("\n" + "=" * 60)
    print("시나리오 데이터 청크화...")
    print("=" * 60)

    scenarios_dir = Path(__file__).parent.parent / "data" / "scenarios"

    chunks = []

    for json_file in scenarios_dir.glob("*.json"):
        if json_file.name.startswith("_"):
            continue

        with open(json_file, "r", encoding="utf-8") as f:
            scenario = json.load(f)

        # 시나리오 메타데이터 청크
        chunk = {
            "id": f"scenario_{scenario['id']}",
            "source": "scenarios",
            "domain": scenario.get("category", "daily"),
            "category": "scenario",
            "type": "scenario",
            "content": f"{scenario['title']}: {scenario.get('title_ko', '')}",
            "title": scenario["title"],
            "title_ko": scenario.get("title_ko", ""),
            "metadata": {
                "difficulty": scenario.get("difficulty", "intermediate"),
                "stages": len(scenario.get("stages", [])),
                "roles": scenario.get("roles", {})
            }
        }
        chunks.append(chunk)

        # 각 스테이지를 청크로
        for stage in scenario.get("stages", []):
            stage_chunk = {
                "id": f"scenario_{scenario['id']}_stage_{stage['stage']}",
                "source": "scenarios",
                "domain": scenario.get("category", "daily"),
                "category": "dialogue",
                "type": "scenario_stage",
                "content": stage.get("ai_opening", "") or stage.get("ai_prompt", ""),
                "learning_tip": stage.get("learning_tip", ""),
                "suggested_responses": stage.get("suggested_responses", []),
                "metadata": {
                    "scenario_id": scenario["id"],
                    "stage": stage["stage"],
                    "stage_name": stage.get("name", "")
                }
            }
            chunks.append(stage)

        # 핵심 어휘 청크
        for vocab in scenario.get("key_vocabulary", []):
            vocab_chunk = {
                "id": f"scenario_{scenario['id']}_vocab_{vocab['word'].replace(' ', '_')}",
                "source": "scenario_vocabulary",
                "domain": scenario.get("category", "daily"),
                "category": "vocabulary",
                "type": "scenario_vocabulary",
                "content": f"{vocab['word']}: {vocab.get('meaning', '')}",
                "word": vocab["word"],
                "meaning": vocab.get("meaning", ""),
                "example": vocab.get("example", ""),
                "metadata": {
                    "scenario_id": scenario["id"]
                }
            }
            chunks.append(vocab_chunk)

    print(f"시나리오: {len(chunks)} 청크 생성")
    return chunks


def save_chunks(chunks: List[Dict], filename: str):
    """청크 저장"""
    filepath = OUTPUT_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"저장: {filepath} ({len(chunks)} 청크)")


def main():
    print("=" * 60)
    print("EnPeak RAG 데이터 수집 및 청크화")
    print("목표: 5000+ 청크")
    print("=" * 60)

    all_chunks = []

    # 1. 오픈소스 데이터셋 다운로드
    multiwoz_chunks = download_multiwoz()
    all_chunks.extend(multiwoz_chunks)
    save_chunks(multiwoz_chunks, "multiwoz_chunks.json")

    dialogsum_chunks = download_dialogsum()
    all_chunks.extend(dialogsum_chunks)
    save_chunks(dialogsum_chunks, "dialogsum_chunks.json")

    tatoeba_chunks = download_tatoeba()
    all_chunks.extend(tatoeba_chunks)
    save_chunks(tatoeba_chunks, "tatoeba_chunks.json")

    # 2. 기존 데이터 청크화
    vocab_chunks = create_vocabulary_chunks()
    all_chunks.extend(vocab_chunks)
    save_chunks(vocab_chunks, "vocabulary_chunks.json")

    idiom_chunks = create_idiom_chunks()
    all_chunks.extend(idiom_chunks)
    save_chunks(idiom_chunks, "idiom_chunks.json")

    scenario_chunks = create_scenario_chunks()
    all_chunks.extend(scenario_chunks)
    save_chunks(scenario_chunks, "scenario_chunks.json")

    # 3. 전체 통합 파일
    save_chunks(all_chunks, "all_chunks.json")

    # 4. 통계
    print("\n" + "=" * 60)
    print("최종 통계")
    print("=" * 60)

    # 소스별 통계
    source_stats = {}
    for chunk in all_chunks:
        source = chunk.get("source", "unknown")
        source_stats[source] = source_stats.get(source, 0) + 1

    print("\n소스별:")
    for source, count in sorted(source_stats.items(), key=lambda x: -x[1]):
        print(f"  {source}: {count}")

    # 카테고리별 통계
    category_stats = {}
    for chunk in all_chunks:
        cat = chunk.get("category", "unknown")
        category_stats[cat] = category_stats.get(cat, 0) + 1

    print("\n카테고리별:")
    for cat, count in sorted(category_stats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    print(f"\n총 청크 수: {len(all_chunks)}")
    print("=" * 60)

    return len(all_chunks)


if __name__ == "__main__":
    total = main()
    if total >= 5000:
        print("\n✓ 목표 달성! 5000+ 청크 수집 완료")
    else:
        print(f"\n현재 {total}개 청크. 추가 데이터 수집 필요.")
