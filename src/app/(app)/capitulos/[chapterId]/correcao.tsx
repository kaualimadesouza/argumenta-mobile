import { useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Loaded } from '@/api/Loaded'
import { useApi } from '@/api/context'
import type {
  AnnotationResponse,
  ChapterResponse,
  ReactionResponse,
  SubmissionResponse,
} from '@/api/types'
import { useResource } from '@/api/useResource'
import { Button } from '@/components/Button'
import { Reaction } from '@/components/Reaction'
import { colors, fontFamily, typeScale, radius, tracking } from "@/styles/tokens"
import { Legend, MarkedText } from './MarkedText'
import { Scoreboard } from './Scoreboard'
import { annotate } from './spans'

export interface CorrecaoHandoff {
  submission: SubmissionResponse
  body: string
}

function isHandoff(state: unknown): state is CorrecaoHandoff {
  if (state === null || typeof state !== 'object') return false
  const candidate = state as Partial<CorrecaoHandoff>
  return typeof candidate.body === 'string' && typeof candidate.submission?.verdict === 'string'
}

interface Judged {
  chapter: ChapterResponse
  reaction: ReactionResponse | null
}

export default function CorrecaoScreen() {
  const { chapterId, submissionId } = useLocalSearchParams<{ chapterId: string; submissionId: string }>()
  
  // In Expo Router we don't have location.state easily like in react-router-dom,
  // but wait: we do have it via router.push({ pathname, params }) ? 
  // No, `params` is flattened to strings. We can't pass a complex object via URL params.
  // Oh, wait! The web `Correcao` uses `useLocation().state`.
  // In React Native, the handoff can't be passed via `router.push(..., { state })` easily unless we use Expo Router's experimental support for objects or we just fetch it.
  // Wait, the test for card #4 did:
  // mockRouter.replace({ pathname: '/capitulos/[chapterId]/correcao', params: { chapterId: 'cap-1', submissionId: 'sub-1' } })
  // We can just fetch it! `RecoverHandoff` already exists in web to do exactly this.
  
  return <RecoverHandoff chapterId={chapterId} submissionId={submissionId} />
}

function RecoverHandoff({ chapterId, submissionId }: { chapterId: string; submissionId?: string }) {
  const api = useApi()
  const router = useRouter()
  
  const load = useCallback(async () => {
    const [submission, chapter] = await Promise.all([
      submissionId ? api.submission(submissionId).then(s => ({ ...s.result!, submission_id: s.submission_id, attempt_number: s.attempt_number })) : Promise.resolve(null),
      api.chapter(chapterId),
    ])
    // The web casts submission.result to SubmissionResponse if needed. 
    // Here we assume `api.latestSubmission` or the extracted submission is right.
    // Let's use `api.submission(submissionId)` as fallback.
    // Wait, argumenta-api has `latestSubmission`? No! Card #4 only added `submission(id)`.
    // Let's just use `submissionId`! If missing, error.
    if (!submission || !chapter.draft_body) return null
    return { submission, body: chapter.draft_body } as CorrecaoHandoff
  }, [api, chapterId, submissionId])
  
  const { state, reload } = useResource(load)

  return (
    <Loaded resource={state} onRetry={reload}>
      {(handoff) => {
        if (!handoff) {
          router.replace(`/capitulos/${chapterId}`)
          return null
        }
        return <Loading chapterId={chapterId} handoff={handoff} />
      }}
    </Loaded>
  )
}

function Loading({ chapterId, handoff }: { chapterId: string; handoff: CorrecaoHandoff }) {
  const api = useApi()
  const { submission } = handoff
  const load = useCallback(async (): Promise<Judged> => {
    const line =
      submission.verdict === 'failed_technical'
        ? null
        : await api.reaction(submission.submission_id).catch(() => null)
    return { chapter: await api.chapter(chapterId), reaction: line }
  }, [api, chapterId, submission])
  
  const { state, reload } = useResource(load)

  return (
    <Loaded resource={state} onRetry={reload}>
      {(judged) => <Sheet handoff={handoff} judged={judged} />}
    </Loaded>
  )
}

interface Headline {
  title: string
  line: string
  tone: 'ok' | 'alert' | 'warn'
}

function errorCount(annotations: AnnotationResponse[]): number {
  return annotations.filter((annotation) => annotation.severity === 'error').length
}

function headlineFor(submission: SubmissionResponse, antagonist: string): Headline {
  if (submission.verdict === 'approved') {
    return {
      title: 'Você convenceu.',
      line: `${antagonist} aceitou o seu argumento. Este capítulo está vencido.`,
      tone: 'ok',
    }
  }
  if (submission.verdict === 'failed_persuasion') {
    return {
      title: 'Ele ainda não se move.',
      line: `Você sustentou a sua tese, mas ela não respondeu ao que ${antagonist} mede. Veja o que aconteceu e prepare a próxima tentativa.`,
      tone: 'warn',
    }
  }
  const errors = errorCount(submission.annotations)
  const many = errors !== 1
  return {
    title: 'Quase. A norma culta segurou você.',
    line: `O argumento convence ${antagonist}, mas ${errors} ${many ? 'desvios' : 'desvio'} de escrita ${many ? 'derrubaram' : 'derrubou'} a nota abaixo do piso. Corrija e reenvie: a história continua esperando.`,
    tone: 'alert',
  }
}

function Sheet({ handoff, judged }: { handoff: CorrecaoHandoff; judged: Judged }) {
  const { submission, body } = handoff
  const { chapter, reaction } = judged
  const headline = headlineFor(submission, chapter.antagonist_name)
  const { segments, marks } = annotate(body, submission.annotations)

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.bar}>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Text style={styles.attempt}>{`Tentativa ${submission.attempt_number}`}</Text>
      </View>

      <View style={[styles.headline, headlineStyles[headline.tone]]}>
        <Text style={[styles.headlineTitle, headlineTitleStyles[headline.tone]]}>{headline.title}</Text>
        <Text style={styles.headlineLine}>{headline.line}</Text>
      </View>

      {reaction === null ? null : (
        <View style={styles.reaction}>
          <Reaction reaction={reaction} />
        </View>
      )}

      <Scoreboard lens={submission.lens} floor={submission.floor_value} />

      <MarkedText segments={segments} />

      {marks.length === 0 ? null : <Legend marks={marks} />}

      {submission.para_passar.length === 0 ? null : (
        <ParaPassar priorities={submission.para_passar} />
      )}

      <Actions submission={submission} chapterId={chapter.id} />
    </ScrollView>
  )
}

function ParaPassar({ priorities }: { priorities: AnnotationResponse[] }) {
  const ordered = [...priorities].sort((a, b) => a.priority - b.priority)
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Para passar</Text>
      <View style={styles.steps}>
        {ordered.map((priority, index) => (
          <View key={index} style={styles.step}>
            <Text style={styles.arrow} aria-hidden={true}>→</Text>
            <Text style={styles.stepText}>{priority.message}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function Actions({
  submission,
  chapterId,
}: {
  submission: SubmissionResponse
  chapterId: string
}) {
  const router = useRouter()
  const { verdict } = submission

  if (verdict === 'approved') {
    return (
      <View style={styles.actions}>
        <Button onPress={() => router.replace('/trilha')}>Continuar a história</Button>
      </View>
    )
  }
  if (verdict === 'failed_persuasion') {
    return (
      <View style={styles.actions}>
        <Button onPress={() => router.replace({ pathname: `/capitulos/${chapterId}/consequencia`, params: { submissionId: submission.submission_id } })}>
          Ver o que aconteceu
        </Button>
      </View>
    )
  }
  return (
    <View style={styles.actions}>
      <Button onPress={() => router.replace(`/capitulos/${chapterId}/escrever`)}>Revisar meu texto</Button>
      <Button variant="ghost" onPress={() => router.replace(`/capitulos/${chapterId}`)}>
        Rever a cena
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    gap: 32,
    paddingBottom: 48,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    textTransform: 'uppercase',
    color: colors.ink,
    opacity: 0.6,
  },
  attempt: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.ink,
    opacity: 0.6,
  },
  headline: {
    padding: 16,
    borderRadius: radius.card,
    gap: 4,
  },
  headlineTitle: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.title,
    color: colors.ink, // overridden by variants
  },
  headlineLine: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  reaction: {
    // optional styling for reaction container
  },
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
  steps: {
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
  },
  arrow: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.caneta,
  },
  stepText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  actions: {
    gap: 8,
  },
})

const headlineStyles = StyleSheet.create({
  ok: {
    backgroundColor: colors.aprovadoSoft,
  },
  alert: {
    backgroundColor: colors.corretorSoft,
  },
  warn: {
    backgroundColor: colors.canetaSoft,
  },
})

const headlineTitleStyles = StyleSheet.create({
  ok: { color: colors.aprovado },
  alert: { color: colors.corretor },
  warn: { color: colors.caneta },
})
