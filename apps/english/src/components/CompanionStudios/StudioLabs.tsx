import DebateArenaCard from '../DebateArena/DebateArenaCard'
import StemScratchpadCard from '../StemScratchpad/StemScratchpadCard'
import ArticulatoryPhoneticsVisualizer from '../CompanionVoice/ArticulatoryPhoneticsVisualizer'
import AcousticPhoneticsLab from '../CompanionVoice/AcousticPhoneticsLab'
import EchoShadowingCard from '../CompanionVoice/EchoShadowingCard'
import ScenarioHolodeckCard from '../CompanionVoice/ScenarioHolodeckCard'

export default function StudioLabs() {
  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <DebateArenaCard />
      <StemScratchpadCard />
      <ArticulatoryPhoneticsVisualizer />
      <AcousticPhoneticsLab />
      <EchoShadowingCard />
      <ScenarioHolodeckCard />
    </div>
  )
}
