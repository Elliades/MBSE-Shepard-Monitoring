import React from 'react'
import './BaseStation.css'

const BaseStation = () => {
  return (
    <div className="base-station">
      <img 
        src="/svg/BaseStation.svg" 
        alt="Base Station" 
        className="base-station-image"
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'block'
        }}
      />
      <div className="base-station-fallback">
        <div className="station-icon">🏠</div>
      </div>
      <div className="base-station-label">BASE STATION</div>
    </div>
  )
}

export default BaseStation

