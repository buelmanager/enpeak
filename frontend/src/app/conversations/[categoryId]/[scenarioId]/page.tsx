'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTTS } from '@/contexts/TTSContext'
import { addLearningRecord } from '@/lib/learningHistory'

interface Message {
  id: string
  role: 'ai' | 'user'
  content: string
  translation?: string
  isTranslating?: boolean
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// 모든 카테고리 및 시나리오 정의
const ALL_SCENARIOS: Record<string, { name: string; scenarios: string[] }> = {
  daily: {
    name: '일상 생활',
    scenarios: ['morning_routine', 'grocery_shopping', 'neighbor_chat', 'weather_talk', 'weekend_plans', 'house_chores', 'pet_care', 'home_repair']
  },
  restaurant: {
    name: '음식점 & 음식',
    scenarios: ['cafe_order', 'restaurant_reservation', 'ordering_food', 'asking_recommendation', 'food_allergy', 'complaint', 'paying_bill', 'takeout_delivery', 'food_review', 'cooking_recipe']
  },
  travel: {
    name: '여행',
    scenarios: ['airport_checkin', 'immigration', 'hotel_checkin', 'hotel_request', 'asking_directions', 'public_transport', 'taxi_ride', 'car_rental', 'tourist_info', 'tour_booking', 'lost_luggage', 'travel_emergency']
  },
  shopping: {
    name: '쇼핑',
    scenarios: ['clothing_store', 'trying_on', 'asking_size', 'electronics_store', 'return_exchange', 'bargaining', 'gift_shopping', 'online_shopping']
  },
  work: {
    name: '비즈니스 & 업무',
    scenarios: ['job_interview', 'self_introduction', 'meeting_intro', 'presentation', 'phone_call', 'email_discussion', 'negotiation', 'networking', 'asking_help', 'giving_feedback', 'deadline_extension', 'resignation']
  },
  health: {
    name: '건강 & 의료',
    scenarios: ['doctor_appointment', 'describing_symptoms', 'pharmacy', 'emergency_room', 'dentist', 'eye_exam', 'health_insurance', 'mental_health']
  },
  social: {
    name: '사교 & 친구',
    scenarios: ['making_friends', 'party_invitation', 'catching_up', 'giving_compliments', 'apology', 'consoling', 'giving_advice', 'declining_politely', 'sharing_news', 'discussing_hobbies']
  },
  entertainment: {
    name: '엔터테인먼트',
    scenarios: ['movie_tickets', 'movie_discussion', 'concert_tickets', 'museum_visit', 'sports_event', 'gym_membership', 'book_club', 'karaoke']
  },
  education: {
    name: '교육',
    scenarios: ['class_registration', 'asking_teacher', 'group_project', 'study_group', 'library', 'tutoring', 'academic_advice', 'graduation']
  },
  housing: {
    name: '주거',
    scenarios: ['apartment_hunting', 'viewing_apartment', 'lease_signing', 'moving_in', 'landlord_issues', 'utility_setup', 'roommate_talk', 'moving_out']
  },
  finance: {
    name: '은행 & 금융',
    scenarios: ['opening_account', 'atm_help', 'currency_exchange', 'loan_inquiry', 'credit_card', 'investment']
  },
  services: {
    name: '서비스',
    scenarios: ['haircut', 'dry_cleaning', 'post_office', 'car_service', 'tech_support', 'customer_service', 'spa_massage', 'photography']
  },
}

// 시나리오 제목 매핑
const SCENARIO_TITLES: Record<string, { title: string; title_ko: string }> = {
  // Daily
  morning_routine: { title: 'Morning Routine', title_ko: '아침 일과' },
  grocery_shopping: { title: 'Grocery Shopping', title_ko: '장보기' },
  neighbor_chat: { title: 'Chatting with Neighbors', title_ko: '이웃과 대화' },
  weather_talk: { title: 'Weather Small Talk', title_ko: '날씨 이야기' },
  weekend_plans: { title: 'Weekend Plans', title_ko: '주말 계획' },
  house_chores: { title: 'House Chores', title_ko: '집안일' },
  pet_care: { title: 'Pet Care', title_ko: '반려동물 돌봄' },
  home_repair: { title: 'Home Repair', title_ko: '집 수리' },
  // Restaurant
  cafe_order: { title: 'Ordering at a Cafe', title_ko: '카페 주문' },
  restaurant_reservation: { title: 'Making Reservation', title_ko: '예약하기' },
  ordering_food: { title: 'Ordering Food', title_ko: '음식 주문' },
  asking_recommendation: { title: 'Asking for Recommendations', title_ko: '추천 요청' },
  food_allergy: { title: 'Food Allergies', title_ko: '음식 알레르기' },
  complaint: { title: 'Making a Complaint', title_ko: '불만 표현' },
  paying_bill: { title: 'Paying the Bill', title_ko: '계산하기' },
  takeout_delivery: { title: 'Takeout & Delivery', title_ko: '포장 & 배달' },
  food_review: { title: 'Discussing Food', title_ko: '음식 평가' },
  cooking_recipe: { title: 'Sharing Recipes', title_ko: '레시피 공유' },
  // Travel
  airport_checkin: { title: 'Airport Check-in', title_ko: '공항 체크인' },
  immigration: { title: 'Immigration', title_ko: '입국 심사' },
  hotel_checkin: { title: 'Hotel Check-in', title_ko: '호텔 체크인' },
  hotel_request: { title: 'Hotel Requests', title_ko: '호텔 요청' },
  asking_directions: { title: 'Asking Directions', title_ko: '길 묻기' },
  public_transport: { title: 'Public Transport', title_ko: '대중교통' },
  taxi_ride: { title: 'Taking a Taxi', title_ko: '택시 타기' },
  car_rental: { title: 'Renting a Car', title_ko: '렌터카' },
  tourist_info: { title: 'Tourist Information', title_ko: '관광 정보' },
  tour_booking: { title: 'Booking Tours', title_ko: '투어 예약' },
  lost_luggage: { title: 'Lost Luggage', title_ko: '분실 수하물' },
  travel_emergency: { title: 'Travel Emergency', title_ko: '여행 중 긴급상황' },
  // Shopping
  clothing_store: { title: 'Clothing Store', title_ko: '옷 가게' },
  trying_on: { title: 'Trying On Clothes', title_ko: '옷 입어보기' },
  asking_size: { title: 'Asking for Size', title_ko: '사이즈 문의' },
  electronics_store: { title: 'Electronics Store', title_ko: '전자제품 매장' },
  return_exchange: { title: 'Returns & Exchanges', title_ko: '환불 & 교환' },
  bargaining: { title: 'Bargaining', title_ko: '흥정하기' },
  gift_shopping: { title: 'Gift Shopping', title_ko: '선물 쇼핑' },
  online_shopping: { title: 'Online Shopping Help', title_ko: '온라인 쇼핑 문의' },
  // Work
  job_interview: { title: 'Job Interview', title_ko: '면접' },
  self_introduction: { title: 'Self Introduction', title_ko: '자기소개' },
  meeting_intro: { title: 'Meeting Introduction', title_ko: '회의 시작' },
  presentation: { title: 'Giving Presentation', title_ko: '프레젠테이션' },
  phone_call: { title: 'Business Phone Call', title_ko: '업무 전화' },
  email_discussion: { title: 'Discussing Emails', title_ko: '이메일 논의' },
  negotiation: { title: 'Negotiation', title_ko: '협상' },
  networking: { title: 'Networking Event', title_ko: '네트워킹' },
  asking_help: { title: 'Asking for Help', title_ko: '도움 요청' },
  giving_feedback: { title: 'Giving Feedback', title_ko: '피드백 주기' },
  deadline_extension: { title: 'Deadline Extension', title_ko: '마감 연장' },
  resignation: { title: 'Resignation Talk', title_ko: '퇴사 대화' },
  // Health
  doctor_appointment: { title: 'Doctor Appointment', title_ko: '병원 예약' },
  describing_symptoms: { title: 'Describing Symptoms', title_ko: '증상 설명' },
  pharmacy: { title: 'At the Pharmacy', title_ko: '약국에서' },
  emergency_room: { title: 'Emergency Room', title_ko: '응급실' },
  dentist: { title: 'At the Dentist', title_ko: '치과에서' },
  eye_exam: { title: 'Eye Examination', title_ko: '안과 검진' },
  health_insurance: { title: 'Health Insurance', title_ko: '건강 보험' },
  mental_health: { title: 'Mental Health', title_ko: '정신 건강' },
  // Social
  making_friends: { title: 'Making Friends', title_ko: '친구 사귀기' },
  party_invitation: { title: 'Party Invitation', title_ko: '파티 초대' },
  catching_up: { title: 'Catching Up', title_ko: '근황 나누기' },
  giving_compliments: { title: 'Giving Compliments', title_ko: '칭찬하기' },
  apology: { title: 'Making Apology', title_ko: '사과하기' },
  consoling: { title: 'Consoling a Friend', title_ko: '위로하기' },
  giving_advice: { title: 'Giving Advice', title_ko: '조언하기' },
  declining_politely: { title: 'Declining Politely', title_ko: '정중히 거절' },
  sharing_news: { title: 'Sharing Good News', title_ko: '좋은 소식 나누기' },
  discussing_hobbies: { title: 'Discussing Hobbies', title_ko: '취미 이야기' },
  // Entertainment
  movie_tickets: { title: 'Buying Movie Tickets', title_ko: '영화표 구매' },
  movie_discussion: { title: 'Discussing Movies', title_ko: '영화 토론' },
  concert_tickets: { title: 'Concert Tickets', title_ko: '콘서트 티켓' },
  museum_visit: { title: 'Museum Visit', title_ko: '박물관 방문' },
  sports_event: { title: 'Sports Event', title_ko: '스포츠 경기' },
  gym_membership: { title: 'Gym Membership', title_ko: '헬스장 등록' },
  book_club: { title: 'Book Club', title_ko: '독서 모임' },
  karaoke: { title: 'Karaoke Night', title_ko: '노래방' },
  // Education
  class_registration: { title: 'Class Registration', title_ko: '수강 신청' },
  asking_teacher: { title: 'Asking the Teacher', title_ko: '선생님께 질문' },
  group_project: { title: 'Group Project', title_ko: '조별 과제' },
  study_group: { title: 'Study Group', title_ko: '스터디 그룹' },
  library: { title: 'At the Library', title_ko: '도서관에서' },
  tutoring: { title: 'Tutoring Session', title_ko: '과외 수업' },
  academic_advice: { title: 'Academic Advice', title_ko: '학업 상담' },
  graduation: { title: 'Graduation', title_ko: '졸업' },
  // Housing
  apartment_hunting: { title: 'Apartment Hunting', title_ko: '집 구하기' },
  viewing_apartment: { title: 'Viewing Apartment', title_ko: '집 보기' },
  lease_signing: { title: 'Lease Signing', title_ko: '계약하기' },
  moving_in: { title: 'Moving In', title_ko: '이사하기' },
  landlord_issues: { title: 'Landlord Issues', title_ko: '집주인 문제' },
  utility_setup: { title: 'Utility Setup', title_ko: '공과금 설정' },
  roommate_talk: { title: 'Roommate Discussion', title_ko: '룸메이트 대화' },
  moving_out: { title: 'Moving Out', title_ko: '이사 나가기' },
  // Finance
  opening_account: { title: 'Opening Account', title_ko: '계좌 개설' },
  atm_help: { title: 'ATM Assistance', title_ko: 'ATM 도움' },
  currency_exchange: { title: 'Currency Exchange', title_ko: '환전' },
  loan_inquiry: { title: 'Loan Inquiry', title_ko: '대출 문의' },
  credit_card: { title: 'Credit Card Issues', title_ko: '신용카드 문제' },
  investment: { title: 'Investment Discussion', title_ko: '투자 상담' },
  // Services
  haircut: { title: 'Getting a Haircut', title_ko: '미용실' },
  dry_cleaning: { title: 'Dry Cleaning', title_ko: '세탁소' },
  post_office: { title: 'Post Office', title_ko: '우체국' },
  car_service: { title: 'Car Service', title_ko: '자동차 정비' },
  tech_support: { title: 'Tech Support', title_ko: '기술 지원' },
  customer_service: { title: 'Customer Service', title_ko: '고객 서비스' },
  spa_massage: { title: 'Spa & Massage', title_ko: '스파 & 마사지' },
  photography: { title: 'Photo Studio', title_ko: '사진관' },
}

// 시작 메시지 매핑
const START_MESSAGES: Record<string, string> = {
  cafe_order: "Hi there! Welcome to Sunny Cafe. What can I get for you today?",
  hotel_checkin: "Good afternoon! Welcome to Grand Hotel. How may I help you?",
  airport_checkin: "Hello! May I see your passport and booking confirmation?",
  job_interview: "Good morning! Please have a seat. So, tell me a little about yourself.",
  morning_routine: "Good morning! Did you sleep well last night?",
  grocery_shopping: "Hi! Can I help you find something today?",
  taxi_ride: "Hello! Where would you like to go?",
  asking_directions: "Hi there! You look a bit lost. Can I help you?",
  restaurant_reservation: "Thank you for calling! How can I help you today?",
  ordering_food: "Good evening! Are you ready to order, or would you like a few more minutes?",
  pharmacy: "Hello! How can I help you today?",
  clothing_store: "Hi! Welcome to our store. Are you looking for anything in particular?",
  making_friends: "Hey! I don't think we've met before. I'm Alex!",
  doctor_appointment: "Good morning! How can I help you today?",
  default: "Hello! How can I help you today?",
}

export default function ScenarioRoleplayPage() {
  const params = useParams()
  const router = useRouter()
  const { speak, isSpeaking } = useTTS()

  const categoryId = params.categoryId as string
  const scenarioId = params.scenarioId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stage, setStage] = useState(1)
  const [totalStages, setTotalStages] = useState(5)
  const [learningTip, setLearningTip] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scenarioTitle = SCENARIO_TITLES[scenarioId] || { title: scenarioId, title_ko: scenarioId }
  const categoryName = ALL_SCENARIOS[categoryId]?.name || categoryId

  useEffect(() => {
    startRoleplay()
  }, [categoryId, scenarioId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startRoleplay = async () => {
    setIsLoading(true)
    setMessages([])
    setIsCompleted(false)
    setStage(1)

    try {
      const response = await fetch(`${API_BASE}/api/roleplay/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioId,
          category: categoryId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSessionId(data.session_id)
        setStage(data.current_stage || 1)
        setTotalStages(data.total_stages || 5)
        setLearningTip(data.learning_tip || '')

        if (data.ai_message) {
          const aiMsg: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content: data.ai_message,
          }
          setMessages([aiMsg])
          speak(data.ai_message)
        }
      } else {
        throw new Error('API failed')
      }
    } catch {
      // 폴백 메시지
      const startMsg = START_MESSAGES[scenarioId] || START_MESSAGES.default
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: startMsg,
      }
      setMessages([aiMsg])
      speak(startMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/roleplay/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: userMsg.content,
          scenario_id: scenarioId,
          category: categoryId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        if (data.current_stage) setStage(data.current_stage)
        if (data.learning_tip) setLearningTip(data.learning_tip)
        if (data.is_completed) {
          setIsCompleted(true)
          // 학습 기록 저장
          addLearningRecord({
            type: 'conversation',
            title: scenarioTitle.title_ko,
            category: categoryId,
            scenarioId: scenarioId,
            details: {
              stage: data.current_stage || stage,
              totalStages: totalStages,
            },
          })
        }

        if (data.ai_message) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: data.ai_message,
          }
          setMessages(prev => [...prev, aiMsg])
          speak(data.ai_message)
        }
      } else {
        throw new Error('API failed')
      }
    } catch {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "That sounds great! Is there anything else you'd like to add?",
      }
      setMessages(prev => [...prev, aiMsg])
      speak(aiMsg.content)
    } finally {
      setIsLoading(false)
    }
  }

  const translateMessage = async (idx: number) => {
    const msg = messages[idx]
    if (msg.translation || msg.isTranslating) return

    setMessages(prev => prev.map((m, i) =>
      i === idx ? { ...m, isTranslating: true } : m
    ))

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.content)}&langpair=en|ko`
      )
      if (response.ok) {
        const data = await response.json()
        const translation = data.responseData?.translatedText || '번역 실패'
        setMessages(prev => prev.map((m, i) =>
          i === idx ? { ...m, translation, isTranslating: false } : m
        ))
      }
    } catch {
      setMessages(prev => prev.map((m, i) =>
        i === idx ? { ...m, isTranslating: false } : m
      ))
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#f0f0f0] px-4 py-3 flex items-center justify-between" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <button onClick={() => router.push('/conversations')} className="p-2 -ml-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center flex-1">
          <h2 className="font-medium text-sm">{scenarioTitle.title_ko}</h2>
          <p className="text-xs text-[#8a8a8a]">Stage {stage}/{totalStages}</p>
        </div>
        <button
          onClick={startRoleplay}
          className="p-2 -mr-2 text-[#8a8a8a]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {/* Learning Tip */}
      {learningTip && (
        <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Tip: {learningTip}
        </div>
      )}

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-white border-b border-[#f0f0f0]">
        <div className="h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1a1a1a] transition-all duration-300"
            style={{ width: `${(stage / totalStages) * 100}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white border border-[#e5e5e5]'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>

              {/* AI 메시지 액션 버튼 */}
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <button
                    onClick={() => speak(msg.content)}
                    className="p-1 text-[#8a8a8a] hover:text-[#1a1a1a]"
                  >
                    {isSpeaking ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => translateMessage(idx)}
                    className="p-1 text-[#8a8a8a] hover:text-[#1a1a1a]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </button>
                </div>
              )}

              {/* 번역 */}
              {msg.translation && (
                <p className="text-xs text-[#8a8a8a] mt-1 px-1">{msg.translation}</p>
              )}
              {msg.isTranslating && (
                <p className="text-xs text-[#8a8a8a] mt-1 px-1">번역 중...</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">대화 완료!</h2>
            <p className="text-sm text-[#8a8a8a] mb-6">
              {scenarioTitle.title_ko} 상황을 성공적으로 연습했습니다.
            </p>
            <div className="space-y-2">
              <button
                onClick={startRoleplay}
                className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-medium"
              >
                다시 연습하기
              </button>
              <button
                onClick={() => router.push('/conversations')}
                className="w-full py-3 border border-[#e5e5e5] rounded-xl text-sm"
              >
                다른 상황 선택
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-[#f0f0f0] p-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="영어로 대답해보세요..."
            className="flex-1 px-4 py-3 bg-[#f5f5f5] rounded-xl text-sm focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}
