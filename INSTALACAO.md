import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'De Olho no Céu | Astronomia & Astrofísica',
  description: 'Notícias e descobertas do universo em linguagem acessível. Astronomy news in plain language. Atualizado diariamente por IA.',
  keywords: 'astronomia, astrofísica, espaço, universo, NASA, ESA, buracos negros, galáxias, física, cosmologia',
  openGraph: {
    title: 'De Olho no Céu',
    description: 'O universo explicado para todos. Notícias e conceitos de astronomia em linguagem simples.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Google AdSense - adicione seu código aqui após aprovação */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossOrigin="anonymous"></script> */}
      </head>
      <body>{children}</body>
    </html>
  )
}
