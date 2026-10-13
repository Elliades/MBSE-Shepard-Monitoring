const STORAGE_KEY = 'be-discover-part1-progress'

/**
 * @param {string[]} stepIds
 */
export function loadDoneSet(stepIds) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    const valid = new Set(stepIds)
    return new Set(parsed.filter((id) => valid.has(id)))
  } catch {
    return new Set()
  }
}

/**
 * @param {Set<string>} done
 */
export function saveDoneSet(done) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]))
}

/**
 * @param {{ id: string, steps: { id: string }[] }[]} sections
 * @param {Set<string>} done
 */
export function sectionProgress(sections, done) {
  return sections.map((section) => {
    const total = section.steps.length
    const completed = section.steps.filter((s) => done.has(s.id)).length
    return {
      sectionId: section.id,
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  })
}

/**
 * @param {{ steps: { id: string }[] }[]} sections
 * @param {Set<string>} done
 */
export function overallPercent(sections, done) {
  const all = sections.flatMap((s) => s.steps)
  if (all.length === 0) return 0
  const completed = all.filter((s) => done.has(s.id)).length
  return Math.round((completed / all.length) * 100)
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY)
}
