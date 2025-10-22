import React from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './ActionButtons.css'

const ActionButtons = () => {
  const { logs, addLog, addNotification } = useStateMachine()

  const handleReset = () => {
    // Reload the page to reset everything
    if (window.confirm('Are you sure you want to reset the entire mission? This will refresh the page.')) {
      window.location.reload()
    }
  }

  const handleExportLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n')

    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pasture-sentinel-logs-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addLog('success', 'Logs exported successfully')
    addNotification('success', 'Logs Exported', 'Event log saved to file')
  }

  const handleExportJSON = () => {
    const data = {
      exportTime: new Date().toISOString(),
      logs: logs,
      totalEvents: logs.length,
      application: 'Pasture Sentinel',
      version: '1.0.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pasture-sentinel-data-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addLog('success', 'Data exported as JSON')
    addNotification('success', 'JSON Exported', 'Mission data saved to file')
  }

  return (
    <div className="action-buttons">
      <div className="panel-header">
        <h3>⚡ Actions</h3>
      </div>
      <div className="panel-content">
        <button className="action-button reset" onClick={handleReset}>
          <span className="action-icon">🔄</span>
          <div className="action-text">
            <div className="action-title">Reset Mission</div>
            <div className="action-desc">Restart from beginning</div>
          </div>
        </button>

        <button className="action-button export" onClick={handleExportLogs}>
          <span className="action-icon">📄</span>
          <div className="action-text">
            <div className="action-title">Export Logs</div>
            <div className="action-desc">Save as text file</div>
          </div>
        </button>

        <button className="action-button export" onClick={handleExportJSON}>
          <span className="action-icon">💾</span>
          <div className="action-text">
            <div className="action-title">Export JSON</div>
            <div className="action-desc">Save mission data</div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default ActionButtons

