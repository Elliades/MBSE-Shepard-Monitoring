import React, { useState } from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './StateMachinePanel.css'

const StateMachinePanel = () => {
  const { state, getMainState, getSubstates } = useStateMachine()
  const [isMinimized, setIsMinimized] = useState(true)
  
  const mainState = getMainState()
  const substates = getSubstates()
  
  // State machine definition
  const stateMachineDefinition = {
    'Undeployed': {
      'Off': { transitions: [{ signal: 'Start SOI', to: 'Unconfigured' }] },
      'Unconfigured': { transitions: [
        { signal: 'FlightPlan', to: 'Configured' },
        { signal: 'FlightPlan Check Failed', to: 'Unconfigured' }
      ]},
      'Configured': { transitions: [{ signal: 'Ready for mission', to: 'Ready for Mission' }] },
      'Ready for Mission': { transitions: [{ signal: 'Start Sheep Guard Mission', to: 'Deployed' }] }
    },
    'Deployed': {
      'Going to Safe Area': { transitions: [{ signal: 'Start Patrolling', to: 'Patrolling' }] },
      'Patrolling': { transitions: [{ signal: 'Predator Detected inside tracking perimeter', to: 'Predator Detected' }] },
      'Predator Detected': { transitions: [{ signal: 'Predator Entering Safe Area', to: 'Predator Monitoring' }] }
    },
    'Crashed': {}
  }
  
  // Get active states
  const activeStates = [mainState, ...substates]
  
  // Render state node
  const renderStateNode = (stateName, substates, isActive = false) => {
    const stateInfo = stateMachineDefinition[stateName]
    if (!stateInfo) return null
    
    return (
      <div key={stateName} className={`state-node ${isActive ? 'active' : ''}`}>
        <div className="state-name">{stateName}</div>
        {substates && substates.length > 0 && (
          <div className="substates">
            {substates.map(sub => {
              const subInfo = stateInfo[sub]
              return (
                <div key={sub} className={`substate-node ${activeStates.includes(sub) ? 'active' : ''}`}>
                  <div className="substate-name">{sub}</div>
                  {subInfo && subInfo.transitions && (
                    <div className="transitions">
                      {subInfo.transitions.map((trans, idx) => (
                        <div key={idx} className="transition">
                          <span className="signal">{trans.signal}</span>
                          <span className="arrow">→</span>
                          <span className="target">{trans.to}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className={`state-machine-panel ${isMinimized ? 'minimized' : ''}`}>
      <div className="panel-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="panel-title">
          <span className="panel-icon">🔄</span>
          <span>State Machine</span>
        </div>
        <button
          className="minimize-btn"
          onClick={(e) => {
            e.stopPropagation()
            setIsMinimized(!isMinimized)
          }}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
      {!isMinimized && (
      <div className="panel-content">
        <div className="stm-visualization">
          {Object.entries(stateMachineDefinition).map(([stateName, stateInfo]) => {
            const isActive = activeStates.includes(stateName)
            const stateSubstates = Object.keys(stateInfo).filter(key => key !== 'transitions')
            return renderStateNode(stateName, stateSubstates, isActive)
          })}
        </div>
      </div>
      )}
    </div>
  )
}

export default StateMachinePanel

