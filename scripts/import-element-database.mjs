import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import { elements, elementBySymbol } from '../src/data/elements.js'
import { compounds, compoundById, stockCompounds } from '../src/data/compounds.js'
import { reactions, imaginationHints } from '../src/data/reactions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const xlsxPath = path.join(root, 'docs', '118_Elements_Reaction_Database_Filled_v1.xlsx')
const outTxt = path.join(root, 'docs', '118元素反應資料庫一覽.txt')

const stockIds = new Set(stockCompounds.map((c) => c.id))

const ZH = {
  'Nonmetal/Metalloid': '非金屬／類金屬',
  'Noble Gas': '稀有氣體',
  'Alkali Metal': '鹼金屬',
  'Alkaline Earth Metal': '鹼土金屬',
  'Transition Metal': '過渡金屬',
  'Post-transition Metal': '主族金屬',
  Metalloid: '類金屬',
  Nonmetal: '非金屬',
  Halogen: '鹵素',
  Lanthanide: '鑭系元素',
  Actinide: '錒系元素',
  'No significant reaction': '無明顯反應',
  'Little or no reaction at room temperature': '室溫幾乎不反應',
  'Burns in oxygen': '在氧氣中燃燒',
  'Forms oxides': '生成氧化物',
  'Forms oxides under suitable conditions': '適當條件下生成氧化物',
  'Forms halides': '生成鹵化物',
  'Rapid oxidation': '迅速氧化',
  'Reacts vigorously': '劇烈反應',
  'Reacts with dilute acids': '與稀酸反應',
  'Usually weak/no reaction': '通常微弱或無反應',
  Variable: '視條件而定',
  'Rare/none': '極少或無',
  'Depends on acid': '視酸種而定',
  'None/minor': '無或微量',
  None: '無',
  Oxides: '氧化物',
  'Metal oxides/peroxides': '金屬氧化物／過氧化物',
  'Hydroxide + H2': '氫氧化物 + H₂',
  'Salt + H2': '鹽 + H₂',
  'Halide compounds': '鹵化物',
  'Slow oxidation': '緩慢氧化',
  'Reacts slowly': '緩慢反應',
  'Reacts with hot water/steam': '與熱水或蒸氣反應',
  'Dissolves in acids': '溶於酸',
  'No reaction': '不反應',
  'Highly reactive': '高度活潑',
  'Forms hydrides': '生成氫化物',
  'Combustion possible': '可燃燒',
}

function zh(text) {
  if (!text) return ''
  const s = String(text).trim()
  return ZH[s] || s
}

function parseKey(key) {
  return key.split('+').map((p) => (p.startsWith('c:') ? { kind: 'compound', id: p.slice(2) } : { kind: 'element', symbol: p }))
}

function buildProjectIndex() {
  const byElement = Object.fromEntries(
    elements.map((e) => [e.symbol, { direct: [], viaCompound: [], stock: [], unlock: [] }]),
  )

  for (const c of compounds) {
    for (const sym of c.elements || []) {
      if (!byElement[sym]) continue
      if (stockIds.has(c.id)) {
        byElement[sym].stock.push(`${c.formula}（${c.name}）`)
      } else {
        byElement[sym].unlock.push(`${c.formula}`)
      }
    }
  }

  for (const [key, r] of Object.entries(reactions)) {
    const parts = parseKey(key)
    const prod = compoundById[r.compoundId]
    const prodF = prod ? prod.formula : r.compoundId
    const modes = []
    if (r.type === 'burn') modes.push('燃燒')
    else modes.push('混合')
    if (r.needsHeat) modes.push('需酒精燈')
    const line = `${key} → ${prodF}（${r.phenomenon}）[${modes.join('·')}]`

    for (const p of parts.filter((x) => x.kind === 'element')) {
      if (byElement[p.symbol]) byElement[p.symbol].direct.push(line)
    }
    for (const cid of parts.filter((x) => x.kind === 'compound').map((x) => x.id)) {
      const c = compoundById[cid]
      if (!c?.elements) continue
      for (const sym of c.elements) {
        if (byElement[sym] && !parts.some((x) => x.kind === 'element' && x.symbol === sym)) {
          byElement[sym].viaCompound.push(`試劑 ${c.formula}：${line}`)
        }
      }
    }
  }

  return byElement
}

function resolveSymbol(raw, numToSym) {
  const m = String(raw || '').match(/^E(\d+)$/)
  if (m) return numToSym[parseInt(m[1], 10)] || raw
  return raw
}

function sheetToMap(wb, name, reactionKey, productKey, numToSym) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name])
  const map = {}
  for (const row of rows) {
    if (!row.Symbol) continue
    const sym = resolveSymbol(row.Symbol, numToSym)
    map[sym] = {
      reaction: row[reactionKey] ?? '',
      products: row[productKey] ?? '',
    }
  }
  return map
}

function loadDatabase() {
  const wb = XLSX.readFile(xlsxPath)
  const numToSym = Object.fromEntries(elements.map((e) => [e.number, e.symbol]))
  const basic = XLSX.utils.sheet_to_json(wb.Sheets.Elements_Basic)
  const air = sheetToMap(wb, 'Air_Reactions', 'ReactionWithAir', 'TypicalProducts', numToSym)
  const water = sheetToMap(wb, 'Water_Reactions', 'ReactionWithWater', 'TypicalProducts', numToSym)
  const acid = sheetToMap(wb, 'Acid_Reactions', 'ReactionWithAcids', 'TypicalProducts', numToSym)
  const base = sheetToMap(wb, 'Base_Reactions', 'ReactionWithBases', 'TypicalProducts', numToSym)
  const ox = sheetToMap(wb, 'Oxidation_Combustion', 'OxidationBehavior', 'CombustionProducts', numToSym)
  const hal = sheetToMap(wb, 'Halogen_Reactions', 'ReactionWithHalogens', 'TypicalProducts', numToSym)

  return basic.map((row) => {
    const symbol = numToSym[row.AtomicNumber] || resolveSymbol(row.Symbol, numToSym)
    return {
      num: row.AtomicNumber,
      symbol,
      nameEn: row.Element,
      category: row.Category,
      oxidation: row.TypicalOxidationStates,
      air: air[symbol] || { reaction: '', products: '' },
      water: water[symbol] || { reaction: '', products: '' },
      acid: acid[symbol] || { reaction: '', products: '' },
      base: base[symbol] || { reaction: '', products: '' },
      oxidationRx: ox[symbol] || { reaction: '', products: '' },
      halogen: hal[symbol] || { reaction: '', products: '' },
    }
  })
}

function projectStatus(sym, proj) {
  const p = proj[sym]
  if (!p) return { mark: '✗', detail: '週期表無此元素' }
  const hasDirect = p.direct.length > 0
  const hasVia = p.viaCompound.length > 0
  const hasStock = p.stock.length > 0
  if (hasDirect) return { mark: '✓', detail: `網頁可模擬 ${p.direct.length} 組直接反應` }
  if (hasVia) return { mark: '△', detail: `可經試劑間接參與 ${p.viaCompound.length} 組` }
  if (hasStock) return { mark: '△', detail: '僅試劑架含此元素，尚無元素直接反應' }
  return { mark: '—', detail: '資料庫有記載，專案尚未內建' }
}

function pad2(s, n) {
  const str = String(s)
  return str + ' '.repeat(Math.max(0, n - str.length))
}

const db = loadDatabase()
const proj = buildProjectIndex()
const today = new Date().toISOString().slice(0, 10)

let simDirect = 0
let simVia = 0
let simNone = 0

const lines = [
  'CHEM-IS-TRY — 118 元素反應資料庫一覽',
  '================================================',
  `產生時間：${today}`,
  '資料來源：docs/118_Elements_Reaction_Database_Filled_v1.xlsx',
  '產生指令：npm run test:database',
  '',
  '圖例：',
  '  ✓ 專案可模擬（週期表直接觸發反應）',
  '  △ 可經試劑架／化合物間接參與',
  '  — 資料庫有記載，專案尚未內建',
  '',
  '欄位說明（每元素 6 類反應）：',
  '  · 與空氣　· 與水　· 與酸　· 與鹼　· 氧化／燃燒　· 與鹵素',
  '',
]

for (const row of db) {
  const el = elementBySymbol[row.symbol]
  const nameZh = el?.name || row.nameEn
  const st = projectStatus(row.symbol, proj)
  if (st.mark === '✓') simDirect++
  else if (st.mark === '△') simVia++
  else simNone++

  lines.push('────────────────────────────────────────')
  lines.push(
    `${row.symbol}　${nameZh}（${row.nameEn}）　原子序 ${row.num}　${st.mark} ${st.detail}`,
  )
  lines.push(`  分類：${zh(row.category)}　常見氧化態：${row.oxidation}`)
  lines.push('')
  lines.push(`  【與空氣】${zh(row.air.reaction)}`)
  lines.push(`    產物：${zh(row.air.products)}`)
  lines.push(`  【與水】${zh(row.water.reaction)}`)
  lines.push(`    產物：${zh(row.water.products)}`)
  lines.push(`  【與酸】${zh(row.acid.reaction)}`)
  lines.push(`    產物：${zh(row.acid.products)}`)
  lines.push(`  【與鹼】${zh(row.base.reaction)}`)
  lines.push(`    產物：${zh(row.base.products)}`)
  lines.push(`  【氧化／燃燒】${zh(row.oxidationRx.reaction)}`)
  lines.push(`    產物：${zh(row.oxidationRx.products)}`)
  lines.push(`  【與鹵素】${zh(row.halogen.reaction)}`)
  lines.push(`    產物：${zh(row.halogen.products)}`)

  const p = proj[row.symbol]
  if (p?.direct.length) {
    lines.push('  【專案已內建 — 直接反應】')
    p.direct.slice(0, 6).forEach((l) => lines.push(`    · ${l}`))
    if (p.direct.length > 6) lines.push(`    · …共 ${p.direct.length} 組`)
  }
  if (p?.stock.length) {
    lines.push('  【試劑架】')
    p.stock.slice(0, 5).forEach((s) => lines.push(`    · ${s}`))
    if (p.stock.length > 5) lines.push(`    · …共 ${p.stock.length} 種試劑`)
  }
  lines.push('')
}

lines.push('================================================')
lines.push('統計摘要')
lines.push(`  元素總數：${db.length}`)
lines.push(`  ✓ 可直接模擬：${simDirect}`)
lines.push(`  △ 間接／試劑：${simVia}`)
lines.push(`  — 尚未內建：${simNone}`)
lines.push(`  專案反應鍵：${Object.keys(reactions).length} 組`)
lines.push('')
lines.push('工作表對照：')
lines.push('  Elements_Basic → 分類、氧化態')
lines.push('  Air_Reactions → 與空氣')
lines.push('  Water_Reactions → 與水')
lines.push('  Acid_Reactions → 與酸')
lines.push('  Base_Reactions → 與鹼')
lines.push('  Oxidation_Combustion → 氧化／燃燒')
lines.push('  Halogen_Reactions → 與鹵素')

fs.writeFileSync(outTxt, lines.join('\n'), 'utf8')
console.log(`已寫入 ${outTxt}`)
console.log(`✓ ${simDirect}　△ ${simVia}　— ${simNone}`)
