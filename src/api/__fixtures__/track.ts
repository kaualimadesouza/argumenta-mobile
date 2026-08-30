import type { TrackResponse, TrackStoryResponse, HabitSummary } from '../types'

export function aHabitSummary(overrides?: Partial<HabitSummary>): HabitSummary {
  return {
    streak_days: 3,
    submissions_today: 1,
    daily_limit: 5,
    ...overrides,
  }
}

export function aTrackStoryResponse(overrides?: Partial<TrackStoryResponse>): TrackStoryResponse {
  return {
    id: 'story-1',
    slug: 'tutorial',
    title: 'Tutorial Story',
    synopsis: 'A short tutorial',
    position: 1,
    is_tutorial: true,
    cover_asset: null,
    state: 'available',
    chapters_passed: 0,
    chapters_total: 1,
    current_chapter: {
      id: 'chapter-1',
      order: 1,
      status: 'available',
    },
    ...overrides,
  }
}

export function aTrackResponse(overrides?: Partial<TrackResponse>): TrackResponse {
  return {
    ...aHabitSummary(overrides),
    stories: overrides?.stories ?? [aTrackStoryResponse()],
  }
}
