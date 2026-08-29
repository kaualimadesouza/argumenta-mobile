import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { messageFor } from '@/api/messages'

import { useSession } from './context'

interface SignIn {
  signIn: (perform: () => Promise<unknown>) => Promise<void>
  error: string | null
  busy: boolean
}

/** Every way into the app is the same three steps: call the endpoint that
 *  saves the tokens, read /me, then let the root layout's guard decide where
 *  the student belongs (onboarding, or straight into the app). */
export function useSignIn(): SignIn {
  const { reload } = useSession()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const signIn = useCallback(
    async (perform: () => Promise<unknown>) => {
      setBusy(true)
      setError(null)
      try {
        await perform()
        await reload()
        router.replace('/')
      } catch (failure) {
        setError(messageFor(failure))
        setBusy(false)
      }
    },
    [router, reload],
  )

  return { signIn, error, busy }
}
