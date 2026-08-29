import { StyleSheet, Text, View } from 'react-native'

import { colors, typeScale } from '@/styles/tokens'

import { Button } from './Button'

/** Whole-screen states of anything that has to ask the API first. */
export function LoadingPanel() {
  return (
    <View style={styles.panel}>
      <Text accessibilityRole="text" style={styles.text}>
        Carregando…
      </Text>
    </View>
  )
}

interface RetryPanelProps {
  message: string
  onRetry: () => void
}

export function RetryPanel({ message, onRetry }: RetryPanelProps) {
  return (
    <View style={styles.panel}>
      <Text accessibilityRole="alert" style={styles.text}>
        {message}
      </Text>
      <Button variant="ghost" onPress={onRetry}>
        Tentar de novo
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.paper,
  },
  text: { fontSize: typeScale.body, color: colors.ink2, textAlign: 'center' },
})
