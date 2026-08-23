import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import StudioLoadingSkeleton from './StudioLoadingSkeleton'
import StudioCognitive from './StudioCognitive'
import StudioLabs from './StudioLabs'

// Mock sub-components
vi.mock('../MetacognitiveReflection/MetacognitiveJournalCard.js', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'meta-card' }, 'MetacognitiveJournalCard'),
}))
vi.mock('../MemoryPalace/MemoryPalaceCard.js', () => ({
  default: () => React.createElement('div', { 'data-testid': 'palace-card' }, 'MemoryPalaceCard'),
}))
vi.mock('../CompanionVoice/SubconsciousInsightsCard.js', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'subconscious-card' }, 'SubconsciousInsightsCard'),
}))
vi.mock('../CompanionVoice/SocraticDiagnosticsCard.js', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'socratic-card' }, 'SocraticDiagnosticsCard'),
}))
vi.mock('../DebateArena/DebateArenaCard.js', () => ({
  default: () => React.createElement('div', { 'data-testid': 'debate-card' }, 'DebateArenaCard'),
}))
vi.mock('../StemScratchpad/StemScratchpadCard.js', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'scratchpad-card' }, 'StemScratchpadCard'),
}))
vi.mock('../CompanionVoice/ArticulatoryPhoneticsVisualizer.js', () => ({
  default: () =>
    React.createElement(
      'div',
      { 'data-testid': 'articulatory-card' },
      'ArticulatoryPhoneticsVisualizer',
    ),
}))
vi.mock('../CompanionVoice/AcousticPhoneticsLab.js', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'acoustic-lab' }, 'AcousticPhoneticsLab'),
}))
vi.mock('../CompanionVoice/EchoShadowingCard.js', () => ({
  default: () => React.createElement('div', { 'data-testid': 'echo-card' }, 'EchoShadowingCard'),
}))
vi.mock('../CompanionVoice/ScenarioHolodeckCard.js', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'holodeck-card' }, 'ScenarioHolodeckCard'),
}))

describe('CompanionStudios', () => {
  it('renders StudioLoadingSkeleton with shimmering placeholders', () => {
    const html = renderToStaticMarkup(React.createElement(StudioLoadingSkeleton))
    expect(html).toContain('animate-shimmer')
  })

  it('renders StudioCognitive with all reflection and memory components', () => {
    const html = renderToStaticMarkup(React.createElement(StudioCognitive))
    expect(html).toContain('data-testid="meta-card"')
    expect(html).toContain('data-testid="palace-card"')
    expect(html).toContain('data-testid="subconscious-card"')
    expect(html).toContain('data-testid="socratic-card"')
  })

  it('renders StudioLabs with all debate and stem laboratory components', () => {
    const html = renderToStaticMarkup(React.createElement(StudioLabs))
    expect(html).toContain('data-testid="debate-card"')
    expect(html).toContain('data-testid="scratchpad-card"')
    expect(html).toContain('data-testid="articulatory-card"')
    expect(html).toContain('data-testid="acoustic-lab"')
    expect(html).toContain('data-testid="echo-card"')
    expect(html).toContain('data-testid="holodeck-card"')
  })
})
