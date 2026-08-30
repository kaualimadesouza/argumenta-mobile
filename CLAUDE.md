# argumenta-mobile

Mobile app of Argumenta: Expo (managed workflow) + React Native + TypeScript
strict, routes via expo-router in `src/app/`. Product decisions live in the
argumenta-api repo (`docs/PRD.md`); the visual source of truth is the **Novo
Argumenta** canvas (design system v3, Inter),
<https://claude.ai/code/artifact/1a60ff06-7705-4edf-b24a-ecd5d894b263>, with the
tokens ported to `src/styles/tokens.ts`.

**argumenta-web is the reference implementation.** Every screen here ports an
existing web page (`argumenta-web/src/pages/...`): same API contract, same
copy, same design tokens, adapted to native ergonomics (keyboard, gestures,
safe areas). When a card cites a web file, read it from the web repo's **main**
branch (`git -C ../argumenta-web show origin/main:<path>` after a fetch, or on
GitHub); the local checkout may be sitting on an old branch.

## Skills: check these BEFORE acting

Repo skills live in `.claude/skills/`. If the task matches a row, invoke the
skill first; do not improvise the workflow from memory.

| If the task involves... | Invoke |
|---|---|
| Starting/finishing an issue, opening a PR, the kanban board | `card-workflow` |
| Writing ANY code (tests come first) | `tdd` |
| Reviewing a PR/diff before merge (mandatory for EVERY PR) | `thermo-nuclear-code-quality-review` |
| Building or styling any screen/component, colors, fonts | `design-tokens` |
| Writing ANY Portuguese the student reads (copy, labels, alerts) | `portuguese-copy` |

## Non-negotiables

- **TDD, always** (owner decision): write the tests (jest-expo + Testing
  Library) BEFORE the implementation, derived from the card's acceptance
  criteria; red first, then implement until green, then refactor.
- **Typed objects, never loose dicts/objects** (owner decision): every function
  input/output shape is a named TypeScript interface or type; no `any`, no
  anonymous object shapes crossing module boundaries.
- **No assistant attribution anywhere**: no `Co-Authored-By`, no "Generated
  with" footers, in commits, PRs, issues or comments. Owner decision, permanent.
- **GitHub account**: `kaualimadesouza` only. `gh auth status` before gh/git
  network operations; switch back if the work account is active.
- One card = one PR to main, titled as a conventional commit, body `Closes #<n>`.
- Code, identifiers, comments, commit messages and PR descriptions in English.
  UI copy is pt-BR.
- **Correct pt-BR in every string the student reads** (owner decision, details
  in the `portuguese-copy` skill): full accentuation, crase and hyphenation in
  copy, labels, empty states and error messages. Route segments, enum values
  and identifiers stay unaccented ASCII on purpose.
- Never hardcode colors or font families: import from `src/styles/tokens.ts`
  (see `design-tokens`).
- `npm run lint && npm run typecheck && npm test` must pass before every push;
  CI runs the same.

## API

- The wire contract is the argumenta-api pydantic responses, mirrored field by
  field in `src/api/types.ts` (the web's `src/api/types.ts` is the same
  contract and usually already has the type you need).
- Auth is Bearer + refresh handled inside `src/api/client.ts` (tokens in
  SecureStore via `src/session/tokenStore.ts`); screens consume the
  `ArgumentaApi` object from `src/api/context.ts` and never call fetch.
- Base URL comes from `EXPO_PUBLIC_API_URL` (`.env`, inlined at build time).
  Local dev: your machine's LAN IP, not localhost. PROD builds:
  `https://argumenta-web.vercel.app` (the Vercel proxy fronts the API on the
  same paths).
- Submission is asynchronous: POST returns 202 and the verdict arrives by
  polling `GET /submissions/{id}` (see web `src/api/verdict.ts`).

## Related

Kanban: GitHub Project "Argumenta MVP" (owner kaualimadesouza, number 2), shared
with argumenta-api and argumenta-web. Google Sign-In setup:
`docs/google-sign-in-setup.md`.
