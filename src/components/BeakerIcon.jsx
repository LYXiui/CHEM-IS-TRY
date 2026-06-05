import { useId } from 'react'

/**
 * 標準實驗室燒杯（Griffin beaker）— 工具列與台面共用
 */
export default function BeakerIcon({
  className = 'w-7 h-7',
  active = false,
  showLiquid = false,
  liquidFill = '#7dd3fc',
  liquidLevel = 0.45,
  lidOn = false,
}) {
  const clipId = useId().replace(/:/g, '')
  const level = Math.min(0.72, Math.max(0.08, liquidLevel))
  const liquidTop = 58 - level * 46

  return (
    <svg className={className} viewBox="0 0 56 72" aria-hidden>
      <defs>
        <clipPath id={`beaker-inner-${clipId}`}>
          <path d="M18 14h20v52H18z" />
        </clipPath>
        <linearGradient id="beaker-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="45%" stopColor="rgba(186,230,253,0.2)" />
          <stop offset="100%" stopColor="rgba(148,163,184,0.35)" />
        </linearGradient>
      </defs>

      {/* 杯蓋 */}
      {lidOn && (
        <rect x="15" y="5" width="26" height="5" rx="1.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      )}

      {/* 口沿 + 倒嘴 */}
      <path
        d="M14 12 L10 14 L14 16 L18 14 H38 L42 16 L46 14 L42 12 H14 Z"
        fill={active ? 'rgba(34,211,238,0.35)' : '#e2e8f0'}
        stroke="#64748b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* 杯身 */}
      <path
        d="M18 14 H38 L36 62 Q28 66 20 62 L18 14 Z"
        fill="url(#beaker-glass)"
        stroke="#475569"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* 液面 */}
      {showLiquid && (
        <g clipPath={`url(#beaker-inner-${clipId})`}>
          <rect x="18" y={liquidTop} width="20" height={62 - liquidTop} fill={liquidFill} opacity="0.82" />
          <ellipse cx="28" cy={liquidTop} rx="10" ry="2" fill={liquidFill} opacity="0.65" />
        </g>
      )}

      {/* 刻度 */}
      {[22, 30, 38, 46, 54].map((y) => (
        <line key={y} x1="34" y1={y} x2="37" y2={y} stroke="#94a3b8" strokeWidth="0.8" opacity="0.9" />
      ))}

      {/* 高光 */}
      <path
        d="M21 18 V58"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}
