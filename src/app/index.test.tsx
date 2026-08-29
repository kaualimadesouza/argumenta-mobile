import { render, screen } from '@testing-library/react-native'

import { colors, fontFamily } from '@/styles/tokens'

import HomeScreen from './index'

const mockUseAppFonts = jest.fn()
jest.mock('@/hooks/useAppFonts', () => ({
  useAppFonts: () => mockUseAppFonts(),
}))

describe('HomeScreen', () => {
  it('shows the product name on the paper background', async () => {
    mockUseAppFonts.mockReturnValue(true)
    await render(<HomeScreen />)

    expect(screen.getByText('Argumenta')).toBeTruthy()
    expect(screen.getByTestId('home-screen')).toHaveStyle({ backgroundColor: colors.paper })
  })

  it('falls back to the system font while Inter is still downloading', async () => {
    mockUseAppFonts.mockReturnValue(false)
    await render(<HomeScreen />)

    expect(screen.getByText('Argumenta')).not.toHaveStyle({ fontFamily: fontFamily.bold })
  })

  it('switches to Inter once the fonts finish loading', async () => {
    mockUseAppFonts.mockReturnValue(true)
    await render(<HomeScreen />)

    expect(screen.getByText('Argumenta')).toHaveStyle({ fontFamily: fontFamily.bold })
  })
})
