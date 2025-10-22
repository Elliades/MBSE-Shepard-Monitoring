import React, { useEffect, useState } from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './StatisticsPanel.css'

const StatisticsPanel = () => {
  const { state, logs } = useStateMachine()
  const [stats, setStats] = useState({
    totalTransitions: 0,
    totalTime: 0,
    stateHistory: {}
  })

  useEffect(() => {
    // Count transitions from logs
    const transitionLogs = logs.filter(log => log.message.startsWith('State:'))
    
    // Calculate statistics
    const stateHistory = {}
    transitionLogs.forEach(log => {
      const stateName = log.message.split(':')[1]?.trim() || 'Unknown'
      stateHistory[stateName] = (stateHistory[stateName] || 0) + 1
    })

    setStats({
      totalTransitions: transitionLogs.length,
      totalTime: logs.length > 0 ? Math.round((Date.now() - logs[0].id) / 1000) : 0,
      stateHistory
    })
  }, [logs])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="statistics-panel">
      <div className="panel-header">
        <h3>📈 Statistics</h3>
      </div>
      <div className="panel-content">
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalTransitions}</div>
            <div className="stat-label">Transitions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatTime(stats.totalTime)}</div>
            <div className="stat-label">Runtime</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Object.keys(stats.stateHistory).length}</div>
            <div className="stat-label">States Visited</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>

        {Object.keys(stats.stateHistory).length > 0 && (
          <div className="state-history">
            <div className="history-title">State History</div>
            {Object.entries(stats.stateHistory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([state, count]) => (
                <div key={state} className="history-item">
                  <span className="history-state">{state}</span>
                  <span className="history-count">{count}×</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsPanel

