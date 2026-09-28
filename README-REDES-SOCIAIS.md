# Rascunhos manuais para redes sociais

Este pacote gera **somente rascunhos**. Ele não contém integração, credencial, chamada de API ou ação de publicação para YouTube, Reddit ou X. Nenhuma conta social é acessada. Todo texto exige revisão humana antes de qualquer uso.

## Arquivos e locais exatos

Copie os arquivos preservando estes caminhos a partir da raiz do repositório `Ronaldofigr/deolhonoceu`:

- `automation/social_drafts.py`
- `.github/workflows/social-drafts.yml`
- `README-REDES-SOCIAIS.md`

As pastas `content/noticias` e `content/artigos` já devem existir no repositório. O script seleciona, em conjunto, no máximo os 3 arquivos `.md`, `.mdx` ou `.txt` com modificação mais recente.

## Configuração

O workflow utiliza o secret já existente `OPENAI_API_KEY` em **Settings → Secrets and variables → Actions**. A chave nunca é gravada nos artefatos. O modelo configurado é `gpt-5.6-terra`.

## Execução manual

1. No GitHub, abra a aba **Actions**.
2. Selecione **Gerar rascunhos para redes sociais**.
3. Clique em **Run workflow** e confirme.
4. Ao terminar, abra a execução e baixe o artefato `social-drafts-NÚMERO`.
5. Revise manualmente cada arquivo antes de copiar qualquer texto para uma rede social.

O workflow só aceita acionamento manual (`workflow_dispatch`) e possui permissão de leitura do conteúdo. Não há gatilho automático nem permissão de escrita no repositório.

## Formato e proteções

Para cada conteúdo, o artefato inclui versões Markdown e JSON em português, inglês e espanhol para:

- YouTube, sem link direto;
- Reddit, uma versão sem link e uma versão com link canônico opcional;
- X, com até 280 caracteres e sem link na primeira interação.

Antes de salvar os arquivos, o script bloqueia textos vazios, placeholders, duplicatas exatas, URLs em campos proibidos, URLs inventadas e posts do X acima de 280 caracteres. Qualquer violação encerra a execução com erro e nenhum artefato é publicado. A URL opcional do Reddit só é usada quando estiver declarada no front matter como `url`, `link` ou `canonical_url`.

## Observação operacional

O artefato fica disponível por 14 dias. A pasta `social-drafts/` é criada apenas no ambiente temporário do GitHub Actions e não é enviada de volta ao repositório. Publicação, agendamento e interação permanecem sempre manuais e fora deste sistema.
