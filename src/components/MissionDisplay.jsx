import React from 'react'
import './MissionDisplay.css'

const MissionDisplay = () => {
  return (
    <div className="mission-display">
      <div className="panel-header">
        <h3>🎯 Mission</h3>
      </div>
      <div className="panel-content">
        <div className="mission-title">Pasture Sentinel</div>
        <div className="mission-description">
          Protect the flock by monitoring the perimeter and responding to predator threats.
        </div>
        <div className="mission-objectives">
          <div className="objective">
            <span className="objective-icon">✓</span>
            <span>Deploy to safe area</span>
          </div>
          <div className="objective pending">
            <span className="objective-icon">○</span>
            <span>Begin patrolling</span>
          </div>
          <div className="objective pending">
            <span className="objective-icon">○</span>
            <span>Monitor sheep</span>
          </div>
          <div className="objective pending">
            <span className="objective-icon">○</span>
            <span>Detect predators</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MissionDisplay

