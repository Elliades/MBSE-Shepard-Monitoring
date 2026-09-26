import { parseEnvelope } from './envelope.js'
import { createSignalId } from './ids.js'

/**
 * @typedef {'disconnected' | 'connecting' | 'connected' | 'error'} ConnectionStatus
 * @typedef {{ status: ConnectionStatus, url: string }} Connection
 */

/**
 * @param {{
 *   onRemote: (signal: string, id: string) => void,
 *   onStatus?: (connection: Connection) => void,
 *   createId?: () => string,
 *   socketFactory?: (url: string) => WebSocket,
 * }} options
 */
export function createWsClient(options) {
  const createId = options.createId ?? createSignalId
  /** @type {Connection} */
  let connection = { status: 'disconnected', url: '' }
  /** @type {WebSocket | null} */
  let socket = null

  function setConnection(next) {
    connection = next
    options.onStatus?.(connection)
  }

  function detach(ws) {
    ws.onopen = null
    ws.onclose = null
    ws.onerror = null
    ws.onmessage = null
  }

  /**
   * @param {unknown} data
   */
  function deliver(data) {
    const envelope = parseEnvelope(data)
    if (envelope.kind !== 'signal') return envelope
    const id = envelope.id ?? createId()
    options.onRemote(envelope.signal, id)
    return { kind: 'signal', signal: envelope.signal, id }
  }

  function connect(url) {
    disconnect()
    const factory = options.socketFactory ?? ((target) => new WebSocket(target))
    const ws = factory(url)
    socket = ws
    setConnection({ status: 'connecting', url })

    ws.onopen = () => {
      if (socket !== ws) return
      setConnection({ status: 'connected', url })
    }
    ws.onerror = () => {
      if (socket !== ws) return
      setConnection({ status: 'error', url })
    }
    ws.onclose = () => {
      if (socket !== ws) return
      socket = null
      setConnection({ status: 'disconnected', url })
    }
    ws.onmessage = (event) => {
      if (socket !== ws) return
      let data
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }
      deliver(data)
    }
  }

  function disconnect() {
    const current = socket
    socket = null
    if (current) {
      detach(current)
      current.close()
    }
    if (connection.status !== 'disconnected' || connection.url !== '') {
      setConnection({ status: 'disconnected', url: '' })
    }
  }

  return {
    connect,
    disconnect,
    getConnection: () => connection,
    deliver,
  }
}
