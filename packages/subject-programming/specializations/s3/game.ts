// s3/game.ts — Chi tiết chặng S3 hướng GAME: đồ hoạ và hiệu năng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const GAME_S3_DETAIL: SpecStageDetail = {
  stageId: 'game-s3',
  entryGate: [
    'Đã hoàn thành và cho người khác chơi thử ít nhất 1 game 2D nhỏ.',
    'Có 1 máy mục tiêu cấu hình yếu để đo, không chỉ máy làm việc.',
    'Vững toán vector 2D/3D ở mức tự tính được tích vô hướng và phép quay.',
  ],
  moduleDrills: [
    {
      moduleId: 'game-s3-m1',
      drill:
        'Đếm số lệnh vẽ mỗi khung hình rồi gộp lô để giảm xuống, giữ nguyên hình ảnh trên màn hình.',
      evidence: 'Số draw call giảm ≥ 50%, ảnh chụp 2 cảnh trước–sau giống nhau từng điểm ảnh.',
    },
    {
      moduleId: 'game-s3-m2',
      drill:
        'Tự viết 2 shader có mục đích chơi rõ ràng (ví dụ đánh dấu mục tiêu, hiệu ứng trúng đòn), không phải hiệu ứng trang trí.',
      evidence: '2 shader chạy trên máy mục tiêu, mỗi shader tốn ≤ 1ms mỗi khung hình.',
    },
    {
      moduleId: 'game-s3-m3',
      drill:
        'Lập ngân sách khung hình 16,6ms chia cho CPU và GPU, rồi cắt phần vượt bằng culling và LOD.',
      evidence: 'Biểu đồ thời gian khung hình 60 giây: ≥ 99% khung dưới 16,6ms trên máy mục tiêu.',
    },
    {
      moduleId: 'game-s3-m4',
      drill:
        'Cài camera 3D và hoà trộn hoạt ảnh xương giữa 3 trạng thái di chuyển sao cho không giật khi chuyển.',
      evidence: 'Video 30 giây chuyển qua lại 3 trạng thái, 0 lần nhảy tư thế thấy được.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Khung hình ổn định',
      pass: '≥ 60 FPS và ≥ 99% khung dưới 16,6ms trên máy mục tiêu, đo 60 giây chơi thật.',
      fail: 'Báo FPS trung bình đẹp nhưng có khung 100ms gây giật.',
    },
    {
      criterion: 'Shader tự viết',
      pass: '≥ 2 shader tự viết phục vụ lối chơi, mỗi shader ≤ 1ms/khung.',
      fail: 'Chép shader từ mẫu mà không giải thích được từng dòng.',
    },
    {
      criterion: 'Báo cáo tối ưu',
      pass: '≥ 3 bước tối ưu, mỗi bước kèm ảnh chụp profiler trước–sau.',
      fail: 'Chỉ nói "đã tối ưu", không có số.',
    },
    {
      criterion: 'Vẫn vui',
      pass: '≥ 5 người chơi thử, ≥ 3 người chơi hết vòng đầu mà không cần hướng dẫn.',
      fail: 'Kỹ thuật tốt nhưng không ai chơi quá 1 phút.',
    },
  ],
  pitfalls: [
    'Lấy FPS trung bình làm thước đo — người chơi cảm nhận khung tệ nhất, không phải trung bình.',
    'Tối ưu đồ hoạ trước khi lối chơi vui; game nhanh mà chán vẫn là game chán.',
    'Thử trên máy mạnh của người làm rồi ngạc nhiên khi người chơi kêu giật.',
  ],
  exitSignals: [
    'Bạn nói được mỗi khung hình tiêu bao nhiêu ms cho CPU, bao nhiêu cho GPU.',
    'Bạn tự viết được shader cho một nhu cầu lối chơi mới trong một buổi.',
    'Bạn xử lý được giật do tải nội dung bằng tải theo luồng, không bằng màn hình chờ.',
    'Bạn đo bằng biểu đồ thời gian khung hình, không bằng con số FPS ở góc màn hình.',
  ],
  nextStagePrep:
    'S4 là game hoàn chỉnh và phát hành: chuẩn bị phạm vi đủ nhỏ để kết thúc được, và một nhóm chơi thử đều đặn.',
}
