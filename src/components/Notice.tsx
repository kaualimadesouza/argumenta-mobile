import { StyleSheet, Text, View } from 'react-native'

import { colors, radius, typeScale } from '@/styles/tokens'

interface NoticeProps {
  tone?: 'error' | 'info' | 'success'
  children: string
}

export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      style={[styles.box, TONE_BOX[tone]]}
    >
      <Text style={[styles.text, TONE_TEXT[tone]]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.tile, padding: 12 },
  text: { fontSize: typeScale.meta },
})

const TONE_BOX = {
  error: { backgroundColor: colors.corretorSoft },
  info: { backgroundColor: colors.track },
  success: { backgroundColor: colors.aprovadoSoft },
}

const TONE_TEXT = {
  error: { color: colors.corretorInk },
  info: { color: colors.ink2 },
  success: { color: colors.aprovadoInk },
}
