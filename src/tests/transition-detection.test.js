/**
 * Transition Detection Test
 * Verifies that transition matching logic works correctly
 */

const testTransitionDetection = () => {
  console.log('\n========================================')
  console.log('🧪 TRANSITION DETECTION TEST')
  console.log('========================================\n')

  // Simulate getAllActiveStates from StatusPanel
  const getAllActiveStates = (mainState, substates) => {
    const activeStates = []
    if (mainState) {
      activeStates.push(mainState)
    }
    if (substates && substates.length > 0) {
      activeStates.push(...substates)
    }
    return activeStates
  }

  // Transition definitions from StatusPanel
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

  // Test case 1: Initial state (Undeployed + Off)
  console.log('=== TEST 1: Initial State ===')
  const initialStates = getAllActiveStates('Undeployed', ['Off'])
  console.log('Active states:', initialStates)
  
  const initialTransitions = allTransitions.filter(t => 
    initialStates.some(s => s === t.from || s.includes(t.from) || t.from.includes(s))
  )
  console.log('Available transitions:', initialTransitions.map(t => t.signal))
  
  if (initialTransitions.some(t => t.signal === 'Start SOI')) {
    console.log('✅ PASS: "Start SOI" is available')
  } else {
    console.log('❌ FAIL: "Start SOI" not found')
  }

  // Test case 2: After Start SOI (Undeployed + Unconfigured)
  console.log('\n=== TEST 2: After Start SOI ===')
  const afterStates = getAllActiveStates('Undeployed', ['Unconfigured'])
  console.log('Active states:', afterStates)
  
  const afterTransitions = allTransitions.filter(t => 
    afterStates.some(s => s === t.from || s.includes(t.from) || t.from.includes(s))
  )
  console.log('Available transitions:', afterTransitions.map(t => t.signal))
  
  if (afterTransitions.some(t => t.signal === 'FlightPlan') && 
      !afterTransitions.some(t => t.signal === 'Start SOI')) {
    console.log('✅ PASS: "FlightPlan" available, "Start SOI" removed')
  } else {
    console.log('❌ FAIL: Transitions not updated correctly')
  }

  // Test case 3: String matching logic
  console.log('\n=== TEST 3: String Matching Logic ===')
  const testCases = [
    { active: 'Off', transition: 'Off', expected: true },
    { active: 'Unconfigured', transition: 'Unconfigured', expected: true },
    { active: 'Undeployed', transition: 'Off', expected: false },
    { active: 'Off', transition: 'Undeployed', expected: false },
  ]

  testCases.forEach(({ active, transition, expected }) => {
    const matches = active === transition || active.includes(transition) || transition.includes(active)
    const result = matches === expected ? '✅' : '❌'
    console.log(`${result} "${active}" matches "${transition}": ${matches} (expected: ${expected})`)
  })

  console.log('\n========================================')
  console.log('✅ Transition Detection Tests Complete')
  console.log('========================================\n')
}

testTransitionDetection()

