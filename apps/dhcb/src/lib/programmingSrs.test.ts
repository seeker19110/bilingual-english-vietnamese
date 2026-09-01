// programmingSrs — thẻ SRS môn Lập trình nối vào hệ SRS chung (PR-L10).
//
// Điều đáng test nhất ở đây KHÔNG phải thuật toán giãn cách (ts-fsrs lo, đã có test riêng ở
// srs.test.ts) mà là phần dễ hỏng IM LẶNG: khoá namespace phải ghi/đọc khớp nhau, thẻ của
// môn này không được lẫn vào thống kê từ vựng tiếng Anh, và thẻ chỉ vào vòng ôn khi học viên
// thật sự đạt bài.
import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  addLessonCardsToSrs,
  reviewProgCard,
  getDueProgCards,
  hydrateProgCards,
  countProgCards,
} from './programmingSrs'
import { getSRSStats, _resetSrsMemCacheForTests } from './srs'
import { PROGRAMMING_LESSONS } from '@dhcb/subject-programming/lessons'

const UID = 'u-test'
/** Bài đầu tiên có thẻ — dùng làm mẫu để không phụ thuộc id cụ thể khi nội dung đổi. */
const BAI = PROGRAMMING_LESSONS.find((l) => l.srsCards && l.srsCards.length > 0)!

describe('programmingSrs', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetSrsMemCacheForTests()
    vi.useRealTimers()
  })

  it('kho thẻ dựng từ chính nội dung bài học (không có bảng thẻ chép tay song song)', () => {
    const tuBaiHoc = PROGRAMMING_LESSONS.reduce((n, l) => n + (l.srsCards?.length ?? 0), 0)
    expect(countProgCards()).toBe(tuBaiHoc)
    expect(countProgCards()).toBeGreaterThan(0)
  })

  it('đạt bài → TOÀN BỘ thẻ của bài vào vòng ôn, mỗi thẻ một lịch riêng', async () => {
    addLessonCardsToSrs(UID, BAI.id)
    // Thẻ mới chưa tới hạn ngay (NEW_CARD_DELAY_MS), nên phải nhìn bằng đồng hồ tương lai.
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 30 * 24 * 3_600_000)
    const due = getDueProgCards(UID)
    expect(due.filter((c) => c.lessonId === BAI.id)).toHaveLength(BAI.srsCards!.length)
    expect(due[0]!.lessonTitle).toBe(BAI.title)
    // Nội dung thẻ nạp lười từ đúng bài học — khớp từng chữ với nguồn sự thật.
    const cards = await hydrateProgCards(due)
    expect(cards).toHaveLength(due.length)
    expect(cards[0]!.hoi).toBe(BAI.srsCards![due[0]!.index]!.hoi)
    expect(cards[0]!.dap).toBe(BAI.srsCards![due[0]!.index]!.dap)
  })

  it('hydrate bỏ qua thẻ mà bài học không còn (nội dung đã đổi), không hiện thẻ trống', async () => {
    const cards = await hydrateProgCards([
      { key: 'prog:khong-co-bai-nay:0', lessonId: 'khong-co-bai-nay', lessonTitle: '?', index: 0 },
      { key: `prog:${BAI.id}:999`, lessonId: BAI.id, lessonTitle: BAI.title, index: 999 },
    ])
    expect(cards).toEqual([])
  })

  it('bài KHÔNG có thẻ thì không thêm gì (không tạo thẻ rỗng)', () => {
    const khongThe = PROGRAMMING_LESSONS.find((l) => !l.srsCards)
    if (!khongThe) return // mọi bài đều đã có thẻ — không còn gì để kiểm
    addLessonCardsToSrs(UID, khongThe.id)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 30 * 24 * 3_600_000)
    expect(getDueProgCards(UID).filter((c) => c.lessonId === khongThe.id)).toHaveLength(0)
  })

  it('lessonId không tồn tại → bỏ qua êm, không ném lỗi', () => {
    expect(() => addLessonCardsToSrs(UID, 'khong-co-bai-nay')).not.toThrow()
  })

  it('chấm "nhớ được" thì thẻ giãn ra, không còn đến hạn ngay', () => {
    addLessonCardsToSrs(UID, BAI.id)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 30 * 24 * 3_600_000)
    const truoc = getDueProgCards(UID)
    expect(truoc.length).toBeGreaterThan(0)
    reviewProgCard(UID, truoc[0]!.key, 'good')
    const sau = getDueProgCards(UID)
    expect(sau.map((c) => c.key)).not.toContain(truoc[0]!.key)
  })

  it('chấm "quên rồi" thì thẻ quay lại sớm — vẫn nằm trong hàng đợi', () => {
    addLessonCardsToSrs(UID, BAI.id)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 30 * 24 * 3_600_000)
    const truoc = getDueProgCards(UID)
    reviewProgCard(UID, truoc[0]!.key, 'again')
    // Thẻ "again" hẹn lại sau vài phút — nhìn ở mốc 1 giờ sau là thấy nó trở lại.
    vi.setSystemTime(Date.now() + 3_600_000)
    expect(getDueProgCards(UID).map((c) => c.key)).toContain(truoc[0]!.key)
  })

  it('thẻ lập trình KHÔNG lẫn vào thống kê từ vựng tiếng Anh (namespace riêng)', () => {
    const truoc = getSRSStats(UID).total
    addLessonCardsToSrs(UID, BAI.id)
    expect(getSRSStats(UID).total).toBe(truoc)
  })

  it('limit cắt đúng số thẻ cho một phiên ôn', () => {
    for (const l of PROGRAMMING_LESSONS.filter((x) => x.srsCards)) addLessonCardsToSrs(UID, l.id)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 30 * 24 * 3_600_000)
    expect(getDueProgCards(UID, 3)).toHaveLength(3)
  })
})
