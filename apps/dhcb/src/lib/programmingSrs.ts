// programmingSrs — Thẻ SRS môn Lập trình (PR-L10), nối vào HỆ SRS CHUNG của app.
//
// KHÔNG dựng hệ nhắc lại ngắt quãng riêng: `lib/srs.ts` đã có FSRS thật, đồng bộ server và
// dự phòng ngoại tuyến. Ở đây chỉ cần một NAMESPACE khoá riêng để thẻ lập trình không đụng
// từ vựng tiếng Anh (`word`) hay bài ngữ pháp (`grammar:`) đang sống chung kho `srs_${uid}`
// — đúng khuôn mà mạch ngữ pháp đã dùng (xem grammarKey trong lib/srs.ts).
//
// Khoá một thẻ: `prog:<lessonId>:<số thứ tự thẻ>`. Có số thứ tự vì mỗi bài 2–4 thẻ và mỗi thẻ
// phải có lịch ôn RIÊNG — thẻ khó ôn dày, thẻ dễ giãn ra, đó là toàn bộ giá trị của SRS.
//
// HAI TẦNG (từ đợt tối ưu bundle 2026-09-01): phần ĐẾM và LỌC ĐẾN HẠN chỉ cần chỉ mục nhẹ
// (số thẻ mỗi bài) nên vẫn đồng bộ; NỘI DUNG câu hỏi/đáp án nằm trong bài học, chỉ nạp lười
// đúng các unit có thẻ đến hạn (`hydrateProgCards`) — không kéo cả môn vào màn ôn.
import { addToSRS, reviewWord, getDueBy, type Rating } from './srs'
import {
  LESSON_INDEX,
  getLessonSummary,
  loadLessons,
} from '@dhcb/subject-programming/lessonsLoader'

/** Một thẻ trong hàng đợi — đủ để chấm và biết thuộc bài nào, CHƯA có nội dung. */
export interface ProgSrsCardRef {
  /** Khoá SRS — dùng khi chấm (reviewProgCard). */
  key: string
  lessonId: string
  lessonTitle: string
  index: number
}

/** Thẻ đã có nội dung, đủ để dựng màn ôn. */
export interface ProgSrsCard extends ProgSrsCardRef {
  hoi: string
  dap: string
}

// Hạ chữ thường TOÀN BỘ khoá: addToSRS/reviewWord bên trong đã tự hạ, nên nếu đọc bằng khoá
// còn chữ hoa thì GHI một đằng ĐỌC một nẻo — thẻ không bao giờ đến hạn, hỏng im lặng (đúng
// cái bẫy đã ghi lại ở mạch ngữ pháp, audit 2026-08-12).
const cardKey = (lessonId: string, index: number) => `prog:${lessonId}:${index}`.toLowerCase()

/** Đưa TOÀN BỘ thẻ của một bài vào vòng ôn — gọi khi học viên đạt bài Make. */
export function addLessonCardsToSrs(uid: string, lessonId: string): void {
  const soThe = getLessonSummary(lessonId)?.srsCardCount ?? 0
  for (let i = 0; i < soThe; i++) addToSRS(uid, cardKey(lessonId, i))
}

/** Chấm một thẻ sau khi học viên tự đánh giá. */
export function reviewProgCard(uid: string, key: string, rating: Rating): void {
  reviewWord(uid, key, rating)
}

/** Mọi thẻ của môn (chưa có nội dung), dựng từ chỉ mục bài học — nguồn sự thật duy nhất. */
function tatCaThe(): ProgSrsCardRef[] {
  return LESSON_INDEX.flatMap((lesson) =>
    Array.from({ length: lesson.srsCardCount }, (_, i) => ({
      key: cardKey(lesson.id, i),
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      index: i,
    })),
  )
}

/** Các thẻ ĐẾN HẠN ôn — phần lọc/sắp xếp dùng chung getDueBy của hệ SRS (lib/srs.ts). */
export function getDueProgCards(uid: string, limit?: number): ProgSrsCardRef[] {
  return getDueBy(uid, tatCaThe(), (c) => c.key, limit)
}

/**
 * Nạp nội dung cho các thẻ trong hàng đợi (chỉ tải đúng các unit liên quan). Thẻ mà bài học
 * không còn/không còn đủ thẻ (nội dung đã sửa) thì bị bỏ khỏi kết quả thay vì hiện thẻ trống.
 */
export async function hydrateProgCards(refs: readonly ProgSrsCardRef[]): Promise<ProgSrsCard[]> {
  const lessons = await loadLessons(refs.map((r) => r.lessonId))
  const out: ProgSrsCard[] = []
  for (const ref of refs) {
    const card = lessons.get(ref.lessonId)?.srsCards?.[ref.index]
    if (card) out.push({ ...ref, hoi: card.hoi, dap: card.dap })
  }
  return out
}

/** Tổng số thẻ của môn (để hiện "x/y thẻ đến hạn" mà không phải đếm lại ở UI). */
export function countProgCards(): number {
  return LESSON_INDEX.reduce((n, l) => n + l.srsCardCount, 0)
}
