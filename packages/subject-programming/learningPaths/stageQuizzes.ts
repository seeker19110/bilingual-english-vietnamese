// learningPaths/stageQuizzes.ts — Ngân hàng QUIZ SAU CHẶNG của lộ trình mục tiêu.
//
// Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md (đợt 3). Quiz là CỔNG CỦA LỘ
// TRÌNH — đạt ≥ 4/5 mới đánh dấu `completed` trên `programming.path_progress`; KHÔNG đổi
// luật hoàn thành chặng ở tầng HƯỚNG gốc (`programming.spec_stage_progress` vẫn theo bài học
// thật, không liên quan quiz này).
//
// Đợt 3 cố ý chỉ soạn 4 chặng đầu mỗi giai đoạn P1–P4 (mathforcode-s1 · data-s1 · ai-s1 ·
// devops-s1). Đặc tả bổ sung `docs/specs/2026-08-31-quiz-18-chang-con-lai.md` lấp nốt 18
// chặng còn lại — nay đủ 22/22 chặng P1–P4 của lộ trình `principal-ai`.
// `quizOfStage()` trả mảng RỖNG cho chặng chưa soạn — chặng đó qua KHÔNG CẦN quiz, UI phải
// nói rõ "chưa có bài kiểm", không hứa suông (không còn chặng P1–P4 nào rơi vào ca này).

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
  'mathforcode-s2': [
    {
      id: 'mathforcode-s2-q1',
      prompt: 'Khi thứ tự chọn KHÔNG quan trọng, ta dùng khái niệm đếm nào?',
      choices: ['Chỉnh hợp', 'Hoán vị', 'Tổ hợp', 'Quy tắc nhân'],
      answerIndex: 2,
      explain:
        'Tổ hợp đếm số cách chọn khi thứ tự không quan trọng; chỉnh hợp/hoán vị mới quan tâm thứ tự.',
    },
    {
      id: 'mathforcode-s2-q2',
      prompt: 'Bài toán sinh nhật (birthday paradox) trong bảng băm cho biết điều gì?',
      choices: [
        'Va chạm chỉ xảy ra khi bảng gần đầy 100%',
        'Xác suất va chạm tăng nhanh bất ngờ ngay cả khi số phần tử còn khá ít so với kích thước bảng',
        'Bảng băm không bao giờ va chạm nếu hàm băm tốt',
        'Va chạm chỉ phụ thuộc vào ngôn ngữ lập trình',
      ],
      answerIndex: 1,
      explain:
        'Giống nghịch lý sinh nhật: chỉ cần khoảng căn bậc hai của kích thước không gian là xác suất trùng đã đáng kể — bảng băm cần tính trước rủi ro này.',
    },
    {
      id: 'mathforcode-s2-q3',
      prompt: 'Vì sao độ trễ hệ thống nên báo cáo theo phân vị p95/p99 thay vì trung bình?',
      choices: [
        'Vì trung bình khó tính toán hơn',
        'Vì trung bình dễ bị vài ca chậm bất thường kéo lệch, che mất trải nghiệm của phần lớn người dùng',
        'Vì p95/p99 luôn là con số nhỏ hơn trung bình',
        'Vì trung bình không áp dụng được cho số liệu thời gian',
      ],
      answerIndex: 1,
      explain:
        'Trung bình bị các ca ngoại lai (rất chậm) kéo lệch; phân vị p95/p99 cho biết trải nghiệm của phần lớn hoặc gần hết người dùng, sát thực tế hơn.',
    },
    {
      id: 'mathforcode-s2-q4',
      prompt: 'Bộ sinh số giả ngẫu nhiên (PRNG) dùng cùng một hạt giống (seed) thì cho kết quả gì?',
      choices: [
        'Một chuỗi số khác nhau mỗi lần chạy',
        'Đúng cùng một chuỗi số, tái hiện lại được toàn bộ',
        'Luôn trả về cùng một số duy nhất',
        'Lỗi vì hạt giống trùng nhau bị cấm',
      ],
      answerIndex: 1,
      explain:
        'PRNG là thuật toán tất định — cùng hạt giống sinh ra đúng cùng chuỗi số, đây là điều kiện để mô phỏng chạy lại kiểm chứng được.',
    },
    {
      id: 'mathforcode-s2-q5',
      prompt: 'Trộn Fisher-Yates dùng để làm gì và lỗi hay gặp khi cài sai là gì?',
      choices: [
        'Sắp xếp mảng theo thứ tự tăng dần; lỗi hay gặp là quên so sánh',
        'Xáo trộn mảng đều ngẫu nhiên; cài sai (ví dụ đổi chỗ ngẫu nhiên không đúng phạm vi) gây thiên lệch, một số hoán vị xuất hiện nhiều hơn hoán vị khác',
        'Tìm phần tử lớn nhất trong mảng; lỗi hay gặp là tràn số',
        'Nén dữ liệu; lỗi hay gặp là mất dữ liệu',
      ],
      answerIndex: 1,
      explain:
        'Fisher-Yates xáo trộn đúng cho ra mọi hoán vị với xác suất bằng nhau; cài sai phạm vi hoán đổi là lỗi thiên lệch kinh điển, khó phát hiện bằng mắt.',
    },
  ],
  'mathforcode-s3': [
    {
      id: 'mathforcode-s3-q1',
      prompt: 'Vì sao phải chặn sớm trường hợp chia cho độ dài vector bằng 0 khi chuẩn hoá?',
      choices: [
        'Vì Python không cho phép chia bằng 0 trong mọi trường hợp',
        'Vì chia cho 0 (vector không) là ca suy biến toán học, cần báo lỗi rõ thay vì để chương trình trả kết quả rác hoặc NaN',
        'Vì vector không có độ dài',
        'Vì chuẩn hoá luôn không cần thiết',
      ],
      answerIndex: 1,
      explain:
        'Vector độ dài 0 không có hướng xác định — chia cho 0 sẽ ra lỗi hoặc NaN; nền tảng toán học yêu cầu chặn sớm và báo lỗi rõ ràng thay vì để lan truyền âm thầm.',
    },
    {
      id: 'mathforcode-s3-q2',
      prompt:
        'Toạ độ thuần nhất (homogeneous coordinates) giải quyết vấn đề gì khi ghép phép biến đổi?',
      choices: [
        'Làm phép nhân ma trận chạy nhanh hơn',
        'Cho phép gộp cả phép TỊNH TIẾN vào chung một phép nhân ma trận với xoay/co giãn',
        'Loại bỏ hoàn toàn nhu cầu dùng ma trận',
        'Chỉ dùng cho hình học 3D, không áp dụng được cho 2D',
      ],
      answerIndex: 1,
      explain:
        'Phép tịnh tiến không biểu diễn được bằng nhân ma trận tuyến tính thuần tuý; thêm một chiều toạ độ thuần nhất cho phép gộp cả tịnh tiến vào chuỗi nhân ma trận.',
    },
    {
      id: 'mathforcode-s3-q3',
      prompt:
        'Ma trận SUY BIẾN (định thức bằng 0) trong hệ phương trình tuyến tính có nghĩa là gì?',
      choices: [
        'Hệ luôn có đúng một nghiệm duy nhất',
        'Hệ vô nghiệm hoặc vô số nghiệm, không thể giải bằng nghịch đảo ma trận thông thường',
        'Ma trận đó bị lỗi cú pháp',
        'Chỉ cần nhân thêm hằng số là giải được bình thường',
      ],
      answerIndex: 1,
      explain:
        'Định thức bằng 0 nghĩa là các hàng/cột phụ thuộc tuyến tính — hệ mất tính duy nhất nghiệm, bộ giải phải phát hiện và báo lỗi rõ thay vì trả kết quả sai.',
    },
    {
      id: 'mathforcode-s3-q4',
      prompt: 'Vector riêng (eigenvector) của một ma trận biến đổi có đặc điểm gì?',
      choices: [
        'Luôn có độ dài bằng 0 sau phép biến đổi',
        'Hướng của nó không đổi sau phép biến đổi, chỉ độ dài bị co giãn theo giá trị riêng tương ứng',
        'Nó là vector ngẫu nhiên chọn được bất kỳ trong không gian',
        'Nó chỉ tồn tại với ma trận vuông kích thước 2x2',
      ],
      answerIndex: 1,
      explain:
        'Vector riêng giữ nguyên hướng sau khi nhân với ma trận, chỉ bị co giãn theo hệ số là giá trị riêng — đây là nền tảng để hiểu lặp luỹ thừa và PageRank.',
    },
    {
      id: 'mathforcode-s3-q5',
      prompt:
        'Vì sao khử Gauss cần chọn trụ (pivot) theo giá trị lớn nhất thay vì lấy trụ đầu tiên gặp?',
      choices: [
        'Vì trụ lớn nhất luôn cho tốc độ tính toán nhanh hơn',
        'Vì trụ quá nhỏ khi dùng làm mẫu số gây khuếch đại sai số dấu phẩy động, làm kết quả sai lệch nhiều',
        'Vì luật toán học bắt buộc phải chọn số lớn nhất',
        'Vì trụ nhỏ khiến chương trình bị crash ngay lập tức',
      ],
      answerIndex: 1,
      explain:
        'Chia cho một số rất nhỏ khuếch đại sai số làm tròn của dấu phẩy động; chọn trụ lớn nhất (partial pivoting) giữ sai số trong tầm kiểm soát.',
    },
  ],
  'mathforcode-s4': [
    {
      id: 'mathforcode-s4-q1',
      prompt: 'Đạo hàm số bằng sai phân hữu hạn dùng để làm gì trong việc cài gradient descent?',
      choices: [
        'Thay thế hoàn toàn công thức đạo hàm tay, dùng luôn trong huấn luyện thật',
        'Kiểm tra công thức đạo hàm tay/lan truyền ngược có cài đúng hay không, bằng cách xấp xỉ độc lập',
        'Tăng tốc độ hội tụ của mô hình',
        'Chỉ dùng khi hàm không có đạo hàm',
      ],
      answerIndex: 1,
      explain:
        'Sai phân hữu hạn là cách xấp xỉ đạo hàm độc lập với công thức tay — dùng để đối chiếu, phát hiện lỗi cài đặt gradient/lan truyền ngược trước khi tin kết quả huấn luyện.',
    },
    {
      id: 'mathforcode-s4-q2',
      prompt: 'Điều gì xảy ra khi tốc độ học (learning rate) đặt QUÁ LỚN trong gradient descent?',
      choices: [
        'Mô hình hội tụ nhanh hơn và chính xác hơn',
        'Quá trình học có thể phân kỳ — giá trị hàm mất mát dao động hoặc tăng thay vì giảm dần',
        'Không ảnh hưởng gì vì gradient descent luôn hội tụ',
        'Chỉ làm chậm tốc độ huấn luyện, không gây lỗi khác',
      ],
      answerIndex: 1,
      explain:
        'Bước nhảy quá lớn khiến tham số vọt qua điểm cực tiểu rồi dao động hoặc phát tán ra xa — đây là dấu hiệu phân kỳ, quan sát rõ trên đồ thị hàm mất mát.',
    },
    {
      id: 'mathforcode-s4-q3',
      prompt: 'Hàm mất mát LỒI (convex) khác hàm KHÔNG LỒI ở điểm quan trọng nào?',
      choices: [
        'Hàm lồi luôn tính toán nhanh hơn',
        'Hàm lồi chỉ có một cực tiểu toàn cục; hàm không lồi có thể có nhiều cực tiểu địa phương khiến gradient descent bị kẹt',
        'Hàm lồi không có đạo hàm',
        'Không có khác biệt thực tế nào giữa hai loại',
      ],
      answerIndex: 1,
      explain:
        'Với hàm lồi, tìm được cực tiểu địa phương là tìm được cực tiểu toàn cục; hàm không lồi (như mạng nơ-ron) có thể có nhiều "hố" khiến gradient descent dừng ở nghiệm không tối ưu nhất.',
    },
    {
      id: 'mathforcode-s4-q4',
      prompt:
        'Quy tắc chuỗi (chain rule) đóng vai trò gì trong lan truyền ngược (backpropagation)?',
      choices: [
        'Giúp khởi tạo trọng số ban đầu ngẫu nhiên',
        'Cho phép tính đạo hàm của hàm mất mát theo từng tham số ở các tầng sâu, bằng cách nhân các đạo hàm cục bộ qua từng tầng',
        'Tăng tốc độ đọc dữ liệu đầu vào',
        'Loại bỏ nhu cầu tính đạo hàm hoàn toàn',
      ],
      answerIndex: 1,
      explain:
        'Mạng nhiều tầng là hàm hợp; quy tắc chuỗi cho phép "chia" đạo hàm tổng thành tích các đạo hàm cục bộ từng tầng, lan truyền ngược từ đầu ra về từng tham số.',
    },
    {
      id: 'mathforcode-s4-q5',
      prompt:
        'Khi nào nên DỪNG quá trình tối ưu một bài toán thực tế, theo góc nhìn chi phí-lợi ích?',
      choices: [
        'Không bao giờ dừng, luôn tối ưu tới khi đạt giá trị tuyệt đối tốt nhất',
        'Khi chi phí tính toán thêm để cải thiện kết quả vượt quá giá trị mà cải thiện đó mang lại',
        'Dừng ngay sau vòng lặp đầu tiên bất kể kết quả',
        'Chỉ dừng khi hàm mất mát bằng đúng 0',
      ],
      answerIndex: 1,
      explain:
        'Tối ưu là bài toán kinh tế, không chỉ toán học thuần tuý — tiếp tục tính khi chi phí (thời gian máy, tiền) vượt lợi ích thu được là lãng phí không đáng.',
    },
  ],
  'algo-s1': [
    {
      id: 'algo-s1-q1',
      prompt: 'Phân tích khấu hao (amortized analysis) dùng để đánh giá điều gì?',
      choices: [
        'Chi phí tệ nhất của MỘT lần gọi thao tác duy nhất',
        'Chi phí trung bình của một thao tác tính trên MỘT DÃY thao tác, kể cả khi có vài lần tốn kém bất thường (như mảng động phải cấp phát lại)',
        'Bộ nhớ tối đa chương trình có thể dùng',
        'Số dòng code của một hàm',
      ],
      answerIndex: 1,
      explain:
        'Phân tích khấu hao trải chi phí của các thao tác hiếm nhưng đắt (như mảng động tăng gấp đôi) đều ra trên cả dãy thao tác, cho một con số trung bình sát thực tế hơn.',
    },
    {
      id: 'algo-s1-q2',
      prompt: 'Vì sao cần đo thời gian chạy THẬT để đối chiếu với độ phức tạp lý thuyết đã tính?',
      choices: [
        'Vì lý thuyết Big-O luôn sai',
        'Vì hằng số ẩn trong Big-O, cache CPU, và đặc điểm dữ liệu thật có thể khiến thuật toán lý thuyết tốt hơn lại chạy chậm hơn trong thực tế ở kích thước nhỏ',
        'Vì đo thời gian thật thay thế hoàn toàn việc cần phân tích Big-O',
        'Vì trình biên dịch luôn tối ưu sai',
      ],
      answerIndex: 1,
      explain:
        'Big-O bỏ qua hằng số nhân — một thuật toán O(n log n) có hằng số lớn có thể chậm hơn O(n²) có hằng số nhỏ ở dữ liệu không đủ lớn; đo thật giúp kiểm chứng lý thuyết đúng ở quy mô thực tế.',
    },
    {
      id: 'algo-s1-q3',
      prompt: 'Kỹ thuật "hai con trỏ" (two pointers) thường dùng để giải loại bài toán nào?',
      choices: [
        'Tìm chu trình trong đồ thị có hướng',
        'Duyệt qua mảng đã sắp xếp (hoặc dãy con) từ hai đầu/cùng chiều để tránh vòng lặp lồng O(n²)',
        'Sắp xếp một mảng chưa có thứ tự',
        'Tính giá trị riêng của ma trận',
      ],
      answerIndex: 1,
      explain:
        'Hai con trỏ tận dụng tính chất đã sắp xếp hoặc cửa sổ liên tiếp để duyệt tuyến tính O(n) thay vì so mọi cặp O(n²) như cách vét cạn.',
    },
    {
      id: 'algo-s1-q4',
      prompt: 'Tìm kiếm nhị phân "trên đáp án" (binary search on answer) áp dụng khi nào?',
      choices: [
        'Chỉ khi mảng dữ liệu đầu vào đã được sắp xếp sẵn',
        'Khi bản thân không gian ĐÁP ÁN có tính đơn điệu (đáp án nhỏ hơn ngưỡng thì thoả, lớn hơn thì không, hoặc ngược lại), dù mảng đầu vào không cần sắp xếp',
        'Chỉ dùng được cho bài toán tìm số nguyên tố',
        'Không bao giờ áp dụng được ngoài tìm kiếm trong mảng',
      ],
      answerIndex: 1,
      explain:
        'Khác tìm kiếm nhị phân cổ điển trên mảng đã sắp xếp, "trên đáp án" nhị phân trên miền giá trị có thể của lời giải, miễn hàm kiểm tra tính khả thi đơn điệu theo đáp án đó.',
    },
    {
      id: 'algo-s1-q5',
      prompt:
        'Vì sao nên viết một bản giải "đơn giản chắc đúng" (brute force) làm chuẩn đối chiếu trước khi tối ưu?',
      choices: [
        'Vì bản đơn giản luôn được nộp bài để chấm điểm',
        'Để có một nguồn kết quả đáng tin cậy dùng kiểm thử ngẫu nhiên so với bản tối ưu, bắt lỗi logic mà mắt thường khó thấy',
        'Vì bản tối ưu luôn sai, không cần viết',
        'Để tiết kiệm thời gian, không cần viết bản tối ưu nữa',
      ],
      answerIndex: 1,
      explain:
        'Bản vét cạn thường dễ chứng minh đúng nhưng chậm; dùng nó làm "sự thật" để so sánh ngẫu nhiên với bản tối ưu giúp phát hiện lỗi cài đặt tinh vi trước khi tin tưởng bản nhanh.',
    },
  ],
  'algo-s2': [
    {
      id: 'algo-s2-q1',
      prompt: 'Điều kiện quan trọng nhất khi thiết kế một lời giải đệ quy là gì?',
      choices: [
        'Hàm phải gọi chính nó ít nhất 2 lần',
        'Phải chứng minh được đệ quy DỪNG — có điều kiện cơ sở và bài toán con luôn tiến gần hơn tới điều kiện đó',
        'Hàm đệ quy luôn phải trả về số nguyên',
        'Không được dùng biến toàn cục trong đệ quy',
      ],
      answerIndex: 1,
      explain:
        'Thiếu điều kiện dừng đúng hoặc bài toán con không thật sự "nhỏ hơn" sẽ gây đệ quy vô hạn hoặc tràn ngăn xếp — chứng minh dừng là phần bắt buộc, không phải tuỳ chọn.',
    },
    {
      id: 'algo-s2-q2',
      prompt: 'Quay lui có cắt tỉa (backtracking with pruning) cải thiện hiệu năng bằng cách nào?',
      choices: [
        'Bỏ qua hoàn toàn việc kiểm tra điều kiện hợp lệ',
        'Dừng sớm việc khám phá một nhánh ngay khi biết chắc nhánh đó không thể dẫn tới lời giải hợp lệ, thay vì đi hết rồi mới loại',
        'Luôn chạy song song mọi nhánh cùng lúc',
        'Chuyển toàn bộ bài toán sang quy hoạch động',
      ],
      answerIndex: 1,
      explain:
        'Cắt tỉa nhận diện sớm nhánh chắc chắn thất bại (vi phạm ràng buộc) và bỏ qua ngay, giảm đáng kể số trạng thái phải duyệt so với quay lui thuần.',
    },
    {
      id: 'algo-s2-q3',
      prompt: 'Sắp xếp tô-pô (topological sort) chỉ thực hiện được trên loại đồ thị nào?',
      choices: [
        'Đồ thị vô hướng bất kỳ',
        'Đồ thị có hướng KHÔNG chứa chu trình (DAG)',
        'Đồ thị có trọng số âm',
        'Cây nhị phân cân bằng',
      ],
      answerIndex: 1,
      explain:
        'Sắp xếp tô-pô cần một thứ tự tuyến tính tôn trọng mọi cạnh hướng; nếu có chu trình thì không tồn tại thứ tự như vậy — DAG là điều kiện bắt buộc.',
    },
    {
      id: 'algo-s2-q4',
      prompt:
        'Dijkstra tìm đường đi ngắn nhất có hoạt động đúng khi đồ thị có CẠNH TRỌNG SỐ ÂM không?',
      choices: [
        'Có, Dijkstra xử lý được mọi trọng số âm',
        'Không đảm bảo đúng — cần dùng Bellman-Ford (chậm hơn nhưng xử lý được cạnh âm, kể cả phát hiện chu trình âm)',
        'Có, miễn đồ thị vô hướng',
        'Dijkstra không dùng cho đồ thị có trọng số',
      ],
      answerIndex: 1,
      explain:
        'Dijkstra dựa trên giả định "một khi đỉnh đã chốt là ngắn nhất", giả định này sụp đổ khi có cạnh âm; Bellman-Ford xử lý được cạnh âm bằng cách lặp lại nới lỏng nhiều vòng.',
    },
    {
      id: 'algo-s2-q5',
      prompt: 'Để chứng minh một chiến lược THAM LAM là sai, cách thuyết phục nhất là gì?',
      choices: [
        'Giải thích bằng trực giác rằng chiến lược nghe hợp lý',
        'Đưa ra một PHẢN VÍ DỤ cụ thể — một bộ dữ liệu mà chiến lược tham lam cho kết quả không tối ưu',
        'Chạy chiến lược nhiều lần trên cùng một bộ dữ liệu nhỏ',
        'So sánh tốc độ chạy với thuật toán khác',
      ],
      answerIndex: 1,
      explain:
        'Một phản ví dụ cụ thể là bằng chứng chắc chắn nhất để bác bỏ — trực giác "nghe hợp lý" chính là cái bẫy khiến nhiều lời giải tham lam sai lọt qua mà không bị phát hiện.',
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
  'data-s2': [
    {
      id: 'data-s2-q1',
      prompt: 'Vì sao pipeline ETL/ELT chạy hằng ngày cần được thiết kế "idempotent"?',
      choices: [
        'Để chạy nhanh hơn mỗi lần thực thi',
        'Để chạy lại cho cùng một ngày không nhân đôi dữ liệu',
        'Để tự động sinh báo cáo đẹp hơn',
        'Vì cơ sở dữ liệu nguồn yêu cầu bắt buộc',
      ],
      answerIndex: 1,
      explain:
        'Pipeline chạy bù (backfill) hay chạy lại sau lỗi là chuyện thường — idempotent đảm bảo chạy lại cùng ngày cho ra đúng một bản ghi, không cộng dồn.',
    },
    {
      id: 'data-s2-q2',
      prompt: 'Trong mô hình star schema của kho dữ liệu, bảng sự kiện (fact table) chứa gì?',
      choices: [
        'Thông tin mô tả tĩnh như tên khách hàng, danh mục sản phẩm',
        'Các số đo/sự kiện phát sinh (đơn hàng, giao dịch) kèm khoá nối tới bảng chiều',
        'Nhật ký lỗi hệ thống',
        'Cấu hình lịch chạy của pipeline',
      ],
      answerIndex: 1,
      explain:
        'Bảng sự kiện lưu các số đo định lượng theo thời gian (doanh thu, số lượng...), còn thông tin mô tả (khách hàng, sản phẩm) nằm ở bảng chiều xung quanh nó.',
    },
    {
      id: 'data-s2-q3',
      prompt: 'Điều phối (orchestration) pipeline bằng DAG mang lại lợi ích chính nào?',
      choices: [
        'Tự động viết lại toàn bộ code pipeline',
        'Biểu diễn rõ thứ tự phụ thuộc giữa các bước, cho phép chạy lại một phần khi lỗi',
        'Xoá dữ liệu cũ không cần dùng nữa',
        'Giảm số lượng bảng trong kho dữ liệu',
      ],
      answerIndex: 1,
      explain:
        'DAG (đồ thị có hướng không chu trình) khai báo bước nào phụ thuộc bước nào — khi một bước lỗi, chỉ cần chạy lại đúng nhánh đó thay vì toàn bộ pipeline.',
    },
    {
      id: 'data-s2-q4',
      prompt: 'Kiểm tra chất lượng dữ liệu (data quality check) nên đặt ở đâu trong pipeline?',
      choices: [
        'Chỉ cần kiểm ở dashboard cuối cùng, người xem tự phát hiện',
        'Chặn ngay giữa các bước — dữ liệu hỏng thì dừng lại, không cho lan sang lớp sau',
        'Không cần kiểm, vì dữ liệu nguồn luôn đúng',
        'Chỉ kiểm một lần duy nhất khi mới triển khai pipeline',
      ],
      answerIndex: 1,
      explain:
        'Kiểm tra (không rỗng, duy nhất, khớp tổng...) đặt xen giữa các lớp thô → sạch → phục vụ để chặn dữ liệu hỏng lan xa, phát hiện sớm thay vì để người dùng cuối tự nhận ra.',
    },
    {
      id: 'data-s2-q5',
      prompt:
        '"Hợp đồng dữ liệu" (data contract) giữa đội sinh dữ liệu và đội dùng dữ liệu dùng để làm gì?',
      choices: [
        'Ràng buộc pháp lý giữa hai công ty khác nhau',
        'Thoả thuận rõ cấu trúc/ý nghĩa dữ liệu, để đội sinh đổi schema không âm thầm phá đội dùng',
        'Chỉ áp dụng cho dữ liệu tài chính',
        'Thay thế hoàn toàn việc kiểm tra chất lượng dữ liệu tự động',
      ],
      answerIndex: 1,
      explain:
        'Hợp đồng dữ liệu là thoả thuận tường minh về schema/ý nghĩa — đội sinh dữ liệu đổi cấu trúc mà không báo trước sẽ làm hỏng pipeline/báo cáo của đội dùng ở đầu kia.',
    },
  ],
  'data-s3': [
    {
      id: 'data-s3-q1',
      prompt:
        'Vì sao định dạng cột (columnar) như Parquet phù hợp cho truy vấn phân tích dữ liệu lớn?',
      choices: [
        'Vì nó không cần nén dữ liệu',
        'Vì truy vấn phân tích thường chỉ đọc vài cột — định dạng cột cho phép chỉ đọc đúng cột cần, tiết kiệm I/O',
        'Vì nó là định dạng duy nhất Spark hỗ trợ',
        'Vì nó lưu dữ liệu dưới dạng văn bản thuần (plain text)',
      ],
      answerIndex: 1,
      explain:
        'Truy vấn phân tích (SUM, AVG theo vài cột) không cần đọc toàn bộ dòng — lưu theo cột giúp bỏ qua cột không liên quan, giảm I/O và nén tốt hơn so với lưu theo dòng.',
    },
    {
      id: 'data-s3-q2',
      prompt:
        'Trong xử lý luồng thời gian thực (streaming), "thời gian sự kiện" (event time) khác "thời gian xử lý" (processing time) ở điểm nào?',
      choices: [
        'Không có khác biệt, hai khái niệm là một',
        'Thời gian sự kiện là lúc sự kiện thực sự xảy ra; thời gian xử lý là lúc hệ thống nhận và xử lý nó — có thể lệch nhau do trễ mạng',
        'Thời gian xử lý luôn sớm hơn thời gian sự kiện',
        'Chỉ áp dụng cho dữ liệu theo lô (batch), không áp dụng cho streaming',
      ],
      answerIndex: 1,
      explain:
        'Sự kiện phát sinh ở thiết bị (event time) có thể tới hệ thống xử lý (processing time) muộn hơn do mạng/hàng đợi — cửa sổ thời gian phải tính theo event time mới đúng ý nghĩa nghiệp vụ.',
    },
    {
      id: 'data-s3-q3',
      prompt:
        'Vì sao "dừng thí nghiệm A/B sớm ngay khi thấy kết quả có vẻ tốt" bị coi là gian lận thống kê?',
      choices: [
        'Vì thí nghiệm A/B luôn phải chạy đúng 30 ngày theo quy định',
        'Vì kiểm tra liên tục và dừng khi thấy "có ý nghĩa" làm tăng tỉ lệ phát hiện sai (false positive) so với cỡ mẫu đã tính trước',
        'Vì dừng sớm làm giảm chi phí hạ tầng',
        'Vì người dùng sẽ phát hiện ra đang bị thử nghiệm',
      ],
      answerIndex: 1,
      explain:
        'Ý nghĩa thống kê (p-value) được tính dựa trên cỡ mẫu đã định trước — kiểm tra liên tục rồi dừng ngay khi "có vẻ thắng" phá vỡ giả định đó, khiến kết luận không còn đáng tin.',
    },
    {
      id: 'data-s3-q4',
      prompt: '"Lệch phân bố khoá" (data skew) trong xử lý phân tán (Spark) gây ra vấn đề gì?',
      choices: [
        'Toàn bộ cluster dừng hoạt động ngay lập tức',
        'Một số worker nhận quá nhiều dữ liệu của cùng một khoá, trở thành nút thắt cổ chai làm cả job chờ theo',
        'Dữ liệu bị mất hoàn toàn không thể phục hồi',
        'Chỉ ảnh hưởng tốc độ ghi, không ảnh hưởng tốc độ đọc',
      ],
      answerIndex: 1,
      explain:
        'Khi dữ liệu phân tán không đều theo khoá (ví dụ một khách hàng chiếm phần lớn giao dịch), worker xử lý khoá đó phải làm việc nhiều hơn hẳn các worker khác — cả job phải chờ nút chậm nhất.',
    },
    {
      id: 'data-s3-q5',
      prompt:
        'Che dữ liệu cá nhân (data masking) và quyền truy cập trong quản trị dữ liệu nhằm mục đích gì?',
      choices: [
        'Làm truy vấn chạy nhanh hơn',
        'Giới hạn ai được xem dữ liệu nhạy cảm nào, giảm rủi ro lộ thông tin cá nhân khi nhiều người cùng dùng chung kho dữ liệu',
        'Nén dữ liệu để tiết kiệm chi phí lưu trữ',
        'Tự động xoá dữ liệu cũ theo lịch',
      ],
      answerIndex: 1,
      explain:
        'Kho dữ liệu dùng chung cho nhiều đội, nên phải kiểm soát ai xem được trường nhạy cảm nào (che/ẩn) — đây là yêu cầu quản trị và tuân thủ, tách biệt với việc tối ưu chi phí hay hiệu năng.',
    },
  ],
  'backend-s1': [
    {
      id: 'backend-s1-q1',
      prompt: 'Idempotency key trong API đặt hàng dùng để giải quyết vấn đề gì?',
      choices: [
        'Tăng tốc độ xử lý request',
        'Gửi lại cùng một request (do mất mạng, retry) không tạo ra đơn hàng/thu tiền thứ hai',
        'Mã hoá dữ liệu đơn hàng',
        'Phân trang kết quả trả về',
      ],
      answerIndex: 1,
      explain:
        'Client có thể gửi lại request khi không chắc lần trước có thành công (timeout, mất mạng) — idempotency key giúp server nhận diện và trả lại đúng kết quả cũ, không xử lý trùng.',
    },
    {
      id: 'backend-s1-q2',
      prompt:
        'Vì sao nên validate dữ liệu đầu vào NGAY TẠI BIÊN API (schema validation), thay vì tin và xử lý luôn?',
      choices: [
        'Vì validate làm API chạy nhanh hơn',
        'Vì không tin bất cứ input nào từ bên ngoài — chặn dữ liệu sai/thiếu/độc hại trước khi nó đi sâu vào logic nghiệp vụ',
        'Vì trình duyệt yêu cầu bắt buộc phải validate ở server',
        'Chỉ cần validate khi API công khai, API nội bộ thì không cần',
      ],
      answerIndex: 1,
      explain:
        'Input từ client (kể cả nội bộ) không đáng tin tuyệt đối — validate ở biên chặn dữ liệu sai kiểu/thiếu trường trước khi nó gây lỗi khó lần ở tầng sâu hơn.',
    },
    {
      id: 'backend-s1-q3',
      prompt:
        'Log có cấu trúc (structured log) kèm request id xuyên suốt mang lại lợi ích gì khi điều tra sự cố?',
      choices: [
        'Giảm dung lượng ổ đĩa lưu log',
        'Cho phép lọc/nối tất cả log liên quan tới đúng một request qua nhiều service, dễ truy vết nguyên nhân',
        'Tự động sửa lỗi khi phát hiện',
        'Thay thế hoàn toàn việc cần test',
      ],
      answerIndex: 1,
      explain:
        'Request id gắn xuyên suốt các service giúp nối các dòng log rời rạc thành một "câu chuyện" của đúng một request — thay vì phải đoán log nào thuộc về request nào.',
    },
    {
      id: 'backend-s1-q4',
      prompt:
        'Health check endpoint kết hợp với graceful shutdown giải quyết vấn đề gì khi deploy?',
      choices: [
        'Làm code chạy nhanh hơn tuyệt đối',
        'Instance sắp tắt báo "không sẵn sàng" trước, xử lý nốt request đang dang dở rồi mới dừng hẳn — tránh cắt ngang request người dùng',
        'Tự động tăng số lượng instance khi tải cao',
        'Ghi log mọi request vào file riêng',
      ],
      answerIndex: 1,
      explain:
        'Không có graceful shutdown, instance bị tắt đột ngột giữa lúc đang xử lý request sẽ làm client nhận lỗi kết nối — health check + graceful shutdown cho phép rút traffic ra trước khi tắt.',
    },
    {
      id: 'backend-s1-q5',
      prompt:
        'Vì sao nên cấu hình ứng dụng bằng biến môi trường (12-factor) thay vì hard-code trong Dockerfile?',
      choices: [
        'Vì Docker không cho phép ghi giá trị cố định trong code',
        'Để cùng một image chạy được ở nhiều môi trường (dev/staging/production) chỉ bằng cách đổi biến môi trường, không phải build lại image',
        'Vì biến môi trường chạy nhanh hơn hằng số trong code',
        'Không có lý do kỹ thuật, chỉ là quy ước phong cách',
      ],
      answerIndex: 1,
      explain:
        'Tách cấu hình khỏi code (12-factor) cho phép đóng gói MỘT image duy nhất và triển khai nó ở nhiều môi trường khác nhau chỉ bằng cách truyền biến môi trường khác nhau lúc chạy.',
    },
  ],
  'backend-s2': [
    {
      id: 'backend-s2-q1',
      prompt: '"Lost update" (mất cập nhật) xảy ra trong tình huống nào?',
      choices: [
        'Khi server bị mất điện đột ngột',
        'Khi hai transaction cùng đọc một giá trị rồi cùng ghi đè, transaction ghi sau xoá mất thay đổi của transaction ghi trước',
        'Khi index bị hỏng do lỗi ổ đĩa',
        'Khi cache hết hạn (TTL) trước khi được đọc',
      ],
      answerIndex: 1,
      explain:
        'Lost update là lỗi đồng thời kinh điển: A đọc giá trị x, B đọc cùng giá trị x, cả hai tính toán rồi ghi lại — bản ghi của B đè lên bản ghi của A, thay đổi của A biến mất mà không ai báo lỗi.',
    },
    {
      id: 'backend-s2-q2',
      prompt:
        'Khoá lạc quan (optimistic locking, dùng cột version) khác khoá bi quan (pessimistic locking) ở điểm nào?',
      choices: [
        'Khoá lạc quan luôn nhanh hơn khoá bi quan trong mọi trường hợp',
        'Khoá lạc quan không khoá dòng khi đọc, chỉ kiểm version lúc ghi và từ chối nếu đã đổi; khoá bi quan khoá ngay khi đọc để chặn người khác ghi',
        'Khoá lạc quan chỉ dùng được cho SELECT, không dùng được cho UPDATE',
        'Hai loại khoá này giống hệt nhau về cơ chế, chỉ khác tên gọi',
      ],
      answerIndex: 1,
      explain:
        'Khoá lạc quan "cá cược" là ít va chạm nên không khoá trước, chỉ kiểm version khi ghi; khoá bi quan khoá ngay từ lúc đọc để đảm bảo không ai can thiệp giữa chừng — đánh đổi giữa thông lượng và độ an toàn.',
    },
    {
      id: 'backend-s2-q3',
      prompt: '"Cache stampede" là hiện tượng gì và vì sao nguy hiểm?',
      choices: [
        'Cache bị đầy dung lượng nên tự xoá dữ liệu cũ',
        'Khi một khoá cache hết hạn, rất nhiều request cùng lúc đều bị miss và cùng dồn xuống truy vấn database, có thể làm sập database',
        'Cache trả về dữ liệu sai do lỗi mã hoá',
        'Cache chạy chậm hơn truy vấn trực tiếp database',
      ],
      answerIndex: 1,
      explain:
        'Khi một khoá nóng (nhiều người cùng đọc) hết hạn đúng lúc có tải cao, toàn bộ request đang chờ đều miss cache và dồn xuống database cùng lúc — cần khoá tái tạo hoặc gia hạn sớm để chặn hiện tượng này.',
    },
    {
      id: 'backend-s2-q4',
      prompt:
        'Hàng đợi (queue) kiểu "at-least-once" đảm bảo điều gì, và hệ quả là gì cho consumer?',
      choices: [
        'Đảm bảo mỗi message chỉ được xử lý đúng một lần, consumer không cần lo gì thêm',
        'Đảm bảo message được xử lý ÍT NHẤT một lần (có thể trùng lặp) — consumer bắt buộc phải viết logic idempotent để xử lý trùng an toàn',
        'Đảm bảo message luôn tới đúng thứ tự gửi đi',
        'Đảm bảo message không bao giờ bị mất kể cả khi consumer crash vĩnh viễn',
      ],
      answerIndex: 1,
      explain:
        'At-least-once ưu tiên "không mất message" hơn "không trùng" — nếu consumer crash sau khi xử lý nhưng trước khi xác nhận, message sẽ được gửi lại, nên logic xử lý phải idempotent.',
    },
    {
      id: 'backend-s2-q5',
      prompt:
        'Vì sao goroutine (Go) hoặc async/await (Node.js) được gọi là mô hình bất đồng bộ "khác luồng thật"?',
      choices: [
        'Vì chúng không bao giờ dùng CPU',
        'Vì chúng thường chạy trên một số ít luồng hệ điều hành thật, được lập lịch bởi runtime — nhẹ hơn nhiều so với tạo một luồng OS cho mỗi tác vụ',
        'Vì chúng chỉ chạy được trên một lõi CPU duy nhất',
        'Vì chúng là một dạng tiến trình (process) riêng biệt, không chia sẻ bộ nhớ',
      ],
      answerIndex: 1,
      explain:
        'Luồng hệ điều hành thật tốn tài nguyên tạo/chuyển ngữ cảnh; goroutine/coroutine là đơn vị nhẹ do runtime tự lập lịch trên một số ít luồng OS, cho phép hàng chục nghìn tác vụ đồng thời mà không kiệt tài nguyên.',
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
  'ai-s2': [
    {
      id: 'ai-s2-q1',
      prompt: 'Vì sao phải tách riêng tập train/valid/test thay vì dùng chung một tập dữ liệu?',
      choices: [
        'Để chương trình chạy nhanh hơn',
        'Để đo hiệu năng trên dữ liệu mô hình CHƯA từng thấy — tránh tự lừa mình bằng điểm số ảo',
        'Vì thư viện học máy bắt buộc phải chia 3 tập',
        'Để tiết kiệm dung lượng ổ đĩa',
      ],
      answerIndex: 1,
      explain:
        'Đánh giá trên chính dữ liệu đã huấn luyện luôn cho điểm cao giả tạo — tập test tách riêng mô phỏng dữ liệu thật mô hình sẽ gặp sau này.',
    },
    {
      id: 'ai-s2-q2',
      prompt: 'Rò rỉ dữ liệu (data leakage) trong huấn luyện mô hình là gì?',
      choices: [
        'Dữ liệu bị mất do lỗi ổ đĩa',
        'Thông tin từ tập test/tương lai vô tình lọt vào quá trình huấn luyện, làm điểm đánh giá cao giả tạo',
        'Dữ liệu bị public lên internet',
        'Mô hình chạy chậm vì dữ liệu quá lớn',
      ],
      answerIndex: 1,
      explain:
        'Rò rỉ khiến mô hình "nhìn trộm" đáp án — điểm test cao bất thường nhưng khi triển khai thật thì sai nặng vì thông tin đó không có sẵn lúc dự đoán thật.',
    },
    {
      id: 'ai-s2-q3',
      prompt:
        'Cây tăng cường (gradient boosting) thường là lựa chọn hàng đầu cho loại dữ liệu nào?',
      choices: [
        'Ảnh và video',
        'Dữ liệu dạng bảng (cột số, cột hạng mục)',
        'Văn bản dài tự do',
        'Âm thanh thô',
      ],
      answerIndex: 1,
      explain:
        'Với dữ liệu bảng, gradient boosting (XGBoost, LightGBM…) thường vượt trội và ổn định hơn mạng nơ-ron sâu, vốn hợp hơn với ảnh/văn bản/âm thanh.',
    },
    {
      id: 'ai-s2-q4',
      prompt:
        'Vì sao độ chính xác (accuracy) là chỉ số TỆ khi dữ liệu mất cân bằng nặng (ví dụ 99% là lớp "bình thường")?',
      choices: [
        'Vì accuracy tính toán quá phức tạp',
        'Mô hình chỉ cần luôn đoán lớp đa số cũng đạt accuracy 99% mà không phát hiện được ca hiếm cần quan tâm',
        'Accuracy không dùng được cho bài toán phân loại',
        'Accuracy chỉ áp dụng cho hồi quy, không áp dụng cho phân loại',
      ],
      answerIndex: 1,
      explain:
        'Một mô hình "ngu" đoán bừa lớp đa số vẫn đạt accuracy cao ngất — cần chỉ số khác (precision/recall, F1) để thấy nó có bắt được ca hiếm hay không.',
    },
    {
      id: 'ai-s2-q5',
      prompt:
        'Với dữ liệu chuỗi thời gian, vì sao không nên xáo trộn ngẫu nhiên khi chia tập kiểm định?',
      choices: [
        'Xáo trộn làm chương trình chạy chậm hơn',
        'Xáo trộn để lẫn dữ liệu tương lai vào tập huấn luyện — mô hình "biết trước" thứ chưa xảy ra, đánh giá sai lệch',
        'Dữ liệu chuỗi thời gian không được phép chia tập',
        'Xáo trộn chỉ ảnh hưởng tốc độ, không ảnh hưởng độ chính xác',
      ],
      answerIndex: 1,
      explain:
        'Kiểm định chuỗi thời gian phải giữ đúng trật tự: huấn luyện trên quá khứ, kiểm tra trên tương lai — đúng như lúc mô hình chạy thật.',
    },
  ],
  'ai-s3': [
    {
      id: 'ai-s3-q1',
      prompt: 'Lan truyền ngược (backpropagation) dùng để làm gì trong huấn luyện mạng nơ-ron?',
      choices: [
        'Tăng tốc độ đọc dữ liệu đầu vào',
        'Tính đạo hàm của hàm mất mát theo từng trọng số, để bộ tối ưu biết chỉnh trọng số theo hướng nào',
        'Chia dữ liệu thành các batch nhỏ',
        'Chuyển ảnh màu sang ảnh xám',
      ],
      answerIndex: 1,
      explain:
        'Backprop lan truyền lỗi ngược từ đầu ra về từng lớp, tính gradient để bộ tối ưu (như SGD, Adam) biết cập nhật trọng số ra sao nhằm giảm mất mát.',
    },
    {
      id: 'ai-s3-q2',
      prompt: 'Cơ chế attention trong kiến trúc Transformer cho phép mô hình làm gì?',
      choices: [
        'Nén ảnh để giảm dung lượng',
        'Học mức độ liên quan giữa các phần tử trong chuỗi (ví dụ từ này liên quan tới từ nào khác trong câu)',
        'Tự động gán nhãn dữ liệu',
        'Thay thế hoàn toàn nhu cầu có dữ liệu huấn luyện',
      ],
      answerIndex: 1,
      explain:
        'Attention tính trọng số liên quan giữa các vị trí trong chuỗi đầu vào — giúp mô hình "chú ý" đúng ngữ cảnh cần thiết khi xử lý từng phần tử.',
    },
    {
      id: 'ai-s3-q3',
      prompt: 'LoRA (Low-Rank Adaptation) giúp ích gì khi tinh chỉnh mô hình ngôn ngữ lớn?',
      choices: [
        'Huấn luyện lại toàn bộ tham số mô hình từ đầu',
        'Chỉ thêm và huấn luyện một số ma trận nhỏ, giữ nguyên phần lớn trọng số gốc — giảm mạnh chi phí bộ nhớ và tính toán',
        'Tăng kích thước cửa sổ ngữ cảnh của mô hình',
        'Xoá bớt dữ liệu huấn luyện gốc để tiết kiệm dung lượng',
      ],
      answerIndex: 1,
      explain:
        'LoRA đóng băng trọng số gốc, chỉ học thêm các ma trận hạng thấp — tinh chỉnh được mô hình lớn trên phần cứng khiêm tốn hơn nhiều so với huấn luyện toàn bộ.',
    },
    {
      id: 'ai-s3-q4',
      prompt:
        'Dịch chuyển phân phối (distribution shift) giữa lúc huấn luyện và lúc chạy thật gây ra hậu quả gì?',
      choices: [
        'Mô hình chạy nhanh hơn khi triển khai',
        'Mô hình hoạt động tốt lúc đánh giá nhưng giảm chất lượng khi dữ liệu thật khác so với dữ liệu đã huấn luyện',
        'Không có hậu quả gì vì mô hình đã học xong',
        'Chỉ ảnh hưởng tới tốc độ suy luận, không ảnh hưởng độ chính xác',
      ],
      answerIndex: 1,
      explain:
        'Khi dữ liệu thực tế "trôi" khỏi dữ liệu huấn luyện (thói quen người dùng đổi, nguồn dữ liệu đổi…), mô hình có thể sai nhiều hơn dù không đổi gì về code.',
    },
    {
      id: 'ai-s3-q5',
      prompt: 'Khi nào tinh chỉnh (fine-tune) mô hình KHÔNG đáng làm so với chỉ cải thiện prompt?',
      choices: [
        'Khi bài toán chỉ cần điều chỉnh cách hỏi/định dạng đầu ra mà prompt tốt đã giải quyết được, không cần đổi hành vi sâu của mô hình',
        'Khi có rất nhiều dữ liệu gán nhãn chất lượng cao',
        'Khi cần mô hình học một domain hoàn toàn mới không có trong huấn luyện gốc',
        'Tinh chỉnh luôn luôn đáng làm trong mọi trường hợp',
      ],
      answerIndex: 0,
      explain:
        'Tinh chỉnh tốn công thu thập dữ liệu, hạ tầng huấn luyện và bảo trì lâu dài — nếu prompt tốt đã đạt yêu cầu thì không đáng đánh đổi chi phí đó.',
    },
  ],
  'ai-s4': [
    {
      id: 'ai-s4-q1',
      prompt:
        'Vì sao cần gắn phiên bản (versioning) cho cả dữ liệu và mã nguồn khi đóng gói mô hình đưa vào sản xuất?',
      choices: [
        'Để giao diện đẹp hơn',
        'Để tái lập được chính xác kết quả đã huấn luyện, và biết chính xác phiên bản nào đang chạy khi có sự cố',
        'Vì thư viện học máy bắt buộc phải đánh số phiên bản',
        'Chỉ để tiết kiệm dung lượng lưu trữ',
      ],
      answerIndex: 1,
      explain:
        'Không gắn phiên bản thì khi mô hình sai không thể biết nó được huấn luyện từ dữ liệu/mã nào để điều tra hoặc quay lui đúng bản ổn định.',
    },
    {
      id: 'ai-s4-q2',
      prompt:
        'Giám sát dịch chuyển dữ liệu (data drift) sau khi mô hình đã triển khai nhằm mục đích gì?',
      choices: [
        'Tăng tốc độ phản hồi của mô hình',
        'Phát hiện sớm khi dữ liệu thật bắt đầu khác dữ liệu huấn luyện, để biết mô hình có thể đang xuống chất lượng',
        'Tự động sinh thêm dữ liệu huấn luyện mới',
        'Giảm chi phí lưu trữ log',
      ],
      answerIndex: 1,
      explain:
        'Drift là dấu hiệu sớm mô hình sắp lỗi thời — phát hiện được thì mới kịp huấn luyện lại trước khi chất lượng thực tế giảm rõ rệt.',
    },
    {
      id: 'ai-s4-q3',
      prompt:
        'Vì sao đánh giá hệ tác tử (agent) nên dựa vào KẾT QUẢ nhiệm vụ thay vì văn phong câu trả lời?',
      choices: [
        'Vì văn phong không thể đo được bằng bất kỳ cách nào',
        'Vì mục tiêu thật của tác tử là hoàn thành nhiệm vụ đúng — câu trả lời trôi chảy mà làm sai việc vẫn là thất bại',
        'Vì văn phong luôn đúng nếu kết quả đúng',
        'Đánh giá tác tử không cần đo lường gì, chỉ cần thử bằng mắt',
      ],
      answerIndex: 1,
      explain:
        'Tác tử được giao việc để LÀM ĐƯỢC việc — một câu trả lời nghe hay nhưng không giải quyết đúng nhiệm vụ (hoặc gọi sai tool, sai bước) vẫn phải tính là lỗi.',
    },
    {
      id: 'ai-s4-q4',
      prompt:
        'Vì sao hệ tác tử cần một "ngân sách cứng" (giới hạn số bước/lượt gọi tool) thay vì để nó tự chạy tới khi xong?',
      choices: [
        'Để tác tử luôn trả lời trong đúng một bước',
        'Chống trường hợp tác tử kẹt lặp vô hạn hoặc đi vòng vo, gây tốn chi phí và tài nguyên không kiểm soát được',
        'Vì công cụ (tool) chỉ được phép gọi một lần duy nhất',
        'Ngân sách cứng không liên quan tới chi phí, chỉ liên quan tốc độ',
      ],
      answerIndex: 1,
      explain:
        'Không có trần cứng, một tác tử gặp tình huống mập mờ có thể lặp gọi tool liên tục — ngân sách là lưới an toàn chặn chi phí/tài nguyên bị đốt vô hạn.',
    },
    {
      id: 'ai-s4-q5',
      prompt:
        'Khi đánh giá tác hại tiềm ẩn của một hệ thống AI trước khi phát hành, câu hỏi trung tâm cần trả lời là gì?',
      choices: [
        'Mô hình chạy trên phần cứng nào',
        'Nhóm người dùng nào có thể bị ảnh hưởng xấu, và hậu quả cụ thể là gì nếu mô hình sai',
        'Mô hình có bao nhiêu tham số',
        'Giao diện người dùng có đẹp hay không',
      ],
      answerIndex: 1,
      explain:
        'Đánh giá tác hại phải cụ thể hoá được: ai bị ảnh hưởng, sai theo kiểu gì, hậu quả tới đâu — từ đó mới quyết định được ranh giới an toàn cần thiết trước khi phát hành.',
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
  'devops-s2': [
    {
      id: 'devops-s2-q1',
      prompt: 'Vì sao nên dùng ảnh Docker nhiều tầng (multi-stage build) với ảnh gốc tối thiểu?',
      choices: [
        'Để ảnh build nhanh hơn tuyệt đối trong mọi trường hợp',
        'Để tách phần công cụ build (compiler, dependency dev) khỏi ảnh chạy thật — ảnh cuối nhỏ hơn, ít bề mặt tấn công hơn',
        'Vì Docker bắt buộc phải dùng nhiều tầng',
        'Để không cần viết Dockerfile riêng cho từng môi trường',
      ],
      answerIndex: 1,
      explain:
        'Multi-stage build giữ lại chỉ những gì cần để CHẠY ứng dụng ở tầng cuối, bỏ hết công cụ build — ảnh nhỏ hơn, khởi động nhanh hơn, và ít lỗ hổng bảo mật hơn.',
    },
    {
      id: 'devops-s2-q2',
      prompt:
        'Vì sao pipeline CI/CD nên build tạo tác (artifact) MỘT LẦN rồi dùng lại cho mọi môi trường, thay vì build riêng cho từng môi trường?',
      choices: [
        'Vì build nhiều lần tốn điện hơn',
        'Để đảm bảo đúng thứ đã test ở staging là đúng thứ chạy ở production — build lại có thể vô tình tạo ra bản khác',
        'Vì công cụ CI không cho phép build nhiều lần',
        'Không có lý do kỹ thuật, chỉ là quy ước tuỳ chọn',
      ],
      answerIndex: 1,
      explain:
        'Build lại cho từng môi trường (dependency có thể đổi phiên bản giữa hai lần build) phá vỡ nguyên tắc "cái đã test là cái sẽ chạy" — build một lần, triển khai nhiều nơi mới đảm bảo tính nhất quán.',
    },
    {
      id: 'devops-s2-q3',
      prompt: 'Deploy theo kiểu xanh–lam (blue-green) hoạt động như thế nào?',
      choices: [
        'Xoá hệ thống cũ trước rồi mới dựng hệ thống mới',
        'Dựng song song một phiên bản mới (green) cạnh phiên bản đang chạy (blue), rồi chuyển traffic sang khi đã kiểm tra ổn — quay lui bằng cách chuyển traffic ngược lại',
        'Chia đôi traffic vĩnh viễn giữa hai phiên bản',
        'Chỉ áp dụng được cho ứng dụng không có cơ sở dữ liệu',
      ],
      answerIndex: 1,
      explain:
        'Blue-green giữ nguyên bản cũ chạy song song cho tới khi bản mới được xác nhận ổn — nếu có sự cố, chỉ cần trỏ traffic về lại bản cũ, rollback gần như tức thì.',
    },
    {
      id: 'devops-s2-q4',
      prompt: 'Terraform state dùng để làm gì?',
      choices: [
        'Lưu log truy cập của ứng dụng',
        'Ghi lại ánh xạ giữa cấu hình khai báo và tài nguyên thật đang tồn tại trên nhà cung cấp đám mây, để Terraform biết cần tạo/sửa/xoá gì',
        'Lưu mật khẩu người dùng ứng dụng',
        'Chỉ dùng để hiển thị giao diện dòng lệnh đẹp hơn',
      ],
      answerIndex: 1,
      explain:
        'State là "bộ nhớ" của Terraform về tài nguyên thật đang có — thiếu hoặc sai state khiến plan/apply tính toán nhầm cần thay đổi gì, có thể gây xoá nhầm tài nguyên.',
    },
    {
      id: 'devops-s2-q5',
      prompt:
        'Nguyên tắc "đặc quyền tối thiểu" (least privilege) khi cấu hình IAM trên đám mây nghĩa là gì?',
      choices: [
        'Cấp toàn quyền admin cho mọi tài khoản để tiện thao tác',
        'Mỗi tài khoản/dịch vụ chỉ được cấp đúng quyền cần thiết để làm việc của nó, không hơn',
        'Chỉ cấp quyền cho một tài khoản duy nhất trong toàn hệ thống',
        'Không cần phân quyền vì đã có tường lửa mạng',
      ],
      answerIndex: 1,
      explain:
        'Giới hạn quyền ở mức tối thiểu cần thiết làm giảm bán kính thiệt hại nếu tài khoản/dịch vụ đó bị lộ hoặc bị lạm dụng — một nguyên tắc bảo mật nền tảng.',
    },
  ],
  'security-s1': [
    {
      id: 'security-s1-q1',
      prompt: 'STRIDE dùng để làm gì khi lập mô hình mối đe doạ?',
      choices: [
        'Đo tốc độ phản hồi của API',
        'Phân loại các LOẠI mối đe doạ (giả mạo, sửa dữ liệu, từ chối trách nhiệm…) để rà hệ thống có hệ thống, không bỏ sót',
        'Tính điểm CVSS cho một lỗ hổng cụ thể',
        'Mã hoá dữ liệu khi truyền qua mạng',
      ],
      answerIndex: 1,
      explain:
        'STRIDE là khung phân loại 6 nhóm mối đe doạ — dùng để rà soát có hệ thống thay vì đoán mò xem hệ thống có thể bị tấn công kiểu gì.',
    },
    {
      id: 'security-s1-q2',
      prompt: 'Vì sao mật khẩu phải BĂM (hash) chứ không mã hoá (encrypt) khi lưu trữ?',
      choices: [
        'Băm nhanh hơn mã hoá nên tiết kiệm CPU',
        'Băm là một chiều — kể cả CSDL bị lộ, kẻ tấn công không lấy lại được mật khẩu gốc; mã hoá thì giải mã ngược được nếu lộ khoá',
        'Mã hoá không áp dụng được cho chuỗi văn bản',
        'Không có khác biệt, hai từ chỉ cùng một kỹ thuật',
      ],
      answerIndex: 1,
      explain:
        'Băm (với salt, thuật toán chậm cố ý như bcrypt/argon2) là một chiều — đúng nguyên tắc "luật vàng: không tự chế thuật toán mật mã" và giảm thiệt hại khi dữ liệu bị lộ.',
    },
    {
      id: 'security-s1-q3',
      prompt: 'IDOR (Insecure Direct Object Reference) là lỗ hổng dạng nào?',
      choices: [
        'Lỗi cú pháp SQL khiến chương trình crash',
        'Đổi ID trong URL/tham số (ví dụ /order/123 → /order/124) mà server không kiểm quyền, nên xem được dữ liệu của người khác',
        'Mật khẩu bị lưu dạng plaintext',
        'Chứng chỉ TLS hết hạn',
      ],
      answerIndex: 1,
      explain:
        'IDOR xảy ra khi server tin tưởng ID do client gửi lên mà không kiểm xem người dùng hiện tại có quyền với đúng tài nguyên đó hay không — một dạng lỗi phân quyền, nằm trong OWASP Top 10.',
    },
    {
      id: 'security-s1-q4',
      prompt: 'Nguyên tắc "đặc quyền tối thiểu" (least privilege) nghĩa là gì?',
      choices: [
        'Mọi tài khoản nên có quyền admin để tiện xử lý sự cố',
        'Mỗi tài khoản/dịch vụ chỉ nên có ĐÚNG quyền cần thiết để làm việc của nó, không hơn',
        'Chỉ cần đặt mật khẩu mạnh là đủ, không cần phân quyền chi tiết',
        'Chỉ áp dụng cho tài khoản người dùng cuối, không áp dụng cho dịch vụ nội bộ',
      ],
      answerIndex: 1,
      explain:
        'Giới hạn quyền ở mức tối thiểu cần thiết làm giảm "bán kính thiệt hại" nếu một tài khoản hay dịch vụ bị chiếm — đây là một trụ của phòng thủ nhiều lớp.',
    },
    {
      id: 'security-s1-q5',
      prompt:
        'Vì sao cần dựng lỗ hổng trong LAB riêng (container, không phơi ra Internet) thay vì thử trên hệ thống thật bất kỳ?',
      choices: [
        'Vì lab chạy nhanh hơn Internet',
        'Vì kiểm thử/khai thác hệ thống không phải của mình khi chưa có phép là phạm pháp và phi đạo đức — nghề này chỉ tồn tại trên nền tin cậy',
        'Vì lab không cần kết nối mạng nên tiện hơn',
        'Không có lý do đặc biệt, chỉ là thói quen của người mới học',
      ],
      answerIndex: 1,
      explain:
        'Học và thực hành khai thác lỗ hổng chỉ an toàn về đạo đức và pháp lý khi làm trên môi trường của chính mình hoặc có sự cho phép bằng văn bản — vượt ranh giới này là mất nghề.',
    },
  ],
  'security-s2': [
    {
      id: 'security-s2-q1',
      prompt:
        'Trước khi bắt đầu một đợt kiểm thử xâm nhập (pentest), việc bắt buộc đầu tiên là gì?',
      choices: [
        'Quét cổng ngay lập tức để tiết kiệm thời gian',
        'Thoả thuận phạm vi và quy tắc giao chiến (rules of engagement) — xác nhận được phép kiểm thử cái gì, tới đâu',
        'Viết báo cáo mẫu trước',
        'Cài đặt Burp Suite',
      ],
      answerIndex: 1,
      explain:
        'Không có thoả thuận phạm vi rõ ràng, hành động "kiểm thử" có thể biến thành tấn công trái phép — đây là bước quy trình bắt buộc trước mọi hành động kỹ thuật.',
    },
    {
      id: 'security-s2-q2',
      prompt: 'Vì sao lỗi LOGIC NGHIỆP VỤ (business logic flaw) khó bị máy quét tự động phát hiện?',
      choices: [
        'Vì máy quét không hỗ trợ giao thức HTTPS',
        'Vì lỗi logic nghiệp vụ đòi hỏi hiểu QUY TẮC riêng của ứng dụng (ví dụ: đặt hàng số lượng âm để được hoàn tiền dương) — máy quét chỉ dò được mẫu lỗi kỹ thuật đã biết',
        'Vì lỗi logic nghiệp vụ luôn nằm trong code phía client',
        'Vì máy quét chỉ chạy được trên Windows',
      ],
      answerIndex: 1,
      explain:
        'Máy quét dò theo mẫu (signature) của các lỗ hổng kỹ thuật đã biết; lỗi logic nghiệp vụ là hành vi HỢP LỆ về mặt kỹ thuật nhưng SAI về ý định thiết kế, nên cần con người hiểu ngữ cảnh mới tìm ra.',
    },
    {
      id: 'security-s2-q3',
      prompt: 'CVSS dùng để làm gì trong báo cáo pentest?',
      choices: [
        'Đếm số dòng code bị ảnh hưởng',
        'Chấm điểm mức độ nghiêm trọng của một lỗ hổng theo thang chuẩn, giúp ưu tiên sửa cái nào trước',
        'Tự động vá lỗ hổng',
        'Mã hoá báo cáo trước khi gửi khách hàng',
      ],
      answerIndex: 1,
      explain:
        'CVSS là thang điểm chuẩn hoá mức độ nghiêm trọng — giúp đội phát triển ưu tiên sửa theo RỦI RO THẬT thay vì theo thứ tự phát hiện.',
    },
    {
      id: 'security-s2-q4',
      prompt: 'Rủi ro bảo mật nào KHÔNG thuộc nhóm "mạng và hạ tầng" trong đánh giá an toàn?',
      choices: [
        'Container thoát ly (container escape)',
        'Quyền IAM quá rộng trên cloud',
        'Bí mật (API key, mật khẩu) lộ trong ảnh container hoặc repo',
        'Lỗi logic khi tính giá đơn hàng trong ứng dụng web',
      ],
      answerIndex: 3,
      explain:
        'Lỗi logic tính giá thuộc nhóm "web và API sâu hơn" (lỗi nghiệp vụ), không phải hạ tầng — ba phương án còn lại đều là rủi ro hạ tầng/cloud/container điển hình.',
    },
    {
      id: 'security-s2-q5',
      prompt:
        'Nguyên tắc "công bố có trách nhiệm" (responsible disclosure) trong báo cáo lỗ hổng là gì?',
      choices: [
        'Công khai lỗ hổng ngay trên mạng xã hội để cảnh báo cộng đồng nhanh nhất',
        'Báo lỗ hổng riêng cho đội phát triển/dự án trước, cho họ thời gian vá, rồi mới công khai chi tiết (nếu có)',
        'Giữ bí mật vĩnh viễn, không báo cho ai',
        'Chỉ cần gửi email, không cần chờ phản hồi',
      ],
      answerIndex: 1,
      explain:
        'Công bố có trách nhiệm cân bằng giữa quyền được biết của cộng đồng và thời gian cần thiết để bên bị ảnh hưởng vá lỗi trước khi thông tin khai thác bị lan rộng.',
    },
  ],
  'architecture-s1': [
    {
      id: 'architecture-s1-q1',
      prompt: 'Một module có "trách nhiệm duy nhất" nghĩa là gì?',
      choices: [
        'Module chỉ chứa đúng một file',
        'Module chỉ nên đổi vì MỘT lý do — không trộn nhiều mối quan tâm không liên quan vào cùng một chỗ',
        'Module không được gọi module nào khác',
        'Module chỉ được viết bằng một ngôn ngữ lập trình',
      ],
      answerIndex: 1,
      explain:
        'Trách nhiệm duy nhất là tiêu chí để xác định ranh giới module đúng — nếu một thay đổi nghiệp vụ buộc phải sửa nhiều lý do khác nhau trong cùng module, ranh giới đó đã cắt sai.',
    },
    {
      id: 'architecture-s1-q2',
      prompt:
        'Cắt module theo NGHIỆP VỤ (feature) thay vì theo LOẠI FILE (components/, utils/) có lợi gì?',
      choices: [
        'Giúp code chạy nhanh hơn về mặt hiệu năng',
        'Khi một thay đổi nghiệp vụ xảy ra, chỉ cần mở một thư mục thay vì rải rác sửa nhiều thư mục theo loại file',
        'Giúp giảm số dòng code tổng cộng',
        'Không có khác biệt thực tế, chỉ là gu tổ chức thư mục',
      ],
      answerIndex: 1,
      explain:
        'Cắt theo nghiệp vụ gom mọi thứ liên quan một tính năng lại gần nhau — đổi tính năng đó không phải mở chục file rải khắp components/utils/services.',
    },
    {
      id: 'architecture-s1-q3',
      prompt: '"Luật phụ thuộc" (dependency rule) trong kiến trúc phân lớp yêu cầu điều gì?',
      choices: [
        'Mọi module phải phụ thuộc lẫn nhau để tiện dùng chung code',
        'Phụ thuộc chỉ đi MỘT CHIỀU — lõi nghiệp vụ không được biết gì về giao diện hay hạ tầng bên ngoài',
        'Chỉ được có tối đa 3 module trong một hệ thống',
        'Module hạ tầng phải được viết trước module lõi nghiệp vụ',
      ],
      answerIndex: 1,
      explain:
        'Phụ thuộc một chiều (lõi không biết về giao diện/hạ tầng) giữ cho phần lõi nghiệp vụ độc lập, dễ test và không bị kéo theo khi đổi công nghệ ở lớp ngoài.',
    },
    {
      id: 'architecture-s1-q4',
      prompt: 'Vì sao vòng phụ thuộc (dependency cycle) giữa hai module bị coi là "bệnh"?',
      choices: [
        'Vì nó làm bundle JavaScript nặng hơn duy nhất',
        'Vì hai module phụ thuộc vòng tròn buộc phải hiểu và sửa CẢ HAI cùng lúc — mất hẳn ranh giới độc lập, khó kiểm và khó thay thế riêng lẻ',
        'Vì trình biên dịch TypeScript không cho phép vòng phụ thuộc',
        'Vòng phụ thuộc không có vấn đề gì nếu code vẫn chạy được',
      ],
      answerIndex: 1,
      explain:
        'Vòng phụ thuộc xoá bỏ ranh giới module trên thực tế — không thể hiểu, test hay thay thế module A mà không kéo theo module B, nên phải phát hiện bằng công cụ (như codemap) và loại bỏ.',
    },
    {
      id: 'architecture-s1-q5',
      prompt: 'Trong mô hình C4, sơ đồ "thành phần" (component) nên vẽ khi nào?',
      choices: [
        'Vẽ mọi lúc, càng chi tiết càng tốt cho mọi module',
        'Chỉ khi cần trả lời một câu hỏi cụ thể, dừng lại ở tầng đủ dùng — không vẽ để trang trí',
        'Chỉ vẽ khi có yêu cầu từ khách hàng bên ngoài',
        'Không bao giờ cần, chỉ cần sơ đồ bối cảnh (context) là đủ',
      ],
      answerIndex: 1,
      explain:
        'C4 đi từ bối cảnh → hộp lớn → thành phần, nhưng nguyên tắc là dừng ở tầng ĐỦ DÙNG — mỗi sơ đồ phải trả lời được một câu hỏi cụ thể, vẽ dư là lãng phí và khó bảo trì.',
    },
  ],
  'architecture-s2': [
    {
      id: 'architecture-s2-q1',
      prompt: '"Ngữ cảnh giới hạn" (bounded context) trong mô hình hoá miền giải quyết vấn đề gì?',
      choices: [
        'Giới hạn số lượng người dùng đồng thời',
        'Cùng một từ (ví dụ "đơn hàng") có thể mang nghĩa khác nhau ở các miền khác nhau (kho, kế toán) — mỗi miền có mô hình dữ liệu riêng, không ép chung một định nghĩa',
        'Giới hạn dung lượng cơ sở dữ liệu',
        'Giới hạn thời gian phản hồi API',
      ],
      answerIndex: 1,
      explain:
        'Ngữ cảnh giới hạn thừa nhận rằng ép một khái niệm nghiệp vụ dùng chung một định nghĩa cho mọi miền sẽ tạo ra model méo mó — mỗi miền được giữ mô hình riêng phù hợp với chính nó.',
    },
    {
      id: 'architecture-s2-q2',
      prompt:
        'Vì sao hợp đồng dữ liệu (schema) giữa các module nên kiểm LÚC CHẠY (runtime), không chỉ lúc biên dịch?',
      choices: [
        'Vì TypeScript không hỗ trợ kiểm tra kiểu lúc biên dịch',
        'Vì dữ liệu từ bên ngoài ranh giới (API, người dùng, dịch vụ khác) không được kiểm soát bởi trình biên dịch — chỉ Zod/JSON Schema mới bắt được dữ liệu sai hình dạng THỰC TẾ đi vào lúc hệ thống đang chạy',
        'Vì kiểm lúc chạy nhanh hơn kiểm lúc biên dịch',
        'Không có sự khác biệt thực chất giữa hai cách kiểm',
      ],
      answerIndex: 1,
      explain:
        'Kiểu tĩnh (TypeScript) chỉ đảm bảo code NỘI BỘ nhất quán với chính nó; dữ liệu thật đi qua ranh giới (mạng, người dùng) có thể sai hình dạng bất cứ lúc nào, nên cần validate runtime.',
    },
    {
      id: 'architecture-s2-q3',
      prompt: 'Cách "tiến hoá không phá" một hợp đồng (schema) đã có người dùng là gì?',
      choices: [
        'Đổi tên trường ngay khi cần, người dùng sẽ tự cập nhật theo',
        'Chỉ THÊM trường tuỳ chọn mới; muốn đổi/xoá thì chạy song song bản cũ và bản mới, chuyển dần rồi mới bỏ bản cũ',
        'Xoá trường cũ ngay lập tức để giữ schema gọn',
        'Không bao giờ được sửa schema sau khi đã publish',
      ],
      answerIndex: 1,
      explain:
        'Thêm trường tuỳ chọn không phá bên gọi cũ; đổi/xoá nghĩa bắt buộc phải theo lối "mở rộng rồi mới thu hẹp" — chạy song song hai bản để bên gọi có thời gian chuyển đổi.',
    },
    {
      id: 'architecture-s2-q4',
      prompt: 'Vì sao "thời gian, tiền, định danh" được xem là ba chỗ sai kiến trúc đắt nhất?',
      choices: [
        'Vì ba loại dữ liệu này khó mã hoá về mặt kỹ thuật',
        'Vì chọn sai kiểu/đơn vị/múi giờ cho chúng thường lan khắp hệ thống trước khi bị phát hiện, và migrate lại rất tốn kém vì mọi module đều phụ thuộc vào chúng',
        'Vì chúng luôn cần mã hoá do quy định bảo mật',
        'Vì ba loại này không thể validate bằng Zod',
      ],
      answerIndex: 1,
      explain:
        'Thời gian (múi giờ, UTC), tiền (đơn vị, làm tròn), định danh (kiểu ID) là dữ liệu NỀN mà rất nhiều module khác dùng lại — sai một chỗ ở đây kéo theo sửa lan rộng khắp hệ thống.',
    },
    {
      id: 'architecture-s2-q5',
      prompt: 'Vì sao "ca lỗi cũng là một phần hợp đồng, không phải phụ lục"?',
      choices: [
        'Vì bên gọi cần biết chính xác các dạng lỗi có thể xảy ra để xử lý đúng, không phải đoán hoặc bắt lỗi chung chung',
        'Vì viết tài liệu ca lỗi giúp code chạy nhanh hơn',
        'Vì ca lỗi không quan trọng bằng ca thành công nên không cần đưa vào hợp đồng chính',
        'Vì mọi lỗi đều nên trả về cùng một thông báo chung',
      ],
      answerIndex: 0,
      explain:
        'Nếu hợp đồng chỉ mô tả trường hợp thành công, bên gọi sẽ không biết cách xử lý đúng khi có lỗi — ca lỗi (mã, ý nghĩa) phải được định nghĩa rõ như phần dữ liệu thành công.',
    },
  ],
  'architecture-s3': [
    {
      id: 'architecture-s3-q1',
      prompt: 'Một đặc tả được coi là "kín" khi nào?',
      choices: [
        'Khi đặc tả dài trên 5 trang',
        'Khi bên thi hành đọc xong không cần hỏi lại câu nào để bắt đầu làm việc',
        'Khi đặc tả có đính kèm sơ đồ',
        'Khi đặc tả do người quản lý cấp cao viết',
      ],
      answerIndex: 1,
      explain:
        'Độ "kín" đo bằng việc bên thi hành có phải hỏi lại hay không — dài hay có sơ đồ không phải tiêu chí, đủ thông tin để bắt đầu mới là tiêu chí.',
    },
    {
      id: 'architecture-s3-q2',
      prompt: 'Vì sao nên viết TIÊU CHÍ CHẤP NHẬN trước khi viết mô tả giải pháp trong đặc tả?',
      choices: [
        'Vì công cụ soạn thảo yêu cầu thứ tự này',
        'Vì xác định trước "thế nào là xong, đo bằng cách nào" buộc người viết đặc tả nghĩ rõ mục tiêu trước khi bị cuốn vào chi tiết cách làm',
        'Vì tiêu chí chấp nhận không quan trọng nên viết trước cho xong',
        'Để đặc tả có định dạng giống nhau giữa các người viết',
      ],
      answerIndex: 1,
      explain:
        'Viết tiêu chí chấp nhận trước ép người viết đặc tả nghĩ rõ "cái gì gọi là đúng" trước — tránh trường hợp mô tả giải pháp chi tiết nhưng không có cách nào kiểm chứng đã đạt yêu cầu.',
    },
    {
      id: 'architecture-s3-q3',
      prompt: 'Khi giao việc cho AI thi hành, vì sao "mọi giả định phải viết ra"?',
      choices: [
        'Vì AI không đọc được tiếng Việt',
        'Vì bên thi hành (AI hay người mới) KHÔNG thấy được ngữ cảnh hội thoại/quyết định trước đó — thứ chưa viết ra coi như không tồn tại với họ',
        'Vì viết ra giúp đặc tả trông chuyên nghiệp hơn',
        'Vì luật yêu cầu mọi tài liệu phải liệt kê giả định',
      ],
      answerIndex: 1,
      explain:
        'AI (hay người mới) chỉ có đúng những gì nằm trong đặc tả — bất kỳ ngữ cảnh nào chỉ tồn tại "trong đầu" người giao việc mà không được viết ra sẽ khiến bên thi hành đoán sai.',
    },
    {
      id: 'architecture-s3-q4',
      prompt: 'Thứ tự ưu tiên khi review code do AI/người khác thi hành nên đi theo hướng nào?',
      choices: [
        'Phong cách đặt tên → ca biên → đúng ranh giới → đúng hợp đồng',
        'Đúng hợp đồng → đúng ranh giới → đúng ca biên → mới tới phong cách',
        'Chỉ cần kiểm code có chạy được hay không, bỏ qua các bước khác',
        'Không có thứ tự ưu tiên, review theo cảm nhận từng phần',
      ],
      answerIndex: 1,
      explain:
        'Review theo tầng đi từ mức RỦI RO cao (sai hợp đồng/ranh giới ảnh hưởng cả hệ thống) xuống mức thấp (phong cách chỉ ảnh hưởng thẩm mỹ) — kiểm phong cách trước khi kiểm hợp đồng là lãng phí thời gian.',
    },
    {
      id: 'architecture-s3-q5',
      prompt:
        'Vì sao "test canh gác" nên viết TRƯỚC khi giao việc cho bên thi hành, không phải sau?',
      choices: [
        'Vì viết test trước giúp code chạy nhanh hơn',
        'Vì test viết trước là tiêu chí khách quan để nghiệm thu — tránh việc vừa viết đặc tả vừa nới lỏng tiêu chí theo kết quả bên thi hành nộp lại',
        'Vì công cụ CI yêu cầu bắt buộc thứ tự này',
        'Không có lý do đặc biệt, chỉ là thói quen tốt chung chung',
      ],
      answerIndex: 1,
      explain:
        'Test viết trước khi biết kết quả thi hành là thước đo khách quan, không bị chỉnh sửa ngược để "cho qua" — đúng tinh thần bất biến kiến trúc bị phá là CI đỏ, không đợi review phát hiện.',
    },
  ],
  'architecture-s4': [
    {
      id: 'architecture-s4-q1',
      prompt: 'Vì sao "NFR không đo được là NFR không tồn tại"?',
      choices: [
        'Vì NFR luôn liên quan tới hiệu năng, mà hiệu năng thì luôn đo được',
        'Vì một yêu cầu phi chức năng mơ hồ (ví dụ "hệ thống phải nhanh") không thể kiểm chứng đạt hay chưa, nên không thể gắn vào cổng CI hay dùng làm căn cứ nghiệm thu',
        'Vì chỉ có yêu cầu chức năng mới cần viết vào đặc tả',
        'Vì NFR chỉ áp dụng cho hệ thống lớn, không áp dụng cho dự án nhỏ',
      ],
      answerIndex: 1,
      explain:
        'NFR không có ngưỡng số (ví dụ "LCP ≤ 2.5s") thì không ai chứng minh được đã đạt hay chưa — nó biến thành lời hứa suông, không gắn được vào cổng CI tự động.',
    },
    {
      id: 'architecture-s4-q2',
      prompt:
        'Chiến lược "cây bóp cổ" (strangler fig) khi thay thế một hệ thống cũ hoạt động thế nào?',
      choices: [
        'Viết lại toàn bộ hệ thống từ đầu rồi thay thế một lần duy nhất',
        'Dựng hệ thống mới bên cạnh, chuyển dần từng luồng sang, chạy song song đối chiếu, rồi mới cắt bỏ phần cũ',
        'Tắt hệ thống cũ ngay để buộc phải hoàn thành hệ thống mới nhanh hơn',
        'Chỉ áp dụng được cho hệ thống chưa có người dùng thật',
      ],
      answerIndex: 1,
      explain:
        'Cây bóp cổ thay thế TỪNG PHẦN trong khi hệ thống vẫn phục vụ — giảm rủi ro so với viết lại toàn bộ một lần, vốn gần như luôn thất bại theo kinh nghiệm ngành.',
    },
    {
      id: 'architecture-s4-q3',
      prompt: 'Kiến trúc "rữa dần" (architecture erosion) xảy ra như thế nào?',
      choices: [
        'Do một quyết định sai lầm lớn duy nhất tại một thời điểm',
        'Do tích luỹ nhiều ngoại lệ nhỏ, mỗi lần đều được biện minh là "chỉ lần này thôi" — không có cổng tự động chặn lại',
        'Do đổi ngôn ngữ lập trình giữa chừng dự án',
        'Chỉ xảy ra khi đổi toàn bộ đội ngũ phát triển',
      ],
      answerIndex: 1,
      explain:
        'Kiến trúc hiếm khi sập vì một quyết định lớn — nó rữa dần qua vô số ngoại lệ nhỏ được cho qua, nên cần cổng tự động (lint, test canh gác) thay vì trông cậy vào kỷ luật cá nhân từng người.',
    },
    {
      id: 'architecture-s4-q4',
      prompt:
        'Khi dẫn dắt nhiều bên (người hoặc AI) thi hành song song, nguyên tắc chia việc nào giúp tránh xung đột?',
      choices: [
        'Chia việc theo số dòng code ước lượng bằng nhau cho mỗi bên',
        'Một đặc tả tương ứng một ranh giới module — mỗi bên làm trong phạm vi module riêng, không đụng chung file',
        'Cho tất cả các bên cùng sửa một file để tiện đối chiếu',
        'Không cần chia rõ, ai làm xong trước thì merge trước',
      ],
      answerIndex: 1,
      explain:
        'Ranh giới module rõ ràng (đã thiết lập từ chặng S1) là điều kiện để giao việc song song không đụng nhau — mỗi đặc tả nằm gọn trong một module thì các bên thi hành không giẫm chân lên nhau.',
    },
    {
      id: 'architecture-s4-q5',
      prompt: 'Người dẫn dắt kiến trúc nên tự tay làm khi nào, thay vì viết đặc tả giao việc?',
      choices: [
        'Luôn luôn nên tự làm mọi thứ để chắc chắn đúng ý',
        'Khi việc viết đặc tả kín tốn công hơn hẳn tự làm trực tiếp — ví dụ việc quá nhỏ, quá mơ hồ, hoặc cần quyết định tại chỗ liên tục',
        'Không bao giờ nên tự làm, luôn phải giao việc để tiết kiệm thời gian',
        'Chỉ tự làm khi không có AI hoặc người khác rảnh',
      ],
      answerIndex: 1,
      explain:
        'Viết đặc tả kín có chi phí — với việc quá nhỏ hoặc cần quyết định liên tục ngay khi làm, chi phí viết đặc tả có thể vượt chi phí tự làm; biết phân biệt hai trường hợp là một kỹ năng của người dẫn dắt.',
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
