import React, { useEffect, useRef } from 'react'
import { bindScrollFadeAll } from '../scrollFade.js'
import { MissionProvider, useMission } from './MissionContext.jsx'
import PastureScene from './PastureScene.jsx'
import StmBranchPanel from './StmBranchPanel.jsx'
import PocMissionDisplay from './PocMissionDisplay.jsx'
import PocLogPanel from './PocLogPanel.jsx'
import SceneSheet from './SceneSheet.jsx'
import { useCompactViewport } from './useCompactViewport.js'
import '../../App.css'
import './SceneApp.css'

function SceneAppContent() {
  const { step, logEntries } = useMission()
  const appRef = useRef(null)
  const compact = useCompactViewport()

  useEffect(() => {
    return bindScrollFadeAll(appRef.current)
  }, [step, logEntries.length, compact])

  const appClass = [
    'app',
    'scene-app-poc',
    compact ? 'scene-app-poc--compact' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={appClass} ref={appRef}>
      <a className="scene-discover-link" href="#/discover">BE Discover</a>
      <div className="app-container">
        {compact ? (
          <SceneSheet step={step} logEntries={logEntries} />
        ) : (
          <aside className="left-panel" data-scroll-fade>
            <PocMissionDisplay step={step} />
            <StmBranchPanel />
            <PocLogPanel entries={logEntries} />
          </aside>
        )}

        <main className="main-content">
          <PastureScene step={step} />
        </main>
      </div>
    </div>
  )
}

export default function SceneApp() {
  return (
    <MissionProvider>
      <SceneAppContent />
    </MissionProvider>
  )
}
