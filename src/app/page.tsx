import { getAllNews, getAllArticles, getPhotoWeek } from '@/lib/content'
import HomeClient from '@/components/HomeClient'

export default function Home() {
  const news      = getAllNews()
  const articles  = getAllArticles()
  const photoWeek = getPhotoWeek()
  return <HomeClient news={news} articles={articles} photoWeek={photoWeek} />
}
