import { clearTokens, loadTokens, saveTokens } from './tokenStore'

const mockStore = new Map<string, string>()

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value)
    return Promise.resolve()
  }),
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  deleteItemAsync: jest.fn((key: string) => {
    mockStore.delete(key)
    return Promise.resolve()
  }),
}))

beforeEach(() => {
  mockStore.clear()
})

describe('tokenStore', () => {
  it('has nothing to load before any session was saved', async () => {
    await expect(loadTokens()).resolves.toBeNull()
  })

  it('loads back exactly what was saved', async () => {
    await saveTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

    await expect(loadTokens()).resolves.toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    })
  })

  it('a newer save replaces the pair, it does not merge with the old one', async () => {
    await saveTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })
    await saveTokens({ accessToken: 'access-2', refreshToken: 'refresh-2' })

    await expect(loadTokens()).resolves.toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    })
  })

  it('clear removes both tokens, logout must not leave one behind', async () => {
    await saveTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

    await clearTokens()

    await expect(loadTokens()).resolves.toBeNull()
  })
})
