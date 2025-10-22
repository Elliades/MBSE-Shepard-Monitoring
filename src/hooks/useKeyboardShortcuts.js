import { useEffect } from 'react'

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }

      const key = event.key.toLowerCase()
      const withCtrl = event.ctrlKey || event.metaKey
      const withShift = event.shiftKey
      const withAlt = event.altKey

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const keyMatches = shortcut.key.toLowerCase() === key
        const ctrlMatches = shortcut.ctrl === withCtrl
        const shiftMatches = shortcut.shift === withShift
        const altMatches = shortcut.alt === withAlt

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export default useKeyboardShortcuts

