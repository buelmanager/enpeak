#!/usr/bin/env python3
"""추가 숙어/관용표현 생성 - 100개+"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "rag_chunks" / "more_idioms_chunks.json"

IDIOMS = [
    ("A penny for your thoughts", "무슨 생각해?", "B1"),
    ("Add insult to injury", "설상가상으로", "B2"),
    ("Beat around the bush", "빙빙 돌려 말하다", "B1"),
    ("Bite off more than you can chew", "감당 못할 일을 벌이다", "B2"),
    ("Bite the bullet", "이를 악물고 하다", "B1"),
    ("Break the ice", "어색한 분위기를 깨다", "B1"),
    ("Burn the midnight oil", "밤새 일하다", "B2"),
    ("Call it a day", "오늘은 여기까지", "A2"),
    ("Cost an arm and a leg", "매우 비싸다", "B1"),
    ("Cut to the chase", "본론으로 들어가다", "B1"),
    ("Don't cry over spilled milk", "이미 엎질러진 물", "B1"),
    ("Every cloud has a silver lining", "고진감래", "B2"),
    ("Get out of hand", "통제 불능이 되다", "B1"),
    ("Give someone the benefit of the doubt", "의심을 접어두다", "B2"),
    ("Go the extra mile", "더 노력하다", "B1"),
    ("Hit the nail on the head", "핵심을 찌르다", "B1"),
    ("Hit the sack", "자러 가다", "A2"),
    ("Jump on the bandwagon", "대세에 편승하다", "B2"),
    ("Keep your chin up", "힘내", "B1"),
    ("Kill two birds with one stone", "일석이조", "B1"),
    ("Let the cat out of the bag", "비밀을 누설하다", "B2"),
    ("Miss the boat", "기회를 놓치다", "B1"),
    ("Once in a blue moon", "가끔", "B1"),
    ("Piece of cake", "식은 죽 먹기", "A2"),
    ("Pull someone's leg", "놀리다", "B1"),
    ("Put all your eggs in one basket", "한 곳에 모든 걸 걸다", "B2"),
    ("Sit on the fence", "중립을 지키다", "B2"),
    ("Speak of the devil", "호랑이도 제 말하면 온다", "B1"),
    ("Spill the beans", "비밀을 털어놓다", "B1"),
    ("Take it with a grain of salt", "반신반의하다", "B2"),
    ("The ball is in your court", "네 차례야", "B1"),
    ("The best of both worlds", "두 마리 토끼를 잡다", "B1"),
    ("Throw in the towel", "포기하다", "B1"),
    ("Under the weather", "몸이 안 좋다", "A2"),
    ("When pigs fly", "절대 안 돼", "B1"),
    ("You can't judge a book by its cover", "겉으로 판단하지 마라", "B1"),
    ("A blessing in disguise", "전화위복", "B1"),
    ("Actions speak louder than words", "행동이 말보다 중요하다", "B1"),
    ("Back to square one", "원점으로 돌아가다", "B1"),
    ("Barking up the wrong tree", "헛수고하다", "B2"),
    ("Birds of a feather flock together", "끼리끼리 어울린다", "B2"),
    ("By the skin of your teeth", "간신히", "B2"),
    ("Caught between a rock and a hard place", "진퇴양난", "B2"),
    ("Cry wolf", "거짓말로 관심 끌다", "B2"),
    ("Cut corners", "적당히 때우다", "B1"),
    ("Down to earth", "현실적인", "B1"),
    ("Drop in the bucket", "새 발의 피", "B2"),
    ("Easier said than done", "말처럼 쉽지 않다", "B1"),
    ("Face the music", "결과를 받아들이다", "B2"),
    ("Get a taste of your own medicine", "자업자득", "B2"),
    ("Get cold feet", "겁이 나다", "B1"),
    ("Get your act together", "정신 차리다", "B1"),
    ("Give the cold shoulder", "무시하다", "B1"),
    ("Go back to the drawing board", "처음부터 다시 하다", "B1"),
    ("Hang in there", "버텨", "A2"),
    ("Have a chip on your shoulder", "앙심을 품다", "C1"),
    ("Hit the books", "열심히 공부하다", "A2"),
    ("In hot water", "곤경에 빠진", "B1"),
    ("It takes two to tango", "쌍방의 책임이다", "B2"),
    ("Jump the gun", "성급하게 행동하다", "B2"),
    ("Keep an eye on", "감시하다", "A2"),
    ("Learn the ropes", "요령을 터득하다", "B1"),
    ("Let sleeping dogs lie", "괜히 건드리지 마라", "B2"),
    ("Make a long story short", "간단히 말하면", "B1"),
    ("No pain, no gain", "고생 끝에 낙이 온다", "A2"),
    ("On the same page", "의견이 같다", "B1"),
    ("Out of the blue", "갑자기", "B1"),
    ("Play devil's advocate", "반론을 제기하다", "B2"),
    ("Pull your weight", "제몫을 다하다", "B2"),
    ("Put yourself in someone's shoes", "역지사지", "B1"),
    ("Rain on someone's parade", "기분을 망치다", "B2"),
    ("Read between the lines", "행간을 읽다", "B2"),
    ("Rome wasn't built in a day", "로마는 하루아침에 이루어지지 않았다", "B1"),
    ("Saving for a rainy day", "만일을 대비하다", "B1"),
    ("See eye to eye", "의견이 일치하다", "B1"),
    ("Smell something fishy", "수상하다", "B1"),
    ("Stabbed in the back", "뒤통수를 맞다", "B2"),
    ("Steal someone's thunder", "남의 공을 가로채다", "C1"),
    ("Take the bull by the horns", "적극적으로 해결하다", "B2"),
    ("The last straw", "인내의 한계", "B2"),
    ("Time flies", "시간이 빨리 간다", "A2"),
    ("Turn a blind eye", "못 본 척하다", "B2"),
    ("Two heads are better than one", "백지장도 맞들면 낫다", "B1"),
    ("Walk on eggshells", "조심조심하다", "B2"),
    ("When in Rome, do as the Romans do", "로마에서는 로마법을 따르라", "B2"),
    ("Wrap your head around something", "이해하다", "B2"),
    ("You can't have your cake and eat it too", "두 가지를 다 가질 순 없다", "B2"),
    ("Your guess is as good as mine", "나도 몰라", "B1"),
    ("Zero in on", "집중하다", "B2"),
    ("A dime a dozen", "흔하디 흔한", "B2"),
    ("All in the same boat", "같은 처지", "B1"),
    ("Beat a dead horse", "소용없는 일을 하다", "B2"),
    ("Better late than never", "늦더라도 안 하는 것보다 낫다", "A2"),
    ("Burning bridges", "관계를 끊다", "B2"),
    ("Cross that bridge when you come to it", "때가 되면 알아서 하겠다", "B2"),
    ("Don't put the cart before the horse", "순서를 따르라", "B2"),
    ("Elephant in the room", "언급하기 불편한 문제", "B2"),
    ("From rags to riches", "가난에서 부자로", "B1"),
    ("Get something off your chest", "속마음을 털어놓다", "B1"),
    ("Give someone the runaround", "핑계대며 피하다", "B2"),
]

def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    chunks = []
    for idiom, meaning, level in IDIOMS:
        chunk = {
            "id": f"idiom_extra_{len(chunks)}",
            "text": f"{idiom}: {meaning}",
            "idiom": idiom,
            "meaning_ko": meaning,
            "type": "idiom",
            "level": level,
            "source": "generated_idioms_extra",
            "category": "expression"
        }
        chunks.append(chunk)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"총 {len(chunks)}개 숙어 생성")
    print(f"저장: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
