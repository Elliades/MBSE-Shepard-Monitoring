import React from 'react'
import './Predator.css'

const Predator = ({ mainState, substates }) => {
  const isPredatorDetected = substates.includes('Predator tracking') || substates.includes('Predator counteraction')
  const isApproaching = substates.includes('Predator counteraction')

  let containerClass = 'predator-container'
  if (isPredatorDetected) {
    containerClass += ' visible'
    if (isApproaching) {
      containerClass += ' approaching'
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
    </div>
  )
}

export default Predator

