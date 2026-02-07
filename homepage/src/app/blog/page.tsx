import HomepageNav from '@/components/HomepageNav'
import HomepageFooter from '@/components/HomepageFooter'
import { getAllArticles } from '@/lib/blog'

const TAG_COLORS: Record<string, string> = {
  '학습 팁': 'bg-hp-indigo/10 text-hp-indigo',
  '표현 모음': 'bg-hp-amber/10 text-hp-amber',
  '학습 방법': 'bg-hp-emerald/10 text-hp-emerald',
  '문법': 'bg-hp-rose/10 text-hp-rose',
  '여행 영어': 'bg-hp-blue/10 text-hp-blue',
  '트렌드': 'bg-hp-violet/10 text-hp-violet',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function BlogPage() {
  const articles = getAllArticles()
  const featured = articles.find((a) => a.featured)
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="min-h-screen bg-hp-cream">
      <HomepageNav />

      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-hp-text mb-4">
              <span className="bg-gradient-to-r from-hp-indigo to-hp-violet bg-clip-text text-transparent">
                블로그
              </span>
            </h1>
            <p className="text-hp-muted text-base sm:text-lg">
              영어 학습에 도움이 되는 팁과 소식을 전해드립니다
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-hp-muted text-lg">아직 작성된 글이 없습니다</p>
              <p className="text-hp-muted text-sm mt-2">곧 유용한 학습 콘텐츠를 준비할게요!</p>
            </div>
          ) : (
            <>
              {featured && (
                <a
                  href={`/blog/${featured.slug}/`}
                  className="block mb-12 group"
                >
                  <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-br from-hp-indigo via-hp-violet to-hp-rose p-8 sm:p-12">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full text-white mb-4">
                        추천 글
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:underline decoration-white/40 underline-offset-4">
                        {featured.title}
                      </h2>
                      <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                        {featured.description}
                      </p>
                      <div className="flex items-center gap-4 mt-6 text-white/60 text-xs">
                        <span>{formatDate(featured.date)}</span>
                        <span>읽기 {featured.readTime}</span>
                        {featured.tags[0] && (
                          <span className="px-2 py-0.5 bg-white/10 rounded-full">{featured.tags[0]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rest.map((article) => {
                  const tag = article.tags[0] || ''
                  return (
                    <a
                      key={article.slug}
                      href={`/blog/${article.slug}/`}
                      className="block group"
                    >
                      <article className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          {tag && (
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
                              {tag}
                            </span>
                          )}
                          <span className="text-xs text-hp-muted">{formatDate(article.date)}</span>
                        </div>

                        <h3 className="text-lg font-bold text-hp-text mb-2 group-hover:text-hp-indigo transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-sm text-hp-muted leading-relaxed flex-1">
                          {article.description}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                          <span className="text-xs text-hp-muted">읽기 {article.readTime}</span>
                          <span className="text-xs font-semibold text-hp-indigo group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            읽어보기
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </article>
                    </a>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <HomepageFooter />
    </div>
  )
}
