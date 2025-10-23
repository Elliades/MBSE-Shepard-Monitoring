import { createMachine } from 'xstate'

export const pastureSentinelMachine = createMachine({
  id: 'pastureSentinel',
  initial: 'Undeployed',
  context: {
    battery: 100,
    sheepCount: 5,
    predatorDetected: false,
    connectionStatus: 'disconnected'
  },
  states: {
    Undeployed: {
      initial: 'Off',
      states: {
        Off: {
          entry: 'logStateEntry',
          on: {
            'Start SOI': {
              target: 'Unconfigured',
              actions: 'onStartSOI'
            }
          }
        },
        Unconfigured: {
          entry: 'logStateEntry',
          on: {
            'FlightPlan': {
              target: 'Configured',
              actions: 'onFlightPlanReceived'
            },
            'FlightPlan Check Failed': {
              target: 'Unconfigured',
              actions: 'onFlightPlanFailed'
            }
          }
        },
        Configured: {
          entry: 'logStateEntry',
          on: {
            'Ready for mission': {
              target: 'Ready for Mission',
              actions: 'onReadyForMission'
            }
          }
        },
        'Ready for Mission': {
          entry: 'logStateEntry',
          on: {
            'Start Sheep Guard Mission': {
              target: '#pastureSentinel.Deployed',
              actions: 'onMissionStart'
            }
          }
        }
      }
    },
    
    Deployed: {
      type: 'parallel',
      entry: 'onDeployed',
      on: {
        'Crashed Detected': {
          target: 'Crashed',
          actions: 'onCrashed'
        }
      },
      states: {
        Main: {
          initial: 'Going to Safe Area',
          states: {
            'Going to Safe Area': {
              entry: 'logStateEntry',
              on: {
                'Start Patrolling': {
                  target: 'Patrolling',
                  actions: 'onStartPatrolling'
                }
              }
            },
            Patrolling: {
              type: 'parallel',
              entry: 'logStateEntry',
              on: {
                'Predator Detected inside tracking perimeter': {
                  target: 'Predator Detected',
                  actions: 'onPredatorDetected'
                }
              },
              states: {
                Perimeter: {
                  initial: 'Perimeter watch',
                  states: {
                    'Perimeter watch': {
                      entry: 'logStateEntry'
                    }
                  }
                },
                Sheep: {
                  initial: 'Sheep Monitoring',
                  states: {
                    'Sheep Monitoring': {
                      entry: 'logStateEntry'
                    }
                  }
                },
                Predator: {
                  initial: 'Predator Monitoring',
                  states: {
                    'Predator Monitoring': {
                      entry: 'logStateEntry'
                    }
                  }
                }
              }
            },
            'Predator Detected': {
              initial: 'Predator tracking',
              entry: 'logStateEntry',
              on: {
                'Predator Leaving Tracking Perimeter': {
                  target: 'Patrolling',
                  actions: 'onPredatorLeavingPerimeter'
                }
              },
              states: {
                'Predator tracking': {
                  entry: 'logStateEntry',
                  on: {
                    'Predator Entering Safe Area': {
                      target: 'Predator counteraction',
                      actions: 'onPredatorEnteringSafeArea'
                    }
                  }
                },
                'Predator counteraction': {
                  entry: 'logStateEntry',
                  on: {
                    'Predator Leaving Safe Area': {
                      target: 'Predator tracking',
                      actions: 'onPredatorLeavingSafeArea'
                    }
                  }
                }
              }
            }
          }
        },
        Monitoring: {
          initial: 'Mission Monitoring',
          states: {
            'Mission Monitoring': {
              entry: 'logStateEntry'
            }
          }
        }
      }
    },
    
    Crashed: {
      entry: 'logStateEntry',
      type: 'final'
    }
  }
}, {
  actions: {
    logStateEntry: ({ context, event }) => {
      console.log('Entering state - Event:', event.type)
    },
    onStartSOI: () => {
      console.log('SOI Started')
    },
    onFlightPlanReceived: () => {
      console.log('Flight plan received and validated')
    },
    onFlightPlanFailed: () => {
      console.log('Flight plan check failed')
    },
    onReadyForMission: () => {
      console.log('System ready for mission')
    },
    onMissionStart: () => {
      console.log('Mission started')
    },
    onDeployed: () => {
      console.log('System deployed')
    },
    onStartPatrolling: () => {
      console.log('Started patrolling')
    },
    onPredatorDetected: () => {
      console.log('Predator detected!')
    },
    onStartCounterAction: () => {
      console.log('Starting counteraction')
    },
    onPredatorEnteringSafeArea: () => {
      console.log('Predator entering safe area - ACTIVATING COUNTERACTION')
    },
    onPredatorLeavingSafeArea: () => {
      console.log('Predator leaving safe area - RETURNING TO TRACKING')
    },
    onPredatorLeavingPerimeter: () => {
      console.log('Predator leaving tracking perimeter - RETURNING TO PATROL')
    },
    onCrashed: () => {
      console.log('System crashed')
    }
  }
  // Actors can be added later if needed for async operations
})

