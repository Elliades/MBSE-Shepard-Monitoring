import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createActor } from 'xstate'
import { pastureSentinelMachine } from '../stateMachine/pastureSentinelMachine'
import useWebSocket from '../hooks/useWebSocket'

const StateMachineContext = createContext()

export const useStateMachine = () => {
  const context = useContext(StateMachineContext)
  if (!context) {
    throw new Error('useStateMachine must be used within StateMachineProvider')
  }
  return context
}

export const StateMachineProvider = ({ children }) => {
  // Create actor using XState 5 API - SINGLETON PATTERN
  const actor = useMemo(() => {
    console.log('🏭 Creating new actor instance')
    const newActor = createActor(pastureSentinelMachine)
    newActor.start()
    console.log('✅ Actor created with ID:', newActor.id)
    return newActor
  }, []) // Empty deps - create ONCE only

  // Track state manually with subscription
  const [state, setState] = useState(actor.getSnapshot())

  // Subscribe to state changes - create subscription ONCE only
  useEffect(() => {
    console.log('🔌 Setting up subscription for actor:', actor.id)

    const subscription = actor.subscribe((snapshot) => {
      console.log('🔄 STATE UPDATE:', JSON.stringify(snapshot.value, null, 2))

      // CRITICAL FIX: Use the snapshot directly - React will detect the change
      setState(snapshot)
    })

    return () => {
      console.log('🧹 Unsubscribing from actor:', actor.id)
      subscription.unsubscribe()
    }
  }, []) // EMPTY DEPS - create subscription ONCE only

  const send = useCallback((event) => {
    console.log('📤 Sending event:', event)
    console.log('   Actor status:', actor.getSnapshot().status)
    console.log('   Actor can receive event?', actor.getSnapshot().can(event))

    if (actor.getSnapshot().status === 'active') {
      actor.send(event)
      console.log('✅ Event sent successfully')
    } else {
      console.log('❌ Actor is not active, cannot send event')
      console.log('   Status:', actor.getSnapshot().status)
      console.log('   This suggests the actor was stopped or reached a final state')
    }
  }, [])
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', message: 'System initialized', timestamp: new Date().toLocaleTimeString() }
  ])
  const [wsUrl, setWsUrl] = useState('')
  const [notifications, setNotifications] = useState([])

  // Add log entry
  const addLog = useCallback((type, message) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }
    setLogs(prev => [...prev, newLog])
  }, [])

  // Add notification
  const addNotification = useCallback((type, title, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message
    }
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
    }, 5000)
  }, [])

  // Send signal to state machine
  const sendSignal = useCallback((signal) => {
    console.log('📤 SENDING SIGNAL:', signal)
    console.log('📍 Current state before:', JSON.stringify(state.value, null, 2))
    console.log('📍 Actor status:', actor.getSnapshot().status)
    send({ type: signal })
    console.log('✅ Signal sent, waiting for state update...')
    addLog('info', `Signal received: ${signal}`)
    addNotification('info', 'Signal Received', signal)
  }, [send, addLog, addNotification])

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data) => {
    console.log('📡 Received WebSocket signal:', data)
    console.log('   Actor status:', actor.getSnapshot().status)

    // Expected format: { signal: "Signal Name" } or { type: "Signal Name" }
    const signal = data.signal || data.type || data

    if (signal && actor.getSnapshot().status === 'active') {
      console.log('✅ Sending WebSocket signal to active actor:', signal)
      addLog('info', `WebSocket signal: ${signal}`)
      send({ type: signal })
      addNotification('success', 'Signal Received', `Remote signal: ${signal}`)
    } else if (actor.getSnapshot().status !== 'active') {
      console.log('❌ WebSocket signal ignored - actor not active')
      console.log('   Actor status:', actor.getSnapshot().status)
    }
  }, [send, addLog, addNotification])

  // WebSocket connection (only if URL is provided)
  const { connectionStatus, isConnected, sendMessage: wsSendMessage } = useWebSocket(
    wsUrl,
    handleWebSocketMessage,
    {
      autoConnect: false, // ❌ DISABLE AUTO-CONNECT - connect manually only
      reconnectInterval: 3000,
      maxReconnectAttempts: 5
    }
  )

  // Get current state path
  const getCurrentStatePath = useCallback(() => {
    const stateValue = state.value

    if (typeof stateValue === 'string') {
      return [stateValue]
    }

    // Handle nested states
    const extractStates = (obj, prefix = []) => {
      const states = []
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          states.push(...prefix, key, value)
        } else if (typeof value === 'object') {
          states.push(...prefix, key, ...extractStates(value))
        } else {
          states.push(...prefix, key)
        }
      }
      return states
    }

    return extractStates(stateValue)
  }, [state.value])

  // Get main state (top level)
  const getMainState = useCallback(() => {
    const stateValue = state.value
    if (typeof stateValue === 'string') {
      return stateValue
    }
    return Object.keys(stateValue)[0]
  }, [state.value])

  // Get substates
  const getSubstates = useCallback(() => {
    console.log('🔍 getSubstates called with state.value:', JSON.stringify(state.value))
    const stateValue = state.value
    const substates = []

    const extractSubstates = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          substates.push(value)
        } else if (typeof value === 'object' && value !== null) {
          extractSubstates(value)
        }
      }
    }

    if (typeof stateValue === 'object' && stateValue !== null) {
      extractSubstates(stateValue)
    }

    console.log('🔍 getSubstates returning:', substates)
    return substates
  }, [state.value]) // Back to state.value - let React handle the comparison

  // Listen to state changes
  useEffect(() => {
    const statePath = getCurrentStatePath()
    const mainState = getMainState()
    const substates = getSubstates()

    console.log('State changed:', { mainState, substates, fullPath: statePath })

    // Log state changes
    if (substates.length > 0) {
      addLog('success', `State: ${mainState} → ${substates.join(', ')}`)
    } else {
      addLog('success', `State: ${mainState}`)
    }
  }, [state.value, getCurrentStatePath, getMainState, getSubstates, addLog])

  // Update connection status in state machine context
  useEffect(() => {
    if (connectionStatus !== state.context?.connectionStatus) {
      // You could send an event to update the machine context if needed
    }
  }, [connectionStatus, state.context?.connectionStatus])

  // Log connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      addLog('success', 'WebSocket connection established')
      addNotification('success', 'Connected', 'WebSocket connection established')
    } else if (connectionStatus === 'error') {
      addLog('error', 'WebSocket connection error')
      addNotification('error', 'Connection Error', 'Failed to connect to WebSocket')
    } else if (connectionStatus === 'disconnected' && wsUrl) {
      addLog('warning', 'WebSocket disconnected')
    }
  }, [connectionStatus, addLog, addNotification, wsUrl])

  const value = {
    state,
    send,
    sendSignal,
    logs,
    notifications,
    addLog,
    addNotification,
    getCurrentStatePath,
    getMainState,
    getSubstates,
    context: {
      ...state.context,
      connectionStatus: wsUrl ? connectionStatus : 'not configured'
    },
    // WebSocket controls
    wsUrl,
    setWsUrl,
    isConnected,
    wsSendMessage
  }

  return (
    <StateMachineContext.Provider value={value}>
      {children}
    </StateMachineContext.Provider>
  )
}

