import { fireEvent, render, screen } from '@testing-library/react-native'

import { ApiContext } from '@/api/context'
import type { ArgumentaApi } from '@/api/client'
import { SessionContext } from '@/session/context'
import type { Session, SessionStore } from '@/session/context'

import OnboardingScreen from './onboarding'

const mockReplace = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

function renderScreen(session: Session, api: Partial<ArgumentaApi> = {}, reload = jest.fn()) {
  const store: SessionStore = { session, reload, signOut: jest.fn() }
  return render(
    <ApiContext.Provider value={api as ArgumentaApi}>
      <SessionContext.Provider value={store}>
        <OnboardingScreen />
      </SessionContext.Provider>
    </ApiContext.Provider>,
  )
}

const AUTHENTICATED_NO_TARGETS: Session = {
  status: 'authenticated',
  user: { id: 'u1', email: 'a@b.com', nickname: 'Aluno', terms_accepted_at: null },
  targets: [],
}

beforeEach(() => {
  mockReplace.mockReset()
})

describe('OnboardingScreen', () => {
  it('saves the edited nickname', async () => {
    const updateNickname = jest.fn().mockResolvedValue(undefined)
    const reload = jest.fn().mockResolvedValue(undefined)
    await renderScreen(AUTHENTICATED_NO_TARGETS, { updateNickname }, reload)

    await fireEvent.changeText(screen.getByLabelText('Apelido'), 'Kauã')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }))

    expect(updateNickname).toHaveBeenCalledWith('Kauã')
    expect(reload).toHaveBeenCalled()
  })

  it('the first exam target becomes the active lens once added', async () => {
    const addTarget = jest.fn().mockResolvedValue(undefined)
    const reload = jest.fn().mockResolvedValue(undefined)
    await renderScreen(AUTHENTICATED_NO_TARGETS, { addTarget }, reload)

    await fireEvent.press(screen.getByRole('button', { name: 'ENEM' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }))

    expect(addTarget).toHaveBeenCalledWith(
      expect.objectContaining({ exam: 'enem' }),
    )
    expect(reload).toHaveBeenCalled()
  })

  it('cannot start training before at least one target exists', async () => {
    await renderScreen(AUTHENTICATED_NO_TARGETS)

    expect(screen.getByRole('button', { name: 'Começar a treinar' })).toBeDisabled()
  })

  it('starting training replaces the route once a target exists', async () => {
    const withTarget: Session = {
      ...AUTHENTICATED_NO_TARGETS,
      targets: [{ id: 't1', exam: 'enem', year: 2027, is_active: true }],
    }
    await renderScreen(withTarget)

    await fireEvent.press(screen.getByRole('button', { name: 'Começar a treinar' }))

    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('shows the active lens chip and lets the student switch it', async () => {
    const activateTarget = jest.fn().mockResolvedValue(undefined)
    const reload = jest.fn().mockResolvedValue(undefined)
    const withTwoTargets: Session = {
      ...AUTHENTICATED_NO_TARGETS,
      targets: [
        { id: 't1', exam: 'enem', year: 2027, is_active: true },
        { id: 't2', exam: 'fuvest', year: 2027, is_active: false },
      ],
    }
    await renderScreen(withTwoTargets, { activateTarget }, reload)

    expect(screen.getByText('Lente ativa')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Usar a lente FUVEST 2027' }))

    expect(activateTarget).toHaveBeenCalledWith('t2')
  })
})
