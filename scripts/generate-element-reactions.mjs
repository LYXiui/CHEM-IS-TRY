import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import { elements, elementBySymbol } from '../src/data/elements.js'
import { baseCompounds } from '../src/data/compounds.js'
import { manualReactions } from '../src/data/manualReactions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const xlsxPath = path.join(root, 'docs', '118_Elements_Reaction_Database_Filled_v1.xlsx')
const genDir = path.join(root, 'src', 'data', 'generated')
const outCompounds = path.join(genDir, 'elementCompounds.js')
const outReactions = path.join(genDir, 'elementReactions.js')

const manualKeys = new Set(Object.keys(manualReactions))
const existingIds = new Set(baseCompounds.map((c) => c.id))

const ZH = {
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
  Amphoteric: '兩性',
}

function zh(text) {
  if (!text) return ''
  return ZH[String(text).trim()] || String(text).trim()
}

function makeKey(...parts) {
  return [...new Set(parts)].sort().join('+')
}

const KNOWN = {
  ox: { H: 'h2o', C: 'co2', S: 'so2', Mg: 'mgo', Fe: 'fe2o3', Cu: 'cuo', Al: 'al2o3', N: 'nh3' },
  hal: { Ag: 'agcl', Pb: 'pbcl2', Cl: 'hcl', Na: 'nacl' },
  salt: { Zn: 'zncl2', Fe: 'fecl2_aq', Ca: 'cacl2_aq', Cu: 'cu_no3', Ag: 'agno3', Na: 'nano3' },
  hyd: { Cu: 'cu_oh2', Fe: 'fe_oh2' },
  gas: { H: 'h2', C: 'co2', N: 'nh3' },
}

const NO_REACTION = new Set([
  'No significant reaction',
  'Little or no reaction at room temperature',
  'No reaction',
  'Usually weak/no reaction',
  'Rare/none',
  'None/minor',
  'None',
])

const BURN_WORDS = new Set(['Burns in oxygen', 'Rapid oxidation', 'Combustion possible', 'Highly reactive'])

function tone(sym) {
  return elementBySymbol[sym]?.color || '#e2e8f0'
}

function ensureCompound(id, spec, bag) {
  if (existingIds.has(id) || bag.has(id)) return id
  bag.set(id, {
    id,
    formula: spec.formula,
    name: spec.name,
    elements: spec.elements,
    desc: spec.desc,
    stock: false,
    liquid: !!spec.liquid,
    tone: spec.tone,
  })
  return id
}

function resolveProduct(sym, productText, kind, bag) {
  const p = String(productText || '').trim()
  if (p.includes('H2O') || p === 'H₂O') return existingIds.has('h2o') ? 'h2o' : ensureCompound('h2o', { formula: 'H₂O', name: '水', elements: ['H', 'O'], desc: '燃燒／中和產物', tone: '#7dd3fc' }, bag)
  if (p.includes('CO2') || p.includes('CO₂') || p === 'CO') return 'co2'
  if (KNOWN[kind]?.[sym]) return KNOWN[kind][sym]

  const id = `db_${kind}_${sym}`
  const formulas = {
    ox: `${sym}₂O`,
    hal: `${sym}Cl`,
    hyd: `${sym}(OH)₂`,
    salt: `${sym}Cl`,
    aq: `${sym}(aq)`,
    inert: `${sym}·空氣`,
  }
  const names = {
    ox: `氧化${elementBySymbol[sym]?.name || sym}`,
    hal: `氯化${elementBySymbol[sym]?.name || sym}`,
    hyd: `氫氧化${elementBySymbol[sym]?.name || sym}`,
    salt: `${elementBySymbol[sym]?.name || sym}鹽（模型）`,
    aq: `${elementBySymbol[sym]?.name || sym}水溶液（模型）`,
    inert: `${elementBySymbol[sym]?.name || sym}（惰性模型）`,
  }
  const elementsList =
    kind === 'ox' ? [sym, 'O']
    : kind === 'hal' ? [sym, 'Cl']
    : kind === 'hyd' ? [sym, 'O', 'H']
    : kind === 'salt' ? [sym, 'Cl']
    : [sym]

  return ensureCompound(id, {
    formula: formulas[kind] || `${sym}`,
    name: names[kind] || `${sym} 產物`,
    elements: elementsList,
    desc: `資料庫自動生成（${kind}）`,
    tone: tone(sym),
    liquid: kind === 'aq' || kind === 'hyd',
  }, bag)
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
    map[sym] = { reaction: row[reactionKey] ?? '', products: row[productKey] ?? '' }
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
      symbol,
      category: row.Category,
      air: air[symbol] || { reaction: '', products: '' },
      water: water[symbol] || { reaction: '', products: '' },
      acid: acid[symbol] || { reaction: '', products: '' },
      base: base[symbol] || { reaction: '', products: '' },
      oxidationRx: ox[symbol] || { reaction: '', products: '' },
      halogen: hal[symbol] || { reaction: '', products: '' },
    }
  })
}

function buildOxygenReaction(sym, row, nameZh, bag) {
  if (sym === 'O') return null
  const key = makeKey(sym, 'O')
  if (manualKeys.has(key)) return null

  const air = row.air.reaction
  const ox = row.oxidationRx.reaction
  const prod = row.oxidationRx.products || row.air.products
  const noble = row.category === 'Noble Gas'

  if (noble || (NO_REACTION.has(air) && NO_REACTION.has(ox))) {
    const compoundId = resolveProduct(sym, prod, 'inert', bag)
    return {
      key,
      data: {
        compoundId,
        phenomenon: `${nameZh}與氧／空氣：${zh(air || ox)}（惰性）`,
        type: 'mix',
        effects: [],
        imagination: `資料庫：${zh(prod)}`,
        duration: 2,
      },
    }
  }

  const burns = BURN_WORDS.has(ox) || BURN_WORDS.has(air) || ox === 'Burns in oxygen'
  const compoundId = resolveProduct(sym, prod, 'ox', bag)

  if (burns || sym === 'C' || sym === 'S' || sym === 'P') {
    const effects = ['flame']
    if (prod.includes('CO2') || prod.includes('CO₂')) effects.push('gas')
    if (prod.includes('Oxides') || prod.includes('oxide')) effects.push('precipitate', 'colorChange')
    return {
      key,
      data: {
        compoundId,
        phenomenon: `${nameZh}在氧中：${zh(ox || air)} → ${zh(prod)}`,
        type: 'burn',
        effects,
        effectColor: tone(sym),
        duration: 4,
      },
    }
  }

  return {
    key,
    data: {
      compoundId,
      phenomenon: `${nameZh}氧化：${zh(air)}（${zh(prod)}）`,
      type: 'mix',
      needsHeat: air === 'Slow oxidation' || ox === 'Forms oxides under suitable conditions',
      effects: air === 'Slow oxidation' ? ['colorChange'] : ['colorChange', 'precipitate'],
      effectColor: tone(sym),
      duration: 3,
    },
  }
}

function buildWaterReaction(sym, row, nameZh, bag) {
  const key = makeKey(sym, 'c:h2o')
  if (manualKeys.has(key)) return null

  const w = row.water.reaction
  const prod = row.water.products
  const name = nameZh

  if (NO_REACTION.has(w)) {
    const compoundId = resolveProduct(sym, prod, 'aq', bag)
    return {
      key,
      data: {
        compoundId,
        phenomenon: `${name}與水：${zh(w)}`,
        type: 'mix',
        effects: [],
        imagination: `資料庫：${zh(prod)}`,
        duration: 2,
      },
    }
  }

  const vigorous = w === 'Reacts vigorously' || w === 'Highly reactive'
  const slow = w === 'Reacts slowly' || w === 'Reacts with hot water/steam'
  const compoundId = resolveProduct(sym, prod, 'hyd', bag)

  return {
    key,
    data: {
      compoundId,
      phenomenon: `${name}與水：${zh(w)} → ${zh(prod)}`,
      type: 'mix',
      needsHeat: slow,
      effects: vigorous ? ['bubble', 'flame'] : ['bubble'],
      effectColor: tone(sym),
      duration: vigorous ? 4 : 3,
      imagination: prod.includes('H2') ? 'H₂↑' : undefined,
    },
  }
}

function buildAcidReaction(sym, row, nameZh, bag) {
  const key = makeKey(sym, 'c:hcl')
  if (manualKeys.has(key)) return null

  const a = row.acid.reaction
  const prod = row.acid.products

  if (NO_REACTION.has(a)) {
    const compoundId = resolveProduct(sym, prod, 'aq', bag)
    return {
      key,
      data: {
        compoundId,
        phenomenon: `${nameZh}與稀酸：${zh(a)}`,
        type: 'mix',
        effects: [],
        imagination: `資料庫：${zh(prod)}`,
        duration: 2,
      },
    }
  }

  const compoundId =
    prod.includes('H2') && (sym === 'Na' || sym === 'K' || sym === 'Li' || sym === 'Ca')
      ? 'h2'
      : resolveProduct(sym, prod, 'salt', bag)

  const effects = a === 'Dissolves in acids' ? ['colorChange', 'liquid'] : ['bubble']
  if (a === 'Variable' || a === 'Depends on acid') effects.push('colorChange')

  return {
    key,
    data: {
      compoundId,
      phenomenon: `${nameZh}與鹽酸：${zh(a)} → ${zh(prod)}`,
      type: 'mix',
      effects,
      effectColor: tone(sym),
      duration: 3,
      imagination: prod.includes('H2') ? '無色 H₂↑' : undefined,
    },
  }
}

function buildBaseReaction(sym, row, nameZh, bag) {
  const key = makeKey(sym, 'c:naoh')
  if (manualKeys.has(key)) return null

  const b = row.base.reaction
  const prod = row.base.products

  if (NO_REACTION.has(b)) {
    const compoundId = resolveProduct(sym, prod, 'aq', bag)
    return {
      key,
      data: {
        compoundId,
        phenomenon: `${nameZh}與強鹼：${zh(b)}`,
        type: 'mix',
        effects: [],
        imagination: `資料庫：${zh(prod)}`,
        duration: 2,
      },
    }
  }

  const amphoteric = b === 'Amphoteric' || String(b).includes('Amphoteric')
  const compoundId = resolveProduct(sym, prod, amphoteric ? 'hyd' : 'aq', bag)

  return {
    key,
    data: {
      compoundId,
      phenomenon: `${nameZh}與 NaOH：${zh(b)} → ${zh(prod)}`,
      type: 'mix',
      effects: amphoteric ? ['precipitate', 'colorChange'] : ['colorChange'],
      effectColor: tone(sym),
      duration: 3,
    },
  }
}

function buildHalogenReaction(sym, row, nameZh, bag) {
  if (sym === 'Cl') return null
  const key = makeKey(sym, 'Cl')
  if (manualKeys.has(key)) return null

  const h = row.halogen.reaction
  const prod = row.halogen.products

  if (NO_REACTION.has(h)) {
    const compoundId = resolveProduct(sym, prod, 'inert', bag)
    return {
      key,
      data: {
        compoundId,
        phenomenon: `${nameZh}與氯：${zh(h)}`,
        type: 'mix',
        effects: [],
        imagination: `資料庫：${zh(prod)}`,
        duration: 2,
      },
    }
  }

  const compoundId = resolveProduct(sym, prod, 'hal', bag)
  return {
    key,
    data: {
      compoundId,
      phenomenon: `${nameZh}與氯：${zh(h)} → ${zh(prod)}`,
      type: 'mix',
      effects: ['precipitate', 'gas'],
      effectColor: tone(sym),
      duration: 3,
    },
  }
}

function finalizeVisuals(data, compoundBag) {
  const fx = data.effects || []
  if (!fx.length) return data

  const allCompounds = [...baseCompounds, ...compoundBag.values()]
  const product = allCompounds.find((c) => c.id === data.compoundId)

  if (product?.tone && (fx.includes('precipitate') || fx.includes('colorChange'))) {
    data.effectColor = product.tone
  }

  if (fx.includes('gas') && !data.imagination && data.phenomenon?.includes('CO₂')) {
    data.imagination = '無色 CO₂ — 石灰水變混濁'
  }
  if (fx.includes('bubble') && !data.imagination && data.phenomenon?.includes('H₂')) {
    data.imagination = '無色 H₂↑'
  }

  return data
}

function serializeModule(varName, obj) {
  const json = JSON.stringify(obj, null, 2)
  return `/** 自動生成 — 請執行 npm run generate:elements 更新 */\nexport const ${varName} = ${json}\n`
}

function main() {
  const db = loadDatabase()
  const compoundBag = new Map()
  const reactions = {}

  for (const row of db) {
    const sym = row.symbol
    const nameZh = elementBySymbol[sym]?.name || sym

    for (const build of [
      buildOxygenReaction,
      buildWaterReaction,
      buildAcidReaction,
      buildBaseReaction,
      buildHalogenReaction,
    ]) {
      const rx = build(sym, row, nameZh, compoundBag)
      if (rx && !reactions[rx.key]) reactions[rx.key] = finalizeVisuals(rx.data, compoundBag)
    }
  }

  fs.mkdirSync(genDir, { recursive: true })
  const generatedCompounds = [...compoundBag.values()].sort((a, b) => a.id.localeCompare(b.id))
  fs.writeFileSync(outCompounds, serializeModule('generatedElementCompounds', generatedCompounds), 'utf8')
  fs.writeFileSync(outReactions, serializeModule('generatedElementReactions', reactions), 'utf8')

  console.log(`已生成 ${generatedCompounds.length} 種化合物、${Object.keys(reactions).length} 組元素反應`)
  console.log(`  → ${outCompounds}`)
  console.log(`  → ${outReactions}`)

  const covered = new Set()
  for (const key of Object.keys({ ...reactions, ...manualReactions })) {
    for (const p of key.split('+')) {
      if (!p.startsWith('c:') && elementBySymbol[p]) covered.add(p)
    }
  }
  console.log(`週期表元素覆蓋：${covered.size} / ${elements.length}`)
}

main()
