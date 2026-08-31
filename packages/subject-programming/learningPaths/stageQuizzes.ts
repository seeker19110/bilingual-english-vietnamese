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
  // 4 chặng RIÊNG của giai đoạn P5 "Tầm trưởng" — soạn đợt 4. Đặc tả:
  // docs/specs/2026-08-31-dot-4-p5-tam-truong.md.
  'principal-s1': [
    {
      id: 'principal-s1-q1',
      prompt: 'Đặc tả giao việc cho AI vì sao PHẢI có mục "KHÔNG làm"?',
      choices: [
        'Để đặc tả dài hơn, trông chuyên nghiệp hơn',
        'Để chặn phạm vi phình ra — không có mục này, AI/người thi hành dễ tự ý làm thêm việc ngoài ý định',
        'Vì công cụ soạn thảo bắt buộc phải có mục này',
        'Để dễ tính tiền công theo số dòng',
      ],
      answerIndex: 1,
      explain:
        'Mục "KHÔNG làm" là ranh giới tường minh — thiếu nó thì bên thi hành (AI hay người) không biết dừng ở đâu, dễ mở rộng phạm vi ngoài ý định ban đầu.',
    },
    {
      id: 'principal-s1-q2',
      prompt: 'Tiêu chí chấp nhận nào dưới đây ĐO ĐƯỢC (không mơ hồ)?',
      choices: [
        'Hệ thống phải chạy nhanh',
        'API phản hồi dưới 200ms ở 95% request',
        'Giao diện phải đẹp và thân thiện',
        'Code phải sạch sẽ, dễ đọc',
      ],
      answerIndex: 1,
      explain:
        'Câu này có SỐ (200ms) và cách đo (phân vị 95%) — kiểm chứng được đúng/sai. Ba câu còn lại là cảm tính, không đo được.',
    },
    {
      id: 'principal-s1-q3',
      prompt: 'Recall trong đánh giá mô hình đo điều gì?',
      choices: [
        'Trong số các ca AI đoán là dương, bao nhiêu % đoán đúng',
        'Trong số các ca THẬT là dương, bao nhiêu % được AI bắt được',
        'Tốc độ mô hình chạy nhanh hay chậm',
        'Chi phí token trung bình mỗi lượt gọi',
      ],
      answerIndex: 1,
      explain:
        'Recall = TP/(TP+FN): trong số ca THẬT SỰ dương, mô hình bắt được bao nhiêu — bỏ sót (FN) làm giảm recall. Câu đầu mô tả precision.',
    },
    {
      id: 'principal-s1-q4',
      prompt: 'Cache prompt giúp ích gì cho ngân sách chi phí AI?',
      choices: [
        'Làm mô hình thông minh hơn',
        'Gọi lại đúng prompt/ngữ cảnh đã gửi trước đó không bị tính tiền đầy đủ như lần đầu — giảm chi phí lặp',
        'Tăng recall của mô hình',
        'Thay thế hoàn toàn việc cần eval',
      ],
      answerIndex: 1,
      explain:
        'Cache prompt tận dụng phần ngữ cảnh lặp lại (system prompt, tài liệu nền) để giảm chi phí tính theo token ở các lượt gọi sau — không liên quan tới chất lượng mô hình.',
    },
    {
      id: 'principal-s1-q5',
      prompt: 'Vì sao "đếm/giới hạn lượt gọi AI" nên nằm trong đặc tả ngay từ đầu?',
      choices: [
        'Vì luật bắt buộc phải viết đủ số trang',
        'Chi phí là ràng buộc THIẾT KẾ — không kiểm soát từ đầu thì tính năng có thể đốt tiền ngoài dự tính khi nhiều người dùng cùng lúc',
        'Vì AI chỉ chạy được khi có giới hạn lượt',
        'Để giao diện hiện đúng số lượt còn lại, không liên quan chi phí',
      ],
      answerIndex: 1,
      explain:
        'Không đặt ngân sách/giới hạn lượt từ đầu thì chi phí AI có thể vượt kiểm soát rất nhanh khi lưu lượng tăng — đây là ràng buộc kỹ thuật, không phải việc để tính sau.',
    },
  ],
  'principal-s2': [
    {
      id: 'principal-s2-q1',
      prompt: 'Vòng lặp agent tối giản gồm những bước nào, đúng thứ tự?',
      choices: [
        'Nghĩ → gọi tool → đọc kết quả → lặp (tới khi đủ điều kiện dừng)',
        'Gọi tool → nghĩ → dừng ngay',
        'Chỉ gọi tool một lần rồi kết thúc, không có bước "nghĩ"',
        'Đọc kết quả trước, sau đó mới quyết định có cần tool hay không, không bao giờ lặp',
      ],
      answerIndex: 0,
      explain:
        'Agent là vòng lặp: quyết định hành động (nghĩ) → thực thi (gọi tool) → quan sát kết quả → lặp lại cho tới khi đạt điều kiện dừng.',
    },
    {
      id: 'principal-s2-q2',
      prompt: 'Vì sao vòng lặp agent bắt buộc phải có điều kiện dừng (số bước tối đa)?',
      choices: [
        'Để code ngắn hơn',
        'Chống lặp vô hạn — agent có thể kẹt gọi tool lặp lại mãi nếu không có ngưỡng chặn',
        'Vì tool luôn trả lỗi ở bước cuối',
        'Không cần thiết, agent tự biết khi nào nên dừng',
      ],
      answerIndex: 1,
      explain:
        'Không có ngưỡng dừng cứng thì một lỗi logic hay tool phản hồi mập mờ có thể khiến agent lặp mãi, tốn chi phí và tài nguyên vô hạn.',
    },
    {
      id: 'principal-s2-q3',
      prompt: 'Vì sao mọi tham số truyền vào tool PHẢI được validate trước khi chạy?',
      choices: [
        'Vì AI luôn tạo tham số đúng, validate chỉ là thủ tục',
        'Vì tham số do model sinh ra có thể sai kiểu/thiếu/độc hại — không kiểm là tin mù vào đầu ra của model',
        'Để code chạy chậm hơn, an toàn cảm tính',
        'Chỉ cần validate khi gọi tool xoá dữ liệu',
      ],
      answerIndex: 1,
      explain:
        'Đầu ra của model không phải dữ liệu đáng tin tuyệt đối — tham số có thể sai kiểu, thiếu trường, hoặc bị chèn nội dung độc hại; validate là lớp phòng thủ bắt buộc.',
    },
    {
      id: 'principal-s2-q4',
      prompt: 'MCP (Model Context Protocol) chuẩn hoá điều gì?',
      choices: [
        'Cách vẽ giao diện chat cho agent',
        'Hợp đồng "liệt kê tool có sẵn + gọi tool theo tên" giữa model và công cụ, dùng chung được nhiều nơi',
        'Cách tính tiền theo token',
        'Thuật toán huấn luyện mô hình ngôn ngữ',
      ],
      answerIndex: 1,
      explain:
        'MCP là một giao thức/hợp đồng chuẩn cho việc mô tả và gọi công cụ (tool) — giúp nhiều model/nhiều client dùng chung một bộ tool mà không phải viết tích hợp riêng cho từng bên.',
    },
    {
      id: 'principal-s2-q5',
      prompt:
        'Vì sao "allowlist" tool an toàn hơn cho agent tự do gọi bất kỳ hàm nào nó "nghĩ ra"?',
      choices: [
        'Allowlist chạy nhanh hơn về mặt kỹ thuật',
        'Allowlist giới hạn agent chỉ được chạy các hành động đã được RÀ SOÁT trước — chặn hành vi ngoài ý định',
        'Allowlist làm agent thông minh hơn',
        'Không có khác biệt, chỉ là gu code',
      ],
      answerIndex: 1,
      explain:
        'Agent tự do gọi hàm bất kỳ mở ra rủi ro thực thi hành động chưa được kiểm soát; allowlist là ranh giới an toàn — chỉ hành động đã duyệt mới chạy được.',
    },
  ],
  'principal-s3': [
    {
      id: 'principal-s3-q1',
      prompt: 'ADR (Architecture Decision Record) ghi lại điều gì?',
      choices: [
        'Toàn bộ code nguồn của hệ thống',
        'Một quyết định kiến trúc: bối cảnh, các lựa chọn đã cân, quyết định chọn, đánh đổi, hệ quả',
        'Lịch sử commit của repo',
        'Danh sách lỗi đã sửa trong tuần',
      ],
      answerIndex: 1,
      explain:
        'ADR là bản ghi NGẮN cho một quyết định kiến trúc — giúp người sau (kể cả chính bạn 6 tháng sau) hiểu vì sao quyết định đó được chọn, không phải nhật ký code.',
    },
    {
      id: 'principal-s3-q2',
      prompt: '"Chọn X vì X tốt" có phải một lý do ADR chấp nhận được không?',
      choices: [
        'Có, ngắn gọn là đủ',
        'Không — ADR tốt phải nêu các LỰA CHỌN đã cân và ĐÁNH ĐỔI cụ thể, không phải khẳng định suông',
        'Có, miễn là quyết định đúng',
        'Không liên quan tới ADR',
      ],
      answerIndex: 1,
      explain:
        '"X tốt" không giải thích được điều gì — ADR có giá trị vì nó phơi bày lựa chọn đã bị loại và LÝ DO đánh đổi, để người đọc hiểu và có thể xem lại khi hoàn cảnh đổi.',
    },
    {
      id: 'principal-s3-q3',
      prompt: 'Khi nào nên nghiêng về build (tự vận hành) thay vì buy (thuê API)?',
      choices: [
        'Luôn luôn nên buy vì rẻ hơn',
        'Khi lượng dùng đủ lớn để vượt điểm hoà vốn — chi phí cố định tự vận hành rẻ hơn tổng chi phí thuê theo lượt về lâu dài',
        'Chỉ khi công ty thích tự làm mọi thứ',
        'Build luôn tốt hơn vì kiểm soát được code',
      ],
      answerIndex: 1,
      explain:
        'Quyết định build vs buy dựa trên điểm hoà vốn: dưới điểm đó thuê rẻ hơn, vượt điểm đó tự vận hành rẻ hơn — quyết định theo SỐ, không theo cảm tính.',
    },
    {
      id: 'principal-s3-q4',
      prompt: 'RAG thường phù hợp hơn fine-tune khi nào?',
      choices: [
        'Khi dữ liệu gần như không bao giờ đổi',
        'Khi dữ liệu thay đổi thường xuyên — cập nhật RAG (đổi nguồn tra cứu) rẻ và nhanh hơn huấn luyện lại mô hình',
        'Khi cần văn phong đầu ra rất đặc thù, cố định',
        'RAG và fine-tune luôn thay thế được cho nhau, chọn cái nào cũng như nhau',
      ],
      answerIndex: 1,
      explain:
        'RAG tra cứu dữ liệu tại thời điểm hỏi nên cập nhật gần như tức thì; fine-tune "đóng băng" tri thức vào trọng số mô hình, hợp khi dữ liệu ổn định và cần định dạng/văn phong đặc thù.',
    },
    {
      id: 'principal-s3-q5',
      prompt: 'Một phương án model bị coi là "áp đảo" (dominated) khi nào?',
      choices: [
        'Khi nó đắt nhất trong danh sách',
        'Khi tồn tại phương án khác vừa RẺ HƠN HOẶC BẰNG vừa TỐT HƠN HOẶC BẰNG, và chặt hơn ở ít nhất một tiêu chí',
        'Khi nó là model mới nhất trên thị trường',
        'Khi không ai từng dùng thử nó',
      ],
      answerIndex: 1,
      explain:
        'Phương án bị áp đảo là phương án mà bạn không có lý do gì để chọn — luôn có phương án khác tốt hơn hoặc bằng ở MỌI tiêu chí, nên loại nó khỏi cân nhắc.',
    },
  ],
  'principal-s4': [
    {
      id: 'principal-s4-q1',
      prompt: 'Checklist review code AI sinh nên kiểm những gì?',
      choices: [
        'Chỉ cần kiểm code có chạy được hay không',
        'Đúng yêu cầu, ca biên, có bịa API không, bảo mật, có test hay không',
        'Chỉ cần kiểm tốc độ viết code có nhanh không',
        'Chỉ cần đếm số dòng code AI sinh ra',
      ],
      answerIndex: 1,
      explain:
        'Code AI sinh có rủi ro riêng (bịa hàm/API không tồn tại, bỏ sót ca biên) ngoài các rủi ro thường gặp — checklist 5 điểm bao trọn cả hai loại.',
    },
    {
      id: 'principal-s4-q2',
      prompt: 'Khi đọc diff, phát hiện nào nên được xử lý ƯU TIÊN cao nhất?',
      choices: [
        'Lỗi phong cách đặt tên biến',
        'Lỗ hổng bảo mật',
        'Hiệu năng chưa tối ưu',
        'Thiếu comment giải thích',
      ],
      answerIndex: 1,
      explain:
        'Thứ tự ưu tiên rủi ro: bảo mật > đúng đắn > hiệu năng > phong cách — lỗ hổng bảo mật có thể gây hậu quả nghiêm trọng nhất nếu bỏ lọt.',
    },
    {
      id: 'principal-s4-q3',
      prompt: 'Post-mortem "không đổ lỗi" (blameless) tập trung vào điều gì?',
      choices: [
        'Xác định CHÍNH XÁC ai đã gây ra lỗi để nhắc nhở',
        'Hệ thống và quy trình đã cho phép lỗi đó xảy ra như thế nào, và hành động sửa để không lặp lại',
        'Ghi lại thời gian downtime để tính KPI cá nhân',
        'Không cần viết gì, chỉ cần sửa lỗi rồi thôi',
      ],
      answerIndex: 1,
      explain:
        'Đổ lỗi cá nhân khiến người ta giấu lỗi lần sau; post-mortem blameless nhìn vào QUY TRÌNH/HỆ THỐNG đã hở chỗ nào, để sửa cho mọi người, không phải để trừng phạt một người.',
    },
    {
      id: 'principal-s4-q4',
      prompt: '5 whys dùng để làm gì trong post-mortem?',
      choices: [
        'Hỏi 5 người khác nhau về sự cố',
        'Đào liên tiếp "vì sao" từ triệu chứng bề mặt xuống NGUYÊN NHÂN GỐC, thay vì dừng ở lỗi hiện tượng',
        'Viết đúng 5 dòng báo cáo',
        'Kiểm tra 5 phần của hệ thống theo thứ tự cố định',
      ],
      answerIndex: 1,
      explain:
        '5 whys là kỹ thuật hỏi lặp "vì sao" để đi từ triệu chứng (server sập) xuống nguyên nhân gốc thật sự (thiếu giám sát ngưỡng bộ nhớ) — dừng sớm dễ chỉ vá triệu chứng.',
    },
    {
      id: 'principal-s4-q5',
      prompt: 'Vì sao sự cố AI thường "hỏng âm thầm" hơn sự cố phần mềm thường?',
      choices: [
        'Vì AI không bao giờ có lỗi',
        'Vì AI trả lời SAI nhưng vẫn trông như một câu trả lời bình thường — không có crash/exception rõ ràng để báo động',
        'Vì AI luôn crash ngay khi có lỗi, dễ phát hiện hơn phần mềm thường',
        'Vì không ai dùng AI trong production',
      ],
      answerIndex: 1,
      explain:
        'Phần mềm lỗi thường crash hoặc trả mã lỗi rõ ràng; AI có thể trả lời sai một cách TỰ TIN và trơn tru — cần ngưỡng cảnh báo theo tỉ lệ lỗi/chất lượng thay vì chờ crash.',
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
