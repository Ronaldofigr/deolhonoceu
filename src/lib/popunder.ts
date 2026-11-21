// Popunder da Adsterra: no máximo 1 abertura a cada 24 h por visitante, mesmo dentro da mesma página.
// Técnica: o script do anúncio abre a janela via window.open; deixamos passar UMA chamada e
// bloqueamos as demais. O horário é gravado no momento em que o popunder realmente abre.

const CAP_HORAS = 24
const CHAVE = 'adst_popunder'

export function capAtivo(): boolean {
  try { if (document.cookie.split('; ').some(c => c.startsWith(CHAVE + '='))) return true } catch {}
  try { const t = Number(localStorage.getItem(CHAVE)); if (t && Date.now() - t < CAP_HORAS * 3600e3) return true } catch {}
  return false
}

function marcarCap() {
  try { document.cookie = `${CHAVE}=1; max-age=${CAP_HORAS * 3600}; path=/; SameSite=Lax` } catch {}
  try { localStorage.setItem(CHAVE, String(Date.now())) } catch {}
}

export function carregarPopunder(src: string) {
  if (!src || capAtivo() || document.getElementById('adst-popunder')) return

  const abrirOriginal = window.open
  let jaAbriu = false

  window.open = function (this: Window, ...args: Parameters<typeof window.open>) {
    if (jaAbriu || capAtivo()) return null // 2ª chamada em diante (ou outra aba já abriu): bloqueia
    jaAbriu = true
    marcarCap()
    return abrirOriginal.apply(window, args)
  } as typeof window.open

  const s = document.createElement('script')
  s.id = 'adst-popunder'
  s.src = src
  s.async = true
  s.setAttribute('data-cfasync', 'false')
  s.onerror = () => { window.open = abrirOriginal; s.remove() } // bloqueado por adblock: desfaz
  document.body.appendChild(s)
}
