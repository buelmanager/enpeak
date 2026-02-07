// TODO: Add Firebase sync for saved words (currently localStorage only)
const STORAGE_KEY = 'enpeak-saved-words'

export interface SavedWord {
  word: string
  meaning: string
  pronunciation?: string
  example?: string
  savedAt: number
}

function getAll(): SavedWord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function persist(words: SavedWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
}

export function saveWord(entry: Omit<SavedWord, 'savedAt'>) {
  const words = getAll()
  const exists = words.some(w => w.word.toLowerCase() === entry.word.toLowerCase())
  if (exists) return
  words.unshift({ ...entry, savedAt: Date.now() })
  persist(words)
}

export function removeWord(word: string) {
  const words = getAll().filter(w => w.word.toLowerCase() !== word.toLowerCase())
  persist(words)
}

export function isWordSaved(word: string): boolean {
  return getAll().some(w => w.word.toLowerCase() === word.toLowerCase())
}

export function getSavedWords(): SavedWord[] {
  return getAll()
}

export function getSavedWordCount(): number {
  return getAll().length
}
