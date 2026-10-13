import { describe, it, expect } from 'vitest'
import { createSeenIds } from './seenIds.js'

describe('createSeenIds', () => {
  it('remembers an id only when asked', () => {
    const seenIds = createSeenIds()
    expect(seenIds.has('bad')).toBe(false)
    seenIds.remember('ok')
    expect(seenIds.has('ok')).toBe(true)
    expect(seenIds.has('bad')).toBe(false)
  })
})
