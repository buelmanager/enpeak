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
let lastCheckTime = 0
let lastResult: UpdateCheckResult | null = null

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

  // 5분 내 재확인 방지
  if (lastResult && now - lastCheckTime < CHECK_INTERVAL) {
    return lastResult
  }

  try {
    const serverData = await fetchServerVersion()
    lastCheckTime = now
    lastResult = {
      hasUpdate: serverData.version !== APP_VERSION,
      currentVersion: APP_VERSION,
      serverVersion: serverData.version,
    }
    return lastResult
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
  lastCheckTime = 0
  lastResult = null
  return checkForUpdates()
}
