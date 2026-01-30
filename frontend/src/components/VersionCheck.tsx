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

  const handleUpdate = () => {
    // Clear caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    window.location.reload()
  }

  if (!needsUpdate) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
      <span className="text-sm">새 버전이 있습니다</span>
      <button
        onClick={handleUpdate}
        className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-medium"
      >
        업데이트
      </button>
    </div>
  )
}
