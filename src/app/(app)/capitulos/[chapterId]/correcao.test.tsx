import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { ApiContext } from '@/api/context'
import { createFakeApi } from '@/api/__fixtures__/fakeApi'
import { aChapterResponse } from '@/api/__fixtures__/chapter'
import CorrecaoScreen from './correcao'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() }
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ chapterId: 'chapter-1', submissionId: 'sub-1' }),
}))
jest.mock('@/hooks/useAppFonts', () => ({ useAppFonts: () => true }))
jest.mock('@/session/usePushRegistration', () => ({
  usePushRegistration: () => jest.fn(),
}))

describe('CorrecaoScreen', () => {
  it('registers push token when verdict is approved', async () => {
    const mockRegisterPush = jest.fn()
    jest.spyOn(require('@/session/usePushRegistration'), 'usePushRegistration').mockReturnValue(mockRegisterPush)

    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        submission_id: 'sub-3',
        attempt_number: 1,
        status: 'evaluated',
        result: {
          verdict: 'approved',
          average_score: 900,
          floor_value: 600,
          min_average: 600,
          chapter_status: 'passed',
          scores: [],
          annotations: [],
          para_passar: [],
          lens: { exam: 'enem', version: '1', criteria: [], total: null, total_max: null, scale_source: 'board' },
        },
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ draft_body: '...' })),
      reaction: jest.fn().mockResolvedValue({ beat: 'convinced', character_name: 'Boss', body: 'OK', provisional: false }),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CorrecaoScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => expect(screen.getByText('Você convenceu.')).toBeTruthy())
    expect(mockRegisterPush).toHaveBeenCalled()
  })

  it('renders full scoreboard (C5 and total) when lens includes them', async () => {
    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        submission_id: 'sub-2',
        attempt_number: 1,
        status: 'evaluated',
        result: {
          verdict: 'approved',
          average_score: 960,
          floor_value: 120,
          min_average: 600,
          chapter_status: 'passed',
          scores: [],
          annotations: [],
          para_passar: [],
          lens: { 
            exam: 'enem', 
            version: '1', 
            criteria: [
              { code: 'C1', label: 'Domínio', dimension: 'norma_culta', score: 160, scale_max: 200, is_argumenta_extra: false },
              { code: 'C5', label: 'Proposta', dimension: 'proposta_intervencao', score: 200, scale_max: 200, is_argumenta_extra: false },
            ], 
            total: 960, 
            total_max: 1000, 
            scale_source: 'board' 
          },
        },
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ draft_body: 'Texto bom.' })),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CorrecaoScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => expect(screen.getByText('Placar')).toBeTruthy())
    
    // Check that C5 is rendered
    expect(screen.getByText('C5')).toBeTruthy()
    expect(screen.getByText('Proposta')).toBeTruthy()
    expect(screen.getByText('200/200')).toBeTruthy()

    // Check that total is rendered
    expect(screen.getByText('Soma dos critérios')).toBeTruthy()
    expect(screen.getByText('960/1000')).toBeTruthy()
  })

  beforeEach(() => {
    mockRouter.replace.mockReset()
  })

  it('handles approved verdict: shows reaction and advances', async () => {
    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        submission_id: 'sub-1',
        attempt_number: 1,
        status: 'evaluated',
        result: {
          verdict: 'approved',
          average_score: 900,
          floor_value: 600,
          min_average: 600,
          chapter_status: 'passed',
          scores: [],
          annotations: [],
          para_passar: [],
          lens: { exam: 'enem', version: '1', criteria: [], total: null, total_max: null, scale_source: 'board' },
        },
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ draft_body: 'Texto bom.' })),
      reaction: jest.fn().mockResolvedValue({ beat: 'convinced', character_name: 'Boss', body: 'Muito bem!', provisional: true }),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CorrecaoScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => expect(screen.getByText('Muito bem!')).toBeTruthy())
    
    // Tap to advance
    await fireEvent.press(screen.getByText('Continuar a história'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/trilha')
  })

  it('handles technical failure: back to editor', async () => {
    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        submission_id: 'sub-1',
        attempt_number: 1,
        status: 'evaluated',
        result: {
          verdict: 'failed_technical',
          average_score: 500,
          floor_value: 600,
          min_average: 600,
          chapter_status: 'drafting',
          scores: [],
          annotations: [
            { span_start: 0, span_end: 5, type: 'spelling', severity: 'error', message: 'Erro aqui', suggestion: 'Assado', priority: 1 }
          ],
          para_passar: [],
          lens: { exam: 'enem', version: '1', criteria: [], total: null, total_max: null, scale_source: 'board' },
        },
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ draft_body: 'Texto ruim.' })),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CorrecaoScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => expect(screen.getByText('Quase. A norma culta segurou você.')).toBeTruthy())

    // Tap span to open the explanation sheet: the suggestion lives only there,
    // while the message also appears in the legend, hence two occurrences.
    await fireEvent.press(screen.getByText('Texto'))
    await waitFor(() => expect(screen.getByText('Assado')).toBeTruthy())
    expect(screen.getAllByText('Erro aqui')).toHaveLength(2)

    // Tap to go back
    await fireEvent.press(screen.getByText('Revisar meu texto'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/capitulos/chapter-1/escrever')
  })

  it('handles persuasion failure: goes to consequence', async () => {
    const api = createFakeApi({
      submission: jest.fn().mockResolvedValue({
        submission_id: 'sub-1',
        attempt_number: 1,
        status: 'evaluated',
        result: {
          verdict: 'failed_persuasion',
          average_score: 900,
          floor_value: 600,
          min_average: 600,
          chapter_status: 'in_consequence',
          scores: [],
          annotations: [],
          para_passar: [],
          lens: { exam: 'enem', version: '1', criteria: [], total: null, total_max: null, scale_source: 'board' },
        },
      }),
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ id: 'chapter-1', draft_body: 'Texto bom mas não convenceu.' })),
      reaction: jest.fn().mockResolvedValue({ beat: 'rebuttal', character_name: 'Boss', body: 'Não ligo.', provisional: false }),
    })

    await render(
      <ApiContext.Provider value={api}>
        <CorrecaoScreen />
      </ApiContext.Provider>
    )

    await waitFor(() => expect(screen.getByText('Não ligo.')).toBeTruthy())

    await fireEvent.press(screen.getByText('Ver o que aconteceu'))
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/capitulos/chapter-1/consequencia',
      params: { submissionId: 'sub-1' },
    })
  })
})
