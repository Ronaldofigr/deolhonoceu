import { getAllNews, getAllArticles, getPhotoWeek, getMoonInfo, getTicker } from '@/lib/content'
import HomeClient from '@/components/HomeClient'

export default function Home() {
  const news      = getAllNews()
  const articles  = getAllArticles()
  const photoWeek = getPhotoWeek()
  const moonInfo  = getMoonInfo()
  const ticker    = getTicker()
  return <HomeClient news={news} articles={articles} photoWeek={photoWeek} moonInfo={moonInfo} ticker={ticker} />
}
