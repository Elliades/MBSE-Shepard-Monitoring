import { describe, expect, it, vi } from 'vitest'
import { createCameoPort } from './cameoPort.js'

describe('cameoPort', () => {
  it('ping returns connected when GET succeeds', async () => {
    const fetchFn = vi.fn(async () => ({ ok: true }))
    const port = createCameoPort({ fetchFn, base: '/omf' })
    await expect(port.ping()).resolves.toBe('connected')
  })

  it('reveal opens diagram via diagram/open', async () => {
    const calls = []
    const fetchFn = vi.fn(async (url, init) => {
      calls.push({ url, body: init?.body })
      if (url.endsWith('/model/getByQualifiedName')) {
        return {
          ok: true,
          json: async () => ({ ok: true, result: { id: 'diag-1', kind: 'diagram' } }),
        }
      }
      return { ok: true, json: async () => ({ ok: true, result: {} }) }
    })
    const port = createCameoPort({ fetchFn, base: '/omf' })
    const result = await port.reveal('opContext')
    expect(result.ok).toBe(true)
    expect(calls.some((c) => c.url.includes('/diagram/open'))).toBe(true)
  })

  it('reveal selects non-diagram via browser/select', async () => {
    const fetchFn = vi.fn(async (url) => {
      if (url.endsWith('/model/getByQualifiedName')) {
        return {
          ok: true,
          json: async () => ({ ok: true, result: { id: 'pkg-1' } }),
        }
      }
      return { ok: true, json: async () => ({ ok: true, result: {} }) }
    })
    const port = createCameoPort({ fetchFn, base: '/omf' })
    const result = await port.reveal('funcDeployPkg')
    expect(result.ok).toBe(true)
    expect(fetchFn.mock.calls.some(([u]) => u.includes('/browser/select'))).toBe(true)
  })
})
