import React from 'react'
import './SafeZone.css'

const SafeZone = ({ mainState, substates }) => {
  // Determine danger level based on substates
  const isPredatorTracking = substates.includes('Predator tracking')
  const isPredatorCounteracting = substates.includes('Predator counteraction')
  
  let dangerLevel = 'safe' // green (default)
  if (isPredatorCounteracting) {
    dangerLevel = 'danger' // red - predator in safe zone
  } else if (isPredatorTracking) {
    dangerLevel = 'warning' // orange - predator in tracking perimeter
  }

  return (
    <>
      {/* Tracking perimeter - shown when predator is detected */}
      {isPredatorTracking && (
        <div className="tracking-perimeter">
          <div className="tracking-perimeter-border"></div>
          <div className="tracking-perimeter-label">TRACKING PERIMETER</div>
        </div>
      )}
      
      {/* Safe zone */}
      <div className={`safe-zone ${dangerLevel}`}>
        <div className="safe-zone-border"></div>
        <div className="safe-zone-label">
          {dangerLevel === 'danger' && '🚨 '}
          SAFE ZONE
          {dangerLevel === 'danger' && ' 🚨'}
        </div>
      </div>
    </>
  )
}

export default SafeZone

