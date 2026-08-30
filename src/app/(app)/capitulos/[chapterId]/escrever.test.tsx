import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { ApiContext } from '@/api/context'
import { createFakeApi } from '@/api/__fixtures__/fakeApi'
import { aChapterResponse } from '@/api/__fixtures__/chapter'
import { aTrackResponse } from '@/api/__fixtures__/track'

import EscreverScreen from './escrever'
import { awaitVerdict } from '@/api/verdict'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() }
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ chapterId: 'chapter-1' }),
}))
jest.mock('@/hooks/useAppFonts', () => ({ useAppFonts: () => true }))
jest.mock('@/session/context', () => ({ useLens: () => 'enem' }))
jest.mock('@/api/verdict', () => ({ awaitVerdict: jest.fn() }))
jest.mock('./useAutosave', () => ({
  useAutosave: () => 'clean',
  AUTOSAVE_LABEL: { clean: '' }
}))

describe('Editor (EscreverScreen)', () => {
  it('renders chefe layout correctly', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ kind: 'chefe' })),
      track: jest.fn().mockResolvedValue(aTrackResponse()),
    })

    await render(
      <ApiContext.Provider value={api}>
        <EscreverScreen />
      </ApiContext.Provider>,
    )

    await waitFor(() => expect(screen.getByText('Redação-chefe')).toBeTruthy())
    expect(screen.getByText('A proposta')).toBeTruthy()
    expect(screen.getByText('Proposta de intervenção')).toBeTruthy()
  })

  beforeEach(() => {
    mockRouter.push.mockReset()
    mockRouter.replace.mockReset()
    jest.clearAllMocks()
  })

  it('renders correctly and blocks submission outside word limits', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ min_words: 3, max_words: 20 })),
      track: jest.fn().mockResolvedValue(aTrackResponse({ submissions_today: 0, daily_limit: 3 })),
    })

    await render(
      <ApiContext.Provider value={api}>
        <EscreverScreen />
      </ApiContext.Provider>,
    )

    await waitFor(() => expect(screen.getByTestId('editor-input')).toBeTruthy())
    const input = screen.getByTestId('editor-input')
    
    // Empty
    expect(screen.getByText('0 / 20 palavras')).toBeTruthy()
    expect(screen.getByText('Enviar')).toBeDisabled()

    // Under limit
    await fireEvent.changeText(input, 'one two')
    await waitFor(() => expect(screen.getByText('2 / 20 palavras')).toBeTruthy())
    expect(screen.getByText('Enviar')).toBeDisabled()

    // Good
    await fireEvent.changeText(input, 'one two three')
    await waitFor(() => expect(screen.getByText('3 / 20 palavras')).toBeTruthy())
    expect(screen.getByText('Enviar')).not.toBeDisabled()
  })

  it('submits argument and waits for evaluated verdict', async () => {
    const mockPending = { submission_id: 'sub-1', attempt_number: 1, status: 'evaluating' as const }
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ min_words: 2, max_words: 10 })),
      track: jest.fn().mockResolvedValue(aTrackResponse({ submissions_today: 0, daily_limit: 3 })),
      submit: jest.fn().mockResolvedValue(mockPending),
      telemetry: jest.fn().mockResolvedValue(undefined),
    })

    const mockVerdict = jest.mocked(awaitVerdict)
    mockVerdict.mockResolvedValueOnce({
      status: 'evaluated',
      submission: { ...mockPending, status: 'evaluated', score: 900 } as any,
    })

    await render(
      <ApiContext.Provider value={api}>
        <EscreverScreen />
      </ApiContext.Provider>,
    )

    await waitFor(() => expect(screen.getByTestId('editor-input')).toBeTruthy())

    await fireEvent.changeText(screen.getByTestId('editor-input'), 'one two three')
    await waitFor(() => expect(screen.getByText('Enviar')).not.toBeDisabled())

    await fireEvent.press(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: '/capitulos/[chapterId]/correcao',
        params: { chapterId: 'chapter-1', submissionId: 'sub-1' },
      })
    })

    expect(api.telemetry).toHaveBeenCalled()
  })

  it('shows error on failed verdict and re-enables button', async () => {
    const mockPending = { submission_id: 'sub-1', attempt_number: 1, status: 'evaluating' as const }
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ min_words: 1, max_words: 10 })),
      track: jest.fn().mockResolvedValue(aTrackResponse()),
      submit: jest.fn().mockResolvedValue(mockPending),
    })

    const mockVerdict = jest.mocked(awaitVerdict)
    mockVerdict.mockResolvedValueOnce({ status: 'failed' })

    await render(
      <ApiContext.Provider value={api}>
        <EscreverScreen />
      </ApiContext.Provider>,
    )

    await waitFor(() => expect(screen.getByTestId('editor-input')).toBeTruthy())
    await fireEvent.changeText(screen.getByTestId('editor-input'), 'good')
    await waitFor(() => expect(screen.getByText('Enviar')).not.toBeDisabled())
    
    await fireEvent.press(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(screen.getByText('A correção falhou aqui do nosso lado. Seu envio de hoje foi devolvido, tente de novo.')).toBeTruthy()
    })
    expect(screen.getByText('Enviar')).not.toBeDisabled()
  })

  it('disables submission when daily limit is reached', async () => {
    const api = createFakeApi({
      chapter: jest.fn().mockResolvedValue(aChapterResponse({ min_words: 1, max_words: 10 })),
      track: jest.fn().mockResolvedValue(aTrackResponse({ submissions_today: 3, daily_limit: 3 })),
    })

    await render(
      <ApiContext.Provider value={api}>
        <EscreverScreen />
      </ApiContext.Provider>,
    )

    await waitFor(() => expect(screen.getByTestId('editor-input')).toBeTruthy())
    await fireEvent.changeText(screen.getByTestId('editor-input'), 'good')
    
    await waitFor(() => expect(screen.getByText('Enviar')).toBeDisabled())
  })
})
