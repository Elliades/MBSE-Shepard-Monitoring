/**
 * Diagnostic Test - Find the exact bug
 */

console.log('\n========================================')
console.log('🔬 DIAGNOSTIC TEST')
console.log('========================================\n')

// Simulate the exact flow
const simulateFlow = () => {
  console.log('1️⃣ Initial state:', { Undeployed: 'Off' })
  
  // Simulate what happens when we send signal
  console.log('\n2️⃣ Sending signal: Start SOI')
  
  // Simulate actor transition
  console.log('3️⃣ Actor transitions to:', { Undeployed: 'Unconfigured' })
  
  // Simulate subscription callback
  console.log('4️⃣ Subscription fires with new state')
  
  // Simulate React setState
  console.log('5️⃣ setState called with new state')
  
  // Check if component re-renders
  console.log('6️⃣ Component should re-render...')
  
  // Check what getSubstates sees
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
  
  const initial = getSubstates({ Undeployed: 'Off' })
  const after = getSubstates({ Undeployed: 'Unconfigured' })
  
  console.log('\n7️⃣ getSubstates results:')
  console.log('   Initial:', initial)
  console.log('   After:', after)
  
  if (after.includes('Unconfigured') && !after.includes('Off')) {
    console.log('✅ Logic is correct')
  } else {
    console.log('❌ Logic is broken')
  }
}

simulateFlow()

console.log('\n========================================\n')

