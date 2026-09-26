import React, { useState } from 'react'

export default function TipToggle({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="tip-toggle">
      <button type="button" className="tip-toggle__btn" onClick={() => setOpen((v) => !v)}>
        {open ? 'Masquer l’astuce' : 'Voir l’astuce'}
      </button>
      {open && <div className="tip-toggle__body">{children}</div>}
    </div>
  )
}
