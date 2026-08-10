'use client'

import Script from 'next/script'
import { useId } from 'react'

// ─── Keys dos Ad Units ───────────────────────────────────────────────────────
export const ADSTERRA_KEYS = {
  banner728x90:  '302a00e08f2cfc0797142fcb0f709480', // ID 30534629
  banner320x50:  '52c552c50e75ef069af96b7d504fb0c6', // ID 30534630
  banner300x250: '975eb5b328257099dea3277a70d682a4', // ID 30534628
  nativeBanner:  '734cbfd9cf45895d9eaf3c91cbeed7e4', // ID 30534627
} as const

interface AdsterraAdProps {
  atKey: string
  width: number
  height: number
}

/**
 * Renderiza um banner Adsterra usando next/script (strategy=lazyOnload).
 * Compatível com output: 'export' (static site).
 */
export default function AdsterraAd({ atKey, width, height }: AdsterraAdProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <div
      className="ad-slot adsterra-slot"
      style={{ minHeight: height, overflow: 'hidden' }}
      aria-label="Publicidade"
    >
      {/* 1. Define atOptions com id único para não colidir entre instâncias */}
      <Script
        id={`adsterra-cfg-${uid}`}
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.atOptions = {
              'key': '${atKey}',
              'format': 'iframe',
              'height': ${height},
              'width': ${width},
              'params': {}
            };
          `,
        }}
      />
      {/* 2. Carrega o invoke.js após atOptions estar definido */}
      <Script
        id={`adsterra-invoke-${uid}`}
        strategy="lazyOnload"
        src={`//www.highperformanceformat.com/${atKey}/invoke.js`}
      />
    </div>
  )
}

/**
 * Banner responsivo: 728×90 desktop / 320×50 mobile.
 * CSS em globals.css controla qual aparece (breakpoint 640px).
 */
export function AdsterraResponsive() {
  return (
    <>
      <div className="ad-desktop">
        <AdsterraAd atKey={ADSTERRA_KEYS.banner728x90} width={728} height={90} />
      </div>
      <div className="ad-mobile">
        <AdsterraAd atKey={ADSTERRA_KEYS.banner320x50} width={320} height={50} />
      </div>
    </>
  )
}

/**
 * Native Banner (ID 30534627) — script externo + div container.
 */
export function AdsterraNative() {
  const uid = useId().replace(/:/g, '')
  return (
    <div className="ad-slot adsterra-slot" aria-label="Publicidade">
      <div id={`container-734cbfd9cf45895d9eaf3c91cbeed7e4-${uid}`} />
      <Script
        id={`adsterra-native-${uid}`}
        strategy="lazyOnload"
        data-cfasync="false"
        src="https://pl30635126.effectivecpmnetwork.com/734cbfd9cf45895d9eaf3c91cbeed7e4/invoke.js"
      />
    </div>
  )
}

/**
 * Banner 300×250 — bom entre cards.
 */
export function AdsterraRectangle() {
  return <AdsterraAd atKey={ADSTERRA_KEYS.banner300x250} width={300} height={250} />
}
