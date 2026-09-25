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
  const urlRef = useRef(url)
  const onMessageRef = useRef(onMessage)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  useEffect(() => {
    urlRef.current = url
  }, [url])

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback((urlOverride) => {
    const target = (urlOverride ?? urlRef.current)?.trim()
    if (!target) {
      console.warn('WebSocket URL is empty. Cannot connect.')
      setConnectionStatus('error')
      return
    }

    urlRef.current = target
    reconnectAttemptsRef.current = 0

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.manualClose = true
      wsRef.current.close()
      wsRef.current = null
    }

    try {
      console.log('Attempting to connect to WebSocket:', target)
      const ws = new WebSocket(target)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          if (onMessageRef.current) {
            onMessageRef.current(data)
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
        if (wsRef.current === ws) {
          wsRef.current = null
        }
        if (ws.manualClose) {
          setConnectionStatus('disconnected')
          return
        }

        setConnectionStatus('disconnected')
        if (reconnectAttemptsRef.current < maxReconnectAttempts && urlRef.current) {
          reconnectAttemptsRef.current += 1
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(urlRef.current)
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
  }, [reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    reconnectAttemptsRef.current = maxReconnectAttempts
    if (wsRef.current) {
      wsRef.current.manualClose = true
      wsRef.current.close()
      wsRef.current = null
    }
    setConnectionStatus('disconnected')
  }, [maxReconnectAttempts])

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

