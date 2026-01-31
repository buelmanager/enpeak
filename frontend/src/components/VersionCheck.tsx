'use client'

import { useEffect, useState } from 'react'
import { APP_VERSION } from '@/lib/version'

const UPDATED_VERSION_KEY = 'enpeak_updated_version'

export function VersionCheck() {
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [serverVersion, setServerVersion] = useState<string | null>(null)

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json?t=' + Date.now(), {
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()

          // 이미 이 버전으로 업데이트 시도했는지 확인
          const updatedVersion = localStorage.getItem(UPDATED_VERSION_KEY)

          if (data.version && data.version !== APP_VERSION) {
            // 이미 이 버전으로 업데이트 시도했으면 팝업 표시 안함
            if (updatedVersion === data.version) {
              console.log(`Already attempted update to ${data.version}, skipping popup`)
              return
            }
            console.log(`Version mismatch: current=${APP_VERSION}, server=${data.version}`)
            setServerVersion(data.version)
            setNeedsUpdate(true)
          } else {
            console.log(`Version OK: ${APP_VERSION}`)
            // 버전이 맞으면 업데이트 기록 삭제
            localStorage.removeItem(UPDATED_VERSION_KEY)
          }
        }
      } catch (e) {
        console.error('Version check failed:', e)
      }
    }

    checkVersion()
  }, [])

  const handleUpdate = async () => {
    // 업데이트 시도 기록
    if (serverVersion) {
      localStorage.setItem(UPDATED_VERSION_KEY, serverVersion)
    }

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

    // 3. 하드 리로드 (캐시 완전 무시)
    window.location.href = window.location.href.split('?')[0] + '?_=' + Date.now()
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
