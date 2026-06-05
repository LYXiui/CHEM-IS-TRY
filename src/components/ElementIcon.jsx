import { compoundById } from '../data/compounds'
import { elementBySymbol } from '../data/elements'

export default function ElementIcon({ item, size = 'md' }) {
  const box = size === 'sm' ? 'text-[10px] px-1 py-0.5' : 'text-sm px-2 py-1'

  if (item?.type === 'compound') {
    const c = compoundById[item.id]
    return (
      <span
        className={`inline-flex flex-col items-center rounded-md border border-cyan-400/40 ${box}`}
        style={{
          background: c?.liquid
            ? `linear-gradient(180deg, transparent, ${c?.tone || '#0ea5e9'}88)`
            : c?.tone || '#134e4a',
        }}
        title={c?.name}
      >
        <span className="font-mono font-bold text-white leading-tight">{c?.formula?.slice(0, 6) || '?'}</span>
      </span>
    )
  }

  const symbol = typeof item === 'string' ? item : item?.symbol
  const el = elementBySymbol[symbol]
  if (!el) return <span>?</span>

  return (
    <span
      className={`inline-flex flex-col items-center rounded-md border border-white/20 ${box}`}
      style={{ background: el.color }}
      title={el.name}
    >
      <span className="font-bold text-slate-900">{symbol}</span>
    </span>
  )
}
