import { useEffect, useState } from 'react'
import { COMPACT_MEDIA_QUERY } from './compactViewport.js'

function queryCompact() {
  return window.matchMedia(COMPACT_MEDIA_QUERY).matches
}

export function useCompactViewport() {
  const [compact, setCompact] = useState(queryCompact)

  useEffect(() => {
    const media = window.matchMedia(COMPACT_MEDIA_QUERY)
    const onChange = () => setCompact(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return compact
}
