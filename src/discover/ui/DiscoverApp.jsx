import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createCameoPort } from '../cameoPort.js'
import {
  loadDoneSet,
  overallPercent,
  saveDoneSet,
  sectionProgress,
} from '../progress.js'
import { PART1_SECTIONS, ALL_STEP_IDS } from '../script/part1.js'
import ContextPanel from './ContextPanel.jsx'
import ProgressRail from './ProgressRail.jsx'
import StepCard from './StepCard.jsx'
import './DiscoverApp.css'

const flatSteps = PART1_SECTIONS.flatMap((s) =>
  s.steps.map((st) => ({ section: s, step: st })),
)

function findIndex(sectionId, stepId) {
  return flatSteps.findIndex(
    (x) => x.section.id === sectionId && x.step.id === stepId,
  )
}

export default function DiscoverApp() {
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(() => loadDoneSet(ALL_STEP_IDS))
  const [cameoStatus, setCameoStatus] = useState('disconnected')
  const [toast, setToast] = useState('')
  const [railOpen, setRailOpen] = useState(true)
  const [contextOpen, setContextOpen] = useState(false)
  const [contextPayload, setContextPayload] = useState({})

  const port = useMemo(() => createCameoPort(), [])

  useEffect(() => {
    let cancelled = false
    port.ping().then((s) => {
      if (!cancelled) setCameoStatus(s)
    })
    const id = setInterval(() => {
      port.ping().then((s) => {
        if (!cancelled) setCameoStatus(s)
      })
    }, 15000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [port])

  const current = flatSteps[index]
  const perSection = sectionProgress(PART1_SECTIONS, done)
  const overall = overallPercent(PART1_SECTIONS, done)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }, [])

  const onReveal = useCallback(
    async (refKey) => {
      await port.reveal(refKey, showToast)
    },
    [port, showToast],
  )

  function goTo(sectionId, stepId) {
    const i = findIndex(sectionId, stepId)
    if (i >= 0) setIndex(i)
  }

  function markDone() {
    const id = current.step.id
    setDone((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveDoneSet(next)
      return next
    })
  }

  function openContext(payload) {
    setContextPayload(payload)
    setContextOpen(true)
  }

  const stepDone = done.has(current.step.id)

  return (
    <div className="discover-app">
      <header className="discover-header">
        <div className="discover-header__brand">
          <h1>BE Discover</h1>
          <span className="discover-header__sub">Pasture Sentinel · Part 1</span>
        </div>
        <div className="discover-header__status">
          <span
            className={`discover-status discover-status--${cameoStatus}`}
            title="MagicDraw (OMF)"
          >
            Cameo {cameoStatus === 'connected' ? 'connecté' : 'hors ligne'}
          </span>
          <a
            className="discover-header__link"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.location.hash = ''
            }}
          >
            Scène live
          </a>
        </div>
      </header>

      <div
        className={[
          'discover-layout',
          railOpen ? '' : 'discover-layout--rail-collapsed',
          contextOpen ? '' : 'discover-layout--context-collapsed',
        ].filter(Boolean).join(' ')}
      >
        <ProgressRail
          collapsed={!railOpen}
          onToggle={() => setRailOpen((open) => !open)}
          sections={PART1_SECTIONS}
          sectionProgress={perSection}
          currentSectionId={current.section.id}
          currentStepId={current.step.id}
          onSelectStep={goTo}
          overall={overall}
        />

        <main className="discover-main">
          <StepCard
            step={current.step}
            sectionTitle={current.section.title}
            onReveal={onReveal}
            onOpenContext={openContext}
            onMarkDone={markDone}
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(flatSteps.length - 1, i + 1))}
            hasPrev={index > 0}
            hasNext={index < flatSteps.length - 1}
            done={stepDone}
          />
        </main>

        <ContextPanel
          open={contextOpen}
          onClose={() => setContextOpen(false)}
          onOpen={() => setContextOpen(true)}
          figure={contextPayload.figure}
          faqKeys={contextPayload.faqKeys}
          tips={contextPayload.tips}
        />
      </div>

      {toast && <div className="discover-toast" role="status">{toast}</div>}
    </div>
  )
}
