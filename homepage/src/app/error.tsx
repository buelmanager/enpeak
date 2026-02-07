'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)
  return (
    <div className="min-h-screen bg-hp-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-hp-rose/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-hp-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-bold text-hp-text mb-2">
          문제가 발생했습니다
        </h1>
        <p className="text-hp-muted text-sm mb-8">
          페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-hp-indigo to-hp-violet text-white font-semibold rounded-full hover:shadow-lg transition-all"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
