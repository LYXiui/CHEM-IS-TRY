import { useCallback, useEffect, useRef, useState } from 'react'
import { compoundById, compounds, stockCompounds } from '../data/compounds.js'
import { elementBySymbol } from '../data/elements'
import { findImagination, getReaction, reactionKey } from '../data/reactions'
import {
  computeColorShiftDuration,
  effectsToAnimation,
  elementMotion,
  indicatorColorAnim,
  isBleachFade,
  resolveLiquidColorFromBeaker,
} from '../utils/reactionAnim'
import { buildPostReactionBeaker } from '../utils/postReactionBeaker.js'
import {
  buildVerificationAnimation,
  shouldUseVerificationAnim,
} from '../utils/verificationAnim.js'

const STORAGE_KEY = 'chem-is-try-notebook-v6'
const STOCK_IDS = stockCompounds.map((c) => c.id)
const MAX_BEAKER = 8

/** 同一組反應（反應物 + 混合／燃燒模式）視為同一筆記鍵 */
function notebookReactionKey(entry) {
  const snap = entry?.snapshot
  const mode = snap?.mode || 'mix'
  if (entry?.reactionKey) return entry.reactionKey
  if (snap?.items?.length) return `${reactionKey(snap.items)}:${mode}`
  return `${entry?.id || 'unknown'}:${mode}`
}

/** 保留每種反應最新一筆，依時間新→舊排序 */
function dedupeNotebook(entries) {
  const byKey = new Map()
  for (const e of entries) {
    const k = notebookReactionKey(e)
    const prev = byKey.get(k)
    if (!prev || new Date(e.time) > new Date(prev.time)) byKey.set(k, e)
  }
  return [...byKey.values()].sort((a, b) => new Date(b.time) - new Date(a.time))
}

function upsertNotebookEntry(entries, entry) {
  const key = notebookReactionKey(entry)
  const rest = entries.filter((e) => notebookReactionKey(e) !== key)
  return [entry, ...rest].slice(0, 50)
}

const REACTION_START_MARKERS = ['開始混合實驗', '開始燃燒實驗', '開始火柴檢驗']

/** 反應開始前的準備步驟（與筆記本「實驗過程」開頭一致） */
function extractPrepSteps(processLog) {
  if (!processLog?.length) return []
  let cut = processLog.length
  for (let i = 0; i < processLog.length; i++) {
    const t = processLog[i].text
    if (
      REACTION_START_MARKERS.some((m) => t.startsWith(m))
      || t.startsWith('觀察到變化')
    ) {
      cut = i
      break
    }
  }
  return processLog.slice(0, cut).map((s) => ({ ...s }))
}

export function useLabState() {
  const [beakerPlaced, setBeakerPlaced] = useState(false)
  const [beaker, setBeaker] = useState([])
  const [unlocked, setUnlocked] = useState(() => [...STOCK_IDS])
  const [notebook, setNotebook] = useState([])
  const [phenomenon, setPhenomenon] = useState(null)
  const [effects, setEffects] = useState([])
  const [effectColor, setEffectColor] = useState(null)
  const [bubble, setBubble] = useState(null)
  const [lastAction, setLastAction] = useState('')
  const [hintElement, setHintElement] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [lampOn, setLampOn] = useState(false)
  const [matchLit, setMatchLit] = useState(false)
  const [matchOnBench, setMatchOnBench] = useState(false)
  const [lidOn, setLidOn] = useState(false)
  const [tools, setTools] = useState({ stir: false, filter: false, separator: false, cooler: false })
  const [timerSec, setTimerSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [reactionBusy, setReactionBusy] = useState(false)
  const [reactionSnapshot, setReactionSnapshot] = useState(null)
  const [labAnimation, setLabAnimation] = useState(null)
  const [solutionTint, setSolutionTint] = useState(null)
  const [itemAnims, setItemAnims] = useState({})
  const [processLog, setProcessLog] = useState([])

  const timerRef = useRef(null)
  const animTimerRef = useRef(null)
  const tintTimerRef = useRef(null)
  const pendingReactionRef = useRef(null)
  const pendingModeRef = useRef('mix')
  const snapshotRef = useRef(null)
  const processLogRef = useRef([])
  const unlockedRef = useRef(unlocked)
  const handleMatchToolRef = useRef(() => {})

  useEffect(() => {
    unlockedRef.current = unlocked
  }, [unlocked])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        setUnlocked([...new Set([...STOCK_IDS, ...(data.unlocked || [])])])
        if (Array.isArray(data.notebook)) setNotebook(dedupeNotebook(data.notebook))
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    },
    [],
  )

  const persist = useCallback((u, n) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked: u, notebook: n }))
    } catch {
      /* ignore */
    }
  }, [])

  const syncProcessLog = useCallback((steps) => {
    processLogRef.current = steps
    setProcessLog(steps)
  }, [])

  const logStep = useCallback((text) => {
    const next = [...processLogRef.current, { time: new Date().toISOString(), text }]
    syncProcessLog(next)
  }, [syncProcessLog])

  const resetProcessLog = useCallback(() => {
    syncProcessLog([])
  }, [syncProcessLog])

  const triggerAnim = useCallback((payload, duration = 3000) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    setLabAnimation(payload)
    animTimerRef.current = setTimeout(() => {
      setLabAnimation(null)
      setReactionSnapshot(null)
    }, duration)
  }, [])

  const playEffectsAnim = useCallback(
    (fx, color, durationMs, meta = {}) => {
      const a = effectsToAnimation(fx, color, durationMs, meta)
      if (a) triggerAnim(a, a.duration)
    },
    [triggerAnim],
  )

  const playReactionAnim = useCallback(
    (r, mode, durationMs) => {
      if (shouldUseVerificationAnim(r, mode)) {
        const a = buildVerificationAnimation(r, mode, durationMs)
        if (a) {
          triggerAnim(a, a.duration)
          return
        }
      }
      playEffectsAnim(r.effects, r.effectColor, durationMs, {
        imagination: r.imagination,
        phenomenon: r.phenomenon,
        compoundId: r.compoundId,
      })
    },
    [triggerAnim, playEffectsAnim],
  )

  const scheduleSolutionTint = useCallback((color, delayMs = 0) => {
    if (tintTimerRef.current) clearTimeout(tintTimerRef.current)
    if (!color) return
    tintTimerRef.current = setTimeout(() => {
      setSolutionTint(color)
      tintTimerRef.current = null
    }, Math.max(0, delayMs))
  }, [])

  const flashItemMotion = useCallback((index, motion) => {
    setItemAnims((m) => ({ ...m, [index]: motion }))
    setTimeout(() => {
      setItemAnims((m) => {
        const next = { ...m }
        delete next[index]
        return next
      })
    }, 2200)
  }, [])

  const requireBeakerForSolution = () => {
    if (!beakerPlaced) {
      setBubble('所有液體（溶液、試液、液態元素）都須先用燒杯盛裝')
      return false
    }
    return true
  }

  const beakerHasLiquid = () =>
    beaker.some(
      (x) =>
        (x.type === 'compound' && compoundById[x.id]?.liquid) ||
        (x.type === 'element' && elementBySymbol[x.symbol]?.state === 'liquid'),
    )

  const canUseCompound = (compoundId) => {
    const c = compoundById[compoundId]
    return c && (c.stock || unlocked.includes(compoundId))
  }

  const resetFeedback = () => {
    setPhenomenon(null)
    setEffects([])
    setEffectColor(null)
    setBubble(null)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setTimerRunning(false)
    setReactionBusy(false)
  }

  const startReactionTimer = (seconds, onDone) => {
    stopTimer()
    let left = tools.stir ? Math.max(1, seconds - 2) : seconds
    if (tools.cooler) left += 1
    setTimerSec(left)
    setTimerRunning(true)
    setReactionBusy(true)
    timerRef.current = setInterval(() => {
      left -= 1
      setTimerSec(left)
      if (left <= 0) {
        stopTimer()
        onDone()
      }
    }, 1000)
  }

  const toggleBeaker = () => {
    if (beakerPlaced) {
      const hasLiquid = beaker.some((x) => x.type === 'compound')
      if (hasLiquid) {
        setBubble('請先清空燒杯內溶液再收起燒杯')
        return
      }
      setBeakerPlaced(false)
      setLidOn(false)
      setLastAction('收起燒杯')
    } else {
      setBeakerPlaced(true)
      logStep('放置燒杯（可傾倒溶液）')
      setLastAction('放置燒杯')
    }
  }

  const toggleTool = (id) => {
    if (id === 'lamp') {
      setLampOn((v) => !v)
      logStep(lampOn ? '熄滅酒精燈' : '點燃酒精燈（供加熱實驗）')
      setLastAction(lampOn ? '熄滅酒精燈' : '點燃酒精燈')
      return
    }
    if (id === 'match') {
      handleMatchToolRef.current()
      return
    }
    if (id === 'lid') {
      if (!beakerPlaced) {
        setBubble('請先放置燒杯才能使用杯蓋')
        return
      }
      setLidOn((v) => !v)
      logStep(lidOn ? '打開杯蓋' : '蓋上杯蓋')
      setLastAction(lidOn ? '打開杯蓋' : '蓋上杯蓋')
      return
    }
    setTools((t) => {
      const next = { ...t, [id]: !t[id] }
      const names = { stir: '攪拌棒', filter: '過濾器', separator: '分離器', cooler: '冷卻器' }
      if (next[id]) {
        logStep(`使用${names[id]}`)
        if (id === 'stir') triggerAnim({ type: 'stir' }, 2500)
        if (id === 'filter') triggerAnim({ type: 'filter' }, 2800)
        if (id === 'separator') triggerAnim({ type: 'separator' }, 2800)
      }
      setLastAction(next[id] ? `使用${names[id]}` : `收起${names[id]}`)
      return next
    })
  }

  const addToBeaker = (symbol) => {
    if (beaker.length >= MAX_BEAKER) {
      setBubble(`實驗台最多 ${MAX_BEAKER} 種物質`)
      return
    }
    if (!hintElement) setHintElement(symbol)
    const el = elementBySymbol[symbol]
    if (el?.state === 'liquid' && !requireBeakerForSolution()) return
    const idx = beaker.length
    setBeaker((b) => [...b, { type: 'element', symbol }])
    setSelectedIndex(idx)
    const motion = elementMotion(el?.state)
    flashItemMotion(idx, motion)
    logStep(`取元素 ${symbol} 置於實驗台`)
    resetFeedback()
    setLastAction(`加入 ${symbol}`)
  }

  const addCompoundToBeaker = (compoundId) => {
    if (!requireBeakerForSolution()) return
    if (!canUseCompound(compoundId)) {
      setBubble('尚未解鎖，請先以週期表元素合成')
      return
    }
    if (beaker.length >= MAX_BEAKER) {
      setBubble(`燒杯最多 ${MAX_BEAKER} 種物質`)
      return
    }
    const c = compoundById[compoundId]
    if (!hintElement && c?.elements?.[0]) setHintElement(c.elements[0])
    const idx = beaker.length
    setBeaker((b) => [...b, { type: 'compound', id: compoundId }])
    setSelectedIndex(idx)
    flashItemMotion(idx, c?.liquid ? 'float' : 'sink')
    logStep(`倒入 ${c?.formula}（${c?.name}）`)

    const ind = indicatorColorAnim(compoundId)
    if (ind) {
      const shiftMs = 3800
      triggerAnim(
        {
          type: 'solutionShift',
          from: ind.from,
          to: ind.to,
          colorShiftDuration: shiftMs,
          isBleachFade: isBleachFade(ind.from, ind.to),
        },
        shiftMs + 300,
      )
      scheduleSolutionTint(ind.to, shiftMs)
      logStep(ind.label)
    }

    resetFeedback()
    setLastAction(`倒入 ${c?.formula || compoundId}`)
  }

  const selectBeakerItem = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index)
  }

  const removeSelectedFromBeaker = () => {
    if (selectedIndex == null || selectedIndex < 0 || selectedIndex >= beaker.length) {
      setBubble('請先點選要移除的物質')
      return
    }
    setBeaker((b) => b.filter((_, i) => i !== selectedIndex))
    setSelectedIndex(null)
    resetFeedback()
    setLastAction('已移除選取物質')
  }

  const clearBeaker = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    if (tintTimerRef.current) clearTimeout(tintTimerRef.current)
    stopTimer()
    setBeaker([])
    setBeakerPlaced(false)
    setSelectedIndex(null)
    setSolutionTint(null)
    setLidOn(false)
    setLampOn(false)
    setMatchLit(false)
    setMatchOnBench(false)
    setTools({ stir: false, filter: false, separator: false, cooler: false })
    setLabAnimation(null)
    setReactionSnapshot(null)
    resetFeedback()
    setLastAction('已清空實驗台（含器具與物質）')
  }

  const finishReaction = (r, mode) => {
    const c = compounds.find((x) => x.id === r.compoundId)
    const fx = r.effects || []
    logStep(`觀察到變化 → 得到 ${c?.formula}（${c?.name}）`)
    fx.forEach((e) => {
      const labels = {
        bubble: '溶液冒泡',
        precipitate: '固態沉澱物下沉累積',
        colorChange: '溶液顏色改變',
        flame: '燃燒放熱',
        gas: '氣體產生',
        liquid: '液體生成',
        steam: '蒸氣冒出',
      }
      if (labels[e]) logStep(labels[e])
    })

    setPhenomenon({
      text: r.phenomenon,
      formula: c?.formula,
      name: c?.name,
      imagination: r.imagination,
    })
    setEffects(fx)
    setEffectColor(r.effectColor || null)

    const snap = snapshotRef.current
    if (fx.includes('colorChange') && r.effectColor) {
      const waitSec = r.duration ?? (mode === 'burn' ? 4 : 2)
      const waitMs = waitSec * 1000
      const fromColor = resolveLiquidColorFromBeaker(snap?.items || [], null)
      const shiftMs = computeColorShiftDuration(fx, waitMs, fromColor, r.effectColor) || 4500
      const tintDelay = Math.max(500, shiftMs - waitMs + 250)
      scheduleSolutionTint(r.effectColor, tintDelay)
    }
    const entry = {
      id: r.compoundId,
      time: new Date().toISOString(),
      note:
        mode === 'matchTest'
          ? '火柴檢驗'
          : mode === 'burn'
            ? '燃燒實驗'
            : lampOn
              ? '混合實驗（加熱）'
              : '混合實驗',
      snapshot: snap,
      processLog: [...processLogRef.current],
      resultName: c?.name,
      resultFormula: c?.formula,
      reactionKey: snap?.items?.length ? `${reactionKey(snap.items)}:${mode}` : `${r.compoundId}:${mode}`,
    }

    if (r.observeOnly) {
      setNotebook((nb) => {
        const n2 = upsertNotebookEntry(nb, entry)
        persist(unlockedRef.current, n2)
        return n2
      })
    } else {
      setUnlocked((prev) => {
        const next =
          !STOCK_IDS.includes(r.compoundId) && !prev.includes(r.compoundId)
            ? [...prev, r.compoundId]
            : prev
        unlockedRef.current = next
        setNotebook((nb) => {
          const n2 = upsertNotebookEntry(nb, entry)
          persist(next, n2)
          return n2
        })
        return next
      })
    }

    setLastAction(`完成：${c?.name}`)

    if (mode === 'matchTest') {
      setBeaker((prev) => {
        const next = prev.filter((x) => !(x.type === 'compound' && x.id === r.compoundId))
        setBeakerPlaced(
          next.some((x) => x.type === 'compound' && compoundById[x.id]?.liquid)
          || next.length > 0,
        )
        return next
      })
      setBubble(r.imagination || null)
    } else {
      const { items: postItems, needsBeaker } = buildPostReactionBeaker(
        r,
        mode,
        snap?.items || [],
      )
      if (postItems.length > 0) {
        setBeaker(postItems)
        setBeakerPlaced(needsBeaker)
        logStep(`產物留在實驗台（${postItems.length} 種），可進行後續檢驗或混合`)
        const followHint = r.imagination
          || (postItems.some((x) => x.id === 'co2')
            ? '可點火柴（劃燃後再點）檢驗 CO₂'
            : postItems.some((x) => x.id === 'h2')
              ? '可點火柴（劃燃後再點）檢驗 H₂'
              : postItems.some((x) => x.id === 'o2')
                ? '可點火柴（劃燃後再點）檢驗 O₂ 助燃'
                : '產物已保留，可繼續實驗')
        setBubble(followHint)
      } else {
        setBeaker([])
        setBeakerPlaced(false)
        setBubble(r.imagination || null)
      }
    }

    setSelectedIndex(null)
    setLidOn(false)
    if (mode === 'matchTest') {
      if (r.matchResult === 'extinguish') setMatchLit(false)
      else if (r.matchResult === 'intensify' || r.matchResult === 'ignite') setMatchLit(true)
      else setMatchLit(false)
    } else {
      setMatchLit(false)
    }
    snapshotRef.current = null
    resetProcessLog()
  }

  const itemsNeedBeaker = (items) =>
    items.some(
      (x) =>
        (x.type === 'compound' && compoundById[x.id]?.liquid)
        || (x.type === 'element' && elementBySymbol[x.symbol]?.state === 'liquid'),
    )

  const beginReaction = useCallback(
    (items, mode, opts = {}) => {
      const {
        lampOn: lamp = lampOn,
        matchLit: match = matchLit,
        placed = beakerPlaced,
      } = opts

      if (reactionBusy) return false
      if (!items.length) {
        setBubble('請先從週期表選取元素，或於燒杯中放入試劑')
        return false
      }
      if (itemsNeedBeaker(items) && !placed) {
        setBubble('燒杯內有液體，請先放置燒杯')
        return false
      }
      if (placed && lidOn) {
        setBubble('請先打開杯蓋')
        return false
      }

      if (mode === 'burn') {
        if (!match) {
          setBubble('燃燒實驗：請先劃燃火柴')
          return false
        }
      } else if (mode === 'matchTest') {
        if (!match) {
          setBubble('火柴檢驗：請先劃燃火柴，再對燒杯內氣體檢驗')
          return false
        }
      } else {
        const preview = getReaction(items, 'mix')
        if (preview?.needsHeat && !lamp) {
          setBubble('此混合反應需加熱：請先點燃酒精燈')
          return false
        }
      }

      const r = getReaction(items, mode)

      const hasReactionStart = processLogRef.current.some((s) =>
        REACTION_START_MARKERS.some((m) => s.text.startsWith(m)),
      )
      if (!hasReactionStart) {
        logStep(
          mode === 'burn'
            ? '開始燃燒實驗'
            : mode === 'matchTest'
              ? '開始火柴檢驗'
              : '開始混合實驗',
        )
      }
      if (mode === 'burn') logStep('火柴引燃物質')
      if (mode === 'matchTest') logStep('持燃火柴伸入氣體中觀察')
      if (mode === 'mix' && lamp) logStep('酒精燈加熱中')
      if (tools.stir) logStep('攪拌棒攪拌')
      if (tools.filter) logStep('過濾器過濾')
      if (tools.separator) logStep('分離器分層')

      if (r?.compoundId) {
        snapshotRef.current = {
          items: items.map((x) => ({ ...x })),
          mode,
          lampOn: mode === 'mix' ? lamp : false,
          matchLit: mode === 'burn' || mode === 'matchTest' ? match : false,
          beakerPlaced: placed,
          matchOnBench,
          tools: { ...tools },
          processLog: processLogRef.current.map((s) => ({ ...s })),
        }
        setReactionSnapshot(items.map((x) => ({ ...x })))
        const wait = r.duration ?? (mode === 'burn' ? 4 : 2)
        const waitMs = wait * 1000
        const fxList = r.effects || []
        const fromColor = resolveLiquidColorFromBeaker(items, null)
        const shiftMs =
          computeColorShiftDuration(fxList, waitMs, fromColor, r.effectColor) || waitMs + 800
        const animMs = fxList.includes('colorChange')
          ? Math.max(waitMs + 500, shiftMs + 350)
          : waitMs + 800
        playReactionAnim(r, mode, animMs)
        if (wait > 0) {
          pendingReactionRef.current = r
          pendingModeRef.current = mode
          setPhenomenon({ text: '反應進行中…', formula: '⏳', name: '等待' })
          logStep('反應進行中（可碼表加速）')
          startReactionTimer(wait, () => {
            finishReaction(pendingReactionRef.current, pendingModeRef.current)
            pendingReactionRef.current = null
          })
          return true
        }
        finishReaction(r, mode)
        return true
      }

      resetProcessLog()
      const img = findImagination(items)
      if (img) {
        setBubble(img)
        setPhenomenon({ text: img, formula: '—', name: '提示' })
      } else {
        setBubble('此組合尚無反應變化')
        setPhenomenon(null)
      }
      setEffects([])
      setEffectColor(null)
      if (mode === 'matchTest') {
        setBubble('燒杯內無可檢驗氣體 — 先製備 CO₂、H₂、O₂ 等（如 CaCO₃ 加熱分解）')
        setPhenomenon({
          text: '提示：完成放氣反應後，氣體會留在燒杯，再用火柴檢驗',
          formula: '—',
          name: '火柴檢驗',
        })
      }
      setLastAction(
        mode === 'burn'
          ? '燃燒 — 無變化'
          : mode === 'matchTest'
            ? '火柴檢驗 — 無可檢氣體'
            : '混合 — 無變化',
      )
      return false
    },
    [
      reactionBusy,
      beakerPlaced,
      lidOn,
      lampOn,
      matchLit,
      tools,
      logStep,
      playReactionAnim,
      startReactionTimer,
      finishReaction,
    ],
  )

  const runReaction = (mode) => {
    beginReaction([...beaker], mode)
  }

  const resolveMatchAction = (items) => {
    const testR = getReaction(items, 'matchTest')
    const burnR = getReaction(items, 'burn')
    if (testR?.compoundId && burnR?.compoundId) {
      const hasFuelGas = items.some(
        (x) => x.type === 'compound' && ['ch4', 'c2h5oh'].includes(x.id),
      )
      const hasOxidizer = items.some(
        (x) => (x.type === 'element' && x.symbol === 'O') || (x.type === 'compound' && x.id === 'o2'),
      )
      if (hasFuelGas && hasOxidizer) return 'burn'
      return 'matchTest'
    }
    if (testR?.compoundId) return 'matchTest'
    if (burnR?.compoundId) return 'burn'
    return null
  }

  const handleMatchTool = useCallback(() => {
    if (reactionBusy) return
    setMatchOnBench(true)

    if (!matchLit) {
      setMatchLit(true)
      logStep('取出火柴並劃燃')
      const action = resolveMatchAction(beaker)
      setBubble(
        action === 'matchTest'
          ? '火柴已點燃：再點一次火柴可檢驗氣體'
          : action === 'burn'
            ? '火柴已點燃：再點一次火柴可進行燃燒實驗'
            : '火柴已點燃：再點一次火柴可燃燒或檢驗氣體（請先放入反應物）',
      )
      setLastAction('火柴已點燃')
      return
    }

    const mode = resolveMatchAction(beaker)
    if (mode) {
      beginReaction([...beaker], mode, { matchLit: true })
      return
    }

    setMatchLit(false)
    logStep('熄滅火柴')
    setLastAction('熄滅火柴')
    setBubble(null)
  }, [reactionBusy, matchLit, beaker, logStep, beginReaction])

  handleMatchToolRef.current = handleMatchTool

  const accelerateAndFinish = () => {
    if (!reactionBusy) return
    stopTimer()
    setTimerSec(0)
    logStep('碼表加速，反應完成')
    const r = pendingReactionRef.current
    const mode = pendingModeRef.current
    pendingReactionRef.current = null
    if (r?.compoundId) finishReaction(r, mode)
    setLastAction('碼表加速完成')
  }

  const replayExperiment = (entry) => {
    const key = notebookReactionKey(entry)
    const latest =
      notebook
        .filter((e) => notebookReactionKey(e) === key)
        .sort((a, b) => new Date(b.time) - new Date(a.time))[0] || entry

    if (!latest?.snapshot?.items?.length) {
      setBubble('此筆記無法重現')
      return
    }

    setNotebook((nb) => {
      const n2 = dedupeNotebook(nb)
      if (n2.length !== nb.length) persist(unlockedRef.current, n2)
      return n2
    })

    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    if (tintTimerRef.current) clearTimeout(tintTimerRef.current)
    stopTimer()
    pendingReactionRef.current = null
    setLabAnimation(null)
    setReactionSnapshot(null)
    setSolutionTint(null)
    setItemAnims({})

    const snap = latest.snapshot
    const items = snap.items.map((x) => ({ ...x }))
    const placed =
      snap.beakerPlaced != null
        ? snap.beakerPlaced
        : items.some((x) => x.type === 'compound') || itemsNeedBeaker(items)
    const snapLamp = !!snap.lampOn
    const snapMatch = !!snap.matchLit
    const snapMatchOnBench = snap.matchOnBench ?? snapMatch
    const snapTools = snap.tools ?? { stir: false, filter: false, separator: false, cooler: false }

    const prepSteps = snap.processLog?.length
      ? snap.processLog.map((s) => ({ ...s }))
      : extractPrepSteps(latest.processLog || [])
    syncProcessLog(prepSteps)

    setBeakerPlaced(!!placed)
    setBeaker(items)
    setLampOn(snapLamp)
    setMatchLit(snapMatch)
    setMatchOnBench(snapMatchOnBench)
    setTools(snapTools)
    setLidOn(false)
    setSelectedIndex(null)
    resetFeedback()
    setLastAction(`已還原實驗條件：${latest.resultFormula || latest.id}`)
    setBubble(
      prepSteps.length
        ? '已還原實驗條件與準備步驟，請自行操作（混合或點火柴）再重做實驗'
        : '已還原實驗條件，請自行操作（混合或點火柴）再重做實驗',
    )
  }

  return {
    beakerPlaced,
    beaker,
    unlocked,
    notebook,
    phenomenon,
    effects,
    effectColor,
    bubble,
    lastAction,
    hintElement,
    setHintElement,
    selectedIndex,
    selectBeakerItem,
    removeSelectedFromBeaker,
    lidOn,
    lampOn,
    matchLit,
    matchOnBench,
    tools,
    timerSec,
    timerRunning,
    reactionBusy,
    reactionSnapshot,
    labAnimation,
    solutionTint,
    itemAnims,
    processLog,
    toggleBeaker,
    toggleTool,
    accelerateTimer: accelerateAndFinish,
    addToBeaker,
    addCompoundToBeaker,
    clearBeaker,
    runReaction,
    replayExperiment,
    compounds,
    stockCompounds,
    synthesisCount: unlocked.filter((id) => !STOCK_IDS.includes(id)).length,
  }
}
