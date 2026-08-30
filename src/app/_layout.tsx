import { Stack, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { createHttpApi } from '@/api/client'
import { ApiContext } from '@/api/context'
import { LoadingPanel, RetryPanel } from '@/components/StatusPanels'
import { SessionProvider } from '@/session/SessionProvider'
import { useSession } from '@/session/context'

const SESSION_UNREACHABLE =
  'Não conseguimos falar com o Argumenta. Sua sessão continua de pé: verifique a internet e tente de novo.'

function RootNavigator() {
  const { session, reload } = useSession()
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response) return
      router.replace('/')
    })
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace('/')
    })
    return () => {
      isMounted = false
      sub.remove()
    }
  }, [router])

  if (session.status === 'loading') return <LoadingPanel />
  if (session.status === 'unavailable') {
    return <RetryPanel message={SESSION_UNREACHABLE} onRetry={() => void reload()} />
  }

  const authenticated = session.status === 'authenticated'
  const needsOnboarding = authenticated && session.targets.length === 0

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="entrar" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated && needsOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated && !needsOnboarding}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  const api = useMemo(() => createHttpApi(), [])
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ApiContext.Provider value={api}>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </ApiContext.Provider>
    </SafeAreaProvider>
  )
}
