import { APP_URL } from './constants'

export const STATS = [
  { label: '학습 리소스', value: 5375, suffix: '+' },
  { label: '롤플레이 시나리오', value: 14, suffix: '개' },
  { label: '단어', value: 2648, suffix: '+' },
] as const

export interface FeatureCard {
  id: string
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: string
  link: string
  span: 1 | 2 | 'full'
}

export const FEATURES: FeatureCard[] = [
  {
    id: 'free-chat',
    title: 'AI 자유 대화',
    subtitle: 'Free Conversation',
    description: 'AI와 자유롭게 영어 대화를 연습하세요. 실시간 문법 피드백을 받으며 자연스러운 회화 실력을 키울 수 있습니다.',
    gradient: 'from-blue-500 to-cyan-400',
    icon: 'chat',
    link: `${APP_URL}/talk`,
    span: 2,
  },
  {
    id: 'vocabulary',
    title: '단어 카드',
    subtitle: 'Word Cards',
    description: 'A1~C2 레벨 2,648+ 단어와 숙어, 예문을 카드로 학습하세요.',
    gradient: 'from-emerald-500 to-emerald-400',
    icon: 'cards',
    link: `${APP_URL}/cards`,
    span: 1,
  },
  {
    id: 'expression',
    title: '오늘의 표현',
    subtitle: "Today's Expression",
    description: '매일 새로운 영어 표현을 배우고 AI와 대화하며 연습하세요.',
    gradient: 'from-amber-500 to-amber-400',
    icon: 'star',
    link: `${APP_URL}/talk?mode=expression`,
    span: 1,
  },
  {
    id: 'roleplay',
    title: '롤플레이 시나리오',
    subtitle: 'Roleplay Scenarios',
    description: '카페, 호텔, 공항 등 14가지 실생활 상황에서 영어를 연습하세요. 단계별 가이드와 힌트가 제공됩니다.',
    gradient: 'from-indigo-500 to-violet-500',
    icon: 'roleplay',
    link: `${APP_URL}/talk?mode=roleplay`,
    span: 2,
  },
  {
    id: 'grammar',
    title: '실시간 문법 피드백',
    subtitle: 'Grammar Feedback',
    description: 'AI가 모든 문장을 분석하고, 즉각적인 교정과 설명을 제공합니다. 나만의 영어 튜터처럼 활용하세요.',
    gradient: 'from-rose-500 to-rose-400',
    icon: 'check',
    link: `${APP_URL}/talk`,
    span: 'full',
  },
]

export interface CommunityCard {
  title: string
  subtitle: string
  description: string
  icon: string
  comingSoon: boolean
  link?: string
}

export const COMMUNITY_CARDS: CommunityCard[] = [
  {
    title: 'Q&A 포럼',
    subtitle: 'Q&A Forum',
    description: '영어에 대한 질문을 올리고 커뮤니티로부터 답변을 받으세요.',
    icon: 'qa',
    comingSoon: true,
  },
  {
    title: '스터디 그룹',
    subtitle: 'Study Groups',
    description: '스터디 그룹에 참여하거나 직접 만들어 함께 연습하세요.',
    icon: 'group',
    comingSoon: true,
  },
  {
    title: '커뮤니티 시나리오',
    subtitle: 'Community Scenarios',
    description: '나만의 롤플레이 시나리오를 만들고 다른 학습자들과 공유하세요.',
    icon: 'scenario',
    comingSoon: false,
    link: `${APP_URL}/create`,
  },
]

export interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  streak: number
  words: number
}

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: '김민지', avatar: 'MJ', streak: 42, words: 1280 },
  { rank: 2, name: '이준호', avatar: 'JH', streak: 38, words: 1150 },
  { rank: 3, name: '박소연', avatar: 'SY', streak: 35, words: 980 },
  { rank: 4, name: '최동현', avatar: 'DH', streak: 28, words: 870 },
  { rank: 5, name: '서유나', avatar: 'YN', streak: 25, words: 750 },
]

export interface Testimonial {
  quote: string
  name: string
  level: string
  avatar: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'AI 대화가 정말 자연스러워요. 드디어 영어 말하기에 자신감이 생겼어요!',
    name: '김수진',
    level: 'B1 중급',
    avatar: 'SJ',
  },
  {
    quote: '롤플레이 시나리오가 실제 상황 준비에 완벽해요. 여행 전에 꼭 연습해요.',
    name: '정현우',
    level: 'A2 초중급',
    avatar: 'HW',
  },
  {
    quote: '매일의 표현이 정말 좋아요. 출근길 루틴이 됐어요.',
    name: '이은비',
    level: 'B2 중상급',
    avatar: 'EB',
  },
  {
    quote: '문법 피드백이 즉각적이고 정확해요. 개인 튜터가 있는 것 같아요.',
    name: '박태영',
    level: 'A2 초중급',
    avatar: 'TY',
  },
  {
    quote: '단어 카드 덕분에 두 달 만에 500개 이상의 단어를 외웠어요.',
    name: '최지연',
    level: 'B1 중급',
    avatar: 'JY',
  },
]

export const FOOTER_LINKS = {
  product: [
    { label: 'AI 대화', href: `${APP_URL}/talk` },
    { label: '단어 카드', href: `${APP_URL}/cards` },
    { label: '오늘의 표현', href: `${APP_URL}/daily` },
    { label: '롤플레이', href: `${APP_URL}/talk?mode=roleplay` },
  ],
  community: [
    { label: '시나리오 만들기', href: `${APP_URL}/create`, comingSoon: false },
    { label: 'Q&A 포럼', href: '#', comingSoon: true },
    { label: '스터디 그룹', href: '#', comingSoon: true },
  ],
  support: [
    { label: '기능 요청', href: `${APP_URL}/feedback` },
    { label: '마이페이지', href: `${APP_URL}/my` },
    { label: '블로그', href: '/blog' },
  ],
}
