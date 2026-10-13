import React from 'react'
import { parseBody } from '../parseBody.js'
import CameoChip from './CameoChip.jsx'

export default function BodyText({ text, onReveal }) {
  const parts = parseBody(text)
  return (
    <p className="discover-body">
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.value}</span>
        ) : (
          <CameoChip key={i} refKey={part.value} onReveal={onReveal} />
        ),
      )}
    </p>
  )
}
