"""
상황별/레벨별 시나리오 자동 생성 스크립트
- 다양한 카테고리와 난이도의 시나리오 생성
- LLM을 사용한 자연스러운 대화 생성
"""

import json
from pathlib import Path
from typing import List, Dict

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "scenarios"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# 시나리오 템플릿 정의
SCENARIO_TEMPLATES = {
    # ============ DAILY (일상) ============
    "daily": {
        "beginner": [
            {
                "id": "cafe_order",
                "title": "Ordering at a Cafe",
                "title_ko": "카페에서 주문하기",
                "roles": {"ai": "Barista", "user": "Customer"},
                "estimated_time": "3-5 min",
                "learning_objectives": [
                    "Order drinks politely",
                    "Customize your order",
                    "Pay and receive change"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Greeting",
                        "ai_opening": "Hi! Welcome to Sunny Cafe. What can I get for you today?",
                        "learning_tip": "'I'd like...' 또는 'Can I have...'로 주문하세요",
                        "suggested_responses": [
                            "Hi! I'd like a latte, please.",
                            "Can I have a cappuccino?",
                            "I'll have an americano."
                        ],
                        "expected_user_intents": ["order", "greeting"]
                    },
                    {
                        "stage": 2,
                        "name": "Customization",
                        "ai_prompt": "Ask about size and customization options",
                        "learning_tip": "사이즈는 small/medium/large, 온도는 hot/iced로 말해요",
                        "suggested_responses": [
                            "Medium, please.",
                            "Can I get that iced?",
                            "Hot and large, please."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Payment",
                        "ai_prompt": "Tell the total and ask for payment method",
                        "learning_tip": "결제할 때는 'I'll pay by card/cash'라고 해요",
                        "suggested_responses": [
                            "I'll pay by card.",
                            "Here you go. (cash)",
                            "Can I use Apple Pay?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "I'd like", "meaning": "~하고 싶어요", "example": "I'd like a coffee."},
                    {"word": "to go", "meaning": "포장", "example": "Can I get that to go?"},
                    {"word": "for here", "meaning": "매장 식사", "example": "For here, please."}
                ]
            },
            {
                "id": "grocery_shopping",
                "title": "At the Grocery Store",
                "title_ko": "마트에서 장보기",
                "roles": {"ai": "Store Clerk", "user": "Shopper"},
                "estimated_time": "3-5 min",
                "learning_objectives": [
                    "Ask for item locations",
                    "Inquire about prices",
                    "Use basic shopping phrases"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Finding Items",
                        "ai_opening": "Hello! Can I help you find something?",
                        "learning_tip": "'Where can I find...?'로 물건 위치를 물어보세요",
                        "suggested_responses": [
                            "Where can I find the milk?",
                            "I'm looking for bread.",
                            "Where is the fresh produce?"
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Price Inquiry",
                        "ai_prompt": "Direct customer and offer help with prices",
                        "learning_tip": "'How much is this?'로 가격을 물어요",
                        "suggested_responses": [
                            "How much is this?",
                            "Is there a sale on these?",
                            "Do you have this in a smaller size?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Checkout",
                        "ai_prompt": "Help at checkout",
                        "learning_tip": "'Paper or plastic?'은 종이봉투/비닐봉투 선택이에요",
                        "suggested_responses": [
                            "Paper, please.",
                            "I brought my own bag.",
                            "Can I get a receipt?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "aisle", "meaning": "통로", "example": "It's in aisle 3."},
                    {"word": "on sale", "meaning": "할인 중", "example": "These are on sale."},
                    {"word": "receipt", "meaning": "영수증", "example": "Here's your receipt."}
                ]
            },
            {
                "id": "asking_directions",
                "title": "Asking for Directions",
                "title_ko": "길 물어보기",
                "roles": {"ai": "Local", "user": "Tourist"},
                "estimated_time": "3-4 min",
                "learning_objectives": [
                    "Ask for directions politely",
                    "Understand basic directions",
                    "Thank someone for help"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Getting Attention",
                        "ai_opening": "Yes? Can I help you with something?",
                        "learning_tip": "'Excuse me'로 먼저 주의를 끌어요",
                        "suggested_responses": [
                            "Excuse me, can you help me?",
                            "Hi, I'm a bit lost.",
                            "Could you tell me how to get to the station?"
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Understanding Directions",
                        "ai_prompt": "Give clear directions with landmarks",
                        "learning_tip": "Go straight, turn left/right, on your left/right",
                        "suggested_responses": [
                            "So I turn left at the corner?",
                            "Is it far from here?",
                            "About how long will it take?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Confirmation",
                        "ai_prompt": "Confirm understanding and offer additional help",
                        "learning_tip": "방향을 다시 확인할 때 'So I...' 사용",
                        "suggested_responses": [
                            "Thank you so much!",
                            "I really appreciate your help.",
                            "Got it, thanks!"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "go straight", "meaning": "직진하다", "example": "Go straight for two blocks."},
                    {"word": "turn left/right", "meaning": "좌/우회전", "example": "Turn right at the light."},
                    {"word": "on the corner", "meaning": "모퉁이에", "example": "It's on the corner."}
                ]
            }
        ],
        "intermediate": [
            {
                "id": "restaurant_order",
                "title": "Dining at a Restaurant",
                "title_ko": "레스토랑에서 식사하기",
                "roles": {"ai": "Server", "user": "Customer"},
                "estimated_time": "5-7 min",
                "learning_objectives": [
                    "Make reservations",
                    "Order food with modifications",
                    "Handle special requests"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Arrival",
                        "ai_opening": "Good evening! Do you have a reservation?",
                        "learning_tip": "'A table for two, please'처럼 인원수 말하기",
                        "suggested_responses": [
                            "Yes, under the name Kim.",
                            "No, but do you have a table for two?",
                            "I called earlier for a reservation."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Ordering",
                        "ai_prompt": "Present menu and take order",
                        "learning_tip": "알레르기나 요청사항은 'I'm allergic to...' 또는 'Could you...'로",
                        "suggested_responses": [
                            "I'll have the grilled salmon.",
                            "Does this contain nuts? I'm allergic.",
                            "Could I get the sauce on the side?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "During the Meal",
                        "ai_prompt": "Check on the meal",
                        "learning_tip": "추가 요청은 'Could I have some more...'",
                        "suggested_responses": [
                            "Could I have some more water?",
                            "This is delicious!",
                            "Actually, I think there's a mistake with my order."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Bill",
                        "ai_prompt": "Bring the check and process payment",
                        "learning_tip": "'Check, please' 또는 'Can I have the bill?'로 계산 요청",
                        "suggested_responses": [
                            "Can I have the check, please?",
                            "We'd like to split the bill.",
                            "Is tip included?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "reservation", "meaning": "예약", "example": "I have a reservation for 7pm."},
                    {"word": "appetizer", "meaning": "전채요리", "example": "What appetizers do you recommend?"},
                    {"word": "split the bill", "meaning": "나눠 내다", "example": "Can we split the bill?"}
                ]
            },
            {
                "id": "doctor_visit",
                "title": "Visiting the Doctor",
                "title_ko": "병원 방문하기",
                "roles": {"ai": "Doctor", "user": "Patient"},
                "estimated_time": "5-7 min",
                "learning_objectives": [
                    "Describe symptoms",
                    "Understand medical advice",
                    "Ask about medication"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Check-in",
                        "ai_opening": "Hello, I'm Dr. Smith. What brings you in today?",
                        "learning_tip": "증상을 설명할 때 'I have a...' 또는 'I've been experiencing...'",
                        "suggested_responses": [
                            "I've been having headaches for a few days.",
                            "I have a sore throat and a cough.",
                            "I've been feeling really tired lately."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Examination",
                        "ai_prompt": "Ask follow-up questions about symptoms",
                        "learning_tip": "'It started...' 'It gets worse when...'로 상세히 설명",
                        "suggested_responses": [
                            "It started about three days ago.",
                            "It gets worse at night.",
                            "I also have a fever."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Diagnosis",
                        "ai_prompt": "Explain the diagnosis",
                        "learning_tip": "이해가 안 되면 'Could you explain that again?'",
                        "suggested_responses": [
                            "Is it serious?",
                            "What should I do?",
                            "How long will it take to recover?"
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Prescription",
                        "ai_prompt": "Provide treatment plan and medication",
                        "learning_tip": "복용법은 'How often should I take this?'로 확인",
                        "suggested_responses": [
                            "How many times a day should I take this?",
                            "Are there any side effects?",
                            "Do I need a follow-up appointment?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "symptoms", "meaning": "증상", "example": "What are your symptoms?"},
                    {"word": "prescription", "meaning": "처방전", "example": "Here's your prescription."},
                    {"word": "side effects", "meaning": "부작용", "example": "This may cause side effects."}
                ]
            }
        ],
        "advanced": [
            {
                "id": "complaint_handling",
                "title": "Making a Complaint",
                "title_ko": "불만 제기하기",
                "roles": {"ai": "Customer Service Rep", "user": "Customer"},
                "estimated_time": "6-8 min",
                "learning_objectives": [
                    "Express dissatisfaction politely",
                    "Negotiate solutions",
                    "Assert your rights diplomatically"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Stating the Problem",
                        "ai_opening": "Customer service, how may I assist you today?",
                        "learning_tip": "'I'm calling about...' 'There seems to be an issue with...'",
                        "suggested_responses": [
                            "I'm calling about an issue with my recent order.",
                            "I'd like to make a complaint about the service I received.",
                            "There seems to be a problem with my bill."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Explaining Details",
                        "ai_prompt": "Ask for more details about the issue",
                        "learning_tip": "상황을 차분하고 구체적으로 설명하세요",
                        "suggested_responses": [
                            "The product arrived damaged, and I have photos.",
                            "I was charged twice for the same item.",
                            "The service was not as advertised."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Seeking Resolution",
                        "ai_prompt": "Offer potential solutions",
                        "learning_tip": "'I would appreciate it if...' 'Could you please...'",
                        "suggested_responses": [
                            "I would like a full refund, please.",
                            "Could you send a replacement instead?",
                            "I'd appreciate some form of compensation."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Escalation (if needed)",
                        "ai_prompt": "Respond to escalation request",
                        "learning_tip": "'I'd like to speak with a manager'는 정중하게",
                        "suggested_responses": [
                            "If that's not possible, I'd like to speak with a manager.",
                            "This is not acceptable. What else can you do?",
                            "I understand your position, but I need a better solution."
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "compensation", "meaning": "보상", "example": "I expect some compensation."},
                    {"word": "refund", "meaning": "환불", "example": "I'd like a refund."},
                    {"word": "escalate", "meaning": "상급자에게 올리다", "example": "I need to escalate this."}
                ]
            }
        ]
    },

    # ============ TRAVEL (여행) ============
    "travel": {
        "beginner": [
            {
                "id": "hotel_checkin",
                "title": "Hotel Check-in",
                "title_ko": "호텔 체크인하기",
                "roles": {"ai": "Receptionist", "user": "Guest"},
                "estimated_time": "4-6 min",
                "learning_objectives": [
                    "Check into a hotel",
                    "Ask about amenities",
                    "Request room changes"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Arrival",
                        "ai_opening": "Good afternoon! Welcome to Grand Hotel. Do you have a reservation?",
                        "learning_tip": "예약 확인할 때 'I have a reservation under...'",
                        "suggested_responses": [
                            "Yes, I have a reservation under Kim.",
                            "Hi, checking in. Reservation number is 12345.",
                            "Yes, I booked through the website."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Verification",
                        "ai_prompt": "Ask for ID and confirm reservation details",
                        "learning_tip": "여권이나 신분증을 'Here's my passport/ID'로 건네요",
                        "suggested_responses": [
                            "Here's my passport.",
                            "I booked for two nights, is that correct?",
                            "I requested a non-smoking room."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Room Information",
                        "ai_prompt": "Provide room details and hotel information",
                        "learning_tip": "시설 위치는 'Where is the...?'로 물어요",
                        "suggested_responses": [
                            "What floor is my room on?",
                            "Where is the breakfast room?",
                            "Is WiFi included?"
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Completion",
                        "ai_prompt": "Give room key and final information",
                        "learning_tip": "체크아웃 시간 확인 'What time is checkout?'",
                        "suggested_responses": [
                            "What time is checkout?",
                            "Can I leave my luggage after checkout?",
                            "Thank you very much!"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "reservation", "meaning": "예약", "example": "I have a reservation."},
                    {"word": "check-in/out", "meaning": "체크인/아웃", "example": "Checkout is at 11am."},
                    {"word": "amenities", "meaning": "편의시설", "example": "What amenities do you offer?"}
                ]
            },
            {
                "id": "taxi_ride",
                "title": "Taking a Taxi",
                "title_ko": "택시 타기",
                "roles": {"ai": "Taxi Driver", "user": "Passenger"},
                "estimated_time": "3-4 min",
                "learning_objectives": [
                    "Give destinations",
                    "Ask about fares",
                    "Make simple requests"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Destination",
                        "ai_opening": "Where to?",
                        "learning_tip": "'To the airport, please' 또는 주소를 직접 말해요",
                        "suggested_responses": [
                            "To the airport, please.",
                            "Can you take me to this address?",
                            "Central Station, please."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "During the Ride",
                        "ai_prompt": "Small talk and updates on the ride",
                        "learning_tip": "요청할 때 'Could you...' 사용",
                        "suggested_responses": [
                            "Could you turn on the AC?",
                            "How long will it take?",
                            "Is this the fastest route?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Payment",
                        "ai_prompt": "Arrive and collect fare",
                        "learning_tip": "'Keep the change'는 잔돈은 가지세요라는 뜻",
                        "suggested_responses": [
                            "How much is it?",
                            "Do you take cards?",
                            "Keep the change."
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "fare", "meaning": "요금", "example": "What's the fare to downtown?"},
                    {"word": "keep the change", "meaning": "잔돈은 가지세요", "example": "Keep the change."},
                    {"word": "meter", "meaning": "미터기", "example": "Please use the meter."}
                ]
            }
        ],
        "intermediate": [
            {
                "id": "airport_checkin",
                "title": "Airport Check-in",
                "title_ko": "공항 체크인하기",
                "roles": {"ai": "Airline Staff", "user": "Passenger"},
                "estimated_time": "5-7 min",
                "learning_objectives": [
                    "Check in for flights",
                    "Handle baggage",
                    "Navigate airport procedures"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Check-in Counter",
                        "ai_opening": "Good morning! May I see your passport and booking confirmation?",
                        "learning_tip": "예약 확인서는 booking confirmation, 여권은 passport",
                        "suggested_responses": [
                            "Here's my passport and confirmation.",
                            "I booked online, here's my reference number.",
                            "I already checked in online."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Baggage",
                        "ai_prompt": "Ask about baggage and check bags",
                        "learning_tip": "위탁 수하물은 checked baggage, 기내 반입은 carry-on",
                        "suggested_responses": [
                            "I have one bag to check.",
                            "Is my carry-on within the size limit?",
                            "I have a connecting flight. Will my bag go through?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Seat Selection",
                        "ai_prompt": "Discuss seat preferences",
                        "learning_tip": "창가는 window seat, 복도는 aisle seat",
                        "suggested_responses": [
                            "Can I have a window seat?",
                            "Do you have any aisle seats available?",
                            "I'd like to sit near the front."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Gate Information",
                        "ai_prompt": "Provide boarding pass and gate information",
                        "learning_tip": "탑승구는 gate, 탑승 시간은 boarding time",
                        "suggested_responses": [
                            "What gate do I go to?",
                            "What time does boarding start?",
                            "Where is the lounge?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "boarding pass", "meaning": "탑승권", "example": "Here's your boarding pass."},
                    {"word": "layover", "meaning": "경유", "example": "I have a 3-hour layover."},
                    {"word": "gate", "meaning": "탑승구", "example": "Your gate is B12."}
                ]
            },
            {
                "id": "car_rental",
                "title": "Renting a Car",
                "title_ko": "렌터카 빌리기",
                "roles": {"ai": "Rental Agent", "user": "Customer"},
                "estimated_time": "5-7 min",
                "learning_objectives": [
                    "Rent a vehicle",
                    "Understand insurance options",
                    "Handle pick-up and drop-off"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Reservation",
                        "ai_opening": "Welcome to Quick Rentals! Do you have a reservation?",
                        "learning_tip": "차종은 compact, sedan, SUV 등으로 구분",
                        "suggested_responses": [
                            "Yes, I have a reservation under Kim.",
                            "I'd like to rent a car for three days.",
                            "Do you have any compact cars available?"
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Vehicle Selection",
                        "ai_prompt": "Discuss vehicle options",
                        "learning_tip": "자동변속기는 automatic, 수동은 manual/stick shift",
                        "suggested_responses": [
                            "I'd prefer an automatic.",
                            "What's the difference between these two?",
                            "Does it come with GPS?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Insurance",
                        "ai_prompt": "Explain insurance options",
                        "learning_tip": "보험은 꼭 확인! CDW(충돌 면책), liability(책임 보험)",
                        "suggested_responses": [
                            "What insurance options do you have?",
                            "Is liability insurance included?",
                            "I'll take the full coverage."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Completion",
                        "ai_prompt": "Finalize rental and provide keys",
                        "learning_tip": "반납 시 연료 정책 확인 - 'full to full' 또는 prepaid fuel",
                        "suggested_responses": [
                            "Where do I return the car?",
                            "Do I need to fill up before returning?",
                            "What if I want to extend the rental?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "insurance", "meaning": "보험", "example": "Would you like insurance?"},
                    {"word": "GPS/navigation", "meaning": "내비게이션", "example": "Does it include GPS?"},
                    {"word": "drop-off", "meaning": "반납", "example": "The drop-off location is downtown."}
                ]
            }
        ],
        "advanced": [
            {
                "id": "flight_problem",
                "title": "Handling Flight Problems",
                "title_ko": "항공편 문제 해결하기",
                "roles": {"ai": "Airline Agent", "user": "Passenger"},
                "estimated_time": "6-8 min",
                "learning_objectives": [
                    "Handle delays and cancellations",
                    "Request rebooking",
                    "Assert passenger rights"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Problem Report",
                        "ai_opening": "I'm sorry, but your flight has been cancelled. How can I assist you?",
                        "learning_tip": "상황을 명확히 파악하세요 - delay(지연), cancel(취소)",
                        "suggested_responses": [
                            "Why was the flight cancelled?",
                            "What options do I have now?",
                            "I need to get to Seoul urgently."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Options Discussion",
                        "ai_prompt": "Present available options",
                        "learning_tip": "다른 항공사 연결은 'endorsement', 다음 편은 'next available'",
                        "suggested_responses": [
                            "Can you book me on the next available flight?",
                            "What about other airlines?",
                            "Can I get a refund instead?"
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Compensation",
                        "ai_prompt": "Discuss compensation options",
                        "learning_tip": "장시간 지연 시 식사/숙박 voucher 요청 가능",
                        "suggested_responses": [
                            "Am I entitled to compensation?",
                            "Can you provide hotel accommodation?",
                            "I need a meal voucher."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Confirmation",
                        "ai_prompt": "Finalize arrangements",
                        "learning_tip": "새 일정 확인서를 받으세요",
                        "suggested_responses": [
                            "Can I get this in writing?",
                            "Please confirm my new itinerary.",
                            "What's the confirmation number?"
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "compensation", "meaning": "보상", "example": "You're entitled to compensation."},
                    {"word": "rebook", "meaning": "재예약", "example": "Let me rebook you."},
                    {"word": "voucher", "meaning": "바우처", "example": "Here's a meal voucher."}
                ]
            }
        ]
    },

    # ============ BUSINESS (비즈니스) ============
    "business": {
        "intermediate": [
            {
                "id": "phone_call",
                "title": "Business Phone Call",
                "title_ko": "비즈니스 전화 통화",
                "roles": {"ai": "Business Contact", "user": "Caller"},
                "estimated_time": "5-6 min",
                "learning_objectives": [
                    "Make professional phone calls",
                    "Leave messages",
                    "Schedule appointments"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Introduction",
                        "ai_opening": "ABC Company, this is Sarah speaking. How may I help you?",
                        "learning_tip": "전화 시 본인 소개 - 'This is [name] from [company]'",
                        "suggested_responses": [
                            "Hello, this is Park from XYZ Company.",
                            "Hi, I'm calling about the project proposal.",
                            "May I speak with Mr. Johnson, please?"
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Purpose",
                        "ai_prompt": "Ask about the purpose of the call",
                        "learning_tip": "'The reason I'm calling is...'로 용건을 말해요",
                        "suggested_responses": [
                            "The reason I'm calling is to discuss the contract.",
                            "I'd like to schedule a meeting.",
                            "I'm following up on our previous conversation."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Discussion",
                        "ai_prompt": "Handle the main conversation",
                        "learning_tip": "확인할 때 'Let me confirm...' 사용",
                        "suggested_responses": [
                            "Would Thursday at 2pm work for you?",
                            "Let me check my calendar.",
                            "Could you send me the details via email?"
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Closing",
                        "ai_prompt": "Wrap up the call",
                        "learning_tip": "마무리는 'Thank you for your time'",
                        "suggested_responses": [
                            "Thank you for your time.",
                            "I'll send a follow-up email.",
                            "Let's touch base next week."
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "follow up", "meaning": "후속 조치", "example": "I'm following up on our meeting."},
                    {"word": "touch base", "meaning": "연락하다", "example": "Let's touch base soon."},
                    {"word": "schedule", "meaning": "일정 잡다", "example": "Can we schedule a call?"}
                ]
            }
        ],
        "advanced": [
            {
                "id": "job_interview",
                "title": "Job Interview",
                "title_ko": "영어 면접 보기",
                "roles": {"ai": "Interviewer", "user": "Candidate"},
                "estimated_time": "10-15 min",
                "learning_objectives": [
                    "Answer common interview questions",
                    "Present qualifications professionally",
                    "Ask thoughtful questions"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Introduction",
                        "ai_opening": "Thank you for coming in today. Please, tell me about yourself.",
                        "learning_tip": "자기소개는 2-3분, 경력 중심으로 간결하게",
                        "suggested_responses": [
                            "Thank you for this opportunity. I'm a software developer with 5 years of experience...",
                            "I'm excited to be here. Currently, I work at ABC Company as a project manager...",
                            "I appreciate the opportunity. Let me give you a brief overview of my background..."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Experience",
                        "ai_prompt": "Ask about relevant experience",
                        "learning_tip": "STAR 방법: Situation, Task, Action, Result",
                        "suggested_responses": [
                            "In my previous role, I led a team of five...",
                            "Let me give you a specific example...",
                            "One of my key achievements was..."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Challenges",
                        "ai_prompt": "Ask about challenges and weaknesses",
                        "learning_tip": "약점은 개선 노력과 함께 말하기",
                        "suggested_responses": [
                            "A challenge I faced was... and I overcame it by...",
                            "I consider my weakness to be... but I've been working on...",
                            "I turned that challenge into a learning opportunity."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Questions",
                        "ai_prompt": "Ask if the candidate has questions",
                        "learning_tip": "질문 준비 필수! 회사 문화, 팀, 성장 기회 등",
                        "suggested_responses": [
                            "Could you tell me about the team I'd be working with?",
                            "What does success look like in this role?",
                            "What are the growth opportunities here?"
                        ]
                    },
                    {
                        "stage": 5,
                        "name": "Closing",
                        "ai_prompt": "Close the interview",
                        "learning_tip": "마무리는 감사 인사와 열정 표현",
                        "suggested_responses": [
                            "Thank you for your time. I'm very excited about this opportunity.",
                            "I appreciate you considering me for this position.",
                            "This role aligns perfectly with my career goals."
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "achievement", "meaning": "성과", "example": "My biggest achievement was..."},
                    {"word": "collaborate", "meaning": "협업하다", "example": "I collaborated with the team."},
                    {"word": "initiative", "meaning": "주도성", "example": "I took initiative on the project."}
                ]
            },
            {
                "id": "business_meeting",
                "title": "Business Meeting",
                "title_ko": "비즈니스 미팅",
                "roles": {"ai": "Meeting Participant", "user": "Presenter"},
                "estimated_time": "8-12 min",
                "learning_objectives": [
                    "Present ideas professionally",
                    "Handle questions and objections",
                    "Reach agreements"
                ],
                "stages": [
                    {
                        "stage": 1,
                        "name": "Opening",
                        "ai_opening": "Shall we get started? What's on the agenda today?",
                        "learning_tip": "회의 시작 - 'Let's begin with...' 'Today, I'd like to cover...'",
                        "suggested_responses": [
                            "Thank you everyone. Today, I'd like to present our Q4 strategy.",
                            "Let's start with a quick recap of last meeting.",
                            "I have three items on the agenda today."
                        ]
                    },
                    {
                        "stage": 2,
                        "name": "Presentation",
                        "ai_prompt": "Engage with the presentation",
                        "learning_tip": "포인트 강조 - 'The key point here is...' 'I'd like to highlight...'",
                        "suggested_responses": [
                            "The key point here is that our sales increased by 20%.",
                            "I'd like to highlight three main factors.",
                            "As you can see from this chart..."
                        ]
                    },
                    {
                        "stage": 3,
                        "name": "Q&A",
                        "ai_prompt": "Ask clarifying questions",
                        "learning_tip": "질문 받기 - 'Does anyone have questions?' 답변 - 'That's a great question.'",
                        "suggested_responses": [
                            "That's a great question. Let me explain...",
                            "I'm glad you brought that up.",
                            "I'll need to get back to you on that."
                        ]
                    },
                    {
                        "stage": 4,
                        "name": "Action Items",
                        "ai_prompt": "Discuss next steps",
                        "learning_tip": "다음 단계 정리 - 'The action items are...' 'Who will take the lead on...?'",
                        "suggested_responses": [
                            "So the action items are...",
                            "I'll take the lead on this.",
                            "Can we set a deadline for next Friday?"
                        ]
                    },
                    {
                        "stage": 5,
                        "name": "Closing",
                        "ai_prompt": "Wrap up the meeting",
                        "learning_tip": "회의 마무리 - 'Thank you for your input' 'Let's reconvene...'",
                        "suggested_responses": [
                            "Thank you all for your valuable input.",
                            "Let's reconvene next week to review progress.",
                            "I'll send the meeting minutes by end of day."
                        ]
                    }
                ],
                "key_vocabulary": [
                    {"word": "agenda", "meaning": "의제", "example": "What's on the agenda?"},
                    {"word": "action item", "meaning": "실행 항목", "example": "Let's review the action items."},
                    {"word": "deadline", "meaning": "마감일", "example": "When is the deadline?"}
                ]
            }
        ]
    }
}


def generate_all_scenarios():
    """모든 시나리오 생성 및 저장"""
    all_scenarios = []

    for category, levels in SCENARIO_TEMPLATES.items():
        for level, scenarios in levels.items():
            for scenario in scenarios:
                # 기본 필드 추가
                scenario["category"] = category
                scenario["difficulty"] = level

                # 메타데이터 추가
                scenario["icon"] = get_icon_for_category(category)
                scenario["completion_message"] = f"Great job completing the {scenario['title']} scenario!"

                all_scenarios.append(scenario)

                # 개별 파일로 저장
                filename = f"{scenario['id']}.json"
                filepath = OUTPUT_DIR / filename

                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(scenario, f, ensure_ascii=False, indent=2)

                print(f"Created: {filename}")

    # 전체 목록 저장
    index_file = OUTPUT_DIR / "_index.json"
    index_data = {
        "total": len(all_scenarios),
        "by_category": {},
        "by_level": {},
        "scenarios": [
            {
                "id": s["id"],
                "title": s["title"],
                "title_ko": s["title_ko"],
                "category": s["category"],
                "difficulty": s["difficulty"],
                "estimated_time": s.get("estimated_time", "5 min")
            }
            for s in all_scenarios
        ]
    }

    # 통계
    for s in all_scenarios:
        cat = s["category"]
        level = s["difficulty"]
        index_data["by_category"][cat] = index_data["by_category"].get(cat, 0) + 1
        index_data["by_level"][level] = index_data["by_level"].get(level, 0) + 1

    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

    print(f"\nTotal scenarios: {len(all_scenarios)}")
    print(f"Index saved to: {index_file}")

    return all_scenarios


def get_icon_for_category(category: str) -> str:
    """카테고리별 아이콘"""
    icons = {
        "daily": "coffee",
        "travel": "plane",
        "business": "briefcase"
    }
    return icons.get(category, "book")


if __name__ == "__main__":
    print("=" * 60)
    print("시나리오 생성 스크립트")
    print("=" * 60)

    scenarios = generate_all_scenarios()

    print("\n" + "=" * 60)
    print("By Category:")
    category_counts = {}
    for s in scenarios:
        cat = s["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    for cat, count in category_counts.items():
        print(f"  {cat}: {count}")

    print("\nBy Difficulty:")
    level_counts = {}
    for s in scenarios:
        level = s["difficulty"]
        level_counts[level] = level_counts.get(level, 0) + 1
    for level, count in level_counts.items():
        print(f"  {level}: {count}")

    print("\nDone!")
