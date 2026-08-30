import { render, screen } from '@testing-library/react-native'
import { ApiContext } from '@/api/context'
import { createFakeApi } from '@/api/__fixtures__/fakeApi'
import { aTrackResponse, aTrackStoryResponse } from '@/api/__fixtures__/track'

import HomeScreen from './index'

const mockUseAppFonts = jest.fn()
jest.mock('@/hooks/useAppFonts', () => ({
  useAppFonts: () => mockUseAppFonts(),
}))

const mockRouter = { push: jest.fn() }
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}))

describe('Trilha (HomeScreen)', () => {
  beforeEach(() => {
    mockUseAppFonts.mockReturnValue(true)
    mockRouter.push.mockReset()
  })

  it('renders habit chips with tabular-nums', async () => {
    const api = createFakeApi({
      track: jest.fn().mockResolvedValue(aTrackResponse({ streak_days: 12, submissions_today: 1, daily_limit: 3 })),
    })

    await render(
      <ApiContext.Provider value={api}>
        <HomeScreen />
      </ApiContext.Provider>,
    )

    const streakChip = await screen.findByText('12')
    expect(streakChip).toHaveStyle({ fontVariant: ['tabular-nums'] })

    const submissionsChip = await screen.findByText('1/3')
    expect(submissionsChip).toHaveStyle({ fontVariant: ['tabular-nums'] })
  })

  it('renders locked story card without CTA', async () => {
    const api = createFakeApi({
      track: jest.fn().mockResolvedValue(
        aTrackResponse({
          stories: [aTrackStoryResponse({ title: 'Locked Story', state: 'locked' })],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <HomeScreen />
      </ApiContext.Provider>,
    )

    expect(await screen.findByText('Locked Story')).toBeTruthy()
    expect(screen.queryByText('Continuar')).toBeNull()
  })

  it('renders available/in_progress story card with CTA', async () => {
    const api = createFakeApi({
      track: jest.fn().mockResolvedValue(
        aTrackResponse({
          stories: [
            aTrackStoryResponse({ title: 'Available Story', state: 'available', chapters_passed: 1, chapters_total: 5 }),
          ],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <HomeScreen />
      </ApiContext.Provider>,
    )

    expect(await screen.findByText('Available Story')).toBeTruthy()
    expect(screen.getByText('Cap. 1/5')).toBeTruthy()
    expect(screen.getByText('Começar capítulo 1')).toBeTruthy()
  })

  it('renders completed story card with approved seal and no CTA', async () => {
    const api = createFakeApi({
      track: jest.fn().mockResolvedValue(
        aTrackResponse({
          stories: [
            aTrackStoryResponse({ title: 'Completed Story', state: 'completed', chapters_passed: 5, chapters_total: 5 }),
          ],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <HomeScreen />
      </ApiContext.Provider>,
    )

    expect(await screen.findByText('Completed Story')).toBeTruthy()
    expect(screen.queryByText('Continuar')).toBeNull()
    expect(screen.getByText('Concluída')).toBeTruthy() 
  })
})
