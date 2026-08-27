// s3/ai.ts — Chi tiết chặng S3 hướng AI: học sâu.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const AI_S3_DETAIL: SpecStageDetail = {
  stageId: 'ai-s3',
  entryGate: [
    'Đã huấn luyện và đánh giá được ít nhất 1 mô hình học máy cổ điển, có tập kiểm tra tách riêng.',
    'Chia được dữ liệu không rò rỉ và giải thích được vì sao rò rỉ làm điểm số đẹp giả.',
    'Có quyền dùng 1 GPU (thuê theo giờ cũng được) và biết ước tính chi phí một lần huấn luyện.',
  ],
  moduleDrills: [
    {
      moduleId: 'ai-s3-m1',
      drill:
        'Huấn luyện một mạng nhỏ tới khi khớp được 100% một tập 100 mẫu — phép thử chuẩn để biết đường ống không hỏng.',
      evidence:
        'Đường cong mất mát giảm về ~0 trên 100 mẫu, kèm 3 lần chạy lặp cho kết quả tương đương.',
    },
    {
      moduleId: 'ai-s3-m2',
      drill:
        'Tinh chỉnh 1 mô hình có sẵn cho bài toán của mình và so với huấn luyện từ đầu ở cùng ngân sách tính toán.',
      evidence: 'Bảng so sánh 2 cách × ≥ 2 chỉ số, kèm số giờ GPU của mỗi cách.',
    },
    {
      moduleId: 'ai-s3-m3',
      drill:
        'Gán nhãn 200 mẫu cùng một người khác, đo độ đồng thuận, rồi sửa hướng dẫn gán nhãn cho tới khi đồng thuận tăng.',
      evidence: 'Độ đồng thuận tăng từ mức đầu lên ≥ 0,8 sau khi sửa hướng dẫn.',
    },
    {
      moduleId: 'ai-s3-m4',
      drill:
        'So tinh chỉnh LoRA với một prompt được viết kỹ trên cùng bộ đánh giá, rồi kết luận cái nào đáng tiền.',
      evidence:
        'Bảng 2 cách × chất lượng × chi phí/1.000 lượt gọi, kèm kết luận chọn cái nào và vì sao.',
    },
  ],
  projectRubric: [
    {
      criterion: 'So với đường cơ sở',
      pass: 'Tốt hơn cả mô hình gốc và giải pháp prompt thuần ≥ 5 điểm phần trăm ở chỉ số chính.',
      fail: 'Chỉ báo cáo điểm của mô hình mình, không có đường cơ sở nào.',
    },
    {
      criterion: 'Thẻ mô hình',
      pass: 'Ghi đủ 4 mục: nguồn dữ liệu, giới hạn, rủi ro sử dụng sai, cách đánh giá.',
      fail: 'Chỉ có số điểm, không nói mô hình hỏng ở đâu.',
    },
    {
      criterion: 'Chạy được trên phần cứng bình dân',
      pass: 'Suy luận 1 mẫu ≤ 500ms trên CPU hoặc GPU phổ thông, đo 100 lần lấy p95.',
      fail: 'Chỉ chạy được trên GPU thuê đắt tiền.',
    },
    {
      criterion: 'Lặp lại được',
      pass: 'Chạy lại từ đầu bằng 1 lệnh cho kết quả lệch ≤ 1 điểm phần trăm.',
      fail: 'Kết quả nằm trong sổ tay của một buổi tối, không dựng lại được.',
    },
  ],
  pitfalls: [
    'Chỉnh siêu tham số trên tập kiểm tra — điểm đẹp mà ra thật thì tệ.',
    'Đổ tiền vào mô hình lớn hơn trong khi vấn đề nằm ở nhãn bẩn.',
    'Bỏ qua dịch chuyển phân phối: dữ liệu thật tháng sau không giống dữ liệu huấn luyện.',
  ],
  exitSignals: [
    'Mất mát không giảm thì bạn có danh sách phép thử theo thứ tự, không thử mò.',
    'Bạn dám kết luận "tinh chỉnh không đáng, prompt tốt là đủ" khi số liệu nói thế.',
    'Mọi kết quả bạn báo đều có đường cơ sở đi kèm.',
    'Bạn theo dõi được chất lượng mô hình sau khi lên chạy thật, không chỉ lúc huấn luyện.',
  ],
  nextStagePrep:
    'S4 là đưa AI vào sản phẩm thật: chuẩn bị một luồng người dùng thật để luyện giám sát chất lượng và chi phí theo thời gian.',
}
