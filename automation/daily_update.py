#!/usr/bin/env python3
"""
De Olho no Céu — Automação diária
Busca RSS científicos e gera artigos com Claude API.
"""

import os, sys, json, time, re, datetime, feedparser, anthropic, requests
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
                                "excerpt_original": raw[:600], "date": today()})
        except Exception as ex:
            print(f"  ⚠️  {src['name']}: {ex}")
    return entries

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

O mesmo vale para "contentEn" em inglês.

Responda SOMENTE com JSON válido:
{{"title":"título PT máx 90 chars","titleEn":"title EN max 90 chars","excerpt":"resumo PT 2-3 frases max 280 chars","excerptEn":"summary EN 2-3 sentences max 280 chars","tags":["tag1","tag2","tag3"],"content":"texto PT mínimo 200 palavras, 3-4 parágrafos separados por \\n\\n, sem fórmulas, com analogias","contentEn":"text EN minimum 200 words, 3-4 paragraphs separated by \\n\\n, no formulas"}}"""
    try:
        raw = call_claude(prompt, max_tokens=1600)
        m = re.search(r'\{[\s\S]+\}', raw)
        if m:
            data = json.loads(m.group())
            data.update({"source": entry["source"], "sourceType": entry["source_type"],
                         "sourceUrl": entry["url"], "date": entry["date"]})
            return data
    except Exception as e:
        print(f"  ⚠️  {e}")
    return None

def save_news(data, key):
    s = f"{data['date']}-{key}"
    folder = BASE_DIR / "content" / "noticias"
    folder.mkdir(parents=True, exist_ok=True)
    tags = "[" + ", ".join(f'"{t}"' for t in data.get("tags",[])) + "]"
    md = f"""---
title: "{data['title']}"
titleEn: "{data['titleEn']}"
excerpt: "{data['excerpt']}"
excerptEn: "{data['excerptEn']}"
source: "{data['source']}"
sourceType: "{data['sourceType']}"
sourceUrl: "{data['sourceUrl']}"
tags: {tags}
date: "{data['date']}"
---

{data['content']}
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
{{"title":"título PT criativo","titleEn":"title EN","category":"categoria PT","categoryEn":"category EN","content":"texto PT parágrafos separados por \\n\\n","contentEn":"text EN paragraphs separated by \\n\\n","readingTime":3}}"""
    try:
        raw = call_claude(prompt, max_tokens=1500)
        m = re.search(r'\{[\s\S]+\}', raw)
        if m: return json.loads(m.group())
    except Exception as e:
        print(f"  ⚠️  {e}")
    return None

def save_article(data, topic_key):
    s = f"{today()}-{topic_key}"
    folder = BASE_DIR / "content" / "artigos"
    folder.mkdir(parents=True, exist_ok=True)
    md = f"""---
title: "{data['title']}"
titleEn: "{data['titleEn']}"
category: "{data['category']}"
categoryEn: "{data['categoryEn']}"
type: "concept"
readingTime: {data.get('readingTime',3)}
date: "{today()}"
---

{data['content']}
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

        prompt = f"""Traduza e adapte para português do Brasil, em tom de divulgação científica acessível:
TÍTULO: {title_en}
LEGENDA: {explanation_en}

Responda SOMENTE com JSON válido:
{{"title":"título PT curto e atrativo","caption":"legenda PT em até 3 frases, linguagem simples, sem jargão"}}"""
        raw = call_claude(prompt, max_tokens=600)
        m = re.search(r'\{[\s\S]+\}', raw)
        data_pt = json.loads(m.group()) if m else {}

        photo_data = {
            "imageUrl": image_url,
            "title": data_pt.get("title") or title_en,
            "titleEn": title_en,
            "caption": data_pt.get("caption") or explanation_en[:300],
            "captionEn": explanation_en,
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

def main():
    print(f"\n🔭 De Olho no Céu — {today()}")
    if not ANTHROPIC_API_KEY:
        print("❌ ANTHROPIC_API_KEY não definida."); sys.exit(1)

    print("\n📡 Buscando RSS...")
    entries = fetch_rss()
    print(f"   {len(entries)} entradas")

    print("\n✍️  Gerando notícias...")
    generated = 0
    for e in entries:
        if generated >= 5:
            break
        key = news_key(e)
        if news_already_saved(key):
            print(f"  ⏭  Já existe: {key}")
            continue
        data = gen_news(e)
        if data:
            print(save_news(data, key))
            generated += 1
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

    print("\n🗑️  Limpando conteúdo antigo...")
    cleanup()
    print("\n✅ Concluído!\n")

if __name__ == "__main__":
    main()
