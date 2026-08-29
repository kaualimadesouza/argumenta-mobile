import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useApi } from '@/api/context'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import { Notice } from '@/components/Notice'
import { useSignIn } from '@/session/useSignIn'
import { colors, fontFamily, radius, typeScale } from '@/styles/tokens'

const MIN_PASSWORD = 8

export default function CadastroScreen() {
  const api = useApi()
  const { signIn, error, busy } = useSignIn()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)

  const ready =
    nickname.trim() !== '' && email !== '' && password.length >= MIN_PASSWORD && accepted

  async function submit(): Promise<void> {
    await signIn(() => api.register({ email, nickname, password, accepted_terms: accepted }))
  }

  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Três campos e você já está dentro da primeira história.</Text>
      <View style={styles.form}>
        <Field
          label="Apelido"
          value={nickname}
          onChangeText={setNickname}
          autoComplete="name"
          hint="É como o Argumenta vai te chamar."
        />
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
          autoComplete="password-new"
          secureTextEntry
          hint="Pelo menos 8 caracteres."
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={() => setAccepted((current) => !current)}
          style={styles.consent}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]} />
          {/* Os termos e a política ainda não têm uma página publicada para
              apontar: o card web#2 (deploy do argumenta-web) ainda está no
              Todo do board. O aceite é obrigatório mesmo assim; o link some
              da caixa de texto até existir um destino real. */}
          <Text style={styles.consentText}>
            Li e aceito os termos de uso e a política de privacidade. Se você tem menos de 18
            anos, mostre as duas páginas para quem responde por você.
          </Text>
        </Pressable>
        {error !== null ? <Notice tone="error">{error}</Notice> : null}
        <Button disabled={!ready} busy={busy} onPress={() => void submit()}>
          Criar conta
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: 'center', gap: 8 },
  title: { fontSize: typeScale.title, fontFamily: fontFamily.bold, color: colors.ink },
  subtitle: { fontSize: typeScale.body, color: colors.ink2, marginBottom: 16 },
  form: { gap: 12 },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.tile / 2,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.caneta, borderColor: colors.caneta },
  consentText: { flex: 1, fontSize: typeScale.meta, color: colors.ink2 },
})
