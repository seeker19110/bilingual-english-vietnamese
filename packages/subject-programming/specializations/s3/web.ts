// s3/web.ts — Chi tiết chặng S3 hướng WEB: "nâng cao — hiệu năng, kiến trúc, chất lượng".
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const WEB_S3_DETAIL: SpecStageDetail = {
  stageId: 'web-s3',
  entryGate: [
    'Đã có 1 web app nhiều màn chạy thật, có đăng nhập và ghi dữ liệu xuống CSDL.',
    'Tự dựng lại được dự án từ kho mã trên máy trắng trong dưới 15 phút, chỉ bằng README.',
    'Đọc được tab Network và Performance của DevTools, chỉ ra được request nào chậm nhất.',
    'Viết được ít nhất 10 test unit cho lõi nghiệp vụ và chúng đang chạy trong CI.',
  ],
  moduleDrills: [
    {
      moduleId: 'web-s3-m1',
      drill:
        'Đo Core Web Vitals của chính dự án mình trên máy tầm trung + mạng 4G mô phỏng, rồi sửa 3 nguyên nhân chậm nhất theo đúng thứ tự tác động.',
      evidence:
        'Bảng trước–sau LCP / INP / CLS (3 chỉ số × 2 lần đo) + ảnh chụp waterfall của lần đo sau.',
    },
    {
      moduleId: 'web-s3-m2',
      drill:
        'Chuyển 1 trang cần SEO sang render phía server và giữ nguyên hành vi, rồi giải thích được vì sao 2 trang còn lại KHÔNG nên chuyển.',
      evidence:
        'So sánh HTML trả về lần đầu (view-source) trước–sau + thời gian hiển thị nội dung đầu giảm ≥ 30%.',
    },
    {
      moduleId: 'web-s3-m3',
      drill:
        'Viết bộ E2E cho 3 luồng chính và cố ý làm hỏng 1 dòng lõi nghiệp vụ để chứng minh bộ test bắt được.',
      evidence: 'Log CI: 3 luồng xanh ở bản đúng, ít nhất 1 test đỏ ở bản cố ý làm hỏng.',
    },
    {
      moduleId: 'web-s3-m4',
      drill:
        'Vẽ ranh giới module của dự án rồi cài luật phụ thuộc bằng ESLint để lint đỏ khi có import vi phạm.',
      evidence: 'Luật lint chặn ≥ 2 chiều import cấm, kèm 2 file thử vi phạm cho ra lỗi lint thật.',
    },
    {
      moduleId: 'web-s3-m5',
      drill:
        'Tự tấn công dự án của mình: thử XSS ở ô nhập, thử IDOR bằng cách đổi id trên URL, thử gọi API tốn tiền 100 lần liên tiếp.',
      evidence:
        'Biên bản 3 phép thử kèm mã lỗi HTTP nhận được, và 3 bản vá tương ứng có test hồi quy.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Số đo hiệu năng trước–sau',
      pass: 'LCP ≤ 2,5s và INP ≤ 200ms ở lần đo sau, mỗi chỉ số đo lặp lại 3 lần.',
      fail: 'Chỉ có ảnh chụp Lighthouse một lần, không có số của lần đo trước.',
    },
    {
      criterion: 'Ngân sách bundle',
      pass: 'Có ngưỡng cứng chặn CI; bundle ban đầu giảm ≥ 20% so với lúc nhận dự án.',
      fail: 'Bundle nhỏ đi nhưng không có ngưỡng, tuần sau lại phình.',
    },
    {
      criterion: 'Độ phủ E2E',
      pass: '≥ 3 luồng chính chạy trong CI, tổng thời gian chạy ≤ 10 phút.',
      fail: 'Test chỉ chạy được ở máy mình, hoặc đỏ ngẫu nhiên (flaky) chưa xử lý.',
    },
    {
      criterion: 'Lỗ hổng đã sửa',
      pass: '≥ 2 lỗ hổng có thật, mỗi lỗ hổng kèm 1 test hồi quy đỏ trước khi vá.',
      fail: 'Liệt kê lỗ hổng theo lý thuyết mà không tái hiện được lần nào.',
    },
    {
      criterion: 'Trợ năng không tụt',
      pass: '0 vi phạm A/AA trên toàn bộ trang đã sửa, kiểm bằng công cụ tự động.',
      fail: 'Tối ưu hiệu năng xong thì bàn phím không đi hết được luồng nữa.',
    },
  ],
  pitfalls: [
    'Tối ưu theo cảm giác: sửa 10 chỗ rồi mới đo, không biết chỗ nào có tác dụng.',
    'Đo trên máy mạnh và mạng nhà mình, ra số đẹp — người dùng thật thì không.',
    'Viết E2E bám vào class CSS, đổi giao diện là đỏ hàng loạt, cuối cùng bỏ luôn bộ test.',
    'Nhét mọi state vào một store toàn cục rồi gọi đó là "kiến trúc".',
  ],
  exitSignals: [
    'Nhìn waterfall đoán được nguyên nhân chậm trước khi mở profiler, và đoán đúng phần lớn.',
    'Từ chối được một yêu cầu thêm thư viện vì nó vượt ngân sách bundle, kèm số đo.',
    'Người khác sửa code của bạn mà CI bắt được lỗi thay vì người review phải phát hiện.',
    'Nói được vì sao trang này SSR còn trang kia thì không, bằng dữ liệu chứ không bằng sở thích.',
  ],
  nextStagePrep:
    'S4 là quy mô và dẫn dắt: chọn sẵn một hệ thống thật có ≥ 3 người cùng sửa để có chỗ luyện chuyện tương thích ngược và di trú dần.',
}
