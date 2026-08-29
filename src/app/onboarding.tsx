import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useApi } from '@/api/context'
import { messageFor } from '@/api/messages'
import type { Exam } from '@/api/types'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Field } from '@/components/Field'
import { Notice } from '@/components/Notice'
import { EXAMS, EXAM_LABEL, targetLabel } from '@/copy/labels'
import { useSession, useStudent } from '@/session/context'
import { colors, fontFamily, radius, typeScale } from '@/styles/tokens'

const YEARS_AHEAD = 4

function upcomingYears(): number[] {
  const current = new Date().getFullYear()
  return Array.from({ length: YEARS_AHEAD }, (_, offset) => current + offset)
}

export default function OnboardingScreen() {
  const api = useApi()
  const router = useRouter()
  const { reload } = useSession()
  const { user, targets } = useStudent()
  const years = upcomingYears()

  const [nickname, setNickname] = useState(user.nickname)
  const [nicknameSaved, setNicknameSaved] = useState(false)
  const [nicknameError, setNicknameError] = useState<string | null>(null)
  const [nicknameBusy, setNicknameBusy] = useState(false)

  const [exam, setExam] = useState<Exam>('enem')
  const [year, setYear] = useState(years[0])
  const [targetError, setTargetError] = useState<string | null>(null)
  const [targetBusy, setTargetBusy] = useState(false)

  async function saveNickname(): Promise<void> {
    setNicknameBusy(true)
    setNicknameError(null)
    setNicknameSaved(false)
    try {
      await api.updateNickname(nickname)
      await reload()
      setNicknameSaved(true)
    } catch (failure) {
      setNicknameError(messageFor(failure))
    } finally {
      setNicknameBusy(false)
    }
  }

  async function runTargetAction(action: () => Promise<unknown>): Promise<void> {
    setTargetBusy(true)
    setTargetError(null)
    try {
      await action()
      await reload()
    } catch (failure) {
      setTargetError(messageFor(failure))
    } finally {
      setTargetBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Quase lá</Text>
        <Text style={styles.subtitle}>
          Duas coisas e a primeira história abre: como te chamar, e qual vestibular você vai
          prestar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.kicker}>Como quer ser chamado</Text>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Field
                label="Apelido"
                value={nickname}
                onChangeText={(value) => {
                  setNickname(value)
                  setNicknameSaved(false)
                }}
                autoComplete="name"
              />
            </View>
            <Button
              variant="ghost"
              busy={nicknameBusy}
              disabled={nickname.trim() === '' || nickname === user.nickname}
              onPress={() => void saveNickname()}
            >
              Salvar
            </Button>
          </View>
          {nicknameError !== null ? <Notice tone="error">{nicknameError}</Notice> : null}
          {nicknameSaved ? <Notice tone="success">Apelido salvo.</Notice> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>A lente da sua correção</Text>
          <Text style={styles.heading}>Seus vestibulares</Text>
          <View style={styles.chipsRow}>
            {EXAMS.map((option) => (
              <Chip
                key={option}
                label={EXAM_LABEL[option]}
                selected={exam === option}
                onPress={() => setExam(option)}
              />
            ))}
          </View>
          <View style={styles.chipsRow}>
            {years.map((option) => (
              <Chip
                key={option}
                label={String(option)}
                selected={year === option}
                onPress={() => setYear(option)}
              />
            ))}
          </View>
          <Button
            variant="ghost"
            busy={targetBusy}
            onPress={() => void runTargetAction(() => api.addTarget({ exam, year }))}
          >
            Adicionar
          </Button>
          {targetError !== null ? <Notice tone="error">{targetError}</Notice> : null}
          {targets.length === 0 ? (
            <Text style={styles.empty}>
              Nenhum vestibular escolhido ainda. Escolha pelo menos um: é ele que define em qual
              escala a sua correção aparece.
            </Text>
          ) : (
            targets.map((target) => {
              const name = targetLabel(target.exam, target.year)
              return (
                <View key={target.id} style={styles.item}>
                  <Text style={styles.itemName}>{name}</Text>
                  {target.is_active ? (
                    <View style={styles.activeChip}>
                      <Text style={styles.activeChipText}>Lente ativa</Text>
                    </View>
                  ) : (
                    <Button
                      variant="ghost"
                      busy={targetBusy}
                      onPress={() => void runTargetAction(() => api.activateTarget(target.id))}
                    >
                      {`Usar a lente ${name}`}
                    </Button>
                  )}
                </View>
              )
            })
          )}
        </View>

        <Button disabled={targets.length === 0} onPress={() => router.replace('/')}>
          Começar a treinar
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 24, gap: 16 },
  title: { fontSize: typeScale.title, fontFamily: fontFamily.bold, color: colors.ink },
  subtitle: { fontSize: typeScale.body, color: colors.ink2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 12,
  },
  kicker: {
    fontSize: typeScale.micro,
    color: colors.muted,
    fontFamily: fontFamily.semiBold,
    textTransform: 'uppercase',
  },
  heading: { fontSize: typeScale.lead, fontFamily: fontFamily.semiBold, color: colors.ink },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  grow: { flex: 1 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { fontSize: typeScale.meta, color: colors.muted },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemName: { fontSize: typeScale.body, color: colors.ink, fontFamily: fontFamily.medium },
  activeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
    backgroundColor: colors.aprovadoSoft,
  },
  activeChipText: { fontSize: typeScale.micro, color: colors.aprovadoInk, fontFamily: fontFamily.semiBold },
})
