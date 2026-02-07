'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // ChunkLoadError 감지 시 자동 새로고침
    // 배포 후 이전 청크 파일을 요청할 때 발생
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module')
    ) {
      console.log('ChunkLoadError detected, reloading page...')

      // 무한 새로고침 방지
      const lastReload = sessionStorage.getItem('chunk_error_reload')
      const now = Date.now()

      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('chunk_error_reload', now.toString())
        window.location.reload()
        return
      }
    }

    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-xl font-medium text-[#1a1a1a] mb-2">
          오류가 발생했습니다
        </h2>

        <p className="text-[#8a8a8a] mb-6">
          {error.message.includes('chunk') || error.message.includes('module')
            ? '앱이 업데이트되었습니다. 페이지를 새로고침해주세요.'
            : '문제가 발생했습니다. 다시 시도해주세요.'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#0D9488] text-white rounded-xl font-medium hover:bg-[#0F766E]"
          >
            새로고침
          </button>

          <button
            onClick={reset}
            className="px-6 py-3 bg-[#f5f5f5] text-[#1a1a1a] rounded-xl font-medium hover:bg-[#e5e5e5]"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}
