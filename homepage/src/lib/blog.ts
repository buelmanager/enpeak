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
const CHARS_PER_MINUTE_KO = 500

function calculateReadTime(text: string): string {
  const plain = text.replace(/[#*\->\[\]()_`~|]/g, '').replace(/\s+/g, ' ')
  const charCount = plain.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.ceil(charCount / CHARS_PER_MINUTE_KO))
  return `${minutes}분`
}

function parseFrontmatter(
  data: Record<string, unknown>,
  slug: string,
) {
  const title = typeof data.title === 'string' ? data.title : slug
  const date = typeof data.date === 'string' ? data.date : ''
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : []
  const description =
    typeof data.description === 'string' ? data.description : ''
  const featured = data.featured === true

  return { title, date, tags, description, featured }
}

export function getAllSlugs(): string[] {
  try {
    if (!fs.existsSync(BLOG_DIR)) return []
    return fs
      .readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  } catch (e) {
    console.error(`[blog] Failed to read blog directory: ${e}`)
    return []
  }
}

export function getArticleBySlug(slug: string): BlogArticle | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  try {
    if (!fs.existsSync(filePath)) return null

    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    const meta = parseFrontmatter(data, slug)
    const html = marked.parse(content) as string

    return {
      slug,
      ...meta,
      readTime: calculateReadTime(content),
      content: html,
    }
  } catch (e) {
    console.error(`[blog] Failed to read article "${slug}": ${e}`)
    return null
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
