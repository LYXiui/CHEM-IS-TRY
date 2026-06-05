import { manualReactions } from './manualReactions.js'
import { generatedElementReactions } from './generated/elementReactions.js'

/** 自動生成 + 手動反應（手動優先） */
export const reactions = {
  ...generatedElementReactions,
  ...manualReactions,
}

export const imaginationHints = [
  { match: ['Au', 'Fe'], text: '金與鐵不易直接化合 — 試金屬＋硝酸或加熱氧化？' },
  { match: ['He', 'O'], text: '惰性氣體幾乎不反應…' },
  { match: ['Na', 'K'], text: '兩種鹼金屬極危險，僅限模擬！' },
]

export function reactionKey(items) {
  const parts = items.map((item) => {
    if (typeof item === 'string') return item.startsWith('c:') ? item : item
    if (item?.type === 'compound') return `c:${item.id}`
    return item?.symbol || item
  })
  return [...new Set(parts)].sort().join('+')
}

export function findImagination(items) {
  const symbols = items.map((i) =>
    typeof i === 'string' ? i.replace(/^c:/, '') : i.symbol || i.id,
  )
  const set = new Set(symbols)
  for (const item of imaginationHints) {
    if (item.match.every((s) => set.has(s))) return item.text
  }
  if (items.length >= 5) return '試劑過多 — 先從試劑架選 2～3 種常見酸鹼鹽'
  return null
}

export function getReaction(items, mode = 'mix') {
  const key = reactionKey(items)
  const r = reactions[key]
  if (!r) return null
  if (mode === 'burn') {
    if (r.type === 'burn') return r
    if (r.alsoBurn) {
      return {
        ...r,
        phenomenon: r.burnPhenomenon || r.phenomenon,
        effects: r.burnEffects || r.effects,
      }
    }
    return null
  }
  if (r.type === 'burn') return null
  return r
}
