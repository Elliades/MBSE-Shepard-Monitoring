import { describe, it, expect } from 'vitest'
import { createWsClient } from './wsClient.js'

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

describe('createWsClient', () => {
  it('opens a socket and reports connected', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    const statuses = []
    const client = createWsClient({
      onRemote: () => {},
      onStatus: (connection) => statuses.push(connection.status),
      socketFactory: (url) => {
        sock = new FakeSocket(url)
        return /** @type {unknown} */ (sock)
      },
    })

    client.connect('ws://localhost:8080')
    expect(client.getConnection()).toEqual({
      status: 'connecting',
      url: 'ws://localhost:8080',
    })

    sock.open()
    expect(client.getConnection().status).toBe('connected')
    expect(statuses).toEqual(['connecting', 'connected'])
  })

  it('ignores the welcome meta message', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    const remote = []
    const client = createWsClient({
      onRemote: (signal, id) => remote.push({ signal, id }),
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })

    client.connect('ws://localhost:8080')
    sock.open()
    sock.message({ type: 'info', message: 'Connected to Pasture Sentinel Test Server' })

    expect(remote).toEqual([])
  })

  it('assigns a fresh id to each message that has none', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    let n = 0
    const remote = []
    const client = createWsClient({
      onRemote: (signal, id) => remote.push({ signal, id }),
      createId: () => {
        n += 1
        return `gen-${n}`
      },
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })

    client.connect('ws://localhost:8080')
    sock.message({ signal: 'Start SOI' })
    sock.message({ signal: 'FlightPlan' })

    expect(remote).toEqual([
      { signal: 'Start SOI', id: 'gen-1' },
      { signal: 'FlightPlan', id: 'gen-2' },
    ])
  })

  it('disconnect closes the socket', () => {
    /** @type {FakeSocket | null} */
    let sock = null
    const client = createWsClient({
      onRemote: () => {},
      socketFactory: () => {
        sock = new FakeSocket('ws://localhost:8080')
        return /** @type {unknown} */ (sock)
      },
    })

    client.connect('ws://localhost:8080')
    client.disconnect()

    expect(sock.closed).toBe(true)
    expect(client.getConnection()).toEqual({ status: 'disconnected', url: '' })
  })
})
