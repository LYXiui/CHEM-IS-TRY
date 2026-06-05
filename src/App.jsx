import ContextMenu from './components/ContextMenu'
import CompoundAtlas from './components/CompoundAtlas'
import LabBench from './components/LabBench'
import Notebook from './components/Notebook'
import PeriodicTable from './components/PeriodicTable'
import { useContextMenu } from './hooks/useContextMenu'
import { useLabState } from './hooks/useLabState'

export default function App() {
  const lab = useLabState()
  const ctx = useContextMenu()

  const showIntro = (e, title, body) => ctx.showMenu(e, title, body || '')

  return (
    <div className="chem-app-shell p-3 md:p-5 max-w-[92rem] mx-auto relative z-10">
      <ContextMenu menu={ctx.menu} onClose={ctx.closeMenu} />

      <header className="text-center py-6 mb-2">
        <h1 className="chem-title">CHEM-IS-TRY</h1>
      </header>

      <div className="grid xl:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4 min-w-0">
          <PeriodicTable
            onSelect={lab.addToBeaker}
            selected={lab.beaker}
            hintElement={lab.hintElement}
            onHintChange={lab.setHintElement}
            onContextMenu={showIntro}
          />
          <LabBench
            beakerPlaced={lab.beakerPlaced}
            beaker={lab.beaker}
            phenomenon={lab.phenomenon}
            effects={lab.effects}
            effectColor={lab.effectColor}
            bubble={lab.bubble}
            lastAction={lab.lastAction}
            selectedIndex={lab.selectedIndex}
            onSelectItem={lab.selectBeakerItem}
            onRemove={lab.removeSelectedFromBeaker}
            lidOn={lab.lidOn}
            lampOn={lab.lampOn}
            matchLit={lab.matchLit}
            matchOnBench={lab.matchOnBench}
            tools={lab.tools}
            onToggleBeaker={lab.toggleBeaker}
            onToggleTool={lab.toggleTool}
            timerSec={lab.timerSec}
            timerRunning={lab.timerRunning}
            onAccelerate={lab.accelerateTimer}
            onPour={lab.addCompoundToBeaker}
            onMix={() => lab.runReaction('mix')}
            onBurn={() => lab.runReaction('burn')}
            onClear={lab.clearBeaker}
            onContextMenu={showIntro}
            labAnimation={lab.labAnimation}
            solutionTint={lab.solutionTint}
            itemAnims={lab.itemAnims}
            reactionBusy={lab.reactionBusy}
          />
        </div>

        <aside className="space-y-4">
          <CompoundAtlas
            hintElement={lab.hintElement}
            compounds={lab.compounds}
            unlocked={lab.unlocked}
            onUseCompound={lab.addCompoundToBeaker}
            onContextMenu={showIntro}
          />
          <Notebook notebook={lab.notebook} onReplay={lab.replayExperiment} />
        </aside>
      </div>
    </div>
  )
}
