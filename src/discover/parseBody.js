const REF_RE = /\{ref:([^}]+)\}/g

/**
 * @param {string} body
 * @returns {{ type: 'text' | 'ref', value: string }[]}
 */
export function parseBody(body) {
  if (!body) return []
  const parts = []
  let last = 0
  for (const match of body.matchAll(REF_RE)) {
    const index = match.index ?? 0
    if (index > last) {
      parts.push({ type: 'text', value: body.slice(last, index) })
    }
    parts.push({ type: 'ref', value: match[1] })
    last = index + match[0].length
  }
  if (last < body.length) {
    parts.push({ type: 'text', value: body.slice(last) })
  }
  return parts
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function extractRefKeys(text) {
  const keys = []
  for (const match of text.matchAll(REF_RE)) {
    keys.push(match[1])
  }
  return keys
}
