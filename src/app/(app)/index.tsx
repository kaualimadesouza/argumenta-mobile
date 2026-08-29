import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, fontFamily, radius, tracking, typeScale } from '@/styles/tokens'
import { useAppFonts } from '@/hooks/useAppFonts'

export default function HomeScreen() {
  const fontsLoaded = useAppFonts()

  return (
    <SafeAreaView style={styles.screen} testID="home-screen">
      <View style={styles.card}>
        <Text style={[styles.title, fontsLoaded && { fontFamily: fontFamily.bold }]}>
          Argumenta
        </Text>
        <Text style={[styles.caption, fontsLoaded && { fontFamily: fontFamily.regular }]}>
          Treino de escrita argumentativa para o vestibular.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: typeScale.title,
    letterSpacing: typeScale.title * tracking.title,
    color: colors.ink,
  },
  caption: {
    fontSize: typeScale.body,
    letterSpacing: typeScale.body * tracking.body,
    color: colors.ink2,
  },
})
