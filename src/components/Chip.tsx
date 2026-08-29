import { Pressable, StyleSheet, Text } from 'react-native'

import { colors, fontFamily, radius, typeScale } from '@/styles/tokens'

interface ChipProps {
  label: string
  selected?: boolean
  onPress: () => void
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
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
  },
  selected: { backgroundColor: colors.canetaSoft, borderColor: colors.caneta },
  label: { fontSize: typeScale.meta, color: colors.ink2, fontFamily: fontFamily.medium },
  selectedLabel: { color: colors.caneta },
})
