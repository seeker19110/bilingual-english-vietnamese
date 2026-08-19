// packages/core-contracts/stemScratchpad.test.ts
import { describe, it, expect } from 'vitest'
import {
  StemSubjectTypeSchema,
  ScratchpadStepSchema,
  StemProblemStateSchema,
  ScratchpadStepValidationSchema,
} from './stemScratchpad.js'

describe('STEM Scratchpad Contracts', () => {
  it('validates StemSubjectTypeSchema correctly', () => {
    expect(StemSubjectTypeSchema.safeParse('math').success).toBe(true)
    expect(StemSubjectTypeSchema.safeParse('physics').success).toBe(true)
    expect(StemSubjectTypeSchema.safeParse('art').success).toBe(false)
  })

  it('validates ScratchpadStepValidationSchema', () => {
    const val = {
      isValid: true,
      errorType: 'none' as const,
      feedback: 'Excellent algebraic transformation!',
      suggestedCorrection: undefined,
      confidence: 0.98,
    }
    expect(ScratchpadStepValidationSchema.safeParse(val).success).toBe(true)
  })

  it('validates ScratchpadStepSchema', () => {
    const step = {
      stepNumber: 1,
      latexInput: '2x + 5 = 15 \\implies 2x = 10',
      explanation: 'Subtract 5 from both sides',
      validation: {
        isValid: true,
        errorType: 'none' as const,
        feedback: 'Correct application of subtraction property.',
        confidence: 0.99,
      },
      createdAt: '2026-08-20T00:00:00.000Z',
    }
    expect(ScratchpadStepSchema.safeParse(step).success).toBe(true)
  })

  it('validates StemProblemStateSchema', () => {
    const state = {
      id: 'prob-1',
      personId: '11111111-1111-4111-8111-111111111111',
      subject: 'math' as const,
      title: 'Linear Equation Resolution',
      problemStatement: 'Solve for x: 2x + 5 = 15',
      problemLatex: '2x + 5 = 15',
      steps: [],
      isSolved: false,
      hintsUsed: 0,
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z',
    }
    expect(StemProblemStateSchema.safeParse(state).success).toBe(true)
  })
})
