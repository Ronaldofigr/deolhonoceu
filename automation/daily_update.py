#!/usr/bin/env python3
"""
De Olho no Céu — Automação diária
Busca RSS científicos e gera artigos com Claude API.
"""

import os, sys, json, time, re, math, datetime, feedparser, anthropic, requests
from pathlib import Path

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
NASA_API_KEY = os.environ.get("NASA_API_KEY", "DEMO_KEY")
BASE_DIR = Path(__file__).parent.parent

RSS_SOURCES = [
    {"url": "https://news.google.com/rss/search?q=Starship+SpaceX+when:2d&hl=pt-BR&gl=BR&ceid=BR:pt-BR", "name": "SpaceX/Starship", "type": "spacex", "label": "SpaceX"},
    {"url": "https://www.nasa.gov/news-release/feed/",            "name": "NASA",                        "type": "nasa", "label": "NASA"},
    {"url": "https://www.esa.int/rssfeed/Our_Activities/Space_Science", "name": "ESA",                  "type": "esa",  "label": "ESA"},
    {"url": "https://www.space.com/feeds/all",                    "name": "Space.com",                   "type": "sci",  "label": "Space.com"},
    {"url": "https://skyandtelescope.org/feed/",                  "name": "Sky & Telescope",             "type": "sci",  "label": "Sky & Tel."},
    {"url": "https://www.ccvalg.pt/astronomia/?feed=rss2",        "name": "Centro Ciência Viva Algarve", "type": "obs",  "label": "C. Ciência Viva"},
]

TOPICS = [
    "o que é a teoria da relatividade especial",
    "como funciona a fusão nuclear nas estrelas",
    "o que são quasares e como são formados",
    "o que é a expansão do universo e a Lei de Hubble",
    "o que é a radiação cósmica de fundo",
    "o que são pulsares — estrelas de nêutrons girando",
    "o que é a nebulosa planetária e o destino do Sol",
    "como as estrelas sintetizam elementos — nucleossíntese estelar",
    "o que é entropia e a seta do tempo",
    "o que são estrelas variáveis e cefeidas",
    "o que é a zona habitável de uma estrela",
    "como é calculada a distância das estrelas — paralaxe",
    "o que é a Via Láctea e onde estamos nela",
    "o que são aglomerados globulares",
    "o que é a força de maré e como ela afeta luas",
    "o que é a sequência principal das estrelas no diagrama HR",
]

def strip_html(s):
    return re.sub(r'<[^>]+>', '', s or '').strip()

def extract_rss_image(e):
    """Tenta achar uma imagem já embutida no próprio item do RSS (enclosure, media:content, ou <img> no HTML)."""
    media = e.get("media_content") or e.get("media_thumbnail")
    if media and isinstance(media, list) and media[0].get("url"):
        return media[0]["url"]
    for l in e.get("links", []):
        if l.get("rel") == "enclosure" and "image" in l.get("type", ""):
            return l.get("href")
    html = e.get("summary", "") or e.get("description", "")
    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    if m:
        return m.group(1)
    return None

import time

def find_image_nasa(query):
    """Busca uma imagem de domínio público no acervo oficial da NASA (sem chave de API)."""
    time.sleep(1.2)
    try:
        resp = requests.get("https://images-api.nasa.gov/search",
                             params={"q": query, "media_type": "image"}, timeout=15)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        items = resp.json().get("collection", {}).get("items", [])
        for it in items:
            links = it.get("links", [])
            data = it.get("data", [{}])[0]
            img = next((l["href"] for l in links if l.get("render") == "image"), None)
            if img:
                center = data.get("center", "")
                credit = f"NASA/{center}" if center and center != "NASA" else "NASA"
                return {"url": img, "credit": credit}
    except Exception as e:
        print(f"    ⚠️  NASA Images: {e}")
    return None

def find_image_wikimedia(query):
    """Busca uma imagem licenciada no Wikimedia Commons, com crédito do autor extraído automaticamente.
    Restringe a fotos/ilustrações reais, rejeitando páginas escaneadas de documentos/artigos."""
    time.sleep(1.5)
    try:
        resp = requests.get("https://commons.wikimedia.org/w/api.php", params={
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": f"{query} filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 5,
            "prop": "imageinfo", "iiprop": "url|mime|size|extmetadata", "iiurlwidth": 1200,
        }, timeout=15, headers={"User-Agent": "DeOlhoNoCeu/1.0 (site automatizado de astronomia)"})
        resp.raise_for_status()
        resp.encoding = "utf-8"
        pages = resp.json().get("query", {}).get("pages", {})
        for _, page in pages.items():
            info = page.get("imageinfo", [{}])[0]
            mime = info.get("mime", "")
            url = info.get("thumburl") or info.get("url")
            if not url or not mime.startswith("image/") or mime in ("image/svg+xml",):
                continue
            if ".pdf" in url.lower():
                continue  # miniatura de página de documento/artigo escaneado, não é uma foto
            # descarta páginas de documentos escaneados (proporção muito "retrato" e alta resolução de texto)
            width, height = info.get("width", 0), info.get("height", 0)
            if width and height and height / width > 1.3:
                continue
            meta = info.get("extmetadata", {})
            artist = strip_html(meta.get("Artist", {}).get("value", ""))
            license_name = meta.get("LicenseShortName", {}).get("value", "")
            credit_parts = [p for p in [artist, "Wikimedia Commons", license_name] if p]
            return {"url": url, "credit": " / ".join(credit_parts)}
    except Exception as e:
        print(f"    ⚠️  Wikimedia: {e}")
    return None

def find_image_wikipedia(query):
    """Usa a busca e a miniatura de artigos da Wikipédia em português — geralmente uma foto bem curada."""
    time.sleep(1.5)
    try:
        search = requests.get("https://pt.wikipedia.org/w/api.php", params={
            "action": "opensearch", "search": query, "limit": 1, "namespace": 0, "format": "json",
        }, timeout=15, headers={"User-Agent": "DeOlhoNoCeu/1.0 (site automatizado de astronomia)"})
        search.raise_for_status()
        search.encoding = "utf-8"
        titles = search.json()[1]
        if not titles:
            return None
        title = titles[0]
        resp = requests.get("https://pt.wikipedia.org/w/api.php", params={
            "action": "query", "format": "json", "prop": "pageimages",
            "piprop": "original", "titles": title,
        }, timeout=15, headers={"User-Agent": "DeOlhoNoCeu/1.0 (site automatizado de astronomia)"})
        resp.raise_for_status()
        resp.encoding = "utf-8"
        pages = resp.json().get("query", {}).get("pages", {})
        for _, page in pages.items():
            url = page.get("original", {}).get("source")
            if url and not url.lower().endswith(".svg"):
                return {"url": url, "credit": f"Wikipédia — {title}"}
    except Exception as e:
        print(f"    ⚠️  Wikipedia: {e}")
    return None

def find_image_openverse(query):
    """Busca ampla em bancos de imagens de licença aberta (Flickr, museus, arquivos públicos etc.)."""
    time.sleep(1.2)
    try:
        resp = requests.get("https://api.openverse.org/v1/images/", params={
            "q": query, "license_type": "commercial,modification", "page_size": 1,
        }, timeout=15, headers={"User-Agent": "DeOlhoNoCeu/1.0 (site automatizado de astronomia)"})
        resp.raise_for_status()
        resp.encoding = "utf-8"
        results = resp.json().get("results", [])
        if results:
            item = results[0]
            url = item.get("url")
            creator = item.get("creator") or "Openverse"
            source = item.get("source") or ""
            if url:
                return {"url": url, "credit": f"{creator} / {source}" if source else creator}
    except Exception as e:
        print(f"    ⚠️  Openverse: {e}")
    return None

def find_image_fallback_apod():
    """Último recurso: uma foto real e aleatória do arquivo histórico da NASA (APOD).
    Garante que sempre haja uma imagem, mesmo quando nenhuma busca por palavra-chave encontra nada."""
    import random
    if NASA_API_KEY == "DEMO_KEY":
        print("    ⚠️  Usando DEMO_KEY da NASA (limite baixo e compartilhado). "
              "Configure o secret NASA_API_KEY com uma chave própria e gratuita em https://api.nasa.gov para evitar falhas por limite de requisições.")
    for _ in range(4):
        time.sleep(1.2)
        try:
            date_try = datetime.date.today() - datetime.timedelta(days=random.randint(1, 3000))
            resp = requests.get("https://api.nasa.gov/planetary/apod",
                                 params={"api_key": NASA_API_KEY, "date": date_try.isoformat()}, timeout=15)
            resp.raise_for_status()
            resp.encoding = "utf-8"
            data = resp.json()
            if data.get("media_type") == "image":
                url = data.get("hdurl") or data.get("url")
                credit = data.get("copyright")
                credit = credit.strip().replace("\n", " ") if credit else "NASA"
                if url:
                    return {"url": url, "credit": credit}
        except Exception as e:
            print(f"    ⚠️  APOD (fallback): {e}")
            continue
    return None

def find_image(query):
    """Ordem de prioridade, alargando a busca até garantir uma imagem:
    NASA → Wikipédia → Wikimedia Commons → Openverse → foto aleatória da NASA (garantia final)."""
    return (find_image_nasa(query)
            or find_image_wikipedia(query)
            or find_image_wikimedia(query)
            or find_image_openverse(query)
            or find_image_fallback_apod())

def slug(text):
    text = text.lower()
    for a,b in [('áàãâä','a'),('éèê','e'),('íìî','i'),('óòõôö','o'),('úùû','u'),('ç','c')]:
        for c in a: text = text.replace(c, b)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')[:60]

def today(): return datetime.date.today().isoformat()

def iso_week():
    y, w, _ = datetime.date.today().isocalendar()
    return f"{y}-W{w:02d}"

def call_claude(prompt, max_tokens=1200):
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system="Você é um cientista e escritor de divulgação científica de alta qualidade.",
        messages=[{"role": "user", "content": prompt}]
    )
    return resp.content[0].text.strip()

def fetch_rss():
    entries = []
    for src in RSS_SOURCES:
        try:
            feed = feedparser.parse(src["url"])
            for e in feed.entries[:3]:
                raw = re.sub(r'<[^>]+>', '', e.get("summary","") or e.get("description","")).strip()
                entries.append({"source": src["label"], "source_type": src["type"],
                                "url": e.get("link","#"), "title_original": e.get("title",""),
                                "excerpt_original": raw[:600], "date": today(),
                                "image_from_rss": extract_rss_image(e)})
        except Exception as ex:
            print(f"  ⚠️  {src['name']}: {ex}")
    return entries

STOPWORDS_TITULO = set(
    "a o os as um uma de do da dos das em no na nos nas para por com que e ou se sua seu suas seus ao aos à às "
    "the a an of to in on for and or is are new via aboard using announces plans reveals says says' after".split()
)

def normalize_title(t):
    t = t.lower()
    for a,b in [('áàãâä','a'),('éèê','e'),('íìî','i'),('óòõôö','o'),('úùû','u'),('ç','c')]:
        for c in a: t = t.replace(c, b)
    t = re.sub(r'[^a-z0-9 ]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def title_keywords(t):
    return set(w for w in normalize_title(t).split() if len(w) > 2 and w not in STOPWORDS_TITULO)

def titles_similar(a, b, threshold=0.4):
    """Compara palavras-chave de dois títulos para saber se são provavelmente a mesma
    notícia, mesmo vindos de fontes/URLs diferentes e com manchetes reescritas de forma diferente."""
    if not a or not b:
        return False
    ka, kb = title_keywords(a), title_keywords(b)
    if not ka or not kb:
        return False
    return len(ka & kb) / len(ka | kb) >= threshold

def recent_source_titles(days=5):
    """Recupera os títulos ORIGINAIS (da fonte, antes da reescrita pela IA) das notícias
    salvas nos últimos dias, para detectar a mesma notícia relatada por fontes diferentes."""
    folder = BASE_DIR / "content" / "noticias"
    if not folder.exists():
        return []
    cutoff = datetime.date.today() - datetime.timedelta(days=days)
    titulos = []
    for f in folder.glob("*.md"):
        try:
            file_date = datetime.date.fromisoformat(f.name[:10])
            if file_date < cutoff:
                continue
        except ValueError:
            continue
        text = f.read_text(encoding="utf-8")
        m = re.search(r'^sourceTitle:\s*"([^"]*)"', text, re.MULTILINE)
        if m:
            titulos.append(m.group(1))
    return titulos

def news_key(entry):
    """Chave estável baseada na fonte original (não no título reescrito pela IA),
    para reconhecer a mesma notícia em execuções diferentes do script."""
    base = entry.get("url") or entry.get("title_original", "")
    key = slug(base)
    if not key:
        key = slug(entry.get("title_original", "")) or "item"
    return key[:50]

def news_already_saved(key):
    folder = BASE_DIR / "content" / "noticias"
    if not folder.exists(): return False
    return any(key in f.stem for f in folder.glob("*.md"))

def extract_json(raw):
    """Extrai e faz o parse do JSON retornado pela IA, tolerando os erros mais comuns:
    quebras de linha literais dentro de strings (não escapadas como \\n), tabs soltos
    e vírgulas sobrando antes de } ou ]. Retorna None se não conseguir recuperar."""
    m = re.search(r'\{[\s\S]+\}', raw)
    if not m:
        return None
    texto = m.group()
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        pass

    # Conserta quebras de linha/tabs literais que deveriam estar escapados dentro de strings
    reparado = []
    dentro_de_string = False
    escapado = False
    for ch in texto:
        if dentro_de_string:
            if escapado:
                reparado.append(ch)
                escapado = False
                continue
            if ch == '\\':
                reparado.append(ch)
                escapado = True
                continue
            if ch == '"':
                dentro_de_string = False
                reparado.append(ch)
                continue
            if ch == '\n':
                reparado.append('\\n')
                continue
            if ch == '\r':
                continue
            if ch == '\t':
                reparado.append('\\t')
                continue
            reparado.append(ch)
        else:
            if ch == '"':
                dentro_de_string = True
            reparado.append(ch)
    texto_reparado = "".join(reparado)
    # Remove vírgulas sobrando antes de fechamento de objeto/array
    texto_reparado = re.sub(r',\s*([}\]])', r'\1', texto_reparado)
    try:
        return json.loads(texto_reparado)
    except json.JSONDecodeError:
        return None

def gen_news(entry):
    prompt = f"""Notícia científica bruta:
TÍTULO: {entry['title_original']}
RESUMO: {entry['excerpt_original']}
FONTE: {entry['source']}

Reescreva como divulgação científica para leigos.

IMPORTANTE sobre o campo "content":
- Deve ter NO MÍNIMO 200 palavras (bem mais longo que o excerpt, nunca repetir o excerpt)
- Deve ter 3-4 parágrafos SEPARADOS PELO LITERAL \\n\\n (duas quebras de linha) entre cada parágrafo
- Explique contexto, detalhes técnicos em linguagem simples, com analogias, e relevância da descoberta
- Sem fórmulas matemáticas

O mesmo vale para "contentEn" em inglês e "contentEs" em espanhol.

Responda SOMENTE com JSON válido:
{{"title":"título PT máx 90 chars","titleEn":"title EN max 90 chars","titleEs":"título ES máx 90 chars","excerpt":"resumo PT 2-3 frases max 280 chars","excerptEn":"summary EN 2-3 sentences max 280 chars","excerptEs":"resumen ES 2-3 frases máx 280 chars","tags":["tag1","tag2","tag3"],"content":"texto PT mínimo 200 palavras, 3-4 parágrafos separados por \\n\\n, sem fórmulas, com analogias","contentEn":"text EN minimum 200 words, 3-4 paragraphs separated by \\n\\n, no formulas","contentEs":"texto ES mínimo 200 palabras, 3-4 párrafos separados por \\n\\n, sin fórmulas"}}"""
    try:
        raw = call_claude(prompt, max_tokens=2100)
        data = extract_json(raw)
        if data:
            data.update({"source": entry["source"], "sourceType": entry["source_type"],
                         "sourceUrl": entry["url"], "date": entry["date"]})
            if entry.get("image_from_rss"):
                data["image"] = entry["image_from_rss"]
                data["imageCredit"] = entry["source"]
            else:
                img = find_image(entry["title_original"] or data.get("title", ""))
                if img:
                    data["image"] = img["url"]
                    data["imageCredit"] = img["credit"]
            return data
    except Exception as e:
        print(f"  ⚠️  {e}")
    return None

def save_news(data, key, source_title_original=""):
    s = f"{data['date']}-{key}"
    folder = BASE_DIR / "content" / "noticias"
    folder.mkdir(parents=True, exist_ok=True)
    tags = "[" + ", ".join(f'"{t}"' for t in data.get("tags",[])) + "]"
    image_fields = ""
    if data.get("image"):
        img_credit = (data.get("imageCredit") or "").replace('"', "'")
        image_fields = f'image: "{data["image"]}"\nimageCredit: "{img_credit}"\n'
    titulo_es = (data.get('titleEs') or data['titleEn']).replace('"', "'")
    resumo_es = (data.get('excerptEs') or data['excerptEn']).replace('"', "'")
    content_en = data.get('contentEn', '')
    content_es = data.get('contentEs') or content_en
    source_title_field = ""
    if source_title_original:
        source_title_field = f'sourceTitle: "{source_title_original.replace(chr(34), chr(39))}"\n'
    md = f"""---
title: "{data['title']}"
titleEn: "{data['titleEn']}"
titleEs: "{titulo_es}"
excerpt: "{data['excerpt']}"
excerptEn: "{data['excerptEn']}"
excerptEs: "{resumo_es}"
source: "{data['source']}"
sourceType: "{data['sourceType']}"
sourceUrl: "{data['sourceUrl']}"
{source_title_field}tags: {tags}
date: "{data['date']}"
{image_fields}---

{data['content']}

<!--lang:en-->

{content_en}

<!--lang:es-->

{content_es}
"""
    (folder / f"{s}.md").write_text(md, encoding="utf-8")
    return f"  ✅  {s}"

def gen_article(topic):
    prompt = f"""Escreva artigo de divulgação científica sobre: "{topic}"
- Linguagem acessível para leigos, ZERO fórmulas matemáticas
- Use analogias do cotidiano
- 350-500 palavras, 3-4 parágrafos
- Último parágrafo: curiosidade surpreendente

Responda SOMENTE com JSON válido:
{{"title":"título PT criativo","titleEn":"title EN","titleEs":"título ES creativo","category":"categoria PT","categoryEn":"category EN","categoryEs":"categoría ES","content":"texto PT parágrafos separados por \\n\\n","contentEn":"text EN paragraphs separated by \\n\\n","contentEs":"texto ES párrafos separados por \\n\\n","readingTime":3}}"""
    try:
        raw = call_claude(prompt, max_tokens=2100)
        data = extract_json(raw)
        if data:
            img = find_image(topic)
            if img:
                data["image"] = img["url"]
                data["imageCredit"] = img["credit"]
            return data
    except Exception as e:
        print(f"  ⚠️  {e}")
    return None

def save_article(data, topic_key):
    s = f"{today()}-{topic_key}"
    folder = BASE_DIR / "content" / "artigos"
    folder.mkdir(parents=True, exist_ok=True)
    image_fields = ""
    if data.get("image"):
        img_credit = (data.get("imageCredit") or "").replace('"', "'")
        image_fields = f'image: "{data["image"]}"\nimageCredit: "{img_credit}"\n'
    categoria_es = (data.get('categoryEs') or data['categoryEn']).replace('"', "'")
    titulo_es = (data.get('titleEs') or data['titleEn']).replace('"', "'")
    content_en = data.get('contentEn', '')
    content_es = data.get('contentEs') or content_en
    md = f"""---
title: "{data['title']}"
titleEn: "{data['titleEn']}"
titleEs: "{titulo_es}"
category: "{data['category']}"
categoryEn: "{data['categoryEn']}"
categoryEs: "{categoria_es}"
type: "concept"
readingTime: {data.get('readingTime',3)}
date: "{today()}"
{image_fields}---

{data['content']}

<!--lang:en-->

{content_en}

<!--lang:es-->

{content_es}
"""
    (folder / f"{s}.md").write_text(md, encoding="utf-8")
    return f"  ✅  {s}"

def article_topic_used(topic_key):
    folder = BASE_DIR / "content" / "artigos"
    if not folder.exists(): return False
    return any(topic_key in f.stem for f in folder.glob("*.md"))

def gen_photo_week():
    """Busca a Imagem Astronômica do Dia (APOD) da NASA e atualiza 1x por semana."""
    photo_path = BASE_DIR / "content" / "foto-semana.json"
    current_week = iso_week()

    if photo_path.exists():
        try:
            existing = json.loads(photo_path.read_text(encoding="utf-8"))
            if existing.get("week") == current_week:
                return "  ⏭  Foto da semana já atualizada"
        except Exception:
            pass

    try:
        date_cursor = datetime.date.today()
        apod = None
        for _ in range(6):
            resp = requests.get(
                "https://api.nasa.gov/planetary/apod",
                params={"api_key": NASA_API_KEY, "date": date_cursor.isoformat()},
                timeout=20,
            )
            resp.raise_for_status()
            resp.encoding = "utf-8"
            candidate = resp.json()
            if candidate.get("media_type") == "image":
                apod = candidate
                break
            date_cursor -= datetime.timedelta(days=1)

        if not apod:
            return "  ⚠️  Foto da semana: nenhuma imagem encontrada nos últimos dias"

        image_url = apod.get("hdurl") or apod.get("url")
        title_en = apod.get("title", "")
        explanation_en = apod.get("explanation", "")
        credit = apod.get("copyright", "NASA")
        if credit:
            credit = credit.strip().replace("\n", " ")
        else:
            credit = "NASA"

        prompt = f"""Traduza e adapte para português do Brasil E para espanhol, em tom de divulgação científica acessível:
TÍTULO: {title_en}
LEGENDA: {explanation_en}

Responda SOMENTE com JSON válido:
{{"title":"título PT curto e atrativo","caption":"legenda PT em até 3 frases, linguagem simples, sem jargão","titleEs":"título ES corto y atractivo","captionEs":"leyenda ES en hasta 3 frases, lenguaje simple"}}"""
        raw = call_claude(prompt, max_tokens=800)
        data_pt = extract_json(raw) or {}

        photo_data = {
            "imageUrl": image_url,
            "title": data_pt.get("title") or title_en,
            "titleEn": title_en,
            "titleEs": data_pt.get("titleEs") or title_en,
            "caption": data_pt.get("caption") or explanation_en[:300],
            "captionEn": explanation_en,
            "captionEs": data_pt.get("captionEs") or explanation_en[:300],
            "credit": credit,
            "week": current_week,
        }
        photo_path.write_text(json.dumps(photo_data, ensure_ascii=False, indent=2), encoding="utf-8")
        return f"  ✅  Foto da semana atualizada ({current_week})"
    except Exception as e:
        return f"  ⚠️  Foto da semana: {e}"

def cleanup(days=30):
    cutoff = datetime.date.today() - datetime.timedelta(days=days)
    for folder in ["noticias","artigos"]:
        p = BASE_DIR / "content" / folder
        if not p.exists(): continue
        for f in p.glob("*.md"):
            parts = f.stem.split("-")
            if len(parts) >= 3:
                try:
                    if datetime.date(int(parts[0]),int(parts[1]),int(parts[2])) < cutoff:
                        f.unlink(); print(f"  🗑️  {f.name}")
                except: pass

# ---------------------------------------------------------------------------
# 🌙 Fase da Lua, próximos eventos astronômicos e nomes culturais
# ---------------------------------------------------------------------------

SYNODIC_MONTH = 29.530588853
REF_NEW_MOON = datetime.datetime(2000, 1, 6, 18, 14, tzinfo=datetime.timezone.utc)

FASES_LUA = [
    (0.0, "Lua Nova", "new moon"),
    (1.84566, "Lua Crescente", "waxing crescent moon"),
    (5.53699, "Quarto Crescente", "first quarter moon"),
    (9.22831, "Lua Gibosa Crescente", "waxing gibbous moon"),
    (12.91963, "Lua Cheia", "full moon"),
    (16.61096, "Lua Gibosa Minguante", "waning gibbous moon"),
    (20.30228, "Quarto Minguante", "last quarter moon"),
    (23.99361, "Lua Minguante", "waning crescent moon"),
    (27.68493, "Lua Nova", "new moon"),
]

FASES_PRINCIPAIS = [
    (0.0, "Lua Nova"),
    (7.38265, "Quarto Crescente"),
    (14.76529, "Lua Cheia"),
    (22.14794, "Quarto Minguante"),
]

# Nomes culturais tradicionais (folclore norte-americano/europeu) para a lua cheia de cada mês
NOMES_CULTURAIS_LUA_CHEIA = {
    1: "Lua do Lobo", 2: "Lua da Neve", 3: "Lua do Verme", 4: "Lua Rosa",
    5: "Lua das Flores", 6: "Lua do Morango", 7: "Lua do Cervo", 8: "Lua do Esturjão",
    9: "Lua da Colheita", 10: "Lua do Caçador", 11: "Lua do Castor", 12: "Lua Fria",
}

# Datas anuais aproximadas de eventos astronômicos recorrentes (mês, dia, nome)
EVENTOS_ASTRONOMICOS = [
    (1, 3, "Chuva de meteoros Quadrantídeas (pico)"),
    (3, 20, "Equinócio de março"),
    (4, 22, "Chuva de meteoros Líridas (pico)"),
    (5, 5, "Chuva de meteoros Eta Aquáridas (pico)"),
    (6, 21, "Solstício de junho"),
    (7, 30, "Chuva de meteoros Delta Aquáridas do Sul (pico)"),
    (8, 12, "Chuva de meteoros Perseidas (pico)"),
    (9, 22, "Equinócio de setembro"),
    (10, 21, "Chuva de meteoros Oriônidas (pico)"),
    (11, 17, "Chuva de meteoros Leônidas (pico)"),
    (12, 13, "Chuva de meteoros Gemínidas (pico)"),
    (12, 21, "Solstício de dezembro"),
]


def moon_age(dt):
    dias = (dt - REF_NEW_MOON).total_seconds() / 86400
    return dias % SYNODIC_MONTH


def moon_phase_now(dt):
    age = moon_age(dt)
    nome_pt, nome_en = "Lua Nova", "new moon"
    for limite, pt, en in FASES_LUA:
        if age >= limite:
            nome_pt, nome_en = pt, en
    iluminacao = round((1 - math.cos(2 * math.pi * age / SYNODIC_MONTH)) / 2 * 100)
    return nome_pt, nome_en, iluminacao


def proxima_fase_principal(dt):
    age = moon_age(dt)
    melhor = None
    for alvo, nome in FASES_PRINCIPAIS:
        delta = (alvo - age) % SYNODIC_MONTH
        if melhor is None or delta < melhor[0]:
            melhor = (delta, nome)
    delta_dias, nome = melhor
    data_futura = (dt + datetime.timedelta(days=delta_dias)).date()
    return nome, data_futura.isoformat()


def proximo_evento_astronomico(dt):
    hoje = dt.date()
    candidatos = []
    for mes, dia, nome in EVENTOS_ASTRONOMICOS:
        try:
            data_evento = datetime.date(hoje.year, mes, dia)
        except ValueError:
            continue
        if data_evento < hoje:
            data_evento = datetime.date(hoje.year + 1, mes, dia)
        candidatos.append((data_evento, nome))
    candidatos.sort()
    data_evento, nome = candidatos[0]
    return nome, data_evento.isoformat()


# URLs de imagens curadas da Wikimedia Commons para cada fase da Lua.
# São fotos reais e reconhecíveis da fase correta, de domínio público ou CC.
MOON_PHASE_QUERIES = {
    "new moon":             "new moon night sky",
    "waxing crescent moon": "crescent moon",
    "first quarter moon":   "first quarter moon",
    "waxing gibbous moon":  "waxing gibbous moon",
    "full moon":            "full moon",
    "waning gibbous moon":  "waning gibbous moon",
    "last quarter moon":    "last quarter moon",
    "waning crescent moon": "waning crescent moon",
}

def moon_phase_image(nome_fase_en):
    """Retorna (url, credit) buscando uma foto real da fase da Lua no acervo da NASA."""
    key = nome_fase_en.lower().replace("'", "")
    query = MOON_PHASE_QUERIES.get(key, f"{key} moon")
    # Tenta primeiro o acervo da NASA (fotos reais, sempre disponíveis)
    img = find_image_nasa(query)
    if img:
        return img
    # Fallback: Openverse (agrega Flickr, museus etc.)
    img = find_image_openverse(query)
    if img:
        return img
    return None


def gen_moon_info():
    """Calcula a fase atual da Lua, a próxima fase, o próximo evento astronômico
    e o nome cultural da lua cheia do mês — sempre com uma imagem ilustrativa e crédito."""
    try:
        agora = datetime.datetime.now(datetime.timezone.utc)
        nome_fase_pt, nome_fase_en, iluminacao = moon_phase_now(agora)
        proxima_fase_nome, proxima_fase_data = proxima_fase_principal(agora)
        evento_nome, evento_data = proximo_evento_astronomico(agora)
        nome_cultural = NOMES_CULTURAIS_LUA_CHEIA.get(agora.month, "")

        data = {
            "fase": nome_fase_pt,
            "faseEn": nome_fase_en[0].upper() + nome_fase_en[1:],
            "iluminacao": iluminacao,
            "proximaFase": proxima_fase_nome,
            "proximaFaseData": proxima_fase_data,
            "evento": evento_nome,
            "eventoData": evento_data,
            "nomeCultural": nome_cultural,
            "mes": agora.month,
            "atualizadoEm": today(),
        }

        img = moon_phase_image(nome_fase_en)
        if img:
            data["imagem"] = img["url"]
            data["imagemCredito"] = img["credit"]

        (BASE_DIR / "content" / "lua.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return f"  ✅  Fase atual: {nome_fase_pt} ({iluminacao}% iluminada)"
    except Exception as e:
        return f"  ⚠️  {e}"


def main():
    print(f"\n🔭 De Olho no Céu — {today()}")
    if not ANTHROPIC_API_KEY:
        print("❌ ANTHROPIC_API_KEY não definida."); sys.exit(1)

    print("\n📡 Buscando RSS...")
    entries = fetch_rss()
    print(f"   {len(entries)} entradas")

    print("\n✍️  Gerando notícias...")
    generated = 0
    titulos_recentes = recent_source_titles(days=5)
    for e in entries:
        if generated >= 5:
            break
        key = news_key(e)
        if news_already_saved(key):
            print(f"  ⏭  Já existe: {key}")
            continue
        if any(titles_similar(e["title_original"], t) for t in titulos_recentes):
            print(f"  ⏭  Duplicata (mesmo assunto já coberto): {e['title_original'][:60]}")
            continue
        data = gen_news(e)
        if data:
            print(save_news(data, key, source_title_original=e["title_original"]))
            generated += 1
            titulos_recentes.append(e["title_original"])
            time.sleep(2)

    print("\n🌌 Gerando artigos conceituais...")
    generated_articles = 0
    for topic in TOPICS:
        if generated_articles >= 2:
            break
        topic_key = slug(topic)
        if article_topic_used(topic_key):
            continue
        print(f"   Tópico: {topic}")
        data = gen_article(topic)
        if data:
            print(save_article(data, topic_key))
            generated_articles += 1
            time.sleep(2)
    if generated_articles == 0:
        print("  ⏭  Todos os tópicos já foram cobertos")

    print("\n📷 Atualizando foto da semana...")
    print(gen_photo_week())

    print("\n🌙 Atualizando informações da Lua...")
    print(gen_moon_info())

    print("\n🗑️  Limpando conteúdo antigo...")
    cleanup()
    print("\n✅ Concluído!\n")

if __name__ == "__main__":
    main()
