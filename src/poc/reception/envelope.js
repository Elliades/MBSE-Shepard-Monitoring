/**
 * Wire envelope from the test server or a future MagicDraw port.
 * `{ signal }` or `{ type: "<signal name>" }` is a signal.
 * `{ type: "info", ... }` is connection meta and is not a signal.
 * @param {unknown} data
 * @returns {{ kind: 'signal', signal: string, id: string | null } | { kind: 'meta' } | { kind: 'ignore' }}
 */
export function parseEnvelope(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { kind: 'ignore' }
  }

  const record = /** @type {Record<string, unknown>} */ (data)
  if (typeof record.signal === 'string' && record.signal.length > 0) {
    return { kind: 'signal', signal: record.signal, id: normalizeId(record.id) }
  }
  if (record.type === 'info') {
    return { kind: 'meta' }
  }
  if (typeof record.type === 'string' && record.type.length > 0) {
    return { kind: 'signal', signal: record.type, id: normalizeId(record.id) }
  }
  return { kind: 'ignore' }
}

/**
 * @param {unknown} id
 * @returns {string | null}
 */
function normalizeId(id) {
  if (typeof id === 'string' && id.length > 0) return id
  return null
}
