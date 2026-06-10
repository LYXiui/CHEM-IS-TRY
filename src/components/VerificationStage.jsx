/** 火柴檢驗、澄清石灰水／指示劑等後續檢驗動畫 */
export default function VerificationStage({ anim, active = true }) {
  if (!anim || anim.type !== 'verification' || !active) return null

  const isMatch = anim.kind === 'match'
  const isReagent = !isMatch

  return (
    <div className="verification-stage" aria-live="polite">
      <div className="verification-scene">
        <div className="verification-vessel">
          <svg className="verification-beaker-svg" viewBox="0 0 100 130" aria-hidden>
            <path
              d="M22 14 H78 L74 112 Q50 120 26 112 L22 14 Z"
              fill="rgba(255,255,255,0.25)"
              stroke="#64748b"
              strokeWidth="2"
            />
            <path d="M18 10 H82 L78 14 H22 Z" fill="none" stroke="#475569" strokeWidth="2" />
            {isReagent && (
              <rect
                className="verification-liquid-fill"
                x="26"
                y="52"
                width="48"
                height="58"
                rx="4"
                style={{
                  '--liq-from': anim.liquidFrom || '#bae6fd',
                  '--liq-to': anim.liquidTo || '#e2e8f0',
                }}
              />
            )}
            {isReagent && anim.turbid && <ellipse className="verification-turbid-cloud" cx="50" cy="72" rx="22" ry="14" />}
            {isReagent && anim.strip && <rect className="verification-indicator-strip" x="44" y="38" width="12" height="42" rx="2" />}
          </svg>

          {isMatch && <div className={`verification-gas-zone verify-gas-${anim.gasId || 'gas'}`} aria-hidden />}
        </div>

        {isMatch && (
          <div className={`verification-match-prop ${anim.flameClass || ''}`} aria-hidden>
            <svg viewBox="0 0 48 80" className="verification-match-svg">
              <rect x="20" y="28" width="8" height="44" rx="2" fill="#b45309" />
              <g className="verification-match-head">
                <circle cx="24" cy="20" r="10" fill="#f97316" stroke="#fde047" strokeWidth="1.5" />
                <g className="verification-match-flame">
                  <ellipse className="vf-core" cx="24" cy="10" rx="7" ry="12" fill="#fbbf24" />
                  <ellipse className="vf-inner" cx="24" cy="8" rx="4" ry="7" fill="#fef08a" />
                </g>
              </g>
            </svg>
            {anim.matchResult === 'pop' && <span className="verification-pop-ring" />}
            {anim.matchResult === 'extinguish' && <span className="verification-smoke" />}
          </div>
        )}

        {isReagent && anim.hasPrecipitate && (
          <div
            className="verification-precip-dust"
            style={{ '--precip': anim.precipitateColor || '#f5f5f4' }}
            aria-hidden
          />
        )}
      </div>

      <div className="verification-readout">
        <p className="verification-title">{anim.title}</p>
        <p className="verification-caption">{anim.caption}</p>
        {anim.sfx && <p className="verification-sfx">{anim.sfx}</p>}
      </div>
    </div>
  )
}
