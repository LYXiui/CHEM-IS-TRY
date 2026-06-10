/**
 * 驗證所有反應的燒杯動畫資料：沉澱色、變色、氣體提示
 */
import { reactions, getReaction, reactionKey } from '../src/data/reactions.js'
import { reactionCatalog } from '../src/data/reactionCatalog.js'
import {
  effectsToAnimation,
  resolveBeakerVisuals,
  resolveEffectColor,
} from '../src/utils/reactionAnim.js'

let ok = 0
let warn = 0
let fail = 0

console.log('CHEM-IS-TRY 反應視覺動畫全面驗證\n')

for (const [key, r] of Object.entries(reactions)) {
  const fx = r.effects || []
  if (!fx.length) continue

  const needsColor = fx.includes('colorChange') || fx.includes('precipitate')
  const needsGas = fx.includes('gas') || fx.includes('bubble')
  const color = resolveEffectColor(fx, r.effectColor, r.compoundId)

  if (needsColor && !color) {
    console.log(`✗ ${key} — 缺少 effectColor／產物色`)
    fail++
    continue
  }

  const anim = effectsToAnimation(fx, r.effectColor, 4000, {
    compoundId: r.compoundId,
    imagination: r.imagination,
    phenomenon: r.phenomenon,
  })

  if (needsGas && !anim.gasGuide) {
    console.log(`✗ ${key} — 氣體／冒泡缺少 gasGuide`)
    fail++
    continue
  }

  if (fx.includes('precipitate') && !anim.hasPrecipitate) {
    console.log(`✗ ${key} — 沉澱旗標未設定`)
    fail++
    continue
  }

  if (fx.includes('colorChange') && !anim.hasColorChange) {
    console.log(`✗ ${key} — 變色旗標未設定`)
    fail++
    continue
  }

  const mockBeaker = key.includes('c:cuso4') ? [{ type: 'compound', id: 'cuso4_aq' }] : []
  const visuals = resolveBeakerVisuals(anim, mockBeaker)
  if (fx.includes('colorChange') && visuals && visuals.liquidFrom === visuals.liquidTo && !r.effectColor) {
    console.log(`△ ${key} — 變色前後色相同（已用產物色 ${color}）`)
    warn++
  }

  ok++
}

console.log(`\n含現象反應：通過 ${ok}、警告 ${warn}、失敗 ${fail}`)

console.log('\n── 反應目錄抽樣 ──\n')
let catOk = 0
let catFail = 0
for (const row of reactionCatalog) {
  if (!row.items) continue
  const r = reactions[reactionKey(row.items)] || null
  const got = getReaction(row.items, row.mode)
  if (!got?.compoundId) {
    console.log(`✗ [${row.cat}] ${row.name}`)
    catFail++
    continue
  }
  const fx = got.effects || []
  const anim = effectsToAnimation(fx, got.effectColor, 3000, {
    compoundId: got.compoundId,
    imagination: got.imagination,
    phenomenon: got.phenomenon,
  })
  const parts = []
  if (fx.includes('precipitate')) parts.push(`沉澱 ${anim.color}`)
  if (fx.includes('colorChange')) parts.push('變色')
  if (fx.includes('bubble') || fx.includes('gas')) parts.push(anim.gasGuide?.gasLabel || '氣體')
  console.log(`✓ [${row.cat}] ${row.name} → ${parts.join('、') || fx.join(',')}`)
  catOk++
}

console.log(`\n目錄反應：通過 ${catOk}、失敗 ${catFail}`)
process.exit(fail + catFail > 0 ? 1 : 0)
