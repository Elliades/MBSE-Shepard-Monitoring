import React from 'react'

export default function ProgressRail({
  collapsed,
  onToggle,
  sections,
  sectionProgress,
  currentSectionId,
  currentStepId,
  onSelectStep,
  overall,
}) {
  if (collapsed) {
    return (
      <nav className="discover-rail discover-rail--collapsed" aria-label="Progression">
        <button type="button" className="discover-rail__toggle" onClick={onToggle} aria-label="Ouvrir la navigation">
          ›
        </button>
        <span className="discover-rail__percent-mini">{overall}%</span>
      </nav>
    )
  }

  return (
    <nav className="discover-rail" aria-label="Progression">
      <div className="discover-rail__toolbar">
        <button type="button" className="discover-rail__toggle" onClick={onToggle} aria-label="Replier la navigation">
          ‹
        </button>
      </div>
      <div className="discover-rail__overall">
        <span className="discover-rail__percent">{overall}%</span>
        <span className="discover-rail__label">terminé</span>
      </div>
      {sections.map((section) => {
        const prog = sectionProgress.find((p) => p.sectionId === section.id)
        const active = section.id === currentSectionId
        return (
          <div key={section.id} className={`discover-rail__section ${active ? 'discover-rail__section--active' : ''}`}>
            <button
              type="button"
              className="discover-rail__section-head"
              onClick={() => onSelectStep(section.id, section.steps[0].id)}
            >
              <span className="discover-rail__section-title">{section.title}</span>
              <span className="discover-rail__section-meta">
                {prog?.completed ?? 0}/{prog?.total ?? 0}
              </span>
            </button>
            {active && (
              <ul className="discover-rail__steps">
                {section.steps.map((step) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      className={`discover-rail__step ${step.id === currentStepId ? 'discover-rail__step--current' : ''}`}
                      onClick={() => onSelectStep(section.id, step.id)}
                    >
                      {step.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
