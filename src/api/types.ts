/** Mirrors of the argumenta-api pydantic responses, field for field: the wire
 *  shape is the type, so there is no mapping layer to drift. */

export type Exam = 'enem' | 'fuvest'

export interface UserResponse {
  id: string
  email: string
  nickname: string
  terms_accepted_at: string | null
  access_token?: string
  refresh_token?: string
}

export interface TargetResponse {
  id: string
  exam: Exam
  year: number
  is_active: boolean
}

export interface MeResponse {
  user: UserResponse
  targets: TargetResponse[]
}

export interface RegisterRequest {
  email: string
  nickname: string
  password: string
  accepted_terms: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface GoogleLoginRequest {
  code: string
  redirect_uri: string
}

export interface UpdateMeRequest {
  nickname: string
}

export interface AddTargetRequest {
  exam: Exam
  year: number
}

export type StoryState = 'locked' | 'available' | 'in_progress' | 'completed'

export type ChapterStatus =
  | 'locked'
  | 'available'
  | 'drafting'
  | 'in_consequence'
  | 'in_recovery'
  | 'passed'

export interface ChapterCursorResponse {
  id: string
  /** 1-based place in the story, which is what the screen counts. */
  order: number
  status: ChapterStatus
}

export interface TrackStoryResponse {
  id: string
  slug: string
  title: string
  synopsis: string
  position: number
  is_tutorial: boolean
  cover_asset: string | null
  state: StoryState
  chapters_passed: number
  chapters_total: number
  current_chapter: ChapterCursorResponse | null
}

/** The three habit numbers both /track and /progress carry. */
export interface HabitSummary {
  streak_days: number
  submissions_today: number
  daily_limit: number
}

export interface TrackResponse extends HabitSummary {
  stories: TrackStoryResponse[]
}

export type BeatType = 'narration' | 'dialogue' | 'objective' | 'hint'

export type Branch = 'main' | 'consequence' | 'recovery'

export type ChapterKind = 'confronto' | 'chefe'

export interface BeatResponse {
  beat_type: BeatType
  body: string
  character_name: string | null
  character_portrait: string | null
  illustration_asset: string | null
}

export interface ChapterResponse {
  id: string
  story_id: string
  position: number
  kind: ChapterKind
  title: string
  objective: string
  min_words: number
  max_words: number
  antagonist_name: string
  antagonist_portrait: string | null
  status: ChapterStatus
  branch: Branch
  draft_body: string | null
  beats: BeatResponse[]
}

export type Verdict = 'approved' | 'failed_technical' | 'failed_persuasion'

export type Dimension =
  | 'norma_culta'
  | 'coesao'
  | 'coerencia'
  | 'repertorio'
  | 'persuasao'
  | 'proposta_intervencao'

export type AnnotationType =
  | 'spelling'
  | 'accentuation'
  | 'punctuation'
  | 'grammar'
  | 'cohesion'
  | 'coherence'
  | 'repertoire_alert'
  | 'repertoire_praise'
  | 'persuasion'

export type Severity = 'error' | 'warning' | 'praise'

/** Who owns the total: the exam board, or our own aggregation. */
export type ScaleSource = 'board' | 'argumenta'

export interface ScoreResponse {
  dimension: Dimension
  score: number
  evidence: string
  passed_floor: boolean
}

export interface AnnotationResponse {
  span_start: number
  span_end: number
  type: AnnotationType
  severity: Severity
  message: string
  suggestion: string | null
  priority: number
}

export interface LensCriterionResponse {
  code: string
  label: string
  score: number
  scale_max: number
  is_argumenta_extra: boolean
}

export interface LensResponse {
  exam: Exam
  version: string
  criteria: LensCriterionResponse[]
  total: number | null
  total_max: number | null
  scale_source: ScaleSource
}

/** Lifecycle of the async correction (API issue #68): failed is recoverable,
 *  the student may resubmit at no daily-limit cost. */
export type SubmissionStatus = 'evaluating' | 'evaluated' | 'failed'

/** What POST /chapters/{id}/submissions answers: the correction runs out of
 *  band, and the verdict arrives by polling GET /submissions/{id}. */
export interface PendingSubmissionResponse {
  submission_id: string
  attempt_number: number
  status: SubmissionStatus
}

export interface CorrectionResponse {
  verdict: Verdict
  average_score: number
  floor_value: number
  min_average: number
  chapter_status: ChapterStatus
  scores: ScoreResponse[]
  annotations: AnnotationResponse[]
  para_passar: AnnotationResponse[]
  lens: LensResponse
}

/** One polling answer: result is present exactly when status is evaluated. */
export interface SubmissionStateResponse {
  submission_id: string
  chapter_id: string
  attempt_number: number
  status: SubmissionStatus
  result: CorrectionResponse | null
}

/** The correction as the screens consume it, assembled by awaitVerdict once
 *  the polling ends: the pending ids plus the evaluated result. */
export interface SubmissionResponse extends CorrectionResponse {
  submission_id: string
  attempt_number: number
}

export interface SubmissionRequest {
  body: string
  typing_ms?: number
  paste_count?: number
}

export interface DraftRequest {
  body: string
}

interface TelemetryEventBase {
  /** Client clock, offset required: the API refuses a naive timestamp. */
  occurred_at: string
  submission_id?: string
}

export interface PasteEvent extends TelemetryEventBase {
  event_type: 'paste'
  chars: number
  words?: number
}

export interface TypingStatsEvent extends TelemetryEventBase {
  event_type: 'typing_stats'
  ms: number
  keystrokes: number
  backspaces?: number
}

export interface ScreenViewEvent extends TelemetryEventBase {
  event_type: 'screen_view'
  screen: string
}

export type TelemetryEvent = PasteEvent | TypingStatsEvent | ScreenViewEvent

export interface TelemetryBatchRequest {
  events: TelemetryEvent[]
}

export interface TelemetryBatchResponse {
  recorded: number
  dropped: number
}

export type Milestone =
  | 'tutorial_completed'
  | 'first_repertoire_praise'
  | 'first_boss_essay'
  | 'week_without_missing'

export interface TrendPointResponse {
  /** ISO date, no clock: the series is one point per day. */
  day: string
  score: number
}

export interface DimensionTrendResponse {
  dimension: Dimension
  /** How the student's lens names the dimension; null when it hides it. */
  criterion_code: string | null
  criterion_label: string | null
  points: TrendPointResponse[]
}

export interface MilestoneResponse {
  code: Milestone
  done: boolean
}

export interface ProgressResponse extends HabitSummary {
  exam: Exam
  lens_version: string
  longest_streak_days: number
  stories_completed: number
  stories_total: number
  dimensions: DimensionTrendResponse[]
  milestones: MilestoneResponse[]
}

export type ReactionBeat = 'rebuttal' | 'convinced' | 'consequence_intro' | 'recovery_prompt'

export interface ReactionResponse {
  beat: ReactionBeat
  character_name: string
  body: string
  /** The authored fallback, not the AI line: asking again may return the real one. */
  provisional: boolean
}

export interface AccountDeletionResponse {
  requested_at: string
  purge_scheduled_for: string
}

export interface PastSubmissionResponse {
  submission_id: string
  attempt_number: number
  body: string
  verdict: Verdict
  average_score: number
  floor_value: number
  lens: LensResponse
  created_at: string
}
