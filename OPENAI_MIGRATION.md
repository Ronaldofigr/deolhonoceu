# Migração para OpenAI API

A automação usa a OpenAI Responses API e publica conteúdo gerado automaticamente, sem revisão humana. Notícias preservam a URL original do RSS; artigos conceituais usam a ferramenta de busca web da OpenAI e exigem de 2 a 4 referências HTTPS. Todo conteúdo novo recebe os campos `aiGenerated`, `aiProvider`, `aiModel`, `humanReviewed` e `references` no frontmatter.

## Secrets e variáveis do GitHub Actions

Configure em **Settings → Secrets and variables → Actions → New repository secret**:

- `OPENAI_API_KEY` (obrigatório): chave da OpenAI API. Não use uma chave do ChatGPT.
- `NASA_API_KEY` (recomendado): chave gratuita de https://api.nasa.gov para evitar o limite baixo de `DEMO_KEY`.

A variável `OPENAI_MODEL` está definida nos workflows como `gpt-5.6-sol`. Para trocar sem editar código, mova-a para **Repository variables** e use `${{ vars.OPENAI_MODEL }}` nos workflows.

Remova o secret legado `ANTHROPIC_API_KEY` depois de confirmar uma execução bem-sucedida.

## Validação automática

Antes de commit e deploy, os workflows executam:

```bash
python automation/validate_content.py --check-urls
```

A publicação é bloqueada se houver frontmatter inválido, traduções sem marcadores, metadados de transparência ausentes, referências malformadas ou URLs de referência inacessíveis. O build estático do Next.js continua sendo publicado pelo GitHub Pages.

## Teste local

```bash
pip install -r automation/requirements.txt
OPENAI_API_KEY=... NASA_API_KEY=... python automation/daily_update.py
python automation/validate_content.py --check-urls
npm install
npm run build
```