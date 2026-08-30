import { useCallback, useRef } from 'react'
import type { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'

import type { PasteEvent, TypingStatsEvent } from '@/api/types'
import { countWords } from '@/api/words'

const IDLE_GAP_MS = 60_000

interface Tally {
  keystrokes: number
  backspaces: number
  typingMs: number
  lastKeyAt: number | null
  pastes: number
}

export interface WritingSignals {
  onKeyPress: (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void
  onChangeText: (newText: string, oldText: string) => PasteEvent | null
  summary: () => { typing_ms: number; paste_count: number }
  typingEvent: (submissionId: string) => TypingStatsEvent | null
}

export function useWritingSignals(): WritingSignals {
  const tally = useRef<Tally>({
    keystrokes: 0,
    backspaces: 0,
    typingMs: 0,
    lastKeyAt: null,
    pastes: 0,
  })

  const onKeyPress = useCallback((event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const current = tally.current
    const now = Date.now()
    const gap = current.lastKeyAt === null ? null : now - current.lastKeyAt
    if (gap !== null && gap <= IDLE_GAP_MS) current.typingMs += gap
    current.lastKeyAt = now
    current.keystrokes += 1
    if (event.nativeEvent.key === 'Backspace') current.backspaces += 1
  }, [])

  const onChangeText = useCallback((newText: string, oldText: string) => {
    const delta = newText.length - oldText.length
    // In React Native, we infer a paste when many characters appear at once.
    // > 3 helps distinguish from predictive text, though imperfect.
    if (delta > 3) {
      tally.current.pastes += 1
      const pastedChars = delta
      const wordsAdded = countWords(newText) - countWords(oldText)
      return {
        event_type: 'paste' as const,
        occurred_at: new Date().toISOString(),
        chars: pastedChars,
        words: Math.max(0, wordsAdded),
      }
    }
    return null
  }, [])

  const summary = useCallback(
    () => ({ typing_ms: tally.current.typingMs, paste_count: tally.current.pastes }),
    [],
  )

  const typingEvent = useCallback((submissionId: string) => {
    const current = tally.current
    if (current.keystrokes === 0) return null
    return {
      event_type: 'typing_stats' as const,
      occurred_at: new Date().toISOString(),
      submission_id: submissionId,
      ms: current.typingMs,
      keystrokes: current.keystrokes,
      backspaces: current.backspaces,
    }
  }, [])

  return { onKeyPress, onChangeText, summary, typingEvent }
}
