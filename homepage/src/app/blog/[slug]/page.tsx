import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSlugs, getArticleBySlug } from '@/lib/blog'
import HomepageNav from '@/components/HomepageNav'
import HomepageFooter from '@/components/HomepageFooter'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const article = getArticleBySlug(params.slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      tags: article.tags,
      locale: 'ko_KR',
      siteName: 'EnPeak',
      url: `${SITE_URL}/blog/${article.slug}`,
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.description,
    },
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

const TAG_COLORS: Record<string, string> = {
  '학습 팁': 'bg-hp-indigo/10 text-hp-indigo',
  '표현 모음': 'bg-hp-amber/10 text-hp-amber',
  '학습 방법': 'bg-hp-emerald/10 text-hp-emerald',
  '문법': 'bg-hp-rose/10 text-hp-rose',
  '여행 영어': 'bg-hp-blue/10 text-hp-blue',
  '트렌드': 'bg-hp-violet/10 text-hp-violet',
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
    author: { '@type': 'Organization', name: 'EnPeak' },
    publisher: { '@type': 'Organization', name: 'EnPeak' },
    keywords: article.tags.join(', '),
  }

  return (
    <div className="min-h-screen bg-hp-cream">
      <HomepageNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <a
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-hp-muted hover:text-hp-indigo transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            블로그 목록
          </a>

          <article className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100">
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-hp-text mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-hp-muted mb-8 pb-8 border-b border-gray-100">
              <span>{formatDate(article.date)}</span>
              <span aria-hidden>|</span>
              <span>읽기 {article.readTime}</span>
            </div>

            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>
      </main>

      <HomepageFooter />
    </div>
  )
}
