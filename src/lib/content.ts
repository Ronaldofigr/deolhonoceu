import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface NewsItem {
  slug: string
  title: string
  titleEn: string
  excerpt: string
  excerptEn: string
  source: string
  sourceUrl: string
  sourceType: string
  tags: string[]
  date: string
  content: string
  contentEn: string
}

export interface Article {
  slug: string
  title: string
  titleEn: string
  category: string
  categoryEn: string
  readingTime: number
  content: string
  contentEn: string
  date: string
  type: string
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function getAllNews(): NewsItem[] {
  const dir = path.join(process.cwd(), 'content', 'noticias')
  ensureDir(dir)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      return { slug: file.replace('.md', ''), ...data, content } as NewsItem
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
}

export function getAllArticles(): Article[] {
  const dir = path.join(process.cwd(), 'content', 'artigos')
  ensureDir(dir)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      return { slug: file.replace('.md', ''), ...data, content } as Article
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
  }
export interface PhotoWeek {
  imageUrl: string
  title: string
  titleEn: string
  caption: string
  captionEn: string
  credit: string
  week: string
}

export function getPhotoWeek(): PhotoWeek | null {
  const file = path.join(process.cwd(), 'content', 'foto-semana.json')
  if (!fs.existsSync(file)) return null
  try {
    const raw = fs.readFileSync(file, 'utf8')
    return JSON.parse(raw) as PhotoWeek
  } catch {
    return null
  }
}
export function getAllNewsArchive(): NewsItem[] {
  const dir = path.join(process.cwd(), 'content', 'noticias')
  ensureDir(dir)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      return { slug: file.replace('.md', ''), ...data, content } as NewsItem
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllArticlesArchive(): Article[] {
  const dir = path.join(process.cwd(), 'content', 'artigos')
  ensureDir(dir)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      return { slug: file.replace('.md', ''), ...data, content } as Article
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
