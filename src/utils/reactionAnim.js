/** 將反應 effects 轉為動畫設定 */
export function effectsToAnimation(effects, effectColor, durationMs) {
  if (!effects?.length) return null
  return {
    effects: [...effects],
    color: effectColor || '#38bdf8',
    duration: durationMs || Math.max(4000, effects.length * 1100),
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
