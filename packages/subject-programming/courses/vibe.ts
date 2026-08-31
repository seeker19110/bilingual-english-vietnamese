// courses/vibe.ts — Khoá ngắn "Vibe Code — từ số 0 đến chuyên gia" (đặc tả
// docs/specs/2026-08-31-khoa-vibe-code.md). Đủ 4 chương / 20 bài, khuôn courses/hermes.ts.
import type { ShortCourse } from './types.js'

export const VIBE_COURSE: ShortCourse = {
  id: 'vibe',
  title: 'Vibe Code — từ số 0 đến chuyên gia',
  canDo:
    'Xây phần mềm bằng cách mô tả cho tác tử AI: viết mô tả đủ rõ để AI không phải đoán, xin kế hoạch trước việc lớn, đọc diff trước khi nhận bất cứ thứ gì, dùng test làm trọng tài thay vì cảm giác, giữ secret ngoài mọi mô tả, lưu mốc trước thay đổi lớn và hoàn tác không sợ hãi, đưa sản phẩm lên với cổng kiểm tra bắt buộc, và biết rõ vùng KHÔNG được vibe code (thanh toán, bảo mật, dữ liệu người dùng thật). Dành cho người chưa từng lập trình lẫn người đã "vibe code" theo bản năng muốn có kỷ luật.',
  duration: '4–6 tuần, vào thẳng không cần học bậc nào trước',
  prerequisites: [],
  chapters: [
    {
      id: 'vibe-c1',
      title: 'Tư duy & vòng lặp',
      summary:
        'Hiểu vibe code là gì và hai mức ngây thơ/chuyên gia, viết mô tả đủ ba vế để AI không phải đoán, xin kế hoạch trước việc lớn, đọc diff trước khi nhận, và dùng vòng phản hồi mô tả–xem–góp ý–nhận.',
      lessonIds: [
        'vibe-u1-l1',
        'vibe-u1-l2',
        'vibe-u1-l3',
        'vibe-u1-l4',
        'vibe-u1-l5',
        'vibe-u1-l6',
      ],
    },
    {
      id: 'vibe-c2',
      title: 'Lưới an toàn',
      summary:
        'Dùng test làm trọng tài thay vì cảm giác, hiểu vì sao AI hay quên ca biên và cách sửa, giữ secret ngoài mọi mô tả, lưu mốc trước thay đổi lớn và hoàn tác không sợ hãi.',
      lessonIds: ['vibe-u2-l1', 'vibe-u2-l2', 'vibe-u2-l3', 'vibe-u2-l4', 'vibe-u2-l5'],
    },
    {
      id: 'vibe-c3',
      title: 'Từ bản nháp đến sản phẩm',
      summary:
        'Đưa sản phẩm lên với cổng kiểm tra bắt buộc, ghép các bước rời rạc thành một nhịp trọn vòng đời, xử lý lỗi người dùng báo trên sản phẩm đang chạy, và cắt tính năng lớn thành nhiều mô tả nhỏ.',
      lessonIds: ['vibe-u3-l1', 'vibe-u3-l2', 'vibe-u3-l3', 'vibe-u3-l4'],
    },
    {
      id: 'vibe-c4',
      title: 'Bậc chuyên gia',
      summary:
        'Viết đặc tả có mục "KHÔNG làm", đặt tiêu chí chấp nhận đo được trước khi mô tả, biến "mỗi tính năng một mốc" thành phản xạ, nhận diện vùng KHÔNG được vibe code, và tổng kết bằng checklist bảy điều trọn vòng đời.',
      lessonIds: ['vibe-u4-l1', 'vibe-u4-l2', 'vibe-u4-l3', 'vibe-u4-l4', 'vibe-u4-l5'],
    },
  ],
}
