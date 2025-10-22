import React from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './Field.css'
import Drone from './Drone'
import Sheep from './Sheep'
import Predator from './Predator'
import SafeZone from './SafeZone'
import BaseStation from './BaseStation'

const Field = () => {
  const { getMainState, getSubstates } = useStateMachine()
  
  const mainState = getMainState()
  const substates = getSubstates()

  return (
    <div className="field-container">
      <div className="field-background">
        <BaseStation />
        <SafeZone mainState={mainState} substates={substates} />
        <Sheep mainState={mainState} substates={substates} />
        <Predator mainState={mainState} substates={substates} />
        <Drone mainState={mainState} substates={substates} />
      </div>
    </div>
  )
}

export default Field

