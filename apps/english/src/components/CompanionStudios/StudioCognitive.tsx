import MetacognitiveJournalCard from '../MetacognitiveReflection/MetacognitiveJournalCard'
import MemoryPalaceCard from '../MemoryPalace/MemoryPalaceCard'
import SubconsciousInsightsCard from '../CompanionVoice/SubconsciousInsightsCard'
import SocraticDiagnosticsCard from '../CompanionVoice/SocraticDiagnosticsCard'

export default function StudioCognitive() {
  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <MetacognitiveJournalCard />
      <MemoryPalaceCard />
      <SubconsciousInsightsCard />
      <SocraticDiagnosticsCard />
    </div>
  )
}
