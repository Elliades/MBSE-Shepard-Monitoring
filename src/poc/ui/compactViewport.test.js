import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COMPACT_SHORT_HEIGHT,
  PIXEL7_LANDSCAPE,
  PIXEL7_PORTRAIT,
  SCENE_RESERVE_PX,
  SHEET_OPEN_FRACTION,
  isCompactViewport,
  layoutBudget,
} from './compactViewport.js'

describe('isCompactViewport', () => {
  it('uses the sheet layout on a Pixel 7 in portrait', () => {
    expect(isCompactViewport(PIXEL7_PORTRAIT)).toBe(true)
  })

  it('uses the sheet layout on a Pixel 7 in landscape', () => {
    expect(isCompactViewport(PIXEL7_LANDSCAPE)).toBe(true)
  })

  it('keeps the side column on a desktop', () => {
    expect(isCompactViewport({ width: 1440, height: 900 })).toBe(false)
  })

  it('keeps the side column on a laptop', () => {
    expect(isCompactViewport({ width: 1280, height: 800 })).toBe(false)
  })
})

describe('layoutBudget', () => {
  it('keeps the pasture fully visible on a Pixel 7 in portrait', () => {
    const peek = layoutBudget(PIXEL7_PORTRAIT, { sheetOpen: false })
    const open = layoutBudget(PIXEL7_PORTRAIT, { sheetOpen: true })

    expect(peek.scene).toBeGreaterThan(700)
    expect(open.scene).toBeGreaterThanOrEqual(370)
    expect(open.sheet).toBe(Math.round(PIXEL7_PORTRAIT.height * SHEET_OPEN_FRACTION))
  })

  it('keeps the pasture and the signal dock together on a Pixel 7 in landscape', () => {
    const peek = layoutBudget(PIXEL7_LANDSCAPE, { sheetOpen: false })
    const open = layoutBudget(PIXEL7_LANDSCAPE, { sheetOpen: true })

    expect(peek.scene).toBeGreaterThanOrEqual(200)
    expect(open.scene).toBeGreaterThanOrEqual(SCENE_RESERVE_PX)
    expect(open.sheet).toBeLessThan(PIXEL7_LANDSCAPE.height)
  })
})

describe('compact stylesheet', () => {
  it('reserves the pasture and caps the open sheet the way the budget describes', () => {
    const sceneCss = readFileSync(new URL('./SceneApp.css', import.meta.url), 'utf8')
    const sheetCss = readFileSync(new URL('./SceneSheet.css', import.meta.url), 'utf8')
    expect(sceneCss).toContain('scene-app-poc--compact')
    expect(sheetCss).toContain('58dvh')
    expect(sheetCss).toContain('calc(100dvh - 7.5rem)')
    expect(sheetCss).toContain('max-height: 9rem')
    expect(sceneCss).toContain(`${COMPACT_SHORT_HEIGHT}px`)
  })
})
