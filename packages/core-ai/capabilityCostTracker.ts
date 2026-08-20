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
  cacheReadTokens?: number
  cacheWriteTokens?: number
  costSavedUsd?: number
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
  totalCacheReadTokens: number
  totalCostSavedUsd: number
  totalCostUsd: number
  avgLatencyMs: number
}

export function calculateCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number,
  cacheReadTokens: number = 0,
  cacheWriteTokens: number = 0,
): number {
  const pricing = MODEL_PRICING_REGISTRY[model] || DEFAULT_FALLBACK_PRICING
  // Regular prompt tokens (tokens không được đọc từ cache)
  const regularPromptTokens = Math.max(0, promptTokens - cacheReadTokens)
  const regularPromptCost = (regularPromptTokens / 1_000_000) * pricing.promptCostPer1MTokensUsd
  // Cache read tokens được chiết khấu 90% (chỉ tính 10% đơn giá gốc)
  const cacheReadCost = (cacheReadTokens / 1_000_000) * (pricing.promptCostPer1MTokensUsd * 0.1)
  // Cache write tokens (lưu cache ban đầu) tính 125% đơn giá gốc
  const cacheWriteCost = (cacheWriteTokens / 1_000_000) * (pricing.promptCostPer1MTokensUsd * 1.25)
  const completionCost = (completionTokens / 1_000_000) * pricing.completionCostPer1MTokensUsd

  const totalCost = regularPromptCost + cacheReadCost + cacheWriteCost + completionCost
  return Math.round(totalCost * 1_000_000) / 1_000_000
}

export function calculateCostSavedUsd(model: string, cacheReadTokens: number = 0): number {
  if (cacheReadTokens <= 0) return 0
  const pricing = MODEL_PRICING_REGISTRY[model] || DEFAULT_FALLBACK_PRICING
  // Tiết kiệm 90% chi phí đọc prompt nhờ Cache Hit
  const saved = (cacheReadTokens / 1_000_000) * (pricing.promptCostPer1MTokensUsd * 0.9)
  return Math.round(saved * 1_000_000) / 1_000_000
}

export class CapabilityCostTracker {
  private metrics: CapabilityCostMetric[] = []

  public recordInvocation(
    metric: Omit<CapabilityCostMetric, 'totalTokens' | 'costUsd' | 'timestamp'> & {
      costUsd?: number
      costSavedUsd?: number
      timestamp?: string
    },
  ): CapabilityCostMetric {
    const totalTokens = metric.promptTokens + metric.completionTokens
    const cacheRead = metric.cacheReadTokens ?? 0
    const cacheWrite = metric.cacheWriteTokens ?? 0
    const costSavedUsd = metric.costSavedUsd ?? calculateCostSavedUsd(metric.model, cacheRead)
    const costUsd =
      metric.costUsd ??
      calculateCostUsd(
        metric.model,
        metric.promptTokens,
        metric.completionTokens,
        cacheRead,
        cacheWrite,
      )
    const timestamp = metric.timestamp ?? new Date().toISOString()

    const fullMetric: CapabilityCostMetric = {
      ...metric,
      cacheReadTokens: cacheRead,
      cacheWriteTokens: cacheWrite,
      costSavedUsd,
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
        totalCacheReadTokens: 0,
        totalCostSavedUsd: 0,
        totalCostUsd: 0,
        avgLatencyMs: 0,
      }
    }

    let successfulCalls = 0
    let errorCalls = 0
    let totalPromptTokens = 0
    let totalCompletionTokens = 0
    let totalTokens = 0
    let totalCacheReadTokens = 0
    let totalCostSavedUsd = 0
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
      totalCacheReadTokens += item.cacheReadTokens ?? 0
      totalCostSavedUsd += item.costSavedUsd ?? 0
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
      totalCacheReadTokens,
      totalCostSavedUsd: Math.round(totalCostSavedUsd * 1_000_000) / 1_000_000,
      totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
      avgLatencyMs: Math.round(totalLatency / items.length),
    }
  }
}

// Global default singleton instance for in-memory telemetry
export const defaultCapabilityCostTracker = new CapabilityCostTracker()
