---
name: portuguese-copy
description: Write correct pt-BR in every string a student can read, with full accentuation, crase and hyphenation. Use when writing or editing UI copy, labels, empty states, error messages, legal text or any Portuguese prose.
---

# Portuguese copy: accents are not optional

Argumenta teaches writing. A product that grades a student's spelling and shows
them `"Voce e presidente do gremio ha onze dias"` has no standing to correct
anybody. Every Portuguese string a student can read must be **orthographically
correct pt-BR** under the Acordo Ortográfico de 1990: diacritics, crase and
hyphens included.

This is an owner decision (2026-08-22), triggered by exactly that sentence
appearing on screen in the tutorial.

## Where it applies

Every string this app puts on screen:

- UI copy: headings, button labels, empty states, hints, placeholders
- `src/copy/labels.ts`: the pt-BR display copy of the API enums
- `src/api/messages.ts`: the message shown for each API error code
- native alerts, notification titles/bodies and store listing texts
- README prose, issue and PR bodies

## Where it does NOT apply

Identifiers stay ASCII and unaccented, on purpose:

- expo-router segments (`src/app/(app)/capitulos/[chapterId].tsx`), test ids
- API enum values arriving on the wire (`enem`, `in_consequence`, `norma_culta`)
- file names, module names, branch names, git commit subjects
- code, identifiers and comments (those are in English anyway)

A slug or an enum value is not copy. Route paths stay unaccented so URLs stay
typeable; the accented version belongs in the label, not in the path.

## The traps that actually showed up here

Words this codebase got wrong at least once:

> você, vocês, não, é, há, até, três, só, já, além, através, próprio, próximo,
> último, único, possível, necessário, específico, responsável, verificável,
> viável, grêmio, pátio, Tenório, óculos, braços, mãos, sábado, prejuízo,
> mágoa, auditório, silêncio, murmúrio, plateia (sem acento, pós-reforma),
> colégio, associação, reunião, redação, correção, avaliação, organização,
> intervenção, reclamação, ameaça, espaço, reposição, bajulação, segurança,
> condição, portão, pichação, votação, intenção, intenções, objeções, razões,
> soluções, preocupações, dimensão, dimensões, coesão, coerência, persuasão,
> repertório, critério, ortografia, acentuação, pontuação, gramática,
> explicação, sugestão, evidência, consequência, pedagógico, linguísticos,
> domínio, compreensão, seleção, expressão

Two things that are not accents but break the same way:

- **crase**: "respondendo **às** objeções", "**à** autoridade da diretora",
  "responde **às** três perguntas". Not `as` when the sense is `a + as`.
- **hyphen in enclisis**: "como o grêmio vai **organizá-lo**", never `organiza-lo`.

## Check before committing

Grep the strings you touched for the usual suspects. From the repo root:

```bash
grep -rnE --include='*.ts' --include='*.tsx' '\b(voce|nao|entao|tambem|ate|apos|alem|atraves|proprio|proximo|ultimo|unico|possivel|necessario|especifico|responsavel|verificavel|viavel|gremio|patio|Tenorio|oculos|bracos|maos|sabado|prejuizo|magoa|auditorio|silencio|murmurio|colegio|associacao|reuniao|redacao|correcao|avaliacao|organizacao|intervencao|reclamacao|ameaca|espaco|reposicao|bajulacao|seguranca|condicao|portao|pichacao|votacao|intencao|intencoes|objecoes|razoes|solucoes|preocupacoes|dimensao|dimensoes|coesao|coerencia|persuasao|repertorio|criterio|acentuacao|pontuacao|gramatica|explicacao|sugestao|evidencia|consequencia|pedagogico|linguisticos|dominio|compreensao|selecao|expressao)\b' src/
```

Hits inside slugs, enum values or English comments are fine. Hits inside a
Portuguese string are bugs.

## Text that comes from the API

Story content, character names and the lens criterion labels are written in
argumenta-api (seeds, `domain/lenses.py`). If a screen shows a badly accented
string that this repo does not own, fix it there, not with a patch table here.

The one exception is display copy the design owns: the short criterion names in
the scoreboard come from the mockups ("C1 Norma culta"), not from the API's long
labels, and those live here.
