import React, { useState, useEffect, useMemo } from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './StatusPanel.css'

const StatusPanel = () => {
  const { state, getMainState, getSubstates, sendSignal } = useStateMachine()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  console.log('📊 StatusPanel: Calling getMainState and getSubstates')
  const currentState = getMainState()
  const substates = getSubstates()
  console.log('📊 StatusPanel: Got results:', { currentState, substates })
  console.log('   Full state.value:', JSON.stringify(state.value))

  // Debug: Log the state
  console.log('🎯 StatusPanel RENDER')
  console.log('  Current state:', currentState)
  console.log('  Substates:', substates)
  console.log('  Full state value:', JSON.stringify(state.value, null, 2))

  // Get ALL active states (parent + children)
  const getAllActiveStates = () => {
    const activeStates = []
    
    // Add main state
    if (currentState) {
      activeStates.push(currentState)
    }
    
    // Add all substates
    if (substates && substates.length > 0) {
      activeStates.push(...substates)
    }
    
    return activeStates
  }

  // Get available transitions from current state
  const getAvailableTransitions = () => {
    // Define all possible transitions based on state machine
    const allTransitions = [
      { from: 'Off', signal: 'Start SOI', to: 'Unconfigured' },
      { from: 'Unconfigured', signal: 'FlightPlan', to: 'Configured' },
      { from: 'Unconfigured', signal: 'FlightPlan Check Failed', to: 'Unconfigured' },
      { from: 'Configured', signal: 'Ready for mission', to: 'Ready for Mission' },
      { from: 'Ready for Mission', signal: 'Start Sheep Guard Mission', to: 'Deployed' },
      { from: 'Going to Safe Area', signal: 'Start Patrolling', to: 'Patrolling' },
      { from: 'Patrolling', signal: 'Predator Detected inside tracking perimeter', to: 'Predator Detected' },
      { from: 'Predator tracking', signal: 'Predator Entering Safe Area', to: 'Predator Monitoring' },
      { from: 'Deployed', signal: 'Crashed Detected', to: 'Crashed' },
    ]

    // Get all active states (parent + children)
    const activeStates = getAllActiveStates()
    
    console.log('StatusPanel - Active states for transitions:', activeStates)
    
    // Filter transitions based on active states
    const available = allTransitions.filter(t => 
      activeStates.some(s => s === t.from || s.includes(t.from) || t.from.includes(s))
    )
    
    console.log('StatusPanel - Available transitions:', available)
    
    return available
  }

  const availableTransitions = getAvailableTransitions()
  const allActiveStates = getAllActiveStates()

  return (
    <div className="status-panel">
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>📊 Active States</h3>
        <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
      </div>
      <div className={`panel-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="status-item">
          <span className="status-label">Active States:</span>
          <div className="substates-list">
            {allActiveStates.map((activeState, idx) => (
              <span key={idx} className={idx === 0 ? 'state-badge' : 'substate-badge'}>
                {activeState}
              </span>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        <div className="status-item">
          <span className="status-label">Available Transitions:</span>
          {availableTransitions.length > 0 ? (
            <div className="transitions-list">
              {availableTransitions.map((transition, idx) => (
                <button
                  key={idx}
                  className="transition-button"
                  onClick={() => sendSignal(transition.signal)}
                  title={`${transition.from} → ${transition.to}`}
                >
                  <span className="transition-arrow">→</span>
                  <span className="transition-label">{transition.signal}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-transitions">No transitions available from this state</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusPanel

