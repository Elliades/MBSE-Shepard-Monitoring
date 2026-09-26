import { STEPS } from '../stm/stepNames.js'

const GROUND = new Set([
  STEPS.Off,
  STEPS.Unconfigured,
  STEPS.Configured,
  STEPS.ReadyForMission,
])

/** @typedef {'far' | 'approaching' | 'near'} Camera */

/**
 * @param {string} step
 * @returns {Camera}
 */
export function cameraForStep(step) {
  if (GROUND.has(step)) return 'far'
  if (step === STEPS.GoingToSafeArea) return 'approaching'
  return 'near'
}

export const STEP_CALLOUTS = {
  [STEPS.Unconfigured]: 'click',
  [STEPS.Configured]: 'beep-beep',
  [STEPS.ReadyForMission]: 'check',
  [STEPS.GoingToSafeArea]: 'whoosh',
  [STEPS.Patrolling]: 'whirr',
  [STEPS.PredatorCounteraction]: 'shoo',
  [STEPS.Crashed]: 'crash',
}

/**
 * @param {string} step
 * @param {Camera} camera
 * @param {boolean} approachDone
 */
/** Same order as `.poc-drone--patrol` offset-path (field %). */
export const PATROL_CORNERS = [
  { x: 18, y: 16 },
  { x: 82, y: 16 },
  { x: 82, y: 80 },
  { x: 18, y: 80 },
]

export const PATROL_LOOP_S = 15

function projectOnSegment(point, a, b) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const lenSq = abx * abx + aby * aby
  if (lenSq === 0) return { x: a.x, y: a.y, t: 0 }
  const t = Math.min(1, Math.max(0, ((point.x - a.x) * abx + (point.y - a.y) * aby) / lenSq))
  return { x: a.x + abx * t, y: a.y + aby * t, t }
}

/** Closest point on the patrol rectangle → offset-distance % (0–100). */
export function patrolOffsetPercent(point) {
  let total = 0
  const segments = []
  for (let i = 0; i < PATROL_CORNERS.length; i += 1) {
    const a = PATROL_CORNERS[i]
    const b = PATROL_CORNERS[(i + 1) % PATROL_CORNERS.length]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    segments.push({ a, b, len, start: total })
    total += len
  }
  let bestDist = Infinity
  let bestAlong = 0
  for (const seg of segments) {
    const proj = projectOnSegment(point, seg.a, seg.b)
    const dist = Math.hypot(point.x - proj.x, point.y - proj.y)
    if (dist < bestDist) {
      bestDist = dist
      bestAlong = seg.start + seg.len * proj.t
    }
  }
  return (bestAlong / total) * 100
}

export function patrolAnimationDelay(offsetPercent) {
  return -(offsetPercent / 100) * PATROL_LOOP_S
}

/** Inverse of patrolOffsetPercent: point on the safe-zone outline. */
export function pointOnPatrol(percent) {
  const p = ((percent % 100) + 100) % 100
  let total = 0
  const segments = []
  for (let i = 0; i < PATROL_CORNERS.length; i += 1) {
    const a = PATROL_CORNERS[i]
    const b = PATROL_CORNERS[(i + 1) % PATROL_CORNERS.length]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    segments.push({ a, b, len })
    total += len
  }
  let along = (p / 100) * total
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i]
    if (along <= seg.len || i === segments.length - 1) {
      const t = seg.len === 0 ? 0 : Math.min(1, along / seg.len)
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * t,
        y: seg.a.y + (seg.b.y - seg.a.y) * t,
      }
    }
    along -= seg.len
  }
  return { ...PATROL_CORNERS[0] }
}

/** Where the patrol CSS animation has the drone after `elapsedMs`. */
export function droneOnPatrol(offsetPercent, elapsedMs) {
  const pct = offsetPercent + (elapsedMs / 1000 / PATROL_LOOP_S) * 100
  return pointOnPatrol(pct)
}

export function dronePose(step, camera, approachDone) {
  if (step === STEPS.Crashed) return 'crashed'
  if (step === STEPS.PredatorCounteraction || step === STEPS.PredatorTracking) return 'follow'
  if (step === STEPS.Patrolling) return 'patrol'
  if (camera === 'approaching' && !approachDone) return 'approach'
  if (step === STEPS.GoingToSafeArea) return 'settled'
  return 'parked'
}

/** Field is 800×720; y is scaled so circles match CSS on `.poc-field`. */
export const FIELD_ASPECT = 720 / 800

export const SENSOR_RADIUS = {
  going: 11,
  patrol: 29,
  track: 24,
}

/** @typedef {'off' | 'echo' | 'going' | 'patrol' | 'track' | 'counter'} SensorMode */

/**
 * @param {string} step
 * @returns {SensorMode}
 */
export function sensorMode(step) {
  switch (step) {
    case STEPS.ReadyForMission:
      return 'echo'
    case STEPS.GoingToSafeArea:
      return 'going'
    case STEPS.Patrolling:
      return 'patrol'
    case STEPS.PredatorTracking:
      return 'track'
    case STEPS.PredatorCounteraction:
      return 'counter'
    default:
      return 'off'
  }
}

/**
 * @param {SensorMode} mode
 * @returns {number} radius as % of field width (0 = hidden disk)
 */
export function sensorRadiusPercent(mode) {
  switch (mode) {
    case 'going':
      return SENSOR_RADIUS.going
    case 'patrol':
      return SENSOR_RADIUS.patrol
    case 'track':
    case 'counter':
      return SENSOR_RADIUS.track
    default:
      return 0
  }
}

/** Drone on base (field %). */
export const PARKED_DRONE = { x: 4, y: 78 }

/** Top-left of safe-zone patrol path (field %). */
export const SETTLED_DRONE = { x: 18, y: 16 }

/**
 * @param {{ left: string, top: string }} spot within `.poc-zone` (64% box at 18/16)
 * @returns {{ x: number, y: number }}
 */
export function sheepInFieldPercent(spot) {
  const leftPct = parseFloat(spot.left) / 100
  const topPct = parseFloat(spot.top) / 100
  return {
    x: 18 + leftPct * 64,
    y: 16 + topPct * 64,
  }
}

/**
 * @param {{ x: number, y: number }} origin field %
 * @param {{ x: number, y: number }} point field %
 * @param {number} radiusPercent radius as % of field width
 */
export function isInsideSensor(origin, point, radiusPercent) {
  if (radiusPercent <= 0) return false
  const dx = point.x - origin.x
  const dy = (point.y - origin.y) * FIELD_ASPECT
  return Math.hypot(dx, dy) <= radiusPercent
}

/**
 * Aim a downward beam from the drone through the bear, so light and sound
 * push the bear outward. Lengths are cqw (percent of field width).
 * Sound continues past the bear; light reaches about to it.
 * @param {{ x: number, y: number }} drone
 * @param {{ x: number, y: number }} bear
 */
export function counterAim(drone, bear) {
  const dx = bear.x - drone.x
  const dy = (bear.y - drone.y) * FIELD_ASPECT
  const dist = Math.hypot(dx, dy)
  const angle = dist < 0.35 ? 90 : (Math.atan2(dy, dx) * 180) / Math.PI
  const light = Math.min(48, Math.max(20, dist * 1.05))
  const sound = Math.min(68, Math.max(light + 16, dist + 22))
  return { rotate: angle - 90, light, sound }
}
