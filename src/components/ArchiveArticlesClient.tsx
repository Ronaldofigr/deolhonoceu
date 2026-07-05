'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Article } from '@/lib/content'

const T = {
  pt: {
    title: 'Arquivo de Artigos',
    back: '← Voltar para o início',
    readMore: 'Ler artigo completo →',
    less: '↑ Menos',
    empty: 'Nenhum artigo encontrado.',
    minRead: 'min de leitura',
    concept: '★ Conceito',
    discovery: '☄️ Descoberta',
  },
  en: {
    title: 'Articles Archive',
    back: '← Back to home',
    readMore: 'Read full article →',
    less: '↑ Less',
    empty: 'No articles found.',
    minRead: 'min read',
    concept: '★ Concept',
    discovery: '☄️ Discovery',
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

export default function ArchiveArticlesClient({ articles }: { articles: Article[] }) {
  const [lang, setLang] = useState<'pt' | 'en'>('pt')
  const [expanded, setExpanded] = useState<string | null>(null)
  const t = T[lang]

  const groups: Record<string, Article[]> = {}
  for (const item of articles) {
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
        {articles.length === 0 && (
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
              const isOpen = expanded === item.slug
              const body = lang === 'pt' ? item.content : (item.contentEn || item.content)
              const title = lang === 'pt' ? item.title : (item.titleEn || item.title)
              const cat = lang === 'pt' ? item.category : (item.categoryEn || item.category)
              const paras = body.split('\n\n').filter(Boolean)
              return (
                <article className="article-card" key={item.slug}>
                  <div className="article-badge">
                    <span className={item.type === 'concept' ? 'badge-concept' : 'badge-news-art'}>
                      {item.type === 'concept' ? t.concept : t.discovery}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{cat} · {fmtDate(item.date, lang)}</span>
                  </div>
                  <h3 className="article-title">{title}</h3>
                  <div className="article-reading-time">☕ {item.readingTime} {t.minRead}</div>
                  <div className="article-body">
                    {(isOpen ? paras : paras.slice(0, 2)).map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                  <button className="read-more-btn" onClick={() => setExpanded(isOpen ? null : item.slug)}>
                    {isOpen ? t.less : t.readMore}
                  </button>
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
