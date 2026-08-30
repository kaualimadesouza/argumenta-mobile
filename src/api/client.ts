import { clearTokens, loadTokens, saveTokens } from '@/session/tokenStore'

import { apiErrorFrom } from './ApiError'
import type {
  AddTargetRequest,
  GoogleLoginRequest,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  TargetResponse,
  UserResponse,
  TrackResponse,
  ChapterResponse,
  DraftRequest,
  SubmissionRequest,
  PendingSubmissionResponse,
  SubmissionStateResponse,
  TelemetryBatchRequest,
  ReactionResponse,
  ProgressResponse,
} from './types'

const NO_CONTENT = 204
const MOBILE_CLIENT_HEADER = { 'X-Argumenta-Client': 'mobile' }

/** Auth endpoints answer 401 as a verdict, not as an expired token. */
const OWNS_ITS_401 = /^\/auth\//

export interface ArgumentaApi {
  register(body: RegisterRequest): Promise<UserResponse>
  login(body: LoginRequest): Promise<UserResponse>
  loginWithGoogle(body: GoogleLoginRequest): Promise<UserResponse>
    logout(): Promise<void>
  registerPushDevice(payload: { platform: 'ios' | 'android'; token: string }): Promise<void>
  removePushDevice(payload: { token: string }): Promise<void>
  me(): Promise<MeResponse>
  updateNickname(nickname: string): Promise<UserResponse>
  addTarget(body: AddTargetRequest): Promise<TargetResponse>
  activateTarget(targetId: string): Promise<void>
  track(): Promise<TrackResponse>
  chapter(id: string): Promise<ChapterResponse>
  draft(chapterId: string, body: DraftRequest): Promise<void>
  submit(chapterId: string, body: SubmissionRequest): Promise<PendingSubmissionResponse>
  submission(id: string): Promise<SubmissionStateResponse>
  telemetry(body: TelemetryBatchRequest): Promise<void>
  reaction(submissionId: string): Promise<ReactionResponse>
  startRecovery(chapterId: string): Promise<void>
  progress(): Promise<ProgressResponse>
  progress(): Promise<ProgressResponse>
}

function apiUrl(path: string): string {
  const base = process.env.EXPO_PUBLIC_API_URL
  if (base === undefined || base === '') {
    throw new Error('EXPO_PUBLIC_API_URL is not set (see .env.example)')
  }
  return `${base}${path}`
}

async function authHeaders(): Promise<Record<string, string>> {
  const tokens = await loadTokens()
  return tokens === null
    ? { ...MOBILE_CLIENT_HEADER }
    : { ...MOBILE_CLIENT_HEADER, Authorization: `Bearer ${tokens.accessToken}` }
}

interface RenewedTokens {
  access_token: string
  refresh_token: string
}

async function renewSession(): Promise<boolean> {
  const tokens = await loadTokens()
  if (tokens === null) return false
  const response = await fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { ...MOBILE_CLIENT_HEADER, Authorization: `Bearer ${tokens.refreshToken}` },
  })
  if (!response.ok) {
    await clearTokens()
    return false
  }
  const pair = (await response.json()) as RenewedTokens
  await saveTokens({ accessToken: pair.access_token, refreshToken: pair.refresh_token })
  return true
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(apiUrl(path), { ...init, headers: { ...(await authHeaders()), ...init.headers } })
  if (response.status !== 401 || OWNS_ITS_401.test(path)) return response
  if (!(await renewSession())) return response
  return fetch(apiUrl(path), { ...init, headers: { ...(await authHeaders()), ...init.headers } })
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await send(path, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
  if (response.status === NO_CONTENT) return undefined as T
  const payload: unknown = await response.json()
  if (!response.ok) throw apiErrorFrom(response.status, payload)
  return payload as T
}

/** The tokens only ever arrive on a mobile-headed auth response; a browser
 *  never sees this shape, since it relies on the httpOnly cookies instead. */
async function persistIfPresent(user: UserResponse): Promise<UserResponse> {
  if (user.access_token != null && user.refresh_token != null) {
    await saveTokens({ accessToken: user.access_token, refreshToken: user.refresh_token })
  }
  return user
}

export function createHttpApi(): ArgumentaApi {
  return {
    register: async (body) => persistIfPresent(await request('/auth/register', 'POST', body)),
    login: async (body) => persistIfPresent(await request('/auth/login', 'POST', body)),
    loginWithGoogle: async (body) => persistIfPresent(await request('/auth/google', 'POST', body)),
        logout: async () => {
      await request('/auth/logout', 'POST')
    },
    registerPushDevice: async (payload) => {
      await request('/me/push-devices', 'POST', payload)
    },
    removePushDevice: async (payload) => {
      await request('/me/push-devices', 'DELETE', payload)
    },
    me: () => request('/me', 'GET'),
    updateNickname: (nickname) => request('/me', 'PATCH', { nickname }),
    addTarget: (body) => request('/me/targets', 'POST', body),
    activateTarget: (targetId) => request(`/me/targets/${targetId}/activate`, 'PUT'),
    track: () => request('/track', 'GET'),
    chapter: (id) => request(`/chapters/${id}`, 'GET'),
    draft: (chapterId, body) => request(`/chapters/${chapterId}/draft`, 'PUT', body),
    submit: (chapterId, body) => request(`/chapters/${chapterId}/submissions`, 'POST', body),
    submission: (id) => request(`/submissions/${id}`, 'GET'),
    telemetry: (body) => request('/telemetry/events', 'POST', body),
    reaction: (submissionId) => request(`/submissions/${submissionId}/reaction`, 'POST'),
    startRecovery: (chapterId) => request(`/chapters/${chapterId}/recovery`, 'POST'),
    progress: () => request('/progress', 'GET'),
  }
}
