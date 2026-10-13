import { LocalStm } from '../stm/machine.js'
import {
  NOMINAL_SCENARIO,
  STM_LANES,
  getOutgoingTransitions,
} from '../stm/steps.js'
import { STEPS } from '../stm/stepNames.js'
import { createSignalId } from '../reception/ids.js'
import { createSeenIds } from '../reception/seenIds.js'
import { createOutboundPort } from '../reception/outboundPort.js'
import { createWsClient } from '../reception/wsClient.js'

function makeLogEntry(type, message) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    message,
    time: new Date().toLocaleTimeString(),
  }
}

/**
 * Wires reception and the local STM into one snapshot for the UI.
 * Clicks and remote messages share apply().
 * @param {{
 *   createId?: () => string,
 *   socketFactory?: (url: string) => WebSocket,
 *   onSend?: (signal: string, id: string) => void,
 * }} [options]
 */
export function createMissionPilot(options = {}) {
  const createId = options.createId ?? createSignalId
  const stm = new LocalStm()
  const seenIds = createSeenIds()
  const outbound = createOutboundPort({ onSend: options.onSend })
  /** @type {Set<() => void>} */
  const listeners = new Set()
  let logEntries = [makeLogEntry('info', 'Scène initialisée — pas Off')]
  let snapshot = null

  const wsClient = createWsClient({
    createId,
    socketFactory: options.socketFactory,
    onStatus: () => publish(),
    onRemote: (signal, id) => {
      apply(signal, id, false)
    },
  })

  function publish() {
    snapshot = {
      step: stm.step,
      outgoing: getOutgoingTransitions(stm.step),
      lanes: STM_LANES,
      crashed: stm.step === STEPS.Crashed,
      logEntries,
      connection: wsClient.getConnection(),
    }
    for (const listener of listeners) {
      listener()
    }
  }

  function append(type, message) {
    logEntries = [...logEntries, makeLogEntry(type, message)]
  }

  /**
   * @param {string} signal
   * @param {string} id
   * @param {boolean} send
   */
  function apply(signal, id, send) {
    if (seenIds.has(id)) {
      append('info', `Écho ignoré: ${signal}`)
      publish()
      return { accepted: false, echo: true, step: stm.step }
    }

    const before = stm.step
    const result = stm.accept(signal)
    if (!result.accepted) {
      append('info', `Signal refusé: ${signal}`)
      publish()
      return { accepted: false, echo: false, step: stm.step }
    }

    seenIds.remember(id)
    append('info', `Signal: ${signal}`)
    if (result.step !== before) {
      append('success', `Pas → ${result.step}`)
    }
    if (send) outbound.send(signal, id)
    publish()
    return { accepted: true, echo: false, step: result.step }
  }

  function play(signal) {
    return apply(signal, createId(), true)
  }

  function runNominalScenario() {
    append('info', 'Scénario nominal…')
    publish()
    for (const signal of NOMINAL_SCENARIO) {
      play(signal)
    }
  }

  function reset() {
    stm.reset()
    logEntries = [makeLogEntry('info', 'Mission réinitialisée')]
    publish()
  }

  function connect(url) {
    if (!url) return
    wsClient.connect(url)
  }

  publish()

  return {
    play,
    runNominalScenario,
    reset,
    connect,
    disconnect: () => wsClient.disconnect(),
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
  }
}
