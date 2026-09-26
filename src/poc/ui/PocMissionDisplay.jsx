import React, { useState } from 'react'
import { STEPS } from '../stm/stepNames.js'
import '../../components/MissionDisplay.css'

function objectiveState(step, targetStep) {
  const order = [
    STEPS.Off,
    STEPS.Unconfigured,
    STEPS.Configured,
    STEPS.ReadyForMission,
    STEPS.GoingToSafeArea,
    STEPS.Patrolling,
    STEPS.PredatorTracking,
    STEPS.PredatorCounteraction,
    STEPS.Crashed,
  ]
  const current = order.indexOf(step)
  const target = order.indexOf(targetStep)
  if (current < 0 || target < 0) return 'pending'
  if (current >= target) return 'done'
  return 'pending'
}

export default function PocMissionDisplay({ step, collapsible = true }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const collapsed = collapsible && isCollapsed

  const objectives = [
    { label: 'Deploy to safe area', at: STEPS.GoingToSafeArea },
    { label: 'Begin patrolling', at: STEPS.Patrolling },
    { label: 'Monitor sheep', at: STEPS.Patrolling },
    { label: 'Detect predators', at: STEPS.PredatorTracking },
  ]

  return (
    <div className="mission-display">
      {collapsible && (
        <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
          <h3>Mission</h3>
          <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
        </div>
      )}
      <div className={`panel-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="mission-title">Pasture Sentinel</div>
        <div className="mission-description">
          Protect the flock by monitoring the perimeter and responding to predator threats.
        </div>
        <div className="mission-objectives">
          {objectives.map((obj) => {
            const state = objectiveState(step, obj.at)
            return (
              <div key={obj.label} className={`objective ${state === 'done' ? '' : 'pending'}`}>
                <span className="objective-icon">{state === 'done' ? '✓' : '○'}</span>
                <span>{obj.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
