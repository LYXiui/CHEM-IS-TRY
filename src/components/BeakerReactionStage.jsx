import { useMemo } from 'react'
import { compoundById } from '../data/compounds'

function BeakerBubbles({ count = 12, gas = false }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 18 + Math.random() * 64,
        size: gas ? 8 + Math.random() * 10 : 4 + Math.random() * 7,
        delay: Math.random() * 1.8,
        dur: gas ? 1.2 + Math.random() * 0.8 : 1.5 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 16,
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
  const solids = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 78,
        w: 2.5 + Math.random() * 4.5,
        h: 2 + Math.random() * 5.5,
        shape: i % 4,
        rotate: Math.floor(Math.random() * 160) - 80,
        delay: 0.05 + Math.random() * 2.2,
        dur: 1.4 + Math.random() * 1.2,
      })),
    [],
  )

  return (
    <>
      <div
        className="beaker-fx beaker-fx-precipitate-cloud"
        style={{ '--solid-color': color }}
        aria-hidden
      />
      <div className="beaker-fx beaker-fx-precipitate" aria-hidden>
        {solids.map((s) => (
          <span
            key={s.id}
            className={`beaker-solid-grain beaker-solid-shape-${s.shape}`}
            style={{
              left: `${s.left}%`,
              width: s.w,
              height: s.h,
              background: color,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
              '--solid-rotate': `${s.rotate}deg`,
            }}
          />
        ))}
      </div>
      <div className="beaker-precip-bed" style={{ '--solid-color': color }} aria-hidden>
        <span className="beaker-precip-bed-top" aria-hidden />
      </div>
    </>
  )
}

function BeakerSteam() {
  return (
    <div className="beaker-fx beaker-fx-steam" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="beaker-steam-wisp" style={{ animationDelay: `${i * 0.4}s` }} />
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

function BeakerGasGuide({ guide }) {
  if (!guide) return null
  return (
    <aside className="beaker-gas-guide" role="note" aria-label="氣體提示">
      <p className="beaker-gas-guide-title">{guide.title}</p>
      <p className="beaker-gas-guide-gas">{guide.gasLabel}</p>
      {guide.imagination && <p className="beaker-gas-guide-note">{guide.imagination}</p>}
      {guide.observe?.length > 0 && (
        <>
          <p className="beaker-gas-guide-sub">如何觀察</p>
          <ul className="beaker-gas-guide-list">
            {guide.observe.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
      {guide.tryNext?.length > 0 && (
        <>
          <p className="beaker-gas-guide-sub">可再嘗試</p>
          <ul className="beaker-gas-guide-list">
            {guide.tryNext.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}

function BeakerPrecipitateHint({ compact = false }) {
  return (
    <aside className={`beaker-precip-hint ${compact ? 'compact' : ''}`} role="note" aria-label="沉澱提示">
      <p className="beaker-precip-hint-title">⬇️ 固態沉澱生成</p>
      {!compact && (
        <p className="beaker-precip-hint-text">
          不溶的固態物質在溶液中析出，並下沉累積於杯底（與上升氣泡不同）
        </p>
      )}
    </aside>
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
  const liquidFrom = anim?.liquidFrom || liquidColor
  const liquidTo = anim?.liquidTo || anim?.productColor || anim?.color || liquidFrom
  const precipColor = anim?.precipitateColor || anim?.productColor || anim?.color || '#f8fafc'
  const hasColorChange = fx.includes('colorChange') || anim?.hasColorChange
  const isBleachFade = anim?.isBleachFade ?? false
  const colorShiftMs = anim?.colorShiftDuration || anim?.duration || 4500
  const level = Math.min(68, Math.max(22, liquidLevel * 100))
  const mixing = active && (fx.includes('liquid') || hasColorChange || fx.length > 0)
  const showGasGuide = active && anim?.gasGuide
  const showPrecipHint = active && (anim?.hasPrecipitate || fx.includes('precipitate'))

  if (!active && !fx.length) return null

  return (
    <div className="beaker-reaction-stage" aria-live="polite">
      <div
        className={`beaker-reaction-row ${showGasGuide || showPrecipHint ? 'has-side-panel' : ''}`}
      >
        <div className="beaker-reaction-stack">
          <div className="beaker-reaction-vessel">
            <div
              className={`beaker-reaction-liquid ${mixing ? 'mixing' : ''} ${hasColorChange ? 'color-shifting' : ''} ${hasColorChange && isBleachFade ? 'color-fading' : ''}`}
              style={{
                '--liquid-from': liquidFrom,
                '--liquid-to': liquidTo,
                '--liquid-base': liquidFrom,
                '--liquid-tint': hasColorChange ? liquidFrom : liquidTo,
                '--liquid-level': `${level}%`,
                '--color-shift-duration': `${colorShiftMs}ms`,
              }}
            >
              <div className="beaker-liquid-inner">
                {mixing && <div className="beaker-liquid-swirl" />}
                {hasColorChange && (
                  <div
                    className="beaker-color-wash"
                    style={{ '--wash-from': liquidFrom, '--wash-to': liquidTo }}
                  />
                )}
                {hasColorChange && (
                  <div
                    className={`beaker-color-diffusion ${isBleachFade ? 'bleach' : ''}`}
                    style={{ '--diffuse': liquidTo }}
                  />
                )}
                {fx.includes('liquid') && <div className="beaker-pour-ripple" />}
                {fx.includes('bubble') && <BeakerBubbles count={16} />}
                {fx.includes('gas') && <BeakerBubbles count={10} gas />}
                {fx.includes('precipitate') && <BeakerPrecipitate color={precipColor} />}
                {fx.includes('steam') && <BeakerSteam />}
              </div>
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
          </div>

          {fx.includes('flame') && (
            <div className="beaker-flame-below">
              <BeakerFlame intense={fx.includes('gas')} />
            </div>
          )}
        </div>

        {(showGasGuide || showPrecipHint) && (
          <div className="beaker-reaction-asides">
            {showGasGuide && <BeakerGasGuide guide={anim.gasGuide} />}
            {showPrecipHint && <BeakerPrecipitateHint compact={!!showGasGuide} />}
          </div>
        )}
      </div>

      {active && <p className="beaker-reaction-caption">反應進行中…</p>}
    </div>
  )
}

export function resolveLiquidLevel(beaker) {
  if (beaker.length === 0) return 0.32
  const hasLiquid = beaker.some((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
  if (hasLiquid) return Math.min(0.62, 0.38 + beaker.length * 0.05)
  return Math.min(0.4, 0.18 + beaker.length * 0.04)
}
