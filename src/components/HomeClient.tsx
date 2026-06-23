'use client'

import { useState, useEffect } from 'react'
import type { NewsItem, Article } from '@/lib/content'

const T = {
  pt: {
    nav: ['Notícias','Artigos','Sobre'],
    eyebrow: 'Astronomia & Astrofísica',
    title: 'De Olho no', glow: 'Céu',
    sub: 'O universo explicado para todos — notícias e descobertas em linguagem simples.',
    live: 'Ao vivo',
    leftTitle: 'Notícias & Descobertas',
    rightTitle: 'Conceitos & Física',
    readMore: 'Ler artigo completo →',
    source: 'Fonte original',
    minRead: 'min de leitura',
    concept: '✦ Conceito',
    discovery: '🔭 Descoberta',
    noNews: 'Execute o script Python para gerar notícias automaticamente.',
    noArt: 'Execute o script Python para gerar artigos automaticamente.',
    footer: 'De Olho no Céu · Conteúdo gerado por IA a partir de fontes científicas · Atualizado diariamente',
    about: 'De Olho no Céu reúne automaticamente notícias de fontes como NASA, ESA, Space.com e o Centro de Ciência Viva do Algarve, e usa inteligência artificial para reescrever cada descoberta em linguagem acessível — sem fórmulas, sem jargão. Dois artigos conceituais sobre física e astrofísica são publicados todos os dias.',
    aboutLabel: 'Sobre o projeto',
    less: '← Menos',
  },
  en: {
    nav: ['News','Articles','About'],
    eyebrow: 'Astronomy & Astrophysics',
    title: 'Eye on the', glow: 'Sky',
    sub: 'The universe explained for everyone — news and discoveries in plain language.',
    live: 'Live',
    leftTitle: 'News & Discoveries',
    rightTitle: 'Concepts & Physics',
    readMore: 'Read full article →',
    source: 'Original source',
    minRead: 'min read',
    concept: '✦ Concept',
    discovery: '🔭 Discovery',
    noNews: 'Run the Python script to automatically generate news.',
    noArt: 'Run the Python script to automatically generate articles.',
    footer: 'Eye on the Sky · AI-generated content from scientific sources · Updated daily',
    about: 'Eye on the Sky automatically gathers news from NASA, ESA, Space.com and the Algarve Living Science Centre, and uses AI to rewrite each discovery in plain language — no formulas, no jargon. Two conceptual articles on physics and astrophysics are published every day.',
    aboutLabel: 'About',
    less: '← Less',
  }
}

const TICKERS = {
  pt: [
    '🌌 A Via Láctea tem entre 100 e 400 bilhões de estrelas',
    '🔭 O James Webb opera a 1,5 milhão km da Terra',
    '⚫ O buraco negro M87* equivale a 6,5 bilhões de sóis',
    '🪐 Saturno flutuaria na água — é menos denso que H₂O',
    '💫 A luz do Sol leva 8 min 20 s para chegar à Terra',
  ],
  en: [
    '🌌 The Milky Way has between 100–400 billion stars',
    '🔭 James Webb operates 1.5 million km from Earth',
    '⚫ Black hole M87* equals 6.5 billion suns in mass',
    '🪐 Saturn would float on water — less dense than H₂O',
    '💫 Sunlight takes 8 min 20 sec to reach Earth',
  ]
}

function fmtDate(d: string, lang: string) {
  const dt = new Date(d)
  return lang === 'pt'
    ? dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
    : dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

export default function HomeClient({ news, articles }: { news: NewsItem[], articles: Article[] }) {
  const [lang, setLang] = useState<'pt'|'en'>('pt')
  const [tick, setTick] = useState(0)
  const [expanded, setExpanded] = useState<string|null>(null)
  const t = T[lang]

  useEffect(() => {
    const id = setInterval(() => setTick(i => (i+1) % TICKERS[lang].length), 6000)
    return () => clearInterval(id)
  }, [lang])

  return (
    <>
      <header className="site-header">
        <a href="/" className="header-logo">
          <div className="logo-icon" />
          <span className="logo-text">{t.title} <span>{t.glow}</span></span>
        </a>
        <nav className="header-nav">
          {t.nav.map(n => <a key={n} href={`#${n.toLowerCase()}`}>{n}</a>)}
        </nav>
        <div className="lang-toggle">
          <button className={`lang-btn${lang==='pt'?' active':''}`} onClick={()=>setLang('pt')}>PT</button>
          <button className={`lang-btn${lang==='en'?' active':''}`} onClick={()=>setLang('en')}>EN</button>
        </div>
      </header>

      <div className="hero-banner">
        <div className="hero-eyebrow">{t.eyebrow}</div>
        <h1 className="hero-title">{t.title} <span className="glow">{t.glow}</span></h1>
        <p className="hero-subtitle">{t.sub}</p>
      </div>

      <div className="live-ticker">
        <span className="ticker-label">{t.live}</span>
        <span className="ticker-dot" />
        <span className="ticker-text"><strong>{TICKERS[lang][tick]}</strong></span>
      </div>

      <main className="main-grid">
        {/* LEFT — NEWS */}
        <section className="panel-left" id="noticias">
          <div className="panel-header">
            <div className="panel-title">📡 {t.leftTitle}</div>
            <span className="panel-count">{news.length} itens</span>
          </div>
          <div className="ad-slot"><span className="ad-slot-label">PUBLICIDADE · ADVERTISEMENT</span></div>

          {news.length === 0
            ? <p style={{color:'var(--text-muted)',fontSize:'0.85rem',padding:'2rem 0',textAlign:'center'}}>{t.noNews}</p>
            : news.map(item => (
              <article className="news-card" key={item.slug}>
                <div className="news-card-meta">
                  <span className={`news-source ${item.sourceType}`}>{item.source}</span>
                  <span className="news-date">{fmtDate(item.date, lang)}</span>
                </div>
                <h2 className="news-title">{lang==='pt' ? item.title : (item.titleEn||item.title)}</h2>
                <p className="news-excerpt">{lang==='pt' ? item.excerpt : (item.excerptEn||item.excerpt)}</p>
                {item.tags?.length > 0 && (
                  <div className="news-tags">{item.tags.map(tag=><span className="news-tag" key={tag}>{tag}</span>)}</div>
                )}
                <a href={item.sourceUrl} className="news-link" target="_blank" rel="noopener noreferrer">{t.source} ↗</a>
              </article>
            ))
          }
        </section>

        {/* RIGHT — ARTICLES */}
        <section className="panel-right" id="artigos">
          <div className="panel-header">
            <div className="panel-title">✨ {t.rightTitle}</div>
            <span className="panel-count">{articles.length} artigos</span>
          </div>
          <div className="ad-slot"><span className="ad-slot-label">PUBLICIDADE · ADVERTISEMENT</span></div>

          {articles.length === 0
            ? <p style={{color:'var(--text-muted)',fontSize:'0.85rem',padding:'2rem 0',textAlign:'center'}}>{t.noArt}</p>
            : articles.map(item => {
              const isOpen = expanded === item.slug
              const body = lang==='pt' ? item.content : (item.contentEn||item.content)
              const title = lang==='pt' ? item.title : (item.titleEn||item.title)
              const cat = lang==='pt' ? item.category : (item.categoryEn||item.category)
              const paras = body.split('\n\n').filter(Boolean)
              return (
                <article className="article-card" key={item.slug}>
                  <div className="article-badge">
                    <span className={item.type==='concept'?'badge-concept':'badge-news-art'}>
                      {item.type==='concept' ? t.concept : t.discovery}
                    </span>
                    <span style={{color:'var(--text-muted)',fontSize:'0.6rem'}}>{cat} · {fmtDate(item.date,lang)}</span>
                  </div>
                  <h2 className="article-title">{title}</h2>
                  <div className="article-reading-time">⏱ {item.readingTime} {t.minRead}</div>
                  <div className="article-body">
                    {(isOpen ? paras : paras.slice(0,2)).map((p,i)=><p key={i}>{p}</p>)}
                  </div>
                  <button className="read-more-btn" onClick={()=>setExpanded(isOpen?null:item.slug)}>
                    {isOpen ? t.less : t.readMore}
                  </button>
                </article>
              )
            })
          }
        </section>
      </main>

      {/* ABOUT */}
      <section id="sobre" style={{background:'var(--panel-dark)',borderTop:'1px solid var(--border-dim)',padding:'2rem 1.5rem',position:'relative',zIndex:1}}>
        <div style={{maxWidth:'700px',margin:'0 auto',textAlign:'center'}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',letterSpacing:'0.14em',color:'var(--aurora-cyan)',textTransform:'uppercase',marginBottom:'0.75rem'}}>{t.aboutLabel}</p>
          <p style={{fontFamily:"'Crimson Pro',serif",fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.7}}>{t.about}</p>
        </div>
      </section>

      <footer className="site-footer">
        <p className="footer-text">{t.footer}</p>
      </footer>
    </>
  )
}
