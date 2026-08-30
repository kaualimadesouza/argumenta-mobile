import { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, fontFamily, radius, typeScale } from '@/styles/tokens'

export type ChipTone = 'caneta' | 'ok' | 'warn' | 'streak' | 'default'

interface ChipProps {
  label?: string
  children?: ReactNode
  tone?: ChipTone
  selected?: boolean
  onPress?: () => void
}

export function Chip({ label, children, tone = 'default', selected = false, onPress }: ChipProps) {
  const content = (
    <Text style={[styles.label, selected && styles.selectedLabel, styles[`${tone}Label`]]}>
      {children ?? label}
    </Text>
  )
  
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[styles.chip, selected && styles.selected, styles[`${tone}Bg`]]}
      >
        {content}
      </Pressable>
    )
  }

  return (
    <View style={[styles.chip, selected && styles.selected, styles[`${tone}Bg`]]}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: { backgroundColor: colors.canetaSoft, borderColor: colors.caneta },
  label: { fontSize: typeScale.meta, color: colors.ink2, fontFamily: fontFamily.medium },
  selectedLabel: { color: colors.caneta },
  
  defaultBg: {},
  defaultLabel: {},
  canetaBg: { backgroundColor: colors.canetaSoft, borderColor: colors.caneta },
  canetaLabel: { color: colors.caneta },
  okBg: { backgroundColor: colors.aprovadoSoft, borderColor: colors.aprovado },
  okLabel: { color: colors.aprovadoInk },
  warnBg: { backgroundColor: colors.corretorSoft, borderColor: colors.corretor },
  warnLabel: { color: colors.corretorInk },
  streakBg: { backgroundColor: colors.streakSoft, borderColor: colors.streak },
  streakLabel: { color: colors.streakInk },
})
