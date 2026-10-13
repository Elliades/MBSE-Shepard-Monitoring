import { describe, it, expect } from 'vitest'
import { createMissionPilot } from './missionPilot.js'
import { STEPS } from '../stm/stepNames.js'

class FakeSocket {
  constructor(url) {
    this.url = url
    this.closed = false
    this.onopen = null
    this.onclose = null
    this.onerror = null
    this.onmessage = null
  }

  close() {
    this.closed = true
  }

  open() {
    this.onopen?.()
  }

  message(data) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}

function messages(pilot) {
  return pilot.getSnapshot().logEntries.map((entry) => entry.message)
}

describe('mission pilot', () => {
  it('plays a local signal and a remote signal onto the same step', () => {
    let n = 0
    const local = createMissionPilot({
      createId: () => {
        n += 1
        return `local-${n}`
      },
    })
    local.play('Start SOI')
    expect(local.getSnapshot().step).toBe(STEPS.Unconfigured)

    /** @type {FakeSocket | null} */
    let sock = null
    const remote = createMissionPilot({
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })
    remote.connect('ws://localhost:8080')
    sock.message({ signal: 'Start SOI' })

    expect(remote.getSnapshot().step).toBe(local.getSnapshot().step)
    expect(messages(remote)).toContain('Signal: Start SOI')
    expect(messages(remote)).toContain(`Pas → ${STEPS.Unconfigured}`)
  })

  it('journals a self-transition without moving the step', () => {
    let n = 0
    const pilot = createMissionPilot({
      createId: () => {
        n += 1
        return `id-${n}`
      },
    })
    pilot.play('Start SOI')
    pilot.play('FlightPlan Check Failed')

    expect(pilot.getSnapshot().step).toBe(STEPS.Unconfigured)
    expect(messages(pilot)).toContain('Signal: FlightPlan Check Failed')
    expect(messages(pilot).filter((line) => line.startsWith('Pas →'))).toEqual([
      `Pas → ${STEPS.Unconfigured}`,
    ])
  })

  it('does not remember an illegal id, so a retry can apply', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    const pilot = createMissionPilot({
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })
    pilot.connect('ws://localhost:8080')
    sock.message({ signal: 'FlightPlan', id: 'bad' })
    expect(pilot.getSnapshot().step).toBe(STEPS.Off)
    expect(messages(pilot)).toContain('Signal refusé: FlightPlan')

    sock.message({ signal: 'Start SOI', id: 'bad' })
    expect(pilot.getSnapshot().step).toBe(STEPS.Unconfigured)
  })

  it('ignores an echo of an accepted id', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    const pilot = createMissionPilot({
      createId: () => 'echo-1',
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
      onSend(signal, id) {
        sock.message({ signal, id })
      },
    })
    pilot.connect('ws://localhost:8080')
    pilot.play('Start SOI')

    expect(pilot.getSnapshot().step).toBe(STEPS.Unconfigured)
    expect(messages(pilot).filter((line) => line.startsWith('Écho ignoré'))).toEqual([
      'Écho ignoré: Start SOI',
    ])
  })

  it('keeps accepted ids across reset', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    let n = 0
    const pilot = createMissionPilot({
      createId: () => {
        n += 1
        return `local-${n}`
      },
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })
    pilot.connect('ws://localhost:8080')
    pilot.play('Start SOI')
    pilot.reset()

    expect(pilot.getSnapshot().step).toBe(STEPS.Off)
    sock.message({ signal: 'Start SOI', id: 'local-1' })
    expect(pilot.getSnapshot().step).toBe(STEPS.Off)
    expect(messages(pilot)).toContain('Écho ignoré: Start SOI')

    sock.message({ signal: 'Start SOI', id: 'fresh' })
    expect(pilot.getSnapshot().step).toBe(STEPS.Unconfigured)
  })

  it('drops the welcome message', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    const pilot = createMissionPilot({
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })
    pilot.connect('ws://localhost:8080')
    sock.open()
    sock.message({ type: 'info', message: 'Connected to Pasture Sentinel Test Server' })
    sock.message({ signal: 'Start SOI' })

    expect(pilot.getSnapshot().connection.status).toBe('connected')
    expect(pilot.getSnapshot().step).toBe(STEPS.Unconfigured)
    expect(messages(pilot).some((line) => line.includes('Signal: info'))).toBe(false)
  })
})
