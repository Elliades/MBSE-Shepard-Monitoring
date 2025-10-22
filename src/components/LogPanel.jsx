import React, { useEffect, useRef } from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './LogPanel.css'

const LogPanel = () => {
  const { logs } = useStateMachine()
  const logContainerRef = useRef(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✕'
      case 'info': return 'ℹ'
      default: return '•'
    }
  }

  return (
    <div className="log-panel">
      <div className="panel-header">
        <h3>📋 Event Log</h3>
      </div>
      <div className="panel-content">
        <div className="log-container" ref={logContainerRef}>
          {logs.map(log => (
            <div key={log.id} className={`log-entry log-${log.type}`}>
              <span className="log-icon">{getLogIcon(log.type)}</span>
              <div className="log-content">
                <div className="log-message">{log.message}</div>
                <div className="log-timestamp">{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LogPanel

