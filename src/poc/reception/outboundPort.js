/**
 * Outbound hook for MagicDraw. No protocol yet.
 * @param {{ onSend?: (signal: string, id: string) => void }} [options]
 */
export function createOutboundPort(options = {}) {
  return {
    send(signal, id) {
      options.onSend?.(signal, id)
    },
  }
}
