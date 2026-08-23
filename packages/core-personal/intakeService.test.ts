import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Pool } from 'pg'
import { getIntakeState, saveIntake, saveChosenTask } from './intakeService.js'

// Mã hoá chạy THẬT (không mock) để kiểm được rằng câu trả lời tự do không bao giờ chạm CSDL ở
// dạng plaintext — đó là lý do tồn tại của lớp này.
process.env.USER_DATA_MASTER_KEY = Buffer.alloc(32, 9).toString('base64')

const USER = '11111111-1111-1111-1111-111111111111'
const seen: { sql: string; params: unknown[] }[] = []
let nextRows: unknown[] = []

const pool = {
  query: async (sql: string, params?: unknown[]) => {
    seen.push({ sql, params: params ?? [] })
    return { rows: nextRows, rowCount: nextRows.length }
  },
} as unknown as Pool

beforeEach(() => {
  seen.length = 0
  nextRows = []
  vi.restoreAllMocks()
})

describe('saveIntake', () => {
  it('câu trả lời TỰ DO không bao giờ chạm CSDL ở dạng plaintext', async () => {
    await saveIntake(pool, USER, { extraHour: 'ngủ thêm', flowActivity: 'vẽ tranh' })
    const insert = seen.find((q) => q.sql.includes('insert into personal.intake'))
    const params = insert?.params ?? []
    const asText = JSON.stringify(params)

    expect(asText).not.toContain('ngủ thêm')
    expect(asText).not.toContain('vẽ tranh')
    // Đúng định dạng phong bì của userDataCrypto.
    expect(params[3]).toMatch(/^v\d+:/)
    expect(params[4]).toMatch(/^v\d+:/)
  })

  it('câu CHỌN SẴN lưu nguyên văn — cần lọc/thống kê, và chỉ vài giá trị nên giấu cũng vô nghĩa', async () => {
    await saveIntake(pool, USER, { focus: 'tien_bac', lastLearned: 'lau_roi' })
    const insert = seen.find((q) => q.sql.includes('insert into personal.intake'))
    expect(insert?.params[1]).toBe('tien_bac')
    expect(insert?.params[2]).toBe('lau_roi')
  })

  it('bỏ qua câu tự do → lưu null, không mã hoá chuỗi rỗng', async () => {
    await saveIntake(pool, USER, { focus: 'chua_ro' })
    const insert = seen.find((q) => q.sql.includes('insert into personal.intake'))
    expect(insert?.params[3]).toBeNull()
    expect(insert?.params[4]).toBeNull()
  })

  it('chuỗi chỉ có khoảng trắng cũng coi như bỏ qua', async () => {
    await saveIntake(pool, USER, { extraHour: '   ' })
    const insert = seen.find((q) => q.sql.includes('insert into personal.intake'))
    expect(insert?.params[3]).toBeNull()
  })

  it('bỏ HẾT 5 câu vẫn lưu được (đặc tả: bỏ qua không được chặn luồng)', async () => {
    await expect(saveIntake(pool, USER, {})).resolves.toEqual({})
  })

  it('dữ liệu sai kiểu → ném lỗi, không âm thầm lưu rác', async () => {
    await expect(saveIntake(pool, USER, { focus: 'không-có-thật' })).rejects.toThrow()
    await expect(saveIntake(pool, USER, { linhTinh: 1 })).rejects.toThrow()
  })

  it('KHÔNG lưu nhóm tuổi ở bảng này — nguồn sự thật là public.profiles (migration 0059)', async () => {
    await saveIntake(pool, USER, { focus: 'hoc_thi' })
    const insert = seen.find((q) => q.sql.includes('insert into personal.intake'))
    expect(insert?.sql).not.toContain('age_group')
  })
})

describe('getIntakeState', () => {
  it('chưa từng trả lời → chưa xong, câu trả lời rỗng', async () => {
    expect(await getIntakeState(pool, USER)).toEqual({
      done: false,
      answers: {},
      chosenTaskId: null,
    })
  })

  it('vòng tròn: lưu rồi đọc lại ra đúng bản gốc', async () => {
    await saveIntake(pool, USER, { focus: 'quan_he', flowActivity: 'chơi đàn' })
    const insert = seen.find((q) => q.sql.includes('insert into personal.intake'))

    nextRows = [
      {
        focus: 'quan_he',
        last_learned: null,
        extra_hour_enc: null,
        flow_activity_enc: insert?.params[4],
        chosen_task_id: null,
        completed_at: new Date(),
      },
    ]
    const state = await getIntakeState(pool, USER)
    expect(state.done).toBe(true)
    expect(state.answers.flowActivity).toBe('chơi đàn')
    expect(state.answers.focus).toBe('quan_he')
  })

  it('bản ghi CŨ chưa mã hoá vẫn đọc được (chuyển đổi dần)', async () => {
    nextRows = [
      {
        focus: null,
        last_learned: null,
        extra_hour_enc: 'văn bản cũ chưa mã hoá',
        flow_activity_enc: null,
        chosen_task_id: null,
        completed_at: new Date(),
      },
    ]
    const state = await getIntakeState(pool, USER)
    expect(state.answers.extraHour).toBe('văn bản cũ chưa mã hoá')
  })
})

describe('saveChosenTask', () => {
  it('ghi lại việc người dùng chọn — để đo gợi ý có trúng không', async () => {
    await saveChosenTask(pool, USER, 'tien-ghi-chi-tieu')
    const upd = seen.find((q) => q.sql.includes('set chosen_task_id'))
    expect(upd?.params).toEqual([USER, 'tien-ghi-chi-tieu'])
  })
})
