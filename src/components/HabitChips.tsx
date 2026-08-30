import { View, Text, StyleSheet } from 'react-native'

import type { HabitSummary } from '@/api/types'
import { Chip } from './Chip'
import { fontFamily, typeScale, tracking } from '@/styles/tokens'

interface HabitChipsProps {
  habit: HabitSummary
}

export function HabitChips({ habit }: HabitChipsProps) {
  return (
    <View style={styles.container}>
      {habit.streak_days > 0 ? (
        <Chip tone="streak">
          <Text style={styles.text}>
            <Text style={styles.number}>{habit.streak_days}</Text>
            {` ${habit.streak_days === 1 ? 'dia' : 'dias'}`}
          </Text>
        </Chip>
      ) : null}
      <Chip>
        <Text style={styles.text}>
          <Text style={styles.number}>{`${habit.submissions_today}/${habit.daily_limit}`}</Text>
          {' envios hoje'}
        </Text>
      </Chip>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    fontSize: typeScale.meta,
    fontFamily: fontFamily.medium,
  },
  number: {
    fontVariant: ['tabular-nums'],
    fontFamily: fontFamily.semiBold,
    fontSize: typeScale.meta,
    letterSpacing: typeScale.meta * tracking.meta,
  },
})
