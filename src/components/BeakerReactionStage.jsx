import { useMemo } from 'react'
import { compoundById } from '../data/compounds'

function BeakerBubbles({ count = 12, gas = false }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 14 + Math.random() * 72,
        size: gas ? 10 + Math.random() * 12 : 5 + Math.random() * 9,
        delay: Math.random() * 1.8,
        dur: gas ? 1.1 + Math.random() * 0.7 : 1.6 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 24,
      })),
    [count, gas],
  )

  return (
    <div className="beaker-fx beaker-fx-bubbles" aria-hidden>
      {bubbles.map((b) => (
        <span
          key={b.id}
          className={gas ? 'beaker-gas-bubble' : 'beaker-bubble'}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            '--drift': `${b.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

function BeakerPrecipitate({ color = '#f8fafc' }) {
  const grains = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        size: 3 + Math.random() * 5,
        delay: 0.1 + Math.random() * 1.6,
        dur: 1.4 + Math.random() * 1.2,
      })),
    [],
  )

  return (
    <>
      <div className="beaker-fx beaker-fx-precipitate" aria-hidden>
        {grains.map((g) => (
          <span
            key={g.id}
            className="beaker-grain"
            style={{
              left: `${g.left}%`,
              width: g.size,
              height: g.size,
              background: color,
              animationDelay: `${g.delay}s`,
              animationDuration: `${g.dur}s`,
            }}
          />
        ))}
      </div>
      <div className="beaker-precip-bed" style={{ background: color }} aria-hidden />
    </>
  )
}

function BeakerSteam() {
  return (
    <div className="beaker-fx beaker-fx-steam" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="beaker-steam-wisp" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
    </div>
  )
}

function BeakerFlame({ intense = false }) {
  return (
    <div className={`beaker-fx beaker-fx-flame ${intense ? 'intense' : ''}`} aria-hidden>
      <span className="beaker-flame-core f1" />
      <span className="beaker-flame-core f2" />
      <span className="beaker-flame-core f3" />
      <span className="beaker-flame-glow" />
    </div>
  )
}

/** BEAKER 風格：反應在燒杯液體內發生 */
export default function BeakerReactionStage({
  anim,
  solutionTint,
  liquidColor = '#7dd3fc',
  liquidLevel = 0.58,
  active = false,
}) {
  const fx = anim?.effects || []
  const tint = anim?.color || solutionTint || liquidColor
  const level = Math.min(78, Math.max(28, liquidLevel * 100))
  const mixing = active && (fx.includes('liquid') || fx.includes('colorChange') || fx.length > 0)

  if (!active && !fx.length) return null

  return (
    <div className="beaker-reaction-stage" aria-live="polite">
      <div className="beaker-reaction-vessel">
        <div
          className={`beaker-reaction-liquid ${mixing ? 'mixing' : ''}`}
          style={{
            '--liquid-base': liquidColor,
            '--liquid-tint': tint,
            '--liquid-level': `${level}%`,
          }}
        >
          {mixing && <div className="beaker-liquid-swirl" />}
          {fx.includes('colorChange') && (
            <div className="beaker-color-diffusion" style={{ '--diffuse': tint }} />
          )}
          {fx.includes('liquid') && <div className="beaker-pour-ripple" />}
          {fx.includes('bubble') && <BeakerBubbles count={14} />}
          {fx.includes('gas') && <BeakerBubbles count={9} gas />}
          {fx.includes('precipitate') && <BeakerPrecipitate color={tint} />}
          {fx.includes('steam') && <BeakerSteam />}
        </div>

        <svg className="beaker-reaction-glass" viewBox="0 0 120 160" aria-hidden>
          <defs>
            <linearGradient id="br-glass-shine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(148,163,184,0.35)" />
            </linearGradient>
          </defs>
          <path
            d="M28 18 H92 L88 138 Q60 146 32 138 L28 18 Z"
            fill="url(#br-glass-shine)"
            stroke="#64748b"
            strokeWidth="2"
            opacity="0.35"
          />
          <path
            d="M24 14 L18 18 L24 22 H96 L102 18 L96 14 H24 Z"
            fill="none"
            stroke="#475569"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M18 18 L14 20 L18 22"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M38 22 V132" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
          {[34, 48, 62, 76, 90, 104].map((y) => (
            <line key={y} x1="78" y1={y} x2="84" y2={y} stroke="#94a3b8" strokeWidth="1" opacity="0.85" />
          ))}
        </svg>

        {fx.includes('flame') && <BeakerFlame intense={fx.includes('gas')} />}
      </div>
      <p className="beaker-reaction-caption">反應進行中…</p>
    </div>
  )
}

export function resolveLiquidColor(beaker, solutionTint) {
  if (solutionTint) return solutionTint
  const liquids = beaker.filter((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
  if (liquids.length) return compoundById[liquids[liquids.length - 1].id]?.tone || '#7dd3fc'
  const solids = beaker.length
  if (solids > 0) return '#cbd5e1'
  return '#bae6fd'
}

export function resolveLiquidLevel(beaker) {
  if (beaker.length === 0) return 0.35
  const hasLiquid = beaker.some((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
  if (hasLiquid) return Math.min(0.72, 0.42 + beaker.length * 0.06)
  return Math.min(0.45, 0.2 + beaker.length * 0.05)
}
