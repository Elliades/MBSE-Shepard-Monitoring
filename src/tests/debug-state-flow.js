/**
 * Debug State Flow Test
 * Simulates the complete flow from signal to UI update
 */

console.log('\n========================================')
console.log('🔍 DEBUG STATE FLOW TEST')
console.log('========================================\n')

// Simulate state update flow
let state = { value: { Undeployed: 'Off' } }

console.log('1️⃣ Initial State:', JSON.stringify(state.value))

// Simulate StatusPanel useEffect
let renderCount = 0
const forceUpdate = () => {
  renderCount++
  console.log(`📊 Render #${renderCount}`)
}

// Simulate signal send
console.log('\n2️⃣ Sending signal: Start SOI')

// Simulate state machine update
state = { value: { Undeployed: 'Unconfigured' } }
console.log('3️⃣ State updated:', JSON.stringify(state.value))

// Simulate useEffect detecting change
console.log('4️⃣ useEffect should trigger...')
if (state.value.Undeployed === 'Unconfigured') {
  console.log('   ✅ State changed detected')
  forceUpdate()
} else {
  console.log('   ❌ State change NOT detected')
}

// Check what StatusPanel sees
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

const substates = getSubstates(state.value)
console.log('\n5️⃣ StatusPanel sees substates:', substates)

const getAllActiveStates = (mainState, substates) => {
  const activeStates = []
  if (mainState) activeStates.push(mainState)
  if (substates && substates.length > 0) activeStates.push(...substates)
  return activeStates
}

const activeStates = getAllActiveStates('Undeployed', substates)
console.log('6️⃣ Active states:', activeStates)

const allTransitions = [
  { from: 'Off', signal: 'Start SOI', to: 'Unconfigured' },
  { from: 'Unconfigured', signal: 'FlightPlan', to: 'Configured' },
]

const availableTransitions = allTransitions.filter(t => 
  activeStates.some(s => s === t.from || s.includes(t.from) || t.from.includes(s))
)

console.log('7️⃣ Available transitions:', availableTransitions.map(t => t.signal))

if (availableTransitions.some(t => t.signal === 'FlightPlan') && 
    !availableTransitions.some(t => t.signal === 'Start SOI')) {
  console.log('\n✅ SUCCESS: Transition list updated correctly')
} else {
  console.log('\n❌ FAILURE: Transition list NOT updated')
}

console.log('\n========================================\n')

