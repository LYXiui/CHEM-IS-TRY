import { useState } from 'react'
import { compounds } from '../data/compounds'

function formatTime(iso) {
  return new Date(iso).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Notebook({ notebook, onReplay }) {
  const [expandedKey, setExpandedKey] = useState(null)

  const toggleExpand = (key) => {
    setExpandedKey((k) => (k === key ? null : key))
  }

  return (
    <section className="notebook-wrap">
      <div className="notebook-spine" aria-hidden />
      <div className="notebook-paper">
        <h2 className="notebook-title">實驗筆記本</h2>

        {notebook.length === 0 ? (
          <p className="notebook-empty">
            完成實驗且確定有化學變化後，才會記載實驗式。點實驗式可展開過程。
          </p>
        ) : (
          <ul className="notebook-entries">
            {notebook.map((e, i) => {
              const c = compounds.find((x) => x.id === e.id)
              const formula = e.resultFormula || c?.formula || e.id
              const name = e.resultName || c?.name
              const key = `${e.time}-${i}`
              const expanded = expandedKey === key
              const canReplay = !!e.snapshot?.items?.length
              const hasProcess = e.processLog?.length > 0

              return (
                <li key={key} className="notebook-entry">
                  <time className="notebook-time">{formatTime(e.time)}</time>
                  <button
                    type="button"
                    onClick={() => toggleExpand(key)}
                    className={`notebook-formula ${hasProcess ? 'clickable' : ''}`}
                    aria-expanded={expanded}
                  >
                    <span className="notebook-formula-text">{formula}</span>
                    {hasProcess && (
                      <span className="notebook-chevron">{expanded ? '▾' : '▸'}</span>
                    )}
                  </button>
                  <p className="notebook-name">{name}</p>

                  {expanded && hasProcess && (
                    <div className="notebook-process notebook-expand">
                      <p className="notebook-label">實驗過程</p>
                      <ul className="notebook-lines">
                        {e.processLog.map((s, j) => (
                          <li key={j} className="notebook-line process">
                            {s.text}
                          </li>
                        ))}
                      </ul>
                      {canReplay && (
                        <button
                          type="button"
                          className="notebook-replay-btn"
                          onClick={() => onReplay(e)}
                        >
                          重現此實驗
                        </button>
                      )}
                    </div>
                  )}

                  {e.note && !expanded && (
                    <p className="notebook-note">{e.note}</p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
