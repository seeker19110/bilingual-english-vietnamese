// s3/mobile.ts — Chi tiết chặng S3 hướng DI ĐỘNG: mượt, nhẹ, tiết kiệm pin.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MOBILE_S3_DETAIL: SpecStageDetail = {
  stageId: 'mobile-s3',
  entryGate: [
    'Đã đưa được ít nhất 1 app lên cửa hàng hoặc lên máy thật của người khác dùng.',
    'Có 1 máy thật đời thấp để đo — không chỉ máy ảo trên máy tính.',
    'Đọc được profiler của nền tảng và chỉ ra được hàm nào tốn thời gian nhất trong một thao tác.',
  ],
  moduleDrills: [
    {
      moduleId: 'mobile-s3-m1',
      drill:
        'Quay lại một màn danh sách hay giật, đo số khung rơi khi cuộn 30 giây, rồi sửa tới khi hết rơi khung.',
      evidence: 'Số khung vượt 16ms giảm từ N xuống ≤ 1% tổng số khung, đo trên máy đời thấp.',
    },
    {
      moduleId: 'mobile-s3-m2',
      drill:
        'Đo mức tiêu thụ pin và RAM khi app chạy nền 1 giờ, rồi chuyển công việc nền sang cơ chế chuẩn của hệ điều hành.',
      evidence: 'Mức pin tiêu thụ 1 giờ nền giảm ≥ 30%; kích thước gói cài giảm ≥ 15%.',
    },
    {
      moduleId: 'mobile-s3-m3',
      drill:
        'Tách lớp dữ liệu ra khỏi lớp trình bày cho 1 tính năng và viết test cho lớp dữ liệu mà không cần chạy giao diện.',
      evidence: '≥ 10 test lớp dữ liệu chạy trong ≤ 10 giây, không cần máy ảo.',
    },
    {
      moduleId: 'mobile-s3-m4',
      drill:
        'Đi hết luồng chính chỉ bằng trình đọc màn hình (TalkBack/VoiceOver) và với cỡ chữ hệ thống lớn nhất.',
      evidence: 'Video đi trọn luồng bằng trình đọc màn hình + 0 chỗ vỡ bố cục ở cỡ chữ lớn nhất.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Độ mượt',
      pass: 'Khung rơi ≤ 1% khi cuộn 30 giây trên máy mục tiêu đời thấp.',
      fail: 'Chỉ mượt trên máy đắt tiền của người làm.',
    },
    {
      criterion: 'Khởi động lạnh',
      pass: 'Thời gian khởi động lạnh giảm ≥ 30% và ≤ 2s ở máy mục tiêu.',
      fail: 'Đo bằng đồng hồ bấm tay, mỗi lần một số khác nhau.',
    },
    {
      criterion: 'Trợ năng',
      pass: 'Luồng chính đi trọn bằng trình đọc màn hình, 0 nút thiếu nhãn.',
      fail: 'Nút chỉ có biểu tượng, trình đọc màn hình đọc ra "button".',
    },
    {
      criterion: 'Kiến trúc tách lớp',
      pass: 'Lớp dữ liệu có ≥ 10 test chạy không cần giao diện.',
      fail: 'Logic nằm trong Activity/ViewController, không test nổi.',
    },
  ],
  pitfalls: [
    'Đo trên máy ảo: máy ảo dùng CPU máy tính nên che mất đúng thứ mình cần thấy.',
    'Ghi nhớ (memo) bừa khắp nơi làm code khó đọc mà không đo được lợi ích.',
    'Bỏ qua cỡ chữ hệ thống — người dùng lớn tuổi mở app ra là vỡ bố cục.',
  ],
  exitSignals: [
    'Trước khi tối ưu, bạn luôn có số đo gốc trên máy mục tiêu.',
    'Bạn từ chối thêm thư viện vì nó tăng gói cài quá ngân sách, kèm số kB cụ thể.',
    'Thêm màn mới không làm chậm thời gian khởi động vì đã tải lười đúng chỗ.',
    'App của bạn dùng được bằng trình đọc màn hình mà không cần bản riêng.',
  ],
  nextStagePrep:
    'S4 là quy mô đội và phát hành: chuẩn bị một app có ≥ 2 người cùng sửa để luyện module hoá và phát hành theo đợt.',
}
