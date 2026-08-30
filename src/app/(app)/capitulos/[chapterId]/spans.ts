import type { AnnotationResponse } from '@/api/types'

export interface AnnotatedSegment {
  text: string
  /** null on the untouched stretches between marks. */
  annotation: AnnotationResponse | null
  /** 1-based number shown in the text and in the legend; 0 when unmarked. */
  mark: number
}

export interface Mark {
  number: number
  annotation: AnnotationResponse
}

export interface AnnotatedText {
  segments: AnnotatedSegment[]
  marks: Mark[]
}

/** One number per correction, not per occurrence: the same rule on two words is
 *  one entry in the legend. */
function ruleOf(annotation: AnnotationResponse): string {
  return `${annotation.type}|${annotation.message}`
}

/** In document order, dropping what cannot be drawn: a span outside the text and
 *  a span that overlaps one already placed, which would scramble the paragraph. */
function placeable(length: number, annotations: AnnotationResponse[]): AnnotationResponse[] {
  const sorted = [...annotations].sort(
    (a, b) => a.span_start - b.span_start || a.span_end - b.span_end,
  )
  const placed: AnnotationResponse[] = []
  let reached = 0
  for (const annotation of sorted) {
    const { span_start: start, span_end: end } = annotation
    if (start < reached || start < 0 || end > length || start >= end) continue
    placed.push(annotation)
    reached = end
  }
  return placed
}

/** The API counts in code points, the way Python does, so the text is cut the
 *  same way: slicing UTF-16 units would shift every span after an astral
 *  character. Accented letters are one unit either way, emoji are not. */
export function annotate(body: string, annotations: AnnotationResponse[]): AnnotatedText {
  const chars = Array.from(body)
  const placed = placeable(chars.length, annotations)

  const numbers = new Map<string, number>()
  const marks: Mark[] = []
  const segments: AnnotatedSegment[] = []
  let cursor = 0

  function plain(text: string) {
    if (text !== '') segments.push({ text, annotation: null, mark: 0 })
  }

  for (const annotation of placed) {
    const rule = ruleOf(annotation)
    let number = numbers.get(rule)
    if (number === undefined) {
      number = numbers.size + 1
      numbers.set(rule, number)
      marks.push({ number, annotation })
    }
    plain(chars.slice(cursor, annotation.span_start).join(''))
    segments.push({
      text: chars.slice(annotation.span_start, annotation.span_end).join(''),
      annotation,
      mark: number,
    })
    cursor = annotation.span_end
  }
  plain(chars.slice(cursor).join(''))

  return { segments, marks }
}
