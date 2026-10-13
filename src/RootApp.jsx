import React, { useEffect, useState } from 'react'
import SceneApp from './poc/ui/SceneApp.jsx'
import DiscoverApp from './discover/ui/DiscoverApp.jsx'

function isDiscoverRoute() {
  const hash = window.location.hash
  return hash === '#/discover' || hash.startsWith('#/discover/')
}

export default function RootApp() {
  const [discover, setDiscover] = useState(isDiscoverRoute)

  useEffect(() => {
    const onHashChange = () => setDiscover(isDiscoverRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (discover) return <DiscoverApp />
  return <SceneApp />
}
