import { useState } from 'react'
import { stockCompounds, compoundById } from '../data/compounds'
import { EQUIPMENT } from '../data/equipment'
import { elementBySymbol, getElementIntro } from '../data/elements'
import ElementIcon from './ElementIcon'
import ExperimentAnimations from './ExperimentAnimations'
import BenchEquipment from './BenchEquipment'
import BeakerIcon from './BeakerIcon'

function PhenomenonEffects({ effects, effectColor }) {
  if (!effects?.length) return null
  const tags = {
    bubble: '🫧 冒泡',
    precipitate: '⬇️ 固態沉澱',
    colorChange: '🎨 變色',
    flame: '🔥 燃燒',
    gas: '☁️ 氣體',
    liquid: '💧 液體',
    steam: '♨️ 蒸氣',
  }
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {effects.map((e) => (
        <span
          key={e}
          className="lab-report-tag text-xs px-2 py-0.5 rounded-full border border-slate-300 bg-slate-50 text-slate-700"
          style={e === 'colorChange' || e === 'precipitate' ? { background: effectColor || '#64748b' } : {}}
        >
          {tags[e] || e}
        </span>
      ))}
    </div>
  )
}

function ToolIcon({ id, active, matchLit }) {
  const common = 'w-7 h-7'
  switch (id) {
    case 'beaker':
      return <BeakerIcon className={common} active={active} />
    case 'lamp':
      return (
        <svg className={common} viewBox="0 0 28 36" aria-hidden>
          <ellipse cx="14" cy="30" rx="10" ry="4" fill="#475569" />
          <path d="M10 30V14q4-6 8 0v16" fill="#64748b" stroke="#94a3b8" />
          {active && (
            <g className="animate-pulse">
              <ellipse cx="14" cy="6" rx="5" ry="8" fill="#fb923c" />
              <ellipse cx="14" cy="4" rx="3" ry="5" fill="#fde047" />
            </g>
          )}
        </svg>
      )
    case 'match':
      return (
        <svg className={common} viewBox="0 0 24 32" aria-hidden>
          <rect x="10" y="12" width="4" height="18" rx="1" fill="#b45309" />
          <circle cx="12" cy="8" r="5" fill={matchLit ? '#f97316' : '#78716c'} />
        </svg>
      )
    case 'lid':
      return (
        <svg className={common} viewBox="0 0 32 20" aria-hidden>
          <rect x="4" y="2" width="24" height="8" rx="2" fill={active ? '#64748b' : '#334155'} stroke="#94a3b8" />
        </svg>
      )
    case 'stir':
      return (
        <svg className={common} viewBox="0 0 24 32" aria-hidden>
          <line x1="12" y1="4" x2="12" y2="28" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="12" cy="4" r="3" fill={active ? '#22d3ee' : '#64748b'} />
        </svg>
      )
    case 'filter':
      return (
        <svg className={common} viewBox="0 0 28 32" aria-hidden>
          <path d="M4 4h20L14 18v10l-6-3V18L4 4z" fill={active ? '#0e7490' : '#475569'} stroke="#67e8f9" />
        </svg>
      )
    case 'separator':
      return (
        <svg className={common} viewBox="0 0 24 36" aria-hidden>
          <path d="M8 2h8v32H8z" fill="#64748b" />
          <ellipse cx="12" cy="20" rx="6" ry="2" fill={active ? '#22d3ee' : '#475569'} />
        </svg>
      )
    case 'cooler':
      return (
        <svg className={common} viewBox="0 0 32 28" aria-hidden>
          <path
            d="M4 14h24M8 8v12M16 6v16M24 10v8"
            stroke={active ? '#67e8f9' : '#64748b'}
            strokeWidth="2"
          />
        </svg>
      )
    default:
      return null
  }
}

function ReagentBottle({ compound, onPour, onContextMenu }) {
  return (
    <button
      type="button"
      onClick={() => onPour(compound.id)}
      onContextMenu={(e) => onContextMenu(e, compound.name, compound.desc)}
      className="reagent-bottle flex flex-col items-center"
    >
      <div className="reagent-bottle-glass">
        <div className="reagent-liquid" style={{ background: compound.tone }} />
      </div>
      <span className="reagent-formula mt-1 text-[9px] font-mono font-bold">{compound.formula}</span>
    </button>
  )
}

export default function LabBench({
  beakerPlaced,
  beaker,
  phenomenon,
  effects,
  effectColor,
  bubble,
  lastAction,
  selectedIndex,
  onSelectItem,
  onRemove,
  lidOn,
  lampOn,
  matchLit,
  matchOnBench,
  tools,
  onToggleBeaker,
  onToggleTool,
  timerSec,
  timerRunning,
  onAccelerate,
  onPour,
  onMix,
  onBurn,
  onClear,
  onContextMenu,
  labAnimation,
  solutionTint,
  itemAnims,
  reactionBusy,
  reactionSnapshot,
  children,
}) {
  const [reagentExpanded, setReagentExpanded] = useState(false)

  const fx = labAnimation?.effects || []
  const isAnimating = reactionBusy || fx.length > 0 || labAnimation?.type === 'solutionShift'
  const showResultIdle =
    !isAnimating && !!phenomenon && beaker.length === 0 && !beakerPlaced

  const isActive = (id) => {
    if (id === 'beaker') return beakerPlaced
    if (id === 'lamp') return lampOn
    if (id === 'lid') return lidOn
    if (id === 'match') return matchLit
    return tools[id]
  }

  return (
    <section className="game-panel p-4 lab-bench-panel">
      <h2 className="game-panel-title mb-4">實驗台</h2>

      <div className="lab-bench-surface">
        <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">實驗器具</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {EQUIPMENT.map((eq) => (
            <button
              key={eq.id}
              type="button"
              className={`tool-btn ${isActive(eq.id) ? 'active' : ''}`}
              onClick={() => (eq.id === 'beaker' ? onToggleBeaker() : onToggleTool(eq.id))}
              onContextMenu={(e) => onContextMenu(e, eq.name, eq.intro)}
            >
              <ToolIcon id={eq.id} active={isActive(eq.id)} matchLit={matchLit} />
              <span>{eq.name}</span>
            </button>
          ))}
          {timerRunning && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="stopwatch-ring">{timerSec}s</div>
              <button type="button" className="btn-game btn-accel text-xs" onClick={onAccelerate}>
                ⏩ 加速
              </button>
            </div>
          )}
        </div>

        <div
          className={`bench-workspace min-h-[200px] rounded-xl border border-slate-300/60 bg-white/50 p-4 relative ${isAnimating ? 'bench-reacting overflow-visible' : 'overflow-hidden'}`}
        >
          <ExperimentAnimations
            anim={labAnimation}
            solutionTint={solutionTint}
            beaker={beaker.length ? beaker : reactionSnapshot || beaker}
            reactionBusy={reactionBusy}
            itemAnims={itemAnims}
          />
          {!isAnimating && (
            <BenchEquipment
              beakerPlaced={beakerPlaced}
              beaker={beaker}
              lidOn={lidOn}
              lampOn={lampOn}
              matchOnBench={matchOnBench}
              matchLit={matchLit}
              tools={tools}
              solutionTint={solutionTint}
            />
          )}
          {showResultIdle ? (
            <p className="lab-result-idle text-sm text-slate-700 text-center py-10 relative z-10">
              實驗完成。請查看下方報告，或按「清空」重置實驗台。
            </p>
          ) : !isAnimating && !phenomenon && beaker.length === 0 && !beakerPlaced ? (
            <p className="text-sm text-slate-500 text-center py-8 relative z-10">
              點選上方器具後會出現於台面；週期表選固態元素可直接實驗，所有液體須先放置燒杯
            </p>
          ) : !isAnimating && !phenomenon && beaker.length === 0 && beakerPlaced ? (
            <p className="text-sm text-slate-500 text-center py-6 relative z-10">
              燒杯已放置，可傾倒溶液或加入元素
            </p>
          ) : !isAnimating && beaker.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center relative z-10">
              {beaker.map((item, i) => (
                <button
                  key={`${i}-${item.type === 'compound' ? item.id : item.symbol}`}
                  type="button"
                  className={`content-chip ${selectedIndex === i ? 'selected' : ''} ${itemAnims?.[i] ? `chip-${itemAnims[i]}` : ''}`}
                  onClick={() => onSelectItem(i)}
                  onContextMenu={(e) => {
                    if (item.type === 'compound') {
                      const c = compoundById[item.id]
                      onContextMenu(e, c?.name, c?.desc)
                    } else {
                      const el = elementBySymbol[item.symbol]
                      onContextMenu(e, el?.name || item.symbol, getElementIntro(el))
                    }
                  }}
                >
                  <ElementIcon item={item} size="sm" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          <button type="button" className="btn-game btn-mix" onClick={onMix}>
            ⚗️ 混合
          </button>
          <button type="button" className="btn-game btn-burn" onClick={onBurn}>
            🔥 燃燒
          </button>
          <button type="button" className="btn-game btn-remove" onClick={onRemove}>
            ✕ 移除選取
          </button>
          <button type="button" className="btn-game btn-remove opacity-80" onClick={onClear}>
            清空
          </button>
        </div>

      </div>

      {(phenomenon || bubble || lastAction) && (
        <div className="lab-report-panel">
          <h3 className="lab-report-heading">實驗報告</h3>
          {phenomenon && (
            <div className="lab-report">
              <div className="lab-report-title">
                {phenomenon.name}{' '}
                <span className="lab-report-formula font-mono">{phenomenon.formula}</span>
              </div>
              <p className="lab-report-text">{phenomenon.text}</p>
              <PhenomenonEffects effects={effects} effectColor={effectColor} />
            </div>
          )}
          {bubble && (
            <div className="lab-report lab-report-hint">
              <p className="lab-report-hint-label">想像提示</p>
              <p className="lab-report-text">{bubble}</p>
            </div>
          )}
          {lastAction && (
            <p className="lab-report-action">› {lastAction}</p>
          )}
        </div>
      )}

      <div className="lab-bench-attachments">
        <div className={`lab-bench-attach-col reagent-zone ${reagentExpanded ? 'reagent-zone-expanded' : ''}`}>
          <div className="reagent-zone-header">
            <h3 className="lab-bench-attach-title reagent-zone-title mb-0">溶液與試劑櫃</h3>
            <button
              type="button"
              className="reagent-expand-btn"
              onClick={() => setReagentExpanded((v) => !v)}
              aria-expanded={reagentExpanded}
            >
              {reagentExpanded ? '收合 ▴' : '展開 ▾'}
            </button>
          </div>
          <div className={`reagent-scroll flex flex-wrap gap-2 justify-center sm:justify-start pb-1 ${reagentExpanded ? 'reagent-scroll-expanded' : ''}`}>
            {stockCompounds.map((c) => (
              <ReagentBottle key={c.id} compound={c} onPour={onPour} onContextMenu={onContextMenu} />
            ))}
          </div>
        </div>
        <div className="lab-bench-attach-col lab-bench-elements">
          {children}
        </div>
      </div>
    </section>
  )
}
