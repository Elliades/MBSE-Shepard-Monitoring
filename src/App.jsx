import React, { useCallback } from 'react'
import './App.css'
import { StateMachineProvider, useStateMachine } from './contexts/StateMachineContext'
import Field from './components/Field'
import StatusPanel from './components/StatusPanel'
import LogPanel from './components/LogPanel'
import MissionDisplay from './components/MissionDisplay'
import NotificationSystem from './components/NotificationSystem'
import ControlPanel from './components/ControlPanel'
import KeyboardHelp from './components/KeyboardHelp'
import TestPanel from './components/TestPanel'
import StateMachinePanel from './components/StateMachinePanel'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

function AppContent() {
  const { sendSignal, getMainState } = useStateMachine()
  const mainState = getMainState()

  // Define keyboard shortcuts
  const shortcuts = useCallback([
    {
      key: '1',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => mainState === 'Off' && sendSignal('Start SOI')
    },
    {
      key: '2',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => mainState === 'Undeployed' && sendSignal('FlightPlan')
    },
    {
      key: '3',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => mainState === 'Undeployed' && sendSignal('Ready for mission')
    },
    {
      key: '4',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => mainState === 'Undeployed' && sendSignal('Start Sheep Guard Mission')
    },
    {
      key: '5',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => mainState === 'Deployed' && sendSignal('Start Patrolling')
    },
    {
      key: '6',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => mainState === 'Deployed' && sendSignal('Predator Detected inside tracking perimeter')
    },
    {
      key: 'r',
      ctrl: false,
      shift: false,
      alt: false,
      action: () => {
        if (window.confirm('Reset mission?')) {
          window.location.reload()
        }
      }
    }
  ], [mainState, sendSignal])

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛡️ Pasture Sentinel</h1>
        <p>Drone Shepherd System</p>
      </header>
      
      <div className="app-container">
        <div className="left-panel">
          <MissionDisplay />
          <StatusPanel />
          <StateMachinePanel />
          <ControlPanel />
        </div>
        
        <div className="main-content">
          <Field />
        </div>
        
        <div className="right-panel">
          <LogPanel />
        </div>
      </div>
      
      <NotificationSystem />
      <KeyboardHelp />
      <TestPanel />
    </div>
  )
}

function App() {
  return (
    <StateMachineProvider>
      <AppContent />
    </StateMachineProvider>
  )
}

export default App

