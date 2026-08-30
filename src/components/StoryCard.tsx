import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

import type { TrackStoryResponse, StoryState } from '@/api/types'
import { Card } from './Card'
import { Chip } from './Chip'
import { ProgressBar } from './ProgressBar'
import { StoryCover } from './art/StoryCover'
import { Button } from './Button'
import { colors, fontFamily, typeScale, tracking } from '@/styles/tokens'

interface StoryCardProps {
  story: TrackStoryResponse
  blockedBy: string | null
}

function badgeFor(story: TrackStoryResponse) {
  switch (story.state) {
    case 'completed':
      return { tone: 'ok' as const, label: 'Concluída' }
    case 'locked':
      return { tone: 'warn' as const, label: 'Bloqueada' }
    default:
      return {
        tone: 'caneta' as const,
        label: `Cap. ${story.current_chapter?.order ?? story.chapters_total}/${story.chapters_total}`,
      }
  }
}

function lineFor(story: TrackStoryResponse, blockedBy: string | null): string {
  if (story.state === 'locked') {
    return blockedBy === null
      ? 'Abre quando a história anterior terminar.'
      : `Conclua ${blockedBy} para abrir esta história.`
  }
  return story.is_tutorial ? `Tutorial · ${story.chapters_total} capítulos` : story.synopsis
}

function ctaLabel(state: StoryState, order: number): string {
  return `${state === 'available' ? 'Começar' : 'Continuar'} capítulo ${order}`
}

export function StoryCard({ story, blockedBy }: StoryCardProps) {
  const router = useRouter()
  const badge = badgeFor(story)
  const done = story.state === 'completed'
  const featured = story.state === 'in_progress'
  const percent = Math.round((story.chapters_passed / story.chapters_total) * 100)
  const chapter = story.state === 'locked' ? null : story.current_chapter

  return (
    <Card active={featured} style={styles.card}>
      <View style={[styles.story, story.state === 'locked' && styles.lockedStory]}>
        <View style={styles.top}>
          <StoryCover position={story.position} state={story.state} />
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Chip tone={badge.tone}>{badge.label}</Chip>
            </View>
            <Text style={styles.line}>{lineFor(story, blockedBy)}</Text>
            <ProgressBar
              percent={percent}
              done={done}
              label={`${story.chapters_passed} de ${story.chapters_total} capítulos`}
            />
          </View>
        </View>
        {chapter ? (
          <Button
            onPress={() => router.push(`/capitulos/${chapter.id}`)}
          >
            {ctaLabel(story.state, chapter.order)}
          </Button>
        ) : null}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  story: {
    padding: 16,
    gap: 16,
  },
  lockedStory: {
    opacity: 0.6,
  },
  top: {
    flexDirection: 'row',
    gap: 16,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  storyTitle: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: typeScale.lead,
    letterSpacing: typeScale.lead * tracking.lead,
    color: colors.ink,
  },
  line: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    letterSpacing: typeScale.body * tracking.body,
    color: colors.ink2,
  },
  cta: {
    marginTop: 8,
  },
})
