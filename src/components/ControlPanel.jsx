import React, { useState } from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './ControlPanel.css'

const ControlPanel = () => {
  const { wsUrl, setWsUrl, isConnected } = useStateMachine()
  const [inputUrl, setInputUrl] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleConnectWebSocket = () => {
    if (inputUrl) {
      setWsUrl(inputUrl)
    }
  }

  const handleDisconnectWebSocket = () => {
    setWsUrl('')
    setInputUrl('')
  }

  return (
    <div className="control-panel">
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>🔧 Configuration</h3>
        <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
      </div>
      {!isCollapsed && (
      <div className="panel-content">
        {/* WebSocket Configuration */}
        <div className="websocket-config">
          <div className="config-title">WebSocket Connection</div>
          {!wsUrl ? (
            <div className="config-form">
              <input
                type="text"
                placeholder="ws://localhost:8080"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="ws-input"
              />
              <button
                className="ws-button connect"
                onClick={handleConnectWebSocket}
                disabled={!inputUrl}
              >
                Connect
              </button>
            </div>
          ) : (
            <div className="config-status">
              <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Connected' : '○ Disconnected'}
              </div>
              <div className="ws-url">{wsUrl}</div>
              <button
                className="ws-button disconnect"
                onClick={handleDisconnectWebSocket}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

export default ControlPanel

