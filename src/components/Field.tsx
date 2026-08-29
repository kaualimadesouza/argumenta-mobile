import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native'

import { colors, fontFamily, radius, typeScale } from '@/styles/tokens'

interface FieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label: string
  hint?: string
}

export function Field({ label, hint, ...inputProps }: FieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={styles.input}
        placeholderTextColor={colors.muted}
        {...inputProps}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: typeScale.meta, color: colors.ink2, fontFamily: fontFamily.medium },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.tile,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typeScale.body,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  hint: { fontSize: typeScale.micro, color: colors.muted },
})
