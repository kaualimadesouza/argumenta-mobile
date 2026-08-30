import { annotate } from './spans'
import type { AnnotationResponse } from '@/api/types'

describe('spans', () => {
  it('annotates simple text', () => {
    const text = 'hello world'
    const annotations: AnnotationResponse[] = [
      {
        span_start: 0,
        span_end: 5,
        type: 'spelling',
        severity: 'error',
        message: 'hello is wrong',
        suggestion: null,
        priority: 1,
      },
    ]

    const result = annotate(text, annotations)
    expect(result.segments).toEqual([
      { text: 'hello', annotation: annotations[0], mark: 1 },
      { text: ' world', annotation: null, mark: 0 },
    ])
  })

  it('handles overlapping spans by ignoring the second one', () => {
    const text = 'hello world'
    const annotations: AnnotationResponse[] = [
      { span_start: 0, span_end: 5, type: 'spelling', severity: 'error', message: 'a', suggestion: null, priority: 1 },
      { span_start: 3, span_end: 8, type: 'spelling', severity: 'error', message: 'b', suggestion: null, priority: 1 },
    ]

    const result = annotate(text, annotations)
    expect(result.segments).toHaveLength(2)
    expect(result.segments[0].text).toBe('hello')
  })

  it('respects utf-16 surrogate pairs and accents', () => {
    const text = 'açaí 🌍 e caju'
    // Characters:
    // 0: a
    // 1: ç
    // 2: a
    // 3: í
    // 4: ' '
    // 5: 🌍 (1 code point in Python, 2 utf-16 units)
    // 6: ' '
    // 7: e
    // 8: ' '
    // 9: c
    // 10: a
    // 11: j
    // 12: u
    // span_start = 9, span_end = 13 -> "caju"
    
    const annotations: AnnotationResponse[] = [
      {
        span_start: 9,
        span_end: 13,
        type: 'spelling',
        severity: 'error',
        message: 'caju is fine',
        suggestion: null,
        priority: 1,
      },
    ]

    const result = annotate(text, annotations)
    expect(result.segments).toEqual([
      { text: 'açaí 🌍 e ', annotation: null, mark: 0 },
      { text: 'caju', annotation: annotations[0], mark: 1 },
    ])
  })
})
