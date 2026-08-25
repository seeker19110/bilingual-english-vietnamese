// CỔNG NỘI DUNG cho THẺ SRS môn Lập trình (PR-L10) — bước ⑧ của khuôn bài học 8 bước.
//
// Thẻ SRS là thứ học viên gặp lại sau nhiều NGÀY, khi đã quên gần hết ngữ cảnh của bài. Một
// thẻ hỏi hai ý, hỏi chi tiết vụn vặt của đề bài, hay có đáp án cụt lủn thì lúc đó vô dụng —
// mà kiểu TypeScript không bắt được điều gì trong số đó. Cổng này canh phần chất lượng ấy.
//
// Nguyên tắc: mọi luật ở đây đều rút từ luật soạn thẻ đã ghi trong brief nội dung, và mỗi
// luật phải BẮT ĐƯỢC lỗi thật — không phải test cho có (xem nhóm test cuối file).
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { LessonSchema } from './lessonTypes.js'

const CO_THE = PROGRAMMING_LESSONS.filter((l) => l.srsCards && l.srsCards.length > 0)

/**
 * Hỏi HAI Ý trong một thẻ — thứ khiến học viên không biết phải nhớ cái gì.
 *
 * Đếm dấu hỏi là chưa đủ: "…có đổi không? Vì sao?" chỉ là MỘT ý được đào sâu, và đó là khuôn
 * sư phạm tốt. Cái đáng chặn là hai câu hỏi VỀ HAI THỨ KHÁC NHAU ghép lại. Nên ở đây bỏ qua
 * các đuôi đào sâu ("vì sao", "tại sao", "cho ví dụ"…) rồi mới đếm.
 */
const DUOI_DAO_SAU = /\b(vì sao|tại sao|sao vậy|cho ví dụ|ví dụ\??)\s*\?/gi

function hoiHaiY(hoi: string): boolean {
  return (hoi.replace(DUOI_DAO_SAU, '').match(/\?/g)?.length ?? 0) > 1
}

/** Đáp án cụt: quá ngắn thì học viên không tự chấm đúng/sai được. */
const DAP_TOI_THIEU = 40

describe('thẻ SRS môn Lập trình', () => {
  it('có ít nhất một bài đã soạn thẻ (chặn quên hẳn bước ⑧)', () => {
    expect(CO_THE.length).toBeGreaterThan(0)
  })

  it.each(CO_THE)('$id — mỗi thẻ hỏi ĐÚNG MỘT ý', (lesson) => {
    for (const card of lesson.srsCards!) {
      expect(hoiHaiY(card.hoi), `Bài ${lesson.id}: thẻ hỏi hai ý — "${card.hoi}"`).toBe(false)
    }
  })

  it.each(CO_THE)('$id — đáp án đủ dài để tự chấm đúng/sai', (lesson) => {
    for (const card of lesson.srsCards!) {
      expect(
        card.dap.length,
        `Bài ${lesson.id}: đáp án quá cụt (${card.dap.length} ký tự) — "${card.hoi}"`,
      ).toBeGreaterThanOrEqual(DAP_TOI_THIEU)
    }
  })

  it.each(CO_THE)('$id — hai thẻ trong cùng bài không hỏi trùng nhau', (lesson) => {
    const hoi = lesson.srsCards!.map((c) => c.hoi.trim().toLowerCase())
    expect(new Set(hoi).size, `Bài ${lesson.id}: có thẻ trùng câu hỏi`).toBe(hoi.length)
  })

  it.each(CO_THE)('$id — câu hỏi KHÔNG tự lộ đáp án ngay trong đề', (lesson) => {
    for (const card of lesson.srsCards!) {
      // Đáp án nằm nguyên văn trong câu hỏi thì lật thẻ chẳng còn nghĩa gì. So phần đầu của
      // đáp án (30 ký tự) cho khỏi bắt oan những trùng lặp từ ngữ tự nhiên.
      const dauDap = card.dap.slice(0, 30).toLowerCase()
      expect(
        card.hoi.toLowerCase().includes(dauDap),
        `Bài ${lesson.id}: câu hỏi lộ sẵn đáp án — "${card.hoi}"`,
      ).toBe(false)
    }
  })

  it('không có thẻ nào trùng nhau GIỮA các bài (ôn hai lần cùng một thứ là phí)', () => {
    const thay = new Map<string, string>()
    for (const lesson of CO_THE) {
      for (const card of lesson.srsCards!) {
        const khoa = card.hoi.trim().toLowerCase()
        const truoc = thay.get(khoa)
        expect(truoc, `Thẻ "${card.hoi}" xuất hiện ở cả ${truoc} và ${lesson.id}`).toBeUndefined()
        thay.set(khoa, lesson.id)
      }
    }
  })

  it('mọi bài có thẻ đều hợp schema (2–4 thẻ, độ dài trong giới hạn)', () => {
    for (const lesson of CO_THE) {
      expect(LessonSchema.safeParse(lesson).success, `Bài ${lesson.id} sai khuôn`).toBe(true)
    }
  })
})

// Cổng chỉ đáng tin khi chứng minh được nó BẮT ĐƯỢC lỗi thật — nếu không, một luật viết sai
// sẽ im lặng cho qua mọi thứ và ta tưởng nội dung đang được canh.
describe('cổng thẻ SRS thật sự bắt lỗi', () => {
  it('nhận diện thẻ hỏi hai ý, nhưng KHÔNG bắt oan đuôi đào sâu', () => {
    expect(hoiHaiY('Biến là gì? Còn hằng số thì sao?')).toBe(true)
    expect(hoiHaiY('input() luôn trả về kiểu gì?')).toBe(false)
    // Đào sâu cùng một ý — hợp lệ, và là khuôn sư phạm nên khuyến khích.
    expect(hoiHaiY('Gọi ten.strip() mà không gán lại thì ten có đổi không? Vì sao?')).toBe(false)
  })

  it('schema chặn bài chỉ có 1 thẻ hoặc quá 4 thẻ', () => {
    const nen = PROGRAMMING_LESSONS.find((l) => l.srsCards)!
    const the = { hoi: 'Hỏi thử?', dap: 'Đáp thử đủ dài để vượt ngưỡng tự chấm đúng sai.' }
    expect(LessonSchema.safeParse({ ...nen, srsCards: [the] }).success).toBe(false)
    expect(LessonSchema.safeParse({ ...nen, srsCards: Array(5).fill(the) }).success).toBe(false)
  })
})
