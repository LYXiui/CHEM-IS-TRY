import { compoundById } from '../data/compounds'
import BeakerIcon from './BeakerIcon'

/** 實驗台上可見的實體器具（點選工具列後顯示於工作區） */
function BeakerVisual({ beaker, lidOn, solutionTint }) {
  const liquids = beaker.filter((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
  const fill =
    solutionTint ||
    (liquids.length
      ? compoundById[liquids[liquids.length - 1].id]?.tone || '#7dd3fc'
      : beaker.length > 0
        ? 'rgba(148,163,184,0.45)'
        : undefined)
  const level = beaker.length === 0 ? 0.12 : Math.min(0.72, 0.2 + beaker.length * 0.09)

  return (
    <div className="bench-prop bench-prop-beaker" aria-hidden>
      <BeakerIcon
        className="bench-beaker-svg"
        active
        showLiquid={!!fill}
        liquidFill={fill}
        liquidLevel={level}
        lidOn={lidOn}
      />
      {beaker.length > 0 && (
        <span className="bench-prop-label">{beaker.length} 種物質</span>
      )}
    </div>
  )
}

function LampVisual() {
  return (
    <div className="bench-prop bench-prop-lamp" aria-hidden>
      <svg viewBox="0 0 56 72" className="bench-lamp-svg">
        <ellipse cx="28" cy="64" rx="18" ry="6" fill="#475569" />
        <path d="M20 64V28q8-10 16 0v36" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
        <g className="bench-lamp-flame">
          <ellipse cx="28" cy="14" rx="10" ry="14" fill="#fb923c" opacity="0.9" />
          <ellipse cx="28" cy="10" rx="6" ry="10" fill="#fde047" />
        </g>
      </svg>
      <span className="bench-prop-label">酒精燈</span>
    </div>
  )
}

function MatchVisual({ lit }) {
  return (
    <div className="bench-prop bench-prop-match" aria-hidden>
      <svg viewBox="0 0 40 64" className="bench-match-svg">
        <rect x="17" y="22" width="6" height="36" rx="1.5" fill="#b45309" />
        <circle cx="20" cy="14" r="9" fill={lit ? '#f97316' : '#78716c'} stroke={lit ? '#fde047' : '#57534e'} strokeWidth="1.5" />
        {lit && (
          <g className="bench-match-flame">
            <ellipse cx="20" cy="6" rx="5" ry="8" fill="#fbbf24" />
            <ellipse cx="20" cy="4" rx="3" ry="5" fill="#fef08a" />
          </g>
        )}
      </svg>
      <span className="bench-prop-label">{lit ? '火柴（燃）' : '火柴'}</span>
    </div>
  )
}

function ToolPropVisual({ id }) {
  const icons = {
    stir: (
      <svg viewBox="0 0 32 48" className="bench-tool-svg">
        <line x1="16" y1="6" x2="16" y2="42" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="16" cy="6" r="4" fill="#22d3ee" />
      </svg>
    ),
    filter: (
      <svg viewBox="0 0 36 44" className="bench-tool-svg">
        <path d="M4 4h28L18 24v14l-8-4V24L4 4z" fill="#0e7490" stroke="#67e8f9" strokeWidth="1.5" />
      </svg>
    ),
    separator: (
      <svg viewBox="0 0 28 52" className="bench-tool-svg">
        <path d="M10 2h8v48H10z" fill="#64748b" stroke="#94a3b8" />
        <ellipse cx="14" cy="28" rx="8" ry="3" fill="#22d3ee" />
      </svg>
    ),
    cooler: (
      <svg viewBox="0 0 40 32" className="bench-tool-svg">
        <path d="M4 16h32M8 10v12M20 8v16M32 12v8" stroke="#67e8f9" strokeWidth="2.5" />
      </svg>
    ),
  }
  const names = { stir: '攪拌棒', filter: '過濾器', separator: '分離器', cooler: '冷卻器' }
  return (
    <div className={`bench-prop bench-prop-tool bench-prop-${id}`} aria-hidden>
      {icons[id]}
      <span className="bench-prop-label">{names[id]}</span>
    </div>
  )
}

export default function BenchEquipment({
  beakerPlaced,
  beaker,
  lidOn,
  lampOn,
  matchOnBench,
  matchLit,
  tools,
  solutionTint,
}) {
  const activeTools = ['stir', 'filter', 'separator', 'cooler'].filter((id) => tools[id])

  if (!beakerPlaced && !lampOn && !matchOnBench && activeTools.length === 0) {
    return null
  }

  return (
    <div className="bench-equipment-layer" aria-label="實驗器具">
      {lampOn && <LampVisual />}
      {beakerPlaced && (
        <BeakerVisual beaker={beaker} lidOn={lidOn} solutionTint={solutionTint} />
      )}
      {matchOnBench && <MatchVisual lit={matchLit} />}
      {activeTools.map((id) => (
        <ToolPropVisual key={id} id={id} />
      ))}
    </div>
  )
}
