import React, { useEffect, useRef, useState } from 'react'
import { STEPS } from '../stm/stepNames.js'
import {
  PARKED_DRONE,
  SETTLED_DRONE,
  STEP_CALLOUTS,
  cameraForStep,
  droneOnPatrol,
  dronePose,
  isInsideSensor,
  patrolAnimationDelay,
  patrolOffsetPercent,
  pointOnPatrol,
  counterAim,
  sensorMode,
  sensorRadiusPercent,
  sheepInFieldPercent,
} from './sceneMotion.js'
import {
  bearAt,
  bearTrackContinue,
  createCounteractionState,
  counteractionTick,
  exitPoint,
  followStep,
  isInsideTracking,
  leaveSafeStep,
} from './bearFollow.js'
import './PastureScene.css'

const BLEATS = ['baa', 'beeeh', 'baaah', 'beh', 'mehh', 'baa-baa', 'beeh']

const PATROL_SHEEP_LINES = ['beep! one sheep…', 'two…', 'three…', 'four…']
const PATROL_SHEEP_ASLEEP = 'zzz… snore… 💤'

const COUNTER_CRIES = [
  { text: 'shoo!', lane: '-2.6cqw', delay: '0s' },
  { text: 'bzzt!', lane: '2cqw', delay: '0.55s' },
  { text: 'raaah!', lane: '-0.4cqw', delay: '1.1s' },
]

const COUNTER_WAVES = [
  { lane: '0.4cqw', delay: '0.28s' },
  { lane: '-1.7cqw', delay: '0.85s' },
]

const SHEEP = [
  { top: '38%', left: '32%' },
  { top: '52%', left: '48%' },
  { top: '44%', left: '62%' },
  { top: '60%', left: '38%' },
  { top: '48%', left: '52%' },
]

const DRONE_BODY = '/svg/Drone-without-circle.svg'

export default function PastureScene({ step }) {
  const [approachDone, setApproachDone] = useState(false)
  const [bubble, setBubble] = useState(null)
  const [patrolChirp, setPatrolChirp] = useState(null)
  const [bleats, setBleats] = useState(() => SHEEP.map(() => null))
  const [actors, setActors] = useState({
    bear: { x: 68, y: 97 },
    drone: { x: 70, y: 30 },
  })
  const [trackTone, setTrackTone] = useState('calm')
  const followRef = useRef({
    bear: { x: 68, y: 97 },
    drone: { x: 70, y: 30 },
    offset: { x: -14, y: 6 },
  })
  const spottedRef = useRef(false)
  const enteredRef = useRef(false)
  const prevStepRef = useRef(step)
  const [exitFrom, setExitFrom] = useState(null)
  const counterOriginRef = useRef(null)
  const freshTrackRef = useRef(false)
  const safeEjectRef = useRef(null)
  const resumeTrackRef = useRef(null)
  const [counterPhase, setCounterPhase] = useState(null)
  const [patrolOffset, setPatrolOffset] = useState(0)
  const [patrolDrone, setPatrolDrone] = useState(() => ({ ...SETTLED_DRONE }))
  const patrolClockRef = useRef({ offset: 0, t0: 0 })
  const leaveHeadingRef = useRef(null)
  const counterSimRef = useRef(null)
  const patrolCountedRef = useRef(new Set())
  const patrolCountDoneRef = useRef(false)
  const patrolBubbleTimerRef = useRef(null)

  useEffect(() => {
    if (step !== STEPS.GoingToSafeArea) {
      setApproachDone(false)
    }
  }, [step])

  useEffect(() => {
    const text = STEP_CALLOUTS[step]
    if (!text) {
      setBubble(null)
      return undefined
    }
    setBubble(text)
    const timer = setTimeout(() => setBubble(null), 2200)
    return () => clearTimeout(timer)
  }, [step])

  const requested = cameraForStep(step)
  const camera = requested === 'approaching' && approachDone ? 'near' : requested
  const pose = dronePose(step, camera, approachDone)

  const danger = step === STEPS.PredatorCounteraction ? 'danger' : 'safe'
  const showTrack =
    step === STEPS.GoingToSafeArea ||
    step === STEPS.Patrolling ||
    step === STEPS.PredatorTracking ||
    step === STEPS.PredatorCounteraction

  const stressed =
    step === STEPS.PredatorTracking || step === STEPS.PredatorCounteraction
  const showBear = pose === 'follow' || exitFrom
  const droneFollowStyle = pose === 'follow' || exitFrom
  const showCounterFx =
    step === STEPS.PredatorCounteraction ||
    counterPhase === 'eject' ||
    counterPhase === 'shoo' ||
    counterPhase === 'flee'
  const droneClass = exitFrom ? 'follow' : pose

  const sensorVisual = sensorMode(step)
  const sensorRadius = sensorRadiusPercent(sensorVisual)

  let sensorOrigin = PARKED_DRONE
  if (droneFollowStyle || pose === 'follow') {
    sensorOrigin = actors.drone
  } else if (pose === 'patrol' && !exitFrom) {
    sensorOrigin = patrolDrone
  } else if (pose === 'settled' || (pose === 'approach' && approachDone)) {
    sensorOrigin = SETTLED_DRONE
  } else if (sensorVisual === 'echo') {
    sensorOrigin = PARKED_DRONE
  } else if (step === STEPS.GoingToSafeArea) {
    sensorOrigin = approachDone ? SETTLED_DRONE : PARKED_DRONE
  }

  const sheepInSensor =
    sensorRadius > 0
      ? SHEEP.map((spot) =>
          isInsideSensor(sensorOrigin, sheepInFieldPercent(spot), sensorRadius)
        )
      : SHEEP.map(() => false)

  const bearInSensor =
    showBear &&
    (sensorVisual === 'track' || sensorVisual === 'counter') &&
    sensorRadius > 0 &&
    isInsideSensor(sensorOrigin, actors.bear, sensorRadius)

  const aim = showCounterFx ? counterAim(actors.drone, actors.bear) : null
  const aimStyle = aim
    ? {
        '--aim': `${aim.rotate}deg`,
        '--light': `${aim.light}cqw`,
        '--sound': `${aim.sound}cqw`,
      }
    : null

  useEffect(() => {
    if (step !== STEPS.Patrolling) {
      patrolCountedRef.current = new Set()
      patrolCountDoneRef.current = false
      setPatrolChirp(null)
      return undefined
    }
    if (patrolCountDoneRef.current) {
      if (sheepInSensor.every((inside) => !inside)) {
        patrolCountDoneRef.current = false
        patrolCountedRef.current = new Set()
      }
      return undefined
    }

    let newlyCounted = 0
    sheepInSensor.forEach((inside, index) => {
      if (inside && !patrolCountedRef.current.has(index)) {
        patrolCountedRef.current.add(index)
        newlyCounted += 1
      }
    })
    if (newlyCounted === 0) return undefined

    const n = patrolCountedRef.current.size
    if (patrolBubbleTimerRef.current) clearTimeout(patrolBubbleTimerRef.current)

    if (n >= 5) {
      setPatrolChirp('five sheep!')
      patrolCountDoneRef.current = true
      patrolBubbleTimerRef.current = setTimeout(() => {
        setPatrolChirp(PATROL_SHEEP_ASLEEP)
        patrolBubbleTimerRef.current = setTimeout(() => setPatrolChirp(null), 3200)
      }, 1100)
    } else {
      setPatrolChirp(PATROL_SHEEP_LINES[n - 1])
      patrolBubbleTimerRef.current = setTimeout(() => setPatrolChirp(null), 1500)
    }

    return () => {
      if (patrolBubbleTimerRef.current) clearTimeout(patrolBubbleTimerRef.current)
    }
  }, [step, patrolDrone, sheepInSensor])

  useEffect(() => {
    const timers = []
    SHEEP.forEach((_, index) => {
      const speak = () => {
        const word = BLEATS[Math.floor(Math.random() * BLEATS.length)]
        setBleats((prev) => {
          const next = [...prev]
          next[index] = word
          return next
        })
        timers.push(
          setTimeout(() => {
            setBleats((prev) => {
              const next = [...prev]
              next[index] = null
              return next
            })
          }, 700 + Math.random() * 500)
        )
        timers.push(setTimeout(speak, (stressed ? 1600 : 2800) + Math.random() * 4200))
      }
      timers.push(setTimeout(speak, Math.random() * (stressed ? 1200 : 3500)))
    })
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [stressed])

  useEffect(() => {
    const prev = prevStepRef.current
    prevStepRef.current = step
    if (prev === STEPS.PredatorTracking && step === STEPS.Patrolling) {
      setExitFrom({ ...followRef.current.bear })
      setPatrolOffset(patrolOffsetPercent(followRef.current.drone))
      setTrackTone('blink')
      const timer = setTimeout(() => setTrackTone('calm'), 700)
      return () => clearTimeout(timer)
    }
    if (prev === STEPS.GoingToSafeArea && step === STEPS.Patrolling) {
      setPatrolOffset(patrolOffsetPercent({ x: 18, y: 16 }))
    }
    if (step === STEPS.PredatorCounteraction && prev === STEPS.PredatorTracking) {
      counterOriginRef.current = { ...followRef.current.bear }
      counterSimRef.current = null
    }
    if (step !== STEPS.PredatorCounteraction) {
      counterSimRef.current = null
    }
    if (step === STEPS.PredatorTracking && prev === STEPS.PredatorCounteraction) {
      freshTrackRef.current = false
      enteredRef.current = true
      spottedRef.current = true
      leaveHeadingRef.current = null
      const edge = counterSimRef.current?.bear ?? followRef.current.bear
      safeEjectRef.current = { from: { ...edge } }
      setTrackTone('alert')
    }
    if (step === STEPS.PredatorTracking && prev === STEPS.Patrolling) {
      const clock = patrolClockRef.current
      const pos = droneOnPatrol(clock.offset, performance.now() - clock.t0)
      followRef.current = { ...followRef.current, drone: pos }
      freshTrackRef.current = true
      resumeTrackRef.current = null
    }
    if (step !== STEPS.PredatorTracking) {
      spottedRef.current = false
      enteredRef.current = false
      if (!(prev === STEPS.PredatorTracking && step === STEPS.Patrolling)) {
        if (step !== STEPS.PredatorCounteraction) {
          setTrackTone('calm')
        }
      }
    }
    if (step === STEPS.PredatorCounteraction) {
      setTrackTone('alert')
    }
    return undefined
  }, [step])

  useEffect(() => {
    if (pose !== 'follow') return undefined
    const isCounter = step === STEPS.PredatorCounteraction
    if (isCounter && !counterOriginRef.current) {
      counterOriginRef.current = { ...followRef.current.bear }
    }
    if (!isCounter && freshTrackRef.current) {
      const start = bearAt(0)
      followRef.current = {
        ...followRef.current,
        bear: { x: start.x, y: start.y },
      }
      freshTrackRef.current = false
    }
    let elapsed = 0
    let trackElapsed = 0
    let last = performance.now()
    let frame = 0
    let blinkTimer = 0
    const tick = (now) => {
      const dt = Math.min(40, now - last)
      last = now
      elapsed += dt

      let bear
      let nextFollow

      if (isCounter) {
        if (!counterSimRef.current) {
          counterSimRef.current = createCounteractionState(
            counterOriginRef.current ?? followRef.current.bear,
            followRef.current.drone
          )
        }
        counterSimRef.current = counteractionTick(counterSimRef.current, dt)
        bear = counterSimRef.current.bear
        setCounterPhase(bear.phase)
        nextFollow = {
          ...followRef.current,
          bear: { x: bear.x, y: bear.y },
          drone: counterSimRef.current.drone,
        }
      } else if (safeEjectRef.current) {
        const stepOut = leaveSafeStep(safeEjectRef.current.from, dt)
        safeEjectRef.current = { from: { x: stepOut.x, y: stepOut.y } }
        leaveHeadingRef.current = stepOut.heading
        bear = stepOut
        setCounterPhase(stepOut.arrived ? null : 'flee')
        const behind = {
          x: stepOut.x - stepOut.heading.x * 12,
          y: stepOut.y - stepOut.heading.y * 12,
        }
        nextFollow = {
          ...followRef.current,
          bear: { x: stepOut.x, y: stepOut.y },
          drone: {
            x: followRef.current.drone.x + Math.max(-0.12, Math.min(0.12, behind.x - followRef.current.drone.x)),
            y: followRef.current.drone.y + Math.max(-0.12, Math.min(0.12, behind.y - followRef.current.drone.y)),
          },
        }
        if (stepOut.arrived) {
          resumeTrackRef.current = { x: stepOut.x, y: stepOut.y }
          trackElapsed = 0
          safeEjectRef.current = null
          setCounterPhase(null)
        }
      } else {
        trackElapsed += dt
        if (resumeTrackRef.current) {
          bear = bearTrackContinue(trackElapsed, resumeTrackRef.current, leaveHeadingRef.current)
        } else {
          bear = bearAt(trackElapsed)
        }
        setCounterPhase(null)
        if (!spottedRef.current && trackElapsed > 1100) {
          spottedRef.current = true
          setBubble('huh!')
          setTimeout(() => setBubble(null), 1600)
        }
        const inside = isInsideTracking(bear)
        if (!enteredRef.current && inside) {
          enteredRef.current = true
          setTrackTone('blink')
          blinkTimer = setTimeout(() => setTrackTone('alert'), 700)
        }
        if (enteredRef.current && !inside) {
          enteredRef.current = false
          setTrackTone('blink')
          blinkTimer = setTimeout(() => setTrackTone('calm'), 700)
        }
        nextFollow = followStep(followRef.current, bear)
      }

      followRef.current = nextFollow
      setActors({ bear: nextFollow.bear, drone: nextFollow.drone })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(blinkTimer)
    }
  }, [pose, step])

  useEffect(() => {
    if (pose !== 'patrol' || exitFrom) return undefined
    patrolClockRef.current = { offset: patrolOffset, t0: performance.now() }
    return undefined
  }, [pose, exitFrom, patrolOffset])

  useEffect(() => {
    if (pose !== 'patrol' || exitFrom) return undefined
    let frame = 0
    const tick = () => {
      const clock = patrolClockRef.current
      setPatrolDrone(droneOnPatrol(clock.offset, performance.now() - clock.t0))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pose, exitFrom, patrolOffset])

  useEffect(() => {
    if (!exitFrom) return undefined
    const destination = exitPoint(exitFrom)
    const droneHold = { ...followRef.current.drone }
    const ontoPercent = patrolOffsetPercent(droneHold)
    const onto = pointOnPatrol(ontoPercent)
    let phase = 'bear'
    let drone = { ...droneHold }
    let elapsed = 0
    let last = performance.now()
    let frame = 0
    const tick = (now) => {
      const dt = Math.min(40, now - last)
      last = now
      elapsed += dt
      if (phase === 'bear') {
        const k = Math.min(1, elapsed / 3400)
        const s = k * k * (3 - 2 * k)
        const bear = {
          x: exitFrom.x + (destination.x - exitFrom.x) * s,
          y: exitFrom.y + (destination.y - exitFrom.y) * s,
        }
        followRef.current = { ...followRef.current, bear, drone }
        setActors({ bear, drone })
        if (k >= 1) {
          phase = 'drone'
          elapsed = 0
        }
      } else {
        const mx = onto.x - drone.x
        const my = onto.y - drone.y
        const dist = Math.hypot(mx, my)
        if (dist < 0.35) {
          followRef.current = { ...followRef.current, drone: onto }
          setPatrolOffset(ontoPercent)
          setActors((prev) => ({ ...prev, drone: onto }))
          setExitFrom(null)
          return
        }
        const step = Math.min(dist, 0.16)
        drone = { x: drone.x + (mx / dist) * step, y: drone.y + (my / dist) * step }
        followRef.current = { ...followRef.current, drone }
        setActors((prev) => ({ ...prev, drone }))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [exitFrom])

  function onDroneAnimationEnd(event) {
    if (event.animationName === 'poc-drone-approach') {
      setApproachDone(true)
    }
  }

  return (
    <div className="poc-scene">
      <div className="poc-field">
        <div className={`poc-world poc-world--${camera}`}>
          <div className={`poc-zone poc-zone--${danger}`}>
            <span className="poc-zone-label">SAFE ZONE</span>
            {SHEEP.map((spot, index) => (
              <div
                key={index}
                className={`poc-sheep-wrap${sheepInSensor[index] ? ' poc-sheep-wrap--in-sensor' : ''}`}
                style={{ top: spot.top, left: spot.left }}
              >
                {bleats[index] && <span className="poc-bleat">{bleats[index]}</span>}
                <img
                  src="/svg/sheep.svg"
                  alt=""
                  className={`poc-sheep poc-sheep--${index} ${stressed ? 'poc-sheep--nervous' : ''}`}
                  style={{ animationDelay: `${index * 0.35}s` }}
                />
              </div>
            ))}
          </div>
          {showTrack && (
            <div className={`poc-track ${trackTone === 'alert' ? 'poc-track--alert' : ''} ${trackTone === 'blink' ? 'poc-track--blink' : ''}`} />
          )}
          {showBear && (
            <div
              className={`poc-bear-wrap${bearInSensor ? ' poc-bear-wrap--in-sensor' : ''}${
                bearInSensor && sensorVisual === 'counter' ? ' poc-bear-wrap--danger' : ''
              }`}
              style={{ left: `${actors.bear.x}%`, top: `${actors.bear.y}%` }}
            >
              <img src="/svg/bear.svg" alt="" className="poc-bear" />
            </div>
          )}
        </div>

        <div className={`poc-base poc-base--${camera}`} aria-hidden={camera === 'near'}>
          <img src="/svg/BaseStation.svg" alt="" />
          <span>BASE</span>
        </div>

        <div className="poc-step-chip">{step}</div>

        <div
          className={`poc-drone poc-drone--${droneClass}${showCounterFx ? ' poc-drone--counteraction' : ''}`}
          style={
            droneFollowStyle
              ? { left: `${actors.drone.x}%`, top: `${actors.drone.y}%` }
              : pose === 'patrol'
                ? { animationDelay: `${patrolAnimationDelay(patrolOffset)}s` }
                : undefined
          }
          onAnimationEnd={onDroneAnimationEnd}
        >
          <div className="poc-drone-anchor">
            {(patrolChirp || bubble) && (
              <span className="poc-bubble" key={`${step}-${patrolChirp ?? bubble}`}>
                {patrolChirp ?? bubble}
              </span>
            )}
            <div className={`poc-drone-sensor poc-sensor--${sensorVisual}`} aria-hidden>
              {sensorVisual === 'echo' && (
                <>
                  <span className="poc-sensor-echo poc-sensor-echo--1" />
                  <span className="poc-sensor-echo poc-sensor-echo--2" />
                  <span className="poc-sensor-echo poc-sensor-echo--3" />
                </>
              )}
              {sensorRadius > 0 && <span className="poc-sensor-disk" />}
            </div>
            {aimStyle && (
              <div className="poc-counteraction-fx" style={aimStyle} aria-hidden>
                <span className="poc-counteraction-sound" />
                <span className="poc-counteraction-beam" />
              </div>
            )}
            <img className="poc-drone-body" src={DRONE_BODY} alt="" />
            {aimStyle && (
              <div className="poc-counteraction-cries" style={aimStyle} aria-hidden>
                {COUNTER_WAVES.map((wave) => (
                  <span
                    key={wave.delay}
                    className="poc-counteraction-wave"
                    style={{ '--lane': wave.lane, '--delay': wave.delay }}
                  >
                    〰️
                  </span>
                ))}
                {COUNTER_CRIES.map((cry) => (
                  <span
                    key={cry.text}
                    className="poc-counteraction-cry"
                    style={{ '--lane': cry.lane, '--delay': cry.delay }}
                  >
                    {cry.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
