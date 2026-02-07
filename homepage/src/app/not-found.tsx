export default function NotFound() {
  return (
    <div className="min-h-screen bg-hp-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 max-w-md w-full text-center">
        <div className="text-6xl font-serif font-bold bg-gradient-to-r from-hp-indigo to-hp-violet bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="font-serif text-2xl font-bold text-hp-text mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-hp-muted text-sm mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-hp-indigo to-hp-violet text-white font-semibold rounded-full hover:shadow-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}
