import { getAllNews, getAllArticles } from '@/lib/content'
import HomeClient from '@/components/HomeClient'
import fs from 'fs'
import path from 'path'

function getPhotoWeek() {
  try {
    const p = path.join(process.cwd(), 'content', 'foto-semana.json')
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function Home() {
  const news     = getAllNews()
  const articles = getAllArticles()
  const photoWeek = getPhotoWeek()
  return <HomeClient news={news} articles={articles} photoWeek={photoWeek} />
}
