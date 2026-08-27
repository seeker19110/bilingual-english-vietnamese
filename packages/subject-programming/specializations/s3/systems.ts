// s3/systems.ts — Chi tiết chặng S3 hướng HỆ THỐNG: hiệu năng và nhân hệ điều hành.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SYSTEMS_S3_DETAIL: SpecStageDetail = {
  stageId: 'systems-s3',
  entryGate: [
    'Viết và gỡ lỗi được chương trình C hoặc Rust có cấp phát động và nhiều luồng.',
    'Có máy Linux thật (hoặc máy ảo) đủ quyền để chạy perf và nạp module nhân.',
    'Đo được thời gian chạy lặp lại được: cùng đầu vào, 10 lần chạy lệch ≤ 5%.',
  ],
  moduleDrills: [
    {
      moduleId: 'systems-s3-m1',
      drill:
        'Viết 2 bản của cùng một vòng lặp — một bản thân thiện cache, một bản không — rồi đo chênh lệch và giải thích bằng cache line.',
      evidence: 'Chênh lệch ≥ 3 lần, kèm số lần trượt cache đếm bằng bộ đếm phần cứng.',
    },
    {
      moduleId: 'systems-s3-m2',
      drill:
        'Dựng vi chuẩn không tự lừa mình: khởi động nóng, cố định tần số CPU, chạy ≥ 10 lần và báo cáo trung vị.',
      evidence: 'Kết quả 10 lần lệch ≤ 5%, kèm flame graph chỉ ra hàm tốn nhất.',
    },
    {
      moduleId: 'systems-s3-m3',
      drill:
        'Viết 1 module nhân ký tự đơn giản hoặc 1 chương trình eBPF đếm lời gọi hệ thống của một tiến trình.',
      evidence: 'Nạp thành công và in ra số liệu thật của ≥ 1 tiến trình đang chạy.',
    },
    {
      moduleId: 'systems-s3-m4',
      drill:
        'Cài một hàng đợi dùng nguyên tử rồi kiểm chứng bằng công cụ phát hiện đua điều kiện, không bằng chạy thử vài lần.',
      evidence: 'Công cụ kiểm chứng báo 0 lỗi sau ≥ 1 triệu thao tác của 4 luồng.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Mức tăng tốc',
      pass: 'Nhanh hơn ≥ 5 lần bản đầu, đo 10 lần, lệch ≤ 5%.',
      fail: 'Nhanh hơn 20% và chỉ đo một lần.',
    },
    {
      criterion: 'Mỗi bước có giả thuyết',
      pass: 'Mỗi bước tối ưu ghi: giả thuyết → số đo trước → số đo sau; ≥ 4 bước.',
      fail: 'Sửa một loạt rồi mới đo, không biết bước nào có tác dụng.',
    },
    {
      criterion: 'Kết quả vẫn đúng',
      pass: 'Bộ test đối chiếu đầu ra bản nhanh với bản gốc: khớp 100% trên ≥ 1.000 ca.',
      fail: 'Nhanh hơn vì tính sai.',
    },
    {
      criterion: 'Quan sát mức hệ thống',
      pass: 'Có 1 module nhân hoặc chương trình eBPF chạy thật, in được số liệu.',
      fail: 'Chỉ đọc tài liệu, chưa nạp được lần nào.',
    },
  ],
  pitfalls: [
    'Vi chuẩn bị trình biên dịch tối ưu mất — đo một vòng lặp rỗng mà tưởng đo thuật toán.',
    'Tối ưu 5% thời gian chạy của phần chiếm 2% tổng thời gian (bỏ quên định luật Amdahl).',
    'Kết luận code lock-free đúng vì chạy thử 100 lần không lỗi.',
  ],
  exitSignals: [
    'Bạn không sửa dòng nào trước khi có số đo gốc lặp lại được.',
    'Bạn giải thích được chênh lệch tốc độ bằng cơ chế phần cứng, không bằng "chắc do vậy".',
    'Bạn dùng công cụ kiểm chứng cho code đồng thời thay vì niềm tin.',
    'Bạn đọc được flame graph và chỉ đúng chỗ đáng sửa trong vài phút.',
  ],
  nextStagePrep:
    'S4 là hệ thống lớn: chuẩn bị một bài toán phải chạy trên nhiều nhân và nhiều máy để luyện mở rộng theo chiều ngang.',
}
