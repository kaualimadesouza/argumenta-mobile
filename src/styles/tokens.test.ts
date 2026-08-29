import { colors, fontFamily, radius, tracking, typeScale } from './tokens'

const HEX_COLOR = /^#[0-9a-f]{6}$/

describe('design tokens', () => {
  it('every color is a lowercase 6-digit hex, ported verbatim from the web tokens', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(HEX_COLOR)
    }
  })

  it('caneta is the paper source of truth color', () => {
    expect(colors.caneta).toBe('#2649e5')
  })

  it('has one font family per weight the screens use', () => {
    expect(fontFamily.regular).toBe('Inter_400Regular')
    expect(fontFamily.semiBold).toBe('Inter_600SemiBold')
    expect(fontFamily.bold).toBe('Inter_700Bold')
  })

  it('the type scale steps up from micro to display', () => {
    const steps = [
      typeScale.micro,
      typeScale.meta,
      typeScale.body,
      typeScale.lead,
      typeScale.title,
      typeScale.display,
    ]
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1])
    }
  })

  it('tracking is negative, same direction as the web tokens (tighter, not looser)', () => {
    expect(tracking.title).toBeLessThan(0)
    expect(tracking.body).toBeLessThan(0)
  })

  it('radius steps are ordered tile < button < card, and chip is a pill', () => {
    expect(radius.tile).toBeLessThan(radius.button)
    expect(radius.button).toBeLessThan(radius.card)
    expect(radius.chip).toBeGreaterThan(radius.card)
  })
})
