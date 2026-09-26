import { CAMEO_REFS } from './cameoRefs.js'

const DEFAULT_BASE = '/omf'

/**
 * @param {{ fetchFn?: typeof fetch, base?: string }} [options]
 */
export function createCameoPort(options = {}) {
  const fetchFn = options.fetchFn ?? fetch
  const base = options.base ?? import.meta.env.VITE_OMF_BASE ?? DEFAULT_BASE
  /** @type {Map<string, { id: string, kind: string }>} */
  const cache = new Map()

  async function ping() {
    try {
      const res = await fetchFn(`${base}`, { method: 'GET' })
      return res.ok ? 'connected' : 'disconnected'
    } catch {
      return 'disconnected'
    }
  }

  async function post(category, name, args = []) {
    const res = await fetchFn(`${base}/${category}/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.ok === false) {
      const err = json.error ?? res.statusText
      throw new Error(typeof err === 'string' ? err : 'Cameo request failed')
    }
    return json.result
  }

  /**
   * @param {string} refKey
   */
  function refMeta(refKey) {
    const meta = CAMEO_REFS[refKey]
    if (!meta) throw new Error(`Unknown ref: ${refKey}`)
    return meta
  }

  /**
   * @param {string} refKey
   */
  async function resolve(refKey) {
    const cached = cache.get(refKey)
    if (cached) return cached
    const meta = refMeta(refKey)
    const { qname, kind, label } = meta
    let result
    try {
      result = await post('model', 'getByQualifiedName', [qname])
    } catch {
      const matches = await post('model', 'getElementsByName', [label])
      const list = Array.isArray(matches) ? matches : []
      result =
        list.find((el) => el?.name === label) ??
        list.find((el) => el?.humanName?.includes(label)) ??
        list[0]
    }
    const id = result?.id
    if (!id) throw new Error(`Element not found: ${qname}`)
    const entry = { id, kind }
    cache.set(refKey, entry)
    return entry
  }

  /**
   * @param {string} refKey
   * @param {(msg: string) => void} [onFallback]
   */
  async function reveal(refKey, onFallback) {
    const meta = refMeta(refKey)
    try {
      const { id, kind } = await resolve(refKey)
      if (kind === 'diagram') {
        await post('diagram', 'open', [{ elementId: id }])
      } else {
        await post('browser', 'select', [{ elementId: id }])
      }
      return { ok: true, mode: kind === 'diagram' ? 'open' : 'select' }
    } catch (err) {
      const path = meta.qname.replace(/::/g, ' / ')
      await copyText(path)
      onFallback?.(`Cameo indisponible — chemin copié : ${path}`)
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { ping, resolve, reveal, refMeta, post }
}

/**
 * @param {string} text
 */
export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}
