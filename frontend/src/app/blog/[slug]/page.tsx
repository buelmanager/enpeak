import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSlugs, getArticleBySlug } from '@/lib/blog'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
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

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const article = getArticleBySlug(params.slug)
  if (!article) return {}

  return {
    title: `${article.title} | Flu Blog`,
    description: article.description,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      tags: article.tags,
      locale: 'ko_KR',
      siteName: 'Flu',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export default function BlogArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const article = getArticleBySlug(params.slug)
  if (!article) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { '@type': 'Organization', name: 'Flu' },
    publisher: { '@type': 'Organization', name: 'Flu' },
    keywords: article.tags.join(', '),
  }

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#0D9488] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>

          <article className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E2E8F0]">
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-4 leading-tight tracking-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-[#94A3B8] mb-8 pb-8 border-b border-[#F1F5F9]">
              <span>{formatDate(article.date)}</span>
              <span aria-hidden>|</span>
              <span>{article.readTime} read</span>
            </div>

            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>

          {/* CTA */}
          <div className="mt-10 bg-gradient-to-br from-[#0D9488] to-[#0B8278] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              직접 말해봐야 실력이 됩니다
            </h3>
            <p className="text-white/80 text-sm mb-6">
              AI와 영어로 대화하며 배운 표현을 연습해보세요.
            </p>
            <Link
              href="/landing"
              className="inline-flex bg-white text-[#0D9488] font-semibold px-7 py-3 rounded-xl text-sm transition-all hover:bg-[#FAFAF8] active:scale-[0.97] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
            >
              Flu 자세히 보기
            </Link>
          </div>
        </div>
      </main>

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
