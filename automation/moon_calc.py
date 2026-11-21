"""Fase da Lua com precisão astronômica (Meeus, Astronomical Algorithms, cap. 48-49).

Substitui a aproximação por mês sinódico médio (erro de até ~14 h e ~4-5 p.p. de
iluminação). Assinaturas compatíveis com daily_update.py:
    moon_phase_now(dt)        -> (nome_pt, nome_en, iluminacao_%)
    proxima_fase_principal(dt)-> (nome_pt, 'YYYY-MM-DD' em horário de Brasília)
"""
import datetime
import math

_UTC = datetime.timezone.utc
_BRT = datetime.timezone(datetime.timedelta(hours=-3))  # Brasília (sem horário de verão)
_DELTA_T = 69.0  # TT - UT em segundos (~2026)

_R = math.radians


def _jd(dt):
    return dt.astimezone(_UTC).timestamp() / 86400.0 + 2440587.5


def _elongacao(dt):
    """Elongação Lua-Sol em graus [0, 360): 0=nova, 90=quarto cresc., 180=cheia, 270=quarto ming."""
    T = (_jd(dt) + _DELTA_T / 86400.0 - 2451545.0) / 36525.0
    D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
    M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
    Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
    psi = (D + 6.289 * math.sin(_R(Mp)) - 2.100 * math.sin(_R(M))
           + 1.274 * math.sin(_R(2 * D - Mp)) + 0.658 * math.sin(_R(2 * D))
           + 0.214 * math.sin(_R(2 * Mp)) + 0.110 * math.sin(_R(D)))
    return psi % 360.0


def iluminacao(dt):
    return (1 - math.cos(_R(_elongacao(dt)))) / 2 * 100


# (limite inferior, nome PT, nome EN) — fases principais valem ±6° (~12 h) ao redor do instante exato
_FAIXAS = [
    (354.0, "Lua Nova", "new moon"),
    (276.0, "Lua Minguante", "waning crescent moon"),
    (264.0, "Quarto Minguante", "last quarter moon"),
    (186.0, "Lua Gibosa Minguante", "waning gibbous moon"),
    (174.0, "Lua Cheia", "full moon"),
    (96.0, "Lua Gibosa Crescente", "waxing gibbous moon"),
    (84.0, "Quarto Crescente", "first quarter moon"),
    (6.0, "Lua Crescente", "waxing crescent moon"),
    (0.0, "Lua Nova", "new moon"),
]


def moon_phase_now(dt):
    psi = _elongacao(dt)
    for limite, pt, en in _FAIXAS:
        if psi >= limite:
            return pt, en, round(iluminacao(dt))
    return "Lua Nova", "new moon", round(iluminacao(dt))


# ── Instantes exatos das fases principais (Meeus cap. 49) ──────────────────────
_NOVA = [(-0.40720, 'Mp'), (0.17241, 'M'), (0.01608, '2Mp'), (0.01039, '2F'), (0.00739, 'Mp-M'),
         (-0.00514, 'Mp+M'), (0.00208, '2M'), (-0.00111, 'Mp-2F'), (-0.00057, 'Mp+2F'),
         (0.00056, '2Mp+M'), (-0.00042, '3Mp'), (0.00042, 'M+2F'), (0.00038, 'M-2F'),
         (-0.00024, '2Mp-M'), (-0.00017, 'O'), (-0.00007, 'Mp+2M'), (0.00004, '2Mp-2F'),
         (0.00004, '3M'), (0.00003, 'Mp+M-2F'), (0.00003, '2Mp+2F'), (-0.00003, 'Mp+M+2F'),
         (0.00003, 'Mp-M+2F'), (-0.00002, 'Mp-M-2F'), (-0.00002, '3Mp+M'), (0.00002, '4Mp')]
_CHEIA = [(-0.40614, 'Mp'), (0.17302, 'M'), (0.01614, '2Mp'), (0.01043, '2F'), (0.00734, 'Mp-M'),
          (-0.00515, 'Mp+M'), (0.00209, '2M'), (-0.00111, 'Mp-2F'), (-0.00057, 'Mp+2F'),
          (0.00056, '2Mp+M'), (-0.00042, '3Mp'), (0.00042, 'M+2F'), (0.00038, 'M-2F'),
          (-0.00024, '2Mp-M'), (-0.00017, 'O'), (-0.00007, 'Mp+2M'), (0.00004, '2Mp-2F'),
          (0.00004, '3M'), (0.00003, 'Mp+M-2F'), (0.00003, '2Mp+2F'), (-0.00003, 'Mp+M+2F'),
          (0.00003, 'Mp-M+2F'), (-0.00002, 'Mp-M-2F'), (-0.00002, '3Mp+M'), (0.00002, '4Mp')]
_QUARTO = [(-0.62801, 'Mp'), (0.17172, 'M'), (-0.01183, 'Mp+M'), (0.00862, '2Mp'), (0.00804, '2F'),
           (0.00454, 'Mp-M'), (0.00204, '2M'), (-0.00180, 'Mp-2F'), (-0.00070, 'Mp+2F'),
           (-0.00040, '3Mp'), (-0.00034, '2Mp-M'), (0.00032, 'M+2F'), (0.00032, 'M-2F'),
           (-0.00028, 'Mp+2M'), (0.00027, '2Mp+M'), (-0.00017, 'O'), (-0.00005, 'Mp-M-2F'),
           (0.00004, '2Mp+2F'), (-0.00004, 'Mp+M+2F'), (0.00004, 'Mp-2M'), (0.00003, 'Mp+M-2F'),
           (0.00003, '3M'), (0.00002, '2Mp-2F'), (0.00002, 'Mp-M+2F'), (-0.00002, '3Mp+M')]
_RE_TERMO = __import__('re').compile(r'([+-]?)(\d?)(Mp|M|F|O)')


def _termo(nome):
    """'2Mp-M' -> coeficientes {M:-1, Mp:2, F:0, O:0}."""
    c = {'M': 0, 'Mp': 0, 'F': 0, 'O': 0}
    for sinal, mult, var in _RE_TERMO.findall(nome):
        c[var] += (-1 if sinal == '-' else 1) * (int(mult) if mult else 1)
    return c


def _fase_jde(k):
    """JDE da fase com índice k (inteiro=nova, +.25=quarto cresc., +.5=cheia, +.75=quarto ming.)."""
    T = k / 1236.85
    jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T**2 - 0.000000150 * T**3 + 0.00000000073 * T**4
    E = 1 - 0.002516 * T - 0.0000074 * T**2
    M = _R((2.5534 + 29.10535670 * k - 0.0000014 * T**2 - 0.00000011 * T**3) % 360)
    Mp = _R((201.5643 + 385.81693528 * k + 0.0107582 * T**2 + 0.00001238 * T**3 - 0.000000058 * T**4) % 360)
    F = _R((160.7108 + 390.67050284 * k - 0.0016118 * T**2 - 0.00000227 * T**3 + 0.000000011 * T**4) % 360)
    O = _R((124.7746 - 1.56375588 * k + 0.0020672 * T**2 + 0.00000215 * T**3) % 360)
    frac = round((k % 1) * 4) % 4
    tabela = (_NOVA, _QUARTO, _CHEIA, _QUARTO)[frac]
    corr = 0.0
    for coef, nome in tabela:
        c = _termo(nome)
        arg = c['M'] * M + c['Mp'] * Mp + c['F'] * F + c['O'] * O
        corr += coef * (E ** min(abs(c['M']), 2)) * math.sin(arg)
    if frac in (1, 3):
        W = (0.00306 - 0.00038 * E * math.cos(M) + 0.00026 * math.cos(Mp)
             - 0.00002 * math.cos(Mp - M) + 0.00002 * math.cos(Mp + M) + 0.00002 * math.cos(2 * F))
        corr += W if frac == 1 else -W
    A = [(299.77 + 0.107408 * k - 0.009173 * T**2, 0.000325), (251.88 + 0.016321 * k, 0.000165),
         (251.83 + 26.651886 * k, 0.000164), (349.42 + 36.412478 * k, 0.000126),
         (84.66 + 18.206239 * k, 0.000110), (141.74 + 53.303771 * k, 0.000062),
         (207.14 + 2.453732 * k, 0.000060), (154.84 + 7.306860 * k, 0.000056),
         (34.52 + 27.261239 * k, 0.000047), (207.19 + 0.121824 * k, 0.000042),
         (291.34 + 1.844379 * k, 0.000040), (161.72 + 24.198154 * k, 0.000037),
         (239.56 + 25.513099 * k, 0.000035), (331.55 + 3.592518 * k, 0.000023)]
    corr += sum(c * math.sin(_R(a)) for a, c in A)
    return jde + corr


def _fase_dt(k):
    jd_ut = _fase_jde(k) - _DELTA_T / 86400.0
    return datetime.datetime.fromtimestamp((jd_ut - 2440587.5) * 86400.0, tz=_UTC)


_NOMES_PRINCIPAIS = ["Lua Nova", "Quarto Crescente", "Lua Cheia", "Quarto Minguante"]


def proxima_fase_principal(dt):
    """Próxima fase principal depois de dt: (nome_pt, data ISO em horário de Brasília)."""
    ano = dt.astimezone(_UTC).year + (dt.astimezone(_UTC).timetuple().tm_yday / 366.0)
    base = math.floor((ano - 2000.0) * 12.3685) - 2
    for passo in range(0, 16):
        k = base + passo * 0.25
        quando = _fase_dt(k)
        if quando > dt:
            return _NOMES_PRINCIPAIS[round((k % 1) * 4) % 4], quando.astimezone(_BRT).date().isoformat()
    return "Lua Nova", dt.astimezone(_BRT).date().isoformat()
