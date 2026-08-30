import * as SecureStore from 'expo-secure-store'

const ASKED_KEY = 'argumenta.push_asked'
const TOKEN_KEY = 'argumenta.push_token'

export async function hasAskedPushPermission(): Promise<boolean> {
  const asked = await SecureStore.getItemAsync(ASKED_KEY)
  return asked === 'yes'
}

export async function markPushPermissionAsked(): Promise<void> {
  await SecureStore.setItemAsync(ASKED_KEY, 'yes')
}

export async function getSavedPushToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY)
}

export async function savePushToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearPushToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}
