import { describe, it, expect } from 'vitest'
import { STEPS } from '../stm/stepNames.js'
import {
  cameraForStep,
  dronePose,
  isInsideSensor,
  patrolOffsetPercent,
  pointOnPatrol,
  counterAim,
  sensorMode,
  sensorRadiusPercent,
  sheepInFieldPercent,
} from './sceneMotion.js'

describe('cameraForStep', () => {
  it('keeps ground steps far', () => {
    expect(cameraForStep(STEPS.Off)).toBe('far')
    expect(cameraForStep(STEPS.ReadyForMission)).toBe('far')
  })

  it('approaches only while going to the safe area', () => {
    expect(cameraForStep(STEPS.GoingToSafeArea)).toBe('approaching')
  })

  it('is already near once the step has passed the flight', () => {
    expect(cameraForStep(STEPS.Patrolling)).toBe('near')
    expect(cameraForStep(STEPS.PredatorCounteraction)).toBe('near')
    expect(cameraForStep(STEPS.Crashed)).toBe('near')
  })
})

describe('dronePose', () => {
  it('stays parked on the ground', () => {
    expect(dronePose(STEPS.Configured, 'far', false)).toBe('parked')
  })

  it('nudges during the approach, then settles', () => {
    expect(dronePose(STEPS.GoingToSafeArea, 'approaching', false)).toBe('approach')
    expect(dronePose(STEPS.GoingToSafeArea, 'approaching', true)).toBe('settled')
  })

  it('patrols on the zone outline', () => {
    expect(dronePose(STEPS.Patrolling, 'near', false)).toBe('patrol')
  })
})

describe('patrolOffsetPercent', () => {
  it('starts at the top-left corner of the path', () => {
    expect(patrolOffsetPercent({ x: 18, y: 16 })).toBeCloseTo(0, 0)
  })

  it('places the top-right corner at one quarter of the loop', () => {
    expect(patrolOffsetPercent({ x: 82, y: 16 })).toBeCloseTo(25, 0)
  })

  it('maps that percent back onto the same corner', () => {
    const back = pointOnPatrol(25)
    expect(back.x).toBeCloseTo(82, 0)
    expect(back.y).toBeCloseTo(16, 0)
  })
})

describe('sensorMode', () => {
  it('maps mission steps to sensor visuals', () => {
    expect(sensorMode(STEPS.ReadyForMission)).toBe('echo')
    expect(sensorMode(STEPS.Patrolling)).toBe('patrol')
    expect(sensorMode(STEPS.PredatorTracking)).toBe('track')
    expect(sensorMode(STEPS.Off)).toBe('off')
  })

  it('exposes radius only when the disk is shown', () => {
    expect(sensorRadiusPercent('patrol')).toBe(29)
    expect(sensorRadiusPercent('echo')).toBe(0)
  })
})

describe('isInsideSensor', () => {
  const origin = { x: 50, y: 50 }

  it('is true at the center', () => {
    expect(isInsideSensor(origin, origin, 10)).toBe(true)
  })

  it('respects field aspect on the vertical axis', () => {
    expect(isInsideSensor(origin, { x: 50, y: 61 }, 10)).toBe(true)
    expect(isInsideSensor(origin, { x: 50, y: 62 }, 10)).toBe(false)
  })

  it('maps sheep spots into field space', () => {
    const p = sheepInFieldPercent({ left: '32%', top: '38%' })
    expect(p.x).toBeCloseTo(38.48, 1)
    expect(p.y).toBeCloseTo(40.32, 1)
  })
})

describe('counterAim', () => {
  it('points a downward beam at a bear below the drone', () => {
    const aim = counterAim({ x: 40, y: 40 }, { x: 40, y: 60 })
    expect(aim.rotate).toBeCloseTo(0, 0)
  })

  it('turns the beam left so it pushes a bear outward', () => {
    const aim = counterAim({ x: 50, y: 40 }, { x: 30, y: 40 })
    expect(aim.rotate).toBeCloseTo(90, 0)
  })

  it('turns the beam right toward a bear on that side', () => {
    const aim = counterAim({ x: 40, y: 50 }, { x: 62, y: 50 })
    expect(aim.rotate).toBeCloseTo(-90, 0)
  })

  it('sends the sound past the light', () => {
    const aim = counterAim({ x: 50, y: 40 }, { x: 30, y: 40 })
    expect(aim.sound).toBeGreaterThan(aim.light + 10)
  })
})
