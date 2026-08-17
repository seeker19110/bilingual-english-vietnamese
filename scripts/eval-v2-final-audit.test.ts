import { describe, it, expect } from 'vitest'
import { runFinalArchitectureAudit } from './eval-v2-final-audit.js'

describe('V2-20 Final Architecture Audit', () => {
  it('successfully audits and passes all 8 platform acceptance criteria', async () => {
    const summary = await runFinalArchitectureAudit()

    expect(summary.totalCriteria).toBe(8)
    expect(summary.passedCriteria).toBe(8)
    expect(summary.failedCriteria).toBe(0)
    expect(summary.allPassed).toBe(true)

    const criteriaNames = summary.results.map((r) => r.name)
    expect(criteriaNames).toContain('Multi-Domain Companion Integration')
    expect(criteriaNames).toContain('Cross-Domain Life Graph')
    expect(criteriaNames).toContain('Personal World Model Integrity')
    expect(criteriaNames).toContain('Knowledge Fabric Inspect / Correct / Delete')
    expect(criteriaNames).toContain('External Side Effects & Authority')
    expect(criteriaNames).toContain('Decision / Outcome Loop End-to-End')
    expect(criteriaNames).toContain('Provider / Agent Independence')
    expect(criteriaNames).toContain('SLO, Cost, Security & Audit Completeness')
  })
})
