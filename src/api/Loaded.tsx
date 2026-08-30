import type { ReactNode } from 'react'

import { LoadingPanel, RetryPanel } from '../components/StatusPanels'
import type { ResourceState } from './useResource'

interface LoadedProps<T> {
  resource: ResourceState<T>
  onRetry: () => void
  children: (value: T) => ReactNode
}

/** Keeps the loading and failure branches out of every screen. */
export function Loaded<T>({ resource, onRetry, children }: LoadedProps<T>) {
  if (resource.status === 'loading') return <LoadingPanel />
  if (resource.status === 'failed') {
    return <RetryPanel message={resource.message} onRetry={onRetry} />
  }
  return <>{children(resource.value)}</>
}
