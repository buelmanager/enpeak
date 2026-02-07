/**
 * 모든 Service Worker 캐시 삭제
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }
}

/**
 * 캐시 삭제 + SW 등록 해제 + 페이지 리로드
 */
export async function forceRefresh(): Promise<void> {
  await clearAllCaches()

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((r) => r.unregister()))
  }

  window.location.reload()
}
