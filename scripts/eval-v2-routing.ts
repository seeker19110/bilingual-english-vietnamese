import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import { resolveIntentAndDomain } from '../packages/core-personal/companionRuntime.js'

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url))
const FIXTURES_PATH = path.join(SCRIPT_DIR, 'eval-v2-routing-fixtures.json')

interface Fixture {
  id: string
  input: string
  expectedIntent: string
  expectedDomain: string
}

async function main() {
  const fixtures: Fixture[] = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'))
  let correct = 0
  const intentScores: Record<string, { correct: number; total: number }> = {}

  for (const fx of fixtures) {
    if (!intentScores[fx.expectedIntent]) {
      intentScores[fx.expectedIntent] = { correct: 0, total: 0 }
    }
    intentScores[fx.expectedIntent]!.total++

    const result = resolveIntentAndDomain(fx.input)
    const isCorrect = result.intent === fx.expectedIntent && result.domain === fx.expectedDomain

    if (isCorrect) {
      correct++
      intentScores[fx.expectedIntent]!.correct++
    } else {
      console.log(`❌ Failed: ${fx.id}`)
      console.log(`  Input: ${fx.input}`)
      console.log(`  Expected: ${fx.expectedIntent} / ${fx.expectedDomain}`)
      console.log(`  Actual: ${result.intent} / ${result.domain}`)
    }
  }

  const overallAccuracy = (correct / fixtures.length) * 100
  console.log(`\n=== Eval Routing V2 ===`)
  console.log(`Overall Accuracy: ${overallAccuracy.toFixed(2)}% (${correct}/${fixtures.length})`)

  for (const [intent, score] of Object.entries(intentScores)) {
    console.log(`  - ${intent}: ${((score.correct / score.total) * 100).toFixed(2)}%`)
  }

  if (overallAccuracy >= 85) {
    console.log('✅ Passed threshold (>= 85%)')
    process.exit(0)
  } else {
    console.log('❌ Failed threshold (< 85%)')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
