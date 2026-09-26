let idCounter = 0

export function createSignalId(prefix = 'sig') {
  idCounter += 1
  return `${prefix}-${idCounter}-${Date.now()}`
}
