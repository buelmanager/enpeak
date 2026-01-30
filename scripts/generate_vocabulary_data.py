"""
레벨별 단어 데이터 생성 (A1-C2)
약 2000개 단어 + 예문
"""

import json
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "data" / "collected" / "vocabulary"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CEFR 레벨별 핵심 단어 (각 레벨 300-400개)
VOCABULARY_BY_LEVEL = {
    "A1": {
        "description": "Beginner - 기초 일상 단어",
        "words": [
            # 인사/기본
            {"word": "hello", "meaning": "안녕하세요", "pos": "interjection", "example": "Hello, how are you?"},
            {"word": "goodbye", "meaning": "안녕히 가세요", "pos": "interjection", "example": "Goodbye, see you tomorrow!"},
            {"word": "please", "meaning": "제발, 부디", "pos": "adverb", "example": "Please help me."},
            {"word": "thank you", "meaning": "감사합니다", "pos": "phrase", "example": "Thank you very much."},
            {"word": "sorry", "meaning": "미안합니다", "pos": "adjective", "example": "I'm sorry for being late."},
            {"word": "yes", "meaning": "네", "pos": "adverb", "example": "Yes, I understand."},
            {"word": "no", "meaning": "아니요", "pos": "adverb", "example": "No, thank you."},

            # 숫자
            {"word": "one", "meaning": "하나, 1", "pos": "number", "example": "I have one sister."},
            {"word": "two", "meaning": "둘, 2", "pos": "number", "example": "Two coffees, please."},
            {"word": "three", "meaning": "셋, 3", "pos": "number", "example": "I waited three hours."},
            {"word": "ten", "meaning": "열, 10", "pos": "number", "example": "It costs ten dollars."},
            {"word": "hundred", "meaning": "백, 100", "pos": "number", "example": "There are a hundred people."},

            # 시간
            {"word": "today", "meaning": "오늘", "pos": "adverb", "example": "I'm busy today."},
            {"word": "tomorrow", "meaning": "내일", "pos": "adverb", "example": "See you tomorrow."},
            {"word": "yesterday", "meaning": "어제", "pos": "adverb", "example": "I went there yesterday."},
            {"word": "now", "meaning": "지금", "pos": "adverb", "example": "I'm eating now."},
            {"word": "morning", "meaning": "아침", "pos": "noun", "example": "Good morning!"},
            {"word": "night", "meaning": "밤", "pos": "noun", "example": "Good night!"},
            {"word": "week", "meaning": "주", "pos": "noun", "example": "I'll call you next week."},
            {"word": "month", "meaning": "달, 월", "pos": "noun", "example": "This month is very busy."},
            {"word": "year", "meaning": "년, 해", "pos": "noun", "example": "Happy New Year!"},

            # 사람/가족
            {"word": "man", "meaning": "남자", "pos": "noun", "example": "The man is tall."},
            {"word": "woman", "meaning": "여자", "pos": "noun", "example": "The woman is kind."},
            {"word": "child", "meaning": "아이", "pos": "noun", "example": "The child is playing."},
            {"word": "friend", "meaning": "친구", "pos": "noun", "example": "She is my friend."},
            {"word": "family", "meaning": "가족", "pos": "noun", "example": "I love my family."},
            {"word": "mother", "meaning": "어머니", "pos": "noun", "example": "My mother cooks well."},
            {"word": "father", "meaning": "아버지", "pos": "noun", "example": "My father works hard."},
            {"word": "brother", "meaning": "형제", "pos": "noun", "example": "I have one brother."},
            {"word": "sister", "meaning": "자매", "pos": "noun", "example": "My sister is older."},

            # 장소
            {"word": "home", "meaning": "집", "pos": "noun", "example": "I'm going home."},
            {"word": "school", "meaning": "학교", "pos": "noun", "example": "I go to school."},
            {"word": "work", "meaning": "일, 직장", "pos": "noun", "example": "I'm at work now."},
            {"word": "shop", "meaning": "가게", "pos": "noun", "example": "The shop is closed."},
            {"word": "restaurant", "meaning": "레스토랑", "pos": "noun", "example": "Let's go to a restaurant."},
            {"word": "hospital", "meaning": "병원", "pos": "noun", "example": "He's in the hospital."},
            {"word": "station", "meaning": "역", "pos": "noun", "example": "Where is the station?"},
            {"word": "airport", "meaning": "공항", "pos": "noun", "example": "I'm at the airport."},
            {"word": "hotel", "meaning": "호텔", "pos": "noun", "example": "I booked a hotel."},

            # 음식/음료
            {"word": "water", "meaning": "물", "pos": "noun", "example": "Can I have some water?"},
            {"word": "coffee", "meaning": "커피", "pos": "noun", "example": "I'd like a coffee."},
            {"word": "tea", "meaning": "차", "pos": "noun", "example": "Do you want tea?"},
            {"word": "food", "meaning": "음식", "pos": "noun", "example": "The food is delicious."},
            {"word": "bread", "meaning": "빵", "pos": "noun", "example": "I eat bread for breakfast."},
            {"word": "rice", "meaning": "밥, 쌀", "pos": "noun", "example": "I like rice."},
            {"word": "meat", "meaning": "고기", "pos": "noun", "example": "I don't eat meat."},
            {"word": "fruit", "meaning": "과일", "pos": "noun", "example": "I love fruit."},

            # 기본 동사
            {"word": "be", "meaning": "~이다", "pos": "verb", "example": "I am happy."},
            {"word": "have", "meaning": "가지다", "pos": "verb", "example": "I have a car."},
            {"word": "do", "meaning": "하다", "pos": "verb", "example": "What do you do?"},
            {"word": "go", "meaning": "가다", "pos": "verb", "example": "I go to work."},
            {"word": "come", "meaning": "오다", "pos": "verb", "example": "Please come here."},
            {"word": "see", "meaning": "보다", "pos": "verb", "example": "I see you."},
            {"word": "eat", "meaning": "먹다", "pos": "verb", "example": "I eat breakfast."},
            {"word": "drink", "meaning": "마시다", "pos": "verb", "example": "I drink water."},
            {"word": "want", "meaning": "원하다", "pos": "verb", "example": "I want coffee."},
            {"word": "like", "meaning": "좋아하다", "pos": "verb", "example": "I like pizza."},
            {"word": "need", "meaning": "필요하다", "pos": "verb", "example": "I need help."},
            {"word": "know", "meaning": "알다", "pos": "verb", "example": "I know him."},
            {"word": "think", "meaning": "생각하다", "pos": "verb", "example": "I think so."},
            {"word": "make", "meaning": "만들다", "pos": "verb", "example": "I make coffee."},
            {"word": "take", "meaning": "가져가다", "pos": "verb", "example": "Take this."},
            {"word": "give", "meaning": "주다", "pos": "verb", "example": "Give me water."},
            {"word": "buy", "meaning": "사다", "pos": "verb", "example": "I buy food."},
            {"word": "work", "meaning": "일하다", "pos": "verb", "example": "I work here."},
            {"word": "live", "meaning": "살다", "pos": "verb", "example": "I live in Seoul."},
            {"word": "speak", "meaning": "말하다", "pos": "verb", "example": "I speak English."},
            {"word": "read", "meaning": "읽다", "pos": "verb", "example": "I read books."},
            {"word": "write", "meaning": "쓰다", "pos": "verb", "example": "I write emails."},
            {"word": "listen", "meaning": "듣다", "pos": "verb", "example": "Listen to me."},
            {"word": "help", "meaning": "돕다", "pos": "verb", "example": "Can you help me?"},
            {"word": "open", "meaning": "열다", "pos": "verb", "example": "Open the door."},
            {"word": "close", "meaning": "닫다", "pos": "verb", "example": "Close the window."},
            {"word": "wait", "meaning": "기다리다", "pos": "verb", "example": "Please wait here."},
            {"word": "ask", "meaning": "묻다", "pos": "verb", "example": "Can I ask you?"},
            {"word": "call", "meaning": "전화하다", "pos": "verb", "example": "I'll call you."},
            {"word": "pay", "meaning": "지불하다", "pos": "verb", "example": "I'll pay by card."},

            # 형용사
            {"word": "good", "meaning": "좋은", "pos": "adjective", "example": "This is good."},
            {"word": "bad", "meaning": "나쁜", "pos": "adjective", "example": "That's bad news."},
            {"word": "big", "meaning": "큰", "pos": "adjective", "example": "It's a big house."},
            {"word": "small", "meaning": "작은", "pos": "adjective", "example": "I want a small one."},
            {"word": "new", "meaning": "새로운", "pos": "adjective", "example": "This is new."},
            {"word": "old", "meaning": "오래된", "pos": "adjective", "example": "It's an old building."},
            {"word": "hot", "meaning": "뜨거운", "pos": "adjective", "example": "The coffee is hot."},
            {"word": "cold", "meaning": "차가운", "pos": "adjective", "example": "It's cold today."},
            {"word": "happy", "meaning": "행복한", "pos": "adjective", "example": "I'm happy."},
            {"word": "tired", "meaning": "피곤한", "pos": "adjective", "example": "I'm tired."},
            {"word": "hungry", "meaning": "배고픈", "pos": "adjective", "example": "I'm hungry."},
            {"word": "busy", "meaning": "바쁜", "pos": "adjective", "example": "I'm busy now."},
            {"word": "free", "meaning": "자유로운, 무료", "pos": "adjective", "example": "Are you free today?"},
            {"word": "easy", "meaning": "쉬운", "pos": "adjective", "example": "It's easy."},
            {"word": "difficult", "meaning": "어려운", "pos": "adjective", "example": "It's difficult."},
            {"word": "expensive", "meaning": "비싼", "pos": "adjective", "example": "It's expensive."},
            {"word": "cheap", "meaning": "싼", "pos": "adjective", "example": "It's cheap."},
            {"word": "near", "meaning": "가까운", "pos": "adjective", "example": "It's near here."},
            {"word": "far", "meaning": "먼", "pos": "adjective", "example": "It's far from here."},

            # 의문사
            {"word": "what", "meaning": "무엇", "pos": "pronoun", "example": "What is this?"},
            {"word": "where", "meaning": "어디", "pos": "adverb", "example": "Where are you?"},
            {"word": "when", "meaning": "언제", "pos": "adverb", "example": "When is it?"},
            {"word": "who", "meaning": "누구", "pos": "pronoun", "example": "Who is he?"},
            {"word": "why", "meaning": "왜", "pos": "adverb", "example": "Why not?"},
            {"word": "how", "meaning": "어떻게", "pos": "adverb", "example": "How are you?"},
            {"word": "how much", "meaning": "얼마", "pos": "phrase", "example": "How much is it?"},
            {"word": "how many", "meaning": "몇 개", "pos": "phrase", "example": "How many do you want?"},
        ]
    },

    "A2": {
        "description": "Elementary - 기초 확장 단어",
        "words": [
            # 일상 동사 확장
            {"word": "remember", "meaning": "기억하다", "pos": "verb", "example": "I remember you."},
            {"word": "forget", "meaning": "잊다", "pos": "verb", "example": "Don't forget!"},
            {"word": "understand", "meaning": "이해하다", "pos": "verb", "example": "I understand."},
            {"word": "learn", "meaning": "배우다", "pos": "verb", "example": "I'm learning English."},
            {"word": "teach", "meaning": "가르치다", "pos": "verb", "example": "She teaches math."},
            {"word": "try", "meaning": "노력하다", "pos": "verb", "example": "I'll try again."},
            {"word": "start", "meaning": "시작하다", "pos": "verb", "example": "Let's start now."},
            {"word": "finish", "meaning": "끝내다", "pos": "verb", "example": "I finished my work."},
            {"word": "stop", "meaning": "멈추다", "pos": "verb", "example": "Please stop here."},
            {"word": "continue", "meaning": "계속하다", "pos": "verb", "example": "Please continue."},
            {"word": "change", "meaning": "바꾸다", "pos": "verb", "example": "I want to change this."},
            {"word": "choose", "meaning": "선택하다", "pos": "verb", "example": "Please choose one."},
            {"word": "decide", "meaning": "결정하다", "pos": "verb", "example": "I can't decide."},
            {"word": "hope", "meaning": "희망하다", "pos": "verb", "example": "I hope so."},
            {"word": "believe", "meaning": "믿다", "pos": "verb", "example": "I believe you."},
            {"word": "feel", "meaning": "느끼다", "pos": "verb", "example": "I feel good."},
            {"word": "meet", "meaning": "만나다", "pos": "verb", "example": "Nice to meet you."},
            {"word": "visit", "meaning": "방문하다", "pos": "verb", "example": "I visited Seoul."},
            {"word": "travel", "meaning": "여행하다", "pos": "verb", "example": "I like to travel."},
            {"word": "stay", "meaning": "머무르다", "pos": "verb", "example": "I'll stay here."},
            {"word": "leave", "meaning": "떠나다", "pos": "verb", "example": "I have to leave."},
            {"word": "arrive", "meaning": "도착하다", "pos": "verb", "example": "When do you arrive?"},
            {"word": "return", "meaning": "돌아오다", "pos": "verb", "example": "I'll return tomorrow."},
            {"word": "send", "meaning": "보내다", "pos": "verb", "example": "Please send me the file."},
            {"word": "receive", "meaning": "받다", "pos": "verb", "example": "I received your email."},
            {"word": "bring", "meaning": "가져오다", "pos": "verb", "example": "Bring your ID."},
            {"word": "carry", "meaning": "운반하다", "pos": "verb", "example": "I'll carry this."},
            {"word": "wear", "meaning": "입다", "pos": "verb", "example": "I wear a suit."},
            {"word": "spend", "meaning": "쓰다(돈/시간)", "pos": "verb", "example": "I spend money on books."},
            {"word": "save", "meaning": "저축하다", "pos": "verb", "example": "I save money every month."},

            # 일/직업
            {"word": "job", "meaning": "직업", "pos": "noun", "example": "I got a new job."},
            {"word": "company", "meaning": "회사", "pos": "noun", "example": "I work for a big company."},
            {"word": "office", "meaning": "사무실", "pos": "noun", "example": "I'm in the office."},
            {"word": "meeting", "meaning": "회의", "pos": "noun", "example": "I have a meeting."},
            {"word": "project", "meaning": "프로젝트", "pos": "noun", "example": "The project is done."},
            {"word": "boss", "meaning": "상사", "pos": "noun", "example": "My boss is nice."},
            {"word": "colleague", "meaning": "동료", "pos": "noun", "example": "She's my colleague."},
            {"word": "customer", "meaning": "고객", "pos": "noun", "example": "The customer is waiting."},
            {"word": "salary", "meaning": "월급", "pos": "noun", "example": "I got my salary."},

            # 쇼핑
            {"word": "price", "meaning": "가격", "pos": "noun", "example": "What's the price?"},
            {"word": "discount", "meaning": "할인", "pos": "noun", "example": "Is there a discount?"},
            {"word": "sale", "meaning": "세일", "pos": "noun", "example": "It's on sale."},
            {"word": "size", "meaning": "크기", "pos": "noun", "example": "What size do you need?"},
            {"word": "color", "meaning": "색상", "pos": "noun", "example": "What color do you want?"},
            {"word": "receipt", "meaning": "영수증", "pos": "noun", "example": "Can I have the receipt?"},
            {"word": "cash", "meaning": "현금", "pos": "noun", "example": "I'll pay by cash."},
            {"word": "card", "meaning": "카드", "pos": "noun", "example": "Do you take cards?"},

            # 교통
            {"word": "ticket", "meaning": "표", "pos": "noun", "example": "I need a ticket."},
            {"word": "bus", "meaning": "버스", "pos": "noun", "example": "I take the bus."},
            {"word": "train", "meaning": "기차", "pos": "noun", "example": "The train is late."},
            {"word": "subway", "meaning": "지하철", "pos": "noun", "example": "Take the subway."},
            {"word": "taxi", "meaning": "택시", "pos": "noun", "example": "Call a taxi."},
            {"word": "car", "meaning": "자동차", "pos": "noun", "example": "I drive a car."},
            {"word": "flight", "meaning": "비행기편", "pos": "noun", "example": "My flight is delayed."},
            {"word": "seat", "meaning": "좌석", "pos": "noun", "example": "Is this seat taken?"},

            # 건강
            {"word": "doctor", "meaning": "의사", "pos": "noun", "example": "I need to see a doctor."},
            {"word": "medicine", "meaning": "약", "pos": "noun", "example": "Take this medicine."},
            {"word": "sick", "meaning": "아픈", "pos": "adjective", "example": "I feel sick."},
            {"word": "pain", "meaning": "통증", "pos": "noun", "example": "I have pain here."},
            {"word": "headache", "meaning": "두통", "pos": "noun", "example": "I have a headache."},
            {"word": "fever", "meaning": "열", "pos": "noun", "example": "I have a fever."},
            {"word": "cold", "meaning": "감기", "pos": "noun", "example": "I caught a cold."},

            # 날씨
            {"word": "weather", "meaning": "날씨", "pos": "noun", "example": "How's the weather?"},
            {"word": "sunny", "meaning": "맑은", "pos": "adjective", "example": "It's sunny today."},
            {"word": "cloudy", "meaning": "흐린", "pos": "adjective", "example": "It's cloudy."},
            {"word": "rainy", "meaning": "비오는", "pos": "adjective", "example": "It's rainy today."},
            {"word": "windy", "meaning": "바람부는", "pos": "adjective", "example": "It's windy outside."},
            {"word": "snow", "meaning": "눈", "pos": "noun", "example": "There's snow outside."},

            # 감정/상태
            {"word": "excited", "meaning": "신난", "pos": "adjective", "example": "I'm so excited!"},
            {"word": "worried", "meaning": "걱정되는", "pos": "adjective", "example": "I'm worried about it."},
            {"word": "surprised", "meaning": "놀란", "pos": "adjective", "example": "I was surprised."},
            {"word": "angry", "meaning": "화난", "pos": "adjective", "example": "Don't be angry."},
            {"word": "nervous", "meaning": "긴장한", "pos": "adjective", "example": "I'm nervous."},
            {"word": "comfortable", "meaning": "편안한", "pos": "adjective", "example": "Make yourself comfortable."},
            {"word": "safe", "meaning": "안전한", "pos": "adjective", "example": "It's safe here."},
            {"word": "dangerous", "meaning": "위험한", "pos": "adjective", "example": "It's dangerous."},

            # 부사
            {"word": "always", "meaning": "항상", "pos": "adverb", "example": "I always wake up early."},
            {"word": "usually", "meaning": "보통", "pos": "adverb", "example": "I usually eat at home."},
            {"word": "sometimes", "meaning": "가끔", "pos": "adverb", "example": "I sometimes go there."},
            {"word": "never", "meaning": "절대 ~않다", "pos": "adverb", "example": "I never smoke."},
            {"word": "already", "meaning": "이미", "pos": "adverb", "example": "I already finished."},
            {"word": "still", "meaning": "아직", "pos": "adverb", "example": "I'm still working."},
            {"word": "just", "meaning": "방금", "pos": "adverb", "example": "I just arrived."},
            {"word": "soon", "meaning": "곧", "pos": "adverb", "example": "I'll be there soon."},
            {"word": "again", "meaning": "다시", "pos": "adverb", "example": "Try again."},
            {"word": "together", "meaning": "함께", "pos": "adverb", "example": "Let's go together."},
            {"word": "alone", "meaning": "혼자", "pos": "adverb", "example": "I live alone."},
            {"word": "quickly", "meaning": "빨리", "pos": "adverb", "example": "Come quickly!"},
            {"word": "slowly", "meaning": "천천히", "pos": "adverb", "example": "Please speak slowly."},
            {"word": "carefully", "meaning": "조심히", "pos": "adverb", "example": "Drive carefully."},
        ]
    },

    "B1": {
        "description": "Intermediate - 중급 단어",
        "words": [
            # 추상 명사
            {"word": "experience", "meaning": "경험", "pos": "noun", "example": "I have experience in marketing."},
            {"word": "opportunity", "meaning": "기회", "pos": "noun", "example": "This is a great opportunity."},
            {"word": "situation", "meaning": "상황", "pos": "noun", "example": "The situation is complicated."},
            {"word": "relationship", "meaning": "관계", "pos": "noun", "example": "We have a good relationship."},
            {"word": "environment", "meaning": "환경", "pos": "noun", "example": "Protect the environment."},
            {"word": "society", "meaning": "사회", "pos": "noun", "example": "We live in a modern society."},
            {"word": "culture", "meaning": "문화", "pos": "noun", "example": "I love Korean culture."},
            {"word": "technology", "meaning": "기술", "pos": "noun", "example": "Technology is changing fast."},
            {"word": "education", "meaning": "교육", "pos": "noun", "example": "Education is important."},
            {"word": "government", "meaning": "정부", "pos": "noun", "example": "The government announced new policies."},
            {"word": "economy", "meaning": "경제", "pos": "noun", "example": "The economy is growing."},
            {"word": "development", "meaning": "발전", "pos": "noun", "example": "Economic development is important."},
            {"word": "research", "meaning": "연구", "pos": "noun", "example": "I do research in AI."},
            {"word": "knowledge", "meaning": "지식", "pos": "noun", "example": "Knowledge is power."},
            {"word": "information", "meaning": "정보", "pos": "noun", "example": "I need more information."},
            {"word": "solution", "meaning": "해결책", "pos": "noun", "example": "We found a solution."},
            {"word": "problem", "meaning": "문제", "pos": "noun", "example": "There's a problem."},
            {"word": "issue", "meaning": "이슈, 문제", "pos": "noun", "example": "This is an important issue."},
            {"word": "advantage", "meaning": "장점", "pos": "noun", "example": "What's the advantage?"},
            {"word": "disadvantage", "meaning": "단점", "pos": "noun", "example": "There are some disadvantages."},
            {"word": "benefit", "meaning": "이점, 혜택", "pos": "noun", "example": "What are the benefits?"},
            {"word": "risk", "meaning": "위험", "pos": "noun", "example": "There's a risk involved."},
            {"word": "success", "meaning": "성공", "pos": "noun", "example": "Success takes time."},
            {"word": "failure", "meaning": "실패", "pos": "noun", "example": "Failure is part of learning."},
            {"word": "goal", "meaning": "목표", "pos": "noun", "example": "What's your goal?"},
            {"word": "plan", "meaning": "계획", "pos": "noun", "example": "What's the plan?"},
            {"word": "decision", "meaning": "결정", "pos": "noun", "example": "It's your decision."},
            {"word": "choice", "meaning": "선택", "pos": "noun", "example": "You have a choice."},
            {"word": "opinion", "meaning": "의견", "pos": "noun", "example": "In my opinion..."},
            {"word": "idea", "meaning": "아이디어", "pos": "noun", "example": "That's a good idea."},

            # 비즈니스 동사
            {"word": "achieve", "meaning": "달성하다", "pos": "verb", "example": "We achieved our goal."},
            {"word": "improve", "meaning": "개선하다", "pos": "verb", "example": "We need to improve."},
            {"word": "develop", "meaning": "개발하다", "pos": "verb", "example": "We're developing a new product."},
            {"word": "create", "meaning": "창조하다", "pos": "verb", "example": "Let's create something new."},
            {"word": "produce", "meaning": "생산하다", "pos": "verb", "example": "We produce quality products."},
            {"word": "provide", "meaning": "제공하다", "pos": "verb", "example": "We provide excellent service."},
            {"word": "offer", "meaning": "제안하다", "pos": "verb", "example": "I can offer you a discount."},
            {"word": "suggest", "meaning": "제안하다", "pos": "verb", "example": "I suggest we wait."},
            {"word": "recommend", "meaning": "추천하다", "pos": "verb", "example": "I recommend this book."},
            {"word": "accept", "meaning": "수락하다", "pos": "verb", "example": "I accept your offer."},
            {"word": "refuse", "meaning": "거절하다", "pos": "verb", "example": "I have to refuse."},
            {"word": "agree", "meaning": "동의하다", "pos": "verb", "example": "I agree with you."},
            {"word": "disagree", "meaning": "동의하지 않다", "pos": "verb", "example": "I disagree."},
            {"word": "support", "meaning": "지원하다", "pos": "verb", "example": "I support your idea."},
            {"word": "manage", "meaning": "관리하다", "pos": "verb", "example": "I manage a team."},
            {"word": "organize", "meaning": "조직하다", "pos": "verb", "example": "I organize events."},
            {"word": "prepare", "meaning": "준비하다", "pos": "verb", "example": "I'm preparing for the meeting."},
            {"word": "attend", "meaning": "참석하다", "pos": "verb", "example": "I'll attend the meeting."},
            {"word": "discuss", "meaning": "논의하다", "pos": "verb", "example": "Let's discuss this later."},
            {"word": "explain", "meaning": "설명하다", "pos": "verb", "example": "Can you explain?"},
            {"word": "describe", "meaning": "묘사하다", "pos": "verb", "example": "Describe the situation."},
            {"word": "compare", "meaning": "비교하다", "pos": "verb", "example": "Let's compare prices."},
            {"word": "consider", "meaning": "고려하다", "pos": "verb", "example": "I'll consider your offer."},
            {"word": "expect", "meaning": "기대하다", "pos": "verb", "example": "I expect good results."},
            {"word": "require", "meaning": "요구하다", "pos": "verb", "example": "This requires more time."},
            {"word": "include", "meaning": "포함하다", "pos": "verb", "example": "The price includes tax."},
            {"word": "contain", "meaning": "포함하다", "pos": "verb", "example": "This contains sugar."},
            {"word": "involve", "meaning": "포함하다", "pos": "verb", "example": "The project involves many people."},
            {"word": "affect", "meaning": "영향을 미치다", "pos": "verb", "example": "This will affect everyone."},
            {"word": "influence", "meaning": "영향을 주다", "pos": "verb", "example": "Music influenced my life."},

            # 형용사 확장
            {"word": "important", "meaning": "중요한", "pos": "adjective", "example": "This is important."},
            {"word": "necessary", "meaning": "필요한", "pos": "adjective", "example": "It's necessary to study."},
            {"word": "possible", "meaning": "가능한", "pos": "adjective", "example": "Is it possible?"},
            {"word": "impossible", "meaning": "불가능한", "pos": "adjective", "example": "Nothing is impossible."},
            {"word": "available", "meaning": "이용 가능한", "pos": "adjective", "example": "Is it available?"},
            {"word": "responsible", "meaning": "책임 있는", "pos": "adjective", "example": "I'm responsible for this."},
            {"word": "successful", "meaning": "성공적인", "pos": "adjective", "example": "The event was successful."},
            {"word": "popular", "meaning": "인기 있는", "pos": "adjective", "example": "It's very popular."},
            {"word": "similar", "meaning": "비슷한", "pos": "adjective", "example": "They look similar."},
            {"word": "different", "meaning": "다른", "pos": "adjective", "example": "This is different."},
            {"word": "specific", "meaning": "구체적인", "pos": "adjective", "example": "Be more specific."},
            {"word": "general", "meaning": "일반적인", "pos": "adjective", "example": "In general, I agree."},
            {"word": "common", "meaning": "흔한", "pos": "adjective", "example": "It's a common problem."},
            {"word": "rare", "meaning": "드문", "pos": "adjective", "example": "It's a rare opportunity."},
            {"word": "simple", "meaning": "간단한", "pos": "adjective", "example": "The answer is simple."},
            {"word": "complex", "meaning": "복잡한", "pos": "adjective", "example": "It's a complex issue."},
            {"word": "recent", "meaning": "최근의", "pos": "adjective", "example": "Recent studies show..."},
            {"word": "previous", "meaning": "이전의", "pos": "adjective", "example": "In my previous job..."},
            {"word": "current", "meaning": "현재의", "pos": "adjective", "example": "My current situation..."},
            {"word": "main", "meaning": "주요한", "pos": "adjective", "example": "The main reason is..."},
            {"word": "entire", "meaning": "전체의", "pos": "adjective", "example": "The entire team worked hard."},
            {"word": "various", "meaning": "다양한", "pos": "adjective", "example": "There are various options."},
            {"word": "certain", "meaning": "확실한", "pos": "adjective", "example": "I'm certain about it."},
            {"word": "likely", "meaning": "아마", "pos": "adjective", "example": "It's likely to rain."},
            {"word": "unlikely", "meaning": "~할 것 같지 않은", "pos": "adjective", "example": "It's unlikely to happen."},
        ]
    },

    "B2": {
        "description": "Upper Intermediate - 중상급 단어",
        "words": [
            # 학술/전문 단어
            {"word": "analysis", "meaning": "분석", "pos": "noun", "example": "We need a detailed analysis."},
            {"word": "approach", "meaning": "접근법", "pos": "noun", "example": "We need a new approach."},
            {"word": "aspect", "meaning": "측면", "pos": "noun", "example": "Consider every aspect."},
            {"word": "assessment", "meaning": "평가", "pos": "noun", "example": "We conducted an assessment."},
            {"word": "assumption", "meaning": "가정", "pos": "noun", "example": "That's a wrong assumption."},
            {"word": "authority", "meaning": "권위, 당국", "pos": "noun", "example": "He's an authority on the subject."},
            {"word": "capacity", "meaning": "용량, 능력", "pos": "noun", "example": "The room has a capacity of 100."},
            {"word": "category", "meaning": "범주", "pos": "noun", "example": "What category does it fall into?"},
            {"word": "circumstance", "meaning": "상황", "pos": "noun", "example": "Under the circumstances..."},
            {"word": "concept", "meaning": "개념", "pos": "noun", "example": "It's a difficult concept."},
            {"word": "conclusion", "meaning": "결론", "pos": "noun", "example": "In conclusion..."},
            {"word": "consequence", "meaning": "결과", "pos": "noun", "example": "Consider the consequences."},
            {"word": "context", "meaning": "맥락", "pos": "noun", "example": "Consider the context."},
            {"word": "contribution", "meaning": "기여", "pos": "noun", "example": "Thank you for your contribution."},
            {"word": "criteria", "meaning": "기준", "pos": "noun", "example": "What are the criteria?"},
            {"word": "debate", "meaning": "토론", "pos": "noun", "example": "There's a lot of debate."},
            {"word": "definition", "meaning": "정의", "pos": "noun", "example": "What's the definition?"},
            {"word": "demonstration", "meaning": "시연", "pos": "noun", "example": "I'll give a demonstration."},
            {"word": "distribution", "meaning": "분배", "pos": "noun", "example": "Fair distribution is important."},
            {"word": "element", "meaning": "요소", "pos": "noun", "example": "It's a key element."},
            {"word": "emphasis", "meaning": "강조", "pos": "noun", "example": "We put emphasis on quality."},
            {"word": "evidence", "meaning": "증거", "pos": "noun", "example": "There's no evidence."},
            {"word": "factor", "meaning": "요인", "pos": "noun", "example": "It's an important factor."},
            {"word": "feature", "meaning": "특징", "pos": "noun", "example": "It has many features."},
            {"word": "framework", "meaning": "틀, 체계", "pos": "noun", "example": "We need a framework."},
            {"word": "function", "meaning": "기능", "pos": "noun", "example": "What's its function?"},
            {"word": "impact", "meaning": "영향", "pos": "noun", "example": "It had a big impact."},
            {"word": "implementation", "meaning": "시행", "pos": "noun", "example": "Implementation takes time."},
            {"word": "implication", "meaning": "함축, 영향", "pos": "noun", "example": "Consider the implications."},
            {"word": "indication", "meaning": "징후", "pos": "noun", "example": "There's no indication of that."},

            # 고급 동사
            {"word": "acknowledge", "meaning": "인정하다", "pos": "verb", "example": "I acknowledge my mistake."},
            {"word": "acquire", "meaning": "획득하다", "pos": "verb", "example": "We acquired the company."},
            {"word": "adapt", "meaning": "적응하다", "pos": "verb", "example": "We need to adapt."},
            {"word": "allocate", "meaning": "할당하다", "pos": "verb", "example": "We allocated resources."},
            {"word": "anticipate", "meaning": "예상하다", "pos": "verb", "example": "We anticipate growth."},
            {"word": "appreciate", "meaning": "감사하다", "pos": "verb", "example": "I appreciate your help."},
            {"word": "assess", "meaning": "평가하다", "pos": "verb", "example": "We assessed the situation."},
            {"word": "assume", "meaning": "가정하다", "pos": "verb", "example": "I assume you agree."},
            {"word": "attribute", "meaning": "~탓으로 돌리다", "pos": "verb", "example": "He attributes his success to hard work."},
            {"word": "clarify", "meaning": "명확히 하다", "pos": "verb", "example": "Let me clarify."},
            {"word": "communicate", "meaning": "소통하다", "pos": "verb", "example": "We need to communicate better."},
            {"word": "compensate", "meaning": "보상하다", "pos": "verb", "example": "We'll compensate you."},
            {"word": "conclude", "meaning": "결론짓다", "pos": "verb", "example": "I conclude that..."},
            {"word": "confirm", "meaning": "확인하다", "pos": "verb", "example": "Please confirm your attendance."},
            {"word": "contribute", "meaning": "기여하다", "pos": "verb", "example": "Everyone contributed."},
            {"word": "convince", "meaning": "설득하다", "pos": "verb", "example": "You convinced me."},
            {"word": "demonstrate", "meaning": "보여주다", "pos": "verb", "example": "Let me demonstrate."},
            {"word": "determine", "meaning": "결정하다", "pos": "verb", "example": "We need to determine the cause."},
            {"word": "eliminate", "meaning": "제거하다", "pos": "verb", "example": "Eliminate unnecessary costs."},
            {"word": "emphasize", "meaning": "강조하다", "pos": "verb", "example": "I want to emphasize this point."},
            {"word": "enable", "meaning": "가능하게 하다", "pos": "verb", "example": "Technology enables us to..."},
            {"word": "enhance", "meaning": "향상시키다", "pos": "verb", "example": "We enhanced the product."},
            {"word": "ensure", "meaning": "보장하다", "pos": "verb", "example": "We ensure quality."},
            {"word": "establish", "meaning": "설립하다", "pos": "verb", "example": "We established the company in 2010."},
            {"word": "estimate", "meaning": "추정하다", "pos": "verb", "example": "I estimate about 100 people."},
            {"word": "evaluate", "meaning": "평가하다", "pos": "verb", "example": "We need to evaluate options."},
            {"word": "generate", "meaning": "생성하다", "pos": "verb", "example": "We generate ideas."},
            {"word": "identify", "meaning": "식별하다", "pos": "verb", "example": "We identified the problem."},
            {"word": "implement", "meaning": "시행하다", "pos": "verb", "example": "We implemented the plan."},
            {"word": "indicate", "meaning": "나타내다", "pos": "verb", "example": "Studies indicate that..."},

            # 고급 형용사
            {"word": "adequate", "meaning": "적절한", "pos": "adjective", "example": "Is it adequate?"},
            {"word": "appropriate", "meaning": "적절한", "pos": "adjective", "example": "It's not appropriate."},
            {"word": "comprehensive", "meaning": "포괄적인", "pos": "adjective", "example": "We need a comprehensive plan."},
            {"word": "consistent", "meaning": "일관된", "pos": "adjective", "example": "Be consistent."},
            {"word": "crucial", "meaning": "중대한", "pos": "adjective", "example": "It's a crucial decision."},
            {"word": "distinct", "meaning": "뚜렷한", "pos": "adjective", "example": "There's a distinct difference."},
            {"word": "efficient", "meaning": "효율적인", "pos": "adjective", "example": "It's more efficient."},
            {"word": "essential", "meaning": "필수적인", "pos": "adjective", "example": "It's essential to prepare."},
            {"word": "evident", "meaning": "명백한", "pos": "adjective", "example": "It's evident that..."},
            {"word": "fundamental", "meaning": "근본적인", "pos": "adjective", "example": "It's a fundamental change."},
            {"word": "initial", "meaning": "초기의", "pos": "adjective", "example": "The initial results are good."},
            {"word": "obvious", "meaning": "명백한", "pos": "adjective", "example": "It's obvious."},
            {"word": "potential", "meaning": "잠재적인", "pos": "adjective", "example": "There's potential for growth."},
            {"word": "primary", "meaning": "주요한", "pos": "adjective", "example": "The primary goal is..."},
            {"word": "relevant", "meaning": "관련 있는", "pos": "adjective", "example": "It's not relevant."},
            {"word": "significant", "meaning": "중요한", "pos": "adjective", "example": "It's a significant achievement."},
            {"word": "substantial", "meaning": "상당한", "pos": "adjective", "example": "There's substantial evidence."},
            {"word": "sufficient", "meaning": "충분한", "pos": "adjective", "example": "Is it sufficient?"},
            {"word": "valid", "meaning": "유효한", "pos": "adjective", "example": "Is it still valid?"},
        ]
    },

    "C1": {
        "description": "Advanced - 고급 단어",
        "words": [
            # 학술/전문 고급
            {"word": "accumulate", "meaning": "축적하다", "pos": "verb", "example": "We accumulated data over years."},
            {"word": "advocate", "meaning": "옹호하다", "pos": "verb", "example": "I advocate for change."},
            {"word": "albeit", "meaning": "비록 ~이지만", "pos": "conjunction", "example": "It was successful, albeit slowly."},
            {"word": "alleviate", "meaning": "완화하다", "pos": "verb", "example": "We need to alleviate the problem."},
            {"word": "ambiguous", "meaning": "모호한", "pos": "adjective", "example": "The statement is ambiguous."},
            {"word": "analogous", "meaning": "유사한", "pos": "adjective", "example": "The situations are analogous."},
            {"word": "apparatus", "meaning": "장치", "pos": "noun", "example": "The apparatus is complex."},
            {"word": "arbitrary", "meaning": "임의의", "pos": "adjective", "example": "The decision was arbitrary."},
            {"word": "attain", "meaning": "달성하다", "pos": "verb", "example": "We attained our objectives."},
            {"word": "cease", "meaning": "중단하다", "pos": "verb", "example": "Operations will cease."},
            {"word": "coherent", "meaning": "일관성 있는", "pos": "adjective", "example": "Make a coherent argument."},
            {"word": "coincide", "meaning": "일치하다", "pos": "verb", "example": "Our views coincide."},
            {"word": "commence", "meaning": "시작하다", "pos": "verb", "example": "The meeting will commence at 9."},
            {"word": "compatible", "meaning": "호환되는", "pos": "adjective", "example": "Is it compatible?"},
            {"word": "compile", "meaning": "편집하다", "pos": "verb", "example": "We compiled the data."},
            {"word": "complement", "meaning": "보완하다", "pos": "verb", "example": "They complement each other."},
            {"word": "comply", "meaning": "준수하다", "pos": "verb", "example": "We must comply with regulations."},
            {"word": "conceive", "meaning": "생각해내다", "pos": "verb", "example": "I can't conceive how..."},
            {"word": "concurrent", "meaning": "동시의", "pos": "adjective", "example": "Concurrent sessions are held."},
            {"word": "confine", "meaning": "제한하다", "pos": "verb", "example": "Let's confine the discussion to..."},
            {"word": "consent", "meaning": "동의하다", "pos": "verb", "example": "I consent to the terms."},
            {"word": "constitute", "meaning": "구성하다", "pos": "verb", "example": "This constitutes a breach."},
            {"word": "constrain", "meaning": "제한하다", "pos": "verb", "example": "We're constrained by budget."},
            {"word": "contradict", "meaning": "모순되다", "pos": "verb", "example": "The facts contradict the theory."},
            {"word": "controversy", "meaning": "논란", "pos": "noun", "example": "It caused controversy."},
            {"word": "convene", "meaning": "소집하다", "pos": "verb", "example": "We convened a meeting."},
            {"word": "conversely", "meaning": "반대로", "pos": "adverb", "example": "Conversely, we could..."},
            {"word": "deduce", "meaning": "추론하다", "pos": "verb", "example": "We can deduce that..."},
            {"word": "deem", "meaning": "여기다", "pos": "verb", "example": "It was deemed necessary."},
            {"word": "denote", "meaning": "나타내다", "pos": "verb", "example": "This symbol denotes..."},

            # 비즈니스/전문 고급
            {"word": "deteriorate", "meaning": "악화되다", "pos": "verb", "example": "Conditions deteriorated."},
            {"word": "devise", "meaning": "고안하다", "pos": "verb", "example": "We devised a plan."},
            {"word": "diminish", "meaning": "줄이다", "pos": "verb", "example": "Don't diminish its importance."},
            {"word": "displace", "meaning": "대체하다", "pos": "verb", "example": "Technology may displace workers."},
            {"word": "dispose", "meaning": "처리하다", "pos": "verb", "example": "Dispose of waste properly."},
            {"word": "distort", "meaning": "왜곡하다", "pos": "verb", "example": "Don't distort the facts."},
            {"word": "divert", "meaning": "전환하다", "pos": "verb", "example": "Divert attention from..."},
            {"word": "doctrine", "meaning": "원칙, 교리", "pos": "noun", "example": "The doctrine states..."},
            {"word": "domain", "meaning": "영역", "pos": "noun", "example": "It's outside my domain."},
            {"word": "dynamics", "meaning": "역학", "pos": "noun", "example": "The dynamics of the market..."},
            {"word": "elicit", "meaning": "이끌어내다", "pos": "verb", "example": "Elicit responses from..."},
            {"word": "embed", "meaning": "내장하다", "pos": "verb", "example": "The value is embedded."},
            {"word": "empirical", "meaning": "경험적인", "pos": "adjective", "example": "Empirical evidence shows..."},
            {"word": "encompass", "meaning": "포함하다", "pos": "verb", "example": "The study encompasses..."},
            {"word": "endeavor", "meaning": "노력", "pos": "noun", "example": "A worthwhile endeavor."},
            {"word": "entity", "meaning": "실체", "pos": "noun", "example": "A separate legal entity."},
            {"word": "equate", "meaning": "동일시하다", "pos": "verb", "example": "Don't equate price with quality."},
            {"word": "erode", "meaning": "침식하다", "pos": "verb", "example": "Trust has eroded."},
            {"word": "evoke", "meaning": "불러일으키다", "pos": "verb", "example": "The music evokes memories."},
            {"word": "excerpt", "meaning": "발췌", "pos": "noun", "example": "Here's an excerpt from..."},
            {"word": "exert", "meaning": "발휘하다", "pos": "verb", "example": "Exert influence on..."},
            {"word": "explicit", "meaning": "명시적인", "pos": "adjective", "example": "Make it explicit."},
            {"word": "exploit", "meaning": "활용하다", "pos": "verb", "example": "Exploit the opportunity."},
            {"word": "extract", "meaning": "추출하다", "pos": "verb", "example": "Extract data from..."},
            {"word": "facilitate", "meaning": "촉진하다", "pos": "verb", "example": "Facilitate communication."},
            {"word": "fluctuate", "meaning": "변동하다", "pos": "verb", "example": "Prices fluctuate."},
            {"word": "formulate", "meaning": "공식화하다", "pos": "verb", "example": "Formulate a strategy."},
            {"word": "forthcoming", "meaning": "다가오는", "pos": "adjective", "example": "The forthcoming event..."},
            {"word": "foster", "meaning": "육성하다", "pos": "verb", "example": "Foster innovation."},
        ]
    },

    "C2": {
        "description": "Proficiency - 최고급 단어",
        "words": [
            {"word": "aberration", "meaning": "일탈, 이상", "pos": "noun", "example": "This is an aberration from normal."},
            {"word": "abhor", "meaning": "혐오하다", "pos": "verb", "example": "I abhor violence."},
            {"word": "acquiesce", "meaning": "묵인하다", "pos": "verb", "example": "They acquiesced to the demand."},
            {"word": "acrimonious", "meaning": "신랄한", "pos": "adjective", "example": "An acrimonious debate ensued."},
            {"word": "admonish", "meaning": "훈계하다", "pos": "verb", "example": "He was admonished for his behavior."},
            {"word": "aesthetic", "meaning": "미적인", "pos": "adjective", "example": "The aesthetic appeal is undeniable."},
            {"word": "affinity", "meaning": "친밀감", "pos": "noun", "example": "She has an affinity for art."},
            {"word": "aggravate", "meaning": "악화시키다", "pos": "verb", "example": "Don't aggravate the situation."},
            {"word": "allude", "meaning": "암시하다", "pos": "verb", "example": "He alluded to his past."},
            {"word": "amalgamate", "meaning": "합병하다", "pos": "verb", "example": "The companies amalgamated."},
            {"word": "ameliorate", "meaning": "개선하다", "pos": "verb", "example": "Steps to ameliorate conditions."},
            {"word": "anachronistic", "meaning": "시대착오적인", "pos": "adjective", "example": "The law is anachronistic."},
            {"word": "anomaly", "meaning": "이례", "pos": "noun", "example": "This is a statistical anomaly."},
            {"word": "antithesis", "meaning": "정반대", "pos": "noun", "example": "His view is the antithesis of mine."},
            {"word": "apathy", "meaning": "무관심", "pos": "noun", "example": "Voter apathy is increasing."},
            {"word": "apprehensive", "meaning": "불안한", "pos": "adjective", "example": "I'm apprehensive about the future."},
            {"word": "archaic", "meaning": "고대의, 구식의", "pos": "adjective", "example": "The system is archaic."},
            {"word": "arduous", "meaning": "힘든", "pos": "adjective", "example": "An arduous journey."},
            {"word": "articulate", "meaning": "명확히 표현하다", "pos": "verb", "example": "Articulate your thoughts clearly."},
            {"word": "ascertain", "meaning": "확인하다", "pos": "verb", "example": "We need to ascertain the facts."},
            {"word": "assimilate", "meaning": "동화하다", "pos": "verb", "example": "Assimilate new information."},
            {"word": "astute", "meaning": "예리한", "pos": "adjective", "example": "An astute observation."},
            {"word": "atrophy", "meaning": "위축", "pos": "noun", "example": "Muscle atrophy occurred."},
            {"word": "auspicious", "meaning": "길조의", "pos": "adjective", "example": "An auspicious beginning."},
            {"word": "austere", "meaning": "엄격한", "pos": "adjective", "example": "An austere lifestyle."},
            {"word": "autonomous", "meaning": "자율적인", "pos": "adjective", "example": "Autonomous decision-making."},
            {"word": "avarice", "meaning": "탐욕", "pos": "noun", "example": "Driven by avarice."},
            {"word": "aversion", "meaning": "혐오", "pos": "noun", "example": "An aversion to risk."},
            {"word": "beguile", "meaning": "매혹하다", "pos": "verb", "example": "Beguiled by her charm."},
            {"word": "belligerent", "meaning": "호전적인", "pos": "adjective", "example": "A belligerent attitude."},
            {"word": "benevolent", "meaning": "자비로운", "pos": "adjective", "example": "A benevolent leader."},
            {"word": "blatant", "meaning": "명백한", "pos": "adjective", "example": "A blatant lie."},
            {"word": "bourgeois", "meaning": "부르주아의", "pos": "adjective", "example": "Bourgeois values."},
            {"word": "brevity", "meaning": "간결함", "pos": "noun", "example": "Brevity is the soul of wit."},
            {"word": "buttress", "meaning": "지지하다", "pos": "verb", "example": "Buttress your argument."},
            {"word": "cacophony", "meaning": "불협화음", "pos": "noun", "example": "A cacophony of sounds."},
            {"word": "capricious", "meaning": "변덕스러운", "pos": "adjective", "example": "Capricious weather."},
            {"word": "catalyst", "meaning": "촉매", "pos": "noun", "example": "A catalyst for change."},
            {"word": "circumvent", "meaning": "피하다", "pos": "verb", "example": "Circumvent the rules."},
            {"word": "clandestine", "meaning": "은밀한", "pos": "adjective", "example": "Clandestine operations."},
        ]
    }
}


def generate_vocabulary_files():
    """레벨별 단어 파일 생성"""
    total_words = 0
    all_words = []

    for level, data in VOCABULARY_BY_LEVEL.items():
        words = data["words"]

        # 레벨별 파일 저장
        level_file = OUTPUT_DIR / f"vocabulary_{level}.json"
        level_data = {
            "level": level,
            "description": data["description"],
            "word_count": len(words),
            "words": words
        }

        with open(level_file, "w", encoding="utf-8") as f:
            json.dump(level_data, f, ensure_ascii=False, indent=2)

        print(f"{level}: {len(words)} words saved")
        total_words += len(words)

        # 전체 목록에 추가
        for word in words:
            word["level"] = level
            all_words.append(word)

    # 전체 통합 파일
    all_file = OUTPUT_DIR / "vocabulary_all.json"
    with open(all_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_words": total_words,
            "levels": list(VOCABULARY_BY_LEVEL.keys()),
            "words": all_words
        }, f, ensure_ascii=False, indent=2)

    print(f"\nTotal: {total_words} words")
    return total_words


if __name__ == "__main__":
    print("=" * 60)
    print("레벨별 단어 데이터 생성")
    print("=" * 60)
    generate_vocabulary_files()
    print("Done!")
