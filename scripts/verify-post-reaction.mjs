import { reactions } from '../src/data/reactions.js'
import { manualReactions } from '../src/data/manualReactions.js'
import { compoundById } from '../src/data/compounds.js'
import { buildPostReactionBeaker } from '../src/utils/postReactionBeaker.js'
import { reactionCatalog } from '../src/data/reactionCatalog.js'
import { getReaction } from '../src/data/reactions.js'

function snapFromKey(key) {
  return key.split('+').map((part) => {
    if (part.startsWith('c:')) return { type: 'compound', id: part.slice(2) }
    return { type: 'element', symbol: part }
  })
}

function shouldRetain(r) {
  if (r.observeOnly || r.type === 'matchTest') return false
  if (r.residue?.length) return true
  if (r.verificationKind === 'limewater') return true
  const fx = r.effects || []
  const c = compoundById[r.compoundId]
  if (!c) return false
  if (c.gas) return true
  if (fx.includes('gas')) return true
  if (fx.includes('precipitate') && !c.liquid) return true
  if (c.liquid && (fx.includes('liquid') || fx.includes('colorChange'))) return true
  if (r.type === 'burn' && !c.gas && !c.liquid) return true
  if (fx.includes('bubble') && c.id === 'h2') return true
  return false
}

function checkReaction(key, r, label = '') {
  const snap = snapFromKey(key)
  const mode = r.type === 'burn' ? 'burn' : 'mix'
  let { items } = buildPostReactionBeaker(r, mode, snap)
  if (!items.length && r.alsoBurn && mode === 'mix') {
    const burnR = {
      ...r,
      effects: r.burnEffects || r.effects,
    }
    items = buildPostReactionBeaker(burnR, 'burn', snap).items
  }
  return { key, label, mode, r, items, should: shouldRetain(r) }
}

console.log('CHEM-IS-TRY 產物保留驗證\n')

/* 1. 全庫掃描 */
const gaps = []
let ok = 0
let skip = 0
for (const [key, r] of Object.entries(reactions)) {
  const { items, should } = checkReaction(key, r)
  if (!should) { skip++; continue }
  if (items.length) ok++
  else gaps.push({ key, compoundId: r.compoundId, effects: r.effects, source: 'all' })
}

console.log(`[全庫] 應保留：${ok + gaps.length}，通過 ${ok}，缺失 ${gaps.length}，略過 ${skip}`)

/* 2. 手動反應逐條 */
const manualGaps = []
for (const [key, r] of Object.entries(manualReactions)) {
  const { items, should } = checkReaction(key, r, 'manual')
  if (!should) continue
  if (!items.length) manualGaps.push({ key, compoundId: r.compoundId, effects: r.effects, residue: r.residue })
}

console.log(`[手動] 應保留 ${Object.values(manualReactions).filter(shouldRetain).length}，缺失 ${manualGaps.length}`)

/* 3. 目錄對照（課堂示範反應） */
const catalogGaps = []
for (const row of reactionCatalog) {
  if (!row.items || row.mode === 'matchTest') continue
  const r = getReaction(row.items, row.mode)
  if (!r) continue
  const key = row.key || Object.keys(reactions).find((k) => k === row.key)
  const { items } = checkReaction(key, r)
  if (shouldRetain(r) && !items.length) {
    catalogGaps.push({ name: row.name, key: row.key, compoundId: r.compoundId, effects: r.effects })
  }
}

console.log(`[目錄] 缺失 ${catalogGaps.length}\n`)

const allGaps = [...gaps, ...manualGaps.map((g) => ({ ...g, source: 'manual' }))]
const unique = [...new Map(allGaps.map((g) => [g.key, g])).values()]

if (unique.length) {
  console.log('--- 缺失產物保留 ---')
  for (const g of unique) {
    console.log(`✗ ${g.key}`)
    console.log(`    產物 ${g.compoundId}，effects=${JSON.stringify(g.effects)}${g.residue ? `，residue=${JSON.stringify(g.residue)}` : ''}`)
  }
}

if (catalogGaps.length) {
  console.log('\n--- 目錄示範反應缺失 ---')
  for (const g of catalogGaps) {
    console.log(`✗ ${g.name} (${g.key})`)
  }
}

process.exit(unique.length || catalogGaps.length ? 1 : 0)
