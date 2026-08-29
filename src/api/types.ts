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
