#!/usr/bin/env python3
"""
De Olho no Céu — Backfill de traduções (EN/ES)
Traduz título, resumo/categoria e corpo de notícias e artigos publicados antes
do suporte multilíngue completo. Não altera o texto original em português —
apenas adiciona os campos/traduções que ainda faltam.
"""
import re
import json
from pathlib import Path
from daily_update import call_claude, BASE_DIR


def has_lang_markers(text):
    return '<!--lang:en-->' in text


def extract_field(text, field):
    m = re.search(rf'^{field}:\s*"([^"]*)"', text, re.MULTILINE)
    return m.group(1) if m else ""


def split_frontmatter_body(text):
    m = re.match(r'^(---\n.*?\n---\n)([\s\S]*)$', text, re.DOTALL)
    if not m:
        return None, None
    return m.group(1), m.group(2)


def insert_field_after(frontmatter, after_field, new_field, value):
    """Insere um novo campo logo após outro campo já existente no frontmatter."""
    escaped = (value or "").replace('"', "'").replace("\n", " ").strip()
    if re.search(rf'^{new_field}:', frontmatter, re.MULTILINE):
        return frontmatter  # já existe, não duplica
    pattern = rf'(^{after_field}:.*$)'
    replacement = rf'\1\n{new_field}: "{escaped}"'
    new_fm, count = re.subn(pattern, replacement, frontmatter, count=1, flags=re.MULTILINE)
    return new_fm if count else frontmatter


def translate_news(title, excerpt, content):
    prompt = f"""Traduza o texto abaixo (notícia científica em português) para INGLÊS e ESPANHOL.
Mantenha os mesmos parágrafos do corpo, separados pelo literal \\n\\n. Não resuma, traduza por completo.

TÍTULO: {title}
RESUMO: {excerpt}
CORPO:
{content}

Responda SOMENTE com JSON válido:
{{"titleEn":"...","excerptEn":"...","contentEn":"texto completo em inglês, parágrafos separados por \\n\\n","titleEs":"...","excerptEs":"...","contentEs":"texto completo em espanhol, parágrafos separados por \\n\\n"}}"""
    try:
        raw = call_claude(prompt, max_tokens=2600)
        m = re.search(r'\{[\s\S]+\}', raw)
        return json.loads(m.group()) if m else None
    except Exception as e:
        print(f"     ⚠️  {e}")
        return None


def translate_article(title, category, content):
    prompt = f"""Traduza o texto abaixo (artigo de divulgação científica em português) para INGLÊS e ESPANHOL.
Mantenha os mesmos parágrafos do corpo, separados pelo literal \\n\\n. Não resuma, traduza por completo.

TÍTULO: {title}
CATEGORIA: {category}
CORPO:
{content}

Responda SOMENTE com JSON válido:
{{"titleEn":"...","categoryEn":"...","contentEn":"texto completo em inglês, parágrafos separados por \\n\\n","titleEs":"...","categoryEs":"...","contentEs":"texto completo em espanhol, parágrafos separados por \\n\\n"}}"""
    try:
        raw = call_claude(prompt, max_tokens=2600)
        m = re.search(r'\{[\s\S]+\}', raw)
        return json.loads(m.group()) if m else None
    except Exception as e:
        print(f"     ⚠️  {e}")
        return None


def process_news():
    folder = BASE_DIR / "content" / "noticias"
    if not folder.exists():
        print("  (pasta noticias não existe, pulando)")
        return
    files = sorted(folder.glob("*.md"))
    updated = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        if has_lang_markers(text):
            continue
        fm, body = split_frontmatter_body(text)
        if fm is None:
            continue
        title = extract_field(text, "title")
        excerpt = extract_field(text, "excerpt")
        if not title or not body.strip():
            continue
        print(f"  🔤 {f.name}")
        result = translate_news(title, excerpt, body.strip())
        if not result:
            print("     ⚠️  falha na tradução, pulando")
            continue

        new_fm = fm
        new_fm = insert_field_after(new_fm, "titleEn", "titleEs", result.get("titleEs") or result.get("titleEn", ""))
        new_fm = insert_field_after(new_fm, "excerptEn", "excerptEs", result.get("excerptEs") or result.get("excerptEn", ""))

        content_en = result.get("contentEn", "").strip()
        content_es = (result.get("contentEs") or content_en).strip()
        new_body = f"{body.strip()}\n\n<!--lang:en-->\n\n{content_en}\n\n<!--lang:es-->\n\n{content_es}\n"

        f.write_text(new_fm + "\n" + new_body, encoding="utf-8")
        updated += 1
        print("     ✅ traduzido (EN + ES)")
    print(f"\n📁 noticias: {updated} arquivo(s) traduzido(s) de {len(files)} total\n")


def process_articles():
    folder = BASE_DIR / "content" / "artigos"
    if not folder.exists():
        print("  (pasta artigos não existe, pulando)")
        return
    files = sorted(folder.glob("*.md"))
    updated = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        if has_lang_markers(text):
            continue
        fm, body = split_frontmatter_body(text)
        if fm is None:
            continue
        title = extract_field(text, "title")
        category = extract_field(text, "category")
        if not title or not body.strip():
            continue
        print(f"  🔤 {f.name}")
        result = translate_article(title, category, body.strip())
        if not result:
            print("     ⚠️  falha na tradução, pulando")
            continue

        new_fm = fm
        new_fm = insert_field_after(new_fm, "titleEn", "titleEs", result.get("titleEs") or result.get("titleEn", ""))
        new_fm = insert_field_after(new_fm, "categoryEn", "categoryEs", result.get("categoryEs") or result.get("categoryEn", ""))

        content_en = result.get("contentEn", "").strip()
        content_es = (result.get("contentEs") or content_en).strip()
        new_body = f"{body.strip()}\n\n<!--lang:en-->\n\n{content_en}\n\n<!--lang:es-->\n\n{content_es}\n"

        f.write_text(new_fm + "\n" + new_body, encoding="utf-8")
        updated += 1
        print("     ✅ traduzido (EN + ES)")
    print(f"\n📁 artigos: {updated} arquivo(s) traduzido(s) de {len(files)} total\n")


def main():
    print("🌐 Backfill de traduções — De Olho no Céu\n")
    print("Notícias:")
    process_news()
    print("Artigos:")
    process_articles()
    print("✅ Concluído!")


if __name__ == "__main__":
    main()
