import type { ArgumentaApi } from '../client'
import { aTrackResponse } from './track'
import { aChapterResponse } from './chapter'

export function createFakeApi(overrides?: Partial<ArgumentaApi>): ArgumentaApi {
  return {
    register: jest.fn(),
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
    updateNickname: jest.fn(),
    addTarget: jest.fn(),
    activateTarget: jest.fn(),
    track: jest.fn().mockResolvedValue(aTrackResponse()),
    chapter: jest.fn().mockResolvedValue(aChapterResponse()),
    ...overrides,
  }
}
