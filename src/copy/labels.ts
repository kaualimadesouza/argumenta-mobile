import type { Exam } from '@/api/types'

/** pt-BR display copy for the API enums. The API sends codes; the screens
 *  show these, so the wire never carries copy. */
export const EXAM_LABEL: Record<Exam, string> = {
  enem: 'ENEM',
  fuvest: 'FUVEST',
}

export const EXAMS: Exam[] = ['enem', 'fuvest']

export function targetLabel(exam: Exam, year: number): string {
  return `${EXAM_LABEL[exam]} ${year}`
}
