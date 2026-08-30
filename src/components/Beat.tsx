import { StyleSheet, Text, View, Image } from 'react-native'
import { colors, fontFamily, radius, tracking, typeScale } from '@/styles/tokens'
import type { BeatResponse, BeatType } from '@/api/types'

const CARD_LABEL: Partial<Record<BeatType, string>> = {
  objective: 'Seu objetivo',
  hint: 'Dica de repertório',
}

export function Beat({ beat, index = 0 }: { beat: BeatResponse; index?: number }) {
  const label = CARD_LABEL[beat.beat_type]

  if (label !== undefined) {
    const isHint = beat.beat_type === 'hint'
    return (
      <View style={[styles.beatCard, !isHint && styles.beatCardObjective]}>
        <Text style={[styles.kicker, isHint ? styles.kickerHint : styles.kickerObjective]}>
          {label}
        </Text>
        <Text style={styles.cardBody}>{beat.body}</Text>
      </View>
    )
  }

  if (beat.beat_type === 'dialogue') {
    const who = beat.character_name ?? ''
    return (
      <View style={styles.dialogueRow}>
        {beat.character_portrait ? (
          <Image source={{ uri: beat.character_portrait }} style={styles.portrait} />
        ) : (
          <View style={styles.portraitPlaceholder} />
        )}
        <View style={styles.speechContainer}>
          <Text style={styles.who}>{who}</Text>
          <Text style={styles.speech}>{beat.body}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.narrationPanel} testID={`beat-narration-${index}`}>
      <Text style={styles.narrationText}>{beat.body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  narrationPanel: {
    backgroundColor: colors.noite,
    padding: 24,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.noiteInner,
  },
  narrationText: {
    color: colors.luz,
    fontFamily: fontFamily.regular,
    fontSize: typeScale.lead,
    letterSpacing: typeScale.lead * tracking.lead,
    lineHeight: typeScale.lead * 1.5,
  },
  beatCard: {
    padding: 24,
    borderRadius: radius.card,
    backgroundColor: colors.streakSoft,
    borderWidth: 1,
    borderColor: colors.streak,
    gap: 8,
  },
  beatCardObjective: {
    backgroundColor: colors.canetaSoft,
    borderColor: colors.caneta,
  },
  kicker: {
    fontFamily: fontFamily.bold,
    fontSize: typeScale.meta,
    letterSpacing: typeScale.meta * tracking.meta,
  },
  kickerHint: {
    color: colors.streakInk,
  },
  kickerObjective: {
    color: colors.caneta,
  },
  cardBody: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    letterSpacing: typeScale.body * tracking.body,
    color: colors.ink,
    lineHeight: typeScale.body * 1.5,
  },
  dialogueRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 8,
  },
  portrait: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  portraitPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lineStrong,
  },
  speechContainer: {
    flex: 1,
    gap: 4,
  },
  who: {
    fontFamily: fontFamily.semiBold,
    fontSize: typeScale.meta,
    letterSpacing: typeScale.meta * tracking.meta,
    color: colors.ink2,
  },
  speech: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.lead,
    letterSpacing: typeScale.lead * tracking.lead,
    color: colors.ink,
    lineHeight: typeScale.lead * 1.4,
  },
})
