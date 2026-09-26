import React, { useState } from 'react'
import { copyText } from '../cameoPort.js'

export default function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="copy-field">
      <span className="copy-field__label">{label}</span>
      <code className="copy-field__value">{value}</code>
      <button type="button" className="copy-field__btn" onClick={handleCopy}>
        {copied ? 'Copié' : 'Copier'}
      </button>
    </div>
  )
}
