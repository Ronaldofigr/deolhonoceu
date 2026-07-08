import { getAllNews, getAllArticles, getPhotoWeek, getMoonInfo } from '@/lib/content'
import HomeClient from '@/components/HomeClient'

export default function Home() {
  const news      = getAllNews()
  const articles  = getAllArticles()
  const photoWeek = getPhotoWeek()
  const moonInfo  = getMoonInfo()
  return <HomeClient news={news} articles={articles} photoWeek={photoWeek} moonInfo={moonInfo} />
}
