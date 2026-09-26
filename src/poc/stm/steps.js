/** Visual mission steps mirrored from pastureSentinelMachine Main + Undeployed leaves */

import { INITIAL_STEP, STEPS } from './stepNames.js'

export { INITIAL_STEP, STEPS }

/** @type {Record<string, Record<string, string>>} */
const TRANSITIONS = {
  [STEPS.Off]: {
    'Start SOI': STEPS.Unconfigured,
  },
  [STEPS.Unconfigured]: {
    FlightPlan: STEPS.Configured,
    'FlightPlan Check Failed': STEPS.Unconfigured,
  },
  [STEPS.Configured]: {
    'Ready for mission': STEPS.ReadyForMission,
  },
  [STEPS.ReadyForMission]: {
    'Start Sheep Guard Mission': STEPS.GoingToSafeArea,
  },
  [STEPS.GoingToSafeArea]: {
    'Start Patrolling': STEPS.Patrolling,
    'Crashed Detected': STEPS.Crashed,
  },
  [STEPS.Patrolling]: {
    'Predator Detected inside tracking perimeter': STEPS.PredatorTracking,
    'Crashed Detected': STEPS.Crashed,
  },
  [STEPS.PredatorTracking]: {
    'Predator Entering Safe Area': STEPS.PredatorCounteraction,
    'Predator Leaving Tracking Perimeter': STEPS.Patrolling,
    'Crashed Detected': STEPS.Crashed,
  },
  [STEPS.PredatorCounteraction]: {
    'Predator Leaving Safe Area': STEPS.PredatorTracking,
    'Crashed Detected': STEPS.Crashed,
  },
}

const DEPLOYED_STEPS = new Set([
  STEPS.GoingToSafeArea,
  STEPS.Patrolling,
  STEPS.PredatorTracking,
  STEPS.PredatorCounteraction,
])

/**
 * A signal listed on the current step is accepted, including a transition
 * that stays on the same step. Anything else is rejected.
 * @param {string} step
 * @param {string} signal
 * @returns {{ accepted: boolean, step: string }}
 */
export function acceptSignal(step, signal) {
  if (step === STEPS.Crashed) {
    return { accepted: false, step }
  }
  const table = TRANSITIONS[step]
  if (!table || !(signal in table)) {
    return { accepted: false, step }
  }
  return { accepted: true, step: table[signal] }
}

/**
 * @param {string} step
 * @param {string} signal
 * @returns {string}
 */
export function nextStep(step, signal) {
  return acceptSignal(step, signal).step
}

/**
 * @param {string} step
 * @returns {string[]}
 */
export function getLegalSignals(step) {
  return getOutgoingTransitions(step).map((edge) => edge.signal)
}

/**
 * @param {string} step
 * @returns {{ signal: string, target: string }[]}
 */
export function getOutgoingTransitions(step) {
  if (step === STEPS.Crashed) {
    return []
  }
  const table = TRANSITIONS[step]
  if (!table) {
    return []
  }
  return Object.entries(table).map(([signal, target]) => ({ signal, target }))
}

/** Ordered lanes for STM visualization (not extra states). */
export const STM_LANES = [
  {
    id: 'undeployed',
    title: 'Undeployed',
    steps: [STEPS.Off, STEPS.Unconfigured, STEPS.Configured, STEPS.ReadyForMission],
  },
  {
    id: 'deployed',
    title: 'Deployed',
    steps: [STEPS.GoingToSafeArea, STEPS.Patrolling],
  },
  {
    id: 'threat',
    title: 'Predator',
    steps: [STEPS.PredatorTracking, STEPS.PredatorCounteraction],
  },
  {
    id: 'terminal',
    title: 'Terminal',
    steps: [STEPS.Crashed],
  },
]

export function isDeployedStep(step) {
  return DEPLOYED_STEPS.has(step)
}

/** @typedef {'ground' | 'flying' | 'patrolling' | 'tracking' | 'counteraction' | 'crashed'} VisualMode */

/**
 * @param {string} step
 * @returns {VisualMode}
 */
export function visualModeForStep(step) {
  switch (step) {
    case STEPS.GoingToSafeArea:
      return 'flying'
    case STEPS.Patrolling:
      return 'patrolling'
    case STEPS.PredatorTracking:
      return 'tracking'
    case STEPS.PredatorCounteraction:
      return 'counteraction'
    case STEPS.Crashed:
      return 'crashed'
    default:
      return 'ground'
  }
}

export const NOMINAL_SCENARIO = [
  'Start SOI',
  'FlightPlan',
  'Ready for mission',
  'Start Sheep Guard Mission',
  'Start Patrolling',
  'Predator Detected inside tracking perimeter',
  'Predator Entering Safe Area',
]
