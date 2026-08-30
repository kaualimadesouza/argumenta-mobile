import type { ArgumentaApi } from '../client'
import { aTrackResponse } from './track'
import { aChapterResponse } from './chapter'

export function createFakeApi(overrides: Partial<ArgumentaApi> = {}): ArgumentaApi {
  return {
    register: jest.fn(),
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
    updateNickname: jest.fn(),
    addTarget: jest.fn().mockResolvedValue({}),
    activateTarget: jest.fn().mockResolvedValue(undefined),
    track: jest.fn().mockResolvedValue(aTrackResponse()),
    chapter: jest.fn().mockResolvedValue(aChapterResponse()),
    draft: jest.fn().mockResolvedValue(undefined),
    submit: jest.fn().mockRejectedValue(new Error('Not implemented')),
    submission: jest.fn().mockRejectedValue(new Error('Not implemented')),
    telemetry: jest.fn().mockResolvedValue(undefined),
    reaction: jest.fn().mockRejectedValue(new Error('Not implemented')),
    startRecovery: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
