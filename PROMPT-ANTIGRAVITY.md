# Prompt inicial para o Antigravity (argumenta-mobile)

Abra o workspace em `/home/kaua/personal/argumenta-mobile` e cole o bloco
abaixo como primeira mensagem. Este arquivo é local e não deve ser commitado.

---

Você vai desenvolver o app **argumenta-mobile** (Expo managed + React Native +
TypeScript estrito, rotas via expo-router) executando as cards do GitHub em
ordem, até gerar um APK instalável de Android. Trabalhe de forma autônoma; só
me chame nos passos marcados como HITL.

## Antes de qualquer código

1. Leia o `CLAUDE.md` na raiz do repo. São regras não negociáveis do dono:
   TDD sempre (teste antes da implementação), tipos nomeados em toda fronteira
   (sem `any`), copy pt-BR com acentuação correta, nunca hardcodear cor ou
   fonte (usar `src/styles/tokens.ts`), commits/código/PRs em inglês.
2. Leia os cinco guias em `.claude/skills/*/SKILL.md` e trate cada um como
   regra, não como sugestão:
   - `card-workflow`: fluxo de card, IDs do board kanban, formato de PR.
   - `tdd`: como escrever os testes (jest-expo + @testing-library/react-native).
   - `design-tokens`: o sistema visual e as traduções para React Native.
   - `portuguese-copy`: ortografia obrigatória em toda string que o aluno lê.
   - `thermo-nuclear-code-quality-review`: revisão obrigatória do diff de
     TODO PR antes do merge.

## Regras duras (resumo do que mais derruba PR)

- **Proibido** `Co-Authored-By`, "Generated with" ou qualquer atribuição de
  assistente em commits, PRs, issues e comentários.
- Conta GitHub: **kaualimadesouza** apenas. Rode `gh auth status` antes de
  qualquer operação de rede; se a conta de trabalho (`kaualima1as`) estiver
  ativa, `gh auth switch --user kaualimadesouza`.
- Se um `git push` falhar com `denied to kaualima1as` mesmo com a conta certa
  ativa (há um `~/.netrc` da conta de trabalho que intercepta o https), empurre
  assim:
  ```bash
  TOK=$(gh auth token --user kaualimadesouza)
  B64=$(printf 'kaualimadesouza:%s' "$TOK" | base64 -w0)
  GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=http.extraheader \
    GIT_CONFIG_VALUE_0="Authorization: Basic $B64" git push -u origin <branch>
  ```
- Uma card = uma branch a partir de main = um PR para main com título
  conventional commit e corpo `Closes #<n>`, squash-merge após CI verde e
  revisão thermo-nuclear aplicada.
- `npm run lint && npm run typecheck && npm test` verdes antes de todo push.
- Board: mover a card para In Progress ao começar e Done ao mesclar (snippets
  e IDs prontos no skill `card-workflow`).

## Ordem de execução

Execute nesta ordem, cada uma como um ciclo completo (ler card, TDD,
implementar, PR, revisão, merge, board):

1. **#3** Trilha e Cena
2. **#4** Editor de argumento (contrato **assíncrono**: POST devolve 202 e o
   veredito chega por polling em `GET /submissions/{id}`; o contrato síncrono
   antigo não existe mais, não o implemente)
3. **#5** Correção em camadas e consequência
4. **#6** Progresso e redação-chefe
5. **#7** Push de streak
6. **#15** APK de preview: o entregável final. Gere o APK pelo EAS Build e
   poste o link de download num comentário da issue #15 para eu baixar.

A #8 (publicação nas lojas) fica para depois: **não** a execute.

## Como usar cada card

- `gh issue view <n> -R kaualimadesouza/argumenta-mobile` e leia o corpo
  inteiro: ele traz o contrato exato da API, os arquivos de referência do web
  e os critérios de aceite (cada critério vira ao menos um teste).
- O **argumenta-web é a implementação de referência** de toda tela. Leia os
  arquivos citados na branch **main** dele, nunca no working tree local (pode
  estar em branch antiga):
  ```bash
  git -C ../argumenta-web fetch origin
  git -C ../argumenta-web show origin/main:src/pages/editor/Editor.tsx
  ```
- Os tipos de `src/api/types.ts` do web espelham as respostas pydantic da API
  campo a campo: copie-os, não os reinvente.
- Dúvida de produto: `../argumenta-api/docs/PRD.md`.

## Ambiente de execução

- Testes não precisam de API (fakes tipados no lugar do client).
- Para rodar o app de verdade em desenvolvimento: API local do
  `../argumenta-api` (docker compose) com `EXPO_PUBLIC_API_URL` apontando para
  o IP da máquina na LAN (ver `.env.example`), ou o ambiente de dev
  `https://argumenta-dev.vercel.app`.
- O APK final (#15) aponta para produção: `https://argumenta-web.vercel.app`.

## Passos HITL (me chame e pare)

- `eas login` na conta Expo (card #15).
- Criar o client OAuth Android no Google Cloud com o SHA-1 do keystore do EAS
  (card #15; sem ele o login Google falha no APK, o de e-mail funciona).

Comece agora pela card #3.
