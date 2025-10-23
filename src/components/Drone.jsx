import React, { useState, useEffect } from 'react'
import './Drone.css'

const Drone = ({ mainState, substates }) => {
  const [animationTrigger, setAnimationTrigger] = useState(0)
  const [sheepInCircle, setSheepInCircle] = useState(false)
  
  // Debug: Log when Drone receives new props
  useEffect(() => {
    console.log('🚁 Drone: Props updated', { mainState, substates })
  }, [mainState, substates])
  
  const isDeployed = mainState === 'Deployed'
  const isPatrolling = substates.includes('Patrolling')
  const isPerimeterWatch = substates.includes('Perimeter watch')
  const isGoingToSafeArea = substates.includes('Going to Safe Area')
  const isPredatorTracking = substates.includes('Predator tracking')
  const isPredatorCounteracting = substates.includes('Predator counteraction')
  const isTracking = isPredatorTracking || isPredatorCounteracting
  const isCrashed = mainState === 'Crashed'
  const isUnconfigured = substates.includes('Unconfigured')
  const isConfigured = substates.includes('Configured')
  const isReadyForMission = substates.includes('Ready for Mission')
  
  // Determine drone state class
  let stateClass = ''
  if (isCrashed) {
    stateClass = 'crashed'
  } else if (isGoingToSafeArea) {
    stateClass = 'flying-to-safe-area'
  } else if (isPredatorCounteracting) {
    stateClass = 'counteracting'
  } else if (isPredatorTracking) {
    stateClass = 'tracking-predator'
  } else if (isPerimeterWatch) {
    stateClass = 'patrolling-perimeter'
  }

  // Choose drone image based on state
  let droneImage = '/svg/Drone-without-circle.svg'
  
  if (isReadyForMission || isGoingToSafeArea) {
    droneImage = '/svg/Drone-with-circle.svg'
  } else if (isPerimeterWatch) {
    droneImage = sheepInCircle ? '/svg/DroneSheppard-with-circle green.svg' : '/svg/DroneSheppard-with-circle.svg'
  } else if (isTracking) {
    droneImage = '/svg/DroneSheppard-with-circle.svg'
  } else if (isPatrolling && !isPerimeterWatch) {
    droneImage = '/svg/Drone-with-circle-green.svg'
  }

  // Trigger quick animation on state changes
  useEffect(() => {
    if (isUnconfigured || isConfigured) {
      setAnimationTrigger(prev => prev + 1)
    }
  }, [isUnconfigured, isConfigured, mainState])

  // Check for sheep collision (simplified - would need actual collision detection)
  useEffect(() => {
    // This is a placeholder - real implementation would check sheep positions
    // For now, we'll simulate it based on patrol state
    if (isPerimeterWatch) {
      // Randomly simulate sheep entering drone circle for demo
      const interval = setInterval(() => {
        setSheepInCircle(Math.random() > 0.7)
      }, 3000)
      return () => clearInterval(interval)
    } else {
      setSheepInCircle(false)
    }
  }, [isPerimeterWatch])

  // Format substates for display
  const stateDisplay = substates.length > 0 
    ? `${mainState} → ${substates.join(' → ')}` 
    : mainState

  return (
    <div className={`drone-container ${stateClass} ${!isDeployed && mainState !== 'Crashed' ? 'at-base' : ''} ${animationTrigger > 0 ? 'quick-animate' : ''}`}
         data-animation-key={animationTrigger}>
      <div className="drone-wrapper">
        <img 
          src={droneImage}
          alt="Drone" 
          className="drone-image"
          onError={(e) => {
            // Fallback if SVG doesn't load
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <div className="drone-fallback">
          <div className="drone-icon">🚁</div>
        </div>
        {isDeployed && <div className="drone-shadow"></div>}
      </div>
      <div className="drone-state-label">{stateDisplay}</div>
      
      {/* Counteraction effects when chasing predator */}
      {isPredatorCounteracting && (
        <div className="drone-counteraction-effects">
          <div className="drone-flashlight-beam"></div>
          <div className="drone-sound-wave wave-1">〰️</div>
          <div className="drone-sound-wave wave-2">〰️</div>
          <div className="drone-sound-wave wave-3">〰️</div>
        </div>
      )}
    </div>
  )
}

export default Drone

