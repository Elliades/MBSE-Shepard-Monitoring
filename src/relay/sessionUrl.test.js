import { describe, it, expect } from 'vitest'
import {
  normalizeSessionCode,
  buildUiRelayWebSocketUrl,
  getSessionFromLocation,
  isLocalDevMode,
} from './sessionUrl.js'

describe('sessionUrl', () => {
  it('accepts base32 session codes', () => {
    expect(normalizeSessionCode('abcd2345')).toBe('ABCD2345')
    expect(normalizeSessionCode('short')).toBe(null)
  })

  it('reads the session from a browser Location (no searchParams)', () => {
    const loc = { search: '?session=abcd2345' }
    expect(getSessionFromLocation(loc)).toBe('ABCD2345')
    expect(isLocalDevMode({ search: '?dev=local' })).toBe(true)
    expect(isLocalDevMode({ search: '' })).toBe(false)
  })

  it('does not throw when searchParams is missing', () => {
    expect(() => getSessionFromLocation({ search: '' })).not.toThrow()
    expect(getSessionFromLocation({})).toBe(null)
  })

  it('builds relay URL from page location', () => {
    const loc = {
      protocol: 'https:',
      host: 'shepherd.example:3130',
    }
    expect(buildUiRelayWebSocketUrl('ABCDEFGH', loc)).toBe(
      'wss://shepherd.example:3130/relay/ui?session=ABCDEFGH'
    )
  })
})
