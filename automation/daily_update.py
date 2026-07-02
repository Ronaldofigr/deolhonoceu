#!/usr/bin/env python3
"""
De Olho no Céu — Automação diária
Busca RSS científicos e gera artigos com Claude API.
"""

import os, sys, json, time, re, datetime, feedparser, anthropic
from pathlib import Path

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
BASE_DIR = Path(__file__).parent.parent

RSS_SOURCES = [
    {"url": "https://www.nasa.gov/news-release/feed/",            "name": "NASA",                        "type": "nasa", "label": "NASA"},
    {"url": "https://www.esa.int/rssfeed/Our_Activities/Space_Science", "name": "ESA",                  "type": "esa",  "label": "ESA"},
    {"url": "https://www.space.com/feeds/all",                    "name": "Space.com",                   "type": "sci",  "label": "Space.com"},
    {"url": "https://skyandtelescope.org/feed/",                  "name": "Sky & Telescope",             "type": "sci",  "label": "Sky & Tel."},
    {"url": "https://www.ccvalg.pt/feed/",                        "name": "Centro Ciência Viva Algarve", "type": "obs",  "label": "C. Ciência Viva"},
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

def save_news(data):
    s = f"{data['date']}-{slug(data['title'])}"
    folder = BASE_DIR / "content" / "noticias"
    folder.mkdir(parents=True, exist_ok=True)
    if any(folder.glob(f"*{slug(data['title'])}*")): return f"  ⏭  Já existe: {s}"
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

def save_article(data):
    s = f"{today()}-{slug(data['title'])}"
    folder = BASE_DIR / "content" / "artigos"
    folder.mkdir(parents=True, exist_ok=True)
    if any(folder.glob(f"*{slug(data['title'])}*")): return f"  ⏭  Já existe: {s}"
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
    for e in entries[:5]:
        data = gen_news(e)
        if data: print(save_news(data)); time.sleep(2)

    print("\n🌌 Gerando artigos conceituais...")
    folder = BASE_DIR / "content" / "artigos"
    existing = " ".join(f.stem for f in folder.glob("*.md")) if folder.exists() else ""
    available = [t for t in TOPICS if slug(t) not in existing]
    if not available: available = TOPICS
    for topic in available[:2]:
        print(f"   Tópico: {topic}")
        data = gen_article(topic)
        if data: print(save_article(data)); time.sleep(2)

    print("\n🗑️  Limpando conteúdo antigo...")
    cleanup()
    print("\n✅ Concluído!\n")

if __name__ == "__main__":
    main()
