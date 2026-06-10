/** 將反應 effects 轉為動畫設定，並解析燒杯內視覺色彩 */
import { compoundById } from '../data/compounds.js'

const GAS_PROFILES = [
  {
    test: (t) => /CO₂|CO2↑|CO2\b|二氧化碳/.test(t),
    gasLabel: '二氧化碳 CO₂↑',
    observe: ['無色、無嗅（高濃度致窒息）', '通入澄清石灰水 → 溶液變混濁'],
    tryNext: ['CaCO₃ ＋ HCl(aq) 或加熱 CaCO₃', '蠟燭在 CO₂ 中會熄滅'],
  },
  {
    test: (t) => /(?<![C])O₂|O2↑|\bO2\b|氧氣/.test(t),
    gasLabel: '氧氣 O₂↑',
    observe: ['無色、助燃', '持燃木条（或火柴）伸入會燃更旺'],
    tryNext: ['H₂O₂(aq) ＋ MnO₂ 催化分解', '加熱 KClO₃ 亦可放 O₂'],
  },
  {
    test: (t) => /(H₂|H2↑|\bH2\b|氫氣|氫↑)/.test(t) && !/過氧化/.test(t),
    gasLabel: '氫氣 H₂↑',
    observe: ['無色、無嗅，比空氣輕', '想像用試管收集：燃著火柴靠近管口可聽「噗」爆鳴'],
    tryNext: ['Zn ＋ HCl(aq) 再製備一次比較出氣', 'H₂ 與 O₂ 燃燒可生成水'],
  },
  {
    test: (t) => /Cl₂|Cl2↑|Cl2\b|氯氣/.test(t),
    gasLabel: '氯氣 Cl₂↑',
    observe: ['黃綠色、具刺激性氣味', '潮濕澱粉-KI 試紙變藍'],
    tryNext: ['Zn ＋ Cl₂ 化合（本類反應）', 'Cl₂ 通入水得次氯酸（漂白）'],
  },
  {
    test: (t) => /NH₃|NH3|氨/.test(t),
    gasLabel: '氨氣 NH₃↑',
    observe: ['無色、刺激性氨味', '遇 HCl 產生白煙（NH₄Cl）'],
    tryNext: ['NH₄Cl ＋ NaOH(aq) 加熱', '石蕊試紙變藍（鹼性）'],
  },
  {
    test: (t) => /NO₂|NO2|二氧化氮/.test(t),
    gasLabel: '二氧化氮 NO₂↑',
    observe: ['紅棕色、具刺激性', '需在通風良好處想像觀察'],
    tryNext: ['Cu ＋ 稀 HNO₃', 'NO₂ 遇水生成硝酸'],
  },
  {
    test: (t) => /SO₂|SO2|二氧化硫/.test(t),
    gasLabel: '二氧化硫 SO₂↑',
    observe: ['無色、刺激性、具漂白性', '能使品紅溶液褪色'],
    tryNext: ['S 在 O₂ 中燃燒', 'SO₂ 通入澄清石灰水亦變混濁'],
  },
  {
    test: (t) => /HCl|氯化氫/.test(t),
    gasLabel: '氯化氫 HCl↑',
    observe: ['無色、具刺激性酸味', '潮濕石蕊試紙變紅'],
    tryNext: ['H₂ ＋ Cl₂ 化合', 'HCl 溶於水即鹽酸'],
  },
]

const BUBBLE_DEFAULT = {
  gasLabel: '氣體／氣泡',
  observe: ['觀察燒杯內溶液冒泡上升', '氣泡由杯底產生並在液面破裂'],
  tryNext: ['可搭配點燃或指示劑想像檢驗', '查閱實驗報告的「想像提示」'],
}

const DEFAULT_PRECIPITATE = '#f8fafc'
const DEFAULT_COLOR_CHANGE = '#38bdf8'

function colorVividness(hex) {
  if (!hex || hex[0] !== '#') return 0
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return Math.max(r, g, b) - Math.min(r, g, b)
}

function colorLuminance(hex) {
  if (!hex || hex[0] !== '#') return 0.5
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** 是否為褪色／漂白類（由深鮮豔漸變為淺淡） */
export function isBleachFade(from, to) {
  if (!from || !to || from === to) return false
  const fromScore = colorVividness(from) + colorLuminance(from) * 40
  const toScore = colorVividness(to) + colorLuminance(to) * 40
  return fromScore > toScore + 12
}

/** 變色動畫時長（與反應等待時間連動，褪色反應更慢） */
export function computeColorShiftDuration(effects, durationMs, liquidFrom, liquidTo) {
  if (!effects?.includes('colorChange')) return null
  const base = Math.max(4200, Math.round((durationMs || 4000) * 0.92))
  if (isBleachFade(liquidFrom, liquidTo)) return Math.max(base, 6200)
  return base
}

/** 反應前燒杯內液體起始色（不含反應後 solutionTint） */
export function resolveLiquidColorFromBeaker(beaker, solutionTint = null) {
  if (solutionTint) return solutionTint
  const items = beaker || []
  const liquids = items.filter((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
  if (liquids.length === 0) {
    if (items.length > 0) return '#cbd5e1'
    return '#bae6fd'
  }
  if (liquids.length === 1) {
    return compoundById[liquids[0].id]?.tone || '#7dd3fc'
  }
  const ranked = liquids
    .map((x) => ({ tone: compoundById[x.id]?.tone || '#7dd3fc' }))
    .sort((a, b) => colorVividness(b.tone) - colorVividness(a.tone))
  return ranked[0]?.tone || '#7dd3fc'
}

export function resolveEffectColor(effects, effectColor, compoundId) {
  if (effectColor) return effectColor
  const product = compoundById[compoundId]
  if (product?.tone) return product.tone
  if (effects?.includes('precipitate')) return DEFAULT_PRECIPITATE
  if (effects?.includes('colorChange')) return DEFAULT_COLOR_CHANGE
  return DEFAULT_COLOR_CHANGE
}

/** 依反應自身性質解析：起始液色、變色目標、沉澱固態色 */
export function resolveBeakerVisuals(anim, beaker, solutionTint = null) {
  if (!anim?.effects?.length) return null

  const fx = anim.effects
  const productColor = resolveEffectColor(fx, anim.effectColor || anim.color, anim.compoundId)
  const liquidFrom = resolveLiquidColorFromBeaker(beaker, null)
  const hasColorChange = fx.includes('colorChange')
  const hasPrecipitate = fx.includes('precipitate')

  const liquidTo = hasColorChange ? productColor : liquidFrom
  return {
    liquidFrom,
    liquidTo,
    precipitateColor: hasPrecipitate ? productColor : null,
    productColor,
    hasColorChange,
    hasPrecipitate,
    isBleachFade: hasColorChange ? isBleachFade(liquidFrom, liquidTo) : false,
    colorShiftDuration: computeColorShiftDuration(fx, anim.duration, liquidFrom, liquidTo),
  }
}

/** 依 imagination／現象文字產生氣體提示內容 */
export function buildGasGuide({ effects, imagination, phenomenon } = {}) {
  const fx = effects || []
  const hasGas = fx.includes('gas') || fx.includes('bubble')
  if (!hasGas) return null

  const text = `${imagination || ''} ${phenomenon || ''}`
  const profile = GAS_PROFILES.find((p) => p.test(text)) || BUBBLE_DEFAULT

  return {
    title: fx.includes('gas') ? '☁️ 產生氣體' : '🫧 溶液冒泡',
    gasLabel: profile.gasLabel,
    imagination: imagination || null,
    observe: profile.observe,
    tryNext: profile.tryNext,
  }
}

export function effectsToAnimation(effects, effectColor, durationMs, meta = {}) {
  if (!effects?.length) return null
  const color = resolveEffectColor(effects, effectColor, meta.compoundId)
  const gasGuide = buildGasGuide({ effects, ...meta })

  const duration = durationMs || Math.max(4000, effects.length * 1100)
  return {
    effects: [...effects],
    color,
    effectColor: color,
    compoundId: meta.compoundId || null,
    duration,
    colorShiftDuration: computeColorShiftDuration(effects, duration, null, color),
    imagination: meta.imagination || null,
    phenomenon: meta.phenomenon || null,
    gasGuide,
    hasPrecipitate: effects.includes('precipitate'),
    hasColorChange: effects.includes('colorChange'),
  }
}

export function elementMotion(state) {
  if (state === 'gas') return 'float'
  if (state === 'liquid') return 'sink'
  return 'sink'
}

export function indicatorColorAnim(compoundId) {
  if (compoundId === 'litmus') return { from: '#c084fc', to: '#60a5fa', label: '石蕊遇鹼變藍' }
  if (compoundId === 'phenolphthalein') return { from: '#fce7f3', to: '#f472b6', label: '酚酞遇鹼變紅' }
  return null
}
