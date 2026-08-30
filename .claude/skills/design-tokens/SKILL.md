---
name: design-tokens
description: Use the Argumenta design tokens (colors, typography, shape) when building or styling any screen or component. Use when writing StyleSheet code, choosing colors or fonts, implementing a mockup screen, or reviewing visual fidelity.
---

# Design tokens

Visual source of truth: the **Novo Argumenta** canvas (design system v3),
<https://claude.ai/code/artifact/1a60ff06-7705-4edf-b24a-ecd5d894b263>, with the
`Sistema visual` artboard as the spec sheet. Tokens live in
`src/styles/tokens.ts` (`colors`, `fontFamily`, `typeScale`, `tracking`,
`radius`), ported from argumenta-web's `src/styles/tokens.css`. **Never
hardcode a hex or a font family**; always import from tokens. New tokens go
into tokens.ts first (and, if the web needs them too, into the web's
tokens.css), then get used.

The web app is the reference implementation of every screen: when in doubt
about spacing, hierarchy or copy, read the corresponding page in
`argumenta-web/src/pages/` on its main branch.

## React Native translation rules

- `letterSpacing` is absolute in RN: multiply `tracking.x` by the font size
  (`typeScale.title * tracking.title`), never pass the ratio raw.
- Font weight is a family name, not a number: `fontFamily.semiBold`, loaded by
  `useAppFonts`. Never `fontWeight: '600'` with the default font.
- Numbers the student compares (scores, counters, streak) take
  `fontVariant: ['tabular-nums']`.
- Styling is `StyleSheet.create` per screen/component file; shared pieces get
  promoted to `src/components/` only when a second screen needs them.

## Two rules that decide most arguments

- **Elevation is declared once**: a border OR a shadow, never both. Cards carry
  a 1px `colors.line` border; the card the student is meant to act on carries a
  1.5px `colors.caneta` border instead. No card gets a shadow.
- **There is exactly one shadow in the system**: the 3px "press" step under a
  primary action (already built into `src/components/Button.tsx`), removed
  while pressed. If a shadow shows up anywhere else, it is wrong.

## Colors (semantic, not decorative)

| Token | Meaning |
|---|---|
| `paper` / `card` | screen background, card surfaces |
| `line` / `lineStrong` / `track` | hairlines, control borders, bar tracks |
| `ink` / `ink2` / `muted` | text, in descending emphasis |
| `disabled` | the fill of a blocked action |
| `caneta` / `canetaPress` / `canetaSoft` | the single action colour |
| `aprovado` / `aprovadoInk` / `aprovadoSoft` | passed, completed |
| `corretor` / `corretorInk` / `corretorSoft` | errors, failed floors |
| `streak` / `streakInk` / `streakSoft` | streak, "não convenceu" |
| `marcaTexto` | repertoire mark behind praised text |
| `noite` / `noiteInner` / `luz` / `luzMuted` | narration panels, consequence |

The `-Ink` variants exist because the base colour is for fills, not for text:
`aprovado` on white is under 4.5:1 contrast, `aprovadoInk` is over it.
**Text always takes the `-Ink` variant.**

## Typography

One family (Inter, via `@expo-google-fonts/inter`). Steps in `typeScale` and
nothing in between:

| Step | Size | Used for |
|---|---|---|
| `title` | 24 | the one title of a screen (`tracking.title`) |
| `lead` | 19 | what the student reads slowly: narration, a character's line, an objective, a section heading (`tracking.lead`) |
| `body` | 15 | body copy, inputs, buttons (`tracking.body`) |
| `meta` | 13 | labels, criterion names, counters, chips |
| `micro` | 11 | tab bar labels only |

## Shape and conventions from the canvas

`radius.card: 14`, `radius.button: 12`, `radius.tile: 10`, `radius.chip: 999`
(small controls only). Content column caps at ~544pt on tablets.

- **No uppercase eyebrows.** A label above a block names what the block is
  ("Seu objetivo") at `meta`/bold in the colour of its meaning: caneta for the
  objective, `streakInk` for the hint. Never uppercase, never tracked out.
- **Icons are drawn** (react-native-svg), on a 24 grid, strokeWidth 1.75,
  round caps and joins, inheriting the text colour. Never emoji, never a
  unicode glyph.
- **No SVG pretending to be a picture.** The story cover slot carries the
  story's position or its state until real cover art exists; narration rides
  the night panel instead of a drawn scene.
- Score bars: track in `colors.track`, fill in caneta, or corretor when the
  criterion is below its floor; the floor is a 2px ink tick at 35% opacity.
- Student text annotations: wavy-style underline in corretor for a mistake
  (RN has no `underline wavy`; a 2px dotted underline in corretor is the
  accepted stand-in), `marcaTexto` behind a praised repertoire, numbered marks
  in a 15pt circle.
