import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useApi } from '@/api/context'
import { ApiError } from '@/api/ApiError'

import { type Session, SessionContext } from './context'

export function SessionProvider({ children }: { children: ReactNode }) {
  const api = useApi()
  const [session, setSession] = useState<Session>({ status: 'loading' })

  const reload = useCallback(async () => {
    try {
      const me = await api.me()
      setSession({ status: 'authenticated', user: me.user, targets: me.targets })
    } catch (error) {
      const expired = error instanceof ApiError && error.status === 401
      setSession({ status: expired ? 'anonymous' : 'unavailable' })
    }
  }, [api])

  const signOut = useCallback(async () => {
    await api.logout()
    setSession({ status: 'anonymous' })
  }, [api])

  useEffect(() => {
    // reload's setState calls only run after the awaited /me call settles,
    // never synchronously in this effect body; fetch-on-mount is the
    // documented use for an effect (react.dev/learn/you-might-not-need-an-effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  const store = useMemo(() => ({ session, reload, signOut }), [session, reload, signOut])
  return <SessionContext.Provider value={store}>{children}</SessionContext.Provider>
}
