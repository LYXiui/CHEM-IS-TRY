/** 實驗台現象動畫 — BEAKER 風格燒杯內反應 */
import BeakerReactionStage, { resolveLiquidLevel } from './BeakerReactionStage'
import {
  isBleachFade,
  resolveBeakerVisuals,
  resolveLiquidColorFromBeaker,
} from '../utils/reactionAnim'

export default function ExperimentAnimations({
  anim,
  solutionTint,
  beaker = [],
  reactionBusy = false,
  itemAnims,
}) {
  const fx = anim?.effects || []
  const showBeakerStage = reactionBusy || fx.length > 0 || anim?.type === 'solutionShift'

  const stageAnim =
    anim?.type === 'solutionShift'
      ? {
          effects: ['colorChange', 'liquid'],
          color: anim.to,
          effectColor: anim.to,
          compoundId: null,
          from: anim.from,
          to: anim.to,
          liquidFrom: anim.from,
          liquidTo: anim.to,
          hasColorChange: true,
          isBleachFade: anim.isBleachFade ?? isBleachFade(anim.from, anim.to),
          colorShiftDuration: anim.colorShiftDuration || 3500,
        }
      : anim

  const beakerForVisual = beaker?.length ? beaker : []
  const visuals = stageAnim ? resolveBeakerVisuals(stageAnim, beakerForVisual, solutionTint) : null

  const liquidFrom =
    anim?.type === 'solutionShift'
      ? anim.from
      : visuals?.liquidFrom ?? resolveLiquidColorFromBeaker(beakerForVisual, solutionTint)

  const mergedAnim = stageAnim && visuals ? { ...stageAnim, ...visuals } : stageAnim
  const liquidLevel = resolveLiquidLevel(beakerForVisual)

  return (
    <>
      {showBeakerStage && (
        <BeakerReactionStage
          anim={mergedAnim}
          solutionTint={solutionTint}
          liquidColor={liquidFrom}
          liquidLevel={liquidLevel}
          active={reactionBusy || !!fx.length}
        />
      )}

      {anim?.type === 'stir' && (
        <div className="anim-stir-rod" aria-hidden>
          <div className="stir-stick" />
        </div>
      )}

      {anim?.type === 'filter' && (
        <div className="anim-filter-funnel" aria-hidden>
          <div className="funnel" />
          <div className="drip" />
        </div>
      )}

      {anim?.type === 'separator' && (
        <div className="anim-separator" aria-hidden>
          <div className="layer layer-a" />
          <div className="layer layer-b" />
        </div>
      )}

      {Object.entries(itemAnims || {}).map(([idx, motion]) => (
        <span key={idx} className={`item-motion item-motion-${motion}`} data-idx={idx} aria-hidden />
      ))}
    </>
  )
}
