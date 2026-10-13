import { describe, expect, it } from 'vitest'
import { overallPercent, sectionProgress } from './progress.js'

const sections = [
  { id: 'a', steps: [{ id: 's1' }, { id: 's2' }] },
  { id: 'b', steps: [{ id: 's3' }] },
]

describe('progress', () => {
  it('computes section and overall percent', () => {
    const done = new Set(['s1', 's3'])
    const perSection = sectionProgress(sections, done)
    expect(perSection[0]).toMatchObject({ completed: 1, total: 2, percent: 50 })
    expect(perSection[1]).toMatchObject({ completed: 1, total: 1, percent: 100 })
    expect(overallPercent(sections, done)).toBe(67)
  })
})
