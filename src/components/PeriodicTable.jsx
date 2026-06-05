import { elementBySymbol, getElementIntro } from '../data/elements'
import { CATEGORY_STYLE, PT_COLS, periodicRows } from '../data/periodicLayout'

export default function PeriodicTable({
  onSelect,
  selected,
  hintElement,
  onHintChange,
  onContextMenu,
}) {
  const inBeaker = (symbol) =>
    selected?.some(
      (item) =>
        (typeof item === 'string' ? item : item.type === 'element' ? item.symbol : null) === symbol,
    )

  const handleClick = (symbol) => {
    onHintChange?.(symbol)
    onSelect(symbol)
  }

  return (
    <section className="game-panel p-4 overflow-x-auto">
      <h2 className="game-panel-title mb-3">週期表</h2>
      <div
        className="inline-grid gap-[3px] min-w-[640px]"
        style={{ gridTemplateColumns: `repeat(${PT_COLS}, minmax(2rem, 1fr))` }}
      >
        {periodicRows.map(({ row, cells }) => (
          <div key={row} className="contents">
            {cells.map((symbol, col) => {
              if (!symbol) {
                if ((row === 5 || row === 6) && col === 2)
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="pt-f-label pt-gap"
                      title={row === 5 ? '鑭系' : '錒系'}
                    >
                      {row === 5 ? '57–71' : '89–103'}
                    </div>
                  )
                return <div key={`${row}-${col}`} className="pt-gap" />
              }
              const el = elementBySymbol[symbol]
              if (!el) return <div key={`${row}-${col}`} className="pt-gap" />
              const style = CATEGORY_STYLE[el.category] || CATEGORY_STYLE.nonmetal
              const active = inBeaker(symbol)
              const isHint = hintElement === symbol
              return (
                <button
                  key={`${row}-${col}-${symbol}`}
                  type="button"
                  onClick={() => handleClick(symbol)}
                  onContextMenu={(e) => onContextMenu(e, el.name, getElementIntro(el))}
                  className={`pt-cell flex flex-col items-center justify-center p-0.5 ${active ? 'pt-active' : ''} ${isHint ? 'pt-hint-anchor' : ''}`}
                  style={{ background: style.bg, borderColor: style.border }}
                  title={el.name}
                >
                  <span className="text-[8px] text-slate-700/80 leading-none">{el.number}</span>
                  <span className="text-[11px] font-bold text-slate-900 leading-tight">{symbol}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
