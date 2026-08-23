import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import { resolveAuthority } from '@dhcb/core-personal/policyService'

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url))
const FIXTURES_PATH = path.join(SCRIPT_DIR, 'eval-v2-permissions-fixtures.json')

interface Policy {
  authority: string
  subject: string
  action: string
  resourceScope: string
  revokedAt?: string
}

interface Fixture {
  id: string
  description: string
  policies: Policy[]
  querySubject: string
  queryAction: string
  queryResourceScope: string
  expectedAuthority: string | null
  expectedBlocked: boolean
}

async function main() {
  const fixtures: Fixture[] = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'))
  let correct = 0
  let denyBypasses = 0

  for (const fx of fixtures) {
    const mockPool = {
      query: async (queryText: string, params: any[]) => {
        const [, subject, action, scope] = params
        const policy = fx.policies.find(
          (p) =>
            p.subject === subject &&
            p.action === action &&
            p.resourceScope === scope &&
            !p.revokedAt,
        )
        return {
          rows: policy ? [{ authority: policy.authority }] : [],
          rowCount: policy ? 1 : 0,
          command: '',
          oid: 0,
          fields: [],
        }
      },
    } as any

    const authority = await resolveAuthority(
      mockPool,
      'person-123',
      fx.querySubject,
      fx.queryAction,
      fx.queryResourceScope,
    )

    const isBlocked = authority === 'DENY'
    const authorityCorrect = authority === fx.expectedAuthority

    if (authorityCorrect && isBlocked === fx.expectedBlocked) {
      correct++
    } else {
      console.log(`❌ Failed: ${fx.id} - ${fx.description}`)
      console.log(`  Expected: ${fx.expectedAuthority} (Blocked: ${fx.expectedBlocked})`)
      console.log(`  Actual: ${authority} (Blocked: ${isBlocked})`)
    }

    if (fx.expectedBlocked && !isBlocked) {
      denyBypasses++
    }
  }

  const overallAccuracy = (correct / fixtures.length) * 100
  console.log(`\n=== Eval Permissions V2 ===`)
  console.log(`Overall Accuracy: ${overallAccuracy.toFixed(2)}% (${correct}/${fixtures.length})`)
  console.log(`DENY Bypasses: ${denyBypasses} (Target: 0)`)

  if (denyBypasses === 0) {
    console.log('✅ Passed zero-tolerance threshold')
    process.exit(0)
  } else {
    console.log('❌ Failed zero-tolerance threshold')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
