import React, { useState } from 'react'
import { useMission } from './MissionContext.jsx'
import './StmBranchPanel.css'

function StepNode({ name, isActive, isPast }) {
  return (
    <div
      className={`stm-node ${isActive ? 'stm-node--active' : ''} ${isPast ? 'stm-node--past' : ''}`}
      title={name}
    >
      <span className="stm-node-label">{name}</span>
    </div>
  )
}

function TransitionEdge({ signal, target, onFire }) {
  const danger = /crash/i.test(signal)
  return (
    <button
      type="button"
      className={`stm-edge stm-edge--available${danger ? ' stm-edge--danger' : ''}`}
      onClick={() => onFire(signal)}
    >
      <span className="stm-edge-signal">{signal}</span>
      <span className="stm-edge-arrow" aria-hidden>→</span>
      <span className="stm-edge-target">{target}</span>
    </button>
  )
}

export default function StmBranchPanel({ part = 'all' }) {
  const {
    step,
    outgoing,
    lanes,
    crashed,
    play,
    runScenario,
    reset,
    connect,
    disconnect,
    connection,
  } = useMission()
  const [url, setUrl] = useState('ws://localhost:8080')

  const order = lanes.flatMap((lane) => lane.steps)
  const stepIndex = order.indexOf(step)
  const connected = connection.status === 'connected'
  const showTools = part === 'all' || part === 'tools'
  const showLanes = part === 'all' || part === 'tools'
  const showActions = part === 'all' || part === 'actions'
  const edges = part === 'actions'
    ? [...outgoing].sort((a, b) => Number(/crash/i.test(a.signal)) - Number(/crash/i.test(b.signal)))
    : outgoing

  return (
    <div className={`stm-branch-panel stm-branch-panel--${part}`} data-scroll-fade={part === 'all' ? true : undefined}>
      {showTools && <div className="stm-branch-header">
        <h3>STM — embranchements</h3>
        <p className="stm-branch-hint">
          {part === 'tools'
            ? 'Les signaux restent sous la scène. Ici : le parcours et la connexion.'
            : 'Cliquez une transition depuis le pas actif. Un signal distant suit le même chemin.'}
        </p>
        <div className="stm-connect">
          {connected ? (
            <>
              <span className="stm-connect-status">Connecté · {connection.url}</span>
              <button type="button" className="stm-toolbar-btn stm-toolbar-btn--muted" onClick={disconnect}>
                Déconnecter
              </button>
            </>
          ) : (
            <>
              <input
                className="stm-connect-input"
                type="text"
                value={url}
                placeholder="ws://localhost:8080"
                onChange={(event) => setUrl(event.target.value)}
                aria-label="URL WebSocket"
              />
              <button
                type="button"
                className="stm-toolbar-btn"
                onClick={() => connect(url)}
                disabled={!url || connection.status === 'connecting'}
              >
                {connection.status === 'connecting' ? 'Connexion…' : 'Connecter'}
              </button>
              {connection.status === 'error' && (
                <span className="stm-connect-status">Connexion impossible</span>
              )}
            </>
          )}
        </div>
        <div className="stm-branch-toolbar">
          <button type="button" className="stm-toolbar-btn" onClick={runScenario}>
            Scénario nominal
          </button>
          {part === 'all' && (
            <button type="button" className="stm-toolbar-btn stm-toolbar-btn--muted" onClick={reset}>
              Reset
            </button>
          )}
        </div>
      </div>}

      {showLanes && <div className="stm-lanes">
        {lanes.map((lane) => (
          <section key={lane.id} className="stm-lane">
            <h4 className="stm-lane-title">{lane.title}</h4>
            <div className="stm-lane-track">
              {lane.steps.map((name, i) => (
                <React.Fragment key={name}>
                  <StepNode
                    name={name}
                    isActive={step === name}
                    isPast={order.indexOf(name) >= 0 && order.indexOf(name) < stepIndex}
                  />
                  {i < lane.steps.length - 1 && <div className="stm-lane-connector" aria-hidden />}
                </React.Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>}

      {showActions && <div className="stm-active-block">
        <div className="stm-active-step">
          <span className="stm-active-label">Pas actif</span>
          {part === 'actions' ? (
            <div className="stm-active-row">
              <strong>{step}</strong>
              <button type="button" className="stm-toolbar-btn stm-toolbar-btn--muted" onClick={reset}>
                Reset
              </button>
            </div>
          ) : (
            <strong>{step}</strong>
          )}
        </div>

        {edges.length === 0 ? (
          <p className="stm-no-edges">
            {crashed ? 'Mission terminée (crash).' : 'Aucune transition sortante.'}
          </p>
        ) : (
          <div className="stm-outgoing">
            <span className="stm-outgoing-title">Transitions possibles</span>
            {edges.map(({ signal, target }) => (
              <TransitionEdge key={signal} signal={signal} target={target} onFire={play} />
            ))}
          </div>
        )}
      </div>}
    </div>
  )
}
