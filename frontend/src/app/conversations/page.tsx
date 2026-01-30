'use client'

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface Scenario {
  id: string
  title: string
  title_ko: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
}

interface Category {
  id: string
  name: string
  name_ko: string
  icon: string
  color: string
  scenarios: Scenario[]
}

const CATEGORIES: Category[] = [
  {
    id: 'daily',
    name: 'Daily Life',
    name_ko: '일상 생활',
    icon: 'sun',
    color: 'bg-yellow-500',
    scenarios: [
      { id: 'morning_routine', title: 'Morning Routine', title_ko: '아침 일과', description: '아침에 일어나서 하는 일상 대화', difficulty: 'beginner', duration: '5분' },
      { id: 'grocery_shopping', title: 'Grocery Shopping', title_ko: '장보기', description: '마트에서 물건 사기', difficulty: 'beginner', duration: '5분' },
      { id: 'neighbor_chat', title: 'Chatting with Neighbors', title_ko: '이웃과 대화', description: '이웃과 가벼운 인사', difficulty: 'beginner', duration: '5분' },
      { id: 'weather_talk', title: 'Weather Small Talk', title_ko: '날씨 이야기', description: '날씨에 대한 스몰톡', difficulty: 'beginner', duration: '3분' },
      { id: 'weekend_plans', title: 'Weekend Plans', title_ko: '주말 계획', description: '주말 계획 이야기하기', difficulty: 'beginner', duration: '5분' },
      { id: 'house_chores', title: 'House Chores', title_ko: '집안일', description: '집안일에 대한 대화', difficulty: 'beginner', duration: '5분' },
      { id: 'pet_care', title: 'Pet Care', title_ko: '반려동물 돌봄', description: '반려동물에 대한 대화', difficulty: 'intermediate', duration: '7분' },
      { id: 'home_repair', title: 'Home Repair', title_ko: '집 수리', description: '집 수리 관련 대화', difficulty: 'intermediate', duration: '7분' },
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Food',
    name_ko: '음식점 & 음식',
    icon: 'utensils',
    color: 'bg-orange-500',
    scenarios: [
      { id: 'cafe_order', title: 'Ordering at a Cafe', title_ko: '카페 주문', description: '카페에서 음료 주문하기', difficulty: 'beginner', duration: '5분' },
      { id: 'restaurant_reservation', title: 'Making Reservation', title_ko: '예약하기', description: '레스토랑 예약하기', difficulty: 'beginner', duration: '5분' },
      { id: 'ordering_food', title: 'Ordering Food', title_ko: '음식 주문', description: '레스토랑에서 음식 주문', difficulty: 'beginner', duration: '7분' },
      { id: 'asking_recommendation', title: 'Asking for Recommendations', title_ko: '추천 요청', description: '메뉴 추천 받기', difficulty: 'beginner', duration: '5분' },
      { id: 'food_allergy', title: 'Food Allergies', title_ko: '음식 알레르기', description: '알레르기 설명하기', difficulty: 'intermediate', duration: '5분' },
      { id: 'complaint', title: 'Making a Complaint', title_ko: '불만 표현', description: '음식/서비스 불만 표현', difficulty: 'intermediate', duration: '7분' },
      { id: 'paying_bill', title: 'Paying the Bill', title_ko: '계산하기', description: '계산서 요청 및 결제', difficulty: 'beginner', duration: '5분' },
      { id: 'takeout_delivery', title: 'Takeout & Delivery', title_ko: '포장 & 배달', description: '포장 주문 및 배달 요청', difficulty: 'beginner', duration: '5분' },
      { id: 'food_review', title: 'Discussing Food', title_ko: '음식 평가', description: '음식에 대해 이야기하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'cooking_recipe', title: 'Sharing Recipes', title_ko: '레시피 공유', description: '요리법 설명하기', difficulty: 'intermediate', duration: '10분' },
    ]
  },
  {
    id: 'travel',
    name: 'Travel',
    name_ko: '여행',
    icon: 'plane',
    color: 'bg-blue-500',
    scenarios: [
      { id: 'airport_checkin', title: 'Airport Check-in', title_ko: '공항 체크인', description: '공항에서 체크인하기', difficulty: 'beginner', duration: '7분' },
      { id: 'immigration', title: 'Immigration', title_ko: '입국 심사', description: '입국 심사 통과하기', difficulty: 'intermediate', duration: '5분' },
      { id: 'hotel_checkin', title: 'Hotel Check-in', title_ko: '호텔 체크인', description: '호텔에서 체크인하기', difficulty: 'beginner', duration: '7분' },
      { id: 'hotel_request', title: 'Hotel Requests', title_ko: '호텔 요청', description: '룸서비스, 추가 요청하기', difficulty: 'intermediate', duration: '5분' },
      { id: 'asking_directions', title: 'Asking Directions', title_ko: '길 묻기', description: '길 물어보기', difficulty: 'beginner', duration: '5분' },
      { id: 'public_transport', title: 'Public Transport', title_ko: '대중교통', description: '버스, 지하철 이용하기', difficulty: 'beginner', duration: '5분' },
      { id: 'taxi_ride', title: 'Taking a Taxi', title_ko: '택시 타기', description: '택시 이용하기', difficulty: 'beginner', duration: '5분' },
      { id: 'car_rental', title: 'Renting a Car', title_ko: '렌터카', description: '차량 렌트하기', difficulty: 'intermediate', duration: '10분' },
      { id: 'tourist_info', title: 'Tourist Information', title_ko: '관광 정보', description: '관광 정보 문의하기', difficulty: 'beginner', duration: '5분' },
      { id: 'tour_booking', title: 'Booking Tours', title_ko: '투어 예약', description: '투어 예약하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'lost_luggage', title: 'Lost Luggage', title_ko: '분실 수하물', description: '수하물 분실 신고', difficulty: 'intermediate', duration: '7분' },
      { id: 'travel_emergency', title: 'Travel Emergency', title_ko: '여행 중 긴급상황', description: '긴급 상황 대처', difficulty: 'advanced', duration: '10분' },
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    name_ko: '쇼핑',
    icon: 'shopping-bag',
    color: 'bg-pink-500',
    scenarios: [
      { id: 'clothing_store', title: 'Clothing Store', title_ko: '옷 가게', description: '옷 쇼핑하기', difficulty: 'beginner', duration: '7분' },
      { id: 'trying_on', title: 'Trying On Clothes', title_ko: '옷 입어보기', description: '피팅룸에서 옷 입어보기', difficulty: 'beginner', duration: '5분' },
      { id: 'asking_size', title: 'Asking for Size', title_ko: '사이즈 문의', description: '사이즈 물어보기', difficulty: 'beginner', duration: '3분' },
      { id: 'electronics_store', title: 'Electronics Store', title_ko: '전자제품 매장', description: '전자제품 구매하기', difficulty: 'intermediate', duration: '10분' },
      { id: 'return_exchange', title: 'Returns & Exchanges', title_ko: '환불 & 교환', description: '물건 환불/교환하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'bargaining', title: 'Bargaining', title_ko: '흥정하기', description: '가격 흥정하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'gift_shopping', title: 'Gift Shopping', title_ko: '선물 쇼핑', description: '선물 고르기', difficulty: 'beginner', duration: '5분' },
      { id: 'online_shopping', title: 'Online Shopping Help', title_ko: '온라인 쇼핑 문의', description: '온라인 주문 관련 문의', difficulty: 'intermediate', duration: '7분' },
    ]
  },
  {
    id: 'work',
    name: 'Business & Work',
    name_ko: '비즈니스 & 업무',
    icon: 'briefcase',
    color: 'bg-gray-700',
    scenarios: [
      { id: 'job_interview', title: 'Job Interview', title_ko: '면접', description: '영어 면접 보기', difficulty: 'advanced', duration: '15분' },
      { id: 'self_introduction', title: 'Self Introduction', title_ko: '자기소개', description: '비즈니스 자기소개', difficulty: 'intermediate', duration: '5분' },
      { id: 'meeting_intro', title: 'Meeting Introduction', title_ko: '회의 시작', description: '회의 시작 및 안건 소개', difficulty: 'intermediate', duration: '7분' },
      { id: 'presentation', title: 'Giving Presentation', title_ko: '프레젠테이션', description: '발표하기', difficulty: 'advanced', duration: '15분' },
      { id: 'phone_call', title: 'Business Phone Call', title_ko: '업무 전화', description: '업무 전화 받기/걸기', difficulty: 'intermediate', duration: '7분' },
      { id: 'email_discussion', title: 'Discussing Emails', title_ko: '이메일 논의', description: '이메일 내용 논의하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'negotiation', title: 'Negotiation', title_ko: '협상', description: '비즈니스 협상하기', difficulty: 'advanced', duration: '15분' },
      { id: 'networking', title: 'Networking Event', title_ko: '네트워킹', description: '비즈니스 네트워킹', difficulty: 'intermediate', duration: '10분' },
      { id: 'asking_help', title: 'Asking for Help', title_ko: '도움 요청', description: '동료에게 도움 요청하기', difficulty: 'beginner', duration: '5분' },
      { id: 'giving_feedback', title: 'Giving Feedback', title_ko: '피드백 주기', description: '건설적인 피드백 주기', difficulty: 'intermediate', duration: '7분' },
      { id: 'deadline_extension', title: 'Deadline Extension', title_ko: '마감 연장', description: '마감 연장 요청하기', difficulty: 'intermediate', duration: '5분' },
      { id: 'resignation', title: 'Resignation Talk', title_ko: '퇴사 대화', description: '퇴사 의사 전달하기', difficulty: 'advanced', duration: '10분' },
    ]
  },
  {
    id: 'health',
    name: 'Health & Medical',
    name_ko: '건강 & 의료',
    icon: 'heart',
    color: 'bg-red-500',
    scenarios: [
      { id: 'doctor_appointment', title: 'Doctor Appointment', title_ko: '병원 예약', description: '병원 예약하기', difficulty: 'beginner', duration: '5분' },
      { id: 'describing_symptoms', title: 'Describing Symptoms', title_ko: '증상 설명', description: '증상 설명하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'pharmacy', title: 'At the Pharmacy', title_ko: '약국에서', description: '약국에서 약 구매하기', difficulty: 'beginner', duration: '5분' },
      { id: 'emergency_room', title: 'Emergency Room', title_ko: '응급실', description: '응급실 방문', difficulty: 'intermediate', duration: '10분' },
      { id: 'dentist', title: 'At the Dentist', title_ko: '치과에서', description: '치과 진료 받기', difficulty: 'intermediate', duration: '7분' },
      { id: 'eye_exam', title: 'Eye Examination', title_ko: '안과 검진', description: '안과 검진 받기', difficulty: 'intermediate', duration: '7분' },
      { id: 'health_insurance', title: 'Health Insurance', title_ko: '건강 보험', description: '보험 관련 문의', difficulty: 'advanced', duration: '10분' },
      { id: 'mental_health', title: 'Mental Health', title_ko: '정신 건강', description: '정신 건강 상담', difficulty: 'advanced', duration: '10분' },
    ]
  },
  {
    id: 'social',
    name: 'Social & Friends',
    name_ko: '사교 & 친구',
    icon: 'users',
    color: 'bg-purple-500',
    scenarios: [
      { id: 'making_friends', title: 'Making Friends', title_ko: '친구 사귀기', description: '새로운 친구 만들기', difficulty: 'beginner', duration: '7분' },
      { id: 'party_invitation', title: 'Party Invitation', title_ko: '파티 초대', description: '파티에 초대하기/받기', difficulty: 'beginner', duration: '5분' },
      { id: 'catching_up', title: 'Catching Up', title_ko: '근황 나누기', description: '오랜만에 만난 친구와 대화', difficulty: 'intermediate', duration: '10분' },
      { id: 'giving_compliments', title: 'Giving Compliments', title_ko: '칭찬하기', description: '칭찬 표현하기', difficulty: 'beginner', duration: '5분' },
      { id: 'apology', title: 'Making Apology', title_ko: '사과하기', description: '진심으로 사과하기', difficulty: 'intermediate', duration: '5분' },
      { id: 'consoling', title: 'Consoling a Friend', title_ko: '위로하기', description: '친구 위로하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'giving_advice', title: 'Giving Advice', title_ko: '조언하기', description: '친구에게 조언하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'declining_politely', title: 'Declining Politely', title_ko: '정중히 거절', description: '정중하게 거절하기', difficulty: 'intermediate', duration: '5분' },
      { id: 'sharing_news', title: 'Sharing Good News', title_ko: '좋은 소식 나누기', description: '기쁜 소식 전하기', difficulty: 'beginner', duration: '5분' },
      { id: 'discussing_hobbies', title: 'Discussing Hobbies', title_ko: '취미 이야기', description: '취미에 대해 대화하기', difficulty: 'beginner', duration: '7분' },
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    name_ko: '엔터테인먼트',
    icon: 'film',
    color: 'bg-indigo-500',
    scenarios: [
      { id: 'movie_tickets', title: 'Buying Movie Tickets', title_ko: '영화표 구매', description: '영화표 예매하기', difficulty: 'beginner', duration: '5분' },
      { id: 'movie_discussion', title: 'Discussing Movies', title_ko: '영화 토론', description: '영화에 대해 이야기하기', difficulty: 'intermediate', duration: '10분' },
      { id: 'concert_tickets', title: 'Concert Tickets', title_ko: '콘서트 티켓', description: '콘서트 티켓 구매', difficulty: 'beginner', duration: '5분' },
      { id: 'museum_visit', title: 'Museum Visit', title_ko: '박물관 방문', description: '박물관 관람하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'sports_event', title: 'Sports Event', title_ko: '스포츠 경기', description: '스포츠 경기 관람', difficulty: 'intermediate', duration: '7분' },
      { id: 'gym_membership', title: 'Gym Membership', title_ko: '헬스장 등록', description: '헬스장 회원 등록', difficulty: 'beginner', duration: '5분' },
      { id: 'book_club', title: 'Book Club', title_ko: '독서 모임', description: '책에 대해 토론하기', difficulty: 'intermediate', duration: '10분' },
      { id: 'karaoke', title: 'Karaoke Night', title_ko: '노래방', description: '노래방에서 대화', difficulty: 'beginner', duration: '5분' },
    ]
  },
  {
    id: 'education',
    name: 'Education',
    name_ko: '교육',
    icon: 'graduation-cap',
    color: 'bg-teal-500',
    scenarios: [
      { id: 'class_registration', title: 'Class Registration', title_ko: '수강 신청', description: '수업 등록하기', difficulty: 'beginner', duration: '5분' },
      { id: 'asking_teacher', title: 'Asking the Teacher', title_ko: '선생님께 질문', description: '수업 중 질문하기', difficulty: 'beginner', duration: '5분' },
      { id: 'group_project', title: 'Group Project', title_ko: '조별 과제', description: '그룹 프로젝트 논의', difficulty: 'intermediate', duration: '10분' },
      { id: 'study_group', title: 'Study Group', title_ko: '스터디 그룹', description: '스터디 모임 대화', difficulty: 'intermediate', duration: '7분' },
      { id: 'library', title: 'At the Library', title_ko: '도서관에서', description: '도서관 이용하기', difficulty: 'beginner', duration: '5분' },
      { id: 'tutoring', title: 'Tutoring Session', title_ko: '과외 수업', description: '튜터링 대화', difficulty: 'intermediate', duration: '10분' },
      { id: 'academic_advice', title: 'Academic Advice', title_ko: '학업 상담', description: '학업 상담 받기', difficulty: 'intermediate', duration: '7분' },
      { id: 'graduation', title: 'Graduation', title_ko: '졸업', description: '졸업 관련 대화', difficulty: 'beginner', duration: '5분' },
    ]
  },
  {
    id: 'housing',
    name: 'Housing',
    name_ko: '주거',
    icon: 'home',
    color: 'bg-emerald-500',
    scenarios: [
      { id: 'apartment_hunting', title: 'Apartment Hunting', title_ko: '집 구하기', description: '아파트 찾기', difficulty: 'intermediate', duration: '10분' },
      { id: 'viewing_apartment', title: 'Viewing Apartment', title_ko: '집 보기', description: '집 둘러보기', difficulty: 'intermediate', duration: '7분' },
      { id: 'lease_signing', title: 'Lease Signing', title_ko: '계약하기', description: '임대 계약하기', difficulty: 'advanced', duration: '10분' },
      { id: 'moving_in', title: 'Moving In', title_ko: '이사하기', description: '이사 관련 대화', difficulty: 'intermediate', duration: '7분' },
      { id: 'landlord_issues', title: 'Landlord Issues', title_ko: '집주인 문제', description: '집주인과 문제 해결', difficulty: 'intermediate', duration: '7분' },
      { id: 'utility_setup', title: 'Utility Setup', title_ko: '공과금 설정', description: '전기/가스/인터넷 신청', difficulty: 'intermediate', duration: '7분' },
      { id: 'roommate_talk', title: 'Roommate Discussion', title_ko: '룸메이트 대화', description: '룸메이트와 규칙 정하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'moving_out', title: 'Moving Out', title_ko: '이사 나가기', description: '이사 나갈 때 대화', difficulty: 'intermediate', duration: '7분' },
    ]
  },
  {
    id: 'finance',
    name: 'Banking & Finance',
    name_ko: '은행 & 금융',
    icon: 'credit-card',
    color: 'bg-green-600',
    scenarios: [
      { id: 'opening_account', title: 'Opening Account', title_ko: '계좌 개설', description: '은행 계좌 개설하기', difficulty: 'intermediate', duration: '10분' },
      { id: 'atm_help', title: 'ATM Assistance', title_ko: 'ATM 도움', description: 'ATM 사용 도움 요청', difficulty: 'beginner', duration: '5분' },
      { id: 'currency_exchange', title: 'Currency Exchange', title_ko: '환전', description: '환전하기', difficulty: 'beginner', duration: '5분' },
      { id: 'loan_inquiry', title: 'Loan Inquiry', title_ko: '대출 문의', description: '대출 상담하기', difficulty: 'advanced', duration: '10분' },
      { id: 'credit_card', title: 'Credit Card Issues', title_ko: '신용카드 문제', description: '카드 문제 해결', difficulty: 'intermediate', duration: '7분' },
      { id: 'investment', title: 'Investment Discussion', title_ko: '투자 상담', description: '투자 상담하기', difficulty: 'advanced', duration: '10분' },
    ]
  },
  {
    id: 'services',
    name: 'Services',
    name_ko: '서비스',
    icon: 'wrench',
    color: 'bg-amber-500',
    scenarios: [
      { id: 'haircut', title: 'Getting a Haircut', title_ko: '미용실', description: '미용실에서 대화', difficulty: 'beginner', duration: '7분' },
      { id: 'dry_cleaning', title: 'Dry Cleaning', title_ko: '세탁소', description: '세탁소 이용하기', difficulty: 'beginner', duration: '5분' },
      { id: 'post_office', title: 'Post Office', title_ko: '우체국', description: '우체국에서 택배 보내기', difficulty: 'beginner', duration: '5분' },
      { id: 'car_service', title: 'Car Service', title_ko: '자동차 정비', description: '자동차 정비소 방문', difficulty: 'intermediate', duration: '7분' },
      { id: 'tech_support', title: 'Tech Support', title_ko: '기술 지원', description: '기술 지원 요청하기', difficulty: 'intermediate', duration: '10분' },
      { id: 'customer_service', title: 'Customer Service', title_ko: '고객 서비스', description: '고객센터 전화하기', difficulty: 'intermediate', duration: '7분' },
      { id: 'spa_massage', title: 'Spa & Massage', title_ko: '스파 & 마사지', description: '스파 예약 및 이용', difficulty: 'beginner', duration: '5분' },
      { id: 'photography', title: 'Photo Studio', title_ko: '사진관', description: '사진 촬영 예약', difficulty: 'beginner', duration: '5분' },
    ]
  },
]

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

const DIFFICULTY_LABELS = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    sun: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
    utensils: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    plane: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    'shopping-bag': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    film: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />,
    'graduation-cap': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />,
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    'credit-card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    wrench: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  }

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[icon] || icons.sun}
    </svg>
  )
}

export default function ConversationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = searchQuery
    ? CATEGORIES.map(cat => ({
        ...cat,
        scenarios: cat.scenarios.filter(s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.title_ko.includes(searchQuery) ||
          s.description.includes(searchQuery)
        )
      })).filter(cat => cat.scenarios.length > 0)
    : CATEGORIES

  const totalScenarios = CATEGORIES.reduce((acc, cat) => acc + cat.scenarios.length, 0)

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28 pt-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4 mt-safe">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium">상황별 회화</h1>
            <p className="text-xs text-[#8a8a8a] mt-1">{CATEGORIES.length}개 카테고리, {totalScenarios}개 대화</p>
          </div>
          <Link href="/chat" className="px-3 py-1.5 bg-[#1a1a1a] text-white rounded-full text-xs">
            자유 대화
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="상황 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a1a1a]"
          />
        </div>
      </header>

      <div className="px-6 py-4">
        {selectedCategory ? (
          // 카테고리 상세
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-sm text-[#8a8a8a] mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              전체 카테고리
            </button>

            <div className={`${selectedCategory.color} rounded-2xl p-4 text-white mb-6`}>
              <div className="flex items-center gap-3">
                <CategoryIcon icon={selectedCategory.icon} className="w-8 h-8" />
                <div>
                  <h2 className="font-medium text-lg">{selectedCategory.name_ko}</h2>
                  <p className="text-sm opacity-80">{selectedCategory.scenarios.length}개 대화 상황</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedCategory.scenarios.map(scenario => (
                <Link
                  key={scenario.id}
                  href={`/conversations/${selectedCategory.id}/${scenario.id}`}
                  className="block bg-white rounded-xl p-4 border border-[#f0f0f0] active:bg-[#f5f5f5]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{scenario.title_ko}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${DIFFICULTY_COLORS[scenario.difficulty]}`}>
                          {DIFFICULTY_LABELS[scenario.difficulty]}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8a8a]">{scenario.title}</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">{scenario.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#8a8a8a]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px]">{scenario.duration}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // 카테고리 목록
          <div className="space-y-3">
            {filteredCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="w-full bg-white rounded-xl p-4 border border-[#f0f0f0] active:bg-[#f5f5f5] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                    <CategoryIcon icon={category.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{category.name_ko}</h3>
                    <p className="text-xs text-[#8a8a8a]">{category.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{category.scenarios.length}</p>
                    <p className="text-[10px] text-[#8a8a8a]">대화</p>
                  </div>
                </div>

                {/* 미리보기 */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {category.scenarios.slice(0, 4).map(s => (
                    <span key={s.id} className="px-2 py-1 bg-[#f5f5f5] rounded text-[10px] text-[#666]">
                      {s.title_ko}
                    </span>
                  ))}
                  {category.scenarios.length > 4 && (
                    <span className="px-2 py-1 bg-[#f5f5f5] rounded text-[10px] text-[#8a8a8a]">
                      +{category.scenarios.length - 4}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
