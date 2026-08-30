import type { ArgumentaApi } from './client'
import type { PendingSubmissionResponse, SubmissionResponse } from './types'

/** The evaluation takes 30 to 90 seconds; the API reports a submission stuck
 *  past 3 minutes as failed, so the client deadline matches it. */
export const VERDICT_POLL_INTERVAL_MS = 2500
export const VERDICT_POLL_TIMEOUT_MS = 180_000

export interface VerdictWait {
  intervalMs?: number
  timeoutMs?: number
}

/** failed covers the recoverable cases the same way the API does: the student
 *  resubmits, and the daily tick was refunded on the server. */
export type VerdictOutcome =
  | { status: 'evaluated'; submission: SubmissionResponse }
  | { status: 'failed' }

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Polls the submission until the verdict lands, composing the shape the
 *  correction screens consume (pending ids + evaluated result). */
export async function awaitVerdict(
  api: Pick<ArgumentaApi, 'submission'>,
  pending: PendingSubmissionResponse,
  wait: VerdictWait = {},
): Promise<VerdictOutcome> {
  const intervalMs = wait.intervalMs ?? VERDICT_POLL_INTERVAL_MS
  const deadline = Date.now() + (wait.timeoutMs ?? VERDICT_POLL_TIMEOUT_MS)
  for (;;) {
    const state = await api.submission(pending.submission_id)
    if (state.status === 'evaluated' && state.result !== null) {
      return {
        status: 'evaluated',
        submission: {
          submission_id: state.submission_id,
          attempt_number: state.attempt_number,
          ...state.result,
        },
      }
    }
    if (state.status === 'failed' || Date.now() >= deadline) return { status: 'failed' }
    await delay(intervalMs)
  }
}
