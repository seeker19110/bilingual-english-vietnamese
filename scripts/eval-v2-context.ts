import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import { buildContextPackage } from '@dhcb/core-personal/contextEngine'
import type { ContextBuildOptions } from '@dhcb/core-personal/contextEngine'

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url))
const FIXTURES_PATH = path.join(SCRIPT_DIR, 'eval-v2-context-fixtures.json')

// Hình dạng fixture đọc từ JSON — khai báo tường minh thay cho `any` rải rác
// (audit 2026-09-05, F7: scripts/ nay được lint như mọi mã khác).
type StoredItem = { type: string; sensitivity: string; content: unknown }
type Fixture = {
  id: string
  storedItems: StoredItem[]
  hasConsentForDomain: boolean
  hasDenyPolicy: boolean
  expectedItemsIncluded: number
  options: Partial<ContextBuildOptions> & { maxSensitivity: string }
}

async function main() {
  const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as Fixture[]
  let correct = 0
  let denyBypassed = 0
  let sensitivityLeaked = 0

  for (const fx of fixtures) {
    const mockPool = {
      query: async (queryText: string) => {
        // mock consentService check
        if (queryText.includes('granted_at')) {
          return { rows: fx.hasConsentForDomain ? [{ id: '1' }] : [] }
        }

        // mock listNodes
        if (queryText.includes('from life_graph')) {
          if (fx.storedItems.some((i) => i.type === 'goal')) {
            return {
              rows: [
                {
                  id: '1',
                  person_id: 'person-123',
                  type: 'Goal',
                  label: 'Test Goal',
                  properties: {},
                },
              ],
            }
          }
          return { rows: [] }
        }

        // mock listFacts
        if (queryText.includes('from personal.personal_facts')) {
          const facts = fx.storedItems.filter((i) => i.type === 'fact')
          return {
            rows: facts.map((f) => ({
              id: '1',
              key: 'test',
              value: JSON.stringify(f.content),
              origin: 'user_declared',
              sensitivity: f.sensitivity,
            })),
          }
        }

        // mock listMemoryRecords
        if (queryText.includes('from personal.memory_records')) {
          const memories = fx.storedItems.filter((i) => i.type === 'memory')
          return {
            rows: memories.map((m) => ({
              id: '1',
              namespace: 'semantic',
              content: m.content,
              provenance: 'user_declared',
              sensitivity: m.sensitivity,
              status: 'accepted',
              created_at: new Date(),
            })),
          }
        }

        // mock policy check
        if (queryText.includes('from personal.personal_policies')) {
          return { rows: fx.hasDenyPolicy ? [{ authority: 'DENY' }] : [] }
        }

        return { rows: [] }
      },
    } as unknown as Parameters<typeof buildContextPackage>[0]

    const contextOptions: ContextBuildOptions = {
      personId: '00000000-0000-0000-0000-000000000000',
      requestId: '12345678-1234-4234-8234-123456789012',
      requestText: '',
      purpose: 'eval',
      ...fx.options,
      maxSensitivity: fx.options.maxSensitivity as ContextBuildOptions['maxSensitivity'],
    }

    const pkg = await buildContextPackage(mockPool, contextOptions)

    // filter out current_request item if present
    const actualItems = pkg.items.filter((i) => i.sourceType !== 'current_request')

    if (actualItems.length === fx.expectedItemsIncluded) {
      correct++
    } else {
      console.log(
        `❌ Failed: ${fx.id} - expected ${fx.expectedItemsIncluded} items, got ${actualItems.length}`,
      )
    }

    // Check zero tolerance
    if (fx.hasDenyPolicy && actualItems.length > 0) {
      denyBypassed++
    }

    const rankMap: Record<string, number> = { public: 0, personal: 1, sensitive: 2, restricted: 3 }
    const maxRank = rankMap[fx.options.maxSensitivity] || 2
    if (actualItems.some((i) => (rankMap[i.sensitivity] ?? 0) > maxRank)) {
      sensitivityLeaked++
    }
  }

  const overallAccuracy = (correct / fixtures.length) * 100
  console.log(`\n=== Eval Context V2 ===`)
  console.log(`Overall Accuracy: ${overallAccuracy.toFixed(2)}% (${correct}/${fixtures.length})`)
  console.log(`DENY Bypasses: ${denyBypassed} (Target: 0)`)
  console.log(`Sensitivity Leaks: ${sensitivityLeaked} (Target: 0)`)

  if (denyBypassed === 0 && sensitivityLeaked === 0) {
    console.log('✅ Passed zero-tolerance thresholds')
    process.exit(0)
  } else {
    console.log('❌ Failed zero-tolerance thresholds')
    process.exit(1)
  }
}

main().catch(console.error)
