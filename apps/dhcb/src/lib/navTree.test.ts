import { describe, it, expect, beforeEach } from 'vitest'
import {
  ENGLISH_CHILDREN,
  PRACTICE_CHILDREN,
  SUBJECT_CHILDREN,
  groupContainsPath,
  readOpenGroups,
  toggleGroup,
  writeOpenGroups,
} from './navTree'

describe('navTree — dữ liệu cây điều hướng', () => {
  it('mỗi mục con có ĐÚNG một cách trỏ đích: đường dẫn hoặc id môn học', () => {
    for (const c of [...SUBJECT_CHILDREN, ...PRACTICE_CHILDREN, ...ENGLISH_CHILDREN]) {
      expect(Boolean(c.to) !== Boolean(c.subjectId), `mục "${c.label}"`).toBe(true)
      expect(c.paths.length).toBeGreaterThan(0)
    }
  })

  it('Phòng Học liệt kê đủ 6 môn của subjectRegistry', () => {
    expect(SUBJECT_CHILDREN.map((c) => c.subjectId)).toEqual([
      'english',
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'programming',
    ])
  })
})

describe('groupContainsPath — tự mở nhóm chứa trang đang xem', () => {
  it('khớp theo tiền tố, kể cả trang con', () => {
    expect(groupContainsPath(SUBJECT_CHILDREN, '/mon-hoc/physics')).toBe(true)
    expect(groupContainsPath(SUBJECT_CHILDREN, '/lap-trinh/bai-hoc/p1')).toBe(true)
    expect(groupContainsPath(PRACTICE_CHILDREN, '/luyen-noi')).toBe(true)
  })

  it('không khớp trang ngoài nhóm', () => {
    expect(groupContainsPath(SUBJECT_CHILDREN, '/tien-do')).toBe(false)
    expect(groupContainsPath(PRACTICE_CHILDREN, '/mon-hoc/biology')).toBe(false)
  })
})

describe('toggleGroup / lưu trạng thái', () => {
  beforeEach(() => localStorage.clear())

  it('bật rồi tắt một nhóm, không đụng nhóm khác', () => {
    expect(toggleGroup([], '/mon-hoc')).toEqual(['/mon-hoc'])
    expect(toggleGroup(['/mon-hoc', '/luyen-tap'], '/mon-hoc')).toEqual(['/luyen-tap'])
  })

  it('ghi rồi đọc lại được', () => {
    writeOpenGroups(['/mon-hoc'])
    expect(readOpenGroups()).toEqual(['/mon-hoc'])
  })

  it('dữ liệu hỏng trong localStorage → coi như chưa mở nhóm nào, không ném lỗi', () => {
    localStorage.setItem('ui_sidebar_groups', '{khong-phai-json')
    expect(readOpenGroups()).toEqual([])
    localStorage.setItem('ui_sidebar_groups', '{"a":1}')
    expect(readOpenGroups()).toEqual([])
    localStorage.setItem('ui_sidebar_groups', '["/mon-hoc", 42]')
    expect(readOpenGroups()).toEqual(['/mon-hoc'])
  })
})
