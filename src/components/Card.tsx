import { View, StyleSheet, type ViewProps } from 'react-native'

import { colors, radius } from '@/styles/tokens'

interface CardProps extends ViewProps {
  active?: boolean
}

export function Card({ active = false, style, children, ...props }: CardProps) {
  return (
    <View style={[styles.card, active && styles.active, style]} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  active: {
    borderWidth: 1.5,
    borderColor: colors.caneta,
  },
})
