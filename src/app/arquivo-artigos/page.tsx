import { getAllArticlesArchive } from '@/lib/content'
import ArchiveArticlesClient from '@/components/ArchiveArticlesClient'

export default function ArquivoArtigos() {
  const articles = getAllArticlesArchive()
  return <ArchiveArticlesClient articles={articles} />
}
