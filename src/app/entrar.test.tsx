import { fireEvent, render, screen } from '@testing-library/react-native'

import { ApiContext } from '@/api/context'
import type { ArgumentaApi } from '@/api/client'

import EntrarScreen from './entrar'

const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()

jest.mock('@/session/useSignIn', () => ({
  useSignIn: () => ({ signIn: mockSignIn, error: mockError(), busy: mockBusy() }),
}))
jest.mock('@/auth/google', () => ({
  signInWithGoogle: () => mockSignInWithGoogle(),
}))

// mockable per test, read fresh by the mocked hook above
let currentError: string | null = null
let currentBusy = false
function mockError() {
  return currentError
}
function mockBusy() {
  return currentBusy
}

function renderScreen(api: Partial<ArgumentaApi> = {}) {
  return render(
    <ApiContext.Provider value={api as ArgumentaApi}>
      <EntrarScreen />
    </ApiContext.Provider>,
  )
}

beforeEach(() => {
  currentError = null
  currentBusy = false
  mockSignIn.mockReset().mockResolvedValue(undefined)
  mockSignInWithGoogle.mockReset()
})

describe('EntrarScreen', () => {
  it('the button starts disabled with empty fields', async () => {
    await renderScreen()

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
  })

  it('calls signIn with the email/password login once both fields are filled', async () => {
    const login = jest.fn()
    await renderScreen({ login })

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'aluno@example.com')
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo-12')
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }))

    expect(mockSignIn).toHaveBeenCalledTimes(1)
    const perform = mockSignIn.mock.calls[0][0] as () => unknown
    await perform()
    expect(login).toHaveBeenCalledWith({ email: 'aluno@example.com', password: 'segredo-12' })
  })

  it('shows the error notice the hook reports', async () => {
    currentError = 'E-mail ou senha não conferem.'
    await renderScreen()

    expect(screen.getByText('E-mail ou senha não conferem.')).toBeTruthy()
  })

  it('Google sign-in exchanges the code through signIn when a code comes back', async () => {
    mockSignInWithGoogle.mockResolvedValue({ code: 'auth-code', redirectUri: 'postmessage' })
    const loginWithGoogle = jest.fn()
    await renderScreen({ loginWithGoogle })

    await fireEvent.press(screen.getByRole('button', { name: 'Entrar com Google' }))

    expect(mockSignIn).toHaveBeenCalledTimes(1)
    const perform = mockSignIn.mock.calls[0][0] as () => unknown
    await perform()
    expect(loginWithGoogle).toHaveBeenCalledWith({
      code: 'auth-code',
      redirect_uri: 'postmessage',
    })
  })

  it('does nothing when the Google picker is dismissed', async () => {
    mockSignInWithGoogle.mockResolvedValue(null)
    await renderScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Entrar com Google' }))

    expect(mockSignIn).not.toHaveBeenCalled()
  })
})
