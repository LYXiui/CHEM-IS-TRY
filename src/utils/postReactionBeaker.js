import { compoundById } from '../data/compounds.js'

/** 反應放氣時，主產物 id 對應的氣體產物（供自動保留） */
const GAS_FROM_PRODUCT = {
  zncl2: 'h2',
  cacl2_aq: 'co2',
  co2: 'co2',
  kcl: 'o2',
  h2o: 'o2',
  nh3: 'nh3',
  so2: 'so2',
  ch4: 'ch4',
  h2: 'h2',
  o2: 'o2',
}

function inferGasId(r) {
  if (r.gasProduct) return r.gasProduct
  const c = compoundById[r.compoundId]
  if (c?.gas) return r.compoundId
  const fx = r.effects || []
  if (!fx.includes('gas')) return null
  return GAS_FROM_PRODUCT[r.compoundId] || null
}

function pushUnique(beaker, item) {
  const key = item.type === 'compound' ? `c:${item.id}` : item.symbol
  if (beaker.some((x) => (x.type === 'compound' ? `c:${x.id}` : x.symbol) === key)) return
  beaker.push(item)
}

/**
 * 反應結束後燒杯內應保留的物質（供火柴檢驗、通入石灰水、再混合等）
 * @returns {{ items: object[], needsBeaker: boolean }}
 */
export function buildPostReactionBeaker(r, mode, snapItems = []) {
  if (r.residue?.length) {
    const items = r.residue.map((x) => ({ ...x }))
    const needsBeaker =
      items.some((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
      || snapItems.some((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
    return { items, needsBeaker }
  }

  if (mode === 'matchTest') {
    return { items: [], needsBeaker: false }
  }

  if (r.observeOnly) {
    return { items: [], needsBeaker: false }
  }

  const fx = r.effects || []
  const c = compoundById[r.compoundId]
  if (!c) return { items: [], needsBeaker: false }

  const hadLiquid = snapItems.some(
    (x) => x.type === 'compound' && compoundById[x.id]?.liquid,
  )
  const items = []

  const gasId = inferGasId(r)
  if (gasId) pushUnique(items, { type: 'compound', id: gasId })

  // 氣相反應生成液態產物（如 H₂+Cl₂→HCl↑ 潮解為鹽酸）
  if (!gasId && fx.includes('gas') && c.liquid) {
    pushUnique(items, { type: 'compound', id: r.compoundId })
  }

  if (fx.includes('precipitate') && !c.liquid) {
    pushUnique(items, { type: 'compound', id: r.compoundId })
  }

  if (c.liquid && (hadLiquid || fx.includes('liquid') || fx.includes('colorChange'))) {
    pushUnique(items, { type: 'compound', id: r.compoundId })
  }

  if (mode === 'burn' && !c.gas && !c.liquid) {
    pushUnique(items, { type: 'compound', id: r.compoundId })
  }

  if (
    snapItems.some((x) => x.type === 'compound' && x.id === 'caco3')
    && (gasId === 'co2' || r.compoundId === 'co2')
  ) {
    pushUnique(items, { type: 'compound', id: 'cao' })
  }

  if (fx.includes('gas') && fx.includes('bubble') && !gasId && r.compoundId === 'h2') {
    pushUnique(items, { type: 'compound', id: 'h2' })
  }

  const ambientGasPhase =
    !hadLiquid
    && fx.includes('gas')
    && items.length > 0
    && items.every((x) => {
      if (x.type !== 'compound') return false
      const comp = compoundById[x.id]
      return comp?.gas || comp?.liquid
    })

  const needsBeaker =
    !ambientGasPhase
    && (hadLiquid || items.some((x) => x.type === 'compound' && compoundById[x.id]?.liquid))

  return { items, needsBeaker }
}
