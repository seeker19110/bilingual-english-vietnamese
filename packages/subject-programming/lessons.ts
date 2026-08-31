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
import { P3U1_LESSONS } from './lessons/p3u1.js'
import { P3U2_LESSONS } from './lessons/p3u2.js'
import { P3U3_LESSONS } from './lessons/p3u3.js'
import { P3U4_LESSONS } from './lessons/p3u4.js'
import { P3U5_LESSONS } from './lessons/p3u5.js'
import { P3U6_LESSONS } from './lessons/p3u6.js'
import { P3U6B_LESSONS } from './lessons/p3u6b.js'
import { P3U7_LESSONS } from './lessons/p3u7.js'
import { P3U8_LESSONS } from './lessons/p3u8.js'
import { P3U9_LESSONS } from './lessons/p3u9.js'
import { P3U10_LESSONS } from './lessons/p3u10.js'
import { P3U11_LESSONS } from './lessons/p3u11.js'
import { P3U12_LESSONS } from './lessons/p3u12.js'
import { P4U1_LESSONS } from './lessons/p4u1.js'
import { P4U2_LESSONS } from './lessons/p4u2.js'
import { P4U3_LESSONS } from './lessons/p4u3.js'
import { P4U4_LESSONS } from './lessons/p4u4.js'
import { P4U5_LESSONS } from './lessons/p4u5.js'
import { P4U6_LESSONS } from './lessons/p4u6.js'
import { P4U7_LESSONS } from './lessons/p4u7.js'

import { P4U8_LESSONS } from './lessons/p4u8.js'

import { P4U9_LESSONS } from './lessons/p4u9.js'
import { P4U10_LESSONS } from './lessons/p4u10.js'
import { P4U11_LESSONS } from './lessons/p4u11.js'
import { P4U12_LESSONS } from './lessons/p4u12.js'
import { P5U1_LESSONS } from './lessons/p5u1.js'
import { P5U2_LESSONS } from './lessons/p5u2.js'
import { P5U3_LESSONS } from './lessons/p5u3.js'
import { P5U4_LESSONS } from './lessons/p5u4.js'
import { P5U5_LESSONS } from './lessons/p5u5.js'
import { P5U6_LESSONS } from './lessons/p5u6.js'
import { P5U7_LESSONS } from './lessons/p5u7.js'
import { P5U8_LESSONS } from './lessons/p5u8.js'
import { P5U9_LESSONS } from './lessons/p5u9.js'
import { P6U1_LESSONS } from './lessons/p6u1.js'
import { P6U2_LESSONS } from './lessons/p6u2.js'
import { P6U3_LESSONS } from './lessons/p6u3.js'
import { P6U4_LESSONS } from './lessons/p6u4.js'
import { P6U16_LESSONS } from './lessons/p6u16.js'
import { P6U17_LESSONS } from './lessons/p6u17.js'
import { P6U18_LESSONS } from './lessons/p6u18.js'
import { P6U19_LESSONS } from './lessons/p6u19.js'
import { P6U20_LESSONS } from './lessons/p6u20.js'
import { P6U21_LESSONS } from './lessons/p6u21.js'
import { P6U22_LESSONS } from './lessons/p6u22.js'
import { P6U23_LESSONS } from './lessons/p6u23.js'
import { P6U24_LESSONS } from './lessons/p6u24.js'
import { P6U61_LESSONS } from './lessons/p6u61.js'
import { P6U62_LESSONS } from './lessons/p6u62.js'
import { P6U63_LESSONS } from './lessons/p6u63.js'
import { GIT_U2_LESSONS } from './lessons/gitu2.js'
import { GIT_U3_LESSONS } from './lessons/gitu3.js'
import { GIT_U4_LESSONS } from './lessons/gitu4.js'
import { GIT_U5_LESSONS } from './lessons/gitu5.js'
import { HERMES_U1_LESSONS } from './lessons/hermesu1.js'
import { HERMES_U2_LESSONS } from './lessons/hermesu2.js'
import { HERMES_U3_LESSONS } from './lessons/hermesu3.js'
import { HERMES_U4_LESSONS } from './lessons/hermesu4.js'
import { OPENCLAW_U1_LESSONS } from './lessons/openclawu1.js'

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
  ...P3U1_LESSONS,
  ...P3U2_LESSONS,
  ...P3U3_LESSONS,
  ...P3U4_LESSONS,
  ...P3U5_LESSONS,
  ...P3U6_LESSONS,
  ...P3U6B_LESSONS,
  ...P3U7_LESSONS,
  ...P3U8_LESSONS,
  ...P3U9_LESSONS,
  ...P3U10_LESSONS,
  ...P3U11_LESSONS,
  ...P3U12_LESSONS,
  ...P4U1_LESSONS,
  ...P4U2_LESSONS,
  ...P4U3_LESSONS,
  ...P4U4_LESSONS,
  ...P4U5_LESSONS,
  ...P4U6_LESSONS,
  ...P4U7_LESSONS,
  ...P4U8_LESSONS,
  ...P4U9_LESSONS,
  ...P4U10_LESSONS,
  ...P4U11_LESSONS,
  ...P4U12_LESSONS,
  ...P5U1_LESSONS,
  ...P5U2_LESSONS,
  ...P5U3_LESSONS,
  ...P5U4_LESSONS,
  ...P5U5_LESSONS,
  ...P5U6_LESSONS,
  ...P5U7_LESSONS,
  ...P5U8_LESSONS,
  ...P5U9_LESSONS,
  ...P6U1_LESSONS,
  ...P6U2_LESSONS,
  ...P6U3_LESSONS,
  ...P6U4_LESSONS,
  ...P6U16_LESSONS,
  ...P6U17_LESSONS,
  ...P6U18_LESSONS,
  ...P6U19_LESSONS,
  ...P6U20_LESSONS,
  ...P6U21_LESSONS,
  ...P6U22_LESSONS,
  ...P6U23_LESSONS,
  ...P6U24_LESSONS,
  ...P6U61_LESSONS,
  ...P6U62_LESSONS,
  ...P6U63_LESSONS,
  ...GIT_U2_LESSONS,
  ...GIT_U3_LESSONS,
  ...GIT_U4_LESSONS,
  ...GIT_U5_LESSONS,
  ...HERMES_U1_LESSONS,
  ...HERMES_U2_LESSONS,
  ...HERMES_U3_LESSONS,
  ...HERMES_U4_LESSONS,
  ...OPENCLAW_U1_LESSONS,
]

const lessonMap = new Map(PROGRAMMING_LESSONS.map((l) => [l.id, l]))

export function getLesson(lessonId: string): ProgrammingLesson | undefined {
  return lessonMap.get(lessonId)
}

/** Bài học của một unit (unit chưa soạn bài → mảng rỗng — UI hiện "sắp mở"). */
export function getLessonsByUnit(unitId: string): ProgrammingLesson[] {
  return PROGRAMMING_LESSONS.filter((l) => l.unitId === unitId)
}
