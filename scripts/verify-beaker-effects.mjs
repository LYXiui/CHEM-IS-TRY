/**
 * 驗證燒杯內氣體／沉澱／冒泡反應的 effects 與引導資料
 * 對照 docs/專題演示講稿與實驗示範.txt
 */
import { getReaction, reactionKey } from '../src/data/reactions.js'
import { buildGasGuide } from '../src/utils/reactionAnim.js'

const DEMO_REACTIONS = [
  { name: '示範1 Mg+O 燃燒', items: ['Mg', 'O'], mode: 'burn', need: ['flame'] },
  { name: '示範2 Zn+HCl', items: ['Zn', { type: 'compound', id: 'hcl' }], mode: 'mix', need: ['bubble'] },
  { name: '示範3 AgNO₃+NaCl', items: [{ type: 'compound', id: 'agno3' }, { type: 'compound', id: 'nacl_aq' }], mode: 'mix', need: ['precipitate'] },
  { name: '示範4 NaOH+CuSO₄', items: [{ type: 'compound', id: 'naoh' }, { type: 'compound', id: 'cuso4_aq' }], mode: 'mix', need: ['precipitate'] },
  { name: '示範5 H₂O₂+MnO₂', items: [{ type: 'compound', id: 'h2o2_aq' }, { type: 'compound', id: 'mno2' }], mode: 'mix', need: ['bubble'] },
  { name: '加碼 CaCO₃ 分解', items: [{ type: 'compound', id: 'caco3' }], mode: 'mix', need: ['gas'] },
  { name: '加碼 KMnO₄+H₂O₂', items: [{ type: 'compound', id: 'kmno4_aq' }, { type: 'compound', id: 'h2o2_aq' }], mode: 'mix', need: ['bubble'] },
  { name: '加碼 Zn+Cl₂', items: ['Zn', 'Cl'], mode: 'mix', need: ['precipitate', 'gas'] },
]

let ok = 0
let warn = 0
let fail = 0

console.log('CHEM-IS-TRY 燒杯現象動畫驗證\n')

for (const row of DEMO_REACTIONS) {
  const key = reactionKey(row.items)
  const r = getReaction(row.items, row.mode)
  if (!r?.compoundId) {
    console.log(`✗ ${row.name} — 無反應（鍵 ${key}）`)
    fail++
    continue
  }
  const fx = r.effects || []
  const missing = row.need.filter((e) => !fx.includes(e))
  if (missing.length) {
    console.log(`✗ ${row.name} — 缺少 effects: ${missing.join(', ')}（現有 ${fx.join(', ') || '無'}）`)
    fail++
    continue
  }
  const hasGasFx = fx.includes('gas') || fx.includes('bubble')
  const guide = buildGasGuide({ effects: fx, imagination: r.imagination, phenomenon: r.phenomenon })
  if (hasGasFx && !guide) {
    console.log(`✗ ${row.name} — 氣體／冒泡但無 gasGuide`)
    fail++
    continue
  }
  if (hasGasFx && !r.imagination && !guide?.gasLabel) {
    console.log(`△ ${row.name} — 通過但建議補 imagination`)
    warn++
  } else {
    console.log(`✓ ${row.name} → ${r.compoundId}${hasGasFx ? `（${guide.gasLabel}）` : ''}`)
  }
  ok++
}

console.log(`\n演示反應：通過 ${ok}、警告 ${warn}、失敗 ${fail}`)
process.exit(fail > 0 ? 1 : 0)
