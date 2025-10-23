/**
 * Actor Lifecycle Test
 * Test to understand when and why actor gets stopped
 */

import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine.js'

console.log('\n========================================')
console.log('🔬 ACTOR LIFECYCLE TEST')
console.log('========================================\n')

// Simulate React's useEffect behavior
let subscriptionCount = 0
let unsubscribeCount = 0
let actorStopped = false

const simulateReactUseEffect = (actor) => {
  console.log(`\n--- Simulating useEffect Run #${subscriptionCount + 1} ---`)
  
  const subscription = actor.subscribe((snapshot) => {
    console.log('📡 Subscription callback:', JSON.stringify(snapshot.value))
  })
  
  subscriptionCount++
  
  return () => {
    console.log('🧹 Cleanup function called')
    unsubscribeCount++
    subscription.unsubscribe()
    // Don't stop actor here for now
  }
}

// Create actor
const actor = createActor(pastureSentinelMachine)
actor.start()

console.log('Initial actor status:', actor.getSnapshot().status)
console.log('Can send Start SOI?', actor.getSnapshot().can({ type: 'Start SOI' }))

// Simulate multiple useEffect runs (like when state changes)
console.log('\n--- Simulating useEffect runs ---')
const cleanup1 = simulateReactUseEffect(actor)
const cleanup2 = simulateReactUseEffect(actor)
const cleanup3 = simulateReactUseEffect(actor)

console.log(`\nSubscription count: ${subscriptionCount}`)
console.log(`Unsubscribe count: ${unsubscribeCount}`)

// Try to send event
console.log('\n--- Attempting to send event ---')
try {
  actor.send({ type: 'Start SOI' })
  console.log('✅ Event sent successfully')
  console.log('New state:', JSON.stringify(actor.getSnapshot().value))
} catch (error) {
  console.log('❌ Error:', error.message)
}

// Check actor status
console.log('\n--- Actor Status ---')
console.log('Actor status:', actor.getSnapshot().status)
console.log('Can send FlightPlan?', actor.getSnapshot().can({ type: 'FlightPlan' }))

actor.stop()
console.log('\n========================================\n')

