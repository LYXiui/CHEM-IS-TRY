import { reactionCatalog } from '../src/data/reactionCatalog.js'
import { getReaction, reactionKey } from '../src/data/reactions.js'

let ok = 0
let skip = 0
let fail = 0

console.log('CHEM-IS-TRY 反應鍵驗證\n')

for (const row of reactionCatalog) {
  if (!row.items) {
    console.log(`△ [${row.cat}] ${row.name} — ${row.note || '略過'}`)
    skip++
    continue
  }
  const key = reactionKey(row.items)
  const r = getReaction(row.items, row.mode)
  const reactOk = !!r?.compoundId
  if (reactOk) {
    console.log(`✓ [${row.cat}] ${row.name} → ${r.compoundId}${row.needsLamp ? '（需酒精燈）' : row.mode === 'burn' ? '（需火柴）' : ''}`)
    ok++
  } else {
    console.log(`✗ [${row.cat}] ${row.name}`)
    console.log(`    鍵 ${key}；getReaction=${reactOk ? r.compoundId : 'null'}`)
    fail++
  }
}

console.log(`\n合計：通過 ${ok}、略過 ${skip}、失敗 ${fail}`)
process.exit(fail > 0 ? 1 : 0)
