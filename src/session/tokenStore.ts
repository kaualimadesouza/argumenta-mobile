import * as SecureStore from 'expo-secure-store'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const ACCESS_KEY = 'argumenta.access_token'
const REFRESH_KEY = 'argumenta.refresh_token'

export async function saveTokens(pair: TokenPair): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, pair.accessToken)
  await SecureStore.setItemAsync(REFRESH_KEY, pair.refreshToken)
}

/** Null unless both halves are there: a partial pair cannot refresh itself,
 *  so it is worth no more than having neither. */
export async function loadTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ])
  if (accessToken === null || refreshToken === null) return null
  return { accessToken, refreshToken }
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ])
}
