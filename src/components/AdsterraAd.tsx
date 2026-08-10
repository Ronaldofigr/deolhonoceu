'use client'

import { useEffect, useRef, useId } from 'react'

// ─── Keys dos Ad Units (painel Adsterra → Sites → deolhonoceu.com.br) ──────
export const ADSTERRA_KEYS = {
  banner728x90:  '302a00e08f2cfc0797142fcb0f709480', // ID 30534629 — Banner 728x90
  banner320x50:  '52c552c50e75ef069af96b7d504fb0c6', // ID 30534630 — Banner 320x50
  banner300x250: '975eb5b328257099dea3277a70d682a4', // ID 30534628 — Banner 300x250
  nativeBanner:  '734cbfd9cf45895d9eaf3c91cbeed7e4', // ID 30534627 — Native Banner
} as const

interface AdsterraAdProps {
  atKey: string
  width?: number
  height?: number
  format?: string
}

export default function AdsterraAd({
  atKey,
  width = 728,
  height = 90,
  format = 'iframe',
}: AdsterraAdProps) {
  // useId garante um id único por instância — corrige o bug de injected compartilhado
  const uid = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Evita dupla injeção em strict mode (checa se já tem script filho)
    if (container.querySelector('script')) return

    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    configScript.text = `
      atOptions = {
        'key': '${atKey}',
        'format': '${format}',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    `

    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.src = `//www.highperformanceformat.com/${atKey}/invoke.js`
    invokeScript.async = true

    container.appendChild(configScript)
    container.appendChild(invokeScript)

    return () => {
      if (container) container.innerHTML = ''
    }
  // uid entra como dep para garantir re-run caso o React reutilize o componente
  }, [atKey, width, height, format, uid])

  return (
    <div
      className="ad-slot adsterra-slot"
      style={{ minHeight: height, overflow: 'hidden' }}
      aria-label="Publicidade"
    >
      <div ref={containerRef} />
    </div>
  )
}

/**
 * Banner responsivo: 728×90 no desktop, 320×50 no mobile.
 * CSS em globals.css controla qual aparece via media query (breakpoint 640px).
 */
export function AdsterraResponsive() {
  return (
    <>
      {/* Desktop: 728×90 — oculto em telas < 640px */}
      <div className="ad-desktop">
        <AdsterraAd
          atKey={ADSTERRA_KEYS.banner728x90}
          width={728}
          height={90}
        />
      </div>
      {/* Mobile: 320×50 — oculto em telas >= 640px */}
      <div className="ad-mobile">
        <AdsterraAd
          atKey={ADSTERRA_KEYS.banner320x50}
          width={320}
          height={50}
        />
      </div>
    </>
  )
}

/**
 * Native Banner (ID 30534627) — script externo + div container.
 * Coloque entre cards para integração nativa com o conteúdo.
 */
export function AdsterraNative() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || container.querySelector('script')) return

    const script = document.createElement('script')
    script.async = true
    script.dataset['cfasync'] = 'false'
    script.src = 'https://pl30635126.effectivecpmnetwork.com/734cbfd9cf45895d9eaf3c91cbeed7e4/invoke.js'
    container.appendChild(script)

    return () => { if (container) container.innerHTML = '' }
  }, [])

  return (
    <div className="ad-slot adsterra-slot" aria-label="Publicidade">
      <div ref={containerRef}>
        <div id="container-734cbfd9cf45895d9eaf3c91cbeed7e4" />
      </div>
    </div>
  )
}

/**
 * Banner 300×250 (ID 30534628) — rectangle, bom entre cards ou sidebar.
 */
export function AdsterraRectangle() {
  return (
    <AdsterraAd
      atKey={ADSTERRA_KEYS.banner300x250}
      width={300}
      height={250}
    />
  )
}
