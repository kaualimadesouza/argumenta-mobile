import type { ChapterResponse, BeatResponse, ChapterKind, ChapterStatus, Branch } from '../types'

export function aBeatResponse(overrides?: Partial<BeatResponse>): BeatResponse {
  return {
    beat_type: 'narration',
    body: 'The story begins.',
    character_name: null,
    character_portrait: null,
    illustration_asset: null,
    ...overrides,
  }
}

export function aChapterResponse(overrides?: Partial<ChapterResponse>): ChapterResponse {
  return {
    id: 'chapter-1',
    story_id: 'story-1',
    position: 1,
    kind: 'confronto' as ChapterKind,
    title: 'A New Beginning',
    objective: 'Write something.',
    min_words: 10,
    max_words: 100,
    antagonist_name: 'System',
    antagonist_portrait: null,
    status: 'available' as ChapterStatus,
    branch: 'main' as Branch,
    draft_body: null,
    beats: overrides?.beats ?? [aBeatResponse()],
    ...overrides,
  }
}
