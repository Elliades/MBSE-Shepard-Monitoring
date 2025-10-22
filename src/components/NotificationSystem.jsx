import React from 'react'
import { useStateMachine } from '../contexts/StateMachineContext'
import './NotificationSystem.css'

const NotificationSystem = () => {
  const { notifications } = useStateMachine()

  return (
    <div className="notification-system">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationSystem

