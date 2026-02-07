import { APP_VERSION } from './version'

export interface ServerVersion {
  version: string
  buildTime?: string
  changelog?: string
}

export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  serverVersion: string | null
  error?: string
}

const CHECK_INTERVAL = 5 * 60 * 1000 // 5분
const CACHE_KEY = 'enpeak_version_check'

function getCachedResult(): { time: number; result: UpdateCheckResult } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setCachedResult(result: UpdateCheckResult) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), result }))
  } catch {
    // sessionStorage 사용 불가 - 무시
  }
}

async function fetchServerVersion(): Promise<ServerVersion> {
  const res = await fetch(`/version.json?t=${Date.now()}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch version: ${res.status}`)
  }
  return res.json()
}

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  const now = Date.now()

  // 5분 내 재확인 방지 (sessionStorage 기반 탭 간 공유)
  const cached = getCachedResult()
  if (cached && now - cached.time < CHECK_INTERVAL) {
    return cached.result
  }

  try {
    const serverData = await fetchServerVersion()
    const result: UpdateCheckResult = {
      hasUpdate: serverData.version !== APP_VERSION,
      currentVersion: APP_VERSION,
      serverVersion: serverData.version,
    }
    setCachedResult(result)
    return result
  } catch (error) {
    const result: UpdateCheckResult = {
      hasUpdate: false,
      currentVersion: APP_VERSION,
      serverVersion: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    return result
  }
}

export async function forceCheckForUpdates(): Promise<UpdateCheckResult> {
  // 캐시된 결과 무시하고 강제 확인
  try { sessionStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
  return checkForUpdates()
}
