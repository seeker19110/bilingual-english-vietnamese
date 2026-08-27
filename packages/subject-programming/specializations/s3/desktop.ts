// s3/desktop.ts — Chi tiết chặng S3 hướng DESKTOP: hiệu năng và mở rộng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DESKTOP_S3_DETAIL: SpecStageDetail = {
  stageId: 'desktop-s3',
  entryGate: [
    'Đã đóng gói và cài đặt được ứng dụng trên ít nhất 2 hệ điều hành.',
    'Có cơ chế cập nhật cho người dùng thật, không phải "tải lại bản mới bằng tay".',
    'Đo được thời gian mở ứng dụng và mức chiếm RAM bằng công cụ, không bằng cảm giác.',
  ],
  moduleDrills: [
    {
      moduleId: 'desktop-s3-m1',
      drill:
        'Mở một tệp 1 GB bằng cách đọc theo luồng và hiển thị bằng danh sách ảo hoá, thay vì nạp hết vào RAM.',
      evidence: 'Mức chiếm RAM ≤ 300 MB khi mở tệp 1 GB; cuộn 1 triệu dòng không giật.',
    },
    {
      moduleId: 'desktop-s3-m2',
      drill:
        'Cắt thời gian mở ứng dụng bằng tải lười, và chuyển 1 phần lõi nặng sang Rust/C++ gọi từ giao diện.',
      evidence: 'Thời gian mở giảm ≥ 40% và ≤ 2 giây trên máy mục tiêu, đo 10 lần lấy trung vị.',
    },
    {
      moduleId: 'desktop-s3-m3',
      drill:
        'Thiết kế API plugin có phiên bản và chạy plugin trong hộp cát, rồi cố ý viết 1 plugin gây lỗi.',
      evidence:
        'Plugin lỗi bị cô lập: ứng dụng chính vẫn chạy 10/10 lần, có thông báo rõ cho người dùng.',
    },
    {
      moduleId: 'desktop-s3-m4',
      drill: 'Dựng ma trận CI chạy test giao diện và test cài đặt trên cả 3 hệ điều hành.',
      evidence: 'CI 3 nền tảng đều xanh; có ≥ 1 test kiểm luồng cài đặt và cập nhật.',
    },
  ],
  projectRubric: [
    {
      criterion: 'API plugin dùng được',
      pass: 'Tài liệu + ≥ 2 plugin ví dụ chạy được, người ngoài viết được plugin đầu tiên trong ≤ 1 giờ.',
      fail: 'API chỉ mình hiểu, không có ví dụ chạy được.',
    },
    {
      criterion: 'Cô lập lỗi plugin',
      pass: 'Plugin lỗi 10/10 lần không làm sập ứng dụng chính.',
      fail: 'Một plugin xấu là cả ứng dụng chết theo.',
    },
    {
      criterion: 'Ma trận nền tảng',
      pass: 'CI chạy đủ 3 nền tảng (Windows, macOS, Linux) ở 100% lần đẩy mã.',
      fail: 'Chỉ test trên hệ điều hành của người làm.',
    },
    {
      criterion: 'Hiệu năng dữ liệu lớn',
      pass: 'Mở tệp 1 GB trong ≤ 5 giây, RAM ≤ 300 MB.',
      fail: 'Nạp hết vào RAM, máy 8 GB là treo.',
    },
  ],
  pitfalls: [
    'Cho plugin chạy cùng quyền với ứng dụng chính — một plugin xấu là mất dữ liệu người dùng.',
    'Đổi API plugin không có phiên bản, bản cập nhật làm chết hết plugin của cộng đồng.',
    'Test tay trên máy mình rồi phát hành; lỗi riêng của từng hệ điều hành lộ ra ở người dùng.',
  ],
  exitSignals: [
    'Bạn nói được ứng dụng chiếm bao nhiêu RAM ở tệp lớn nhất mình hỗ trợ.',
    'Bạn giữ API plugin tương thích ngược và có quy tắc bỏ dần rõ ràng.',
    'Bạn phát hành mà không lo hệ điều hành nào chưa được kiểm.',
    'Người dùng nâng cao tự động hoá được công việc của họ bằng ứng dụng của bạn.',
  ],
  nextStagePrep:
    'S4 là ứng dụng cấp doanh nghiệp: chuẩn bị bài toán triển khai hàng loạt và chính sách bảo mật của tổ chức.',
}
