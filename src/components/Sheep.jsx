import React from 'react'
import './Sheep.css'

const Sheep = ({ mainState, substates }) => {
  const isPredatorDetected = substates.includes('Predator tracking') || substates.includes('Predator counteraction')
  
  const sheepPositions = [
    { 
      top: '45%', 
      left: '35%', 
      delay: 0, 
      scatterX: '-20px', 
      scatterY: '-30px',
      wanderAnimation: 'sheep-wander-1'
    },
    { 
      top: '55%', 
      left: '50%', 
      delay: 0.5, 
      scatterX: '10px', 
      scatterY: '20px',
      wanderAnimation: 'sheep-wander-2'
    },
    { 
      top: '50%', 
      left: '60%', 
      delay: 1, 
      scatterX: '30px', 
      scatterY: '-10px',
      wanderAnimation: 'sheep-wander-3'
    },
    { 
      top: '60%', 
      left: '40%', 
      delay: 1.5, 
      scatterX: '-15px', 
      scatterY: '25px',
      wanderAnimation: 'sheep-wander-4'
    },
    { 
      top: '40%', 
      left: '55%', 
      delay: 2, 
      scatterX: '20px', 
      scatterY: '-20px',
      wanderAnimation: 'sheep-wander-5'
    },
  ]

  return (
    <>
      {sheepPositions.map((pos, idx) => (
        <div
          key={idx}
          className={`sheep ${isPredatorDetected ? 'scatter' : 'wandering'}`}
          style={{
            top: pos.top,
            left: pos.left,
            animationDelay: `${pos.delay}s`,
            '--scatter-x': pos.scatterX,
            '--scatter-y': pos.scatterY,
            '--wander-animation': pos.wanderAnimation
          }}
        >
          <img 
            src="/svg/sheep.svg" 
            alt="Sheep" 
            className="sheep-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="sheep-fallback">🐑</div>
        </div>
      ))}
    </>
  )
}

export default Sheep

