'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { NewsItem } from '@/lib/content'

const T = {
  pt: {
    title: 'Arquivo de Notícias',
    back: '← Voltar para o início',
    readMore: 'Ler notícia completa →',
    less: '↑ Recolher',
    source: 'Fonte original',
    empty: 'Nenhuma notícia encontrada.',
  },
  en: {
    title: 'News Archive',
    back: '← Back to home',
    readMore: 'Read full news →',
    less: '↑ Collapse',
    source: 'Original source',
    empty: 'No news found.',
  },
}

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']

function monthLabel(key: string, lang: 'pt' | 'en') {
  const [y, m] = key.split('-').map(Number)
  const months = lang === 'pt' ? MONTHS_PT : MONTHS_EN
  return lang === 'pt' ? `${months[m - 1]} de ${y}` : `${months[m - 1]} ${y}`
}

function fmtDate(d: string, lang: string) {
  const dt = new Date(d)
  return lang === 'pt'
    ? dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ArchiveNewsClient({ news }: { news: NewsItem[] }) {
  const [lang, setLang] = useState<'pt' | 'en'>('pt')
  const [expandedNews, setExpandedNews] = useState<string | null>(null)
  const t = T[lang]

  const groups: Record<string, NewsItem[]> = {}
  for (const item of news) {
    const d = new Date(item.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  const orderedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <>
      <header className="site-header">
        <Link href="/" className="header-logo">
          <div className="logo-icon" />
          <span className="logo-text">De Olho no <span className="glow">Céu</span></span>
        </Link>
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'pt' ? 'active' : ''}`} onClick={() => setLang('pt')}>PT</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
      </header>

      <div className="hero-banner">
        <div className="hero-eyebrow">{t.title}</div>
        <h1 className="hero-title">{t.title}</h1>
        <p className="hero-subtitle"><Link href="/">{t.back}</Link></p>
      </div>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        {news.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>{t.empty}</p>
        )}

        {orderedKeys.map(key => (
          <section key={key} style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--aurora-cyan)',
              borderBottom: '1px solid var(--border-dim)',
              paddingBottom: '0.6rem',
              marginBottom: '1rem',
            }}>
              {monthLabel(key, lang)}
            </h2>

            {groups[key].map(item => {
              const isOpen = expandedNews === item.slug
              const body = lang === 'pt' ? item.content : (item.contentEn || item.content)
              const paras = body ? body.split('\n\n').filter(Boolean) : []
              return (
                <article className="news-card" key={item.slug}>
                  <div className="news-card-meta">
                    <span className={`news-source ${item.sourceType}`}>{item.source}</span>
                    <span className="news-date">{fmtDate(item.date, lang)}</span>
                  </div>
                  {item.image && (
                    <div className="news-card-image-wrap">
                      <img
                        src={item.image}
                        alt={lang === 'pt' ? item.title : (item.titleEn || item.title)}
                        className="news-card-image"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                      />
                      {item.imageCredit && <span className="news-card-image-credit">Crédito: {item.imageCredit}</span>}
                    </div>
                  )}
                  <h3 className="news-title">{lang === 'pt' ? item.title : (item.titleEn || item.title)}</h3>
                  <p className="news-excerpt">{lang === 'pt' ? item.excerpt : (item.excerptEn || item.excerpt)}</p>

                  {isOpen && paras.length > 0 && (
                    <div className="news-article-body" style={{ marginTop: '0.6rem' }}>
                      {paras.map((p, i) => (
                        <p key={i} style={{ fontFamily: "'Crimson Pro', serif", fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '0.5rem' }}>{p}</p>
                      ))}
                    </div>
                  )}

                  {item.tags?.length > 0 && (
                    <div className="news-tags">{item.tags.map(tag => <span className="news-tag" key={tag}>{tag}</span>)}</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    {body && body.length > (item.excerpt?.length || 0) + 20 && (
                      <button
                        className="read-more-btn"
                        onClick={() => setExpandedNews(isOpen ? null : item.slug)}
                        style={{ borderColor: 'var(--aurora-cyan)', color: 'var(--aurora-cyan)' }}
                      >
                        {isOpen ? t.less : t.readMore}
                      </button>
                    )}
                    <a href={item.sourceUrl} className="news-link" target="_blank" rel="noopener noreferrer">
                      {t.source} ↗
                    </a>
                  </div>
                </article>
              )
            })}
          </section>
        ))}
      </main>

      <footer className="site-footer">
        <p className="footer-text">De Olho no Céu</p>
      </footer>
    </>
  )
}
