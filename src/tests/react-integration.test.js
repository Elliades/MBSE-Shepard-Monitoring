/**
 * React Integration Test
 * Tests state propagation through React Context to UI components
 */

import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine.js'

// Simulate React state updates
class StateUpdater {
  constructor() {
    this.state = null
    this.updateCount = 0
  }

  setState(newState) {
    this.state = newState
    this.updateCount++
  }

  getState() {
    return this.state
  }
}

// Simulate subscription pattern
const simulateReactUpdate = (actor, updater) => {
  const subscription = actor.subscribe((snapshot) => {
    console.log('📡 Subscription fired')
    
    // Create new state object (like in StateMachineContext)
    const newState = {
      value: snapshot.value,
      context: snapshot.context,
      matches: snapshot.matches.bind(snapshot),
      can: snapshot.can.bind(snapshot),
      output: snapshot.output,
      tags: snapshot.tags,
      status: snapshot.status
    }
    
    updater.setState(newState)
  })

  return subscription
}

// Simulate getSubstates (from StateMachineContext)
const getSubstates = (stateValue) => {
  const substates = []
  
  const extractSubstates = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        substates.push(value)
      } else if (typeof value === 'object' && value !== null) {
        extractSubstates(value)
      }
    }
  }
  
  if (typeof stateValue === 'object' && stateValue !== null) {
    extractSubstates(stateValue)
  }
  
  return substates
}

console.log('\n========================================')
console.log('🧪 REACT INTEGRATION TEST')
console.log('========================================\n')

// Test: State propagates to React components
console.log('=== TEST: State Propagation to React ===')

try {
  const actor = createActor(pastureSentinelMachine)
  actor.start()
  
  const updater = new StateUpdater()
  const subscription = simulateReactUpdate(actor, updater)
  
  // Initial state
  console.log('Initial state:', JSON.stringify(updater.getState()?.value))
  const initialSubstates = getSubstates(updater.getState()?.value)
  console.log('Initial substates:', initialSubstates)
  
  // Send signal
  actor.send({ type: 'Start SOI' })
  
  // Wait for subscription to fire
  setTimeout(() => {
    console.log('After signal state:', JSON.stringify(updater.getState()?.value))
    const afterSubstates = getSubstates(updater.getState()?.value)
    console.log('After signal substates:', afterSubstates)
    
    if (afterSubstates.includes('Unconfigured') && !afterSubstates.includes('Off')) {
      console.log('✅ PASS: State propagated correctly to React')
      console.log('   Substates updated from ["Off"] to ["Unconfigured"]')
    } else {
      console.log('❌ FAIL: State did not propagate correctly')
      console.log('   Expected: ["Unconfigured"]')
      console.log('   Got:', afterSubstates)
    }
    
    subscription.unsubscribe()
    actor.stop()
  }, 100)
  
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

// Test: getSubstates correctly extracts nested values
console.log('\n=== TEST: getSubstates Extraction ===')

try {
  const testStates = [
    { Undeployed: 'Off' },
    { Undeployed: 'Unconfigured' },
    { Undeployed: 'Configured' },
    { Deployed: { Main: 'Going to Safe Area', Monitoring: 'Mission Monitoring' } }
  ]
  
  let passed = true
  testStates.forEach((state, idx) => {
    const substates = getSubstates(state)
    console.log(`State ${idx + 1}:`, JSON.stringify(state), '→', substates)
    
    if (idx === 0 && !substates.includes('Off')) passed = false
    if (idx === 1 && !substates.includes('Unconfigured')) passed = false
    if (idx === 2 && !substates.includes('Configured')) passed = false
    if (idx === 3 && !substates.includes('Going to Safe Area')) passed = false
  })
  
  if (passed) {
    console.log('✅ PASS: getSubstates extracts all substates correctly')
  } else {
    console.log('❌ FAIL: getSubstates extraction failed')
  }
  
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

console.log('\n========================================')
console.log('✅ React Integration Tests Complete')
console.log('========================================\n')

