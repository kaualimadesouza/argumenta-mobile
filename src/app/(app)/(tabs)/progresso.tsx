import { useCallback, useId } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import Svg, { Polyline } from 'react-native-svg'

import { Loaded } from '@/api/Loaded'
import { useApi } from '@/api/context'
import type { DimensionTrendResponse, ProgressResponse, Dimension, Milestone } from '@/api/types'
import { useResource } from '@/api/useResource'
import { DIMENSION_LABEL, EXAM_LABEL, MILESTONE_LABEL } from '@/copy/labels'
import { sparklineOf, streakWeek } from './series'
import { colors, radius, typeScale, fontFamily } from '@/styles/tokens'

const SPARK = { width: 120, height: 26 }

export default function Progresso() {
  const api = useApi()
  const { state, reload } = useResource(useCallback(() => api.progress(), [api]))

  return (
    <Loaded resource={state} onRetry={reload}>
      {(progress) => (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
          <View style={styles.bar}>
            <Text style={styles.title}>Progresso</Text>
            <Text style={styles.lens}>{`Lente ${EXAM_LABEL[progress.exam]}`}</Text>
          </View>
          <Streak progress={progress} />
          <Trends dimensions={progress.dimensions} />
          <Milestones progress={progress} />
        </ScrollView>
      )}
    </Loaded>
  )
}

function Streak({ progress }: { progress: ProgressResponse }) {
  const wroteToday = progress.submissions_today > 0
  const week = streakWeek(progress.streak_days, wroteToday, new Date())
  const days = progress.streak_days === 1 ? '1 dia seguido' : `${progress.streak_days} dias seguidos`

  return (
    <View style={styles.card}>
      <View style={styles.streakHead}>
        <Text style={styles.streakDays}>{days}</Text>
        <Text style={styles.record}>{`Seu recorde é ${progress.longest_streak_days} dias`}</Text>
      </View>
      <View style={styles.week}  accessibilityLabel="Seus últimos 7 dias">
        {week.map((day: { label: string; done: boolean; today: boolean }, index: number) => (
          <View
            key={index}
            style={styles.day}
            
            accessibilityLabel={`${day.label}, ${day.done ? 'escreveu' : 'não escreveu'}`}
          >
            <Text style={[styles.dayLabel, day.today && styles.dayLabelToday]} aria-hidden={true}>
              {day.label}
            </Text>
            <View
              style={[
                styles.box,
                day.done && styles.boxDone,
                day.today && styles.boxToday,
              ]}
              aria-hidden={true}
            />
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        {wroteToday
          ? 'Escreveu hoje. Volte amanhã para não zerar a sequência.'
          : 'Você ainda não escreveu hoje. Um envio mantém a sequência de pé.'}
      </Text>
    </View>
  )
}

function deltaLabel(delta: number): string | null {
  if (delta === 0) return null
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`
}

function Trends({ dimensions }: { dimensions: DimensionTrendResponse[] }) {
  const window = Math.max(0, ...dimensions.map((trend) => trend.points.length))

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>Como cada competência anda</Text>
        <Text style={styles.cardNote}>
          {window === 0
            ? 'Nenhum envio corrigido ainda'
            : `Últimos ${window} dias com envio · escala 0 a 100`}
        </Text>
      </View>
      <View style={styles.trends} >
        {dimensions.map((trend) => (
          <Trend key={trend.dimension} trend={trend} />
        ))}
      </View>
    </View>
  )
}

function Trend({ trend }: { trend: DimensionTrendResponse }) {
  const line = sparklineOf(trend.points, SPARK)
  const label = trend.criterion_label ?? DIMENSION_LABEL[trend.dimension as Dimension]
  const delta = line === null ? null : deltaLabel(line.delta)

  return (
    <View style={styles.trend} >
      <View style={styles.trendLabelContainer}>
        {trend.criterion_code !== null && (
          <Text style={styles.code}>{trend.criterion_code}</Text>
        )}
        <Text style={styles.dimension}>{label}</Text>
      </View>
      
      {line === null ? (
        <Text style={styles.pending}>sem envio ainda</Text>
      ) : (
        <View style={styles.trendData}>
          <Svg
            style={styles.spark}
            viewBox={`0 0 ${SPARK.width} ${SPARK.height}`}
            width={SPARK.width}
            height={SPARK.height}
            aria-hidden={true}
          >
            <Polyline
              points={line.points}
              fill="none"
              stroke={line.delta < 0 ? colors.corretor : colors.caneta}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.latest}>{line.latest}</Text>
          {delta !== null && (
            <Text style={line.delta < 0 ? styles.deltaDown : styles.deltaUp}>{delta}</Text>
          )}
        </View>
      )}
    </View>
  )
}

function Milestones({ progress }: { progress: ProgressResponse }) {
  const stories = `${progress.stories_completed} de ${progress.stories_total} histórias concluídas`
  const storiesDone = progress.stories_completed === progress.stories_total

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Marcos</Text>
      <View style={styles.milestones} >
        <MilestoneItem label={stories} done={storiesDone} />
        {progress.milestones.map((milestone) => (
          <MilestoneItem
            key={milestone.code}
            label={MILESTONE_LABEL[milestone.code as Milestone]}
            done={milestone.done}
          />
        ))}
      </View>
    </View>
  )
}

function MilestoneItem({ label, done }: { label: string; done: boolean }) {
  return (
    <View
      style={[styles.milestone, !done && styles.milestonePendingRow]}
      
      accessibilityLabel={`${label}, ${done ? 'concluído' : 'ainda não'}`}
    >
      <View style={[styles.tick, done ? styles.tickDone : styles.tickPending]} aria-hidden={true} />
      <Text style={[styles.milestoneLabel, !done && styles.milestoneLabelPending]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.title,
    color: colors.ink,
  },
  lens: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.meta,
    color: colors.caneta,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: 16,
    gap: 16,
  },
  streakHead: {
    gap: 4,
  },
  streakDays: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.ink,
  },
  record: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.muted,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  day: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.muted,
  },
  dayLabelToday: {
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },
  box: {
    width: 32,
    height: 32,
    borderRadius: radius.tile,
    backgroundColor: colors.track,
  },
  boxDone: {
    backgroundColor: colors.caneta,
  },
  boxToday: {
    borderWidth: 2,
    borderColor: colors.lineStrong,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    lineHeight: typeScale.body * 1.5,
    color: colors.muted,
  },
  cardHead: {
    gap: 4,
  },
  cardTitle: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.ink,
  },
  cardNote: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.muted,
  },
  trends: {
    gap: 16,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  code: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.meta,
    color: colors.ink,
    backgroundColor: colors.track,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.tile,
  },
  dimension: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  trendData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spark: {
    width: SPARK.width,
    height: SPARK.height,
  },
  pending: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.muted,
    fontStyle: 'italic',
  },
  latest: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.body,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    width: 36,
    textAlign: 'right',
  },
  deltaUp: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.meta,
    color: colors.caneta,
    fontVariant: ['tabular-nums'],
    width: 32,
    textAlign: 'right',
  },
  deltaDown: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.meta,
    color: colors.corretor,
    fontVariant: ['tabular-nums'],
    width: 32,
    textAlign: 'right',
  },
  milestones: {
    gap: 12,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestonePendingRow: {
    opacity: 0.5,
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tickDone: {
    backgroundColor: colors.caneta,
  },
  tickPending: {
    backgroundColor: colors.track,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  milestoneLabel: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  milestoneLabelPending: {
    color: colors.muted,
  },
})
