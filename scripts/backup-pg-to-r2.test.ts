import { describe, it, expect } from 'vitest'
import { filesNeedingUpload, keysToPrune, type LocalFile } from './backup-pg-to-r2'

describe('filesNeedingUpload', () => {
  it('file chưa có trên R2 → cần upload', () => {
    const local: LocalFile[] = [{ name: 'a.sql.gz', size: 100 }]
    const remote = new Map<string, number>()
    expect(filesNeedingUpload(local, remote, 'pg-backups/')).toEqual(local)
  })

  it('file đã có trên R2 ĐÚNG kích thước → bỏ qua', () => {
    const local: LocalFile[] = [{ name: 'a.sql.gz', size: 100 }]
    const remote = new Map([['pg-backups/a.sql.gz', 100]])
    expect(filesNeedingUpload(local, remote, 'pg-backups/')).toEqual([])
  })

  it('file đã có trên R2 nhưng SAI kích thước (upload dở lần trước) → phải upload lại', () => {
    const local: LocalFile[] = [{ name: 'a.sql.gz', size: 100 }]
    const remote = new Map([['pg-backups/a.sql.gz', 42]]) // dở dang, thiếu byte
    expect(filesNeedingUpload(local, remote, 'pg-backups/')).toEqual(local)
  })

  it('nhiều file — chỉ lọc đúng những file cần upload, giữ nguyên phần còn lại', () => {
    const local: LocalFile[] = [
      { name: 'a.sql.gz', size: 100 },
      { name: 'b.sql.gz', size: 200 },
      { name: 'c.sql.gz', size: 300 },
    ]
    const remote = new Map([
      ['pg-backups/a.sql.gz', 100], // khớp → bỏ qua
      ['pg-backups/b.sql.gz', 999], // lệch → upload lại
      // c.sql.gz chưa có trên R2 → upload
    ])
    expect(filesNeedingUpload(local, remote, 'pg-backups/')).toEqual([
      { name: 'b.sql.gz', size: 200 },
      { name: 'c.sql.gz', size: 300 },
    ])
  })
})

describe('keysToPrune', () => {
  const DAY = 24 * 60 * 60 * 1000
  const now = new Date('2026-07-25T00:00:00Z').getTime()

  it('keepDays = 0 → KHÔNG xoá gì (kể cả object rất cũ)', () => {
    const objects = [{ key: 'pg-backups/old.sql.gz', lastModified: new Date(now - 365 * DAY) }]
    expect(keysToPrune(objects, 0, now)).toEqual([])
  })

  it('object cũ hơn keepDays → nằm trong danh sách xoá', () => {
    const objects = [{ key: 'pg-backups/old.sql.gz', lastModified: new Date(now - 40 * DAY) }]
    expect(keysToPrune(objects, 30, now)).toEqual(['pg-backups/old.sql.gz'])
  })

  it('object MỚI hơn keepDays → KHÔNG bị xoá', () => {
    const objects = [{ key: 'pg-backups/new.sql.gz', lastModified: new Date(now - 5 * DAY) }]
    expect(keysToPrune(objects, 30, now)).toEqual([])
  })

  it('ca biên: đúng NGAY ranh giới keepDays → chưa đủ cũ, KHÔNG xoá (dùng < nghiêm ngặt)', () => {
    const objects = [{ key: 'pg-backups/edge.sql.gz', lastModified: new Date(now - 30 * DAY) }]
    expect(keysToPrune(objects, 30, now)).toEqual([])
  })

  it('trộn cũ/mới → chỉ trả về đúng phần cũ', () => {
    const objects = [
      { key: 'pg-backups/old.sql.gz', lastModified: new Date(now - 40 * DAY) },
      { key: 'pg-backups/new.sql.gz', lastModified: new Date(now - 5 * DAY) },
    ]
    expect(keysToPrune(objects, 30, now)).toEqual(['pg-backups/old.sql.gz'])
  })
})
