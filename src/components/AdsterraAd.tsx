'use client'

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
 * Banner Adsterra via iframe direto.
 * O formato 'iframe' do Adsterra é exatamente isso — sem JS intermediário.
 * Funciona em qualquer static site / SSG sem depender de next/script ou useEffect.
 */
export default function AdsterraAd({ atKey, width, height }: AdsterraAdProps) {
  const src = `//www.highperformanceformat.com/${atKey}/invoke.js`

  // O Adsterra no formato iframe carrega via um documento HTML mínimo
  const iframeDoc = `<!DOCTYPE html>
<html>
<head><style>body{margin:0;padding:0;}</style></head>
<body>
<script>
atOptions={'key':'${atKey}','format':'iframe','height':${height},'width':${width},'params':{}};
<\/script>
<script src="${src}"><\/script>
</body>
</html>`

  return (
    <div
      className="adsterra-slot"
      style={{ width, height, maxWidth: '100%', margin: '0.75rem auto', display: 'block' }}
      aria-label="Publicidade"
    >
      <iframe
        srcDoc={iframeDoc}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        style={{ display: 'block', border: 'none', maxWidth: '100%' }}
        title="Publicidade"
      />
    </div>
  )
}

/**
 * Banner responsivo: 728×90 desktop / 320×50 mobile.
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
 * Banner 300×250 — entre cards.
 */
export function AdsterraRectangle() {
  return <AdsterraAd atKey={ADSTERRA_KEYS.banner300x250} width={300} height={250} />
}

/**
 * Native Banner (ID 30534627).
 */
export function AdsterraNative() {
  const atKey = ADSTERRA_KEYS.nativeBanner
  const iframeDoc = `<!DOCTYPE html>
<html>
<head><style>body{margin:0;padding:0;}</style></head>
<body>
<script async data-cfasync="false" src="https://pl30635126.effectivecpmnetwork.com/${atKey}/invoke.js"><\/script>
<div id="container-${atKey}"></div>
</body>
</html>`

  return (
    <div className="adsterra-slot" style={{ minHeight: 90, margin: '0.75rem 0' }} aria-label="Publicidade">
      <iframe
        srcDoc={iframeDoc}
        width="100%"
        height={120}
        frameBorder="0"
        scrolling="no"
        style={{ display: 'block', border: 'none', width: '100%' }}
        title="Publicidade"
      />
    </div>
  )
}
