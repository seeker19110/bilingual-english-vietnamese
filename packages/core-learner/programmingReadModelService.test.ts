import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  getProgrammingProgressSummary,
  formatProgrammingProgressForContext,
} from './programmingReadModelService.js'

// Pool giả: trả kết quả theo THỨ TỰ hai truy vấn trong hàm (state, rồi đếm theo status).
function fakePool(state: unknown[], counts: unknown[]): Pool {
  const query = vi
    .fn()
    .mockResolvedValueOnce({ rows: state })
    .mockResolvedValueOnce({ rows: counts })
  return { query } as unknown as Pool
}

describe('getProgrammingProgressSummary', () => {
  it('chưa chạm vào môn → untouched, mặc định p1', async () => {
    const s = await getProgrammingProgressSummary(fakePool([], []), 'u1')
    expect(s).toEqual({
      currentLevel: 'p1',
      completedLessons: 0,
      inProgressLessons: 0,
      untouched: true,
    })
  })

  it('đọc bậc + đếm theo trạng thái (count của Postgres về dạng chuỗi)', async () => {
    const s = await getProgrammingProgressSummary(
      fakePool(
        [{ current_level: 'p2' }],
        [
          { status: 'completed', n: '7' },
          { status: 'in_progress', n: '2' },
        ],
      ),
      'u1',
    )
    expect(s).toEqual({
      currentLevel: 'p2',
      completedLessons: 7,
      inProgressLessons: 2,
      untouched: false,
    })
  })

  it('có tiến độ nhưng chưa có learner_state → vẫn tính là ĐÃ chạm, bậc mặc định p1', async () => {
    const s = await getProgrammingProgressSummary(
      fakePool([], [{ status: 'completed', n: '1' }]),
      'u1',
    )
    expect(s.untouched).toBe(false)
    expect(s.currentLevel).toBe('p1')
  })

  it('lỗi CSDL → coi như chưa chạm, KHÔNG ném lỗi ra Companion', async () => {
    const pool = { query: vi.fn().mockRejectedValue(new Error('db down')) } as unknown as Pool
    await expect(getProgrammingProgressSummary(pool, 'u1')).resolves.toMatchObject({
      untouched: true,
    })
  })
})

describe('formatProgrammingProgressForContext', () => {
  it('chưa chạm → chuỗi rỗng (không tốn token, không rủ học môn chưa mở)', () => {
    expect(
      formatProgrammingProgressForContext({
        currentLevel: 'p1',
        completedLessons: 0,
        inProgressLessons: 0,
        untouched: true,
      }),
    ).toBe('')
  })

  it('có tiến độ → một dòng gọn, có bậc viết hoa và số bài đã xong', () => {
    const line = formatProgrammingProgressForContext({
      currentLevel: 'p1',
      completedLessons: 3,
      inProgressLessons: 1,
      untouched: false,
    })
    expect(line).toContain('Subject: programming')
    expect(line).toContain('Bậc: P1')
    expect(line).toContain('Bài đã xong: 3')
    expect(line).toContain('Đang học dở: 1')
  })

  it('không có bài dở thì không thêm mục thừa', () => {
    const line = formatProgrammingProgressForContext({
      currentLevel: 'p3',
      completedLessons: 10,
      inProgressLessons: 0,
      untouched: false,
    })
    expect(line).not.toContain('Đang học dở')
  })
})
