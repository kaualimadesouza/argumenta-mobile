import { Link } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useApi } from '@/api/context'
import { signInWithGoogle } from '@/auth/google'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import { Notice } from '@/components/Notice'
import { useSignIn } from '@/session/useSignIn'
import { colors, fontFamily, tracking, typeScale } from '@/styles/tokens'

export default function EntrarScreen() {
  const api = useApi()
  const { signIn, error, busy } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)

  async function submitEmail(): Promise<void> {
    await signIn(() => api.login({ email, password }))
  }

  async function submitGoogle(): Promise<void> {
    setGoogleBusy(true)
    try {
      const authorization = await signInWithGoogle()
      if (authorization !== null) {
        await signIn(() =>
          api.loginWithGoogle({
            code: authorization.code,
            redirect_uri: authorization.redirectUri,
          }),
        )
      }
    } finally {
      setGoogleBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>Argumenta</Text>
      <Text style={styles.tagline}>
        Vença a discussão dentro da história. Passe no vestibular fora dela.
      </Text>
      <View style={styles.form}>
        <Button variant="ghost" busy={googleBusy} onPress={() => void submitGoogle()}>
          Entrar com Google
        </Button>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          secureTextEntry
        />
        {error !== null ? <Notice tone="error">{error}</Notice> : null}
        <Button
          disabled={email === '' || password === ''}
          busy={busy}
          onPress={() => void submitEmail()}
        >
          Entrar
        </Button>
        <Link href="/cadastro" style={styles.link}>
          Criar conta com e-mail
        </Link>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: 'center', gap: 8 },
  title: {
    fontSize: typeScale.display,
    letterSpacing: typeScale.display * tracking.title,
    fontFamily: fontFamily.bold,
    color: colors.ink,
  },
  tagline: { fontSize: typeScale.body, color: colors.ink2, marginBottom: 16 },
  form: { gap: 12 },
  link: { textAlign: 'center', color: colors.caneta, fontSize: typeScale.meta, paddingTop: 8 },
})
