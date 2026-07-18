name: Gerar rascunhos para redes sociais

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  generate-drafts:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Baixar o repositorio (somente leitura)
        uses: actions/checkout@v4

      - name: Configurar Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Instalar cliente OpenAI
        run: python -m pip install --disable-pip-version-check "openai>=1.0.0,<3"

      - name: Gerar e validar rascunhos
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: python automation/social_drafts.py

      - name: Disponibilizar rascunhos para revisao humana
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: social-drafts-${{ github.run_number }}
          path: social-drafts/
          if-no-files-found: error
          retention-days: 14
