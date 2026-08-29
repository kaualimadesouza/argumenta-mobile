import { fireEvent, render, screen } from '@testing-library/react-native'

import { ApiContext } from '@/api/context'
import type { ArgumentaApi } from '@/api/client'

import CadastroScreen from './cadastro'

const mockSignIn = jest.fn()
let mockError: string | null = null

jest.mock('@/session/useSignIn', () => ({
  useSignIn: () => ({ signIn: mockSignIn, error: mockError, busy: false }),
}))

function renderScreen(api: Partial<ArgumentaApi> = {}) {
  return render(
    <ApiContext.Provider value={api as ArgumentaApi}>
      <CadastroScreen />
    </ApiContext.Provider>,
  )
}

beforeEach(() => {
  mockError = null
  mockSignIn.mockReset().mockResolvedValue(undefined)
})

describe('CadastroScreen', () => {
  it('the button starts disabled: short password and terms unaccepted', async () => {
    await renderScreen()

    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
  })

  it('stays disabled below the 8-character password floor even with terms accepted', async () => {
    await renderScreen()

    await fireEvent.changeText(screen.getByLabelText('Apelido'), 'Aluno')
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'aluno@example.com')
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'curta')
    await fireEvent.press(screen.getByRole('checkbox'))

    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
  })

  it('registers once nickname, e-mail, an 8+ char password and the terms are all set', async () => {
    const register = jest.fn()
    await renderScreen({ register })

    await fireEvent.changeText(screen.getByLabelText('Apelido'), 'Aluno')
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'aluno@example.com')
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo-123')
    await fireEvent.press(screen.getByRole('checkbox'))
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }))

    expect(mockSignIn).toHaveBeenCalledTimes(1)
    const perform = mockSignIn.mock.calls[0][0] as () => unknown
    await perform()
    expect(register).toHaveBeenCalledWith({
      email: 'aluno@example.com',
      nickname: 'Aluno',
      password: 'segredo-123',
      accepted_terms: true,
    })
  })

  it('shows the error notice the hook reports', async () => {
    mockError = 'Esse e-mail já tem uma conta. Entre em vez de criar.'
    await renderScreen()

    expect(screen.getByText('Esse e-mail já tem uma conta. Entre em vez de criar.')).toBeTruthy()
  })
})
