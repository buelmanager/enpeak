#!/usr/bin/env python3
"""문법 패턴 및 추가 문장 데이터 생성 - 500개+"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "rag_chunks" / "patterns_chunks.json"

GRAMMAR_PATTERNS = [
    # 기본 문형
    ("I am + adjective", "I am happy.", "나는 행복해요.", "A1", "be동사 + 형용사"),
    ("I am + noun", "I am a student.", "나는 학생이에요.", "A1", "be동사 + 명사"),
    ("I have + noun", "I have a car.", "나는 차가 있어요.", "A1", "have + 명사"),
    ("I like + noun/verb-ing", "I like coffee.", "나는 커피를 좋아해요.", "A1", "like + 명사/동명사"),
    ("I want to + verb", "I want to sleep.", "나는 자고 싶어요.", "A1", "want to + 동사원형"),
    ("I need to + verb", "I need to study.", "나는 공부해야 해요.", "A1", "need to + 동사원형"),
    ("I can + verb", "I can swim.", "나는 수영할 수 있어요.", "A1", "can + 동사원형"),
    ("There is/are + noun", "There is a book.", "책이 있어요.", "A1", "There is/are"),
    ("Do you + verb?", "Do you like it?", "좋아해요?", "A1", "일반 의문문"),
    ("What do you + verb?", "What do you do?", "뭐 해요?", "A1", "What 의문문"),

    # A2 패턴
    ("I'm going to + verb", "I'm going to travel.", "여행 갈 거예요.", "A2", "미래 표현"),
    ("I used to + verb", "I used to play piano.", "예전에 피아노 쳤어요.", "A2", "과거 습관"),
    ("I have + past participle", "I have finished.", "끝냈어요.", "A2", "현재완료"),
    ("If + present, will + verb", "If it rains, I will stay.", "비 오면 있을게요.", "A2", "1차 조건문"),
    ("Would you like to + verb?", "Would you like to join?", "함께 하실래요?", "A2", "권유 표현"),
    ("Could you + verb?", "Could you help me?", "도와주실래요?", "A2", "정중한 요청"),
    ("I should + verb", "I should go.", "가야 해요.", "A2", "should"),
    ("I might + verb", "I might come.", "갈지도 몰라요.", "A2", "might"),
    ("Too + adjective + to verb", "Too tired to work.", "너무 피곤해서 일 못해요.", "A2", "too...to"),
    ("Adjective + enough to verb", "Old enough to vote.", "투표할 나이예요.", "A2", "enough to"),

    # B1 패턴
    ("I wish I could + verb", "I wish I could fly.", "날 수 있으면 좋겠어요.", "B1", "wish + 과거형"),
    ("If I were you, I would", "If I were you, I'd quit.", "내가 너라면 그만둘 거야.", "B1", "2차 조건문"),
    ("I've been + verb-ing", "I've been waiting.", "기다리고 있었어요.", "B1", "현재완료진행"),
    ("The + comparative, the + comparative", "The more, the better.", "많을수록 좋아.", "B1", "비교급"),
    ("Not only... but also", "Not only smart but also kind.", "똑똑할 뿐 아니라 친절해.", "B1", "상관접속사"),
    ("As soon as + clause", "As soon as I arrive.", "도착하자마자.", "B1", "시간 접속사"),
    ("Although + clause", "Although it's late.", "늦었지만.", "B1", "양보 접속사"),
    ("Unless + clause", "Unless you hurry.", "서두르지 않으면.", "B1", "조건 접속사"),
    ("In order to + verb", "In order to succeed.", "성공하기 위해.", "B1", "목적 표현"),
    ("It seems that + clause", "It seems that he left.", "그가 떠난 것 같아.", "B1", "추측 표현"),

    # B2 패턴
    ("Had I known, I would have", "Had I known, I'd have helped.", "알았더라면 도왔을 텐데.", "B2", "3차 조건문 도치"),
    ("No sooner... than", "No sooner had I arrived than it rained.", "도착하자마자 비가 왔다.", "B2", "도치"),
    ("Hardly... when", "Hardly had I sat when he called.", "앉자마자 전화왔다.", "B2", "도치"),
    ("Were it not for", "Were it not for you.", "네가 아니었다면.", "B2", "가정법 도치"),
    ("It's high time + past", "It's high time we left.", "이제 떠날 때야.", "B2", "It's time"),
    ("I'd rather + verb", "I'd rather stay.", "차라리 있을래.", "B2", "would rather"),
    ("Supposing + clause", "Supposing it fails.", "실패한다면.", "B2", "가정"),
    ("Provided that + clause", "Provided that you agree.", "동의한다면.", "B2", "조건"),
    ("On condition that", "On condition that you pay.", "지불한다는 조건으로.", "B2", "조건"),
    ("Not until... did", "Not until then did I know.", "그때서야 알았다.", "B2", "도치"),
]

USEFUL_SENTENCES = [
    # 일상 문장
    ("Let me know when you're ready.", "준비되면 알려줘.", "daily", "A2"),
    ("Feel free to ask questions.", "질문 있으면 편하게 해.", "daily", "B1"),
    ("Take your time.", "천천히 해.", "daily", "A1"),
    ("That sounds good to me.", "좋은 것 같아.", "daily", "A2"),
    ("I'll think about it.", "생각해 볼게.", "daily", "A2"),
    ("It's up to you.", "네가 결정해.", "daily", "A2"),
    ("I don't mind.", "상관없어.", "daily", "A2"),
    ("That makes two of us.", "나도 그래.", "daily", "B1"),
    ("You can say that again.", "정말 그래.", "daily", "B1"),
    ("Don't get me wrong.", "오해하지 마.", "daily", "B1"),

    # 비즈니스 문장
    ("I'll get back to you on that.", "그건 확인 후 연락드릴게요.", "business", "B1"),
    ("Let me clarify.", "분명히 말씀드리자면.", "business", "B1"),
    ("Moving forward...", "앞으로...", "business", "B1"),
    ("At this point in time...", "현 시점에서...", "business", "B2"),
    ("Going forward...", "향후에...", "business", "B2"),
    ("To put it simply...", "간단히 말하면...", "business", "B1"),
    ("If I may add...", "덧붙이자면...", "business", "B2"),
    ("In light of recent events...", "최근 상황을 고려하면...", "business", "B2"),
    ("As per our discussion...", "우리 논의대로...", "business", "B2"),
    ("For your reference...", "참고로...", "business", "B1"),

    # 여행 문장
    ("Is this the right way to...?", "...가는 길이 맞나요?", "travel", "A2"),
    ("How far is it from here?", "여기서 얼마나 멀어요?", "travel", "A2"),
    ("Can you show me on the map?", "지도에서 보여줄 수 있어요?", "travel", "A2"),
    ("I'm looking for...", "...를 찾고 있어요.", "travel", "A1"),
    ("Do I need a reservation?", "예약이 필요한가요?", "travel", "A2"),
    ("What time does it close?", "몇 시에 닫아요?", "travel", "A2"),
    ("Is it within walking distance?", "걸어갈 수 있는 거리예요?", "travel", "B1"),
    ("Are there any discounts for students?", "학생 할인 있나요?", "travel", "A2"),
    ("Could you take a photo of us?", "사진 찍어주실 수 있나요?", "travel", "A2"),
    ("What's the local specialty?", "이 지역 특산품이 뭐예요?", "travel", "B1"),

    # 의견 표현
    ("From my perspective...", "제 관점에서는...", "opinion", "B1"),
    ("To be honest...", "솔직히 말해서...", "opinion", "A2"),
    ("As far as I know...", "제가 아는 한...", "opinion", "B1"),
    ("Correct me if I'm wrong...", "틀리면 말해줘...", "opinion", "B1"),
    ("That's a fair point.", "그건 일리 있어.", "opinion", "B1"),
    ("I tend to think that...", "저는 ...라고 생각하는 편이에요.", "opinion", "B2"),
    ("It goes without saying that...", "...는 말할 것도 없죠.", "opinion", "B2"),
    ("Needless to say...", "말할 필요도 없이...", "opinion", "B2"),
    ("As a matter of fact...", "사실은...", "opinion", "B1"),
    ("The way I see it...", "제가 보기에는...", "opinion", "B1"),

    # 감정 표현
    ("I'm over the moon!", "너무 기뻐!", "emotion", "B1"),
    ("I'm on cloud nine.", "행복해서 날아갈 것 같아.", "emotion", "B1"),
    ("I'm fed up with this.", "이건 질렸어.", "emotion", "B1"),
    ("I'm a bit under the weather.", "좀 아파.", "emotion", "B1"),
    ("I'm at my wit's end.", "어쩔 줄 모르겠어.", "emotion", "B2"),
    ("I can't get over it.", "잊을 수가 없어.", "emotion", "B1"),
    ("It breaks my heart.", "가슴이 아파.", "emotion", "B1"),
    ("I'm losing my mind.", "미치겠어.", "emotion", "B1"),
    ("I'm on edge.", "불안해.", "emotion", "B1"),
    ("I'm beat.", "지쳤어.", "emotion", "A2"),

    # 추가 일상
    ("It slipped my mind.", "깜빡했어.", "daily", "B1"),
    ("Let's play it by ear.", "봐가면서 하자.", "daily", "B1"),
    ("I'm in two minds.", "결정 못 하겠어.", "daily", "B1"),
    ("That rings a bell.", "어디서 들어본 것 같아.", "daily", "B1"),
    ("I'll sleep on it.", "자고 생각해볼게.", "daily", "B1"),
    ("Count me in.", "나도 낄게.", "daily", "A2"),
    ("It's not my cup of tea.", "내 취향이 아니야.", "daily", "B1"),
    ("I'm all ears.", "다 듣고 있어.", "daily", "B1"),
    ("Break a leg!", "행운을 빌어!", "daily", "B1"),
    ("Keep it up!", "계속해!", "daily", "A2"),
]

def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    chunks = []

    # 문법 패턴
    for pattern, example, korean, level, desc in GRAMMAR_PATTERNS:
        chunk = {
            "id": f"pattern_{len(chunks)}",
            "text": f"{pattern}: {example} ({korean})",
            "pattern": pattern,
            "example": example,
            "korean": korean,
            "type": "grammar_pattern",
            "level": level,
            "description": desc,
            "source": "generated_patterns",
            "category": "grammar"
        }
        chunks.append(chunk)

    # 유용한 문장
    for english, korean, category, level in USEFUL_SENTENCES:
        chunk = {
            "id": f"sentence_{len(chunks)}",
            "text": f"{english} - {korean}",
            "english": english,
            "korean": korean,
            "type": "useful_sentence",
            "category": category,
            "level": level,
            "source": "generated_sentences"
        }
        chunks.append(chunk)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"총 {len(chunks)}개 청크 생성")
    print(f"- 문법 패턴: {len(GRAMMAR_PATTERNS)}")
    print(f"- 유용한 문장: {len(USEFUL_SENTENCES)}")
    print(f"저장: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
