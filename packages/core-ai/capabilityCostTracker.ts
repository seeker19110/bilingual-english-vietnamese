// packages/core-ai/capabilityCostTracker.ts — Theo dõi chi phí và số lượng token cho từng capability AI (V2-20).
//
// Phục vụ Platform V2 theo dõi unit economics, observability và budget guardrails per capability/domain.

export interface ModelPricing {
  promptCostPer1MTokensUsd: number
  completionCostPer1MTokensUsd: number
}

// Bảng giá cơ sở cho các model phổ biến (USD / 1,000,000 tokens)
export const MODEL_PRICING_REGISTRY: Record<string, ModelPricing> = {
  'claude-haiku-4-5-20251001': {
    promptCostPer1MTokensUsd: 0.8,
    completionCostPer1MTokensUsd: 4.0,
  },
  'gemini-2.0-flash': {
    promptCostPer1MTokensUsd: 0.1,
    completionCostPer1MTokensUsd: 0.4,
  },
  'llama-3.3-70b-versatile': {
    promptCostPer1MTokensUsd: 0.59,
    completionCostPer1MTokensUsd: 0.79,
  },
  'gpt-4o-mini': {
    promptCostPer1MTokensUsd: 0.15,
    completionCostPer1MTokensUsd: 0.6,
  },
  'whisper-large-v3-turbo': {
    promptCostPer1MTokensUsd: 0.04, // Quy đổi tương đương theo request
    completionCostPer1MTokensUsd: 0.04,
  },
}

export const DEFAULT_FALLBACK_PRICING: ModelPricing = {
  promptCostPer1MTokensUsd: 0.5,
  completionCostPer1MTokensUsd: 1.5,
}

export interface CapabilityCostMetric {
  capabilityId: string
  domain: string
  personId: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number
  latencyMs: number
  status: 'success' | 'error' | 'throttled'
  timestamp: string
}

export interface CapabilityCostSummary {
  totalCalls: number
  successfulCalls: number
  errorCalls: number
  totalPromptTokens: number
  totalCompletionTokens: number
  totalTokens: number
  totalCostUsd: number
  avgLatencyMs: number
}

export function calculateCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = MODEL_PRICING_REGISTRY[model] || DEFAULT_FALLBACK_PRICING
  const promptCost = (promptTokens / 1_000_000) * pricing.promptCostPer1MTokensUsd
  const completionCost = (completionTokens / 1_000_000) * pricing.completionCostPer1MTokensUsd
  return Math.round((promptCost + completionCost) * 1_000_000) / 1_000_000
}

export class CapabilityCostTracker {
  private metrics: CapabilityCostMetric[] = []

  public recordInvocation(
    metric: Omit<CapabilityCostMetric, 'totalTokens' | 'costUsd' | 'timestamp'> & {
      costUsd?: number
      timestamp?: string
    },
  ): CapabilityCostMetric {
    const totalTokens = metric.promptTokens + metric.completionTokens
    const costUsd =
      metric.costUsd ?? calculateCostUsd(metric.model, metric.promptTokens, metric.completionTokens)
    const timestamp = metric.timestamp ?? new Date().toISOString()

    const fullMetric: CapabilityCostMetric = {
      ...metric,
      totalTokens,
      costUsd,
      timestamp,
    }

    this.metrics.push(fullMetric)
    return fullMetric
  }

  public getMetrics(): CapabilityCostMetric[] {
    return [...this.metrics]
  }

  public getMetricsByCapability(capabilityId: string): CapabilityCostSummary {
    const filtered = this.metrics.filter((m) => m.capabilityId === capabilityId)
    return this.summarize(filtered)
  }

  public getMetricsByDomain(domain: string): CapabilityCostSummary {
    const filtered = this.metrics.filter((m) => m.domain === domain)
    return this.summarize(filtered)
  }

  public getMetricsByPerson(personId: string): CapabilityCostSummary {
    const filtered = this.metrics.filter((m) => m.personId === personId)
    return this.summarize(filtered)
  }

  public getTotalMetrics(): CapabilityCostSummary {
    return this.summarize(this.metrics)
  }

  public checkBudgetExceeded(personId: string, budgetUsd: number): boolean {
    const summary = this.getMetricsByPerson(personId)
    return summary.totalCostUsd >= budgetUsd
  }

  public reset(): void {
    this.metrics = []
  }

  private summarize(items: CapabilityCostMetric[]): CapabilityCostSummary {
    if (items.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        errorCalls: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        avgLatencyMs: 0,
      }
    }

    let successfulCalls = 0
    let errorCalls = 0
    let totalPromptTokens = 0
    let totalCompletionTokens = 0
    let totalTokens = 0
    let totalCostUsd = 0
    let totalLatency = 0

    for (const item of items) {
      if (item.status === 'success') {
        successfulCalls++
      } else {
        errorCalls++
      }
      totalPromptTokens += item.promptTokens
      totalCompletionTokens += item.completionTokens
      totalTokens += item.totalTokens
      totalCostUsd += item.costUsd
      totalLatency += item.latencyMs
    }

    return {
      totalCalls: items.length,
      successfulCalls,
      errorCalls,
      totalPromptTokens,
      totalCompletionTokens,
      totalTokens,
      totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
      avgLatencyMs: Math.round(totalLatency / items.length),
    }
  }
}

// Global default singleton instance for in-memory telemetry
export const defaultCapabilityCostTracker = new CapabilityCostTracker()
