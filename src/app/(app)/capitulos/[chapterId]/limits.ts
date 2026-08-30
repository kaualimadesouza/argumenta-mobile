import type { ChapterResponse, TrackResponse } from '@/api/types'
import { MESSAGES } from '@/api/messages'

function palavras(count: number): string {
  return count === 1 ? '1 palavra' : `${count} palavras`
}

/** Why the student cannot send yet, in their own words; null when they can. The
 *  same three rules the API enforces, said before the request. */
export function blockerOf(
  words: number,
  chapter: ChapterResponse,
  track: TrackResponse,
): string | null {
  if (track.submissions_today >= track.daily_limit) return MESSAGES.DailyLimitReachedError
  if (words < chapter.min_words) {
    const missing = chapter.min_words - words
    return `${missing === 1 ? 'Falta' : 'Faltam'} ${palavras(missing)} para o mínimo do capítulo.`
  }
  if (words > chapter.max_words) {
    return `${palavras(words - chapter.max_words)} acima do limite. Corte antes de enviar.`
  }
  return null
}
