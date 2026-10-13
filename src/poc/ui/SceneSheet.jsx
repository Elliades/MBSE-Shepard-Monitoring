import React, { useState } from 'react'
import PocLogPanel from './PocLogPanel.jsx'
import PocMissionDisplay from './PocMissionDisplay.jsx'
import StmBranchPanel from './StmBranchPanel.jsx'
import './SceneSheet.css'

const TABS = [
  { id: 'mission', label: 'Mission' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'journal', label: 'Journal' },
]

export default function SceneSheet({ step, logEntries }) {
  const [tab, setTab] = useState(null)

  function selectTab(id) {
    setTab((current) => (current === id ? null : id))
  }

  return (
    <section
      className={`scene-sheet${tab ? ' scene-sheet--open' : ' scene-sheet--peek'}`}
      aria-label="Panneaux"
    >
      <div className="scene-sheet__dock" data-scroll-fade>
        <StmBranchPanel part="actions" />
      </div>

      <div className="scene-sheet__tabs" role="tablist" aria-label="Panneaux de la scène">
        {TABS.map((item) => {
          const selected = tab === item.id
          const count = item.id === 'journal' ? logEntries.length : null
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`scene-sheet-tab-${item.id}`}
              className="scene-sheet__tab"
              aria-selected={selected}
              aria-controls="scene-sheet-panel"
              onClick={() => selectTab(item.id)}
            >
              <span>{item.label}</span>
              {count > 0 && <span className="scene-sheet__count">{count}</span>}
            </button>
          )
        })}
      </div>

      {tab && (
        <div
          className="scene-sheet__panel"
          id="scene-sheet-panel"
          role="tabpanel"
          aria-labelledby={`scene-sheet-tab-${tab}`}
          data-scroll-fade
        >
          {tab === 'mission' && <PocMissionDisplay step={step} collapsible={false} />}
          {tab === 'parcours' && <StmBranchPanel part="tools" />}
          {tab === 'journal' && <PocLogPanel entries={logEntries} collapsible={false} />}
        </div>
      )}
    </section>
  )
}
