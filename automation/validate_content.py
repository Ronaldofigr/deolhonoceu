#!/usr/bin/env python3
"""Valida conteúdo antes de commit/deploy, sem depender de revisão humana."""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = Path(__file__).parent.parent
REQUIRED_LANG_MARKERS = ("<!--lang:en-->", "<!--lang:es-->")


def frontmatter(text, path):
    match = re.match(r"^---\n([\s\S]*?)\n---\n([\s\S]*)$", text)
    if not match:
        raise ValueError(f"{path}: frontmatter ausente ou inválido")
    fields = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip().strip('"')
    return fields, match.group(2)


def valid_https(url):
    parsed = urlparse(url)
    return parsed.scheme == "https" and bool(parsed.netloc) and " " not in url


def check_url(url):
    try:
        request = Request(url, headers={"User-Agent": "DeOlhoNoCeu-Validator/1.0"})
        with urlopen(request, timeout=20) as response:
            return response.status < 500
    except HTTPError as exc:
        return exc.code < 500
    except (URLError, TimeoutError, ValueError):
        return False


def validate_file(path, check_urls=False):
    errors = []
    text = path.read_text(encoding="utf-8")
    try:
        data, body = frontmatter(text, path)
    except ValueError as exc:
        return [str(exc)]
    for marker in REQUIRED_LANG_MARKERS:
        if marker not in body:
            errors.append(f"{path}: marcador obrigatório ausente: {marker}")
    for key in ("title", "titleEn", "titleEs", "date"):
        if not data.get(key):
            errors.append(f"{path}: campo obrigatório ausente: {key}")
    if data.get("aiGenerated", "").lower() == "true":
        for key in ("aiProvider", "aiModel", "humanReviewed", "references"):
            if not data.get(key):
                errors.append(f"{path}: transparência incompleta: {key}")
        if data.get("humanReviewed", "").lower() != "false":
            errors.append(f"{path}: humanReviewed deve ser false nesta automação")
        try:
            refs = json.loads(data.get("references", "[]"))
        except json.JSONDecodeError:
            refs = []
            errors.append(f"{path}: references não é JSON válido")
        if not refs:
            errors.append(f"{path}: conteúdo de IA sem referências")
        for ref in refs:
            url = ref.get("url", "") if isinstance(ref, dict) else ""
            title = ref.get("title", "") if isinstance(ref, dict) else ""
            if not title or not valid_https(url):
                errors.append(f"{path}: referência inválida: {ref!r}")
            elif check_urls and not check_url(url):
                errors.append(f"{path}: URL de referência inacessível: {url}")
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-urls", action="store_true")
    args = parser.parse_args()
    files = sorted((ROOT / "content" / "noticias").glob("*.md")) + sorted((ROOT / "content" / "artigos").glob("*.md"))
    errors = []
    for path in files:
        errors.extend(validate_file(path, args.check_urls))
    if errors:
        print("\n".join(f"ERRO: {error}" for error in errors))
        print(f"\nValidação falhou com {len(errors)} erro(s).")
        return 1
    print(f"Validação concluída: {len(files)} arquivo(s), estrutura e transparência válidas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())