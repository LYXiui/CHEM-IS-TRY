import { compoundById } from '../data/compounds'

/** 依週期表首選元素，列出可能透過反應解鎖的化合物 */
export function getHintCompounds(symbol, compounds, unlocked, stockIds) {
  if (!symbol) return []
  const stockSet = new Set(stockIds)
  return compounds
    .filter((c) => !c.stock && c.elements?.includes(symbol))
    .map((c) => ({
      ...c,
      unlocked: unlocked.includes(c.id),
      matchCount: c.elements.filter((e) => e === symbol).length,
    }))
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? 1 : -1
      return b.matchCount - a.matchCount
    })
}

export function getUsableStock(stockCompounds) {
  return stockCompounds
}
