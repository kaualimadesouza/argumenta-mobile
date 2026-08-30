import { useCallback } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, fontFamily, tracking, typeScale } from '@/styles/tokens'
import { useApi } from '@/api/context'
import { useResource } from '@/api/useResource'
import { Loaded } from '@/api/Loaded'
import { HabitChips } from '@/components/HabitChips'
import { StoryCard } from '@/components/StoryCard'
import type { TrackStoryResponse } from '@/api/types'

function blockerOf(stories: TrackStoryResponse[], index: number): string | null {
  return index === 0 ? null : stories[index - 1].title
}

export default function HomeScreen() {
  const api = useApi()
  const { state, reload } = useResource(useCallback(() => api.track(), [api]))

  return (
    <SafeAreaView style={styles.screen} testID="home-screen" edges={['top', 'left', 'right']}>
      <Loaded resource={state} onRetry={reload}>
        {(track) => (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Sua trilha</Text>
              <HabitChips habit={track} />
            </View>
            
            {track.stories.length === 0 ? (
              <Text style={styles.empty}>
                Nenhuma história publicada ainda. Assim que a primeira entrar no ar, ela aparece aqui.
              </Text>
            ) : (
              <View style={styles.stories}>
                {track.stories.map((story, index) => (
                  <StoryCard key={story.id} story={story} blockedBy={blockerOf(track.stories, index)} />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </Loaded>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: typeScale.display,
    letterSpacing: typeScale.display * tracking.title,
    color: colors.ink,
  },
  empty: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    letterSpacing: typeScale.body * tracking.body,
    color: colors.ink2,
    textAlign: 'center',
    marginTop: 48,
  },
  stories: {
    gap: 16,
  },
})
