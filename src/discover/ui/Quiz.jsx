import React, { useState } from 'react'

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

export default function Quiz({ quiz }) {
  const [selected, setSelected] = useState([])
  const [submitted, setSubmitted] = useState(false)

  function toggle(id) {
    if (submitted) return
    if (quiz.mode === 'single') {
      setSelected([id])
      return
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const correct = submitted && arraysEqual(selected, quiz.correct)

  return (
    <div className="discover-quiz">
      <p className="discover-quiz__prompt">{quiz.prompt}</p>
      <ul className="discover-quiz__options">
        {quiz.options.map((opt) => {
          const isSel = selected.includes(opt.id)
          const showResult = submitted
          const isCorrectOpt = quiz.correct.includes(opt.id)
          let cls = 'discover-quiz__opt'
          if (showResult && isCorrectOpt) cls += ' discover-quiz__opt--correct'
          if (showResult && isSel && !isCorrectOpt) cls += ' discover-quiz__opt--wrong'
          if (isSel && !showResult) cls += ' discover-quiz__opt--selected'

          return (
            <li key={opt.id}>
              <button type="button" className={cls} onClick={() => toggle(opt.id)}>
                {quiz.mode === 'multiple' && (
                  <span className="discover-quiz__check" aria-hidden>{isSel ? '☑' : '☐'}</span>
                )}
                {opt.label}
              </button>
            </li>
          )
        })}
      </ul>
      {!submitted && (
        <button
          type="button"
          className="discover-btn discover-btn--primary"
          disabled={selected.length === 0}
          onClick={() => setSubmitted(true)}
        >
          Valider
        </button>
      )}
      {submitted && (
        <div className={`discover-quiz__feedback ${correct ? 'discover-quiz__feedback--ok' : 'discover-quiz__feedback--ko'}`}>
          <strong>{correct ? 'Correct' : 'Pas tout à fait'}</strong>
          <p>{quiz.explanation}</p>
        </div>
      )}
    </div>
  )
}
