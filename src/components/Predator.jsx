import React from 'react'
import './Predator.css'

const Predator = ({ mainState, substates }) => {
  const isPredatorTracking = substates.includes('Predator tracking')
  const isPredatorCounteracting = substates.includes('Predator counteraction')
  const isPredatorDetected = isPredatorTracking || isPredatorCounteracting

  let containerClass = 'predator-container'
  if (isPredatorDetected) {
    containerClass += ' visible'
    if (isPredatorCounteracting) {
      containerClass += ' in-safe-zone'
    } else if (isPredatorTracking) {
      containerClass += ' in-tracking-zone'
    }
  } else {
    containerClass += ' hidden'
  }

  return (
    <div className={containerClass}>
      <div className="predator">
        <img 
          src="/svg/bear.svg" 
          alt="Predator" 
          className="predator-image"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <div className="predator-fallback">🐻</div>
        {isPredatorDetected && <div className="predator-warning">⚠️</div>}
      </div>
      
      {/* Drone counteraction - flashlight and sound waves */}
      {isPredatorCounteracting && (
        <div className="counteraction-effects">
          <div className="flashlight-beam"></div>
          <div className="sound-wave wave-1">〰️</div>
          <div className="sound-wave wave-2">〰️</div>
          <div className="sound-wave wave-3">〰️</div>
        </div>
      )}
    </div>
  )
}

export default Predator

