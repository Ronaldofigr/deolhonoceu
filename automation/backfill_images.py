#!/usr/bin/env python3
"""
De Olho no Céu — Backfill de imagens
Adiciona foto (com crédito) às notícias e artigos JÁ PUBLICADOS que ainda não têm imagem.
Não altera o texto de nenhum conteúdo existente — só insere os campos "image" e
"imageCredit" no frontmatter, reaproveitando a mesma cascata de busca (NASA →
Wikipédia → Wikimedia → Openverse → foto aleatória da NASA) do daily_update.py.
"""
import re
from pathlib import Path
from daily_update import find_image, BASE_DIR


def has_image(text):
    return re.search(r'^image:\s*"', text, re.MULTILINE) is not None


def extract_field(text, field):
    m = re.search(rf'^{field}:\s*"([^"]*)"', text, re.MULTILINE)
    return m.group(1) if m else ""


def add_image_to_frontmatter(text, image_url, credit):
    credit = (credit or "").replace('"', "'")
    image_url = (image_url or "").replace('"', "'")
    lines = text.split("\n")
    dashes = [i for i, l in enumerate(lines) if l.strip() == "---"]
    if len(dashes) < 2:
        return text  # frontmatter fora do padrão esperado — não mexe, por segurança
    insert_at = dashes[1]
    new_lines = lines[:insert_at] + [f'image: "{image_url}"', f'imageCredit: "{credit}"'] + lines[insert_at:]
    return "\n".join(new_lines)


def process_folder(folder, query_fields):
    folder_path = BASE_DIR / "content" / folder
    if not folder_path.exists():
        print(f"  (pasta {folder} não existe, pulando)")
        return
    files = sorted(folder_path.glob("*.md"))
    updated = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        if has_image(text):
            continue
        query = " ".join(extract_field(text, fld) for fld in query_fields if extract_field(text, fld)).strip()
        if not query:
            print(f"  ⚠️  {f.name}: sem título/campo para buscar, pulando")
            continue
        print(f"  🔍 {f.name}  →  \"{query[:70]}\"")
        img = find_image(query)
        if img:
            f.write_text(add_image_to_frontmatter(text, img["url"], img["credit"]), encoding="utf-8")
            updated += 1
            print(f"     ✅ imagem adicionada ({img['credit']})")
        else:
            print("     ⚠️  nenhuma imagem encontrada (raro, todas as fontes falharam)")
    print(f"\n📁 {folder}: {updated} arquivo(s) atualizado(s) de {len(files)} total\n")


def main():
    print("🖼️  Backfill de imagens — De Olho no Céu\n")
    print("Notícias:")
    process_folder("noticias", ["title"])
    print("Artigos:")
    process_folder("artigos", ["title"])
    print("✅ Concluído!")


if __name__ == "__main__":
    main()
