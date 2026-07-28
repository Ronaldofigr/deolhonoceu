import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'De Olho no Céu | Astronomia & Astrofísica',
    template: '%s | De Olho no Céu',
  },
  description: 'Notícias e descobertas do universo em linguagem acessível. Atualizado diariamente por IA.',
  keywords: [
    'astronomia',
    'astrofísica',
    'espaço',
    'universo',
    'NASA',
    'ESA',
    'buracos negros',
    'galáxias',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        {children}

        <GoogleAnalytics gaId="G-1MSY7XE59V" />
      </body>
    </html>
  )
}
