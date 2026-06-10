/** 火柴檢驗反應：持燃火柴觀測氣體性質（非燃燒反應物） */
export const matchTestByGas = {
  co2: {
    compoundId: 'co2',
    phenomenon: '持燃火柴伸入 CO₂：火焰立刻熄滅（二氧化碳不支持燃燒）',
    type: 'matchTest',
    effects: ['gas'],
    matchResult: 'extinguish',
    duration: 2,
    observeOnly: true,
    imagination: 'CaCO₃ 分解或與酸反應放出的無色氣體即為 CO₂',
  },
  h2: {
    compoundId: 'h2',
    phenomenon: '火柴靠近 H₂ 出口：發出輕微「噗」的爆鳴聲（檢驗氫氣）',
    type: 'matchTest',
    effects: ['flame', 'bubble'],
    matchResult: 'pop',
    duration: 2,
    observeOnly: true,
    imagination: 'Zn ＋ 鹽酸製得的無色氣體可用此法檢驗',
  },
  o2: {
    compoundId: 'o2',
    phenomenon: '持燃火柴伸入 O₂：火焰燃燒更劇烈、更明亮（氧氣助燃）',
    type: 'matchTest',
    effects: ['flame'],
    matchResult: 'intensify',
    duration: 2,
    observeOnly: true,
    imagination: 'KClO₃ 加熱或 H₂O₂ 催化分解可得 O₂',
  },
  ch4: {
    compoundId: 'ch4',
    phenomenon: '火柴點燃 CH₄：淡藍色火焰（甲烷可燃）',
    type: 'matchTest',
    effects: ['flame'],
    matchResult: 'ignite',
    duration: 3,
    observeOnly: true,
  },
  nh3: {
    compoundId: 'nh3',
    phenomenon: '火柴靠近 NH₃：無法持續燃燒，具刺激性氨味',
    type: 'matchTest',
    effects: ['gas'],
    matchResult: 'extinguish',
    duration: 2,
    observeOnly: true,
    imagination: 'NH₄Cl ＋ NaOH 加熱放出的氣體',
  },
  so2: {
    compoundId: 'so2',
    phenomenon: 'SO₂ 使火柴火焰變弱並熄滅（不支持燃燒）',
    type: 'matchTest',
    effects: ['gas'],
    matchResult: 'extinguish',
    duration: 2,
    observeOnly: true,
  },
}

/** 燒杯內若含可檢驗氣體，回傳對應火柴檢驗反應 */
export function findMatchTest(items) {
  const gasIds = items
    .filter((x) => x.type === 'compound')
    .map((x) => x.id)
    .filter((id) => matchTestByGas[id])

  if (gasIds.length === 0) {
    const onlyO = items.length === 1 && items[0].type === 'element' && items[0].symbol === 'O'
    if (onlyO) return { ...matchTestByGas.o2, phenomenon: '純氧環境中火柴燃燒更旺（O 元素蒸發模型）' }
    return null
  }

  const priority = ['co2', 'h2', 'o2', 'ch4', 'nh3', 'so2']
  for (const g of priority) {
    if (gasIds.includes(g)) return matchTestByGas[g]
  }
  return matchTestByGas[gasIds[0]] || null
}
