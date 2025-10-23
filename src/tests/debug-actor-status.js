/**
 * Debug Actor Status
 * Check why actor is getting stopped/finalized
 */

import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine.js'

console.log('\n========================================')
console.log('🔍 DEBUG ACTOR STATUS')
console.log('========================================\n')

// Create actor and start it
const actor = createActor(pastureSentinelMachine)
actor.start()

console.log('1️⃣ Initial state:', JSON.stringify(actor.getSnapshot().value))
console.log('   Actor status:', actor.getSnapshot().status)
console.log('   Can receive events:', actor.getSnapshot().can({ type: 'Start SOI' }))

// Send Start SOI
console.log('\n2️⃣ Sending Start SOI...')
actor.send({ type: 'Start SOI' })

console.log('3️⃣ After Start SOI:', JSON.stringify(actor.getSnapshot().value))
console.log('   Actor status:', actor.getSnapshot().status)
console.log('   Can receive FlightPlan:', actor.getSnapshot().can({ type: 'FlightPlan' }))

// Send FlightPlan
console.log('\n4️⃣ Sending FlightPlan...')
actor.send({ type: 'FlightPlan' })

console.log('5️⃣ After FlightPlan:', JSON.stringify(actor.getSnapshot().value))
console.log('   Actor status:', actor.getSnapshot().status)
console.log('   Can receive Ready for mission:', actor.getSnapshot().can({ type: 'Ready for mission' }))

// Check all possible events
console.log('\n6️⃣ Checking all possible events from current state...')
const allEvents = [
  'Start SOI', 'FlightPlan', 'FlightPlan Check Failed',
  'Ready for mission', 'Start Sheep Guard Mission',
  'Start Patrolling', 'Predator Detected inside tracking perimeter',
  'Predator Entering Safe Area', 'Crashed Detected'
]

allEvents.forEach(event => {
  const canReceive = actor.getSnapshot().can({ type: event })
  console.log(`   Can "${event}"? ${canReceive}`)
})

actor.stop()
console.log('\n7️⃣ Actor stopped manually')
console.log('   Final state:', JSON.stringify(actor.getSnapshot().value))
console.log('   Final status:', actor.getSnapshot().status)

console.log('\n========================================\n')

