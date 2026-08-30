import { fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'

import type { ArgumentaApi } from '@/api/client'
import { ApiError } from '@/api/ApiError'
import { ApiContext } from '@/api/context'

import { SessionProvider } from './SessionProvider'
import { useSession } from './context'

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

function Probe() {
  const { session, signOut, reload } = useSession()
  const label =
    session.status === 'authenticated' ? `authenticated:${session.user.nickname}` : session.status
  return (
    <>
      <Text>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => void signOut()}>
        <Text>sair</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void reload()}>
        <Text>tentar de novo</Text>
      </Pressable>
    </>
  )
}

async function renderWithApi(api: Partial<ArgumentaApi>) {
  return render(
    <ApiContext.Provider value={api as ArgumentaApi}>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </ApiContext.Provider>,
  )
}

describe('SessionProvider', () => {
  it('clears push token and notifies API on logout', async () => {
    require('expo-secure-store').getItemAsync.mockResolvedValueOnce('ExponentPushToken[mocked]')
    const api = {
      me: jest.fn().mockResolvedValue({ user: { nickname: 'Kaua' }, targets: [] }),
      logout: jest.fn().mockResolvedValue(undefined),
      removePushDevice: jest.fn().mockResolvedValue(undefined),
    }

    await renderWithApi(api)
    await screen.findByText('authenticated:Kaua')

    await fireEvent.press(screen.getByText('sair'))

    await screen.findByText('anonymous')
    expect(api.removePushDevice).toHaveBeenCalledWith({ token: 'ExponentPushToken[mocked]' })
    expect(require('expo-secure-store').deleteItemAsync).toHaveBeenCalledWith('argumenta.push_token')
  })

  it('becomes authenticated once /me answers', async () => {
    const me = jest
      .fn()
      .mockResolvedValue({ user: { nickname: 'Aluno' }, targets: [{ exam: 'enem' }] })
    await renderWithApi({ me })

    expect(await screen.findByText('authenticated:Aluno')).toBeTruthy()
  })

  it('becomes anonymous when /me answers 401', async () => {
    const me = jest.fn().mockRejectedValue(new ApiError(401, 'not authenticated'))
    await renderWithApi({ me })

    expect(await screen.findByText('anonymous')).toBeTruthy()
  })

  it('becomes unavailable on any other failure, it does not log the student out', async () => {
    const me = jest.fn().mockRejectedValue(new TypeError('Network request failed'))
    await renderWithApi({ me })

    expect(await screen.findByText('unavailable')).toBeTruthy()
  })

  it('reload retries after an unavailable session', async () => {
    const me = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce({ user: { nickname: 'Aluno' }, targets: [] })
    await renderWithApi({ me })
    await screen.findByText('unavailable')

    await fireEvent.press(screen.getByText('tentar de novo'))

    expect(await screen.findByText('authenticated:Aluno')).toBeTruthy()
  })

  it('signOut calls the API and returns to anonymous', async () => {
    const me = jest.fn().mockResolvedValue({ user: { nickname: 'Aluno' }, targets: [] })
    const logout = jest.fn().mockResolvedValue(undefined)
    await renderWithApi({ me, logout })
    await screen.findByText('authenticated:Aluno')

    await fireEvent.press(screen.getByText('sair'))

    expect(logout).toHaveBeenCalled()
    expect(await screen.findByText('anonymous')).toBeTruthy()
  })
})
