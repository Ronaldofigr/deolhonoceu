import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'De Olho no Céu | Astronomia & Astrofísica',
  description: 'Notícias e descobertas do universo em linguagem acessível. Atualizado diariamente por IA.',
  keywords: 'astronomia, astrofísica, espaço, universo, NASA, ESA, buracos negros, galáxias',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8198154501527063"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
