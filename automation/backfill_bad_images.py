#!/usr/bin/env python3
"""
De Olho no Céu — Backfill de imagens ruins (artigos e notícias)
Re-busca imagens para todo conteúdo com imagem do APOD aleatório ou sem relação
com o tema, usando o Claude para gerar uma imageQuery precisa antes de cada busca.

Uso:
  python automation/backfill_bad_images.py              # só imagens ruins (APOD aleatório)
  python automation/backfill_bad_images.py --force      # reprocessa tudo
  python automation/backfill_bad_images.py --folder noticias   # só notícias
  python automation/backfill_bad_images.py --folder artigos    # só artigos
"""
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from daily_update import find_image, call_claude, extract_json, BASE_DIR

# Padrões que indicam imagem do fallback APOD aleatório (sem relação com o tema)
BAD_IMAGE_PATTERNS = [
    "apod.nasa.gov/apod/image",
    "images-assets.nasa.gov/image/GSFC_20171208",
]

def is_bad_image(url: str) -> bool:
    if not url:
        return True
    return any(p in url for p in BAD_IMAGE_PATTERNS)

def extract_field(text, field):
    m = re.search(rf'^{field}:\s*"([^"]*)"', text, re.MULTILINE)
    return m.group(1) if m else ""

def replace_image_in_frontmatter(text, new_url, new_credit):
    new_credit = (new_credit or "").replace('"', "'")
    new_url    = (new_url    or "").replace('"', "'")
    text = re.sub(r'^image:\s*"[^"]*"',       f'image: "{new_url}"',       text, flags=re.MULTILINE)
    text = re.sub(r'^imageCredit:\s*"[^"]*"', f'imageCredit: "{new_credit}"', text, flags=re.MULTILINE)
    if 'imageCredit:' not in text and new_credit:
        text = re.sub(r'(^image:\s*"[^"]*")', rf'\1\nimageCredit: "{new_credit}"', text, flags=re.MULTILINE)
    return text

def add_image_to_frontmatter(text, new_url, new_credit):
    new_credit = (new_credit or "").replace('"', "'")
    new_url    = (new_url    or "").replace('"', "'")
    lines = text.split("\n")
    dashes = [i for i, l in enumerate(lines) if l.strip() == "---"]
    if len(dashes) < 2:
        return text
    insert_at = dashes[1]
    new_lines = lines[:insert_at] + [f'image: "{new_url}"', f'imageCredit: "{new_credit}"'] + lines[insert_at:]
    return "\n".join(new_lines)

def gen_image_query(title_pt, title_en, category=""):
    """Pede ao Claude uma imageQuery precisa descrevendo o objeto visual principal."""
    prompt = f"""Conteúdo de astronomia:
Título PT: {title_pt}
Título EN: {title_en or title_pt}
{"Categoria: " + category if category else ""}

Gere uma imageQuery em inglês (3-5 palavras) descrevendo o OBJETO VISUAL PRINCIPAL —
o foguete, planeta, telescópio, nebulosa, fenômeno ou corpo celeste específico que uma foto deve mostrar.
NUNCA use termos abstratos como "space", "astronomy", "science", "discovery", "universe".
Exemplos bons: "SpaceX Starship rocket", "James Webb telescope galaxy", "Crab Nebula pulsar", "solar corona eruption", "Hubble deep field".

Responda SOMENTE com JSON: {{"imageQuery": "..."}}"""
    try:
        raw = call_claude(prompt, max_tokens=80)
        data = extract_json(raw)
        if data and data.get("imageQuery"):
            return data["imageQuery"]
    except Exception as e:
        print(f"    ⚠️  Claude: {e}")
    return title_en or title_pt

def process_folder(folder_name, force_all):
    folder = BASE_DIR / "content" / folder_name
    if not folder.exists():
        print(f"  (pasta {folder_name} não encontrada, pulando)\n")
        return 0, 0

    files = sorted(folder.glob("*.md"))
    print(f"📂 {folder_name}: {len(files)} arquivos\n")
    updated = skipped = 0

    for f in files:
        text = f.read_text(encoding="utf-8")
        current_image = extract_field(text, "image")

        if not force_all and not is_bad_image(current_image):
            skipped += 1
            continue

        title_pt = extract_field(text, "title")
        title_en = extract_field(text, "titleEn")
        category = extract_field(text, "category") or extract_field(text, "source")

        print(f"  🔍 {f.name}")
        print(f"     {title_pt[:65]}")
        print(f"     imagem atual: {current_image[:70] if current_image else '(nenhuma)'}")

        query = gen_image_query(title_pt, title_en, category)
        print(f"     imageQuery: \"{query}\"")
        time.sleep(0.5)

        img = find_image(query)
        if img:
            new_text = replace_image_in_frontmatter(text, img["url"], img["credit"]) \
                       if current_image else \
                       add_image_to_frontmatter(text, img["url"], img["credit"])
            f.write_text(new_text, encoding="utf-8")
            updated += 1
            print(f"     ✅ {img['url'][:70]}")
            print(f"        {img['credit']}\n")
        else:
            print(f"     ⚠️  nenhuma imagem relevante encontrada, mantendo atual\n")

    print(f"  → {updated} atualizado(s), {skipped} pulado(s) (imagem OK)\n")
    return updated, skipped

if __name__ == "__main__":
    force_all     = "--force"  in sys.argv
    only_folder   = next((sys.argv[i+1] for i, a in enumerate(sys.argv) if a == "--folder"), None)
    folders       = [only_folder] if only_folder else ["noticias", "artigos"]

    if force_all:
        print("⚡ Modo --force: reprocessando TODO o conteúdo\n")
    else:
        print("🔄 Modo padrão: apenas imagens do APOD aleatório\n")

    total_updated = total_skipped = 0
    for folder in folders:
        u, s = process_folder(folder, force_all)
        total_updated += u
        total_skipped += s

    print(f"✅ Total: {total_updated} atualizado(s) | {total_skipped} pulado(s)")
