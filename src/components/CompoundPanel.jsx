import { hazardLabel } from '../data/compounds'

function CompoundRow({ c, open, onUse }) {
  return (
    <li
      className={`p-2 rounded-lg border transition ${
        open ? 'bg-emerald-50/90 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-55'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono font-bold text-sm">{open ? c.formula : '???'}</span>
          <span className="mx-1 text-sm">{open ? c.name : '未合成'}</span>
          {c.hazard && open && (
            <span className="text-[10px] px-1 rounded bg-red-100 text-red-700 ml-1">
              {hazardLabel[c.hazard]}
            </span>
          )}
          {open && <span className="text-xs text-slate-500 block mt-0.5">{c.desc}</span>}
        </div>
        {open && (
          <button
            type="button"
            onClick={() => onUse(c.id)}
            className="shrink-0 text-xs px-2 py-1 rounded-md bg-teal-700 text-white hover:bg-teal-600"
          >
            加入
          </button>
        )}
      </div>
    </li>
  )
}

export default function CompoundPanel({
  compounds,
  stockCompounds,
  unlocked,
  onUseCompound,
  synthesisUnlocked,
  synthesisTotal,
}) {
  const synthesis = compounds.filter((c) => !c.stock)

  return (
    <div className="chem-card p-3">
      <h2 className="text-sm font-bold text-teal-900 mb-1">📖 合成化合物圖鑑</h2>
      <p className="text-xs text-teal-800/70 mb-2">
        反應解鎖 {synthesisUnlocked}/{synthesisTotal} · 試劑架 {stockCompounds.length} 種免解鎖
      </p>
      <ul className="space-y-2 max-h-[280px] overflow-y-auto text-sm">
        {synthesis.map((c) => (
          <CompoundRow key={c.id} c={c} open={unlocked.includes(c.id)} onUse={onUseCompound} />
        ))}
      </ul>
    </div>
  )
}
