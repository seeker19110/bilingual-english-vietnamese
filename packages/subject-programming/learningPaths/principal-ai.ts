// learningPaths/principal-ai.ts — Lộ trình "Kỹ Sư Trưởng AI" (lộ trình mục tiêu đầu tiên).
//
// Đặc tả: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md`. Khác hướng `ai` (một trục
// chuyên môn), đích của lộ trình này là NGƯỜI RA QUYẾT ĐỊNH về hệ AI: nắm nhiều trục kỹ thuật
// cùng lúc (toán → dữ liệu → AI → vận hành) và biết đặc tả/đánh giá/dẫn dắt. Toàn bộ giai đoạn
// P1–P4 lắp từ chặng ĐÃ CÓ của 8 hướng; chỉ giai đoạn P5 "Tầm trưởng" là nội dung mới (đợt 4,
// đang soạn — stages rỗng theo đúng hợp đồng ở types.ts).
import type { LearningPath } from './types.js'

export const PRINCIPAL_AI_PATH: LearningPath = {
  id: 'principal-ai',
  title: 'Kỹ Sư Trưởng AI',
  tagline:
    'Từ nền toán tới hệ AI chạy thật ngoài đời — rồi lên tầm người ra quyết định: đặc tả, đánh giá, vận hành AI và dẫn dắt đội.',
  forWho:
    'Người muốn đi đường dài tới vị trí kỹ sư trưởng/kiến trúc sư AI — chấp nhận học rộng nhiều trục thay vì chỉ giỏi một mảng. Không hợp với người chỉ cần dùng nhanh một công cụ AI cho việc trước mắt.',
  prerequisite: 'p4',
  duration: '18–30 tháng tuỳ xuất phát điểm (chẩn đoán đầu vào sẽ rút ngắn phần bạn đã vững)',
  phases: [
    {
      id: 'principal-ai-p1',
      name: 'Nền toán & thuật toán',
      canDo:
        'Đọc hiểu và tự cài được thuật toán ML căn bản (hồi quy, gradient descent) bằng Python thuần, không thư viện — AI không còn là hộp đen.',
      stages: [
        {
          stageId: 'mathforcode-s1',
          why: 'Toán rời rạc là ngôn ngữ chung của mọi thứ phía sau — bắt đầu từ đây để không hổng nền.',
        },
        {
          stageId: 'mathforcode-s2',
          why: 'Tổ hợp & xác suất là nền của đánh giá mô hình và mọi quyết định dưới bất định.',
        },
        {
          stageId: 'mathforcode-s3',
          why: 'Đại số tuyến tính là cấu trúc dữ liệu thật của ML — vector, ma trận, embedding.',
        },
        {
          stageId: 'mathforcode-s4',
          why: 'Giải tích & tối ưu: tự cài gradient descent để hiểu mô hình HỌC bằng cách nào.',
        },
        {
          stageId: 'algo-s1',
          why: 'Cấu trúc dữ liệu & độ phức tạp — để đọc code hệ thống AI không bị choáng.',
          requires: ['mathforcode-s1'],
        },
        {
          stageId: 'algo-s2',
          why: 'Thuật toán kinh điển đủ dùng — kỹ sư trưởng cần đọc và thẩm định, không cần luyện thi đấu.',
          requires: ['algo-s1'],
        },
      ],
      artifact: {
        name: 'Sổ tay thuật toán ML tự cài',
        brief:
          'Repo các thuật toán tự cài bằng Python thuần kèm ghi chú "vì sao chạy được" của chính bạn.',
      },
    },
    {
      id: 'principal-ai-p2',
      name: 'Dữ liệu & backend',
      canDo:
        'Dựng được đường ống dữ liệu sạch và API phục vụ mô hình — vì mọi hệ AI đứng trên hai chân này.',
      stages: [
        {
          stageId: 'data-s1',
          why: 'SQL và mô hình dữ liệu — dữ liệu bẩn thì mô hình nào cũng vô dụng.',
        },
        {
          stageId: 'data-s2',
          why: 'Đường ống dữ liệu: thu thập, làm sạch, biến đổi có kiểm chứng.',
          requires: ['data-s1'],
        },
        {
          stageId: 'data-s3',
          why: 'Phân tích & trực quan — biết đặt câu hỏi cho dữ liệu trước khi đưa vào mô hình.',
          requires: ['data-s2'],
        },
        {
          stageId: 'backend-s1',
          why: 'API và server căn bản — mô hình chỉ có ích khi có đường cho người dùng gọi tới.',
        },
        {
          stageId: 'backend-s2',
          why: 'CSDL, auth, hàng đợi — bộ khung backend mà mọi sản phẩm AI thật đều cần.',
          requires: ['backend-s1'],
        },
      ],
      artifact: {
        name: 'Đường ống dữ liệu + API hoàn chỉnh',
        brief: 'Một dịch vụ nhỏ: nhận dữ liệu thô → làm sạch → lưu → phục vụ qua API có auth.',
      },
    },
    {
      id: 'principal-ai-p3',
      name: 'Trục AI chính',
      canDo:
        'Xây sản phẩm AI hoàn chỉnh: ứng dụng LLM có RAG, mô hình ML/DL tự huấn luyện, có bộ eval và guardrail — trục chuyên môn sâu nhất của lộ trình.',
      stages: [
        {
          stageId: 'ai-s1',
          why: 'Ứng dụng LLM trước — làm ra sản phẩm có ích sớm nhất, rồi mới đào xuống lý thuyết.',
        },
        {
          stageId: 'ai-s2',
          why: 'ML cổ điển — nhiều bài toán thật thắng bằng mô hình nhỏ rẻ, không phải LLM.',
          requires: ['ai-s1'],
        },
        {
          stageId: 'ai-s3',
          why: 'Học sâu & tinh chỉnh — hiểu tới tận gradient thứ mình đang vận hành.',
          requires: ['ai-s2'],
        },
        {
          stageId: 'ai-s4',
          why: 'MLOps & hệ tác tử — đưa mô hình ra production có giám sát, có trách nhiệm.',
          requires: ['ai-s3'],
        },
      ],
      artifact: {
        name: 'Sản phẩm AI có eval',
        brief:
          'Một ứng dụng AI chạy thật (RAG hoặc mô hình tinh chỉnh) kèm bộ đánh giá tự động và báo cáo chất lượng.',
      },
    },
    {
      id: 'principal-ai-p4',
      name: 'Vận hành & tin cậy',
      canDo:
        'Đưa hệ AI ra production an toàn, chịu tải, và ĐẶC TẢ được kiến trúc cho người khác (hoặc AI) thi hành.',
      stages: [
        {
          stageId: 'devops-s1',
          why: 'Đóng gói, deploy, CI/CD — hệ của bạn phải tự đứng được ngoài máy bạn.',
        },
        {
          stageId: 'devops-s2',
          why: 'Giám sát, log, cảnh báo — hệ AI hỏng theo cách âm thầm, phải có mắt nhìn nó.',
          requires: ['devops-s1'],
        },
        {
          stageId: 'security-s1',
          why: 'Bảo mật căn bản — hệ AI mở thêm bề mặt tấn công mới (prompt injection, rò dữ liệu).',
        },
        {
          stageId: 'security-s2',
          why: 'Bảo mật ứng dụng thực chiến — nghĩ như kẻ tấn công trước khi kẻ tấn công nghĩ tới bạn.',
          requires: ['security-s1'],
        },
        {
          stageId: 'architecture-s1',
          why: 'Ranh giới module & hợp đồng — ngôn ngữ để nói chuyện kiến trúc cho ra đầu ra đũa.',
        },
        {
          stageId: 'architecture-s2',
          why: 'Đánh đổi kiến trúc — mọi quyết định của kỹ sư trưởng là một phép cân đánh đổi.',
          requires: ['architecture-s1'],
        },
        {
          stageId: 'architecture-s3',
          why: 'Viết đặc tả cho người khác thi hành — kỹ năng lõi của người dẫn dắt.',
          requires: ['architecture-s2'],
        },
        {
          stageId: 'architecture-s4',
          why: 'Kiến trúc tiến hoá — hệ sống nhiều năm, quyết định hôm nay phải chịu được ngày mai.',
          requires: ['architecture-s3'],
        },
      ],
      artifact: {
        name: 'Hệ AI production + bản đặc tả',
        brief:
          'Sản phẩm AI của P3 chạy production có giám sát, kèm bản đặc tả kiến trúc đủ để người khác dựng lại.',
      },
    },
    {
      id: 'principal-ai-p5',
      name: 'Tầm trưởng — vận hành AI & dẫn dắt',
      canDo:
        'Vận hành AI hiệu quả ở quy mô đội: viết đặc tả giao việc cho AI, thiết kế eval, quản chi phí, quyết định kiến trúc bằng ADR, review và dẫn dắt người khác.',
      // ĐANG SOẠN (đợt 4 của đặc tả) — rỗng là trạng thái hợp lệ, UI phải nói rõ "đang soạn".
      stages: [],
      artifact: {
        name: 'Capstone: hệ AI có người dùng thật',
        brief:
          'Hệ AI hoàn chỉnh có người dùng, có eval, có giám sát chi phí — cộng hồ sơ artifact tích luỹ từ P1.',
      },
    },
  ],
  outcomes: [
    'Tự cài được thuật toán ML nền tảng và giải thích được vì sao nó chạy — không coi AI là hộp đen.',
    'Đưa được một sản phẩm AI từ ý tưởng tới production: dữ liệu, mô hình, API, giám sát, chi phí.',
    'Viết được đặc tả và bộ eval để người khác — hoặc AI — thi hành đúng ngay lượt đầu.',
    'Ra được quyết định kiến trúc AI (build vs buy, RAG vs fine-tune) kèm đánh đổi định lượng.',
    'Review được công việc AI của người khác và nói thẳng được rủi ro trước khi nó thành sự cố.',
  ],
}
