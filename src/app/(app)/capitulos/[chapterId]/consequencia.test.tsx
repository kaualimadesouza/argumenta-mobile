import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { ApiContext } from '@/api/context'
import { createFakeApi } from '@/api/__fixtures__/fakeApi'
import { aChapterResponse } from '@/api/__fixtures__/chapter'
import ConsequenciaScreen from './consequencia'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() }
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ chapterId: 'chapter-1', submissionId: 'sub-1' }),
}))
jest.mock('@/hooks/useAppFonts', () => ({ useAppFonts: () => true }))

describe('ConsequenciaScreen', () => {
  beforeEach(() => {
    mockRouter.replace.mockReset()
  })

  it('plays scene and starts recovery', async () => {
    const startRecoveryMock = jest.fn().mockResolvedValue(undefined)
    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        submission_id: 'sub-1',
        attempt_number: 1,
        status: 'evaluated',
        result: {
          verdict: 'failed_persuasion',
          average_score: 500,
          floor_value: 600,
          min_average: 600,
          chapter_status: 'in_consequence',
          scores: [
            { dimension: 'persuasao', score: 30, evidence: 'Evidência fraca.', passed_floor: false }
          ],
          annotations: [],
          para_passar: [],
          lens: { exam: 'enem', version: '1', criteria: [], total: null, total_max: null, scale_source: 'board' },
        },
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({
        id: 'cap-1',
        status: 'in_consequence',
        antagonist_name: 'Chefe',
        beats: [
          { beat_type: 'narration', body: 'O chefe riu.', character_name: null, character_portrait: null, illustration_asset: null }
        ]
      })),
      startRecovery: startRecoveryMock,
    })

    await render(
      <ApiContext.Provider value={api}>
        <ConsequenciaScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => expect(screen.getByText('O chefe riu.')).toBeTruthy())
    expect(screen.getByText('Evidência fraca.')).toBeTruthy()
    
    // Start recovery
    await fireEvent.press(screen.getByText('Encarar Chefe de novo'))

    await waitFor(() => expect(startRecoveryMock).toHaveBeenCalledWith('cap-1'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/capitulos/cap-1')
  })

  it('redirects to chapter if not in consequence', async () => {
    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        result: null
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({
        id: 'cap-1',
        status: 'available',
      })),
    })

    await render(
      <ApiContext.Provider value={api}>
        <ConsequenciaScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/capitulos/cap-1')
    })
  })
})
