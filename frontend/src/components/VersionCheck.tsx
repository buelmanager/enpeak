'use client'

import { useEffect, useState } from 'react'
import { APP_VERSION } from '@/lib/version'

export function VersionCheck() {
  const [needsUpdate, setNeedsUpdate] = useState(false)

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json?t=' + Date.now(), {
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          if (data.version && data.version !== APP_VERSION) {
            console.log(`Version mismatch: current=${APP_VERSION}, server=${data.version}`)
            setNeedsUpdate(true)
          } else {
            console.log(`Version OK: ${APP_VERSION}`)
          }
        }
      } catch (e) {
        console.error('Version check failed:', e)
      }
    }

    checkVersion()
  }, [])

  const handleUpdate = async () => {
    // 1. 서비스 워커 등록 해제
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
    }

    // 2. 모든 캐시 삭제
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }

    // 3. 강제 새로고침 (캐시 무시)
    window.location.reload()
  }

  if (!needsUpdate) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
      <span className="text-sm">새 버전이 있습니다</span>
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-medium"
      >
        업데이트
      </button>
    </div>
  )
}
