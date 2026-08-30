import { View, StyleSheet, ViewStyle } from 'react-native'

import { colors, radius } from '@/styles/tokens'

export type BarTone = 'caneta' | 'alert' | 'streak'

interface ProgressBarProps {
  percent: number
  label: string
  done?: boolean
  floor?: number
  tone?: BarTone
}

export function ProgressBar({
  percent,
  label,
  done = false,
  floor,
  tone = 'caneta',
}: ProgressBarProps) {
  let backgroundColor = colors.caneta
  if (done) {
    backgroundColor = colors.aprovado
  } else if (tone === 'alert') {
    backgroundColor = colors.corretor
  } else if (tone === 'streak') {
    backgroundColor = colors.streak
  }

  const fillStyle: ViewStyle = {
    ...styles.fill,
    backgroundColor,
    width: `${percent}%`,
  }

  return (
    <View style={styles.track} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ now: percent, min: 0, max: 100 }}>
      <View style={fillStyle} />
      {floor !== undefined && (
        <View style={[styles.floor, { left: `${floor}%` }]} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.track,
    borderRadius: radius.chip,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: radius.chip,
  },
  floor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.ink,
    opacity: 0.35,
  },
})
