import { View, Text, StyleSheet } from 'react-native'
import type { ReactionResponse } from '@/api/types'
import { colors, fontFamily, typeScale, radius, tracking } from "@/styles/tokens"

export function Reaction({ reaction }: { reaction: ReactionResponse }) {
  return (
    <View style={styles.row}>
      <Text style={styles.speech}>{reaction.body}</Text>
      <View style={styles.whoRow}>
        <View style={styles.rule} />
        <Text style={styles.who}>{reaction.character_name}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 8,
  },
  speech: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.ink,
    
  },
  whoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rule: {
    height: 1,
    flex: 1,
    backgroundColor: colors.ink,
    opacity: 0.1,
  },
  who: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.micro,
    textTransform: 'uppercase',
    color: colors.ink,
    opacity: 0.5,
  },
})
