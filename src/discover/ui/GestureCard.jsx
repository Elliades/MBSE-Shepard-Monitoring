import React, { useState } from 'react'
import { GESTURES } from '../gestures.js'

export default function GestureCard({ gestureId }) {
  const g = GESTURES[gestureId]
  const [open, setOpen] = useState(false)
  if (!g) return null

  return (
    <div className="gesture-card">
      <button type="button" className="gesture-card__head" onClick={() => setOpen((v) => !v)}>
        <span className="gesture-card__title">Geste : {g.title}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ol className="gesture-card__steps">
          {g.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
