export function createSeenIds() {
  const seen = new Set()
  return {
    has: (id) => seen.has(id),
    remember: (id) => {
      seen.add(id)
    },
  }
}
