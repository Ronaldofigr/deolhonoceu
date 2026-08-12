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

// ── TICKER ─────────────────────────────────────────────────────────────────────
export interface TickerData {
  pt: string[]
  en: string[]
  es: string[]
}

const TICKER_DEFAULTS: TickerData = {
  pt: [
    '🌌 A Via Láctea tem entre 100 e 400 bilhões de estrelas',
    '🛰️ O James Webb opera a 1,5 milhão km da Terra',
    '⚫ O buraco negro M87* equivale a 6,5 bilhões de sóis',
    '🪐 Saturno flutuaria na água — é menos denso que ela',
    '☀️ A luz do Sol leva 8 min 20 s para chegar à Terra',
  ],
  en: [
    '🌌 The Milky Way has between 100–400 billion stars',
    '🛰️ James Webb operates 1.5 million km from Earth',
    '⚫ Black hole M87* equals 6.5 billion suns in mass',
    '🪐 Saturn would float on water — less dense than it',
    '☀️ Sunlight takes 8 min 20 sec to reach Earth',
  ],
  es: [
    '🌌 La Vía Láctea tiene entre 100 y 400 mil millones de estrellas',
    '🛰️ El James Webb opera a 1,5 millones de km de la Tierra',
    '⚫ El agujero negro M87* equivale a 6.500 millones de soles',
    '🪐 Saturno flotaría en el agua — es menos denso que ella',
    '☀️ La luz del Sol tarda 8 min 20 s en llegar a la Tierra',
  ],
}

export function getTicker(): TickerData {
  const file = path.join(process.cwd(), 'content', 'ticker.json')
  if (!fs.existsSync(file)) return TICKER_DEFAULTS
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw) as Partial<TickerData>
    return {
      pt: parsed.pt?.length ? parsed.pt : TICKER_DEFAULTS.pt,
      en: parsed.en?.length ? parsed.en : TICKER_DEFAULTS.en,
      es: parsed.es?.length ? parsed.es : TICKER_DEFAULTS.es,
    }
  } catch {
    return TICKER_DEFAULTS
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
