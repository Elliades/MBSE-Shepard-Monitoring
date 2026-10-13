import { describe, it, expect } from 'vitest'
import {
  INITIAL_STEP,
  STEPS,
  acceptSignal,
  nextStep,
  getLegalSignals,
  visualModeForStep,
  NOMINAL_SCENARIO,
} from './steps.js'

describe('nextStep', () => {
  it('starts at Off', () => {
    expect(INITIAL_STEP).toBe(STEPS.Off)
  })

  it('follows nominal ground chain', () => {
    let s = INITIAL_STEP
    s = nextStep(s, 'Start SOI')
    expect(s).toBe(STEPS.Unconfigured)
    s = nextStep(s, 'FlightPlan')
    expect(s).toBe(STEPS.Configured)
    s = nextStep(s, 'Ready for mission')
    expect(s).toBe(STEPS.ReadyForMission)
    s = nextStep(s, 'Start Sheep Guard Mission')
    expect(s).toBe(STEPS.GoingToSafeArea)
  })

  it('keeps Unconfigured on FlightPlan Check Failed', () => {
    expect(nextStep(STEPS.Unconfigured, 'FlightPlan Check Failed')).toBe(STEPS.Unconfigured)
  })

  it('runs nominal scenario to counteraction', () => {
    let s = INITIAL_STEP
    for (const signal of NOMINAL_SCENARIO) {
      s = nextStep(s, signal)
    }
    expect(s).toBe(STEPS.PredatorCounteraction)
  })

  it('predator loop and return to patrol', () => {
    let s = STEPS.Patrolling
    s = nextStep(s, 'Predator Detected inside tracking perimeter')
    expect(s).toBe(STEPS.PredatorTracking)
    s = nextStep(s, 'Predator Entering Safe Area')
    expect(s).toBe(STEPS.PredatorCounteraction)
    s = nextStep(s, 'Predator Leaving Safe Area')
    expect(s).toBe(STEPS.PredatorTracking)
    s = nextStep(s, 'Predator Leaving Tracking Perimeter')
    expect(s).toBe(STEPS.Patrolling)
  })

  it('crash only from deployed steps', () => {
    expect(nextStep(STEPS.Off, 'Crashed Detected')).toBe(STEPS.Off)
    expect(nextStep(STEPS.Patrolling, 'Crashed Detected')).toBe(STEPS.Crashed)
    expect(nextStep(STEPS.Crashed, 'Start SOI')).toBe(STEPS.Crashed)
  })

  it('rejects illegal signals', () => {
    expect(nextStep(STEPS.Off, 'FlightPlan')).toBe(STEPS.Off)
    expect(nextStep(STEPS.Patrolling, 'Start SOI')).toBe(STEPS.Patrolling)
  })
})

describe('acceptSignal', () => {
  it('accepts a transition to another step', () => {
    expect(acceptSignal(STEPS.Off, 'Start SOI')).toEqual({
      accepted: true,
      step: STEPS.Unconfigured,
    })
  })

  it('accepts a transition that stays on the same step', () => {
    expect(acceptSignal(STEPS.Unconfigured, 'FlightPlan Check Failed')).toEqual({
      accepted: true,
      step: STEPS.Unconfigured,
    })
  })

  it('rejects a signal that is not on the current step', () => {
    expect(acceptSignal(STEPS.Off, 'FlightPlan')).toEqual({
      accepted: false,
      step: STEPS.Off,
    })
  })
})

describe('getLegalSignals', () => {
  it('lists transitions for current step only', () => {
    expect(getLegalSignals(STEPS.Off)).toContain('Start SOI')
    expect(getLegalSignals(STEPS.Crashed)).toEqual([])
  })
})

describe('visualModeForStep', () => {
  it('maps each visual step', () => {
    expect(visualModeForStep(STEPS.Off)).toBe('ground')
    expect(visualModeForStep(STEPS.GoingToSafeArea)).toBe('flying')
    expect(visualModeForStep(STEPS.Patrolling)).toBe('patrolling')
    expect(visualModeForStep(STEPS.PredatorTracking)).toBe('tracking')
    expect(visualModeForStep(STEPS.PredatorCounteraction)).toBe('counteraction')
    expect(visualModeForStep(STEPS.Crashed)).toBe('crashed')
  })
})
