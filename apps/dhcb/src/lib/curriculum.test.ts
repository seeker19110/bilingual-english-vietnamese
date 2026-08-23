import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'

// getDailySpeed() (curriculum.ts) đọc getLearnedCount() từ ./vocab, kéo theo
// progressSync → supabase — mock để test chạy OFFLINE (giống srs.test.ts).
vi.mock('./progressSync.js', () => ({ pushProgress: vi.fn() }))

import {
  DAILY_GOAL,
  wordKey,
  getCircles,
  getLearningPath,
  getTodayBatch,
  getTodayBatchFrom,
  getLevelWords,
  getBeyondCefrWords,
  getPathProgress,
  getPoolProgress,
  getDailyLearned,
  bumpDailyLearned,
  getCefrLevelOfCircle,
  loadCurriculum,
  getDailySpeed,
  setDailySpeed,
  getDailyMax,
  getDailyAllowance,
  bumpDailyQuizPasses,
  compareByFreq,
  isQuizPass,
  QUIZ_PASS_THRESHOLD_PCT,
  getSkippedToday,
  addSkippedToday,
} from './curriculum'
import { loadCefr } from '../data/cefrLoader'
import { FOUNDATION } from '../data/curriculum'
import type { DictEntry } from '../types'

// Dictionary giờ nạp ĐỘNG → phải await loadCurriculum() trước khi test các hàm dùng nó
beforeAll(async () => {
  await loadCurriculum()
})

describe('wordKey', () => {
  it('chuẩn hoá: bỏ khoảng trắng + viết thường', () => {
    expect(wordKey('  Hello ')).toBe('hello')
    expect(wordKey('I')).toBe(wordKey('i'))
  })
})

describe('getCircles — thứ tự theo lộ trình CEFR', () => {
  it('các vòng nền tảng xếp đúng thứ tự xuất hiện trong A1→B2', async () => {
    const levels = await loadCefr()
    // Thứ tự kỳ vọng: duyệt cấp → unit → vocabCircleIds, khử trùng giữ lần đầu.
    const expected: string[] = []
    const seen = new Set<string>()
    for (const lv of levels) {
      for (const u of lv.units) {
        for (const id of u.vocabCircleIds) {
          if (!seen.has(id)) {
            seen.add(id)
            expected.push(id)
          }
        }
      }
    }
    const ids = getCircles()
      .map((c) => c.id)
      .slice(0, expected.length)
    expect(ids).toEqual(expected)
  })

  it('nếu còn vòng mở rộng (extra-*, từ chưa gắn nhãn cấp) thì luôn nằm SAU toàn bộ vòng nền tảng', () => {
    // Từ 100% từ điển đã được gắn nhãn CEFR và gán vào đúng cấp (A1–C2) qua các
    // vòng "Mở rộng theo cấp" (cefr-a1-*…cefr-c2-*), "extra-*" (dành cho từ CHƯA
    // gắn nhãn) hiện có thể KHÔNG tồn tại — bất biến chỉ áp dụng khi có.
    const ids = getCircles().map((c) => c.id)
    const firstExtra = ids.findIndex((id) => id.startsWith('extra-'))
    if (firstExtra === -1) return
    expect(ids.slice(firstExtra).every((id) => id.startsWith('extra-'))).toBe(true)
  })

  it('getCefrLevelOfCircle: vòng A1 đầu tiên là A1, extra không có cấp', () => {
    expect(getCefrLevelOfCircle('greetings')).toBe('A1')
    expect(getCefrLevelOfCircle('extra-1')).toBeNull()
  })
})

describe('getLearningPath', () => {
  it('không có từ trùng key (đã khử trùng)', () => {
    const path = getLearningPath()
    const keys = path.map((e) => wordKey(e.word))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('có dữ liệu và cache trả về cùng tham chiếu', () => {
    const a = getLearningPath()
    expect(a.length).toBeGreaterThan(0)
    expect(getLearningPath()).toBe(a)
  })
})

describe('getTodayBatch', () => {
  it('trả tối đa DAILY_GOAL từ khi chưa thuộc gì', () => {
    const batch = getTodayBatch(new Set())
    expect(batch.length).toBe(DAILY_GOAL)
  })

  it('bỏ qua các từ đã thuộc', () => {
    const path = getLearningPath()
    const learned = new Set([wordKey(path[0].word)])
    const batch = getTodayBatch(learned, 5)
    expect(batch.some((e) => wordKey(e.word) === wordKey(path[0].word))).toBe(false)
    expect(batch.length).toBe(5)
  })

  it('tôn trọng tham số size', () => {
    expect(getTodayBatch(new Set(), 3).length).toBe(3)
  })
})

describe('getLevelWords / getBeyondCefrWords — từ vựng theo cấp', () => {
  it('mỗi từ chỉ thuộc đúng 1 cấp (không trùng key giữa A1 và A2)', () => {
    const a1 = new Set(getLevelWords('A1').map((w) => wordKey(w.word)))
    const a2 = getLevelWords('A2').map((w) => wordKey(w.word))
    expect(a1.size).toBeGreaterThan(0)
    expect(a2.length).toBeGreaterThan(0)
    expect(a2.filter((k) => a1.has(k))).toEqual([])
  })

  it('tổng từ của 6 cấp + phần ngoài CEFR = đúng lộ trình phẳng', () => {
    const total =
      getLevelWords('A1').length +
      getLevelWords('A2').length +
      getLevelWords('B1').length +
      getLevelWords('B2').length +
      getLevelWords('C1').length +
      getLevelWords('C2').length +
      getBeyondCefrWords().length
    expect(total).toBe(getLearningPath().length)
  })

  it('phần ngoài CEFR không chứa từ của cấp A1', () => {
    const a1 = new Set(getLevelWords('A1').map((w) => wordKey(w.word)))
    expect(getBeyondCefrWords().some((w) => a1.has(wordKey(w.word)))).toBe(false)
  })
})

describe('getTodayBatchFrom — batch theo pool tùy chọn (từ vựng 1 cấp)', () => {
  it('chỉ lấy từ trong pool, bỏ từ đã thuộc, tôn trọng size', () => {
    const pool = getLevelWords('A1')
    const learned = new Set([wordKey(pool[0].word)])
    const batch = getTodayBatchFrom(pool, learned, 5)
    expect(batch.length).toBe(5)
    expect(batch.some((e) => wordKey(e.word) === wordKey(pool[0].word))).toBe(false)
    const poolKeys = new Set(pool.map((w) => wordKey(w.word)))
    expect(batch.every((e) => poolKeys.has(wordKey(e.word)))).toBe(true)
  })

  it('pool rỗng → batch rỗng (đã thuộc hết từ của cấp)', () => {
    expect(getTodayBatchFrom([], new Set())).toEqual([])
  })

  it('defer (từ "Để sau"): hoãn xuống CUỐI hàng đợi thay vì loại hẳn — không đứng đầu batch, nhưng vẫn có mặt nếu còn chỗ', () => {
    // Pool nhỏ tự dựng (không dùng pool A1 thật — quá lớn, "hoãn cuối hàng đợi" trên pool
    // hàng nghìn từ không bao giờ kịp quay lại trong CÙNG 1 batch nhỏ để test được).
    const pool: DictEntry[] = ['a', 'b', 'c'].map((w) => ({ word: w }) as DictEntry)
    const batch = getTodayBatchFrom(pool, new Set(), 3, new Set(['a']))
    // 'a' bị hoãn nên KHÔNG đứng đầu — 'b', 'c' (không bị hoãn) chiếm 2 vị trí đầu trước.
    expect(batch.map((e) => e.word)).toEqual(['b', 'c', 'a'])
  })

  it('defer nhưng batch đã đầy TRƯỚC khi tới lượt từ bị hoãn → từ đó rơi ra ngoài batch NÀY (sẽ có mặt ở batch kế)', () => {
    const pool: DictEntry[] = ['a', 'b', 'c'].map((w) => ({ word: w }) as DictEntry)
    const batch = getTodayBatchFrom(pool, new Set(), 1, new Set(['a']))
    expect(batch.map((e) => e.word)).toEqual(['b'])
  })
})

describe('getPathProgress', () => {
  it('0 khi chưa thuộc gì, đầy đủ total', () => {
    const { done, total } = getPathProgress(new Set())
    expect(done).toBe(0)
    expect(total).toBe(getLearningPath().length)
  })

  it('đếm đúng số từ đã thuộc', () => {
    const path = getLearningPath()
    const learned = new Set([wordKey(path[0].word), wordKey(path[1].word)])
    expect(getPathProgress(learned).done).toBe(2)
  })
})

describe('getPoolProgress — tiến độ của 1 danh sách bất kỳ (vd 1 cấp CEFR)', () => {
  const W = (word: string): DictEntry => ({ word }) as DictEntry

  it('pool rỗng → total 0, không lỗi', () => {
    expect(getPoolProgress([], new Set())).toEqual({ done: 0, total: 0 })
  })

  it('chỉ đếm từ TRONG pool, bỏ qua từ đã thuộc ở ngoài pool (khác cấp)', () => {
    const pool = [W('apple'), W('banana')]
    const learned = new Set([wordKey('apple'), wordKey('outside-word')])
    expect(getPoolProgress(pool, learned)).toEqual({ done: 1, total: 2 })
  })

  it('total luôn bằng độ dài pool, không phải toàn bộ lộ trình', () => {
    const pool = [W('a'), W('b'), W('c')]
    expect(getPoolProgress(pool, new Set()).total).toBe(3)
    expect(getPoolProgress(pool, new Set()).total).not.toBe(getLearningPath().length)
  })
})

describe('bộ đếm học trong ngày', () => {
  beforeEach(() => localStorage.clear())

  it('khởi đầu bằng 0 rồi tăng dần', () => {
    expect(getDailyLearned('u1')).toBe(0)
    expect(bumpDailyLearned('u1')).toBe(1)
    expect(bumpDailyLearned('u1')).toBe(2)
    expect(getDailyLearned('u1')).toBe(2)
  })

  it('đếm tách biệt theo user', () => {
    bumpDailyLearned('u1')
    expect(getDailyLearned('u2')).toBe(0)
  })
})

describe('Từ "Để sau" trong ngày (getSkippedToday/addSkippedToday)', () => {
  beforeEach(() => localStorage.clear())

  it('chưa bấm "Để sau" lần nào → tập rỗng', () => {
    expect(getSkippedToday('u1')).toEqual(new Set())
  })

  it('bấm "Để sau" nhiều từ → tất cả có mặt, không phân biệt hoa/thường (khớp wordKey)', () => {
    addSkippedToday('u1', 'Apple')
    addSkippedToday('u1', 'banana')
    const skipped = getSkippedToday('u1')
    expect(skipped.has('apple')).toBe(true)
    expect(skipped.has('banana')).toBe(true)
    expect(skipped.size).toBe(2)
  })

  it('tách biệt theo user', () => {
    addSkippedToday('u1', 'apple')
    expect(getSkippedToday('u2').size).toBe(0)
  })
})

describe('compareByFreq — sắp phần "Mở rộng" theo tần suất', () => {
  const W = (word: string, freq?: number): DictEntry => ({ word, freq }) as DictEntry

  it('freq nhỏ hơn (thông dụng hơn) đứng trước', () => {
    expect(compareByFreq(W('the', 1), W('abandon', 5000))).toBeLessThan(0)
    expect(compareByFreq(W('abandon', 5000), W('the', 1))).toBeGreaterThan(0)
  })

  it('từ thiếu freq luôn xếp SAU từ có freq, bất kể freq lớn thế nào', () => {
    expect(compareByFreq(W('rare', 999_999), W('missing', undefined))).toBeLessThan(0)
    expect(compareByFreq(W('missing', undefined), W('rare', 999_999))).toBeGreaterThan(0)
  })

  it('cả 2 đều thiếu freq → coi bằng nhau (giữ thứ tự gốc nhờ sort ổn định)', () => {
    expect(compareByFreq(W('a'), W('b'))).toBe(0)
  })

  it('dùng làm comparator thật cho .sort(): thông dụng trước, thiếu freq xếp cuối', () => {
    const words = [W('rare', 500), W('missing1'), W('the', 1), W('missing2'), W('cat', 50)]
    const sorted = words.sort(compareByFreq).map((w) => w.word)
    expect(sorted).toEqual(['the', 'cat', 'rare', 'missing1', 'missing2'])
  })
})

describe('Tốc độ học 5/10/20 từ/ngày', () => {
  beforeEach(() => localStorage.clear())

  it('người dùng MỚI (chưa có từ đã thuộc) mặc định 10', () => {
    expect(getDailySpeed('new-user')).toBe(10)
  })

  it('người dùng ĐÃ HỌC (có tiến độ trước đó) giữ mặc định 20', () => {
    localStorage.setItem('et_learned_existing-user', JSON.stringify(['apple']))
    expect(getDailySpeed('existing-user')).toBe(20)
  })

  it('setDailySpeed ghi đè mặc định, đọc lại đúng giá trị đã chọn', () => {
    setDailySpeed('u1', 5)
    expect(getDailySpeed('u1')).toBe(5)
  })

  it('getDailyMax = 5 × tốc độ đã chọn', () => {
    setDailySpeed('u1', 5)
    expect(getDailyMax('u1')).toBe(25)
    setDailySpeed('u1', 20)
    expect(getDailyMax('u1')).toBe(100)
  })

  it('getDailyAllowance tăng theo số lần pass quiz, cap tại getDailyMax', () => {
    setDailySpeed('u1', 5)
    expect(getDailyAllowance('u1')).toBe(5)
    bumpDailyQuizPasses('u1')
    expect(getDailyAllowance('u1')).toBe(10)
    for (let i = 0; i < 10; i++) bumpDailyQuizPasses('u1')
    expect(getDailyAllowance('u1')).toBe(getDailyMax('u1')) // cap, không vượt quá
  })
})

// Ngưỡng "đạt" dùng chung cho mini-quiz (tab "Hôm nay") VÀ quiz tổng hợp (tab "Kiểm tra") —
// cả 2 nơi đều gọi isQuizPass() để mở thêm từ mới, tránh lệch ngưỡng giữa 2 cơ chế.
describe('isQuizPass — ngưỡng đạt để mở thêm từ mới', () => {
  it(`đúng ngưỡng ${QUIZ_PASS_THRESHOLD_PCT}% → đạt`, () => {
    expect(isQuizPass(9, 10)).toBe(true) // 90%
    expect(isQuizPass(18, 20)).toBe(true) // 90%
  })

  it('sai quá 1 câu ở batch ≥10 câu (đúng ngưỡng % cũ) → không đạt', () => {
    expect(isQuizPass(8, 10)).toBe(false) // 80%, sai 2 câu > cho phép 1
  })

  it('đúng 100% → luôn đạt', () => {
    expect(isQuizPass(5, 5)).toBe(true)
    expect(isQuizPass(20, 20)).toBe(true)
  })

  it('0 câu hỏi (total=0) → không đạt, tránh chia cho 0', () => {
    expect(isQuizPass(0, 0)).toBe(false)
  })

  it('0 câu đúng → không đạt', () => {
    expect(isQuizPass(0, 10)).toBe(false)
  })

  it('batch nhỏ (<10 câu — tốc độ 5 từ/ngày, comeback 3 từ) LUÔN được sai tối thiểu 1 câu, không bắt buộc 100%', () => {
    expect(isQuizPass(4, 5)).toBe(true) // 80%, sai 1/5 — trước đây bắt buộc đúng cả 5
    expect(isQuizPass(2, 3)).toBe(true) // comeback: sai 1/3 vẫn đạt
    expect(isQuizPass(3, 5)).toBe(false) // sai 2/5 — vượt quá 1 câu cho phép
  })
})

// GĐ 4 (PROGRESS.md 2026-07-22) — ẩn hẳn vòng gắn `notForKids` khỏi luồng học của
// nhóm tuổi Nhi đồng, KHÔNG ảnh hưởng các nhóm tuổi khác (mặc định undefined = y hệt cũ).
describe('Lọc theo nhóm tuổi — ẩn vòng notForKids cho Nhi đồng (GĐ 4)', () => {
  const notForKidsIds = FOUNDATION.filter((c) => c.notForKids).map((c) => c.id)

  it('dữ liệu thật có ít nhất 1 vòng gắn notForKids (không phải test rỗng vô nghĩa)', () => {
    expect(notForKidsIds.length).toBeGreaterThan(0)
  })

  it('getCircles() mặc định (không rõ nhóm tuổi) VẪN CÓ đủ vòng notForKids', () => {
    const ids = new Set(getCircles().map((c) => c.id))
    for (const id of notForKidsIds) expect(ids.has(id)).toBe(true)
  })

  it("getCircles('nhi_dong') ẨN HẲN mọi vòng notForKids", () => {
    const ids = new Set(getCircles('nhi_dong').map((c) => c.id))
    for (const id of notForKidsIds) expect(ids.has(id)).toBe(false)
  })

  it('các nhóm tuổi khác (thanh_nien/nguoi_lon) không lọc gì — giống hệt mặc định', () => {
    const def = getCircles().map((c) => c.id)
    expect(getCircles('thanh_nien').map((c) => c.id)).toEqual(def)
    expect(getCircles('nguoi_lon').map((c) => c.id)).toEqual(def)
  })

  it("getLearningPath('nhi_dong') NGẮN HƠN mặc định và không chứa từ của vòng bị ẩn", () => {
    const hiddenCircle = FOUNDATION.find((c) => c.notForKids)!
    const hiddenWordKey = wordKey(hiddenCircle.words[0].word)
    const full = getLearningPath()
    const kidPath = getLearningPath('nhi_dong')
    expect(kidPath.length).toBeLessThan(full.length)
    expect(full.some((w) => wordKey(w.word) === hiddenWordKey)).toBe(true)
    expect(kidPath.some((w) => wordKey(w.word) === hiddenWordKey)).toBe(false)
  })

  it('từ của vòng bị ẩn KHÔNG lọt sang phần "Mở rộng" (ẩn hẳn, không phải chuyển chỗ)', () => {
    const hiddenCircle = FOUNDATION.find((c) => c.notForKids)!
    const hiddenWordKey = wordKey(hiddenCircle.words[0].word)
    // Nếu lọt vào "Mở rộng" thì vẫn xuất hiện trong kidExtraWords (chỉ khác vị trí, không khác
    // nội dung) — bài test trên đã xác nhận KHÔNG xuất hiện trong cả lộ trình, ở đây xác nhận
    // rõ thêm riêng phần "Mở rộng".
    const kidExtraWords = getCircles('nhi_dong')
      .filter((c) => c.id.startsWith('extra-'))
      .flatMap((c) => c.words)
    expect(kidExtraWords.some((w) => wordKey(w.word) === hiddenWordKey)).toBe(false)
  })

  it('getPathProgress: total của nhi_dong nhỏ hơn mặc định', () => {
    const def = getPathProgress(new Set())
    const kid = getPathProgress(new Set(), 'nhi_dong')
    expect(kid.total).toBeLessThan(def.total)
  })

  it('getTodayBatch: không trả về từ thuộc vòng bị ẩn cho nhi_dong', () => {
    const hiddenCircle = FOUNDATION.find((c) => c.notForKids)!
    const hiddenWordKey = wordKey(hiddenCircle.words[0].word)
    // Lấy hết lộ trình nhi_dong làm batch (size lớn) để chắc chắn quét hết, xác nhận không
    // có từ vòng ẩn nào lọt qua.
    const batch = getTodayBatch(new Set(), getLearningPath('nhi_dong').length, 'nhi_dong')
    expect(batch.some((w) => wordKey(w.word) === hiddenWordKey)).toBe(false)
  })

  it('getLevelWords: cấp có chứa vòng bị ẩn (vd workplace/social-issues/medical-advanced) trả ít từ hơn cho nhi_dong', () => {
    // 'workplace' là 1 trong các vòng notForKids đã xác nhận nằm trong lộ trình CEFR chính
    // thức (cefr.ts) — cấp chứa nó phải có ÍT từ hơn khi lọc cho nhi_dong.
    const levelId = getCefrLevelOfCircle('workplace')
    expect(levelId).not.toBeNull()
    const full = getLevelWords(levelId!)
    const kid = getLevelWords(levelId!, 'nhi_dong')
    expect(kid.length).toBeLessThan(full.length)
  })

  it('cache theo nhóm tuổi: gọi lại cùng ageGroup trả về cùng tham chiếu (không tính lại)', () => {
    const a = getCircles('nhi_dong')
    expect(getCircles('nhi_dong')).toBe(a)
    const p = getLearningPath('nhi_dong')
    expect(getLearningPath('nhi_dong')).toBe(p)
  })
})
