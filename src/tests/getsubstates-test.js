/**
 * Test getSubstates extraction logic
 */

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
console.log('🧪 GETSUBSTATES EXTRACTION TEST')
console.log('========================================\n')

// Test cases
const testCases = [
  { value: { Undeployed: 'Off' }, expected: ['Off'] },
  { value: { Undeployed: 'Unconfigured' }, expected: ['Unconfigured'] },
  { value: { Undeployed: 'Configured' }, expected: ['Configured'] },
  { value: { Undeployed: 'Ready for Mission' }, expected: ['Ready for Mission'] },
  { value: { Deployed: { Main: 'Going to Safe Area', Monitoring: 'Mission Monitoring' } }, 
    expected: ['Going to Safe Area', 'Mission Monitoring'] },
]

testCases.forEach((testCase, idx) => {
  const result = getSubstates(testCase.value)
  const passed = JSON.stringify(result) === JSON.stringify(testCase.expected)
  
  console.log(`Test ${idx + 1}: ${passed ? '✅' : '❌'}`)
  console.log(`  Input: ${JSON.stringify(testCase.value)}`)
  console.log(`  Expected: ${JSON.stringify(testCase.expected)}`)
  console.log(`  Got: ${JSON.stringify(result)}`)
  console.log()
})

console.log('========================================\n')

