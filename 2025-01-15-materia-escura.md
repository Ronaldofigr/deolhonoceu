name: Atualização Diária — De Olho no Céu

on:
  schedule:
    # Roda todo dia às 10:00 UTC = 07:00 BRT
    - cron: '0 10 * * *'
  workflow_dispatch:  # Permite rodar manualmente pelo GitHub

jobs:
  update-content:
    name: Gerar e publicar conteúdo
    runs-on: ubuntu-latest

    permissions:
      contents: write  # necessário para fazer commit

    steps:
      - name: Checkout do repositório
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configurar Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: automation/requirements.txt

      - name: Instalar dependências
        run: pip install -r automation/requirements.txt

      - name: Executar script de atualização
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python automation/daily_update.py

      - name: Commit e push do novo conteúdo
        run: |
          git config user.name  "De Olho no Céu Bot"
          git config user.email "bot@deolhonoceu.vercel.app"
          git add content/
          # Só faz commit se houver mudanças
          git diff --staged --quiet || git commit -m "🔭 Conteúdo automático: $(date '+%Y-%m-%d')"
          git push
