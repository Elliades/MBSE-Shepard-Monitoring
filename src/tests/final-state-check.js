/**
 * Check if state machine can reach final states
 */

import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine.js'

console.log('\n========================================')
console.log('🔍 FINAL STATE CHECK')
console.log('========================================\n')

// Create actor and start it
const actor = createActor(pastureSentinelMachine)
actor.start()

console.log('1️⃣ Initial state:', JSON.stringify(actor.getSnapshot().value))
console.log('   Actor status:', actor.getSnapshot().status)
console.log('   Is final state?', actor.getSnapshot().status === 'done')

// Check all possible events
const allEvents = [
  'Start SOI', 'FlightPlan', 'FlightPlan Check Failed',
  'Ready for mission', 'Start Sheep Guard Mission',
  'Start Patrolling', 'Predator Detected inside tracking perimeter',
  'Predator Entering Safe Area', 'Crashed Detected'
]

console.log('\n2️⃣ Checking all possible events...')
allEvents.forEach(event => {
  const canReceive = actor.getSnapshot().can({ type: event })
  console.log(`   Can "${event}"? ${canReceive}`)
})

console.log('\n3️⃣ Checking state machine definition...')
console.log('   States:', Object.keys(pastureSentinelMachine.states))
console.log('   Final states:', Object.entries(pastureSentinelMachine.states)
  .filter(([name, config]) => config.type === 'final')
  .map(([name]) => name))

// Check if Crashed is reachable
console.log('\n4️⃣ Checking if Crashed is reachable...')
console.log('   Can reach Crashed?', actor.getSnapshot().can({ type: 'Crashed Detected' }))

// Try to reach Crashed
console.log('\n5️⃣ Attempting to reach Crashed state...')
actor.send({ type: 'Start SOI' })
actor.send({ type: 'FlightPlan' })
actor.send({ type: 'Ready for mission' })
actor.send({ type: 'Start Sheep Guard Mission' })

console.log('   After deployment:', JSON.stringify(actor.getSnapshot().value))
console.log('   Can reach Crashed now?', actor.getSnapshot().can({ type: 'Crashed Detected' }))

// Send Crashed Detected
console.log('\n6️⃣ Sending Crashed Detected...')
actor.send({ type: 'Crashed Detected' })

console.log('7️⃣ After Crashed Detected:', JSON.stringify(actor.getSnapshot().value))
console.log('   Actor status:', actor.getSnapshot().status)
console.log('   Is final state?', actor.getSnapshot().status === 'done')

actor.stop()
console.log('\n========================================\n')

