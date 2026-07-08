'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { NewsItem, Article } from '@/lib/content'

const T = {
  pt: {
    nav: ['Notícias','Artigos','Sobre'],
    eyebrow: 'Astronomia & Astrofísica',
    title: 'De Olho no',
    glow: 'Céu',
    sub: 'O universo explicado para todos — notícias e descobertas em linguagem simples.',
    live: 'Ao vivo',
    leftTitle: 'Notícias & Descobertas',
    rightTitle: 'Conceitos & Física',
    readMore: 'Ler artigo completo →',
    source: 'Fonte original',
    minRead: 'min de leitura',
    concept: '★ Conceito',
    discovery: '☄️ Descoberta',
    noNews: 'Execute o script Python para gerar notícias automaticamente.',
    noArt: 'Execute o script Python para gerar artigos automaticamente.',
    footer: 'De Olho no Céu · Conteúdo gerado por IA a partir de fontes científicas · Atualizado diariamente',
    about: 'De Olho no Céu recria automaticamente notícias de fontes como NASA, ESA, Space.com e o Centro de Ciência Viva do Algarve, e usa inteligência artificial para reescrever cada descoberta em linguagem acessível — sem fórmulas, sem jargão. Dois artigos conceituais sobre física e astrofísica são publicados todos os dias.',
    aboutLabel: 'Sobre o projeto',
    less: '↑ Menos',
    readNews: 'Ler notícia completa →',
    lessNews: '↑ Recolher',
    photoWeek: '📷 Imagem da Semana',
    photoCredit: 'Crédito',
    archiveNews: 'Arquivo de Notícias',
    archiveArticles: 'Arquivo de Artigos',
    moonPhase: 'Fase atual',
    moonIllum: 'iluminada',
    moonNext: 'Próxima fase',
    moonEvent: 'Próximo evento',
    moonCultural: 'Nome cultural do mês',
  },
  en: {
    nav: ['News','Articles','About'],
    eyebrow: 'Astronomy & Astrophysics',
    title: 'Eye on the',
    glow: 'Sky',
    sub: 'The universe explained for everyone — news and discoveries in plain language.',
    live: 'Live',
    leftTitle: 'News & Discoveries',
    rightTitle: 'Concepts & Physics',
    readMore: 'Read full article →',
    source: 'Original source',
    minRead: 'min read',
    concept: '★ Concept',
    discovery: '☄️ Discovery',
    noNews: 'Run the Python script to automatically generate news.',
    noArt: 'Run the Python script to automatically generate articles.',
    footer: 'Eye on the Sky · AI-generated content from scientific sources · Updated daily',
    about: 'Eye on the Sky automatically gathers news from NASA, ESA, Space.com and the Algarve Living Science Centre, and uses AI to rewrite each discovery in plain language — no formulas, no jargon. Two conceptual articles on physics and astrophysics are published every day.',
    aboutLabel: 'About',
    less: '↑ Less',
    readNews: 'Read full news →',
    lessNews: '↑ Collapse',
    photoWeek: '📷 Image of the Week',
    photoCredit: 'Credit',
    archiveNews: 'News Archive',
    archiveArticles: 'Articles Archive',
    moonPhase: 'Current phase',
    moonIllum: 'illuminated',
    moonNext: 'Next phase',
    moonEvent: 'Next event',
    moonCultural: "This month's cultural name",
  }
}

const TICKERS = {
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
  ]
}

interface PhotoWeek {
  imageUrl: string
  title: string
  titleEn: string
  caption: string
  captionEn: string
  credit: string
  week: string
}

function fmtDate(d: string, lang: string) {
  const dt = new Date(d)
  return lang === 'pt'
    ? dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HomeClient({
  news,
  articles,
  photoWeek = null,
  moonInfo = null,
}: {
  news: import('@/lib/content').NewsItem[]
  articles: import('@/lib/content').Article[]
  photoWeek?: PhotoWeek | null
  moonInfo?: import('@/lib/content').MoonInfo | null
}) {
  const [lang, setLang] = useState<'pt' | 'en'>('pt')
  const [tick, setTick] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedNews, setExpandedNews] = useState<string | null>(null)
  const t = T[lang]

  useEffect(() => {
    const id = setInterval(() => setTick(i => (i + 1) % TICKERS[lang].length), 6000)
    return () => clearInterval(id)
  }, [lang])

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <Link href="/" className="header-logo">
          <div className="logo-icon" />
          <span className="logo-text">{t.title} <span className="glow">{t.glow}</span></span>
        </Link>
        <nav className="header-nav">
          {t.nav.map(n => <a key={n} href={`#${n.toLowerCase()}`}>{n}</a>)}
          <Link href="/arquivo-noticias/">{t.archiveNews}</Link>
          <Link href="/arquivo-artigos/">{t.archiveArticles}</Link>
        </nav>
        <div className="lang-toggle">
          <button className={`lang-btn ${lang==='pt' ? 'active':''}`} onClick={()=>setLang('pt')}>PT</button>
          <button className={`lang-btn ${lang==='en' ? 'active':''}`} onClick={()=>setLang('en')}>EN</button>
        </div>
      </header>

      {/* HERO */}
      <div className="hero-banner">
        <div className="hero-eyebrow">{t.eyebrow}</div>
        <h1 className="hero-title">{t.title} <span className="glow">{t.glow}</span></h1>
        <p className="hero-subtitle">{t.sub}</p>
      </div>

      {/* FOTO DA SEMANA */}
      {photoWeek && (
        <div className="photo-week">
          <div className="photo-week-label">{t.photoWeek}</div>
          <div className="photo-week-inner">
            <img
              src={photoWeek.imageUrl}
              alt={lang === 'pt' ? photoWeek.title : photoWeek.titleEn}
              className="photo-week-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="photo-week-caption">
              <h3 className="photo-week-title">
                {lang === 'pt' ? photoWeek.title : photoWeek.titleEn}
              </h3>
              <p className="photo-week-text">
                {lang === 'pt' ? photoWeek.caption : photoWeek.captionEn}
              </p>
              <span className="photo-week-credit">
                {t.photoCredit}: {photoWeek.credit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TICKER */}
      <div className="live-ticker">
        <span className="ticker-label">{t.live}</span>
        <span className="ticker-dot" />
        <span className="ticker-text"><strong>{TICKERS[lang][tick]}</strong></span>
      </div>

      {/* FASE DA LUA */}
      {moonInfo && (
        <div className="moon-bar">
          {moonInfo.imagem && (
            <img
              src={moonInfo.imagem}
              alt={lang === 'pt' ? moonInfo.fase : moonInfo.faseEn}
              className="moon-bar-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="moon-bar-items">
            <div className="moon-bar-item">
              <span className="moon-bar-label">{t.moonPhase}</span>
              <span className="moon-bar-value">
                🌙 {lang === 'pt' ? moonInfo.fase : moonInfo.faseEn} · {moonInfo.iluminacao}% {t.moonIllum}
              </span>
            </div>
            <div className="moon-bar-item">
              <span className="moon-bar-label">{t.moonNext}</span>
              <span className="moon-bar-value">{moonInfo.proximaFase} — {fmtDate(moonInfo.proximaFaseData, lang)}</span>
            </div>
            <div className="moon-bar-item">
              <span className="moon-bar-label">{t.moonEvent}</span>
              <span className="moon-bar-value">{moonInfo.evento} — {fmtDate(moonInfo.eventoData, lang)}</span>
            </div>
            {moonInfo.nomeCultural && (
              <div className="moon-bar-item">
                <span className="moon-bar-label">{t.moonCultural}</span>
                <span className="moon-bar-value">{moonInfo.nomeCultural}</span>
              </div>
            )}
          </div>
          {moonInfo.imagemCredito && (
            <span className="moon-bar-credit">{t.photoCredit}: {moonInfo.imagemCredito}</span>
          )}
        </div>
      )}

      {/* MAIN GRID */}
      <main className="main-grid">
        {/* LEFT — NEWS */}
        <section className="panel-left" id="noticias">
          <div className="panel-header">
            <div className="panel-title">📰 {t.leftTitle}</div>
            <span className="panel-count">{news.length} itens</span>
          </div>
          <div className="ad-slot"><span className="ad-slot-label">PUBLICIDADE · ADVERTISEMENT</span></div>

          {news.length === 0
            ? <p style={{color:'var(--text-muted)',fontSize:'0.85rem',padding:'2rem 0',textAlign:'center'}}>{t.noNews}</p>
            : news.map(item => {
              const isNewsOpen = expandedNews === item.slug
              const newsBody = lang==='pt' ? item.content : (item.contentEn||item.content)
              const newsParas = newsBody ? newsBody.split('\n\n').filter(Boolean) : []
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
                        alt={lang==='pt' ? item.title : (item.titleEn||item.title)}
                        className="news-card-image"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                      />
                      {item.imageCredit && <span className="news-card-image-credit">{t.photoCredit}: {item.imageCredit}</span>}
                    </div>
                  )}
                  <h2 className="news-title">{lang==='pt' ? item.title : (item.titleEn||item.title)}</h2>
                  <p className="news-excerpt">{lang==='pt' ? item.excerpt : (item.excerptEn||item.excerpt)}</p>

                  {/* Texto completo expansível */}
                  {newsParas.length > 0 && (
                    <div className="news-article-body" style={{marginTop:'0.6rem'}}>
                      {(isNewsOpen ? newsParas : newsParas.slice(0,1)).map((p,i)=>(
                        <p key={i} style={{fontFamily:"'Crimson Pro',serif",fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.65,marginBottom:'0.5rem'}}>{p}</p>
                      ))}
                    </div>
                  )}

                  {item.tags?.length > 0 && (
                    <div className="news-tags">{item.tags.map(tag=><span className="news-tag" key={tag}>{tag}</span>)}</div>
                  )}

                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginTop:'0.6rem',flexWrap:'wrap'}}>
                    {newsBody && newsBody.length > (item.excerpt?.length || 0) + 20 && (
                      <button
                        className="read-more-btn"
                        onClick={()=>setExpandedNews(isNewsOpen?null:item.slug)}
                        style={{borderColor:'var(--aurora-cyan)',color:'var(--aurora-cyan)'}}
                      >
                        {isNewsOpen ? t.lessNews : t.readNews}
                      </button>
                    )}
                    <a href={item.sourceUrl} className="news-link" target="_blank" rel="noopener noreferrer">
                      {t.source} ↗️
                    </a>
                  </div>
                </article>
              )
            })
          }
        </section>

        {/* RIGHT — ARTIGOS */}
        <section className="panel-right" id="artigos">
          <div className="panel-header">
            <div className="panel-title">🧠 {t.rightTitle}</div>
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
                    <span className={item.type==='concept' ? 'badge-concept' : 'badge-news-art'}>
                      {item.type==='concept' ? t.concept : t.discovery}
                    </span>
                    <span style={{color:'var(--text-muted)',fontSize:'0.6rem'}}>{cat} · {fmtDate(item.date, lang)}</span>
                  </div>
                  {item.image && (
                    <div className="news-card-image-wrap">
                      <img
                        src={item.image}
                        alt={title}
                        className="news-card-image"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                      />
                      {item.imageCredit && <span className="news-card-image-credit">{t.photoCredit}: {item.imageCredit}</span>}
                    </div>
                  )}
                  <h2 className="article-title">{title}</h2>
                  <div className="article-reading-time">☕ {item.readingTime} {t.minRead}</div>
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
