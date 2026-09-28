import { getAllNewsArchive } from '@/lib/content'
import ArchiveNewsClient from '@/components/ArchiveNewsClient'

export default function ArquivoNoticias() {
  const news = getAllNewsArchive()
  return <ArchiveNewsClient news={news} />
}
