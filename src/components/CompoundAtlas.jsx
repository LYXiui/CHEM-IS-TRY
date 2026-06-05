import { getHintCompounds } from '../utils/compoundHints'
import { stockCompounds } from '../data/compounds'

function MiniCard({ item, locked, onUse, onContextMenu }) {
  return (
    <div
      className={`atlas-card ${locked ? 'locked' : ''}`}
      onContextMenu={(e) =>
        onContextMenu(e, locked ? '未解鎖' : item.name, locked ? '完成對應反應後解鎖' : item.desc)
      }
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <div
            className="w-8 h-10 rounded-md border border-white/20 mb-1"
            style={{
              background: item.liquid
                ? `linear-gradient(180deg, transparent 20%, ${item.tone} 100%)`
                : item.tone,
            }}
          />
          <p className="font-mono text-xs font-bold text-cyan-200">{locked ? '???' : item.formula}</p>
          <p className="text-[10px] text-slate-400">{locked ? '待解鎖' : item.name}</p>
        </div>
        {!locked && onUse && (
          <button
            type="button"
            onClick={() => onUse(item.id)}
            className="text-[10px] px-2 py-1 rounded bg-cyan-600/80 text-white hover:bg-cyan-500"
          >
            倒入
          </button>
        )}
      </div>
    </div>
  )
}

export default function CompoundAtlas({
  hintElement,
  compounds,
  unlocked,
  onUseCompound,
  onContextMenu,
}) {
  const stockIds = stockCompounds.map((c) => c.id)
  const hints = getHintCompounds(hintElement, compounds, unlocked, stockIds)

  return (
    <section className="game-panel p-4">
      <h2 className="game-panel-title mb-2">合成圖鑑</h2>
      {hintElement ? (
        <>
          <p className="text-xs text-slate-400 mb-3">
            選取中的元素：<span className="text-amber-300 font-bold">{hintElement}</span>
          </p>
          <div className="grid gap-2 max-h-[360px] overflow-y-auto pr-1">
            {hints.length === 0 ? (
              <p className="text-xs text-slate-500">此元素暫無預設合成路徑。</p>
            ) : (
              hints.map((c) => (
                <MiniCard
                  key={c.id}
                  item={c}
                  locked={!c.unlocked}
                  onUse={c.unlocked ? onUseCompound : undefined}
                  onContextMenu={onContextMenu}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-400">請在週期表點選元素，以顯示可能合成的化合物。</p>
      )}
    </section>
  )
}
