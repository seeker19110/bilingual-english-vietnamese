import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { versionedObject, isSupportedVersion } from './version.js'

describe('versionedObject', () => {
  const Schema = versionedObject({ name: z.string() }, 1)

  it('payload hợp lệ đúng version → parse thành công', () => {
    expect(Schema.parse({ name: 'Emma', schemaVersion: 1 })).toEqual({
      name: 'Emma',
      schemaVersion: 1,
    })
  })

  it('thiếu schemaVersion → từ chối', () => {
    expect(() => Schema.parse({ name: 'Emma' })).toThrow()
  })

  it('sai số version (khác literal đã khai báo) → từ chối', () => {
    expect(() => Schema.parse({ name: 'Emma', schemaVersion: 2 })).toThrow()
  })

  it('field lạ ngoài shape khai báo → từ chối (.strict(), không âm thầm bỏ qua)', () => {
    expect(() => Schema.parse({ name: 'Emma', schemaVersion: 1, extra: 'lạ' })).toThrow()
  })

  it('sai kiểu field đã khai báo → từ chối', () => {
    expect(() => Schema.parse({ name: 123, schemaVersion: 1 })).toThrow()
  })
})

describe('isSupportedVersion', () => {
  it('version nằm trong danh sách hỗ trợ → true', () => {
    expect(isSupportedVersion(1, [1, 2])).toBe(true)
  })

  it('version KHÔNG nằm trong danh sách → false', () => {
    expect(isSupportedVersion(3, [1, 2])).toBe(false)
  })

  it('danh sách rỗng → luôn false', () => {
    expect(isSupportedVersion(1, [])).toBe(false)
  })
})
