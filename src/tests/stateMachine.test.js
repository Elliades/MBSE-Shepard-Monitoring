import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine.js'

/**
 * Functional tests for Pasture Sentinel State Machine
 * These tests verify that all state transitions work correctly
 */

// Test helper to create a new machine instance
const createTestActor = () => {
  return createActor(pastureSentinelMachine)
}

// Test helper to log state
const logState = (actor, label) => {
  const snapshot = actor.getSnapshot()
  console.log(`\n[${label}]`)
  console.log('  State value:', JSON.stringify(snapshot.value, null, 2))
  console.log('  Can transition:', snapshot.can)
  return snapshot
}

// Run all tests
export const runAllTests = () => {
  console.log('\n========================================')
  console.log('🧪 RUNNING STATE MACHINE TESTS')
  console.log('========================================\n')

  let passedTests = 0
  let failedTests = 0

  // TEST 1: Initial State
  console.log('\n--- TEST 1: Initial State ---')
  try {
    const actor = createTestActor()
    actor.start()
    const snapshot = logState(actor, 'Initial')
    
    if (JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Off' })) {
      console.log('✅ PASS: Initial state is Undeployed → Off')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected {Undeployed: "Off"}, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 1 error:', error)
    failedTests++
  }

  // TEST 2: Start SOI Transition
  console.log('\n--- TEST 2: Start SOI Transition ---')
  try {
    const actor = createTestActor()
    actor.start()
    logState(actor, 'Before Start SOI')
    
    // Check if transition is possible
    const canTransition = actor.getSnapshot().can({ type: 'Start SOI' })
    console.log('  Can send "Start SOI"?', canTransition)
    
    actor.send({ type: 'Start SOI' })
    const snapshot = logState(actor, 'After Start SOI')
    
    if (JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Unconfigured' })) {
      console.log('✅ PASS: Transitioned to Undeployed → Unconfigured')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected {Undeployed: "Unconfigured"}, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 2 error:', error)
    failedTests++
  }

  // TEST 3: Flight Plan Transition
  console.log('\n--- TEST 3: Flight Plan Transition ---')
  try {
    const actor = createTestActor()
    actor.start()
    actor.send({ type: 'Start SOI' })
    actor.send({ type: 'FlightPlan' })
    const snapshot = logState(actor, 'After FlightPlan')
    
    if (JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Configured' })) {
      console.log('✅ PASS: Transitioned to Undeployed → Configured')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected {Undeployed: "Configured"}, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 3 error:', error)
    failedTests++
  }

  // TEST 4: Ready for Mission
  console.log('\n--- TEST 4: Ready for Mission ---')
  try {
    const actor = createTestActor()
    actor.start()
    actor.send({ type: 'Start SOI' })
    actor.send({ type: 'FlightPlan' })
    actor.send({ type: 'Ready for mission' })
    const snapshot = logState(actor, 'After Ready for mission')
    
    if (JSON.stringify(snapshot.value) === JSON.stringify({ Undeployed: 'Ready for Mission' })) {
      console.log('✅ PASS: Transitioned to Undeployed → Ready for Mission')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected {Undeployed: "Ready for Mission"}, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 4 error:', error)
    failedTests++
  }

  // TEST 5: Start Mission (Deploy)
  console.log('\n--- TEST 5: Start Mission (Deploy) ---')
  try {
    const actor = createTestActor()
    actor.start()
    actor.send({ type: 'Start SOI' })
    actor.send({ type: 'FlightPlan' })
    actor.send({ type: 'Ready for mission' })
    actor.send({ type: 'Start Sheep Guard Mission' })
    const snapshot = logState(actor, 'After Start Sheep Guard Mission')
    
    if (snapshot.value.Deployed) {
      console.log('✅ PASS: Transitioned to Deployed state')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected Deployed state, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 5 error:', error)
    failedTests++
  }

  // TEST 6: Start Patrolling
  console.log('\n--- TEST 6: Start Patrolling ---')
  try {
    const actor = createTestActor()
    actor.start()
    actor.send({ type: 'Start SOI' })
    actor.send({ type: 'FlightPlan' })
    actor.send({ type: 'Ready for mission' })
    actor.send({ type: 'Start Sheep Guard Mission' })
    actor.send({ type: 'Start Patrolling' })
    const snapshot = logState(actor, 'After Start Patrolling')
    
    // Patrolling has parallel regions, so Main.Patrolling is an object
    if (snapshot.value.Deployed && 
        snapshot.value.Deployed.Main && 
        snapshot.value.Deployed.Main.Patrolling &&
        snapshot.value.Deployed.Main.Patrolling.Perimeter === 'Perimeter watch') {
      console.log('✅ PASS: Transitioned to Patrolling state with parallel regions')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected Patrolling state with parallel regions, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 6 error:', error)
    failedTests++
  }

  // TEST 7: Predator Detection
  console.log('\n--- TEST 7: Predator Detection ---')
  try {
    const actor = createTestActor()
    actor.start()
    actor.send({ type: 'Start SOI' })
    actor.send({ type: 'FlightPlan' })
    actor.send({ type: 'Ready for mission' })
    actor.send({ type: 'Start Sheep Guard Mission' })
    actor.send({ type: 'Start Patrolling' })
    actor.send({ type: 'Predator Detected inside tracking perimeter' })
    const snapshot = logState(actor, 'After Predator Detected')
    
    if (snapshot.value.Deployed && snapshot.value.Deployed.Main && 
        typeof snapshot.value.Deployed.Main === 'object' && 
        snapshot.value.Deployed.Main['Predator Detected']) {
      console.log('✅ PASS: Transitioned to Predator Detected state')
      passedTests++
    } else {
      console.error('❌ FAIL: Expected Predator Detected state, got:', snapshot.value)
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 7 error:', error)
    failedTests++
  }

  // TEST 8: Invalid Transition
  console.log('\n--- TEST 8: Invalid Transition (Should Not Change) ---')
  try {
    const actor = createTestActor()
    actor.start()
    const beforeSnapshot = actor.getSnapshot()
    actor.send({ type: 'Invalid Signal' })
    const afterSnapshot = actor.getSnapshot()
    
    if (JSON.stringify(beforeSnapshot.value) === JSON.stringify(afterSnapshot.value)) {
      console.log('✅ PASS: State unchanged on invalid signal')
      passedTests++
    } else {
      console.error('❌ FAIL: State changed on invalid signal')
      failedTests++
    }
    actor.stop()
  } catch (error) {
    console.error('❌ FAIL: Test 8 error:', error)
    failedTests++
  }

  // SUMMARY
  console.log('\n========================================')
  console.log('📊 TEST SUMMARY')
  console.log('========================================')
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📈 Total: ${passedTests + failedTests}`)
  console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`)
  console.log('========================================\n')

  return {
    passed: passedTests,
    failed: failedTests,
    total: passedTests + failedTests
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('⚠️ To run tests, open browser console and call: runAllTests()')
} else {
  // Run tests in Node.js
  runAllTests()
}

