import React from 'react'

export default function Figure({ src, alt, caption, onExpand }) {
  if (!src) return null
  const url = src.startsWith('/') ? src : `/discover/${src}`
  return (
    <figure className="discover-figure-wrap">
      <button type="button" className="discover-figure" onClick={() => onExpand?.({ src: url, alt: alt ?? caption })}>
        <img src={url} alt={alt ?? caption ?? ''} loading="lazy" />
        <span className="discover-figure__hint">Agrandir</span>
      </button>
      {caption && <figcaption className="discover-figure__caption">{caption}</figcaption>}
    </figure>
  )
}
