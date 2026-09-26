/**
 * Pixel 7 CSS viewport (Chrome, default display size, DPR 2.625).
 * Portrait 412×915, landscape 915×412.
 */
export const PIXEL7_PORTRAIT = { width: 412, height: 915 }
export const PIXEL7_LANDSCAPE = { width: 915, height: 412 }

/** Phone portrait, including Pixel 7 at 412px. */
export const COMPACT_MAX_WIDTH = 480

/**
 * Short viewports up to a small laptop width.
 * Pixel 7 landscape is 915×412 and misses the width breakpoint.
 */
export const COMPACT_SHORT_HEIGHT = 520
export const COMPACT_SHORT_MAX_WIDTH = 1024

export const COMPACT_MEDIA_QUERY =
  `(max-width: ${COMPACT_MAX_WIDTH}px), (max-height: ${COMPACT_SHORT_HEIGHT}px) and (max-width: ${COMPACT_SHORT_MAX_WIDTH}px)`

/** Dock cap in the compact sheet (9rem). Step, reset, and one signal stay on screen. */
export const DOCK_MAX_PX = 144

/** Tab strip under the signal buttons (48px target + padding). */
export const TAB_BAR_PX = 56

/** Pasture kept visible above an open sheet (7.5rem). */
export const SCENE_RESERVE_PX = 120

/** Open sheet share of the viewport. Leaves the Pixel 7 portrait pasture intact. */
export const SHEET_OPEN_FRACTION = 0.58

/**
 * @param {{ width: number, height: number }} viewport
 * @returns {boolean}
 */
export function isCompactViewport({ width, height }) {
  if (width <= COMPACT_MAX_WIDTH) return true
  if (height <= COMPACT_SHORT_HEIGHT && width <= COMPACT_SHORT_MAX_WIDTH) return true
  return false
}

/**
 * Vertical split between the pasture and the bottom sheet.
 * Peek keeps only the signal dock and the tabs; an open tab adds a scrolling panel.
 * @param {{ width: number, height: number }} viewport
 * @param {{ sheetOpen?: boolean }} [options]
 * @returns {{ scene: number, sheet: number }}
 */
export function layoutBudget(viewport, { sheetOpen = false } = {}) {
  const peekSheet = DOCK_MAX_PX + TAB_BAR_PX
  const openSheet = Math.min(
    Math.round(viewport.height * SHEET_OPEN_FRACTION),
    viewport.height - SCENE_RESERVE_PX,
  )
  const sheet = sheetOpen ? openSheet : Math.min(peekSheet, viewport.height - SCENE_RESERVE_PX)
  return {
    scene: viewport.height - sheet,
    sheet,
  }
}
