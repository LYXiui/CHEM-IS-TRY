import { useCallback, useEffect, useRef, useState } from 'react'
import { compoundById, compounds, stockCompounds } from '../data/compounds'
import { elementBySymbol } from '../data/elements'
import { findImagination, getReaction } from '../data/reactions'
import { effectsToAnimation, elementMotion, indicatorColorAnim } from '../utils/reactionAnim'

const STORAGE_KEY = 'chem-is-try-notebook-v6'
const STOCK_IDS = stockCompounds.map((c) => c.id)
const MAX_BEAKER = 8

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
  const [labAnimation, setLabAnimation] = useState(null)
  const [solutionTint, setSolutionTint] = useState(null)
  const [itemAnims, setItemAnims] = useState({})

  const timerRef = useRef(null)
  const animTimerRef = useRef(null)
  const pendingReactionRef = useRef(null)
  const pendingModeRef = useRef('mix')
  const snapshotRef = useRef(null)
  const processLogRef = useRef([])
  const unlockedRef = useRef(unlocked)

  useEffect(() => {
    unlockedRef.current = unlocked
  }, [unlocked])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        setUnlocked([...new Set([...STOCK_IDS, ...(data.unlocked || [])])])
        if (Array.isArray(data.notebook)) setNotebook(data.notebook)
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

  const logStep = useCallback((text) => {
    processLogRef.current = [...processLogRef.current, { time: new Date().toISOString(), text }]
  }, [])

  const resetProcessLog = useCallback(() => {
    processLogRef.current = []
  }, [])

  const triggerAnim = useCallback((payload, duration = 3000) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    setLabAnimation(payload)
    animTimerRef.current = setTimeout(() => setLabAnimation(null), duration)
  }, [])

  const playEffectsAnim = useCallback(
    (fx, color, durationMs) => {
      const a = effectsToAnimation(fx, color, durationMs)
      if (a) triggerAnim(a, a.duration)
    },
    [triggerAnim],
  )

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
      setMatchOnBench(true)
      setMatchLit((v) => !v)
      if (!matchLit) {
        triggerAnim({ effects: ['flame'] }, 2000)
        logStep('取出火柴並劃燃（供燃燒實驗）')
      } else {
        logStep('熄滅火柴')
      }
      setLastAction(matchLit ? '熄滅火柴' : '火柴已點燃')
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
      triggerAnim({ type: 'solutionShift', from: ind.from, to: ind.to }, 3500)
      setSolutionTint(ind.to)
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
    if (beaker.length === 0) return
    setBeaker([])
    setSelectedIndex(null)
    setSolutionTint(null)
    resetFeedback()
    setLastAction('清空實驗台物質')
  }

  const finishReaction = (r, mode) => {
    const c = compounds.find((x) => x.id === r.compoundId)
    const fx = r.effects || []
    logStep(`觀察到變化 → 得到 ${c?.formula}（${c?.name}）`)
    fx.forEach((e) => {
      const labels = {
        bubble: '溶液冒泡',
        precipitate: '生成沉澱並下沉',
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
    playEffectsAnim(fx, r.effectColor, 4500)
    if (fx.includes('colorChange') && r.effectColor) setSolutionTint(r.effectColor)

    const entry = {
      id: r.compoundId,
      time: new Date().toISOString(),
      note: mode === 'burn' ? '燃燒實驗' : lampOn ? '混合實驗（加熱）' : '混合實驗',
      snapshot: snapshotRef.current,
      processLog: [...processLogRef.current],
      resultName: c?.name,
      resultFormula: c?.formula,
    }

    setUnlocked((prev) => {
      const next =
        !STOCK_IDS.includes(r.compoundId) && !prev.includes(r.compoundId)
          ? [...prev, r.compoundId]
          : prev
      unlockedRef.current = next
      setNotebook((nb) => {
        const n2 = [entry, ...nb].slice(0, 50)
        persist(next, n2)
        return n2
      })
      return next
    })

    setLastAction(`完成：${c?.name}`)
    setBubble(r.imagination || null)
    setBeaker([])
    setSelectedIndex(null)
    setLidOn(false)
    setMatchLit(false)
    snapshotRef.current = null
    resetProcessLog()
  }

  const runReaction = (mode) => {
    if (reactionBusy) return
    if (beaker.length === 0) {
      setBubble('請先從週期表選取元素，或於燒杯中放入試劑')
      return
    }
    if (beakerHasLiquid() && !beakerPlaced) {
      setBubble('燒杯內有液體，請先放置燒杯')
      return
    }
    if (beakerPlaced && lidOn) {
      setBubble('請先打開杯蓋')
      return
    }

    if (mode === 'burn') {
      if (!matchLit) {
        setBubble('燃燒實驗：請先劃燃火柴')
        return
      }
    } else {
      const items = [...beaker]
      const preview = getReaction(items, 'mix')
      if (preview?.needsHeat && !lampOn) {
        setBubble('此混合反應需加熱：請先點燃酒精燈')
        return
      }
    }

    const items = [...beaker]
    const r = getReaction(items, mode)

    if (!processLogRef.current.length) {
      logStep(mode === 'burn' ? '開始燃燒實驗' : '開始混合實驗')
    }
    if (mode === 'burn') logStep('火柴引燃物質')
    if (mode === 'mix' && lampOn) logStep('酒精燈加熱中')
    if (tools.stir) logStep('攪拌棒攪拌')
    if (tools.filter) logStep('過濾器過濾')
    if (tools.separator) logStep('分離器分層')

    if (r?.compoundId) {
      snapshotRef.current = {
        items: items.map((x) => ({ ...x })),
        mode,
        lampOn: mode === 'mix' ? lampOn : false,
        matchLit: mode === 'burn' ? matchLit : false,
      }
      const wait = r.duration ?? (mode === 'burn' ? 4 : 2)
      playEffectsAnim(r.effects, r.effectColor, wait * 1000 + 800)
      if (wait > 0) {
        pendingReactionRef.current = r
        pendingModeRef.current = mode
        setPhenomenon({ text: '反應進行中…', formula: '⏳', name: '等待' })
        logStep('反應進行中（可碼表加速）')
        startReactionTimer(wait, () => {
          finishReaction(pendingReactionRef.current, pendingModeRef.current)
          pendingReactionRef.current = null
        })
        return
      }
      finishReaction(r, mode)
      return
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
    setLastAction(mode === 'burn' ? '燃燒 — 無變化' : '混合 — 無變化')
  }

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
    if (!entry?.snapshot?.items?.length) {
      setBubble('此筆記無法重現')
      return
    }
    stopTimer()
    resetProcessLog()
    const hasLiquid = entry.snapshot.items.some((x) => x.type === 'compound')
    setBeakerPlaced(hasLiquid)
    setBeaker(entry.snapshot.items.map((x) => ({ ...x })))
    setLampOn(!!entry.snapshot.lampOn)
    setMatchLit(!!entry.snapshot.matchLit)
    setLidOn(false)
    setSelectedIndex(null)
    resetFeedback()
    setLastAction(`重現：${entry.resultFormula || entry.id}`)
    setBubble('已還原實驗條件，可再次操作')
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
    labAnimation,
    solutionTint,
    itemAnims,
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
