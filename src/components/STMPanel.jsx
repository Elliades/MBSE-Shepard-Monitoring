import React, { useState } from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './STMPanel.css'

const STMPanel = () => {
  const { state, getMainState, getSubstates } = useStateMachine()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const mainState = getMainState()
  const substates = getSubstates()
  
  // State machine definition
  const stateMachineDefinition = {
    'Undeployed': {
      'Off': { 
        transitions: [{ signal: 'Start SOI', to: 'Unconfigured' }]
      },
      'Unconfigured': { 
        transitions: [
          { signal: 'FlightPlan', to: 'Configured' },
          { signal: 'FlightPlan Check Failed', to: 'Unconfigured' }
        ]
      },
      'Configured': { 
        transitions: [{ signal: 'Ready for mission', to: 'Ready for Mission' }]
      },
      'Ready for Mission': { 
        transitions: [{ signal: 'Start Sheep Guard Mission', to: 'Deployed' }]
      }
    },
    'Deployed': {
      'Going to Safe Area': { 
        transitions: [{ signal: 'Start Patrolling', to: 'Patrolling' }]
      },
      'Patrolling': { 
        transitions: [{ signal: 'Predator Detected inside tracking perimeter', to: 'Predator Detected' }]
      },
      'Predator Detected': { 
        transitions: [{ signal: 'Predator Entering Safe Area', to: 'Predator Monitoring' }]
      }
    },
    'Crashed': {
      'Crashed': { transitions: [] }
    }
  }
  
  // Get current state info
  const getCurrentStateInfo = () => {
    const info = {
      main: mainState,
      sub: substates.length > 0 ? substates[0] : null,
      transitions: []
    }
    
    if (stateMachineDefinition[mainState]) {
      const subState = stateMachineDefinition[mainState][info.sub]
      if (subState) {
        info.transitions = subState.transitions
      }
    }
    
    return info
  }
  
  const currentState = getCurrentStateInfo()
  
  return (
    <div className="stm-panel">
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>🔄 State Machine</h3>
        <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
      </div>
      <div className={`panel-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="stm-current-state">
          <div className="state-display">
            <div className="state-main">{currentState.main}</div>
            {currentState.sub && (
              <div className="state-arrow">→</div>
            )}
            {currentState.sub && (
              <div className="state-sub">{currentState.sub}</div>
            )}
          </div>
        </div>
        
        <div className="stm-transitions">
          <div className="transitions-title">Available Transitions:</div>
          {currentState.transitions.length > 0 ? (
            <div className="transitions-list">
              {currentState.transitions.map((transition, idx) => (
                <div key={idx} className="transition-item">
                  <div className="transition-signal">🡢 {transition.signal}</div>
                  <div className="transition-target">→ {transition.to}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-transitions">No transitions available</div>
          )}
        </div>
        
        <div className="stm-diagram">
          <div className="diagram-title">State Hierarchy:</div>
          <div className="diagram-content">
            {Object.entries(stateMachineDefinition).map(([main, substates]) => (
              <div key={main} className="diagram-main-state">
                <div className={`diagram-state-name ${main === currentState.main ? 'active' : ''}`}>
                  {main}
                </div>
                <div className="diagram-substates">
                  {Object.entries(substates).map(([sub, info]) => (
                    <div 
                      key={sub} 
                      className={`diagram-substate ${sub === currentState.sub ? 'active' : ''}`}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default STMPanel

