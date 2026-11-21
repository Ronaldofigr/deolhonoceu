// Fase da Lua com precisão astronômica — Meeus, "Astronomical Algorithms" (cap. 48 e 49).
// Roda no navegador: o resultado é sempre o de AGORA, independente de quando o site foi gerado.

export type Lang = 'pt' | 'en' | 'es'
export type PhaseKey =
  | 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous'
  | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'
export type MainPhase = 'new' | 'first-quarter' | 'full' | 'last-quarter'

export interface MoonState {
  illumination: number // 0–100
  waxing: boolean      // true = crescendo (elongação < 180°)
  phase: PhaseKey
  next: { key: MainPhase; date: Date }
}

export const PHASE_NAMES: Record<Lang, Record<PhaseKey, string>> = {
  pt: {
    'new': 'Lua Nova', 'waxing-crescent': 'Lua Crescente', 'first-quarter': 'Quarto Crescente',
    'waxing-gibbous': 'Lua Gibosa Crescente', 'full': 'Lua Cheia', 'waning-gibbous': 'Lua Gibosa Minguante',
    'last-quarter': 'Quarto Minguante', 'waning-crescent': 'Lua Minguante',
  },
  en: {
    'new': 'New Moon', 'waxing-crescent': 'Waxing Crescent', 'first-quarter': 'First Quarter',
    'waxing-gibbous': 'Waxing Gibbous', 'full': 'Full Moon', 'waning-gibbous': 'Waning Gibbous',
    'last-quarter': 'Last Quarter', 'waning-crescent': 'Waning Crescent',
  },
  es: {
    'new': 'Luna Nueva', 'waxing-crescent': 'Luna Creciente', 'first-quarter': 'Cuarto Creciente',
    'waxing-gibbous': 'Gibosa Creciente', 'full': 'Luna Llena', 'waning-gibbous': 'Gibosa Menguante',
    'last-quarter': 'Cuarto Menguante', 'waning-crescent': 'Luna Menguante',
  },
}

const RAD = Math.PI / 180
const DELTA_T = 69 // TT − UT em segundos (~2026)
const jd = (d: Date) => d.getTime() / 86400000 + 2440587.5

/** Elongação Lua–Sol em graus [0,360): 0 nova · 90 quarto cresc. · 180 cheia · 270 quarto ming. */
function elongation(d: Date): number {
  const T = (jd(d) + DELTA_T / 86400 - 2451545) / 36525
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
  const psi = D + 6.289 * Math.sin(Mp * RAD) - 2.1 * Math.sin(M * RAD)
    + 1.274 * Math.sin((2 * D - Mp) * RAD) + 0.658 * Math.sin(2 * D * RAD)
    + 0.214 * Math.sin(2 * Mp * RAD) + 0.11 * Math.sin(D * RAD)
  return ((psi % 360) + 360) % 360
}

// [limite inferior (°), fase] — as fases principais valem ±6° (~12 h) ao redor do instante exato
const BANDS: [number, PhaseKey][] = [
  [354, 'new'], [276, 'waning-crescent'], [264, 'last-quarter'], [186, 'waning-gibbous'],
  [174, 'full'], [96, 'waxing-gibbous'], [84, 'first-quarter'], [6, 'waxing-crescent'], [0, 'new'],
]

// Termos periódicos [coeficiente, cM, cMp, cF, cΩ] (Meeus, tabela 49.A)
const NEW: number[][] = [
  [-0.4072, 0, 1, 0, 0],
  [0.17241, 1, 0, 0, 0],
  [0.01608, 0, 2, 0, 0],
  [0.01039, 0, 0, 2, 0],
  [0.00739, -1, 1, 0, 0],
  [-0.00514, 1, 1, 0, 0],
  [0.00208, 2, 0, 0, 0],
  [-0.00111, 0, 1, -2, 0],
  [-0.00057, 0, 1, 2, 0],
  [0.00056, 1, 2, 0, 0],
  [-0.00042, 0, 3, 0, 0],
  [0.00042, 1, 0, 2, 0],
  [0.00038, 1, 0, -2, 0],
  [-0.00024, -1, 2, 0, 0],
  [-0.00017, 0, 0, 0, 1],
  [-7e-05, 2, 1, 0, 0],
  [4e-05, 0, 2, -2, 0],
  [4e-05, 3, 0, 0, 0],
  [3e-05, 1, 1, -2, 0],
  [3e-05, 0, 2, 2, 0],
  [-3e-05, 1, 1, 2, 0],
  [3e-05, -1, 1, 2, 0],
  [-2e-05, -1, 1, -2, 0],
  [-2e-05, 1, 3, 0, 0],
  [2e-05, 0, 4, 0, 0],
]
const FULL: number[][] = [
  [-0.40614, 0, 1, 0, 0],
  [0.17302, 1, 0, 0, 0],
  [0.01614, 0, 2, 0, 0],
  [0.01043, 0, 0, 2, 0],
  [0.00734, -1, 1, 0, 0],
  [-0.00515, 1, 1, 0, 0],
  [0.00209, 2, 0, 0, 0],
  [-0.00111, 0, 1, -2, 0],
  [-0.00057, 0, 1, 2, 0],
  [0.00056, 1, 2, 0, 0],
  [-0.00042, 0, 3, 0, 0],
  [0.00042, 1, 0, 2, 0],
  [0.00038, 1, 0, -2, 0],
  [-0.00024, -1, 2, 0, 0],
  [-0.00017, 0, 0, 0, 1],
  [-7e-05, 2, 1, 0, 0],
  [4e-05, 0, 2, -2, 0],
  [4e-05, 3, 0, 0, 0],
  [3e-05, 1, 1, -2, 0],
  [3e-05, 0, 2, 2, 0],
  [-3e-05, 1, 1, 2, 0],
  [3e-05, -1, 1, 2, 0],
  [-2e-05, -1, 1, -2, 0],
  [-2e-05, 1, 3, 0, 0],
  [2e-05, 0, 4, 0, 0],
]
const QUARTER: number[][] = [
  [-0.62801, 0, 1, 0, 0],
  [0.17172, 1, 0, 0, 0],
  [-0.01183, 1, 1, 0, 0],
  [0.00862, 0, 2, 0, 0],
  [0.00804, 0, 0, 2, 0],
  [0.00454, -1, 1, 0, 0],
  [0.00204, 2, 0, 0, 0],
  [-0.0018, 0, 1, -2, 0],
  [-0.0007, 0, 1, 2, 0],
  [-0.0004, 0, 3, 0, 0],
  [-0.00034, -1, 2, 0, 0],
  [0.00032, 1, 0, 2, 0],
  [0.00032, 1, 0, -2, 0],
  [-0.00028, 2, 1, 0, 0],
  [0.00027, 1, 2, 0, 0],
  [-0.00017, 0, 0, 0, 1],
  [-5e-05, -1, 1, -2, 0],
  [4e-05, 0, 2, 2, 0],
  [-4e-05, 1, 1, 2, 0],
  [4e-05, -2, 1, 0, 0],
  [3e-05, 1, 1, -2, 0],
  [3e-05, 3, 0, 0, 0],
  [2e-05, 0, 2, -2, 0],
  [2e-05, -1, 1, 2, 0],
  [-2e-05, 1, 3, 0, 0],
]

const PLANETARY: [number, number, number][] = [
  [299.77, 0.107408, 0.000325], [251.88, 0.016321, 0.000165], [251.83, 26.651886, 0.000164],
  [349.42, 36.412478, 0.000126], [84.66, 18.206239, 0.00011], [141.74, 53.303771, 0.000062],
  [207.14, 2.453732, 0.00006], [154.84, 7.30686, 0.000056], [34.52, 27.261239, 0.000047],
  [207.19, 0.121824, 0.000042], [291.34, 1.844379, 0.00004], [161.72, 24.198154, 0.000037],
  [239.56, 25.513099, 0.000035], [331.55, 3.592518, 0.000023],
]

/** Instante (UT) da fase de índice k: inteiro = nova, +.25 = quarto cresc., +.5 = cheia, +.75 = quarto ming. */
function phaseDate(k: number): Date {
  const T = k / 1236.85
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3) * RAD
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3 - 0.000000058 * T ** 4) * RAD
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3 + 0.000000011 * T ** 4) * RAD
  const O = (124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3) * RAD
  const frac = Math.round((((k % 1) + 1) % 1) * 4) % 4
  const table = frac === 0 ? NEW : frac === 2 ? FULL : QUARTER
  let corr = 0
  for (const [c, cM, cMp, cF, cO] of table) {
    corr += c * E ** Math.min(Math.abs(cM), 2) * Math.sin(cM * M + cMp * Mp + cF * F + cO * O)
  }
  if (frac === 1 || frac === 3) {
    const W = 0.00306 - 0.00038 * E * Math.cos(M) + 0.00026 * Math.cos(Mp)
      - 0.00002 * Math.cos(Mp - M) + 0.00002 * Math.cos(Mp + M) + 0.00002 * Math.cos(2 * F)
    corr += frac === 1 ? W : -W
  }
  for (const [a, b, c] of PLANETARY) corr += c * Math.sin((a + b * k - (a === 299.77 ? 0.009173 * T ** 2 : 0)) * RAD)
  jde += corr
  return new Date((jde - DELTA_T / 86400 - 2440587.5) * 86400000)
}

const MAIN: MainPhase[] = ['new', 'first-quarter', 'full', 'last-quarter']

function nextMainPhase(d: Date): { key: MainPhase; date: Date } {
  const year = d.getUTCFullYear() + (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 31557600000
  const base = Math.floor((year - 2000) * 12.3685) - 2
  for (let i = 0; i < 16; i++) {
    const k = base + i * 0.25
    const when = phaseDate(k)
    if (when > d) return { key: MAIN[Math.round((((k % 1) + 1) % 1) * 4) % 4], date: when }
  }
  return { key: 'new', date: d }
}

export function getMoonState(date: Date = new Date()): MoonState {
  const psi = elongation(date)
  const band = BANDS.find(([min]) => psi >= min) ?? BANDS[BANDS.length - 1]
  return {
    illumination: ((1 - Math.cos(psi * RAD)) / 2) * 100,
    waxing: psi < 180,
    phase: band[1],
    next: nextMainPhase(date),
  }
}

/** Contorno da parte iluminada (disco de raio R em (c,c)), com o lado iluminado à DIREITA.
 *  Para o lado esquerdo, espelhe horizontalmente. Retorna null se a Lua está apagada. */
export function litShapePath(illumination: number, R = 46, c = 50): string | null {
  const k = Math.max(0, Math.min(1, illumination / 100))
  if (k < 0.005) return null
  if (k > 0.995) return `M ${c} ${c - R} A ${R} ${R} 0 1 1 ${c} ${c + R} A ${R} ${R} 0 1 1 ${c} ${c - R} Z`
  const rx = Math.abs(1 - 2 * k) * R
  return `M ${c} ${c - R} A ${R} ${R} 0 0 1 ${c} ${c + R} A ${rx} ${R} 0 0 ${k < 0.5 ? 0 : 1} ${c} ${c - R} Z`
}
