import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

import type { StoryState } from '@/api/types'
import { colors, radius, fontFamily, typeScale, tracking } from '@/styles/tokens'

interface StoryCoverProps {
  position: number
  state: StoryState
}

const DONE = (
  <Svg viewBox="0 0 24 24" fill="none" width={24} height={24}>
    <Path
      d="m5.5 12.4 4.2 4.1L18.5 7.6"
      stroke={colors.card}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const LOCKED = (
  <Svg viewBox="0 0 24 24" fill="none" width={24} height={24}>
    <Rect
      x="4.8"
      y="10.6"
      width="14.4"
      height="9.4"
      rx="2.6"
      stroke={colors.disabled}
      strokeWidth="1.75"
    />
    <Path d="M8.6 10.6V7.9a3.4 3.4 0 0 1 6.8 0v2.7" stroke={colors.disabled} strokeWidth="1.75" />
  </Svg>
)

export function StoryCover({ position, state }: StoryCoverProps) {
  if (state === 'completed') {
    return (
      <View style={[styles.cover, styles.done]} accessible={false}>
        {DONE}
      </View>
    )
  }
  if (state === 'locked') {
    return (
      <View style={[styles.cover, styles.locked]} accessible={false}>
        {LOCKED}
      </View>
    )
  }
  return (
    <View style={styles.cover} accessible={false}>
      <Text style={styles.position}>{position}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cover: {
    width: 64,
    height: 64,
    borderRadius: radius.tile,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    backgroundColor: colors.aprovado,
  },
  locked: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  position: {
    fontFamily: fontFamily.bold,
    fontSize: typeScale.display,
    color: colors.ink,
    letterSpacing: typeScale.display * tracking.title,
    fontVariant: ['tabular-nums'],
  },
})
