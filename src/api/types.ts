/** Mirrors of the argumenta-api pydantic responses, field for field: the wire
 *  shape is the type, so there is no mapping layer to drift. Grows with each
 *  card; only the fields the app actually uses today are here. */

export type Exam = 'enem' | 'fuvest'

export interface UserResponse {
  id: string
  email: string
  nickname: string
  terms_accepted_at: string | null
  /** Set only when the request carried the mobile client header. */
  access_token?: string | null
  refresh_token?: string | null
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

