// learningPaths/stageQuizzes.ts — Ngân hàng QUIZ SAU CHẶNG của lộ trình mục tiêu.
//
// Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md (đợt 3). Quiz là CỔNG CỦA LỘ
// TRÌNH — đạt ≥ 4/5 mới đánh dấu `completed` trên `programming.path_progress`; KHÔNG đổi
// luật hoàn thành chặng ở tầng HƯỚNG gốc (`programming.spec_stage_progress` vẫn theo bài học
// thật, không liên quan quiz này).
//
// Phạm vi đợt 3: soạn quiz cho 4 chặng — chặng ĐẦU của mỗi giai đoạn P1–P4 của lộ trình
// principal-ai (mathforcode-s1 · data-s1 · ai-s1 · devops-s1) — đúng tiền lệ phủ từng phần
// có ghi chú của `stageUnits.ts`. `quizOfStage()` trả mảng RỖNG cho chặng chưa soạn — chặng
// đó qua KHÔNG CẦN quiz, UI phải nói rõ "chưa có bài kiểm", không hứa suông.

export interface StageQuizQuestion {
  /** `<stageId>-q<số>`, ví dụ 'mathforcode-s1-q1'. */
  id: string
  prompt: string
  /** Đúng 4 lựa chọn. */
  choices: string[]
  /** Chỉ số đáp án đúng trong `choices` (0–3). */
  answerIndex: number
  /** Giải thích tiếng Việt, hiện SAU khi học viên trả lời (đúng hay sai đều hiện). */
  explain: string
}

const STAGE_QUIZZES: Record<string, StageQuizQuestion[]> = {
  'mathforcode-s1': [
    {
      id: 'mathforcode-s1-q1',
      prompt: 'Số nguyên có dấu trong máy tính thường biểu diễn bằng cách nào?',
      choices: [
        'Dấu + trước số',
        "Bù 2 (two's complement)",
        'Bù 1',
        'Ghi riêng một bit dấu ở cuối',
      ],
      answerIndex: 1,
      explain:
        'Bù 2 là cách chuẩn: cho phép cộng số âm/dương bằng đúng một mạch cộng, không cần mạch trừ riêng.',
    },
    {
      id: 'mathforcode-s1-q2',
      prompt: 'Điều gì xảy ra khi phép cộng hai số nguyên 32-bit vượt quá giá trị biểu diễn được?',
      choices: [
        'Chương trình luôn dừng ngay lập tức',
        'Tự động chuyển sang số thực',
        'Tràn số (overflow) — kết quả sai mà không báo lỗi ở nhiều ngôn ngữ',
        'Kết quả luôn làm tròn về 0',
      ],
      answerIndex: 2,
      explain:
        'Tràn số là lỗi âm thầm nguy hiểm — nhiều ngôn ngữ (C, cũ hơn) không tự báo, kết quả sai lặng lẽ.',
    },
    {
      id: 'mathforcode-s1-q3',
      prompt: 'Theo luật De Morgan, phủ định của (A và B) tương đương với gì?',
      choices: ['(không A) và (không B)', '(không A) hoặc (không B)', 'A hoặc B', 'A và (không B)'],
      answerIndex: 1,
      explain:
        '¬(A ∧ B) = ¬A ∨ ¬B — dùng để rút gọn điều kiện if lồng nhau, tránh phủ định kép khó đọc.',
    },
    {
      id: 'mathforcode-s1-q4',
      prompt: 'Phép chia lấy dư (%) với số âm trong Python và trong C có gì khác nhau?',
      choices: [
        'Không khác gì, mọi ngôn ngữ đều giống nhau',
        'Python luôn trả kết quả cùng dấu với số chia, C (chuẩn cũ) có thể khác',
        'C không hỗ trợ số âm',
        'Python không hỗ trợ phép %',
      ],
      answerIndex: 1,
      explain:
        'Đây là bẫy kinh điển khi chuyển code giữa hai ngôn ngữ — phải kiểm tra lại logic dùng modulo với số âm.',
    },
    {
      id: 'mathforcode-s1-q5',
      prompt: 'Độ phức tạp O(n log n) thường xuất hiện ở loại thuật toán nào?',
      choices: [
        'Duyệt mảng một lần',
        'Sắp xếp so sánh (merge sort, quick sort trung bình)',
        'Tìm kiếm nhị phân',
        'Truy cập một phần tử theo chỉ số',
      ],
      answerIndex: 1,
      explain:
        'Sắp xếp so sánh chia-để-trị tạo ra log n tầng đệ quy, mỗi tầng duyệt n phần tử → n log n.',
    },
  ],
  'data-s1': [
    {
      id: 'data-s1-q1',
      prompt: 'Câu SQL nào lấy đúng danh sách khách hàng KHÔNG có đơn hàng nào?',
      choices: [
        'SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders)',
        'SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)',
        'SELECT * FROM orders WHERE customer_id IS NULL',
        'DELETE FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)',
      ],
      answerIndex: 1,
      explain:
        'NOT IN với subquery loại các customer_id đã xuất hiện trong orders — còn lại là khách chưa từng mua.',
    },
    {
      id: 'data-s1-q2',
      prompt:
        'Chuẩn hoá dữ liệu (normalization) trong thiết kế CSDL quan hệ nhằm mục đích chính gì?',
      choices: [
        'Làm bảng chạy nhanh hơn tuyệt đối trong mọi trường hợp',
        'Giảm trùng lặp dữ liệu, tránh bất nhất khi cập nhật',
        'Giảm số lượng bảng xuống còn một',
        'Mã hoá dữ liệu để bảo mật',
      ],
      answerIndex: 1,
      explain:
        'Chuẩn hoá tách dữ liệu để mỗi sự thật chỉ nằm ở MỘT chỗ — sửa một lần, không lệch nhau giữa các bảng.',
    },
    {
      id: 'data-s1-q3',
      prompt: 'JOIN nào giữ lại TẤT CẢ dòng của bảng bên trái, kể cả khi không khớp bảng bên phải?',
      choices: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'Không JOIN nào làm được'],
      answerIndex: 1,
      explain:
        'LEFT JOIN giữ nguyên mọi dòng bên trái; cột từ bảng phải sẽ là NULL nếu không khớp.',
    },
    {
      id: 'data-s1-q4',
      prompt: 'Vì sao nên đặt chỉ mục (index) trên cột thường dùng ở mệnh đề WHERE?',
      choices: [
        'Để cột đó không cho phép NULL',
        'Để tra cứu nhanh hơn thay vì quét toàn bảng',
        'Để tự động sao lưu dữ liệu',
        'Chỉ mục không ảnh hưởng tốc độ',
      ],
      answerIndex: 1,
      explain:
        'Chỉ mục là cấu trúc tra cứu (thường B-tree) giúp tìm dòng khớp điều kiện mà không phải đọc hết bảng.',
    },
    {
      id: 'data-s1-q5',
      prompt: 'GROUP BY thường đi kèm với loại hàm nào?',
      choices: [
        'Hàm tổng hợp (COUNT, SUM, AVG…)',
        'Hàm chuỗi (CONCAT)',
        'Hàm ngày giờ (NOW)',
        'Không cần hàm nào',
      ],
      answerIndex: 0,
      explain:
        'GROUP BY gom dòng theo nhóm, hàm tổng hợp tính một giá trị đại diện cho mỗi nhóm đó.',
    },
  ],
  'ai-s1': [
    {
      id: 'ai-s1-q1',
      prompt: 'RAG (Retrieval-Augmented Generation) giải quyết chủ yếu vấn đề gì của LLM?',
      choices: [
        'Tốc độ suy luận chậm',
        'Trả lời dựa trên tài liệu/kiến thức mà mô hình chưa từng huấn luyện',
        'Chi phí GPU khi huấn luyện',
        'Giao diện người dùng đẹp hơn',
      ],
      answerIndex: 1,
      explain:
        'RAG truy hồi đoạn văn bản liên quan rồi đưa vào prompt — mô hình trả lời DỰA TRÊN tài liệu đó, không phải bịa từ trí nhớ huấn luyện.',
    },
    {
      id: 'ai-s1-q2',
      prompt: 'Vì sao cần bộ đánh giá (eval) tự động cho ứng dụng LLM trước khi phát hành?',
      choices: [
        'Vì LLM luôn trả lời sai',
        'Vì đầu ra không tất định — cùng câu hỏi có thể ra câu trả lời khác nhau giữa các lần',
        'Vì eval bắt buộc theo luật',
        'Vì eval làm ứng dụng chạy nhanh hơn',
      ],
      answerIndex: 1,
      explain:
        'LLM không tất định nên một lần thử "chạy được" không chứng minh được gì — eval đo trên tập câu hỏi lặp lại được.',
    },
    {
      id: 'ai-s1-q3',
      prompt: 'Guardrail trong ứng dụng LLM dùng để làm gì?',
      choices: [
        'Tăng tốc độ phản hồi',
        'Chặn/lọc đầu vào-đầu ra nguy hiểm, lệch chủ đề, hoặc vượt giới hạn chi phí',
        'Giảm kích thước mô hình',
        'Tự động dịch ngôn ngữ',
      ],
      answerIndex: 1,
      explain:
        'Guardrail là lớp kiểm soát bao quanh lời gọi mô hình — an toàn nội dung, chống lạm dụng, và quản chi phí.',
    },
    {
      id: 'ai-s1-q4',
      prompt: 'Prompt injection là rủi ro bảo mật đặc trưng của loại hệ thống nào?',
      choices: [
        'Cơ sở dữ liệu quan hệ truyền thống',
        'Hệ thống dùng LLM đọc nội dung do người dùng/bên thứ ba cung cấp',
        'Mạng máy tính nội bộ',
        'Hệ điều hành di động',
      ],
      answerIndex: 1,
      explain:
        'Văn bản đầu vào có thể chứa chỉ thị giả mạo khiến mô hình làm sai ý người vận hành — rủi ro riêng của hệ dùng LLM.',
    },
    {
      id: 'ai-s1-q5',
      prompt: 'Khi nào nên ưu tiên RAG thay vì fine-tune mô hình?',
      choices: [
        'Khi dữ liệu thay đổi thường xuyên và cần nguồn trích dẫn được',
        'Khi muốn mô hình học một PHONG CÁCH viết cố định',
        'Khi không có tài liệu nào để tra cứu',
        'RAG và fine-tune luôn cho kết quả giống hệt nhau',
      ],
      answerIndex: 0,
      explain:
        'RAG cập nhật tri thức bằng cách đổi tài liệu nguồn (rẻ, nhanh); fine-tune tốn hơn, hợp khi cần đổi HÀNH VI/phong cách mô hình.',
    },
  ],
  'devops-s1': [
    {
      id: 'devops-s1-q1',
      prompt: 'Đóng gói ứng dụng bằng container (ví dụ Docker) giải quyết vấn đề gì?',
      choices: [
        'Làm code chạy nhanh hơn tuyệt đối',
        '"Chạy được ở máy tôi" — đóng gói cả môi trường để chạy giống nhau ở mọi nơi',
        'Tự động viết test',
        'Thay thế hoàn toàn hệ điều hành',
      ],
      answerIndex: 1,
      explain:
        'Container đóng gói ứng dụng + dependency + cấu hình vào một image, triển khai ở đâu cũng chạy giống nhau.',
    },
    {
      id: 'devops-s1-q2',
      prompt: 'CI (Continuous Integration) chủ yếu làm gì mỗi khi có commit mới?',
      choices: [
        'Tự động deploy lên production ngay lập tức, không kiểm gì',
        'Tự động build + chạy test để phát hiện lỗi sớm',
        'Tự động viết changelog',
        'Xoá code cũ không dùng',
      ],
      answerIndex: 1,
      explain:
        'CI là vòng kiểm tra tự động (build, lint, test) chạy trên MỌI thay đổi — phát hiện lỗi trước khi nó lan xa.',
    },
    {
      id: 'devops-s1-q3',
      prompt: 'Vì sao nên tách biến môi trường nhạy cảm (API key, mật khẩu DB) ra khỏi code?',
      choices: [
        'Vì code chạy chậm hơn nếu để chung',
        'Để đổi giá trị mà không phải sửa/deploy lại code, và tránh lộ secret khi push lên Git',
        'Vì ngôn ngữ lập trình không cho phép hằng số',
        'Không có lý do kỹ thuật, chỉ là quy ước',
      ],
      answerIndex: 1,
      explain:
        'Biến môi trường tách cấu hình khỏi mã nguồn — đổi được theo môi trường (dev/prod) và không lộ secret vào lịch sử Git.',
    },
    {
      id: 'devops-s1-q4',
      prompt: 'Rollback trong vận hành hệ thống nghĩa là gì?',
      choices: [
        'Xoá toàn bộ dữ liệu người dùng',
        'Quay lại phiên bản chạy ổn định trước đó khi bản mới gây lỗi',
        'Nâng cấp lên phiên bản mới nhất bắt buộc',
        'Tắt hẳn hệ thống để bảo trì',
      ],
      answerIndex: 1,
      explain:
        'Rollback là lưới an toàn: phát hiện bản mới có lỗi nghiêm trọng thì quay lại bản cũ đã biết là ổn, giảm thời gian gián đoạn.',
    },
    {
      id: 'devops-s1-q5',
      prompt: 'Health check endpoint (ví dụ /api/health) dùng để làm gì?',
      choices: [
        'Kiểm tra sức khoẻ người dùng',
        'Cho hệ thống giám sát/orchestrator biết dịch vụ còn sống và sẵn sàng nhận request',
        'Tính tiền theo lượt gọi API',
        'Ghi log mọi truy vấn database',
      ],
      answerIndex: 1,
      explain:
        'Health check là tín hiệu sống còn — load balancer/orchestrator dựa vào đó để quyết định có định tuyến traffic tới instance hay không.',
    },
  ],
}

/** Quiz của một chặng; mảng RỖNG nghĩa là chặng CHƯA có bài kiểm — qua không cần quiz. */
export function quizOfStage(stageId: string): StageQuizQuestion[] {
  return STAGE_QUIZZES[stageId.trim().toLowerCase()] ?? []
}

/** Chặng này đã có quiz thật chưa — dùng để gắn nhãn UI mà không phải gọi quizOfStage rồi so độ dài. */
export function stageHasQuiz(stageId: string): boolean {
  return quizOfStage(stageId).length > 0
}
