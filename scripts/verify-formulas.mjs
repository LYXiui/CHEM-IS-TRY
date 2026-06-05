import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { formulaCatalog } from '../src/data/formulaCatalog.js'
import { compoundById, stockCompounds } from '../src/data/compounds.js'
import { compounds } from '../src/data/compounds.js'
import { reactions } from '../src/data/reactions.js'
import { elementBySymbol } from '../src/data/elements.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outTxt = path.join(root, 'docs', '可展示化學式一覽.txt')

const stockIds = new Set(stockCompounds.map((c) => c.id))
const productIds = new Set(Object.values(reactions).map((r) => r.compoundId))

function evaluate(entry) {
  if (entry.element) {
    const el = elementBySymbol[entry.element]
    if (!el) return { status: '✗', detail: '週期表無此元素' }
    const needBeaker = el.state === 'liquid' ? '；液態需燒杯' : ''
    return { status: '✓', detail: `週期表可選${needBeaker}` }
  }
  if (!entry.id) return { status: '△', detail: '尚未內建為試劑／產物' }
  const c = compoundById[entry.id]
  if (!c) return { status: '✗', detail: `id ${entry.id} 不存在於 compounds.js` }
  const parts = []
  if (stockIds.has(entry.id)) {
    parts.push(c.liquid ? '試劑架（液體→須燒杯）' : '試劑架')
  } else if (productIds.has(entry.id)) {
    parts.push('反應可解鎖')
  } else {
    parts.push('有資料但未接反應')
  }
  return { status: parts[0].includes('未接') ? '△' : '✓', detail: parts.join('；') }
}

const lines = [
  'CHEM-IS-TRY — 可展示化學式一覽（自動產生）',
  '================================================',
  `產生時間：${new Date().toISOString().slice(0, 10)}`,
  '資料來源：docbrown.info、chem.fsu.edu、Pearson、Shiksha Class 10、專案 compounds/reactions',
  '驗證：npm run test:formulas',
  '',
  '圖例：✓ 專案可用　△ 僅參考未實作　✗ 資料錯誤',
  '液體規則：所有 liquid 試劑與 Br、Hg 等液態元素須先放置燒杯',
  '',
]

let ok = 0
let partial = 0
let bad = 0
const byCat = {}

for (const entry of formulaCatalog) {
  const { status, detail } = evaluate(entry)
  if (status === '✓') ok++
  else if (status === '△') partial++
  else bad++
  if (!byCat[entry.category]) byCat[entry.category] = []
  const note = entry.note ? `（${entry.note}）` : ''
  byCat[entry.category].push(
    `${status}  ${entry.formula.padEnd(14)}  ${entry.name.padEnd(12)}  ${detail}${note}`,
  )
}

for (const [cat, rows] of Object.entries(byCat)) {
  lines.push(`【${cat}】`)
  lines.push(...rows)
  lines.push('')
}

lines.push('────────────────────────────────────────')
lines.push(`統計：可用 ${ok}、參考未實作 ${partial}、錯誤 ${bad}；專案化合物 ${compounds.length} 種`)
lines.push(`內建反應鍵：${Object.keys(reactions).length} 組`)
lines.push('')
lines.push('網站參考：')
lines.push('- https://www.docbrown.info/page03/AcidsBasesSalts08.htm')
lines.push('- https://www.chem.fsu.edu/chemlab/chm1045/reactions2.html')
lines.push('- https://www.pearson.com/channels/general-chemistry/study-guides/reactions-in-aqueous-solutions-electrolytes-precipitation-acids')
lines.push('- https://shikshanation.com/blog/complete-class-10-chemistry-formulas/')

fs.writeFileSync(outTxt, lines.join('\n'), 'utf8')

console.log(`已寫入 ${outTxt}\n`)
console.log(`統計：✓ ${ok}　△ ${partial}　✗ ${bad}`)
if (bad > 0) process.exit(1)
