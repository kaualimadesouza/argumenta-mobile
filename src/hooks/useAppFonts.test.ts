import { renderHook } from '@testing-library/react-native'

import { useAppFonts } from './useAppFonts'

jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: () => [true, null],
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_600SemiBold: 'Inter_600SemiBold',
  Inter_700Bold: 'Inter_700Bold',
}))

describe('useAppFonts', () => {
  it('mirrors the loaded flag from expo-google-fonts', async () => {
    const { result } = await renderHook(() => useAppFonts())
    expect(result.current).toBe(true)
  })
})
