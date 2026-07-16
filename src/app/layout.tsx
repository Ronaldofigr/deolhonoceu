import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://www.deolhonoceu.com.br'
const SITE_NAME = 'De Olho no Céu'
const SITE_DESC = 'Notícias e descobertas do universo em linguagem acessível. Astronomia e astrofísica atualizadas diariamente por IA a partir das fontes NASA, ESA e Space.com.'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'De Olho no Céu | Astronomia & Astrofísica',
    template: '%s | De Olho no Céu',
  },
  description: SITE_DESC,
  keywords: [
    'astronomia','astrofísica','espaço','universo','NASA','ESA','buracos negros',
    'galáxias','planetas','estrelas','telescópio','descobertas espaciais',
    'James Webb','Hubble','SpaceX','Starship','exoplanetas','cosmologia',
    'física quântica','relatividade','matéria escura','energia escura',
  ],
  authors: [{ name: 'De Olho no Céu', url: SITE_URL }],
  creator: 'De Olho no Céu',
  publisher: 'De Olho no Céu',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'pt-BR': SITE_URL,
      'en': `${SITE_URL}?lang=en`,
      'es': `${SITE_URL}?lang=es`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: ['en_US', 'es_ES'],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'De Olho no Céu | Astronomia & Astrofísica',
    description: SITE_DESC,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'De Olho no Céu — Astronomia & Astrofísica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'De Olho no Céu | Astronomia & Astrofísica',
    description: SITE_DESC,
    images: [OG_IMAGE],
    creator: '@deolhonoceu',
  },
  verification: {
    google: 'LAPxZG8K9BqnO2_E95UgxRPw58PBENndlIJ4bKiB2-0',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={SITE_URL} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8198154501527063"
          crossOrigin="anonymous"
        ></script>
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1MSY7XE59V"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1MSY7XE59V');
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
