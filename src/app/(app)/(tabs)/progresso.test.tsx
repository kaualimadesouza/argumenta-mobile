import { render, screen, waitFor } from '@testing-library/react-native'
import { ApiContext } from '@/api/context'
import { createFakeApi } from '@/api/__fixtures__/fakeApi'
import Progresso from './progresso'

jest.mock('@/hooks/useAppFonts', () => ({ useAppFonts: () => true }))

const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && /act\(\.\.\.\)/.test(args[0])) return
    originalError(...args)
  }
})
afterAll(() => {
  console.error = originalError
})

describe('ProgressoScreen', () => {
  it('renders progress data correctly', async () => {
    const api = createFakeApi({
      progress: jest.fn().mockResolvedValue({
        exam: 'enem',
        lens_version: '1',
        streak_days: 3,
        longest_streak_days: 5,
        submissions_today: 1,
        daily_limit: 5,
        stories_completed: 2,
        stories_total: 10,
        dimensions: [
          {
            dimension: 'norma_culta',
            criterion_code: 'C1',
            criterion_label: 'Domínio da norma',
            points: [
              { day: '2023-10-01', score: 120 },
              { day: '2023-10-02', score: 160 },
            ],
          },
          {
            dimension: 'coesao',
            criterion_code: null, // Hidden
            criterion_label: null,
            points: [],
          },
        ],
        milestones: [
          { code: 'tutorial_completed', done: true },
          { code: 'first_boss_essay', done: false },
        ],
      }),
    })

    render(
      <ApiContext.Provider value={api}>
        <Progresso />
      </ApiContext.Provider>
    )

    // Header
    await waitFor(() => expect(screen.getByText('Progresso')).toBeTruthy())
    expect(screen.getByText('Lente ENEM')).toBeTruthy()

    // Streak
    expect(screen.getByText('3 dias seguidos')).toBeTruthy()
    expect(screen.getByText('Seu recorde é 5 dias')).toBeTruthy()

    // Dimensions
    expect(screen.getByText('C1')).toBeTruthy()
    expect(screen.getByText('Domínio da norma')).toBeTruthy()
    expect(screen.getByText('160')).toBeTruthy() // latest
    expect(screen.getByText('+40')).toBeTruthy() // delta

    expect(screen.getByText('Coesão')).toBeTruthy()
    expect(screen.getByText('sem envio ainda')).toBeTruthy()
    expect(screen.queryByText('C2')).toBeFalsy() // should not show null code

    // Milestones
    expect(screen.getByText('2 de 10 histórias concluídas')).toBeTruthy()
    expect(screen.getByText('Tutorial concluído')).toBeTruthy()
    expect(screen.getByText('Primeira redação-chefe')).toBeTruthy()
  })
})
