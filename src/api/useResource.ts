import { useCallback, useEffect, useState } from 'react'

import { messageFor } from './messages'

export type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'failed'; message: string }

interface Resource<T> {
  state: ResourceState<T>
  reload: () => void
}

/** One GET behind a screen: load on mount, keep the failure readable, and let
 *  the screen ask again. `load` must be stable (useCallback). */
export function useResource<T>(load: () => Promise<T>): Resource<T> {
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' })

  const fetchNow = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      setState({ status: 'ready', value: await load() })
    } catch (failure) {
      setState({ status: 'failed', message: messageFor(failure) })
    }
  }, [load])

  useEffect(() => {
    void fetchNow()
  }, [fetchNow])

  return { state, reload: () => void fetchNow() }
}
