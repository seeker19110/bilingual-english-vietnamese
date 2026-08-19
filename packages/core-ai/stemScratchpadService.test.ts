// packages/core-ai/stemScratchpadService.test.ts
import { describe, it, expect } from 'vitest'
import { StemScratchpadService } from './stemScratchpadService.js'

describe('StemScratchpadService', () => {
  it('creates a STEM problem session', () => {
    const prob = StemScratchpadService.createProblemSession({
      personId: '11111111-1111-4111-8111-111111111111',
      subject: 'math',
      title: 'Linear equation',
      problemStatement: 'Solve 2x + 5 = 15',
      problemLatex: '2x + 5 = 15',
    })

    expect(prob.id).toBeDefined()
    expect(prob.subject).toBe('math')
    expect(prob.steps).toEqual([])
  })

  it('validates step and detects unbalanced parentheses', () => {
    const res = StemScratchpadService.validateStep('math', '(2x + 5 = 15')
    expect(res.isValid).toBe(false)
    expect(res.errorType).toBe('arithmetic_error')
  })

  it('detects sign transposition error in algebra', () => {
    const prevSteps = [
      {
        stepNumber: 1,
        latexInput: '2x + 5 = 15',
        createdAt: new Date().toISOString(),
      },
    ]

    const res = StemScratchpadService.validateStep('math', '2x = 15 + 5', prevSteps)
    expect(res.isValid).toBe(false)
    expect(res.errorType).toBe('sign_error')
    expect(res.suggestedCorrection).toBeDefined()
  })

  it('detects unbalanced chemistry reaction', () => {
    const res = StemScratchpadService.validateStep('chemistry', 'H_2 + O_2 -> H_2O')
    expect(res.isValid).toBe(false)
    expect(res.errorType).toBe('unbalanced_equation')
  })

  it('generates micro hints for problem resolution', () => {
    const prob = StemScratchpadService.createProblemSession({
      personId: '11111111-1111-4111-8111-111111111111',
      subject: 'math',
      title: 'Linear equation',
      problemStatement: 'Solve 2x + 5 = 15',
      problemLatex: '2x + 5 = 15',
    })

    const initialHint = StemScratchpadService.generateMicroHint(prob)
    expect(initialHint.hintText).toBeDefined()

    prob.steps.push({
      stepNumber: 1,
      latexInput: '2x = 10',
      createdAt: new Date().toISOString(),
    })

    const nextHint = StemScratchpadService.generateMicroHint(prob)
    expect(nextHint.suggestedFormula).toContain('x =')
  })
})
