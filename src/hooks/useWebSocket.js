import { useEffect, useRef, useCallback, useState } from 'react'

const useWebSocket = (url, onMessage, options = {}) => {
  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    autoConnect = true
  } = options

  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  const connect = useCallback(() => {
    try {
      console.log('Attempting to connect to WebSocket:', url)
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          if (onMessage) {
            onMessage(data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnectionStatus('disconnected')
        wsRef.current = null

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          console.log('Max reconnection attempts reached')
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnectionStatus('disconnected')
  }, [])

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      wsRef.current.send(message)
      console.log('WebSocket message sent:', data)
      return true
    } else {
      console.warn('WebSocket is not connected. Cannot send message.')
      return false
    }
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    connect,
    disconnect,
    sendMessage,
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  }
}

export default useWebSocket

