import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { elements } from '../src/data/elements.js'
import { compounds, compoundById, stockCompounds } from '../src/data/compounds.js'
import { reactions, imaginationHints } from '../src/data/reactions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outTxt = path.join(__dirname, '..', 'docs', '元素可參與反應一覽.txt')

const stockIds = new Set(stockCompounds.map((c) => c.id))

function parseKey(key) {
  return key.split('+').map((p) => (p.startsWith('c:') ? { kind: 'compound', id: p.slice(2) } : { kind: 'element', symbol: p }))
}

function formatReactionLine(key, r) {
  const prod = compoundById[r.compoundId]
  const modes = []
  if (r.type === 'burn') modes.push('燃燒')
  else modes.push('混合')
  if (r.alsoBurn) modes.push('亦可燃燒')
  if (r.needsHeat) modes.push('需酒精燈')
  if (r.type === 'burn' || r.alsoBurn) modes.push('燃燒需火柴')
  const prodF = prod ? `${prod.formula}（${prod.name}）` : r.compoundId
  return `  · [${modes.join('·')}] ${key} → ${prodF}｜${r.phenomenon}`
}

function buildIndex() {
  const byElement = Object.fromEntries(elements.map((e) => [e.symbol, { direct: [], viaCompound: [], stock: [], unlock: [], hints: [] }]))

  for (const c of compounds) {
    for (const sym of c.elements || []) {
      if (!byElement[sym]) continue
      if (stockIds.has(c.id)) {
        byElement[sym].stock.push(`${c.formula}（${c.name}）試劑架${c.liquid ? '·液體需燒杯' : ''}`)
      } else {
        byElement[sym].unlock.push(`${c.formula}（${c.name}）`)
      }
    }
  }

  for (const [key, r] of Object.entries(reactions)) {
    const parts = parseKey(key)
    const line = formatReactionLine(key, r)
    const elemInKey = new Set(parts.filter((p) => p.kind === 'element').map((p) => p.symbol))
    const compoundIds = parts.filter((p) => p.kind === 'compound').map((p) => p.id)

    for (const sym of elemInKey) {
      if (byElement[sym]) byElement[sym].direct.push(line)
    }

    for (const cid of compoundIds) {
      const c = compoundById[cid]
      if (!c?.elements) continue
      for (const sym of c.elements) {
        if (byElement[sym] && !elemInKey.has(sym)) {
          const short = line.replace(/^\s+·\s*/, '')
          byElement[sym].viaCompound.push(`  · [試劑 ${c.formula}] ${short}`)
        }
      }
    }
  }

  for (const hint of imaginationHints) {
    for (const sym of hint.match) {
      if (byElement[sym]) byElement[sym].hints.push(`  · 提示：${hint.text}`)
    }
  }

  return byElement
}

const index = buildIndex()
const lines = [
  'CHEM-IS-TRY — 元素可參與反應一覽（118 種）',
  '================================================',
  `產生：${new Date().toISOString().slice(0, 10)}　指令：npm run test:elements`,
  `反應鍵總數：${Object.keys(reactions).length}`,
  '',
  '說明：',
  '  【直接參與】週期表選該元素，與其他元素或試劑組合可觸發',
  '  【經試劑】元素在試劑架化合物中，需傾倒試劑（液體須燒杯）',
  '  【試劑架】含該元素的庫存試劑',
  '  【可解鎖】反應產物或圖鑑化合物含該元素',
  '  — 無內建：尚未設計反應（多為稀有氣體、超重元素）',
  '',
]

let withAny = 0
let withDirect = 0
let without = 0

for (const el of elements) {
  const data = index[el.symbol]
  const hasDirect = data.direct.length > 0
  const has =
    hasDirect ||
    data.viaCompound.length > 0 ||
    data.stock.length > 0 ||
    data.hints.length > 0
  if (has) withAny++
  if (hasDirect) withDirect++
  if (!has) without++

  lines.push('────────────────────────────────────────')
  lines.push(`${el.symbol}　${el.name}　原子序 ${el.number}　${el.icon} ${el.state === 'liquid' ? '液態需燒杯' : ''}`)
  lines.push('')

  if (data.stock.length) {
    lines.push('【試劑架】')
    data.stock.forEach((s) => lines.push(`  · ${s}`))
    lines.push('')
  }

  if (data.direct.length) {
    lines.push('【直接參與反應】')
    ;[...new Set(data.direct)].forEach((l) => lines.push(l))
    lines.push('')
  }

  const viaUnique = [...new Set(data.viaCompound)]
  if (viaUnique.length) {
    lines.push('【經試劑／化合物參與】')
    viaUnique.forEach((l) => lines.push(l))
    lines.push('')
  }

  if (data.hints.length) {
    lines.push('【想像提示】')
    data.hints.forEach((h) => lines.push(h))
    lines.push('')
  }

  const unlockOnly = data.unlock.filter(
    (u) => !data.stock.some((s) => s.includes(u.split('（')[0])),
  )
  if (unlockOnly.length && unlockOnly.length <= 12) {
    lines.push('【相關解鎖物質】')
    unlockOnly.slice(0, 12).forEach((u) => lines.push(`  · ${u}`))
    if (unlockOnly.length > 12) lines.push(`  · …共 ${unlockOnly.length} 種`)
    lines.push('')
  }

  if (!has) {
    lines.push('【無內建反應】可於週期表選取，但尚無配對反應；建議查圖鑑或等待擴充。')
    lines.push('')
  }
}

lines.push('================================================')
lines.push(
  `統計：與專案相關 ${withAny} 種（其中週期表直接反應 ${withDirect} 種）　完全無內建 ${without} 種　共 ${elements.length} 種`,
)

fs.writeFileSync(outTxt, lines.join('\n'), 'utf8')
console.log(`已寫入 ${outTxt}`)
console.log(`與專案相關 ${withAny} 種，直接反應 ${withDirect} 種，無內建 ${without} 種`)
