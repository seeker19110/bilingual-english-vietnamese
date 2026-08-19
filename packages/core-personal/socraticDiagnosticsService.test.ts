import { describe, it, expect } from 'vitest'
import {
  listMisconceptions,
  startSocraticSession,
  submitSocraticReflection,
} from './socraticDiagnosticsService.js'

describe('socraticDiagnosticsService', () => {
  it('lists predefined misconceptions', () => {
    const list = listMisconceptions()
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list[0]?.id).toBe('present_perfect_past_confusion')
  })

  it('runs a guided socratic session to cognitive breakthrough', () => {
    const personId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const record = startSocraticSession(personId, 'present_perfect_past_confusion')
    expect(record.id).toBeDefined()
    expect(record.status).toBe('in_progress')
    expect(record.currentStepIndex).toBe(0)

    // Step 0 answer
    const res0 = submitSocraticReflection(
      record.id,
      'Thời điểm last summer đã kết thúc hoàn toàn trong quá khứ.',
    )
    expect(res0.updatedRecord.currentStepIndex).toBe(1)
    expect(res0.isComplete).toBe(false)

    // Step 1 answer
    const res1 = submitSocraticReflection(record.id, 'Dùng thì quá khứ đơn ạ.')
    expect(res1.updatedRecord.currentStepIndex).toBe(2)

    // Step 2 answer
    const res2 = submitSocraticReflection(record.id, 'I visited Da Nang last summer.')
    expect(res2.isComplete).toBe(true)
    expect(res2.updatedRecord.status).toBe('breakthrough_achieved')
    expect(res2.updatedRecord.breakthroughSummary).toContain('thấu suốt')
  })
})
