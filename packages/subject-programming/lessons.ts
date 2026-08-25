// lessons — Registry BÀI HỌC 8 BƯỚC (gộp từ các file theo unit) + hàm tra cứu.
//
// Nội dung nằm ở `lessons/<bậc><unit>.ts` — mỗi unit MỘT file để soạn song song không đụng
// nhau và để đọc/sửa từng bài không phải cuộn qua file khổng lồ. Thêm unit mới: tạo file
// theo khuôn (xem lessons/p1u4.ts), rồi thêm 1 dòng import + 1 phần tử vào mảng dưới đây.
//
// Mọi bài PHẢI qua LessonSchema (lessons.test.ts) và code mẫu PHẢI chạy thật đạt hết
// test-case (lessonsPython.test.ts chạy python3 — cổng nội dung mạnh nhất của môn).
import type { ProgrammingLesson } from './lessonTypes.js'
import { P1U1_LESSONS } from './lessons/p1u1.js'
import { P1U2_LESSONS } from './lessons/p1u2.js'
import { P1U3_LESSONS } from './lessons/p1u3.js'
import { P1U4_LESSONS } from './lessons/p1u4.js'
import { P1U5_LESSONS } from './lessons/p1u5.js'
import { P1U6_LESSONS } from './lessons/p1u6.js'
import { P1U7_LESSONS } from './lessons/p1u7.js'
import { P1U8_LESSONS } from './lessons/p1u8.js'
import { P1U9_LESSONS } from './lessons/p1u9.js'
import { P1U10_LESSONS } from './lessons/p1u10.js'
import { P2U1_LESSONS } from './lessons/p2u1.js'
import { P2U2_LESSONS } from './lessons/p2u2.js'
import { P2U3_LESSONS } from './lessons/p2u3.js'
import { P2U4_LESSONS } from './lessons/p2u4.js'
import { P2U5_LESSONS } from './lessons/p2u5.js'
import { P2U6_LESSONS } from './lessons/p2u6.js'
import { P2U7_LESSONS } from './lessons/p2u7.js'
import { P2U8_LESSONS } from './lessons/p2u8.js'
import { P2U9_LESSONS } from './lessons/p2u9.js'
import { P2U10_LESSONS } from './lessons/p2u10.js'

export const PROGRAMMING_LESSONS: ProgrammingLesson[] = [
  ...P1U1_LESSONS,
  ...P1U2_LESSONS,
  ...P1U3_LESSONS,
  ...P1U4_LESSONS,
  ...P1U5_LESSONS,
  ...P1U6_LESSONS,
  ...P1U7_LESSONS,
  ...P1U8_LESSONS,
  ...P1U9_LESSONS,
  ...P1U10_LESSONS,
  ...P2U1_LESSONS,
  ...P2U2_LESSONS,
  ...P2U3_LESSONS,
  ...P2U4_LESSONS,
  ...P2U5_LESSONS,
  ...P2U6_LESSONS,
  ...P2U7_LESSONS,
  ...P2U8_LESSONS,
  ...P2U9_LESSONS,
  ...P2U10_LESSONS,
]

const lessonMap = new Map(PROGRAMMING_LESSONS.map((l) => [l.id, l]))

export function getLesson(lessonId: string): ProgrammingLesson | undefined {
  return lessonMap.get(lessonId)
}

/** Bài học của một unit (unit chưa soạn bài → mảng rỗng — UI hiện "sắp mở"). */
export function getLessonsByUnit(unitId: string): ProgrammingLesson[] {
  return PROGRAMMING_LESSONS.filter((l) => l.unitId === unitId)
}
