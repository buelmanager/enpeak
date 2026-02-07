import Link from 'next/link'
import { getAllArticles } from '@/lib/blog'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

const TAG_COLORS: Record<string, string> = {
  '영어학습': 'bg-[#F0FDFA] text-[#0D9488]',
  '기본동사': 'bg-[#FEF3C7] text-[#92400E]',
  '구동사': 'bg-[#EDE9FE] text-[#6D28D9]',
  '어휘전략': 'bg-[#FCE7F3] text-[#BE185D]',
  '스피킹': 'bg-[#DBEAFE] text-[#1E40AF]',
  '문법': 'bg-[#FEE2E2] text-[#991B1B]',
  '표현': 'bg-[#E0E7FF] text-[#3730A3]',
  '번역': 'bg-[#FFEDD5] text-[#9A3412]',
  '관용어': 'bg-[#D1FAE5] text-[#065F46]',
  '회화': 'bg-[#F0FDFA] text-[#0D9488]',
}

export default function BlogListPage() {
  const articles = getAllArticles()
  const featured = articles.find((a) => a.featured)
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-[#0D9488]/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D9488] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1C1917] tracking-tight">Flu</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium text-[#0D9488]">
              Blog
            </Link>
            <Link
              href="/landing"
              className="bg-[#0D9488] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:bg-[#0B8278] active:scale-95"
            >
              Flu 자세히 보기
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight mb-3">
              Blog
            </h1>
            <p className="text-[#64748B] text-base">
              영어 학습에 도움이 되는 팁과 인사이트
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#64748B] text-lg">아직 작성된 글이 없습니다</p>
              <p className="text-[#94A3B8] text-sm mt-2">곧 유용한 학습 콘텐츠를 준비할게요!</p>
            </div>
          ) : (
            <>
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="block mb-10 group">
                  <div className="bg-gradient-to-br from-[#0D9488] to-[#0B8278] rounded-2xl p-8 sm:p-10 transition-all hover:shadow-[0_8px_30px_rgba(13,148,136,0.25)]">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full text-white mb-4">
                      추천 글
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:underline decoration-white/40 underline-offset-4">
                      {featured.title}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                      {featured.description}
                    </p>
                    <div className="flex items-center gap-4 mt-6 text-white/60 text-xs">
                      <span>{formatDate(featured.date)}</span>
                      <span>{featured.readTime} read</span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rest.map((article) => {
                  const tag = article.tags[0] || ''
                  return (
                    <Link key={article.slug} href={`/blog/${article.slug}`} className="block group">
                      <article className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#0D9488]/30 hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] transition-all h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          {tag && (
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
                              {tag}
                            </span>
                          )}
                          <span className="text-xs text-[#94A3B8]">{formatDate(article.date)}</span>
                        </div>

                        <h3 className="text-base font-bold text-[#1C1917] mb-2 group-hover:text-[#0D9488] transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-sm text-[#64748B] leading-relaxed flex-1 line-clamp-2">
                          {article.description}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F1F5F9]">
                          <span className="text-xs text-[#94A3B8]">{article.readTime} read</span>
                          <span className="text-xs font-semibold text-[#0D9488] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            읽어보기
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#0D9488] to-[#0B8278]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            읽는 것만으로는 부족합니다
          </h2>
          <p className="text-white/80 text-base mb-8">
            AI와 직접 영어로 대화하며 실력을 키워보세요.
          </p>
          <Link
            href="/landing"
            className="inline-flex bg-white text-[#0D9488] font-semibold px-8 py-3.5 rounded-2xl text-base transition-all hover:bg-[#FAFAF8] active:scale-[0.97] shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          >
            Flu 자세히 보기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1C1917]">Flu</span>
          </div>
          <p className="text-xs text-[#94A3B8]">2026 Flu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
