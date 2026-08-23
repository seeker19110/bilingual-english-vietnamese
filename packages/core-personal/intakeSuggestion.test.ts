import { describe, it, expect } from 'vitest'
import { IntakeResultSchema, type IntakeAnswers } from '@dhcb/core-contracts/intake'
import {
  buildIntakeResult,
  collectVisibleTexts,
  findForbiddenLanguage,
} from './intakeSuggestion.js'

// ── Sinh TOÀN BỘ tổ hợp đầu vào ──────────────────────────────────────────────
// Hàm thuần + không gian đầu vào nhỏ ⇒ quét được hết, không phải lấy mẫu. Nhờ vậy các bất biến
// dưới đây là bảo chứng thật chứ không phải "đã thử vài ca thấy ổn".
const AGES = [undefined, 'nhi_dong', 'thieu_nien', 'thanh_nien', 'nguoi_lon'] as const
const FOCUSES = [
  undefined,
  'hoc_thi',
  'cong_viec',
  'suc_khoe',
  'tien_bac',
  'quan_he',
  'chua_ro',
] as const
const MOMENTUMS = [undefined, 'tuan_nay', 'vai_thang', 'lau_roi', 'khong_nho'] as const
const TEXTS = [undefined, 'vẽ tranh', 'chơi bóng rổ với em'] as const

function allCombos(): IntakeAnswers[] {
  const out: IntakeAnswers[] = []
  for (const ageGroup of AGES)
    for (const focus of FOCUSES)
      for (const lastLearned of MOMENTUMS)
        for (const flowActivity of TEXTS)
          for (const extraHour of TEXTS)
            out.push({ ageGroup, focus, lastLearned, flowActivity, extraHour })
  return out
}

const COMBOS = allCombos()

describe('quét toàn bộ tổ hợp đầu vào', () => {
  it(`có ${COMBOS.length} tổ hợp — đủ để coi là quét hết`, () => {
    expect(COMBOS.length).toBe(5 * 7 * 5 * 3 * 3)
  })

  // ── T1 + T3: không con số năng lực nào rò lên giao diện ────────────────────
  it('KHÔNG tổ hợp nào sinh ra ngôn ngữ bị cấm (điểm số, xếp loại, so sánh, định mệnh tuổi tác)', () => {
    const offenders: { answers: IntakeAnswers; hits: unknown[] }[] = []
    for (const answers of COMBOS) {
      const hits = findForbiddenLanguage(collectVisibleTexts(buildIntakeResult(answers)))
      if (hits.length) offenders.push({ answers, hits })
    }
    expect(offenders).toEqual([])
  })

  // ── T2: mỗi lần chỉ MỘT việc nổi bật ──────────────────────────────────────
  it('luôn đúng 1 việc chính + tối đa 2 lựa chọn, và chúng khác nhau', () => {
    for (const answers of COMBOS) {
      const r = buildIntakeResult(answers)
      expect(r.primary.id).toBeTruthy()
      expect(r.alternatives.length).toBeLessThanOrEqual(2)
      const ids = [r.primary.id, ...r.alternatives.map((a) => a.id)]
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('kết quả luôn hợp lệ theo contract (Zod strict — không trường lạ lọt vào)', () => {
    for (const answers of COMBOS) {
      expect(() => IntakeResultSchema.parse(buildIntakeResult(answers))).not.toThrow()
    }
  })

  it('mọi việc gợi ý đều có câu "vì sao" không rỗng', () => {
    for (const answers of COMBOS) {
      const r = buildIntakeResult(answers)
      expect(r.primary.why.trim().length).toBeGreaterThan(0)
      for (const alt of r.alternatives) expect(alt.why.trim().length).toBeGreaterThan(0)
    }
  })
})

// ── T4: bỏ qua mọi câu vẫn dùng được ────────────────────────────────────────
describe('bỏ qua câu hỏi', () => {
  it('bỏ HẾT 5 câu vẫn ra được một việc', () => {
    const r = buildIntakeResult({})
    expect(r.primary.title.length).toBeGreaterThan(0)
    expect(r.primary.why.length).toBeGreaterThan(0)
  })

  it('tất định: cùng câu trả lời luôn ra cùng kết quả', () => {
    const a: IntakeAnswers = { focus: 'tien_bac', lastLearned: 'lau_roi' }
    expect(buildIntakeResult(a)).toEqual(buildIntakeResult(a))
  })
})

// ── Luật trích lại lời người dùng (đặc tả mục 5.1) ──────────────────────────
describe('câu "vì sao" trích lại lời người dùng', () => {
  it('có câu 4 → trích nguyên văn, không nói về "hồ sơ" hay suy luận', () => {
    const r = buildIntakeResult({ focus: 'chua_ro', flowActivity: 'vẽ tranh' })
    expect(r.primary.why).toContain('vẽ tranh')
    expect(r.primary.why).not.toMatch(/hồ sơ|dữ liệu|phân tích|hệ thống/i)
  })

  it('ưu tiên câu 4 hơn câu 3 — tín hiệu tự phát đáng tin hơn', () => {
    const r = buildIntakeResult({ flowActivity: 'vẽ tranh', extraHour: 'ngủ thêm' })
    expect(r.primary.why).toContain('vẽ tranh')
    expect(r.primary.why).not.toContain('ngủ thêm')
  })

  it('không có chữ nào của người dùng → diễn đạt theo mối bận tâm, vẫn không có con số', () => {
    const r = buildIntakeResult({ focus: 'tien_bac' })
    expect(r.primary.why.length).toBeGreaterThan(0)
    expect(findForbiddenLanguage([r.primary.why])).toEqual([])
  })
})

// ── Chọn việc theo ngữ cảnh ─────────────────────────────────────────────────
describe('chọn việc hợp ngữ cảnh', () => {
  it('đà học yếu → chọn việc NHỎ hơn và nói rõ là cố ý', () => {
    const weak = buildIntakeResult({ focus: 'suc_khoe', lastLearned: 'lau_roi' })
    const strong = buildIntakeResult({ focus: 'suc_khoe', lastLearned: 'tuan_nay' })
    expect(weak.primary.id).not.toBe(strong.primary.id)
    expect(weak.primary.why).toContain('nhỏ')
  })

  it('tuổi đi học chọn "công việc" → KHÔNG nhận việc nghề nghiệp người lớn', () => {
    for (const ageGroup of ['nhi_dong', 'thieu_nien'] as const) {
      const r = buildIntakeResult({ ageGroup, focus: 'cong_viec', lastLearned: 'tuan_nay' })
      expect(r.primary.id).not.toBe('nghe-viec-that')
      expect(r.primary.id).not.toBe('nghe-viet-5-dong')
    }
  })

  it('người lớn chọn "công việc" → nhận việc nghề nghiệp', () => {
    const r = buildIntakeResult({
      ageGroup: 'nguoi_lon',
      focus: 'cong_viec',
      lastLearned: 'tuan_nay',
    })
    expect(r.primary.id).toBe('nghe-viec-that')
  })

  it('chưa rõ mối bận tâm + có câu 4 → bám vào chính thứ họ tự nói ra', () => {
    const r = buildIntakeResult({ focus: 'chua_ro', flowActivity: 'sửa xe đạp' })
    expect(r.primary.id).toBe('nang-khieu-thu-20-phut')
  })

  it('chưa rõ và không nói gì → việc rẻ nhất, sinh thông tin nhiều nhất', () => {
    expect(buildIntakeResult({ focus: 'chua_ro' }).primary.id).toBe('kham-pha-mot-cau-hoi')
  })
})

// ── Bản thân bộ lọc phải bắt được thứ nó hứa bắt ────────────────────────────
describe('findForbiddenLanguage', () => {
  it('bắt điểm số, phần trăm, xếp loại, khiếm khuyết, so sánh, định mệnh tuổi tác', () => {
    const bad = [
      'Năng lực của bạn đạt 72/100',
      'Bạn hoàn thành 80% lộ trình',
      'Bạn đang ở mức trung bình',
      'Bạn thiếu kỹ năng giao tiếp',
      'So với người cùng tuổi, bạn chậm hơn',
      'Đáng lẽ tuổi này bạn phải biết rồi',
      'Tuổi này mà chưa đi làm à',
      'Trình độ của bạn là sơ cấp',
      'Xếp hạng của bạn tuần này',
    ]
    for (const text of bad) {
      expect(findForbiddenLanguage([text]).length).toBeGreaterThan(0)
    }
  })

  it('KHÔNG báo nhầm với câu nói bình thường', () => {
    const ok = [
      'Bạn có nhắc tới "vẽ tranh" — mình nghĩ bắt đầu từ đó là hợp nhất.',
      'Đi bộ 20 phút mỗi ngày trong tuần này, cùng một khung giờ',
      'Ghi lại mọi khoản chi trong 7 ngày tới',
      'Chia phần đang học thành 4 buổi ngắn trong 2 tuần',
      'Mình cố ý chọn việc nhỏ để bắt đầu cho nhẹ.',
    ]
    expect(findForbiddenLanguage(ok)).toEqual([])
  })
})
