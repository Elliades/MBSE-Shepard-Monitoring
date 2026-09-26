import React, { useState } from 'react'
import '../../components/LogPanel.css'

export default function PocLogPanel({ entries, collapsible = true }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const collapsed = collapsible && isCollapsed

  return (
    <div className={`log-panel${collapsed ? ' is-collapsed' : ''}`}>
      {collapsible && (
        <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
          <h3>Event log</h3>
          <span className="log-count">{entries.length}</span>
          <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
        </div>
      )}
      <div className={`panel-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="log-entries" data-scroll-fade>
          {entries.length === 0 ? (
            <div className="log-entry info">Waiting for signals…</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className={`log-entry ${entry.type}`}>
                <span className="log-time">{entry.time}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
