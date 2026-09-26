import React from 'react'
import { FAQ_SNIPPETS } from '../script/part1.js'
import Figure from './Figure.jsx'

export default function ContextPanel({ open, onClose, onOpen, figure, faqKeys, tips }) {
  const hasContent = Boolean(figure) || (tips?.length > 0) || (faqKeys?.length > 0)

  if (!open) {
    return (
      <aside className="discover-context discover-context--collapsed">
        <button type="button" className="discover-context__toggle" onClick={onOpen} aria-label="Ouvrir le contexte">
          ‹
        </button>
        <span className="discover-context__placeholder">Contexte</span>
      </aside>
    )
  }

  return (
    <aside className="discover-context">
      <header className="discover-context__head">
        <h2>Contexte</h2>
        <button type="button" className="discover-context__close" onClick={onClose} aria-label="Replier le contexte">
          ›
        </button>
      </header>
      {!hasContent && (
        <p className="discover-context__empty">
          Astuce, FAQ ou figure de l’étape apparaissent ici.
        </p>
      )}
      {figure && (
        <div className="discover-context__block">
          <Figure src={figure.src} alt={figure.alt} />
        </div>
      )}
      {tips?.length > 0 && (
        <div className="discover-context__block">
          <h3>Astuces</h3>
          <ul>
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {faqKeys?.length > 0 && (
        <div className="discover-context__block">
          <h3>FAQ</h3>
          {faqKeys.map((key) => (
            <p key={key} className="discover-context__faq">{FAQ_SNIPPETS[key] ?? key}</p>
          ))}
        </div>
      )}
    </aside>
  )
}
