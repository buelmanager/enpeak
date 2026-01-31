'use client'

import { useEffect, useState } from 'react'

const CURRENT_VERSION_KEY = 'enpeak_current_version'

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
          const serverVer = data.version

          if (!serverVer) return

          // localStorage에서 현재 버전 가져오기
          const currentVer = localStorage.getItem(CURRENT_VERSION_KEY)

          if (!currentVer) {
            // 처음 방문: 현재 서버 버전을 저장
            localStorage.setItem(CURRENT_VERSION_KEY, serverVer)
            console.log(`Version initialized: ${serverVer}`)
            return
          }

          if (currentVer === serverVer) {
            // 버전 일치
            console.log(`Version OK: ${serverVer}`)
            return
          }

          // 버전 불일치: 업데이트 필요
          console.log(`Version update available: ${currentVer} -> ${serverVer}`)
          setServerVersion(serverVer)
          setNeedsUpdate(true)
        }
      } catch (e) {
        console.error('Version check failed:', e)
      }
    }

    // 최초 1회만 체크 (페이지 이동 시 다시 체크하지 않음)
    const alreadyChecked = sessionStorage.getItem('version_checked')
    if (!alreadyChecked) {
      sessionStorage.setItem('version_checked', 'true')
      checkVersion()
    }
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

    // 3. 새 버전을 현재 버전으로 저장
    if (serverVersion) {
      localStorage.setItem(CURRENT_VERSION_KEY, serverVersion)
    }

    // 4. 세션 체크 플래그 삭제
    sessionStorage.removeItem('version_checked')

    // 5. 하드 리로드
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
