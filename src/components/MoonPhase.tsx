import { litShapePath } from '@/lib/moon'

// 'S' = hemisfério sul (Brasil): a Lua crescente aparece iluminada à ESQUERDA.
// Use 'N' para Portugal/Espanha/EUA (crescente iluminada à direita).
export const HEMISFERIO: 'N' | 'S' = 'S'

export default function MoonPhase({
  illumination, waxing, size = 56, label,
}: { illumination: number; waxing: boolean; size?: number; label?: string }) {
  const path = litShapePath(illumination)
  const litOnRight = HEMISFERIO === 'N' ? waxing : !waxing
  return (
    <svg
      className="moon-bar-svg" viewBox="0 0 100 100" width={size} height={size}
      role="img" aria-label={label ?? 'Fase da Lua'}
    >
      <defs>
        <radialGradient id="moon-lit-grad" cx="38%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#fbf8ea" />
          <stop offset="100%" stopColor="#cfc8aa" />
        </radialGradient>
        {path && (
          <clipPath id="moon-lit-clip">
            <path d={path} transform={litOnRight ? undefined : 'translate(100 0) scale(-1 1)'} />
          </clipPath>
        )}
      </defs>
      {/* lado escuro */}
      <circle cx="50" cy="50" r="46" fill="#161e33" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
      {path && (
        <>
          <path d={path} fill="url(#moon-lit-grad)" transform={litOnRight ? undefined : 'translate(100 0) scale(-1 1)'} />
          {/* mares lunares, visíveis só na parte iluminada */}
          <g clipPath="url(#moon-lit-clip)" fill="#8d8a76" opacity="0.28">
            <ellipse cx="40" cy="38" rx="11" ry="8" />
            <ellipse cx="58" cy="30" rx="8" ry="6" />
            <ellipse cx="62" cy="52" rx="9" ry="12" />
            <ellipse cx="38" cy="62" rx="10" ry="7" />
            <circle cx="52" cy="72" r="4" />
          </g>
        </>
      )}
    </svg>
  )
}
