import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({ getAuthHeader: vi.fn().mockResolvedValue({}) }))

import {
  addMistake,
  addMistakes,
  getMistakes,
  getDueMistakes,
  getMistakeStats,
  markReviewed,
  deleteMistake,
  syncMistakes,
  scheduleMistakeSync,
  deleteMistakeSynced,
  type MistakeInput,
} from './mistakes'

const M = (over: Partial<MistakeInput> = {}): MistakeInput => ({
  wrong: 'she go to school',
  corrected: 'she goes to school',
  explanation: 'Ngôi thứ 3 số ít thêm -s.',
  source: 'chat',
  dir: 'A',
  ...over,
})

describe('Mistake Bank (sổ lỗi cá nhân)', () => {
  beforeEach(() => localStorage.clear())

  it('addMistake lưu 1 lỗi với count=1, chưa ôn', () => {
    addMistake('u1', M())
    const all = getMistakes('u1')
    expect(all).toHaveLength(1)
    expect(all[0].count).toBe(1)
    expect(all[0].reviewCount).toBe(0)
    expect(all[0].lastReviewedAt).toBeNull()
    expect(all[0].corrected).toBe('she goes to school')
  })

  it('lỗi trùng (sau chuẩn hóa) → gộp, tăng count thay vì tạo bản mới', () => {
    addMistake('u1', M())
    addMistake('u1', M({ wrong: '  She GO to school ' })) // khác hoa/thường + khoảng trắng
    const all = getMistakes('u1')
    expect(all).toHaveLength(1)
    expect(all[0].count).toBe(2)
  })

  it('bỏ qua lỗi rỗng / câu sai = câu đúng / thiếu cả câu đúng lẫn giải thích', () => {
    addMistake('u1', M({ wrong: '' }))
    addMistake('u1', M({ wrong: 'same', corrected: 'same' }))
    addMistake('u1', M({ corrected: '', explanation: '' }))
    expect(getMistakes('u1')).toHaveLength(0)
  })

  it('nguồn Chat: cho phép corrected rỗng miễn là có giải thích', () => {
    addMistake('u1', M({ corrected: '', explanation: 'Nhớ chia động từ.' }))
    expect(getMistakes('u1')).toHaveLength(1)
  })

  it('addMistakes thêm mảng lỗi (vd errors của bài viết)', () => {
    addMistakes('u1', [M({ wrong: 'aa', corrected: 'aaa' }), M({ wrong: 'bb', corrected: 'bbb' })])
    expect(getMistakes('u1')).toHaveLength(2)
  })

  it('getDueMistakes: đã ôn trong 2 ngày thì tạm không cần ôn; ưu tiên lỗi lặp nhiều', () => {
    addMistake('u1', M({ wrong: 'rare', corrected: 'rare2' })) // count 1
    addMistake('u1', M({ wrong: 'often', corrected: 'often2' }))
    addMistake('u1', M({ wrong: 'often', corrected: 'often2' })) // count 2
    const due = getDueMistakes('u1')
    expect(due[0].wrong).toBe('often') // lặp nhiều hơn → đứng trước
    // Ôn "often" xong → rời khỏi danh sách cần ôn
    markReviewed('u1', due[0].id)
    expect(getDueMistakes('u1').map((m) => m.wrong)).not.toContain('often')
    // Sau > 2 ngày, "often" lại cần ôn
    const later = Date.now() + 3 * 86_400_000
    expect(getDueMistakes('u1', later).map((m) => m.wrong)).toContain('often')
  })

  it('lỗi lặp lại (gộp) đánh dấu cần ôn lại dù trước đó đã ôn', () => {
    addMistake('u1', M())
    const id = getMistakes('u1')[0].id
    markReviewed('u1', id)
    expect(getMistakeStats('u1').due).toBe(0)
    addMistake('u1', M()) // mắc lại lỗi cũ
    expect(getMistakeStats('u1').due).toBe(1)
  })

  it('deleteMistake xóa đúng thẻ', () => {
    addMistake('u1', M({ wrong: 'aa', corrected: 'aaa' }))
    addMistake('u1', M({ wrong: 'bb', corrected: 'bbb' }))
    const id = getMistakes('u1').find((m) => m.wrong === 'aa')!.id
    deleteMistake('u1', id)
    const all = getMistakes('u1')
    expect(all).toHaveLength(1)
    expect(all[0].wrong).toBe('bb')
  })

  it('getMistakeStats trả tổng + số cần ôn', () => {
    addMistake('u1', M({ wrong: 'aa', corrected: 'aaa' }))
    addMistake('u1', M({ wrong: 'bb', corrected: 'bbb' }))
    markReviewed('u1', getMistakes('u1')[0].id)
    expect(getMistakeStats('u1')).toEqual({ total: 2, due: 1 })
  })

  it('không lẫn dữ liệu giữa 2 user', () => {
    addMistake('u1', M())
    expect(getMistakes('u2')).toHaveLength(0)
  })

  it('cắt trường quá dài về tối đa 500 ký tự', () => {
    addMistake('u1', M({ wrong: 'x'.repeat(600), corrected: 'y'.repeat(600) }))
    const m = getMistakes('u1')[0]
    expect(m.wrong.length).toBe(500)
    expect(m.corrected.length).toBe(500)
  })

  it('an toàn với localStorage hỏng (JSON lỗi) → coi như rỗng', () => {
    localStorage.setItem('et_mistakes_u1', '{bad json')
    expect(getMistakes('u1')).toEqual([])
    addMistake('u1', M()) // vẫn ghi được đè lên
    expect(getMistakes('u1')).toHaveLength(1)
  })

  it('userId rỗng → không lưu, không lỗi', () => {
    addMistake('', M())
    expect(getMistakes('')).toEqual([])
  })

  it('vượt trần MAX_MISTAKES: giữ lại thẻ hay lặp / mới nhất', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    // Thêm 205 lỗi khác nhau, count=1
    for (let i = 0; i < 205; i++) {
      vi.advanceTimersByTime(1000)
      addMistake('u1', M({ wrong: `w${i}`, corrected: `c${i}` }))
    }
    // Thêm 1 lỗi lặp nhiều lần → count cao, phải được giữ
    for (let k = 0; k < 5; k++) addMistake('u1', M({ wrong: 'sticky', corrected: 'sticky2' }))
    const all = getMistakes('u1')
    expect(all.length).toBeLessThanOrEqual(200)
    expect(all.find((m) => m.wrong === 'sticky')).toBeTruthy()
    vi.useRealTimers()
  })

  describe('đồng bộ server', () => {
    const M2 = (over: Partial<MistakeInput> = {}): MistakeInput => ({
      wrong: 'I go yesterday',
      corrected: 'I went yesterday',
      explanation: 'quá khứ đơn',
      source: 'writing',
      dir: 'A',
      ...over,
    })

    it('syncMistakes gửi sổ cục bộ lên rồi ghi đè bằng bản hợp nhất của server', async () => {
      addMistake('u1', M2())
      const merged = [
        {
          id: '11111111-1111-4111-8111-111111111111',
          wrong: 'from server',
          corrected: 'fixed',
          explanation: '',
          source: 'chat' as const,
          dir: 'A' as const,
          createdAt: 1,
          count: 9,
          lastReviewedAt: null,
          reviewCount: 0,
        },
      ]
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ mistakes: merged }) })
      vi.stubGlobal('fetch', fetchMock)

      const out = await syncMistakes('u1')
      // [2026-08-24] Hợp đồng mới: bản server được HỢP NHẤT LẠI với sổ cục bộ hiện tại (không
      // ghi đè thẳng) — lỗi ghi bằng addMistake trong lúc request đang bay không được mất.
      // Ở đây sổ cục bộ có M2, server trả 1 thẻ khác → kết quả phải chứa CẢ HAI.
      expect(out).toHaveLength(2)
      expect(out.map((m) => m.wrong).sort()).toEqual(['from server', M2().wrong].sort())
      expect(out.find((m) => m.wrong === 'from server')?.count).toBe(9)
      expect(getMistakes('u1')).toEqual(out)
      const [url, init] = fetchMock.mock.calls[0]!
      expect(url).toBe('/api/mistakes')
      expect(JSON.parse(init.body).mistakes).toHaveLength(1)
      vi.unstubAllGlobals()
    })

    it('server lỗi hoặc mất mạng → giữ nguyên sổ cục bộ, KHÔNG throw', async () => {
      addMistake('u1', M2())
      const local = getMistakes('u1')

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
      expect(await syncMistakes('u1')).toEqual(local)

      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
      expect(await syncMistakes('u1')).toEqual(local)
      expect(getMistakes('u1')).toEqual(local)
      vi.unstubAllGlobals()
    })

    it('scheduleMistakeSync gom nhiều lần ghi liên tiếp thành MỘT request', async () => {
      vi.useFakeTimers()
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ mistakes: [] }) })
      vi.stubGlobal('fetch', fetchMock)

      addMistake('u1', M2())
      scheduleMistakeSync('u1', 100)
      addMistake('u1', M2({ wrong: 'another' }))
      scheduleMistakeSync('u1', 100)
      scheduleMistakeSync('u1', 100)

      expect(fetchMock).not.toHaveBeenCalled() // chưa tới hạn
      await vi.advanceTimersByTimeAsync(150)
      expect(fetchMock).toHaveBeenCalledTimes(1)

      vi.unstubAllGlobals()
      vi.useRealTimers()
    })

    it('scheduleMistakeSync bỏ qua khi userId rỗng', async () => {
      vi.useFakeTimers()
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
      scheduleMistakeSync('', 10)
      await vi.advanceTimersByTimeAsync(50)
      expect(fetchMock).not.toHaveBeenCalled()
      vi.unstubAllGlobals()
      vi.useRealTimers()
    })
  })
})

// ── Ca biên: dữ liệu hỏng, hết dung lượng, trần lưu trữ, đồng bộ thất bại ─────────────────
//
// Những đường này đều là nhánh "nuốt lỗi" — cả module cố ý không bao giờ throw để việc lưu sổ
// lỗi không làm gãy luồng Chat/Viết/Nói. Không có test canh thì một lần refactor lỡ tay để lọt
// exception ra ngoài sẽ làm hỏng đúng những luồng đó, và không cổng nào bắt được.
describe('Mistake Bank — ca biên', () => {
  beforeEach(() => localStorage.clear())

  it('localStorage chua JSON hong thi coi nhu so rong, khong nem loi', () => {
    localStorage.setItem('et_mistakes_u9', '{khong-phai-json')
    expect(getMistakes('u9')).toEqual([])
  })

  it('localStorage chua JSON hop le nhung khong phai mang thi coi nhu so rong', () => {
    localStorage.setItem('et_mistakes_u9', '{"a":1}')
    expect(getMistakes('u9')).toEqual([])
  })

  it('localStorage het dung luong (setItem nem loi) thi addMistake khong nem ra ngoai', () => {
    const goc = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    try {
      expect(() => addMistake('u9', M())).not.toThrow()
    } finally {
      Storage.prototype.setItem = goc
    }
  })

  it('cat bot truong qua dai (tran 500 ky tu)', () => {
    addMistake('u9', M({ wrong: 'x'.repeat(600), corrected: 'y'.repeat(600) }))
    const [m] = getMistakes('u9')
    expect(m!.wrong).toHaveLength(500)
    expect(m!.corrected).toHaveLength(500)
  })

  it('vuot tran 200 the thi giu lai the LAP NHIEU nhat', () => {
    // 200 thẻ lặp 1 lần + 1 thẻ lặp 2 lần; thẻ thứ 201 phải đẩy một thẻ lặp-1 ra ngoài.
    addMistake('u9', M({ wrong: 'lap nhieu lan' }))
    addMistake('u9', M({ wrong: 'lap nhieu lan' })) // count = 2
    for (let i = 0; i < 205; i++) addMistake('u9', M({ wrong: `cau sai so ${i}` }))
    const all = getMistakes('u9')
    expect(all).toHaveLength(200)
    expect(all.some((m) => m.wrong === 'lap nhieu lan')).toBe(true)
  })

  it('syncMistakes: server tra ve khong-ok thi giu nguyen so cuc bo', async () => {
    addMistake('u9', M())
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
    const r = await syncMistakes('u9')
    expect(r).toHaveLength(1)
    vi.unstubAllGlobals()
  })

  it('syncMistakes: than phan hoi khong co mang "mistakes" thi giu nguyen so cuc bo', async () => {
    addMistake('u9', M())
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: 1 }) }))
    const r = await syncMistakes('u9')
    expect(r).toHaveLength(1)
    vi.unstubAllGlobals()
  })

  it('syncMistakes: mat mang thi tra ve so cuc bo, khong nem loi', async () => {
    addMistake('u9', M())
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(syncMistakes('u9')).resolves.toHaveLength(1)
    vi.unstubAllGlobals()
  })

  it('syncMistakes: chua dang nhap thi tra ve rong va khong goi server', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(syncMistakes('')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('hop nhat voi ban server: count/reviewCount lay gia tri LON hon', async () => {
    addMistake('u9', M())
    const cuc = getMistakes('u9')[0]!
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          mistakes: [{ ...cuc, count: 7, reviewCount: 4, lastReviewedAt: 1_000 }],
        }),
      }),
    )
    const r = await syncMistakes('u9')
    expect(r).toHaveLength(1)
    expect(r[0]!.count).toBe(7)
    expect(r[0]!.reviewCount).toBe(4)
    // Bản cục bộ chưa ôn (null) → "cần ôn lại" thắng.
    expect(r[0]!.lastReviewedAt).toBeNull()
    vi.unstubAllGlobals()
  })

  it('hop nhat: the CHI CO o server duoc giu lai', async () => {
    addMistake('u9', M())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          mistakes: [
            {
              id: 'tu-server',
              wrong: 'chi co o server',
              corrected: 'ban dung',
              explanation: 'gt',
              source: 'chat',
              dir: 'A',
              createdAt: 5,
              count: 1,
              lastReviewedAt: null,
              reviewCount: 0,
            },
          ],
        }),
      }),
    )
    const r = await syncMistakes('u9')
    expect(r.map((m) => m.wrong)).toContain('chi co o server')
    vi.unstubAllGlobals()
  })

  it('deleteMistakeSynced xoa cuc bo ngay va bao server', async () => {
    addMistake('u9', M())
    const id = getMistakes('u9')[0]!.id
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await deleteMistakeSynced('u9', id)
    expect(getMistakes('u9')).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })

  it('deleteMistakeSynced: server loi thi van xoa cuc bo, khong nem ra ngoai', async () => {
    addMistake('u9', M())
    const id = getMistakes('u9')[0]!.id
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(deleteMistakeSynced('u9', id)).resolves.toBeUndefined()
    expect(getMistakes('u9')).toEqual([])
    vi.unstubAllGlobals()
  })

  it('deleteMistakeSynced bo qua khi userId rong', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await deleteMistakeSynced('', 'bat-ky')
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
