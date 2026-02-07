'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope)

          // 업데이트 감지
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New SW version available')
                  // 새 버전 발견 시 skipWaiting 호출
                  newWorker.postMessage('skipWaiting')
                }
              })
            }
          })

          // 주기적으로 업데이트 확인 (1시간마다)
          intervalId = setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })

      // 컨트롤러 변경 감지 (새 SW 활성화 시 새로고침)
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return null
}
