import React from 'react'
import { CAMEO_REFS } from '../cameoRefs.js'

const KIND_ICON = {
  diagram: '▣',
  package: '▤',
  activity: '⚙',
  signal: '⚡',
  actor: '👤',
  state: '◎',
}

export default function CameoChip({ refKey, onReveal }) {
  const meta = CAMEO_REFS[refKey]
  if (!meta) return <span className="cameo-chip cameo-chip--missing">{refKey}</span>

  return (
    <button
      type="button"
      className="cameo-chip"
      title={meta.qname}
      onClick={() => onReveal?.(refKey)}
    >
      <span className="cameo-chip__icon" aria-hidden>{KIND_ICON[meta.kind] ?? '•'}</span>
      <span className="cameo-chip__label">{meta.label}</span>
    </button>
  )
}
