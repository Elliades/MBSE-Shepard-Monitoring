import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import { createMissionPilot } from '../pilot/missionPilot.js'

const MissionContext = createContext(null)

export function MissionProvider({ children }) {
  const pilot = useMemo(() => createMissionPilot(), [])
  const snapshot = useSyncExternalStore(
    pilot.subscribe,
    pilot.getSnapshot,
    pilot.getSnapshot
  )

  const value = useMemo(
    () => ({
      step: snapshot.step,
      outgoing: snapshot.outgoing,
      lanes: snapshot.lanes,
      crashed: snapshot.crashed,
      logEntries: snapshot.logEntries,
      connection: snapshot.connection,
      play: pilot.play,
      runScenario: pilot.runNominalScenario,
      reset: pilot.reset,
      connect: pilot.connect,
      disconnect: pilot.disconnect,
    }),
    [pilot, snapshot]
  )

  return (
    <MissionContext.Provider value={value}>{children}</MissionContext.Provider>
  )
}

export function useMission() {
  const ctx = useContext(MissionContext)
  if (!ctx) {
    throw new Error('useMission must be used within MissionProvider')
  }
  return ctx
}
