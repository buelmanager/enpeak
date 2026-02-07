export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://enpeak.example.com'

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || '#'

export const TAG_COLORS: Record<string, string> = {
  '학습 팁': 'bg-hp-indigo/10 text-hp-indigo',
  '표현 모음': 'bg-hp-amber/10 text-hp-amber',
  '학습 방법': 'bg-hp-emerald/10 text-hp-emerald',
  '문법': 'bg-hp-rose/10 text-hp-rose',
  '여행 영어': 'bg-hp-blue/10 text-hp-blue',
  '트렌드': 'bg-hp-violet/10 text-hp-violet',
}
