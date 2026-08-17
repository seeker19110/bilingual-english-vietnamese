import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import {
  evaluateMemoryCandidate,
  type MemoryCandidate,
} from '../packages/core-personal/memoryService.js'

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url))
const FIXTURES_PATH = path.join(SCRIPT_DIR, 'eval-v2-memory-fixtures.json')

interface Fixture {
  id: string
  description: string
  candidate: MemoryCandidate
  existingRecords?: Array<{ content: string; provenance: string; sensitivity: string }>
  expectedOutcome: string
}

async function main() {
  const fixtures: Fixture[] = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'))
  let correct = 0
  let falseMemoryCount = 0
  let falseMemoryTotal = 0
  let correctionCount = 0
  let correctionTotal = 0

  for (const fx of fixtures) {
    const mockRunner = {
      query: async () => {
        const rows = (fx.existingRecords || []).map((r, i) => ({
          id: `rec-${i}`,
          content: r.content,
          provenance: r.provenance,
          sensitivity: r.sensitivity,
        }))
        return { rows, rowCount: rows.length, command: '', oid: 0, fields: [] }
      },
    } as any

    const result = await evaluateMemoryCandidate(mockRunner, 'person-123', fx.candidate)

    if (result.outcome === fx.expectedOutcome) {
      correct++
    } else {
      console.log(`❌ Failed: ${fx.id} - ${fx.description}`)
      console.log(`  Expected: ${fx.expectedOutcome}, Actual: ${result.outcome}`)
    }

    if (fx.expectedOutcome === 'REJECT' || fx.expectedOutcome === 'ASK_USER') {
      falseMemoryTotal++
      if (result.outcome === 'ACCEPT') {
        falseMemoryCount++
      }
    }

    // correction_rate: if candidate is user_declared and expected to override/merge, check it does
    if (
      fx.candidate.provenance === 'user_declared' &&
      (fx.expectedOutcome === 'MERGE' ||
        fx.expectedOutcome === 'ACCEPT' ||
        fx.expectedOutcome === 'REJECT')
    ) {
      correctionTotal++
      // Basic check to make sure user_declared gets appropriately handled
      if (result.outcome === fx.expectedOutcome) {
        correctionCount++
      }
    }
  }

  const overallAccuracy = (correct / fixtures.length) * 100
  const falseMemoryRate = falseMemoryTotal > 0 ? falseMemoryCount / falseMemoryTotal : 0
  const correctionRate = correctionTotal > 0 ? correctionCount / correctionTotal : 1

  console.log(`\n=== Eval Memory V2 ===`)
  console.log(`Overall Accuracy: ${overallAccuracy.toFixed(2)}% (${correct}/${fixtures.length})`)
  console.log(`False Memory Rate: ${(falseMemoryRate * 100).toFixed(2)}% (Target: < 5%)`)
  console.log(`Correction Rate: ${(correctionRate * 100).toFixed(2)}% (Target: 100%)`)

  if (falseMemoryRate < 0.05 && correctionRate === 1.0) {
    console.log('✅ Passed thresholds')
    process.exit(0)
  } else {
    console.log('❌ Failed thresholds')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
