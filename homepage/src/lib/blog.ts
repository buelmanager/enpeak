import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface BlogArticle {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  featured?: boolean
  readTime: string
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'blog', 'release')

function calculateReadTime(text: string): string {
  const charCount = text.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.ceil(charCount / 500))
  return `${minutes}분`
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export function getArticleBySlug(slug: string): BlogArticle | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  const html = marked(content) as string

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    tags: data.tags || [],
    description: data.description || '',
    featured: data.featured === true,
    readTime: calculateReadTime(content),
    content: html,
  }
}

export function getAllArticles(): BlogArticle[] {
  const slugs = getAllSlugs()
  const articles = slugs
    .map((s) => getArticleBySlug(s))
    .filter((a): a is BlogArticle => a !== null)

  articles.sort((a, b) => (a.date > b.date ? -1 : 1))
  return articles
}
