import { useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Loaded } from '@/api/Loaded'
import { useApi } from '@/api/context'
import { messageFor } from '@/api/messages'
import type { ChapterResponse, ScoreResponse, SubmissionResponse } from '@/api/types'
import { useResource } from '@/api/useResource'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Notice } from '@/components/Notice'
import { ProgressBar } from '@/components/ProgressBar'
import { Beat } from '@/components/Beat'
import { colors, fontFamily, typeScale, radius, tracking } from "@/styles/tokens"

interface ConsequenciaHandoff {
  submission: SubmissionResponse
}

export default function ConsequenciaScreen() {
  const api = useApi()
  const router = useRouter()
  const { chapterId, submissionId } = useLocalSearchParams<{ chapterId: string; submissionId: string }>()
  
  const loadChapter = useCallback(() => api.chapter(chapterId), [api, chapterId])
  const { state: resource, reload } = useResource(loadChapter)

  const loadSubmission = useCallback(async () => {
    if (!submissionId) return null
    const s = await api.submission(submissionId)
    if (!s.result) return null
    return { ...s.result, submission_id: s.submission_id, attempt_number: s.attempt_number } as SubmissionResponse
  }, [api, submissionId])
  
  const { state: subResource, reload: reloadSub } = useResource(loadSubmission)

  return (
    <Loaded resource={resource} onRetry={reload}>
      {(chapter) => {
        if (chapter.status !== 'in_consequence') {
          router.replace(`/capitulos/${chapter.id}`)
          return null
        }
        
        return (
          <Loaded resource={subResource} onRetry={reloadSub}>
            {(submission) => <Scene chapter={chapter} submission={submission} />}
          </Loaded>
        )
      }}
    </Loaded>
  )
}

function Scene({
  chapter,
  submission,
}: {
  chapter: ChapterResponse
  submission: SubmissionResponse | null
}) {
  const router = useRouter()
  const persuasion = submission?.scores.find((score) => score.dimension === 'persuasao') ?? null

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.bar}>
        <Text onPress={() => router.replace('/trilha')} style={styles.back} accessibilityRole="button">
          ← Trilha
        </Text>
        <Chip tone="warn">Não convenceu</Chip>
      </View>

      <View style={styles.beats}>
        {chapter.beats.map((beat, index) => (
          <Beat key={index} beat={beat} />
        ))}
      </View>

      {persuasion === null || submission === null ? null : (
        <Stalled score={persuasion} floor={submission.floor_value} />
      )}

      <Recovery chapter={chapter} />
    </ScrollView>
  )
}

function Stalled({ score, floor }: { score: ScoreResponse; floor: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Onde o argumento parou</Text>
      <View style={styles.row}>
        <View style={styles.rowHead}>
          <Text style={styles.label}>Persuasão</Text>
          <Text style={styles.score}>{`${score.score}/100`}</Text>
        </View>
        <ProgressBar percent={score.score} floor={floor} tone="streak" label="Persuasão" />
      </View>
      <Text style={styles.evidence}>{score.evidence}</Text>
    </View>
  )
}

function Recovery({ chapter }: { chapter: ChapterResponse }) {
  const api = useApi()
  const router = useRouter()
  const [starting, setStarting] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function start() {
    setStarting(true)
    setFailure(null)
    try {
      await api.startRecovery(chapter.id)
      router.replace(`/capitulos/${chapter.id}`)
    } catch (error) {
      setFailure(messageFor(error))
      setStarting(false)
    }
  }

  return (
    <View style={styles.recovery}>
      {failure === null ? null : <Notice tone="error">{failure}</Notice>}
      <Button onPress={() => void start()} disabled={starting}>
        {starting ? 'Abrindo…' : `Encarar ${chapter.antagonist_name} de novo`}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.noite,
    padding: 16,
    gap: 32,
    paddingBottom: 48,
    minHeight: '100%',
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.luzMuted,
  },
  beats: {
    gap: 32,
  },
  card: {
    backgroundColor: colors.noiteInner,
    borderRadius: radius.card,
    padding: 16,
    gap: 16,
  },
  cardTitle: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.luz,
  },
  row: {
    gap: 4,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.luz,
  },
  score: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    fontWeight: 'bold',
    color: colors.luz,
  },
  evidence: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.body,
    color: colors.luzMuted,
    
  },
  recovery: {
    gap: 16,
  },
})
