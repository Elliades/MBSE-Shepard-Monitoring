import React, { useState } from 'react'
import { runAllTests } from './stateMachine.test'
import './TestRunner.css'

const TestRunner = () => {
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRunTests = () => {
    setIsRunning(true)
    setTestResults(null)
    
    // Run tests after a small delay to show loading state
    setTimeout(() => {
      const results = runAllTests()
      setTestResults(results)
      setIsRunning(false)
    }, 100)
  }

  return (
    <div className="test-runner">
      <div className="test-runner-header">
        <h2>🧪 State Machine Test Runner</h2>
        <button 
          className="run-tests-button"
          onClick={handleRunTests}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Running Tests...' : '▶️ Run All Tests'}
        </button>
      </div>

      {testResults && (
        <div className="test-results">
          <div className="result-summary">
            <div className={`result-box ${testResults.failed === 0 ? 'success' : 'warning'}`}>
              <div className="result-label">Passed</div>
              <div className="result-value">{testResults.passed}</div>
            </div>
            <div className={`result-box ${testResults.failed > 0 ? 'error' : 'success'}`}>
              <div className="result-label">Failed</div>
              <div className="result-value">{testResults.failed}</div>
            </div>
            <div className="result-box">
              <div className="result-label">Total</div>
              <div className="result-value">{testResults.total}</div>
            </div>
            <div className="result-box">
              <div className="result-label">Success Rate</div>
              <div className="result-value">
                {((testResults.passed / testResults.total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="console-message">
            📋 Check browser console for detailed test results
          </div>
        </div>
      )}

      <div className="test-instructions">
        <h3>📖 How to Use</h3>
        <ol>
          <li>Click "Run All Tests" to execute state machine tests</li>
          <li>Open browser console (F12) to see detailed results</li>
          <li>Each test verifies a specific state transition</li>
          <li>Green ✅ = Pass, Red ❌ = Fail</li>
        </ol>
      </div>
    </div>
  )
}

export default TestRunner

