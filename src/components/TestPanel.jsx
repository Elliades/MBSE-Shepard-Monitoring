import React, { useState } from 'react'
import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine'
import './TestPanel.css'

const TestPanel = () => {
  const [isMinimized, setIsMinimized] = useState(true)
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  const runTests = () => {
    setIsRunning(true)
    const results = []
    let passed = 0
    let failed = 0

    const runTest = (name, testFn) => {
      try {
        const result = testFn()
        if (result.success) {
          passed++
          results.push({ name, status: 'pass', message: result.message })
        } else {
          failed++
          results.push({ name, status: 'fail', message: result.message })
        }
      } catch (error) {
        failed++
        results.push({ name, status: 'fail', message: error.message })
      }
    }

    // Test 1: Initial State
    runTest('Initial State', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Off' }),
        message: 'Initial state is Undeployed → Off'
      }
    })

    // Test 2: Start SOI
    runTest('Start SOI Transition', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      actor.send({ type: 'Start SOI' })
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Unconfigured' }),
        message: 'Transitioned to Unconfigured'
      }
    })

    // Test 3: Flight Plan
    runTest('Flight Plan Transition', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      actor.send({ type: 'Start SOI' })
      actor.send({ type: 'FlightPlan' })
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Configured' }),
        message: 'Transitioned to Configured'
      }
    })

    // Test 4: Ready for Mission
    runTest('Ready for Mission', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      actor.send({ type: 'Start SOI' })
      actor.send({ type: 'FlightPlan' })
      actor.send({ type: 'Ready for mission' })
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Ready for Mission' }),
        message: 'Transitioned to Ready for Mission'
      }
    })

    // Test 5: Deploy
    runTest('Start Mission (Deploy)', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      actor.send({ type: 'Start SOI' })
      actor.send({ type: 'FlightPlan' })
      actor.send({ type: 'Ready for mission' })
      actor.send({ type: 'Start Sheep Guard Mission' })
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: !!snapshot.value.Deployed,
        message: 'Transitioned to Deployed'
      }
    })

    // Test 6: Patrolling
    runTest('Start Patrolling', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      actor.send({ type: 'Start SOI' })
      actor.send({ type: 'FlightPlan' })
      actor.send({ type: 'Ready for mission' })
      actor.send({ type: 'Start Sheep Guard Mission' })
      actor.send({ type: 'Start Patrolling' })
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: snapshot.value.Deployed?.Main?.Patrolling?.Perimeter === 'Perimeter watch',
        message: 'Transitioned to Patrolling with parallel regions'
      }
    })

    // Test 7: Predator Detection
    runTest('Predator Detection', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      actor.send({ type: 'Start SOI' })
      actor.send({ type: 'FlightPlan' })
      actor.send({ type: 'Ready for mission' })
      actor.send({ type: 'Start Sheep Guard Mission' })
      actor.send({ type: 'Start Patrolling' })
      actor.send({ type: 'Predator Detected inside tracking perimeter' })
      const snapshot = actor.getSnapshot()
      actor.stop()
      return {
        success: !!snapshot.value.Deployed?.Main?.['Predator Detected'],
        message: 'Transitioned to Predator Detected'
      }
    })

    // Test 8: Invalid Transition
    runTest('Invalid Transition', () => {
      const actor = createActor(pastureSentinelMachine)
      actor.start()
      const before = actor.getSnapshot().value
      actor.send({ type: 'Invalid Signal' })
      const after = actor.getSnapshot().value
      actor.stop()
      return {
        success: JSON.stringify(before) === JSON.stringify(after),
        message: 'State unchanged on invalid signal'
      }
    })

    setTestResults({ results, passed, failed, total: passed + failed })
    setIsRunning(false)
  }

  return (
    <div className={`test-panel ${isMinimized ? 'minimized' : ''}`}>
      <div className="test-panel-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="test-panel-title">
          <span className="test-icon">🧪</span>
          <span>State Machine Tests</span>
          {testResults && (
            <span className="test-badge">
              {testResults.passed}/{testResults.total}
            </span>
          )}
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
        <div className="test-panel-content">
          <div className="test-controls">
            <button 
              className="run-tests-btn"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? '⏳ Running...' : '▶️ Run Tests'}
            </button>
          </div>

          {testResults && (
            <div className="test-results">
              <div className="test-summary">
                <div className={`summary-item ${testResults.passed === testResults.total ? 'success' : 'warning'}`}>
                  <span className="summary-label">Passed:</span>
                  <span className="summary-value">{testResults.passed}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Failed:</span>
                  <span className="summary-value">{testResults.failed}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Success Rate:</span>
                  <span className="summary-value">
                    {((testResults.passed / testResults.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="test-list">
                {testResults.results.map((test, idx) => (
                  <div key={idx} className={`test-item ${test.status}`}>
                    <span className="test-status-icon">
                      {test.status === 'pass' ? '✅' : '❌'}
                    </span>
                    <div className="test-info">
                      <div className="test-name">{test.name}</div>
                      <div className="test-message">{test.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TestPanel

