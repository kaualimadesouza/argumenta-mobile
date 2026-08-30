/** Ported from argumenta-web's src/styles/tokens.css (design system v3, Inter),
 *  the source of truth for the product's palette and type ramp. React Native
 *  has no CSS custom properties or `em`, so colors are plain hex and tracking
 *  is a ratio to multiply by the font size at the call site. */

export const colors = {
  paper: '#f4f5f7',
  card: '#ffffff',
  line: '#e4e7eb',
  lineStrong: '#d3d8de',
  track: '#eceef1',

  ink: '#101418',
  ink2: '#54606c',
  muted: '#6b7683',
  disabled: '#c9cfd6',

  caneta: '#2649e5',
  canetaPress: '#1932a8',
  canetaSoft: '#edf0fe',

  aprovado: '#0e9f6e',
  aprovadoInk: '#07784f',
  aprovadoSoft: '#e7f6f0',
  corretor: '#d92d20',
  corretorInk: '#a81c1c',
  corretorSoft: '#fdecea',

  streak: '#e8891a',
  streakInk: '#a35c08',
  streakSoft: '#fbf0e2',

  marcaTexto: '#ffe9a8',

  noite: '#111722',
  noiteInner: '#1b2432',
  luz: '#e6eaf0',
  luzMuted: '#9aa6b6',
} as const

export type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold'

/** Matches the `@expo-google-fonts/inter` export names, loaded by useAppFonts. */
export const fontFamily: Record<FontWeight, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
}

/** Pixel equivalents of the web rem steps at the 16px root. */
export const typeScale = {
  display: 30,
  title: 24,
  lead: 19,
  body: 15,
  meta: 13,
  micro: 11,
} as const

/** `em` ratios: multiply by a typeScale step to get RN's absolute letterSpacing. */
export const tracking = {
  title: -0.03,
  lead: -0.02,
  body: -0.011,
  meta: 0,
} as const

export const radius = {
  tile: 10,
  button: 12,
  card: 14,
  chip: 999,
} as const
