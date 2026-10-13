/**
 * Validates discover Cameo refs against a running OMF HTTP server (MagicDraw open).
 * Usage: node scripts/validate-discover-refs.mjs
 */
import { CAMEO_REFS } from '../src/discover/cameoRefs.js'

const base = process.env.OMF_MCP_BASE ?? 'http://127.0.0.1:9851/mcp'

async function post(category, name, args) {
  const res = await fetch(`${base}/${category}/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.ok === false) {
    throw new Error(json.error ?? res.statusText)
  }
  return json.result
}

async function resolveRef(key, meta) {
  try {
    return await post('model', 'getByQualifiedName', [meta.qname])
  } catch {
    const matches = await post('model', 'getElementsByName', [meta.label])
    const list = Array.isArray(matches) ? matches : []
    const hit =
      list.find((el) => el?.name === meta.label) ??
      list.find((el) => el?.humanName?.includes(meta.label)) ??
      list[0]
    if (!hit?.id) throw new Error('no match')
    return hit
  }
}

const keys = Object.keys(CAMEO_REFS)
let ok = 0
for (const key of keys) {
  const meta = CAMEO_REFS[key]
  try {
    const el = await resolveRef(key, meta)
    console.log(`OK  ${key} → ${el.humanName ?? el.name} (${el.id})`)
    ok += 1
  } catch (err) {
    console.log(`MISS ${key} (${meta.label}): ${err.message}`)
  }
}
console.log(`\n${ok}/${keys.length} resolved`)
process.exit(ok === keys.length ? 0 : 1)
