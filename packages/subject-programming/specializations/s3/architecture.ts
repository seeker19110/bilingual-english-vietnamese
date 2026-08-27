// s3/architecture.ts — Chi tiết chặng S3 hướng KIẾN TRÚC: đặc tả thi hành được & nghiệm thu.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ARCHITECTURE_S3_DETAIL: SpecStageDetail = {
  stageId: 'architecture-s3',
  entryGate: [
    'Đã tự vẽ được bản đồ module của một hệ thống thật mình từng làm, kèm trách nhiệm từng module.',
    'Đã viết ít nhất 1 hợp đồng vào–ra bằng kiểu/schema mà hai phía cùng import.',
    'Đã từng bị một lần "làm xong không ghép được" và chỉ ra được đặc tả hở chỗ nào.',
  ],
  moduleDrills: [
    {
      moduleId: 'architecture-s3-m1',
      drill:
        'Viết lại một yêu cầu mơ hồ mình từng nhận thành đặc tả 6 ô, viết ô tiêu chí chấp nhận TRƯỚC ô giải pháp.',
      evidence: 'Đặc tả đủ 6 ô, trong đó ≥ 4 tiêu chí chấp nhận nêu rõ lệnh chạy để kiểm.',
    },
    {
      moduleId: 'architecture-s3-m2',
      drill:
        'Giao đúng một lát việc cho AI mà KHÔNG kèm hội thoại nền, chỉ đưa đặc tả — rồi đếm số câu hỏi làm rõ phải trả lời.',
      evidence:
        'Nhật ký giao việc: số vòng làm rõ ≤ 1, và danh sách giả định mình đã phải viết thêm.',
    },
    {
      moduleId: 'architecture-s3-m3',
      drill:
        'Nghiệm thu kết quả theo tầng: hợp đồng → ranh giới → ca biên → phong cách, và bác bỏ mọi khẳng định không có output lệnh kèm theo.',
      evidence:
        'Biên bản nghiệm thu ghi ≥ 3 lệnh đã chạy kèm output thật, không có câu "chắc là chạy được".',
    },
    {
      moduleId: 'architecture-s3-m4',
      drill: 'Viết 2 ADR cho hai quyết định lớn, mỗi ADR ghi rõ phương án BỊ LOẠI và lý do loại.',
      evidence: '2 file ADR theo khuôn, mỗi file có ≥ 2 phương án bị loại kèm đánh đổi.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Độ kín của đặc tả',
      pass: 'Bên thi hành làm đúng ngay lượt đầu với ≤ 1 vòng hỏi làm rõ.',
      fail: 'Phải trả lời từ 3 câu hỏi trở lên trước khi bên kia bắt đầu gõ dòng đầu tiên.',
    },
    {
      criterion: 'Test canh gác viết TRƯỚC',
      pass: 'Bộ test có trước lúc giao việc và bắt đỏ ít nhất 1 lỗi thật của bản nộp đầu.',
      fail: 'Test viết sau khi code xong — nó chỉ chép lại hành vi đang có.',
    },
    {
      criterion: 'Sổ quyết định',
      pass: '≥ 2 ADR, mỗi ADR ghi cả phương án bị loại.',
      fail: 'ADR chỉ ghi quyết định cuối, phiên sau lại đề xuất đúng phương án đã loại.',
    },
    {
      criterion: 'Biên bản nghiệm thu',
      pass: 'Ghi đủ 4 mục: lệnh đã chạy + kết quả thật, tiêu chí chưa đạt, bất biến có bị phá không, còn để ngỏ gì.',
      fail: 'Viết "đã kiểm tra, ổn" mà không dán output nào.',
    },
    {
      criterion: 'Không tự gõ phần cài đặt',
      pass: '0 dòng code cài đặt do chính mình viết — vai trò của mình là đặc tả và nghiệm thu.',
      fail: 'Sốt ruột nhảy vào sửa tay, mất luôn phép thử "đặc tả có kín không".',
    },
  ],
  pitfalls: [
    'Viết đặc tả dài mà thiếu ô "KHÔNG làm" — bên thi hành mở rộng phạm vi, review mệt gấp đôi.',
    'Nhận lời khẳng định thay cho bằng chứng; đây là cách sai sót đi thẳng vào nhánh chính.',
    'Giao một cục lớn thay vì chia lát chạy được — sai chỗ nào cũng không biết vì chưa có gì chạy.',
  ],
  exitSignals: [
    'Người khác đọc đặc tả của bạn rồi bắt tay làm luôn, không nhắn hỏi lại.',
    'Bạn phát hiện lỗi bằng test canh gác chứ không bằng cách đọc từng dòng diff.',
    'Bạn nói "không" với một thay đổi vì nó phá bất biến đã ghi, và chỉ được đúng dòng nào.',
    'Phiên làm việc sau không đề xuất lại phương án đã bị loại — vì ADR đã ghi.',
  ],
  nextStagePrep:
    'S4 là tiến hoá kiến trúc và dẫn dắt nhiều đội: tìm sẵn một hệ thống đang chạy thật cần đổi lớn mà không được dừng dịch vụ.',
}
