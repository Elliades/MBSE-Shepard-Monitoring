import { describe, expect, it } from 'vitest'
import { CAMEO_REFS } from '../cameoRefs.js'
import { extractRefKeys } from '../parseBody.js'
import { PART1_SECTIONS, ALL_STEP_IDS } from './part1.js'

describe('part1 script', () => {
  it('step ids are unique', () => {
    expect(new Set(ALL_STEP_IDS).size).toBe(ALL_STEP_IDS.length)
  })

  it('every {ref:x} in steps exists in CAMEO_REFS', () => {
    const missing = []
    for (const section of PART1_SECTIONS) {
      for (const step of section.steps) {
        const texts = [
          step.body,
          ...(step.bullets ?? []),
          ...(step.tasks ?? []).map((task) => task.body),
        ].filter(Boolean)
        for (const text of texts) {
          for (const key of extractRefKeys(text)) {
            if (!CAMEO_REFS[key]) missing.push(`${step.id}: ${key}`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('every quiz has at least one correct answer', () => {
    for (const section of PART1_SECTIONS) {
      for (const step of section.steps) {
        const quiz = step.quiz
        if (!quiz) continue
        expect(quiz.correct.length).toBeGreaterThan(0)
        const optionIds = new Set(quiz.options.map((o) => o.id))
        for (const id of quiz.correct) {
          expect(optionIds.has(id)).toBe(true)
        }
        if (quiz.mode === 'multiple' && quiz.id === 'q2') {
          expect(quiz.correct).toHaveLength(4)
        }
      }
    }
  })
})
