import { createContext, useContext } from 'react'

import type { ArgumentaApi } from './client'

export const ApiContext = createContext<ArgumentaApi | null>(null)

export function useApi(): ArgumentaApi {
  const api = useContext(ApiContext)
  if (api === null) throw new Error('useApi used outside of AppProviders')
  return api
}
