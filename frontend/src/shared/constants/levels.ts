export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type Level = typeof LEVELS[number]

export const LEVEL_COLORS: Record<Level, string> = {
  'A1': 'bg-green-500',
  'A2': 'bg-green-400',
  'B1': 'bg-yellow-500',
  'B2': 'bg-orange-500',
  'C1': 'bg-red-500',
  'C2': 'bg-purple-500',
}
