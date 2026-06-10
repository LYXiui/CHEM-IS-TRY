import { buildGasGuide } from './reactionAnim.js'

const MATCH_PROFILES = {
  extinguish: {
    title: '🪵 火柴檢驗',
    caption: '火焰熄滅',
    flameClass: 'verify-flame-out',
    sfx: '不支持燃燒',
  },
  intensify: {
    title: '🪵 火柴檢驗',
    caption: '火焰劇烈燃燒',
    flameClass: 'verify-flame-boost',
    sfx: '氧氣助燃',
  },
  pop: {
    title: '🪵 火柴檢驗',
    caption: '爆鳴「噗」',
    flameClass: 'verify-flame-pop',
    sfx: '氫氣爆鳴',
  },
  ignite: {
    title: '🪵 火柴檢驗',
    caption: '淡藍色火焰',
    flameClass: 'verify-flame-blue',
    sfx: '可燃氣體點燃',
  },
}

const REAGENT_PROFILES = {
  limewater: {
    title: '🧪 澄清石灰水檢驗',
    caption: '溶液變混濁',
    liquidFrom: '#ecfccb',
    liquidTo: '#e7e5e4',
    turbid: true,
  },
  'litmus-acid': {
    title: '🧪 石蕊檢驗',
    caption: '遇酸變紅',
    liquidFrom: '#c084fc',
    liquidTo: '#f87171',
    strip: true,
  },
  'litmus-base': {
    title: '🧪 石蕊檢驗',
    caption: '遇鹼變藍',
    liquidFrom: '#c084fc',
    liquidTo: '#60a5fa',
    strip: true,
  },
  phenolphthalein: {
    title: '🧪 酚酞檢驗',
    caption: '遇鹼呈紅色',
    liquidFrom: '#fce7f3',
    liquidTo: '#f472b6',
    strip: true,
  },
}

/** 火柴／試劑檢驗專用動畫設定 */
export function buildVerificationAnimation(r, mode, durationMs) {
  if (mode === 'matchTest' && r?.matchResult) {
    const profile = MATCH_PROFILES[r.matchResult] || MATCH_PROFILES.extinguish
    const duration = durationMs || (r.duration ?? 2) * 1000
    return {
      type: 'verification',
      kind: 'match',
      matchResult: r.matchResult,
      gasId: r.compoundId,
      title: profile.title,
      caption: profile.caption,
      sfx: profile.sfx,
      flameClass: profile.flameClass,
      label: r.phenomenon,
      duration,
      effects: r.effects || [],
      compoundId: r.compoundId,
      imagination: r.imagination,
      phenomenon: r.phenomenon,
      gasGuide: buildGasGuide({ effects: r.effects, imagination: r.imagination, phenomenon: r.phenomenon }),
    }
  }

  if (r?.verificationKind && REAGENT_PROFILES[r.verificationKind]) {
    const profile = REAGENT_PROFILES[r.verificationKind]
    const duration = durationMs || (r.duration ?? 3) * 1000
    return {
      type: 'verification',
      kind: r.verificationKind,
      title: profile.title,
      caption: profile.caption,
      liquidFrom: profile.liquidFrom,
      liquidTo: profile.liquidTo,
      turbid: profile.turbid,
      strip: profile.strip,
      label: r.phenomenon,
      duration,
      effects: r.effects || [],
      effectColor: r.effectColor,
      compoundId: r.compoundId,
      imagination: r.imagination,
      phenomenon: r.phenomenon,
      hasPrecipitate: r.effects?.includes('precipitate'),
      hasColorChange: r.effects?.includes('colorChange'),
      precipitateColor: r.effectColor || profile.liquidTo,
      colorShiftDuration: Math.max(2800, duration * 0.85),
    }
  }

  return null
}

export function shouldUseVerificationAnim(r, mode) {
  return (mode === 'matchTest' && !!r?.matchResult) || !!r?.verificationKind
}
