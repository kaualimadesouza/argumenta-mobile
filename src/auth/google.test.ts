const mockConfigure = jest.fn()
const mockHasPlayServices = jest.fn().mockResolvedValue(true)
const mockSignIn = jest.fn()

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: (...args: unknown[]) => mockConfigure(...args),
    hasPlayServices: () => mockHasPlayServices(),
    signIn: () => mockSignIn(),
  },
  isSuccessResponse: (response: { type: string }) => response.type === 'success',
  isErrorWithCode: (error: unknown): error is { code: string } =>
    typeof error === 'object' && error !== null && 'code' in error,
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
}))

/** `google.ts` remembers whether it already configured across calls, exactly
 *  as it would across screens in one app launch; a fresh module instance per
 *  test keeps that memory from leaking between cases. */
function freshSignInWithGoogle(): typeof import('./google').signInWithGoogle {
  jest.resetModules()
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- reset the module's memory between tests
  return (require('./google') as typeof import('./google')).signInWithGoogle
}

beforeEach(() => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'web-client-id.apps.googleusercontent.com'
  mockConfigure.mockReset()
  mockSignIn.mockReset()
})

describe('signInWithGoogle', () => {
  it('returns the server auth code with the postmessage convention on success', async () => {
    const signInWithGoogle = freshSignInWithGoogle()
    mockSignIn.mockResolvedValue({ type: 'success', data: { serverAuthCode: 'auth-code-1' } })

    const result = await signInWithGoogle()

    expect(result).toEqual({ code: 'auth-code-1', redirectUri: 'postmessage' })
  })

  it('configures with the web client id and offline access, once', async () => {
    const signInWithGoogle = freshSignInWithGoogle()
    mockSignIn.mockResolvedValue({ type: 'success', data: { serverAuthCode: 'auth-code-1' } })

    await signInWithGoogle()
    await signInWithGoogle()

    expect(mockConfigure).toHaveBeenCalledTimes(1)
    expect(mockConfigure).toHaveBeenCalledWith({
      webClientId: 'web-client-id.apps.googleusercontent.com',
      offlineAccess: true,
    })
  })

  it('returns null when the account picker is dismissed without a pick', async () => {
    const signInWithGoogle = freshSignInWithGoogle()
    mockSignIn.mockResolvedValue({ type: 'cancelled' })

    await expect(signInWithGoogle()).resolves.toBeNull()
  })

  it('returns null when Google reports the sign-in was cancelled', async () => {
    const signInWithGoogle = freshSignInWithGoogle()
    mockSignIn.mockRejectedValue({ code: 'SIGN_IN_CANCELLED' })

    await expect(signInWithGoogle()).resolves.toBeNull()
  })

  it('rethrows an unrelated failure', async () => {
    const signInWithGoogle = freshSignInWithGoogle()
    mockSignIn.mockRejectedValue(new Error('play services unavailable'))

    await expect(signInWithGoogle()).rejects.toThrow('play services unavailable')
  })

  it('fails loudly when offline access was not actually granted', async () => {
    const signInWithGoogle = freshSignInWithGoogle()
    mockSignIn.mockResolvedValue({ type: 'success', data: { serverAuthCode: null } })

    await expect(signInWithGoogle()).rejects.toThrow('server auth code')
  })

  it('fails loudly when the web client id is not configured', async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    const signInWithGoogle = freshSignInWithGoogle()

    await expect(signInWithGoogle()).rejects.toThrow('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID')
  })
})
