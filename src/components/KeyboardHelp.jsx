import React, { useState } from 'react'
import './KeyboardHelp.css'

const KeyboardHelp = () => {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    { key: '?', description: 'Show this help' },
    { key: '1', description: 'Start SOI' },
    { key: '2', description: 'Flight Plan' },
    { key: '3', description: 'Ready for mission' },
    { key: '4', description: 'Start Mission' },
    { key: '5', description: 'Start Patrolling' },
    { key: '6', description: 'Predator Detected' },
    { key: 'r', description: 'Reset mission' },
    { key: 'e', description: 'Export logs' },
    { key: 'Esc', description: 'Close dialogs' }
  ]

  return (
    <>
      <button className="keyboard-help-button" onClick={() => setIsOpen(!isOpen)}>
        ⌨️
      </button>

      {isOpen && (
        <div className="keyboard-help-overlay" onClick={() => setIsOpen(false)}>
          <div className="keyboard-help-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⌨️ Keyboard Shortcuts</h2>
              <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="shortcuts-grid">
                {shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="shortcut-item">
                    <kbd className="shortcut-key">{shortcut.key}</kbd>
                    <span className="shortcut-desc">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <p>Press <kbd>?</kbd> anytime to toggle this help</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default KeyboardHelp

