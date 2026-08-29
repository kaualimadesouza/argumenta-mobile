/** The API answers a domain error as {"detail": "<ErrorClassName>"}, so the
 *  code is stable enough to switch on; pydantic sends a list instead. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`${status} ${code}`)
    this.name = 'ApiError'
  }
}

const VALIDATION = 'ValidationError'

export function apiErrorFrom(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return new ApiError(status, detail)
  return new ApiError(status, Array.isArray(detail) ? VALIDATION : 'HttpError')
}
