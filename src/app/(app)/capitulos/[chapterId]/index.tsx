import { useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, fontFamily, radius, tracking, typeScale } from '@/styles/tokens'
import { useApi } from '@/api/context'
import { useResource } from '@/api/useResource'
import { Loaded } from '@/api/Loaded'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Beat } from '@/components/Beat'
import type { ChapterStatus } from '@/api/types'

const WRITABLE: ChapterStatus[] = ['available', 'drafting', 'in_recovery']

export default function CenaScreen() {
  const api = useApi()
  const router = useRouter()
  const { chapterId = '' } = useLocalSearchParams<{ chapterId: string }>()
  const { state, reload } = useResource(useCallback(() => api.chapter(chapterId), [api, chapterId]))

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Loaded resource={state} onRetry={reload}>
        {(chapter) => (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={chapter.beats}
            keyExtractor={(_, index) => String(index)}
            renderItem={({ item, index }) => <Beat beat={item} index={index} />}
            ListHeaderComponent={
              <View style={styles.header}>
                <Button variant="ghost" onPress={() => router.push('/trilha')}>
                  ← Trilha
                </Button>
                <Chip label={`Cap. ${chapter.position}`} />
              </View>
            }
            ListFooterComponent={
              <View style={styles.footer}>
                {chapter.status === 'passed' ? (
                  <Text style={styles.done}>Você já venceu este capítulo.</Text>
                ) : null}
                {WRITABLE.includes(chapter.status) ? (
                  <Button
                    onPress={() => router.push(`/capitulos/${chapter.id}/escrever`)}
                  >
                    Argumentar
                  </Button>
                ) : null}
              </View>
            }
          />
        )}
      </Loaded>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
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
  footer: {
    marginTop: 24,
    gap: 16,
  },
  done: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.body,
    color: colors.aprovadoInk,
    textAlign: 'center',
  },
})
