// s3/data.ts — Chi tiết chặng S3 hướng DỮ LIỆU: quy mô và thời gian thực.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DATA_S3_DETAIL: SpecStageDetail = {
  stageId: 'data-s3',
  entryGate: [
    'Đã xây 1 luồng theo lô chạy hằng ngày và có kiểm tra chất lượng dữ liệu tự động.',
    'Viết được SQL cửa sổ (window function) và đọc được kế hoạch truy vấn (EXPLAIN).',
    'Có 1 tập dữ liệu ≥ 10 triệu dòng để làm việc thật, không phải vài nghìn dòng mẫu.',
  ],
  moduleDrills: [
    {
      moduleId: 'data-s3-m1',
      drill:
        'Chuyển một tập CSV lớn sang Parquet có phân vùng rồi đo lại thời gian và chi phí quét của cùng một truy vấn.',
      evidence: 'Thời gian truy vấn giảm ≥ 5 lần, dung lượng lưu giảm ≥ 60%.',
    },
    {
      moduleId: 'data-s3-m2',
      drill:
        'Dựng luồng đọc sự kiện có cửa sổ thời gian và bơm vào 5% sự kiện tới muộn để xem kết quả sai chỗ nào.',
      evidence:
        'Kết quả cửa sổ đúng với sự kiện muộn tới 60 phút; sai lệch so với bản theo lô < 0,1%.',
    },
    {
      moduleId: 'data-s3-m3',
      drill:
        'Thiết kế 1 A/B test: tính cỡ mẫu TRƯỚC, chốt ngày dừng TRƯỚC, rồi phân tích đúng kế hoạch đã chốt.',
      evidence:
        'Bản thiết kế ghi cỡ mẫu, mức ý nghĩa 0,05 và ngày dừng — có dấu thời gian trước khi chạy.',
    },
    {
      moduleId: 'data-s3-m4',
      drill:
        'Ước tính chi phí truy vấn hằng tháng rồi cắt ≥ 30% bằng phân vùng, cắt cột và lịch chạy hợp lý.',
      evidence: 'Bảng chi phí trước–sau theo tháng + danh sách 3 truy vấn tốn nhất đã xử lý.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Xử lý sự kiện tới muộn',
      pass: 'Sự kiện muộn tới 60 phút vẫn vào đúng cửa sổ, kiểm bằng bộ dữ liệu thử có nhãn.',
      fail: 'Sự kiện muộn bị bỏ im lặng, không ai biết.',
    },
    {
      criterion: 'Đối chiếu luồng và lô',
      pass: 'Sai lệch < 0,1% trên 7 ngày liên tiếp.',
      fail: 'Chỉ đối chiếu 1 ngày rồi kết luận khớp.',
    },
    {
      criterion: 'Chi phí',
      pass: 'Có ước tính chi phí hằng tháng và ngưỡng cảnh báo khi vượt 120% dự kiến.',
      fail: 'Không ai biết luồng này tốn bao nhiêu tiền.',
    },
    {
      criterion: 'Quyền và dữ liệu cá nhân',
      pass: '100% trường nhạy cảm được che hoặc băm ở tầng phục vụ; có test canh.',
      fail: 'Bảng phân tích chứa số điện thoại thật, ai cũng đọc được.',
    },
  ],
  pitfalls: [
    'Dừng A/B test ngay khi thấy đẹp — đó là gian lận thống kê, không phải kết quả.',
    'Lẫn thời gian sự kiện với thời gian xử lý, biểu đồ đẹp nhưng sai lệch theo múi giờ.',
    'Đòi "đúng một lần" ở mọi chỗ mà không tính cái giá; phần lớn bài toán chỉ cần idempotent.',
  ],
  exitSignals: [
    'Trước khi tối ưu truy vấn, bạn xem kế hoạch thực thi chứ không đoán.',
    'Bạn nói được luồng của mình tốn bao nhiêu tiền một tháng.',
    'Bạn từ chối kết luận từ một thực nghiệm thiếu cỡ mẫu, kèm con số.',
    'Số liệu thời gian thực và số liệu theo lô của bạn khớp nhau, và bạn có bằng chứng hằng ngày.',
  ],
  nextStagePrep:
    'S4 là nền tảng dữ liệu cho cả tổ chức: chuẩn bị một bài toán có ≥ 2 nhóm dùng chung dữ liệu để luyện hợp đồng dữ liệu.',
}
