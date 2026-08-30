import { render, screen } from '@testing-library/react-native'
import { ApiContext } from '@/api/context'
import { createFakeApi } from '@/api/__fixtures__/fakeApi'
import { aChapterResponse, aBeatResponse } from '@/api/__fixtures__/chapter'
import { colors } from '@/styles/tokens'

import CenaScreen from './index'

const mockUseAppFonts = jest.fn()
jest.mock('@/hooks/useAppFonts', () => ({
  useAppFonts: () => mockUseAppFonts(),
}))

const mockRouter = { push: jest.fn(), replace: jest.fn() }
const mockParams = { chapterId: 'cap-1' }
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}))

describe('Cena (CenaScreen)', () => {
  beforeEach(() => {
    mockUseAppFonts.mockReturnValue(true)
    mockRouter.push.mockReset()
    mockRouter.replace.mockReset()
  })

  it('renders narration beat on night panel', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(
        aChapterResponse({
          beats: [aBeatResponse({ beat_type: 'narration', body: 'The moon is bright.' })],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CenaScreen />
      </ApiContext.Provider>,
    )

    const text = await screen.findByText('The moon is bright.')
    expect(text).toBeTruthy()
    // Find the container panel
    const panel = screen.getByTestId('beat-narration-0')
    expect(panel).toHaveStyle({ backgroundColor: colors.noite })
    expect(text).toHaveStyle({ color: colors.luz })
  })

  it('renders dialogue beat with character name', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(
        aChapterResponse({
          beats: [
            aBeatResponse({ beat_type: 'dialogue', character_name: 'Tenório', body: 'I am the boss.' }),
          ],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CenaScreen />
      </ApiContext.Provider>,
    )

    expect(await screen.findByText('Tenório')).toBeTruthy()
    expect(screen.getByText('I am the boss.')).toBeTruthy()
  })

  it('renders objective beat in caneta', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(
        aChapterResponse({
          beats: [aBeatResponse({ beat_type: 'objective', body: 'Write a good essay.' })],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CenaScreen />
      </ApiContext.Provider>,
    )

    const label = await screen.findByText('Seu objetivo')
    expect(label).toHaveStyle({ color: colors.caneta })
    expect(screen.getByText('Write a good essay.')).toBeTruthy()
  })

  it('renders hint beat in streakInk', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(
        aChapterResponse({
          beats: [aBeatResponse({ beat_type: 'hint', body: 'Use some facts.' })],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CenaScreen />
      </ApiContext.Provider>,
    )

    const label = await screen.findByText('Dica de repertório')
    expect(label).toHaveStyle({ color: colors.streakInk })
    expect(screen.getByText('Use some facts.')).toBeTruthy()
  })

  it('supports consequence branch gracefully', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(
        aChapterResponse({
          branch: 'consequence',
          beats: [aBeatResponse({ beat_type: 'narration', body: 'You failed.' })],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CenaScreen />
      </ApiContext.Provider>,
    )

    expect(await screen.findByText('You failed.')).toBeTruthy()
  })

  it('supports recovery branch gracefully', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(
        aChapterResponse({
          branch: 'recovery',
          beats: [aBeatResponse({ beat_type: 'narration', body: 'Try again.' })],
        }),
      ),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CenaScreen />
      </ApiContext.Provider>,
    )

    expect(await screen.findByText('Try again.')).toBeTruthy()
  })
})
