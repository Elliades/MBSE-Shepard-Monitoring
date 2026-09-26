const FOLLOW = 14

/** Safe zone box is x 18–82, y 16–80. Tracking ring is x 8–92, y 6–86. */
export const SAFE_BOX = { left: 18, right: 82, top: 16, bottom: 80 }
export const TRACK_BOX = { left: 8, right: 92, top: 6, bottom: 86 }

export const TRACK_LEGS = [
  { x: 68, y: 97, move: 0, hold: 0 },
  { x: 68, y: 91, move: 3400, hold: 650 },
  { x: 68, y: 84, move: 4000, hold: 1700 },
  { x: 14, y: 84, move: 8200, hold: 2000 },
  { x: 14, y: 10, move: 8800, hold: 2200 },
  { x: 86, y: 10, move: 8200, hold: 2000 },
  { x: 86, y: 84, move: 8800, hold: 2200 },
]

export function isInsideTracking(point) {
  return (
    point.x >= TRACK_BOX.left &&
    point.x <= TRACK_BOX.right &&
    point.y >= TRACK_BOX.top &&
    point.y <= TRACK_BOX.bottom
  )
}

export function isInsideSafeZone(point) {
  return (
    point.x >= SAFE_BOX.left &&
    point.x <= SAFE_BOX.right &&
    point.y >= SAFE_BOX.top &&
    point.y <= SAFE_BOX.bottom
  )
}

const SAFE_INSET = 3

export function clampToSafeZone(point) {
  return {
    x: Math.min(SAFE_BOX.right - SAFE_INSET, Math.max(SAFE_BOX.left + SAFE_INSET, point.x)),
    y: Math.min(SAFE_BOX.bottom - SAFE_INSET, Math.max(SAFE_BOX.top + SAFE_INSET, point.y)),
  }
}

const COUNTER_APPROACH_MS = 2600
const COUNTER_SHOO_MS = 900
const DRONE_GAP = 12

export function safePerimeterRect() {
  return {
    left: SAFE_BOX.left + SAFE_INSET,
    right: SAFE_BOX.right - SAFE_INSET,
    top: SAFE_BOX.top + SAFE_INSET,
    bottom: SAFE_BOX.bottom - SAFE_INSET,
  }
}

export function perimeterLength() {
  const r = safePerimeterRect()
  const w = r.right - r.left
  const h = r.bottom - r.top
  return 2 * (w + h)
}

/** Position on the safe-zone dashed outline; s grows clockwise from top-left. */
export function pointAtPerimeter(s) {
  const { left, right, top, bottom } = safePerimeterRect()
  const w = right - left
  const h = bottom - top
  const total = 2 * (w + h)
  let t = ((s % total) + total) % total
  if (t <= w) return { x: left + t, y: top, tx: 1, ty: 0 }
  t -= w
  if (t <= h) return { x: right, y: top + t, tx: 0, ty: 1 }
  t -= h
  if (t <= w) return { x: right - t, y: bottom, tx: -1, ty: 0 }
  t -= w
  return { x: left, y: bottom - t, tx: 0, ty: -1 }
}

export function sFromPerimeterPoint(p) {
  const { left, right, top, bottom } = safePerimeterRect()
  const w = right - left
  const h = bottom - top
  const onTop = { x: Math.min(right, Math.max(left, p.x)), y: top }
  const onBottom = { x: Math.min(right, Math.max(left, p.x)), y: bottom }
  const onLeft = { x: left, y: Math.min(bottom, Math.max(top, p.y)) }
  const onRight = { x: right, y: Math.min(bottom, Math.max(top, p.y)) }
  const candidates = [
    { pt: onTop, s: onTop.x - left },
    { pt: onRight, s: w + (onRight.y - top) },
    { pt: onBottom, s: w + h + (right - onBottom.x) },
    { pt: onLeft, s: w + h + w + (bottom - onLeft.y) },
  ]
  let best = candidates[0]
  let bestD = Infinity
  for (const c of candidates) {
    const d = Math.hypot(p.x - c.pt.x, p.y - c.pt.y)
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best.s
}

export function closestPerimeterPoint(p) {
  const s = sFromPerimeterPoint(p)
  const at = pointAtPerimeter(s)
  return { x: at.x, y: at.y, s }
}

function safeCenter() {
  return {
    x: (SAFE_BOX.left + SAFE_BOX.right) / 2,
    y: (SAFE_BOX.top + SAFE_BOX.bottom) / 2,
  }
}

function outwardFromCenter(point) {
  const c = safeCenter()
  const dx = point.x - c.x
  const dy = point.y - c.y
  const len = Math.hypot(dx, dy) || 1
  return { x: dx / len, y: dy / len }
}

function droneHerdingPosition(bear, drone, dtMs, urgency, push) {
  const out = outwardFromCenter(bear)
  const standoff = 14
  let target = {
    x: bear.x - out.x * standoff - (push?.x ?? 0) * 6,
    y: bear.y - out.y * standoff - (push?.y ?? 0) * 6,
  }
  target = clampToSafeZone(target)
  if (Math.hypot(target.x - bear.x, target.y - bear.y) < DRONE_GAP) {
    target = { x: bear.x - out.x * DRONE_GAP, y: bear.y - out.y * DRONE_GAP }
  }
  const step = (urgency ? 0.16 : 0.1) * (dtMs / 16)
  return easeToward(drone, target, step)
}

/**
 * @param {{ x: number, y: number }} origin
 * @param {{ x: number, y: number }} drone
 */
export function createCounteractionState(origin, drone) {
  const entry = closestPerimeterPoint(origin)
  return {
    phase: 'approach',
    approachFrom: { ...origin },
    entry: { x: entry.x, y: entry.y },
    approachT: 0,
    s: entry.s,
    dir: 1,
    shooLeft: COUNTER_SHOO_MS,
    bear: { ...origin },
    drone: { ...drone },
  }
}

/**
 * @param {ReturnType<typeof createCounteractionState>} state
 * @param {number} dtMs
 */
export function counteractionTick(state, dtMs) {
  const dt = dtMs
  if (state.phase === 'approach') {
    const approachT = state.approachT + dt
    const k = smoothstep(Math.min(1, approachT / COUNTER_APPROACH_MS))
    const bear = {
      x: state.approachFrom.x + (state.entry.x - state.approachFrom.x) * k,
      y: state.approachFrom.y + (state.entry.y - state.approachFrom.y) * k,
      moving: k < 1,
      phase: 'approach',
    }
    const drone = droneHerdingPosition(bear, state.drone, dt, false)
    if (k >= 1) {
      const onEdge = pointAtPerimeter(state.s)
      return {
        ...state,
        phase: 'shoo',
        approachT,
        shooLeft: COUNTER_SHOO_MS,
        bear: { x: onEdge.x, y: onEdge.y, moving: false, phase: 'shoo' },
        drone,
      }
    }
    return { ...state, approachT, bear, drone }
  }

  if (state.phase === 'shoo') {
    const shooLeft = state.shooLeft - dt
    const onEdge = pointAtPerimeter(state.s)
    const bear = { x: onEdge.x, y: onEdge.y, moving: false, phase: 'shoo' }
    const drone = droneHerdingPosition(bear, state.drone, dt, true)
    if (shooLeft <= 0) {
      const edge = pointAtPerimeter(state.s)
      const dx = drone.x - edge.x
      const dy = drone.y - edge.y
      const along = dx * edge.tx + dy * edge.ty
      return {
        ...state,
        phase: 'herd',
        dir: along >= 0 ? -1 : 1,
        shooLeft: 0,
        bear: { ...bear, moving: true, phase: 'flee' },
        drone,
      }
    }
    return { ...state, shooLeft, bear, drone }
  }

  const dir = state.dir === -1 ? -1 : 1
  const pos = pointAtPerimeter(state.s)
  const push = { x: pos.tx * dir, y: pos.ty * dir }
  const drone = droneHerdingPosition(pos, state.drone, dt, true, push)
  const nextS = state.s + dir * 0.14 * (dt / 16)
  const nextPos = pointAtPerimeter(nextS)
  const bear = { x: nextPos.x, y: nextPos.y, moving: true, phase: 'flee' }
  return { ...state, s: nextS, dir, bear, drone }
}

const CORRIDOR = 3.2

/**
 * Point in the tracking band (outside the safe zone, inside the ring),
 * on the ray from the safe-zone center through `from`.
 */
export function corridorTarget(from) {
  const cx = (SAFE_BOX.left + SAFE_BOX.right) / 2
  const cy = (SAFE_BOX.top + SAFE_BOX.bottom) / 2
  let dx = from.x - cx
  let dy = from.y - cy
  let len = Math.hypot(dx, dy)
  if (len < 0.8) {
    dx = 0
    dy = 1
    len = 1
  }
  const ux = dx / len
  const uy = dy / len
  const tx = ux === 0 ? Infinity : ((ux > 0 ? SAFE_BOX.right : SAFE_BOX.left) - cx) / ux
  const ty = uy === 0 ? Infinity : ((uy > 0 ? SAFE_BOX.bottom : SAFE_BOX.top) - cy) / uy
  const tSafe = Math.min(tx, ty)
  const inset = 2
  return {
    x: Math.min(TRACK_BOX.right - inset, Math.max(TRACK_BOX.left + inset, cx + ux * (tSafe + CORRIDOR))),
    y: Math.min(TRACK_BOX.bottom - inset, Math.max(TRACK_BOX.top + inset, cy + uy * (tSafe + CORRIDOR))),
    ux,
    uy,
  }
}

/** Constant-speed step out of the safe zone into the tracking band. */
export function leaveSafeStep(from, dtMs) {
  const dest = corridorTarget(from)
  const next = easeToward(from, dest, 0.012 * dtMs)
  const arrived =
    !isInsideSafeZone(next) &&
    isInsideTracking(next) &&
    Math.hypot(dest.x - next.x, dest.y - next.y) < 0.4
  return {
    x: next.x,
    y: next.y,
    moving: !arrived,
    arrived,
    heading: { x: dest.ux, y: dest.uy },
  }
}

function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/**
 * @param {{ x: number, y: number, move: number, hold: number }[]} legs
 * @param {number} elapsed
 */
export function poseAlong(legs, elapsed) {
  let t = Math.max(0, elapsed)
  let cursor = { x: legs[0].x, y: legs[0].y }
  const sequence = legs.slice(1)
  for (let lap = 0; lap < 6; lap += 1) {
    for (const leg of sequence) {
      if (t <= leg.move) {
        const k = leg.move === 0 ? 1 : smoothstep(t / leg.move)
        return {
          x: cursor.x + (leg.x - cursor.x) * k,
          y: cursor.y + (leg.y - cursor.y) * k,
          moving: leg.move > 0 && k > 0 && k < 1,
        }
      }
      t -= leg.move
      cursor = { x: leg.x, y: leg.y }
      if (t <= leg.hold) {
        return { x: leg.x, y: leg.y, moving: false }
      }
      t -= leg.hold
    }
  }
  return { x: cursor.x, y: cursor.y, moving: false }
}

const RING_CORNERS = [
  { x: 68, y: 84 },
  { x: 14, y: 84 },
  { x: 14, y: 10 },
  { x: 86, y: 10 },
  { x: 86, y: 84 },
]

/** Resume the ring walk from `from`, continuing along `heading` when given. */
export function bearTrackContinue(elapsed, from, heading) {
  const hx = heading?.x ?? 0
  const hy = heading?.y ?? 1
  let best = 0
  let bestScore = -Infinity
  for (let i = 0; i < RING_CORNERS.length; i += 1) {
    const p = RING_CORNERS[i]
    const vx = p.x - from.x
    const vy = p.y - from.y
    const dist = Math.hypot(vx, vy) || 1
    const dot = (vx / dist) * hx + (vy / dist) * hy
    const score = dot * 3 - dist / 40
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  const legs = [{ ...from, move: 0, hold: 0 }]
  for (let i = 0; i < RING_CORNERS.length; i += 1) {
    const p = RING_CORNERS[(best + i) % RING_CORNERS.length]
    legs.push({ ...p, move: 8200, hold: 2000 })
  }
  return poseAlong(legs, elapsed)
}

export function bearAt(elapsed) {
  const entry = TRACK_LEGS[1]
  const entryEnd = entry.move + entry.hold
  if (elapsed <= entryEnd) {
    return poseAlong(TRACK_LEGS.slice(0, 2), elapsed)
  }
  const ring = [TRACK_LEGS[1], ...TRACK_LEGS.slice(2)]
  return poseAlong(ring, elapsed - entryEnd)
}

const EDGE_INSET = 4

/** Nearest point just inside the tracking ring. */
export function trackingEdge(point) {
  return {
    x: Math.min(TRACK_BOX.right - EDGE_INSET, Math.max(TRACK_BOX.left + EDGE_INSET, point.x)),
    y: Math.min(TRACK_BOX.bottom - EDGE_INSET, Math.max(TRACK_BOX.top + EDGE_INSET, point.y)),
  }
}

function easeToward(from, to, maxStep) {
  const mx = to.x - from.x
  const my = to.y - from.y
  const dist = Math.hypot(mx, my)
  if (dist < 0.04) return { x: to.x, y: to.y }
  const step = Math.min(dist, maxStep)
  return {
    x: from.x + (mx / dist) * step,
    y: from.y + (my / dist) * step,
  }
}

/**
 * Inside the ring, the drone follows while the bear moves.
 * Outside, it only eases up to the tracking edge and waits there.
 */
export function followStep(state, bear) {
  const inside = isInsideTracking(bear)
  let offset = state.offset
  const dx = bear.x - state.bear.x
  const dy = bear.y - state.bear.y
  if (inside && bear.moving && (dx !== 0 || dy !== 0)) {
    const len = Math.hypot(dx, dy) || 1
    offset = {
      x: offset.x + ((-dx / len) * FOLLOW - offset.x) * 0.08,
      y: offset.y + ((-dy / len) * FOLLOW - offset.y) * 0.08,
    }
  }

  let drone = state.drone
  if (!inside) {
    drone = easeToward(drone, trackingEdge(bear), 0.2)
  } else if (bear.moving) {
    const bearStep = Math.hypot(dx, dy)
    drone = easeToward(
      drone,
      trackingEdge({ x: bear.x + offset.x, y: bear.y + offset.y }),
      Math.max(bearStep, 0.035)
    )
  }

  return {
    bear: { x: bear.x, y: bear.y },
    drone,
    offset,
  }
}

/** Point just past the nearest side of the tracking ring. */
export function exitPoint(from) {
  const dLeft = from.x - TRACK_BOX.left
  const dRight = TRACK_BOX.right - from.x
  const dTop = from.y - TRACK_BOX.top
  const dBottom = TRACK_BOX.bottom - from.y
  const nearest = Math.min(dLeft, dRight, dTop, dBottom)
  if (nearest === dRight) return { x: TRACK_BOX.right + 6, y: from.y }
  if (nearest === dLeft) return { x: TRACK_BOX.left - 6, y: from.y }
  if (nearest === dTop) return { x: from.x, y: TRACK_BOX.top - 6 }
  return { x: from.x, y: TRACK_BOX.bottom + 6 }
}
