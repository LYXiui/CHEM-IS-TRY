/** 實驗台現象動畫 — BEAKER 風格燒杯內反應 */
import BeakerReactionStage, { resolveLiquidColor, resolveLiquidLevel } from './BeakerReactionStage'

export default function ExperimentAnimations({
  anim,
  solutionTint,
  beaker = [],
  reactionBusy = false,
  itemAnims,
}) {
  const fx = anim?.effects || []
  const showBeakerStage = reactionBusy || fx.length > 0 || anim?.type === 'solutionShift'
  const liquidColor = resolveLiquidColor(beaker, solutionTint)
  const liquidLevel = resolveLiquidLevel(beaker)

  const stageAnim =
    anim?.type === 'solutionShift'
      ? { effects: ['colorChange', 'liquid'], color: anim.to, from: anim.from }
      : anim

  return (
    <>
      {showBeakerStage && (
        <BeakerReactionStage
          anim={stageAnim}
          solutionTint={solutionTint}
          liquidColor={anim?.type === 'solutionShift' ? anim.from : liquidColor}
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
