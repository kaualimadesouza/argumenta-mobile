import { useEffect, useRef, useState } from 'react'

/** Long enough that a pause between sentences does not become a request, short
 *  enough that closing the tab after a thought does not lose it. */
export const AUTOSAVE_DELAY_MS = 1500

export type AutosaveStatus = 'clean' | 'pending' | 'saving' | 'saved' | 'failed'

interface AutosaveInput {
  body: string
  /** What the server already holds, so a fresh draft starts clean. */
  stored: string
  save: (body: string) => Promise<void>
}

/** Debounced draft saving. It never touches the text: a failed save keeps the
 *  student's words on screen and says so. */
export function useAutosave({ body, stored, save }: AutosaveInput): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>('clean')
  const onServer = useRef(stored)
  const latest = useRef(body)

  useEffect(() => {
    latest.current = body
    if (body === onServer.current) {
      setStatus((current) => (current === 'clean' ? 'clean' : 'saved'))
      return
    }
    setStatus('pending')
    const timer = setTimeout(() => {
      setStatus('saving')
      save(body).then(
        () => {
          onServer.current = body
          if (latest.current === body) setStatus('saved')
        },
        () => {
          if (latest.current === body) setStatus('failed')
        },
      )
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [body, save])

  return status
}

/** null while there is nothing to say: an untouched draft. */
export const AUTOSAVE_LABEL: Record<AutosaveStatus, string | null> = {
  clean: null,
  pending: 'rascunho não salvo',
  saving: 'salvando…',
  saved: 'rascunho salvo',
  failed: 'não conseguimos salvar o rascunho',
}
