import { useCallback, useState } from 'react'
import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, fontFamily, radius, tracking, typeScale } from '@/styles/tokens'
import { useApi } from '@/api/context'
import { useResource } from '@/api/useResource'
import { Loaded } from '@/api/Loaded'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { countWords } from '@/api/words'
import { awaitVerdict } from '@/api/verdict'
import { AUTOSAVE_LABEL, useAutosave } from './useAutosave'
import { useWritingSignals } from './useWritingSignals'
import { blockerOf } from './limits'
import type { ChapterResponse, TrackResponse, TelemetryEvent } from '@/api/types'

const EVALUATION_FAILED =
  'A correção falhou aqui do nosso lado. Seu envio de hoje foi devolvido, tente de novo.'

interface Desk {
  chapter: ChapterResponse
  track: TrackResponse
}

function Notice({ children, tone }: { children: string; tone: 'ok' | 'error' }) {
  const isError = tone === 'error'
  return (
    <View style={[styles.notice, isError ? styles.noticeError : styles.noticeOk]}>
      <Text style={[styles.noticeText, isError ? styles.noticeTextError : styles.noticeTextOk]}>
        {children}
      </Text>
    </View>
  )
}

function Writing({ chapter, track }: Desk) {
  const api = useApi()
  const router = useRouter()
  const signals = useWritingSignals()
  
  const [body, setBody] = useState(chapter.draft_body ?? '')
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const report = useCallback(
    (events: TelemetryEvent[]) => void api.telemetry({ events }).catch(() => undefined),
    [api],
  )
  
  const save = useCallback(
    (text: string) => api.draft(chapter.id, { body: text }),
    [api, chapter.id],
  )
  
  const autosave = useAutosave({ body, stored: chapter.draft_body ?? '', save })

  const words = countWords(body)
  const blocker = blockerOf(words, chapter, track)

  async function send() {
    setSending(true)
    setFailure(null)
    try {
      const pending = await api.submit(chapter.id, { body, ...signals.summary() })
      const typing = signals.typingEvent(pending.submission_id)
      if (typing !== null) report([typing])
      
      const outcome = await awaitVerdict(api, pending)
      
      if (outcome.status === 'failed') {
        setFailure(EVALUATION_FAILED)
        setSending(false)
        return
      }
      
      router.replace({
        pathname: '/capitulos/[chapterId]/correcao',
        params: { chapterId: chapter.id, submissionId: outcome.submission.submission_id },
      })
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error))
      setSending(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.flex1} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Button variant="ghost" onPress={() => router.back()}>
            ← Cena
          </Button>
          <Chip label={`${track.submissions_today}/${track.daily_limit} envios hoje`} />
        </View>

        <Text style={styles.title}>
          {`Convença ${chapter.antagonist_name}`}
        </Text>

        <View style={styles.card}>
          <Text style={styles.objective}>{chapter.objective}</Text>
        </View>

        <TextInput
          testID="editor-input"
          style={styles.editor}
          value={body}
          onChangeText={(newText) => {
            const pasted = signals.onChangeText(newText, body)
            if (pasted !== null) report([pasted])
            setBody(newText)
          }}
          onKeyPress={signals.onKeyPress}
          multiline
          placeholder={`Escreva para ${chapter.antagonist_name}.`}
          placeholderTextColor={colors.muted}
          textAlignVertical="top"
        />

        <View style={styles.foot}>
          <Text style={styles.metaText}>{`${words} / ${chapter.max_words} palavras`}</Text>
          <Text style={styles.metaText}>{AUTOSAVE_LABEL[autosave] ?? ''}</Text>
        </View>

        {sending ? (
          <Notice tone="ok">
            {`${chapter.antagonist_name} está lendo o seu texto. Isso pode levar um minuto.`}
          </Notice>
        ) : null}
        
        {failure !== null ? (
          <Notice tone="error">{failure}</Notice>
        ) : null}
        
        {blocker !== null ? (
          <Text style={styles.blocker}>{blocker}</Text>
        ) : null}

        <Button onPress={send} disabled={blocker !== null || sending}>
          {sending ? 'Corrigindo…' : 'Enviar'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default function EscreverScreen() {
  const api = useApi()
  const { chapterId = '' } = useLocalSearchParams<{ chapterId: string }>()
  
  const load = useCallback(async (): Promise<Desk> => {
    const [chapter, track] = await Promise.all([api.chapter(chapterId), api.track()])
    return { chapter, track }
  }, [api, chapterId])
  
  const { state, reload } = useResource(load)

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Loaded resource={state} onRetry={reload}>
        {(desk) => <Writing chapter={desk.chapter} track={desk.track} />}
      </Loaded>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: typeScale.title,
    letterSpacing: typeScale.title * tracking.title,
    color: colors.ink,
  },
  card: {
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  objective: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.body,
    letterSpacing: typeScale.body * tracking.body,
    color: colors.ink,
  },
  editor: {
    minHeight: 200,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  metaText: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.ink2,
  },
  blocker: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.meta,
    color: colors.corretorInk,
    textAlign: 'center',
  },
  notice: {
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  noticeOk: {
    backgroundColor: colors.aprovadoSoft,
    borderColor: colors.aprovado,
  },
  noticeError: {
    backgroundColor: colors.corretorSoft,
    borderColor: colors.corretor,
  },
  noticeText: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.body,
    textAlign: 'center',
  },
  noticeTextOk: {
    color: colors.aprovadoInk,
  },
  noticeTextError: {
    color: colors.corretorInk,
  },
})
