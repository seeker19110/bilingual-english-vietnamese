// programmingSrs — Thẻ SRS môn Lập trình (PR-L10), nối vào HỆ SRS CHUNG của app.
//
// KHÔNG dựng hệ nhắc lại ngắt quãng riêng: `lib/srs.ts` đã có FSRS thật, đồng bộ server và
// dự phòng ngoại tuyến. Ở đây chỉ cần một NAMESPACE khoá riêng để thẻ lập trình không đụng
// từ vựng tiếng Anh (`word`) hay bài ngữ pháp (`grammar:`) đang sống chung kho `srs_${uid}`
// — đúng khuôn mà mạch ngữ pháp đã dùng (xem grammarKey trong lib/srs.ts).
//
// Khoá một thẻ: `prog:<lessonId>:<số thứ tự thẻ>`. Có số thứ tự vì mỗi bài 2–4 thẻ và mỗi thẻ
// phải có lịch ôn RIÊNG — thẻ khó ôn dày, thẻ dễ giãn ra, đó là toàn bộ giá trị của SRS.
import { addToSRS, reviewWord, getDueBy, type Rating } from './srs'
import { PROGRAMMING_LESSONS, getLesson } from '@dhcb/subject-programming/lessons'

/** Một thẻ đang chờ ôn, kèm đủ ngữ cảnh để dựng màn ôn mà không phải tra lại. */
export interface ProgSrsCard {
  /** Khoá SRS — dùng khi chấm (reviewProgCard). */
  key: string
  lessonId: string
  lessonTitle: string
  index: number
  hoi: string
  dap: string
}

// Hạ chữ thường TOÀN BỘ khoá: addToSRS/reviewWord bên trong đã tự hạ, nên nếu đọc bằng khoá
// còn chữ hoa thì GHI một đằng ĐỌC một nẻo — thẻ không bao giờ đến hạn, hỏng im lặng (đúng
// cái bẫy đã ghi lại ở mạch ngữ pháp, audit 2026-08-12).
const cardKey = (lessonId: string, index: number) => `prog:${lessonId}:${index}`.toLowerCase()

/** Đưa TOÀN BỘ thẻ của một bài vào vòng ôn — gọi khi học viên đạt bài Make. */
export function addLessonCardsToSrs(uid: string, lessonId: string): void {
  const lesson = getLesson(lessonId)
  if (!lesson?.srsCards) return
  lesson.srsCards.forEach((_, i) => addToSRS(uid, cardKey(lessonId, i)))
}

/** Chấm một thẻ sau khi học viên tự đánh giá. */
export function reviewProgCard(uid: string, key: string, rating: Rating): void {
  reviewWord(uid, key, rating)
}

/** Mọi thẻ của môn, dựng từ nội dung bài học (nguồn sự thật duy nhất). */
function tatCaThe(): ProgSrsCard[] {
  return PROGRAMMING_LESSONS.flatMap((lesson) =>
    (lesson.srsCards ?? []).map((card, i) => ({
      key: cardKey(lesson.id, i),
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      index: i,
      hoi: card.hoi,
      dap: card.dap,
    })),
  )
}

/** Các thẻ ĐẾN HẠN ôn — phần lọc/sắp xếp dùng chung getDueBy của hệ SRS (lib/srs.ts). */
export function getDueProgCards(uid: string, limit?: number): ProgSrsCard[] {
  return getDueBy(uid, tatCaThe(), (c) => c.key, limit)
}

/** Tổng số thẻ của môn (để hiện "x/y thẻ đến hạn" mà không phải đếm lại ở UI). */
export function countProgCards(): number {
  return PROGRAMMING_LESSONS.reduce((n, l) => n + (l.srsCards?.length ?? 0), 0)
}
