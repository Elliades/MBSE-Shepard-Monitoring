import React from 'react'
import BodyText from './BodyText.jsx'
import CopyField from './CopyField.jsx'
import Figure from './Figure.jsx'
import GestureCard from './GestureCard.jsx'
import Quiz from './Quiz.jsx'
import TipToggle from './TipToggle.jsx'

export default function StepCard({
  step,
  sectionTitle,
  onReveal,
  onOpenContext,
  onMarkDone,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  done,
}) {
  return (
    <article className="discover-card">
      <p className="discover-card__section">{sectionTitle}</p>
      <h1 className="discover-card__title">{step.title}</h1>

      {step.body && <BodyText text={step.body} onReveal={onReveal} />}

      {step.figures?.length > 0 && (
        <div className="discover-figures">
          {step.figures.map((fig) => (
            <Figure
              key={fig.src}
              src={fig.src}
              alt={fig.alt ?? fig.caption}
              caption={fig.caption}
              onExpand={(opened) => onOpenContext?.({ figure: opened })}
            />
          ))}
        </div>
      )}

      {step.quiz && step.quizFirst && <Quiz quiz={step.quiz} />}

      {step.tasks?.length > 0 && (
        <ol className="discover-tasks">
          {step.tasks.map((task, i) => (
            <li key={i} className="discover-tasks__item">
              <h2 className="discover-tasks__title">{task.title}</h2>
              <BodyText text={task.body} onReveal={onReveal} />
            </li>
          ))}
        </ol>
      )}

      {step.bullets?.map((b, i) => (
        <BodyText key={i} text={b} onReveal={onReveal} />
      ))}

      {step.copy?.map((c) => (
        <CopyField key={c.label} label={c.label} value={c.value} />
      ))}

      {step.gestures?.map((gid) => (
        <GestureCard key={gid} gestureId={gid} />
      ))}

      {step.tips?.length > 0 && (
        <TipToggle>
          <ul className="discover-tips">
            {step.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <button
            type="button"
            className="discover-link-btn"
            onClick={() => onOpenContext?.({ tips: step.tips })}
          >
            Ouvrir dans Contexte
          </button>
        </TipToggle>
      )}

      {step.faq?.length > 0 && (
        <button
          type="button"
          className="discover-link-btn"
          onClick={() => onOpenContext?.({ faqKeys: step.faq })}
        >
          Lire la FAQ liée
        </button>
      )}

      {step.figure && (
        <Figure
          src={step.figure}
          alt={step.title}
          onExpand={(fig) => onOpenContext?.({ figure: fig })}
        />
      )}

      {step.quiz && !step.quizFirst && <Quiz quiz={step.quiz} />}

      <footer className="discover-card__footer">
        <button type="button" className="discover-btn" disabled={!hasPrev} onClick={onPrev}>
          Précédent
        </button>
        <button
          type="button"
          className={`discover-btn ${done ? 'discover-btn--done' : 'discover-btn--primary'}`}
          onClick={onMarkDone}
        >
          {done ? 'Fait ✓' : 'Marquer fait'}
        </button>
        <button type="button" className="discover-btn discover-btn--primary" disabled={!hasNext} onClick={onNext}>
          Suivant
        </button>
      </footer>
    </article>
  )
}
