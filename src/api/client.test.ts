import { ApiError } from './ApiError'
import { createHttpApi } from './client'

const mockLoadTokens = jest.fn()
const mockSaveTokens = jest.fn()
const mockClearTokens = jest.fn()

jest.mock('@/session/tokenStore', () => ({
  loadTokens: () => mockLoadTokens(),
  saveTokens: (pair: unknown) => mockSaveTokens(pair),
  clearTokens: () => mockClearTokens(),
}))

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

let fetchMock: jest.Mock

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = 'https://api.test'
  fetchMock = jest.fn()
  globalThis.fetch = fetchMock as unknown as typeof fetch
  mockLoadTokens.mockReset().mockResolvedValue(null)
  mockSaveTokens.mockReset()
  mockClearTokens.mockReset()
})

describe('createHttpApi', () => {
  it('sends the body as JSON with the mobile client header', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 'u1', nickname: 'Aluno' }))

    const user = await createHttpApi().login({ email: 'a@b.com', password: 'segredo-12' })

    expect(user.nickname).toBe('Aluno')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.test/auth/login')
    expect(init.method).toBe('POST')
    expect(init.headers['X-Argumenta-Client']).toBe('mobile')
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.com', password: 'segredo-12' })
  })

  it('saves the tokens to SecureStore when the response carries them', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, {
        id: 'u1',
        nickname: 'Aluno',
        access_token: 'access-1',
        refresh_token: 'refresh-1',
      }),
    )

    await createHttpApi().register({
      email: 'a@b.com',
      nickname: 'Aluno',
      password: 'segredo-12',
      accepted_terms: true,
    })

    expect(mockSaveTokens).toHaveBeenCalledWith({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    })
  })

  it('attaches the stored access token as a Bearer header', async () => {
    mockLoadTokens.mockResolvedValue({ accessToken: 'access-1', refreshToken: 'refresh-1' })
    fetchMock.mockResolvedValue(jsonResponse(200, { user: { nickname: 'Aluno' }, targets: [] }))

    await createHttpApi().me()

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer access-1')
  })

  it('204 does not try to read any body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(createHttpApi().logout()).resolves.toBeUndefined()
  })

  it('a domain error comes with the code the API sent', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { detail: 'EmailAlreadyRegisteredError' }))

    const failure = createHttpApi().register({
      email: 'a@b.com',
      nickname: 'Aluno',
      password: 'segredo-12',
      accepted_terms: true,
    })

    await expect(failure).rejects.toThrow(ApiError)
    await expect(failure).rejects.toMatchObject({
      status: 409,
      code: 'EmailAlreadyRegisteredError',
    })
  })

  it('a pydantic validation error becomes a single code', async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { detail: [{ loc: ['body'], msg: 'nope' }] }))

    await expect(createHttpApi().me()).rejects.toMatchObject({ code: 'ValidationError' })
  })

  it('a 401 renews the session once with the stored refresh token, then repeats the call', async () => {
    mockLoadTokens.mockResolvedValueOnce(null).mockResolvedValueOnce({
      accessToken: 'stale-access',
      refreshToken: 'refresh-1',
    })
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'invalid or expired token' }))
      .mockResolvedValueOnce(
        jsonResponse(200, { access_token: 'new-access', refresh_token: 'new-refresh' }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { user: { nickname: 'Aluno' }, targets: [] }))

    const me = await createHttpApi().me()

    expect(me.user.nickname).toBe('Aluno')
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      'https://api.test/me',
      'https://api.test/auth/refresh',
      'https://api.test/me',
    ])
    const [, refreshInit] = fetchMock.mock.calls[1]
    expect(refreshInit.headers.Authorization).toBe('Bearer refresh-1')
    expect(mockSaveTokens).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    })
  })

  it('a 401 with no stored tokens propagates immediately, no renewal attempted', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { detail: 'not authenticated' }))

    await expect(createHttpApi().me()).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('a failed renewal clears the stored tokens and propagates the original 401', async () => {
    mockLoadTokens.mockResolvedValue({ accessToken: 'stale-access', refreshToken: 'stale-refresh' })
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'invalid or expired token' }))
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'invalid or expired refresh token' }))

    await expect(createHttpApi().me()).rejects.toMatchObject({ status: 401 })
    expect(mockClearTokens).toHaveBeenCalled()
  })

  it('a 401 from login itself does not trigger a renewal attempt', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { detail: 'InvalidCredentialsError' }))

    await expect(
      createHttpApi().login({ email: 'a@b.com', password: 'errada' }),
    ).rejects.toMatchObject({ code: 'InvalidCredentialsError' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
