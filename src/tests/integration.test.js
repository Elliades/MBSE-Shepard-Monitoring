/**
 * Integration Tests for Signal Processing Chain
 * Tests the complete flow from button click to UI update
 */

import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine.js'

// Test helper to trace state changes
let stateChangeLog = []

const createTestActor = () => {
  stateChangeLog = []
  const actor = createActor(pastureSentinelMachine)
  
  // Log all state changes
  actor.subscribe((snapshot) => {
    stateChangeLog.push({
      value: snapshot.value,
      canTransitions: snapshot.can({ type: 'Start SOI' }),
      timestamp: Date.now()
    })
  })
  
  return actor
}

// Test 1: Initial State
console.log('\n=== TEST 1: Initial State ===')
try {
  const actor = createTestActor()
  actor.start()
  
  const snapshot = actor.getSnapshot()
  console.log('Initial state:', JSON.stringify(snapshot.value))
  console.log('Can receive "Start SOI"?', snapshot.can({ type: 'Start SOI' }))
  
  if (JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Off' })) {
    console.log('✅ PASS: Initial state is correct')
  } else {
    console.log('❌ FAIL: Wrong initial state')
  }
  
  actor.stop()
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

// Test 2: Button Click → Signal Sent → State Machine Transition
console.log('\n=== TEST 2: Signal Processing Chain ===')
try {
  const actor = createTestActor()
  actor.start()
  
  const initialState = actor.getSnapshot()
  console.log('Before signal:', JSON.stringify(initialState.value))
  
  // Simulate button click sending signal
  actor.send({ type: 'Start SOI' })
  
  // Wait a tick for state to update
  const afterState = actor.getSnapshot()
  console.log('After signal:', JSON.stringify(afterState.value))
  console.log('State changes logged:', stateChangeLog.length)
  
  if (JSON.stringify(afterState.value) === JSON.stringify({ Undeployed: 'Unconfigured' })) {
    console.log('✅ PASS: State machine transitioned correctly')
  } else {
    console.log('❌ FAIL: State did not transition')
    console.log('Expected: { Undeployed: "Unconfigured" }')
    console.log('Got:', afterState.value)
  }
  
  actor.stop()
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

// Test 3: State Value Extraction (simulate getMainState/getSubstates)
console.log('\n=== TEST 3: State Extraction Logic ===')
try {
  const actor = createTestActor()
  actor.start()
  actor.send({ type: 'Start SOI' })
  
  const snapshot = actor.getSnapshot()
  const stateValue = snapshot.value
  
  // Simulate getMainState
  const getMainState = () => {
    if (typeof stateValue === 'string') {
      return stateValue
    }
    return Object.keys(stateValue)[0]
  }
  
  // Simulate getSubstates
  const getSubstates = () => {
    const substates = []
    const extractSubstates = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          substates.push(value)
        } else if (typeof value === 'object') {
          extractSubstates(value)
        }
      }
    }
    
    if (typeof stateValue === 'object') {
      extractSubstates(stateValue)
    }
    
    return substates
  }
  
  const mainState = getMainState()
  const substates = getSubstates()
  
  console.log('Main state:', mainState)
  console.log('Substates:', substates)
  
  if (mainState === 'Undeployed' && substates.includes('Unconfigured')) {
    console.log('✅ PASS: State extraction works correctly')
  } else {
    console.log('❌ FAIL: State extraction failed')
    console.log('Expected mainState: Undeployed, got:', mainState)
    console.log('Expected substates to include: Unconfigured, got:', substates)
  }
  
  actor.stop()
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

// Test 4: Transition Availability Check
console.log('\n=== TEST 4: Transition Availability ===')
try {
  const actor = createTestActor()
  actor.start()
  
  // Check initial state
  const initialState = actor.getSnapshot()
  console.log('Initial can("Start SOI"):', initialState.can({ type: 'Start SOI' }))
  
  // Send signal
  actor.send({ type: 'Start SOI' })
  
  // Check after signal
  const afterState = actor.getSnapshot()
  console.log('After can("Start SOI"):', afterState.can({ type: 'Start SOI' }))
  console.log('Can("FlightPlan"):', afterState.can({ type: 'FlightPlan' }))
  
  if (initialState.can({ type: 'Start SOI' }) && !afterState.can({ type: 'Start SOI' })) {
    console.log('✅ PASS: Transition availability updated correctly')
  } else {
    console.log('❌ FAIL: Transition availability not updated')
  }
  
  actor.stop()
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

console.log('\n=== SUMMARY ===')
console.log('Integration tests completed')

