import { useEffect, useMemo, useRef, useState } from 'react'
import { compounds } from '../data/compounds'

const NOTEBOOK_LIST_LIMIT = 10

function formatTime(iso) {
  return new Date(iso).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function entryKey(e) {
  return e.reactionKey || `${e.id}-${e.time}`
}

function resolveEntry(e) {
  const c = compounds.find((x) => x.id === e.id)
  return {
    formula: e.resultFormula || c?.formula || e.id,
    name: e.resultName || c?.name || e.id,
    canReplay: !!e.snapshot?.items?.length,
    hasProcess: e.processLog?.length > 0,
  }
}

function NotebookEntryDetail({ entry, onReplay }) {
  const { formula, name, canReplay, hasProcess } = resolveEntry(entry)

  return (
    <div className="notebook-detail">
      <p className="notebook-detail-meta">
        <time>{formatTime(entry.time)}</time>
        {entry.note && <span> · {entry.note}</span>}
      </p>
      <p className="notebook-detail-formula">{formula}</p>
      <p className="notebook-detail-name">{name}</p>

      {hasProcess && (
        <div className="notebook-process">
          <p className="notebook-label">實驗過程</p>
          <ul className="notebook-lines">
            {entry.processLog.map((s, j) => (
              <li key={j} className="notebook-line process">
                {s.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canReplay && (
        <button type="button" className="notebook-replay-btn" onClick={() => onReplay(entry)}>
          重做實驗
        </button>
      )}
      {!canReplay && <p className="notebook-detail-hint muted">此筆記無法重現</p>}
    </div>
  )
}

function NotebookListView({ notebook, onReplay }) {
  const [expandedKey, setExpandedKey] = useState(null)

  const toggleExpand = (key) => {
    setExpandedKey((k) => (k === key ? null : key))
  }

  return (
    <ul className="notebook-entries">
      {notebook.map((e) => {
        const { formula, name, canReplay, hasProcess } = resolveEntry(e)
        const key = entryKey(e)
        const expanded = expandedKey === key

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
              {hasProcess && <span className="notebook-chevron">{expanded ? '▾' : '▸'}</span>}
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
                  <button type="button" className="notebook-replay-btn" onClick={() => onReplay(e)}>
                    重做實驗
                  </button>
                )}
              </div>
            )}

            {e.note && !expanded && <p className="notebook-note">{e.note}</p>}
          </li>
        )
      })}
    </ul>
  )
}

function NotebookDropdownView({ notebook, onReplay, onCloseMenu }) {
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedEntryKey, setSelectedEntryKey] = useState(null)

  const entries = useMemo(
    () => [...notebook].sort((a, b) => new Date(b.time) - new Date(a.time)),
    [notebook],
  )

  const selectedEntry = entries.find((e) => entryKey(e) === selectedEntryKey) || null
  const selectedFormula = selectedEntry ? resolveEntry(selectedEntry).formula : null

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    onCloseMenu?.(closeMenu)
    return () => onCloseMenu?.(null)
  }, [onCloseMenu])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (ev) => {
      if (menuRef.current?.contains(ev.target)) return
      setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [menuOpen])

  const pickEntry = (e) => {
    setSelectedEntryKey(entryKey(e))
    setMenuOpen(false)
  }

  return (
    <div className="notebook-dropdown-wrap">
      <div className="notebook-dropdown-menu-wrap" ref={menuRef}>
        <button
          type="button"
          className={`notebook-dropdown-trigger ${menuOpen ? 'open' : ''}`}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span>{selectedFormula || `實驗化學式（${entries.length}）`}</span>
          <span className="notebook-chevron">{menuOpen ? '▴' : '▾'}</span>
        </button>

        {menuOpen && (
          <ul className="notebook-dropdown-menu" role="listbox">
            {entries.map((e) => {
              const key = entryKey(e)
              const { formula, name } = resolveEntry(e)
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedEntryKey === key}
                    className={`notebook-dropdown-item ${selectedEntryKey === key ? 'active' : ''}`}
                    onClick={() => pickEntry(e)}
                  >
                    <span className="notebook-dropdown-formula">{formula}</span>
                    <span className="notebook-dropdown-meta">
                      <span className="notebook-dropdown-name">{name}</span>
                      <time className="notebook-dropdown-time">{formatTime(e.time)}</time>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selectedEntry ? (
        <div className="notebook-dropdown-panel">
          <NotebookEntryDetail entry={selectedEntry} onReplay={onReplay} />
        </div>
      ) : (
        <p className="notebook-dropdown-hint">從上方選單點選化學式，可查看過程並重做實驗</p>
      )}
    </div>
  )
}

export default function Notebook({ notebook, onReplay }) {
  const useDropdown = notebook.length > NOTEBOOK_LIST_LIMIT
  const closeMenuRef = useRef(null)

  const handlePaperPointerDown = (ev) => {
    if (!closeMenuRef.current) return
    const interactive = ev.target.closest(
      'button, a, input, select, textarea, [role="option"], [role="button"], .notebook-dropdown-menu, .notebook-detail-replayable',
    )
    if (!interactive) closeMenuRef.current()
  }

  return (
    <section className="notebook-wrap">
      <div className="notebook-spine" aria-hidden />
      <div className="notebook-paper" onPointerDown={useDropdown ? handlePaperPointerDown : undefined}>
        <h2 className="notebook-title">實驗筆記本</h2>

        {notebook.length === 0 ? (
          <p className="notebook-empty">
            完成實驗且確定有化學變化後，才會記載實驗式。點實驗式可展開過程。
          </p>
        ) : useDropdown ? (
          <NotebookDropdownView
            notebook={notebook}
            onReplay={onReplay}
            onCloseMenu={(fn) => {
              closeMenuRef.current = fn
            }}
          />
        ) : (
          <NotebookListView notebook={notebook} onReplay={onReplay} />
        )}
      </div>
    </section>
  )
}
