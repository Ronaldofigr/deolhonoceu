'use client'

import { useEffect } from 'react'
import { carregarPopunder } from '@/lib/popunder'

const SOCIAL_BAR_SRC = 'https://bauval.org/14/6e454c07daae606cd758c694b8c479d4' // Social Bar
const POPUNDER_SRC   = 'https://abscloud.org/1/9608445b306253e7b6587eeb1627e388' // Popunder (1× a cada 24 h)

function injetar(src: string, id: string) {
  if (!src || document.getElementById(id)) return
  const s = document.createElement('script')
  s.id = id
  s.src = src
  s.async = true
  s.setAttribute('data-cfasync', 'false')
  document.body.appendChild(s)
}

/** Social Bar + Popunder (Adsterra). Montado uma vez em layout.tsx → vale para todas as páginas. */
export default function AdsterraScripts() {
  useEffect(() => {
    injetar(SOCIAL_BAR_SRC, 'adst-socialbar')
    carregarPopunder(POPUNDER_SRC)
  }, [])
  return null
}
