import { describe, it, expect } from 'vitest'
import { parseEnvelope } from './envelope.js'

describe('parseEnvelope', () => {
  it('reads a signal field', () => {
    expect(parseEnvelope({ signal: 'Start SOI' })).toEqual({
      kind: 'signal',
      signal: 'Start SOI',
      id: null,
    })
  })

  it('reads a type field as a signal name', () => {
    expect(parseEnvelope({ type: 'Start Patrolling' })).toEqual({
      kind: 'signal',
      signal: 'Start Patrolling',
      id: null,
    })
  })

  it('keeps an explicit id', () => {
    expect(parseEnvelope({ signal: 'Start SOI', id: 'md-1' })).toEqual({
      kind: 'signal',
      signal: 'Start SOI',
      id: 'md-1',
    })
  })

  it('treats the welcome message as meta', () => {
    expect(
      parseEnvelope({ type: 'info', message: 'Connected to Pasture Sentinel Test Server' })
    ).toEqual({ kind: 'meta' })
  })

  it('prefers signal when both signal and type are present', () => {
    expect(parseEnvelope({ signal: 'Start SOI', type: 'info' })).toEqual({
      kind: 'signal',
      signal: 'Start SOI',
      id: null,
    })
  })
})
