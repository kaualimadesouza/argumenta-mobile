import { useCallback } from 'react'
import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

import { useApi } from '@/api/context'
import { hasAskedPushPermission, markPushPermissionAsked, savePushToken } from './pushStore'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function usePushRegistration() {
  const api = useApi()

  const register = useCallback(async () => {
    // Only physical devices can receive push notifications
    if (!Device.isDevice) return

    const asked = await hasAskedPushPermission()
    if (asked) return

    await markPushPermissionAsked()

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') return

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
    
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      })

      if (token) {
        await api.registerPushDevice({
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          token,
        })
        await savePushToken(token)
      }
    } catch (e) {
      // Failed to get token or register with API
    }
  }, [api])

  return register
}
