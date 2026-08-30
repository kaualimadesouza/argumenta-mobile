import { View, Text, StyleSheet } from 'react-native'
import type { LensCriterionResponse, LensResponse } from '@/api/types'
import { ProgressBar } from '@/components/ProgressBar'
import { colors, fontFamily, typeScale, radius, tracking } from "@/styles/tokens"

export function Scoreboard({ lens, floor }: { lens: LensResponse; floor: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Placar</Text>
      <View style={styles.rows}>
        {lens.criteria.map((criterion) => (
          <Criterion key={criterion.code} criterion={criterion} floor={floor} />
        ))}
      </View>
      {lens.total === null || lens.total_max === null ? null : (
        <View style={styles.total}>
          <View style={styles.totalText}>
            <Text style={styles.totalLabel}>Soma dos critérios</Text>
            {lens.scale_source === 'argumenta' ? (
              <Text style={styles.disclaimer}>
                Estimativa Argumenta, não é nota oficial do vestibular
              </Text>
            ) : null}
          </View>
          <Text style={styles.totalScore}>{`${lens.total}/${lens.total_max}`}</Text>
        </View>
      )}
    </View>
  )
}

function percentOf(criterion: LensCriterionResponse): number {
  return Math.round((criterion.score / criterion.scale_max) * 100)
}

function Criterion({
  criterion,
  floor,
}: {
  criterion: LensCriterionResponse
  floor: number
}) {
  const percent = percentOf(criterion)
  const below = percent < floor
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={styles.code}>{criterion.code}</Text>
        <Text style={below ? styles.labelBelow : styles.label}>{criterion.label}</Text>
        {criterion.is_argumenta_extra ? (
          <Text style={styles.extra}>critério Argumenta</Text>
        ) : null}
        <View style={{ flex: 1 }} />
        <Text style={below ? styles.scoreBelow : styles.score}>
          {`${criterion.score}/${criterion.scale_max}`}
        </Text>
      </View>
      <ProgressBar
        percent={percent}
        floor={floor}
        tone={below ? 'alert' : 'caneta'}
        label={below ? `${criterion.label}, abaixo do piso` : criterion.label}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    gap: 16,
  },
  cardTitle: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.ink,
  },
  rows: {
    gap: 16,
  },
  row: {
    gap: 4,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  code: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    fontWeight: 'bold',
    color: colors.ink,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.ink,
  },
  labelBelow: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.corretor,
  },
  extra: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.micro,
    backgroundColor: colors.caneta,
    color: colors.card,
    paddingHorizontal: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  score: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    fontWeight: 'bold',
    color: colors.ink,
  },
  scoreBelow: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    fontWeight: 'bold',
    color: colors.corretor,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.ink + '20', // 20 hex = 12% opacity roughly, actually let's use rgba if needed, but tokens don't have rgba. Let's just use string concat if it works, or just a solid color.
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  totalText: {
    flex: 1,
    paddingRight: 8,
  },
  totalLabel: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    fontWeight: 'bold',
    color: colors.ink,
  },
  disclaimer: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.micro,
    color: colors.ink,
    opacity: 0.6,
  },
  totalScore: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.title,
    color: colors.ink,
  },
})
