import { describe, it, expect } from 'vitest'
import { LocalStm } from './machine.js'
import { STEPS } from './stepNames.js'

describe('LocalStm', () => {
  it('accepts a legal signal', () => {
    const stm = new LocalStm()

    const result = stm.accept('Start SOI')

    expect(result).toEqual({ accepted: true, step: STEPS.Unconfigured })
    expect(stm.step).toBe(STEPS.Unconfigured)
  })

  it('accepts a transition that stays on the same step', () => {
    const stm = new LocalStm(STEPS.Unconfigured)

    const result = stm.accept('FlightPlan Check Failed')

    expect(result.accepted).toBe(true)
    expect(stm.step).toBe(STEPS.Unconfigured)
  })

  it('rejects an illegal signal', () => {
    const stm = new LocalStm()

    const result = stm.accept('FlightPlan')

    expect(result).toEqual({ accepted: false, step: STEPS.Off })
    expect(stm.step).toBe(STEPS.Off)
  })

  it('reset returns to Off', () => {
    const stm = new LocalStm()
    stm.accept('Start SOI')

    stm.reset()

    expect(stm.step).toBe(STEPS.Off)
  })
})
