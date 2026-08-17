import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { auditMigrations } from './verify-v2-migration-safety.js'

describe('verify-v2-migration-safety', () => {
  it('successfully audits existing repository migrations', () => {
    const report = auditMigrations()
    expect(report.totalFiles).toBeGreaterThanOrEqual(50)
    expect(report.errors).toHaveLength(0)
    expect(report.isSafe).toBe(true)
    expect(report.verifiedSchemas).toContain('personal')
    expect(report.verifiedSchemas).toContain('career')
    expect(report.verifiedSchemas).toContain('work')
    expect(report.verifiedSchemas).toContain('startup')
    expect(report.verifiedSchemas).toContain('life')
    expect(report.verifiedSchemas).toContain('platform')
  })

  it('detects dangerous drop database patterns in temporary directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migration-test-'))
    try {
      fs.writeFileSync(
        path.join(tmpDir, '0001_dangerous.sql'),
        'DROP DATABASE production_db;\nCREATE TABLE test();',
      )
      const report = auditMigrations(tmpDir)
      expect(report.isSafe).toBe(false)
      expect(report.errors.length).toBeGreaterThan(0)
      expect(report.errors[0]).toContain('DROP DATABASE')
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('handles non-existent directory gracefully', () => {
    const report = auditMigrations('/non-existent-directory-xyz-123')
    expect(report.isSafe).toBe(false)
    expect(report.errors[0]).toContain('không tồn tại')
  })
})
