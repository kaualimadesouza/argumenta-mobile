import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'

/** Not a real URL: the code comes from the native SDK, not a browser
 *  redirect. The API forwards whatever `redirect_uri` it is given straight to
 *  Google's token endpoint, and `'postmessage'` is Google's own convention for
 *  a code obtained this way (see `google-auth-library`'s OAuth2Client). */
const SERVER_EXCHANGE_REDIRECT_URI = 'postmessage'

let configured = false

function ensureConfigured(): void {
  if (configured) return
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  if (webClientId === undefined || webClientId === '') {
    throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set (see .env.example)')
  }
  GoogleSignin.configure({ webClientId, offlineAccess: true })
  configured = true
}

export interface GoogleAuthorization {
  code: string
  redirectUri: string
}

/** Null means the student closed the account picker: not an error, no
 *  sign-in attempted. */
export async function signInWithGoogle(): Promise<GoogleAuthorization | null> {
  ensureConfigured()
  try {
    await GoogleSignin.hasPlayServices()
    const response = await GoogleSignin.signIn()
    if (!isSuccessResponse(response)) return null
    const code = response.data.serverAuthCode
    if (code === null) throw new Error('Google did not return a server auth code')
    return { code, redirectUri: SERVER_EXCHANGE_REDIRECT_URI }
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) return null
    throw error
  }
}
