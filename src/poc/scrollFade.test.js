import { describe, expect, it } from 'vitest'
import { scrollOverflowFlags } from './scrollFade.js'

function mockEl(overrides) {
  return {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 100,
    scrollWidth: 100,
    clientHeight: 100,
    clientWidth: 100,
    ...overrides,
  }
}

describe('scrollOverflowFlags', () => {
  it('returns no edges when content fits', () => {
    expect(scrollOverflowFlags(mockEl())).toEqual({
      top: false,
      bottom: false,
      left: false,
      right: false,
    })
  })

  it('signals bottom when vertical overflow at top', () => {
    expect(
      scrollOverflowFlags(
        mockEl({ scrollHeight: 200, clientHeight: 100, scrollTop: 0 }),
      ),
    ).toEqual({
      top: false,
      bottom: true,
      left: false,
      right: false,
    })
  })

  it('signals top and bottom in the middle of vertical scroll', () => {
    expect(
      scrollOverflowFlags(
        mockEl({
          scrollHeight: 300,
          clientHeight: 100,
          scrollTop: 100,
        }),
      ),
    ).toEqual({
      top: true,
      bottom: true,
      left: false,
      right: false,
    })
  })

  it('signals right when horizontal overflow at start', () => {
    expect(
      scrollOverflowFlags(
        mockEl({ scrollWidth: 220, clientWidth: 100, scrollLeft: 0 }),
      ),
    ).toEqual({
      top: false,
      bottom: false,
      left: false,
      right: true,
    })
  })
})
