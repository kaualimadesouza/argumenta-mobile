import type { AnnotationType, Dimension, Exam, Milestone } from '@/api/types'

export const EXAM_LABEL: Record<Exam, string> = {
  enem: 'ENEM',
  fuvest: 'FUVEST',
}

export const EXAMS: Exam[] = ['enem', 'fuvest']

export function targetLabel(exam: Exam, year: number): string {
  return `${EXAM_LABEL[exam]} ${year}`
}

export const ANNOTATION_LABEL: Record<AnnotationType, string> = {
  spelling: 'Ortografia',
  accentuation: 'Acentuação',
  punctuation: 'Pontuação',
  grammar: 'Gramática',
  cohesion: 'Coesão',
  coherence: 'Coerência',
  repertoire_alert: 'Alerta de repertório',
  repertoire_praise: 'Bom repertório',
  persuasion: 'Persuasão',
}

export const MILESTONE_LABEL: Record<Milestone, string> = {
  tutorial_completed: 'Tutorial concluído',
  first_repertoire_praise: 'Primeiro repertório elogiado',
  week_without_missing: 'Uma semana sem faltar',
  first_boss_essay: 'Primeira redação-chefe',
}

export const DIMENSION_LABEL: Record<Dimension, string> = {
  norma_culta: 'Norma culta',
  coesao: 'Coesão',
  coerencia: 'Coerência',
  repertorio: 'Repertório',
  persuasao: 'Persuasão',
  proposta_intervencao: 'Proposta de intervenção',
}
