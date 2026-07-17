import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface NewsItem {
  slug: string
  title: string
  titleEn: string
  titleEs: string
  excerpt: string
  excerptEn: string
  excerptEs: string
  source: string
  sourceUrl: string
  sourceType: string
  tags: string[]
  date: string
  content: string
  contentEn: string
  contentEs: string
  image?: string
  imageCredit?: string
  aiGenerated?: boolean
  aiProvider?: string
  aiModel?: string
  humanReviewed?: boolean
  references?: { title: string; url: string }[]
}

export interface Article {
  slug: string
  title: string
  titleEn: string
  titleEs: string
  category: string
  categoryEn: string
  categoryEs: string
  readingTime: number
  content: string
  contentEn: string
  contentEs: string
  date: string
  type: string
  image?: string
  imageCredit?: string
  aiGenerated?: boolean
  aiProvider?: string
  aiModel?: string
  humanReviewed?: boolean
  references?: { title: string; url: string }[]
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// O corpo do markdown pode conter o texto em PT, seguido de marcadores
// <!--lang:en--> e <!--lang:es--> com as versões em inglês e espanhol.
// Arquivos antigos (sem marcadores) simplesmente retornam en/es vazios,
// e o frontend cai de volta para o conteúdo em PT nesse caso.
function splitLangContent(raw: string) {
  const enTag = '<!--lang:en-->'
  const esTag = '<!--lang:es-->'
  const enIdx = raw.indexOf(enTag)
  if (enIdx === -1) return { pt: raw.trim(), en: '', es: '' }
  const pt = raw.slice(0, enIdx).trim()
  const esIdx = raw.indexOf(esTag, enIdx)
  if (esIdx === -1) {
    const en = raw.slice(enIdx + enTag.length).trim()
    return { pt, en, es: '' }
  }
  const en = raw.slice(enIdx + enTag.length, esIdx).trim()
  const es = raw.slice(esIdx + esTag.length).trim()
  return { pt, en, es }
}

export function getAllNews(): NewsItem[] {
  const dir = path.join(process.cwd(), 'content', 'noticias')
  ensureDir(dir)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content: rawContent } = matter(raw)
      const { pt, en, es } = splitLangContent(rawContent)
      return { slug: file.replace('.md', ''), ...data, content: pt, contentEn: en || data.contentEn || '', contentEs: es || en || data.contentEn || '' } as NewsItem
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
      const { data, content: rawContent } = matter(raw)
      const { pt, en, es } = splitLangContent(rawContent)
      return { slug: file.replace('.md', ''), ...data, content: pt, contentEn: en || data.contentEn || '', contentEs: es || en || data.contentEn || '' } as Article
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
  }
export interface PhotoWeek {
  imageUrl: string
  title: string
  titleEn: string
  titleEs: string
  caption: string
  captionEn: string
  captionEs: string
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
export interface MoonInfo {
  fase: string
  faseEn: string
  iluminacao: number
  proximaFase: string
  proximaFaseData: string
  evento: string
  eventoData: string
  nomeCultural: string
  mes: number
  atualizadoEm: string
  imagem?: string
  imagemCredito?: string
}

export function getMoonInfo(): MoonInfo | null {
  const file = path.join(process.cwd(), 'content', 'lua.json')
  if (!fs.existsSync(file)) return null
  try {
    const raw = fs.readFileSync(file, 'utf8')
    return JSON.parse(raw) as MoonInfo
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
      const { data, content: rawContent } = matter(raw)
      const { pt, en, es } = splitLangContent(rawContent)
      return { slug: file.replace('.md', ''), ...data, content: pt, contentEn: en || data.contentEn || '', contentEs: es || en || data.contentEn || '' } as NewsItem
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
      const { data, content: rawContent } = matter(raw)
      const { pt, en, es } = splitLangContent(rawContent)
      return { slug: file.replace('.md', ''), ...data, content: pt, contentEn: en || data.contentEn || '', contentEs: es || en || data.contentEn || '' } as Article
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
