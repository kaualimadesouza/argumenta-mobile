import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

import { colors, fontFamily, radius, typeScale } from '@/styles/tokens'

interface ButtonProps {
  children: string
  onPress: () => void
  disabled?: boolean
  busy?: boolean
  variant?: 'primary' | 'ghost'
}

export function Button({ children, onPress, disabled, busy, variant = 'primary' }: ButtonProps) {
  const isDisabled = disabled === true || busy === true
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: busy === true }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.primary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={variant === 'primary' ? colors.card : colors.caneta} />
      ) : (
        <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{children}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.caneta },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.85 },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: typeScale.body,
    color: colors.card,
  },
  ghostLabel: { color: colors.caneta },
})
