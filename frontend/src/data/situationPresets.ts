export interface SituationCategory {
  id: string
  label: string
  icon: string
}

export interface SituationPreset {
  id: string
  categoryId: string
  label: string
  labelEn: string
  aiRole: string
  userRole: string
  setting: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const categories: SituationCategory[] = [
  { id: 'food', label: '음식/카페', icon: 'coffee' },
  { id: 'shopping', label: '쇼핑', icon: 'shopping' },
  { id: 'travel', label: '여행', icon: 'travel' },
  { id: 'daily', label: '일상', icon: 'daily' },
  { id: 'work', label: '직장', icon: 'work' },
  { id: 'social', label: '사교', icon: 'social' },
  { id: 'health', label: '건강', icon: 'health' },
  { id: 'services', label: '생활서비스', icon: 'services' },
]

export const presets: SituationPreset[] = [
  // food
  { id: 'cafe-order', categoryId: 'food', label: '카페 주문', labelEn: 'Ordering at a Cafe', aiRole: 'Barista', userRole: 'Customer', setting: 'a cozy coffee shop', difficulty: 'beginner' },
  { id: 'restaurant-order', categoryId: 'food', label: '음식 주문', labelEn: 'Ordering Food at a Restaurant', aiRole: 'Waiter', userRole: 'Customer', setting: 'a casual restaurant', difficulty: 'beginner' },
  { id: 'restaurant-reservation', categoryId: 'food', label: '레스토랑 예약', labelEn: 'Making a Restaurant Reservation', aiRole: 'Host', userRole: 'Customer', setting: 'calling a restaurant to make a reservation', difficulty: 'intermediate' },
  { id: 'food-recommendation', categoryId: 'food', label: '음식 추천 요청', labelEn: 'Asking for Food Recommendations', aiRole: 'Local Friend', userRole: 'Visitor', setting: 'asking a local friend for restaurant recommendations', difficulty: 'beginner' },
  { id: 'takeout-delivery', categoryId: 'food', label: '포장/배달 주문', labelEn: 'Ordering Takeout or Delivery', aiRole: 'Staff', userRole: 'Customer', setting: 'ordering food for takeout or delivery', difficulty: 'intermediate' },

  // shopping
  { id: 'clothing-store', categoryId: 'shopping', label: '옷 가게', labelEn: 'Shopping for Clothes', aiRole: 'Sales Associate', userRole: 'Shopper', setting: 'a clothing store', difficulty: 'beginner' },
  { id: 'electronics-store', categoryId: 'shopping', label: '전자제품 매장', labelEn: 'Buying Electronics', aiRole: 'Sales Associate', userRole: 'Customer', setting: 'an electronics store', difficulty: 'intermediate' },
  { id: 'return-exchange', categoryId: 'shopping', label: '환불/교환', labelEn: 'Returning or Exchanging an Item', aiRole: 'Customer Service Rep', userRole: 'Customer', setting: 'the return counter at a store', difficulty: 'intermediate' },
  { id: 'gift-shopping', categoryId: 'shopping', label: '선물 고르기', labelEn: 'Shopping for a Gift', aiRole: 'Sales Associate', userRole: 'Shopper', setting: 'a gift shop', difficulty: 'beginner' },
  { id: 'size-inquiry', categoryId: 'shopping', label: '사이즈 문의', labelEn: 'Asking About Sizes and Fit', aiRole: 'Sales Associate', userRole: 'Shopper', setting: 'a shoe or clothing store', difficulty: 'beginner' },

  // travel
  { id: 'hotel-checkin', categoryId: 'travel', label: '호텔 체크인', labelEn: 'Checking Into a Hotel', aiRole: 'Front Desk Agent', userRole: 'Guest', setting: 'a hotel lobby', difficulty: 'beginner' },
  { id: 'airport', categoryId: 'travel', label: '공항 수속', labelEn: 'At the Airport', aiRole: 'Check-in Agent', userRole: 'Traveler', setting: 'an airport check-in counter', difficulty: 'intermediate' },
  { id: 'taxi', categoryId: 'travel', label: '택시 탑승', labelEn: 'Taking a Taxi', aiRole: 'Taxi Driver', userRole: 'Passenger', setting: 'inside a taxi', difficulty: 'beginner' },
  { id: 'immigration', categoryId: 'travel', label: '입국 심사', labelEn: 'Going Through Immigration', aiRole: 'Immigration Officer', userRole: 'Traveler', setting: 'an immigration checkpoint at an airport', difficulty: 'intermediate' },
  { id: 'tourist-info', categoryId: 'travel', label: '관광 정보', labelEn: 'Asking for Tourist Information', aiRole: 'Information Desk Staff', userRole: 'Tourist', setting: 'a tourist information center', difficulty: 'beginner' },

  // daily
  { id: 'neighbor-chat', categoryId: 'daily', label: '이웃 대화', labelEn: 'Chatting with a Neighbor', aiRole: 'Neighbor', userRole: 'Resident', setting: 'running into a neighbor in the hallway', difficulty: 'beginner' },
  { id: 'weather-talk', categoryId: 'daily', label: '날씨 이야기', labelEn: 'Talking About the Weather', aiRole: 'Coworker', userRole: 'Coworker', setting: 'a casual chat about the weather', difficulty: 'beginner' },
  { id: 'weekend-plans', categoryId: 'daily', label: '주말 계획', labelEn: 'Discussing Weekend Plans', aiRole: 'Friend', userRole: 'Friend', setting: 'chatting about weekend plans over coffee', difficulty: 'beginner' },
  { id: 'asking-directions', categoryId: 'daily', label: '길 물어보기', labelEn: 'Asking for Directions', aiRole: 'Passerby', userRole: 'Traveler', setting: 'a street corner in an unfamiliar area', difficulty: 'beginner' },
  { id: 'package-delivery', categoryId: 'daily', label: '택배 수령', labelEn: 'Receiving a Package', aiRole: 'Delivery Person', userRole: 'Resident', setting: 'receiving a package at the front door', difficulty: 'beginner' },

  // work
  { id: 'self-introduction', categoryId: 'work', label: '자기소개', labelEn: 'Introducing Yourself at Work', aiRole: 'New Colleague', userRole: 'Employee', setting: 'the first day at a new job', difficulty: 'beginner' },
  { id: 'job-interview', categoryId: 'work', label: '영어 면접', labelEn: 'Job Interview in English', aiRole: 'Interviewer', userRole: 'Candidate', setting: 'a job interview room', difficulty: 'advanced' },
  { id: 'meeting', categoryId: 'work', label: '회의 참여', labelEn: 'Participating in a Meeting', aiRole: 'Team Lead', userRole: 'Team Member', setting: 'a team meeting', difficulty: 'intermediate' },
  { id: 'colleague-chat', categoryId: 'work', label: '동료와 대화', labelEn: 'Chatting with a Colleague', aiRole: 'Colleague', userRole: 'Colleague', setting: 'the office break room', difficulty: 'beginner' },
  { id: 'presentation', categoryId: 'work', label: '프레젠테이션', labelEn: 'Giving a Presentation', aiRole: 'Audience Member', userRole: 'Presenter', setting: 'a conference room during a presentation', difficulty: 'advanced' },

  // social
  { id: 'making-friends', categoryId: 'social', label: '친구 사귀기', labelEn: 'Making New Friends', aiRole: 'New Acquaintance', userRole: 'Person', setting: 'a social gathering or party', difficulty: 'beginner' },
  { id: 'catching-up', categoryId: 'social', label: '근황 나누기', labelEn: 'Catching Up with a Friend', aiRole: 'Old Friend', userRole: 'Friend', setting: 'meeting an old friend after a long time', difficulty: 'intermediate' },
  { id: 'party-invite', categoryId: 'social', label: '파티 초대', labelEn: 'Inviting Someone to a Party', aiRole: 'Friend', userRole: 'Host', setting: 'inviting a friend to a house party', difficulty: 'beginner' },
  { id: 'hobby-talk', categoryId: 'social', label: '취미 이야기', labelEn: 'Talking About Hobbies', aiRole: 'New Friend', userRole: 'Person', setting: 'a casual conversation about hobbies and interests', difficulty: 'beginner' },
  { id: 'complimenting', categoryId: 'social', label: '칭찬하기', labelEn: 'Giving and Receiving Compliments', aiRole: 'Friend', userRole: 'Friend', setting: 'complimenting a friend on their achievement', difficulty: 'beginner' },

  // health
  { id: 'describe-symptoms', categoryId: 'health', label: '증상 설명', labelEn: 'Describing Symptoms to a Doctor', aiRole: 'Doctor', userRole: 'Patient', setting: "a doctor's office", difficulty: 'intermediate' },
  { id: 'pharmacy', categoryId: 'health', label: '약국 방문', labelEn: 'Visiting a Pharmacy', aiRole: 'Pharmacist', userRole: 'Customer', setting: 'a pharmacy counter', difficulty: 'intermediate' },
  { id: 'hospital-appointment', categoryId: 'health', label: '병원 예약', labelEn: 'Making a Hospital Appointment', aiRole: 'Receptionist', userRole: 'Patient', setting: 'calling a hospital to book an appointment', difficulty: 'intermediate' },
  { id: 'dentist', categoryId: 'health', label: '치과 방문', labelEn: 'Visiting the Dentist', aiRole: 'Dentist', userRole: 'Patient', setting: "a dentist's office", difficulty: 'intermediate' },
  { id: 'emergency', categoryId: 'health', label: '응급 상황', labelEn: 'Emergency Situation', aiRole: '911 Operator', userRole: 'Caller', setting: 'calling emergency services', difficulty: 'advanced' },

  // services
  { id: 'bank', categoryId: 'services', label: '은행 업무', labelEn: 'Banking', aiRole: 'Bank Teller', userRole: 'Customer', setting: 'a bank counter', difficulty: 'intermediate' },
  { id: 'hair-salon', categoryId: 'services', label: '미용실', labelEn: 'At the Hair Salon', aiRole: 'Hairstylist', userRole: 'Customer', setting: 'a hair salon', difficulty: 'beginner' },
  { id: 'post-office', categoryId: 'services', label: '우체국', labelEn: 'At the Post Office', aiRole: 'Postal Clerk', userRole: 'Customer', setting: 'a post office counter', difficulty: 'intermediate' },
  { id: 'library', categoryId: 'services', label: '도서관', labelEn: 'At the Library', aiRole: 'Librarian', userRole: 'Visitor', setting: 'a public library', difficulty: 'beginner' },
  { id: 'customer-service', categoryId: 'services', label: '고객센터', labelEn: 'Calling Customer Service', aiRole: 'Customer Service Agent', userRole: 'Customer', setting: 'a phone call with customer service', difficulty: 'advanced' },
]

export function buildSituationPrompt(preset: SituationPreset): string {
  return `You are playing the role of a ${preset.aiRole} in ${preset.setting}. The user is a ${preset.userRole}. Scenario: "${preset.labelEn}".

Instructions:
- Stay in character as the ${preset.aiRole} throughout the conversation.
- Speak naturally and realistically for this setting.
- Start with a greeting or opening line appropriate for this scenario.
- Keep responses concise (1-3 sentences).
- If the user makes grammar mistakes, gently continue the conversation without correcting them mid-dialogue. Provide feedback only if asked.
- Adjust your language complexity to ${preset.difficulty} level.`
}
