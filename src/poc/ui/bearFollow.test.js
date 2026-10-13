import { describe, it, expect } from 'vitest'
import {
  SAFE_BOX,
  TRACK_BOX,
  bearAt,
  createCounteractionState,
  counteractionTick,
  perimeterLength,
  pointAtPerimeter,
  bearTrackContinue,
  followStep,
  isInsideSafeZone,
  isInsideTracking,
  leaveSafeStep,
} from './bearFollow.js'

describe('bearAt', () => {
  it('walks outside the tracking ring before stepping in', () => {
    const start = bearAt(0, 'track')
    const outside = bearAt(2000, 'track')
    expect(isInsideTracking(start)).toBe(false)
    expect(outside.moving).toBe(true)
    expect(isInsideTracking(outside)).toBe(false)
    expect(outside.y).toBeLessThan(start.y)
  })

  it('stops at the end of the outside walk', () => {
    const held = bearAt(3400 + 400, 'track')
    expect(held.moving).toBe(false)
    expect(isInsideTracking(held)).toBe(false)
    expect(held.y).toBeCloseTo(91, 0)
  })

  it('is inside the tracking ring after the entry', () => {
    const inside = bearAt(3400 + 650 + 4000, 'track')
    expect(isInsideTracking(inside)).toBe(true)
  })

  it('never enters the safe zone while tracking', () => {
    const margin = { x: 3, y: 4 }
    for (let t = 0; t <= 70000; t += 200) {
      const bear = bearAt(t, 'track')
      const outside =
        bear.x + margin.x <= SAFE_BOX.left ||
        bear.x - margin.x >= SAFE_BOX.right ||
        bear.y + margin.y <= SAFE_BOX.top ||
        bear.y - margin.y >= SAFE_BOX.bottom
      expect(outside, `t=${t} at ${bear.x},${bear.y}`).toBe(true)
    }
  })
})

describe('counteractionTick', () => {
  it('approaches the safe perimeter from the current position', () => {
    const origin = { x: 90, y: 84 }
    let state = createCounteractionState(origin, { x: 60, y: 50 })
    state = counteractionTick(state, 900)
    expect(state.bear.x).toBeLessThan(origin.x)
    expect(state.bear.y).toBeLessThan(origin.y)
  })

  it('keeps the drone off the bear during counteraction', () => {
    let state = createCounteractionState({ x: 90, y: 84 }, { x: 55, y: 45 })
    for (let i = 0; i < 280; i += 1) {
      state = counteractionTick(state, 16)
      const dist = Math.hypot(state.drone.x - state.bear.x, state.drone.y - state.bear.y)
      expect(dist).toBeGreaterThan(7)
    }
  })

  it('herds the bear along the safe-zone outline instead of sticking inside', () => {
    let state = createCounteractionState({ x: 90, y: 84 }, { x: 55, y: 45 })
    for (let i = 0; i < 400; i += 1) {
      state = counteractionTick(state, 16)
      if (state.phase === 'herd') break
    }
    expect(state.phase).toBe('herd')
    const s0 = state.s
    for (let j = 0; j < 120; j += 1) {
      state = counteractionTick(state, 16)
    }
    expect(Math.abs(state.s - s0)).toBeGreaterThan(0.2)
    const onEdge = pointAtPerimeter(state.s)
    expect(Math.hypot(state.bear.x - onEdge.x, state.bear.y - onEdge.y)).toBeLessThan(0.2)
    expect(isInsideSafeZone(state.bear)).toBe(true)
    expect(state.s).toBeLessThan(perimeterLength())
  })
})

describe('leaveSafeStep', () => {
  const origins = [
    { x: 50, y: 48 },
    { x: 79, y: 50 },
    { x: 21, y: 40 },
    { x: 40, y: 20 },
    { x: 55, y: 76 },
  ]

  it('walks out of the safe zone into the tracking band without a jump', () => {
    for (const origin of origins) {
      let bear = { ...origin }
      let landed = null
      for (let i = 0; i < 500; i += 1) {
        const next = leaveSafeStep(bear, 16)
        const jump = Math.hypot(next.x - bear.x, next.y - bear.y)
        expect(jump, `${origin.x},${origin.y} frame ${i}`).toBeLessThan(0.25)
        expect(isInsideTracking(next) || isInsideSafeZone(next)).toBe(true)
        bear = next
        if (next.arrived) {
          landed = next
          break
        }
      }
      expect(landed, `origin ${origin.x},${origin.y}`).toBeTruthy()
      expect(isInsideSafeZone(landed)).toBe(false)
      expect(isInsideTracking(landed)).toBe(true)
    }
  })

  it('keeps the ring walk outside the safe zone after the exit', () => {
    let bear = leaveSafeStep({ x: 60, y: 70 }, 16)
    let guard = 0
    while (!bear.arrived && guard < 500) {
      bear = leaveSafeStep(bear, 16)
      guard += 1
    }
    for (let t = 0; t <= 20000; t += 200) {
      const walked = bearTrackContinue(t, bear, bear.heading)
      const outside =
        walked.x + 2 <= SAFE_BOX.left ||
        walked.x - 2 >= SAFE_BOX.right ||
        walked.y + 2 <= SAFE_BOX.top ||
        walked.y - 2 >= SAFE_BOX.bottom
      expect(outside, `t=${t} at ${walked.x},${walked.y}`).toBe(true)
    }
  })
})

describe('followStep', () => {
  it('holds the drone while the bear is stopped', () => {
    const state = {
      bear: { x: 84, y: 22 },
      drone: { x: 70, y: 18 },
      offset: { x: -14, y: -4 },
    }
    const next = followStep(state, { x: 84, y: 22, moving: false })
    expect(next.drone).toEqual(state.drone)
  })

  it('moves the drone while the bear moves', () => {
    const state = {
      bear: { x: 90, y: 40 },
      drone: { x: 70, y: 30 },
      offset: { x: -14, y: 0 },
    }
    const next = followStep(state, { x: 84, y: 40, moving: true })
    expect(next.drone.x).not.toBe(state.drone.x)
  })

  it('stops the drone on the tracking edge while the bear stays outside', () => {
    let state = {
      bear: { x: 68, y: 94 },
      drone: { x: 60, y: 70 },
      offset: { x: -14, y: 0 },
    }
    for (let i = 0; i < 400; i += 1) {
      state = followStep(state, { x: 68, y: 91, moving: true })
    }
    expect(isInsideTracking(state.drone)).toBe(true)
    expect(state.drone.y).toBeGreaterThan(TRACK_BOX.bottom - 8)
    expect(state.drone.y).toBeLessThanOrEqual(TRACK_BOX.bottom)
  })
})
