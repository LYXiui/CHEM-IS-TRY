import { compoundById } from '../data/compounds'
import { elementBySymbol } from '../data/elements'
import { contrastTextColor } from '../utils/colorContrast'

export default function ElementIcon({ item, size = 'md' }) {
  const box = size === 'sm' ? 'text-[10px] px-1 py-0.5' : 'text-sm px-2 py-1'

  if (item?.type === 'compound') {
    const c = compoundById[item.id]
    const tone = c?.tone || '#bae6fd'
    const textColor = contrastTextColor(tone)
    return (
      <span
        className={`inline-flex flex-col items-center rounded-md border border-slate-300/50 ${box}`}
        style={{
          background: c?.liquid
            ? `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, ${tone}99 100%)`
            : tone,
          color: textColor,
        }}
        title={c?.name}
      >
        <span className="font-mono font-bold leading-tight">{c?.formula?.slice(0, 6) || '?'}</span>
      </span>
    )
  }

  const symbol = typeof item === 'string' ? item : item?.symbol
  const el = elementBySymbol[symbol]
  if (!el) return <span className="text-slate-900">?</span>

  const textColor = contrastTextColor(el.color)
  return (
    <span
      className={`inline-flex flex-col items-center rounded-md border border-slate-300/40 ${box}`}
      style={{ background: el.color, color: textColor }}
      title={el.name}
    >
      <span className="font-bold">{symbol}</span>
    </span>
  )
}
