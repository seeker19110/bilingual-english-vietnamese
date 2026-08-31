// packages/subject-programming/curriculum.ts — Khung giáo trình môn LẬP TRÌNH.
// Nguồn đặc tả: docs/research/dac-ta-mon-lap-trinh-2026-08-24.md (thang P1–P6, đề cương unit)
// + docs/research/dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md (dự án trục, mô hình 2 làn).
//
// PR-L1 chỉ chứa KHUNG (bậc + unit + bước dự án trục) — nội dung bài học chi tiết (khuôn 8
// bước: Predict/Parsons/Make…) sẽ vào ở PR-L3/L4. Dữ liệu ở đây là hằng biên dịch, không I/O.

/** Mã bậc P1–P6 (tương tự CEFR A1–C2 của môn English). */
export type ProgrammingLevelId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'

export const PROGRAMMING_LEVEL_IDS: ProgrammingLevelId[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']

/** Một unit trong bậc: kiến thức nạp ở làn LUYỆN + bước xây tiếp dự án trục ở làn DỰ ÁN. */
export interface ProgrammingUnit {
  /** id ổn định dạng `<bậc>-u<số>` — dùng làm khoá tiến độ trong Postgres. */
  id: string
  title: string
  /** Kiến thức chính của unit (làn LUYỆN). */
  topics: string
  /** Bước xây tiếp dự án trục T1 "Cửa hàng của tôi" (làn DỰ ÁN) — rỗng nếu unit thuần luyện. */
  projectStep?: string
}

export interface ProgrammingLevel {
  id: ProgrammingLevelId
  /** Tên bậc, ví dụ "Nhập môn tư duy". */
  name: string
  /** Mục tiêu đầu ra đo được (can-do). */
  canDo: string
  /** Thời lượng ước tính, ví dụ "4–6 tuần". */
  duration: string
  /** Ngôn ngữ chính của bậc. */
  languages: string[]
  /** Tên chặng dự án trục + trạng thái sản phẩm khi hoàn thành bậc (milestone). */
  projectStage: string
  projectMilestone: string
  units: ProgrammingUnit[]
}

// Khung unit theo đề cương đặc tả gốc mục 4; bước dự án theo bản đồ đặc tả xuyên suốt mục 3.
export const PROGRAMMING_LEVELS: ProgrammingLevel[] = [
  {
    id: 'p1',
    name: 'Nhập môn tư duy',
    canDo:
      'Đọc-hiểu và viết chương trình tuần tự: biến, kiểu, nhập/xuất, rẽ nhánh, vòng lặp; trace được code trên giấy.',
    duration: '4–6 tuần',
    languages: ['Python'],
    projectStage: 'Chặng P1 — "Máy tính tiền" (console)',
    projectMilestone: 'Máy bán hàng console hoàn chỉnh: menu → chọn món → tính tiền → tiền thừa.',
    units: [
      {
        id: 'p1-u1',
        title: 'Chương trình đầu tiên',
        topics: 'Máy tính làm gì; chương trình là gì; chạy dòng lệnh đầu tiên',
      },
      {
        id: 'p1-u2',
        title: 'Biến và phép toán',
        topics: 'Biến, kiểu số/chuỗi, phép toán',
        projectStep: 'In menu quán cố định, chào theo tên chủ quán',
      },
      {
        id: 'p1-u3',
        title: 'Nhập / xuất dữ liệu',
        topics: 'Nhập/xuất, f-string, làm tròn',
        projectStep: 'Nhập món + số lượng → tính tiền, tiền thừa',
      },
      {
        id: 'p1-u4',
        title: 'Rẽ nhánh',
        topics: 'if/elif/else, so sánh, boolean — ví dụ tiền điện bậc thang EVN',
        projectStep: 'Giảm giá theo hoá đơn (if bậc thang)',
      },
      { id: 'p1-u5', title: 'Vòng lặp while', topics: 'while — trò đoán số, đếm lần đoán' },
      { id: 'p1-u6', title: 'Vòng lặp for', topics: 'for, range — bảng cửu chương, tiết kiệm' },
      {
        id: 'p1-u7',
        title: 'Lồng nhau',
        topics: 'if trong loop — lọc điểm đậu/rớt',
        projectStep: 'Vòng lặp bán nhiều đơn liên tiếp, tổng doanh thu phiên',
      },
      {
        id: 'p1-u8',
        title: 'Đọc code và tìm lỗi',
        topics: 'Trace code trên giấy, lỗi thường gặp',
      },
      {
        id: 'p1-u9',
        title: 'Số ngẫu nhiên & import',
        topics: 'random, import module đầu tiên — oẳn tù tì với máy',
      },
      {
        id: 'p1-u10',
        title: 'Milestone chặng P1',
        topics: 'Ráp toàn bộ kiến thức bậc',
        projectStep: 'Hoàn thiện máy bán hàng console (milestone P1)',
      },
    ],
  },
  {
    id: 'p2',
    name: 'Nền tảng vững',
    canDo:
      'Hàm, danh sách/chuỗi, dict, file; chia bài toán thành hàm nhỏ; debug bằng đọc lỗi + print.',
    duration: '6–8 tuần',
    languages: ['Python'],
    projectStage: 'Chặng P2 — "Sổ sách tử tế" (hàm, dữ liệu, file)',
    projectMilestone: 'Phần mềm quản lý bán hàng console dùng được thật, dữ liệu bền qua file CSV.',
    units: [
      {
        id: 'p2-u1',
        title: 'Hàm',
        topics: 'def, tham số, return, phạm vi biến',
        projectStep: 'Tách máy tính tiền thành hàm (tinh_tien, in_hoa_don)',
      },
      {
        id: 'p2-u2',
        title: 'Danh sách',
        topics: 'index, slice, thêm/xoá, duyệt',
        projectStep: 'Menu thành list sửa được (thêm/bớt món)',
      },
      {
        id: 'p2-u3',
        title: 'Chuỗi chuyên sâu',
        topics: 'split/join/strip/format — chuẩn hoá họ tên',
      },
      {
        id: 'p2-u4',
        title: 'Dict & tuple',
        topics: 'Sổ điểm: tên → list điểm, trung bình, xếp loại',
        projectStep: 'Món hàng thành dict (tên, giá, tồn kho)',
      },
      { id: 'p2-u5', title: 'Comprehension & sort', topics: 'List comprehension, sort có key' },
      {
        id: 'p2-u6',
        title: 'File & CSV',
        topics: 'Đọc/ghi file text + CSV',
        projectStep: 'Lưu đơn ra CSV, đọc lịch sử, báo cáo doanh thu theo ngày',
      },
      {
        id: 'p2-u7',
        title: 'Xử lý lỗi',
        topics: 'try/except, kiểm dữ liệu nhập',
        projectStep: 'Chống nhập bậy — sổ sách "không thể sập"',
      },
      { id: 'p2-u8', title: 'Module chuẩn', topics: 'datetime, math, random — đếm ngược, lãi kép' },
      {
        id: 'p2-u9',
        title: 'Chia nhiều file',
        topics: 'Nhiều file, hàm main()',
        projectStep: 'Tách 3 file: giao diện / logic / lưu trữ',
      },
      {
        id: 'p2-u10',
        title: 'Milestone chặng P2',
        topics: 'Ráp toàn bộ kiến thức bậc',
        projectStep: 'Hoàn thiện phần mềm quản lý bán hàng console (milestone P2)',
      },
    ],
  },
  {
    id: 'p3',
    name: 'Làm được việc thật',
    canDo:
      'Dự án nhỏ hoàn chỉnh; HTML/CSS/JS nhập môn; SQL cơ bản; Git; tự đọc tài liệu để dùng thư viện mới.',
    duration: '8–10 tuần',
    languages: ['Python', 'HTML/CSS/JS', 'SQL'],
    projectStage: 'Chặng P3 — "Lên web" (HTML/CSS/JS + SQL + Git)',
    projectMilestone: 'Web tĩnh của cửa hàng chạy được + kho dữ liệu SQL + repo GitHub công khai.',
    units: [
      {
        id: 'p3-u1',
        title: 'Thư viện ngoài',
        topics: 'pip, đọc tài liệu — requests lấy tỷ giá/thời tiết',
      },
      {
        id: 'p3-u2',
        title: 'JSON',
        topics: 'Đọc/ghi/lồng nhau',
        projectStep: 'Lưu dữ liệu quán bằng JSON',
      },
      { id: 'p3-u3', title: 'Dữ liệu bảng', topics: 'csv → pandas mức dùng được, vẽ 1 biểu đồ' },
      {
        id: 'p3-u4',
        title: 'HTML',
        topics: 'Cấu trúc trang, thẻ, form',
        projectStep: 'Trang giới thiệu cửa hàng',
      },
      {
        id: 'p3-u5',
        title: 'CSS',
        topics: 'Box model, flex, responsive mobile-first',
        projectStep: 'Làm đẹp trang cửa hàng, xem tốt trên điện thoại',
      },
      {
        id: 'p3-u6',
        title: 'JavaScript & DOM',
        topics: 'DOM, sự kiện, thao tác trang',
        projectStep: 'Trang đặt hàng chạy JS, giỏ hàng localStorage',
      },
      {
        id: 'p3-u7',
        title: 'Fetch API',
        topics: 'fetch, render danh sách — tra thời tiết 63 tỉnh',
      },
      {
        id: 'p3-u8',
        title: 'SQL cơ bản',
        topics: 'SELECT/WHERE/ORDER/LIMIT trên SQLite',
        projectStep: 'Chuyển kho dữ liệu CSV → SQLite',
      },
      {
        id: 'p3-u9',
        title: 'SQL nâng cao',
        topics: 'JOIN, GROUP BY, INSERT/UPDATE/DELETE',
        projectStep: 'Báo cáo doanh thu theo tháng/món từ nhiều bảng',
      },
      {
        id: 'p3-u10',
        title: 'Git & GitHub',
        topics: 'commit/branch/merge, README',
        projectStep: 'Đưa toàn bộ dự án lên GitHub',
      },
      { id: 'p3-u11', title: 'Công cụ dev', topics: 'Dòng lệnh, môi trường ảo, cấu trúc dự án' },
      {
        id: 'p3-u12',
        title: 'Milestone chặng P3',
        topics: 'Ráp toàn bộ kiến thức bậc',
        projectStep: 'Hoàn thiện web cửa hàng + kho SQL + repo GitHub (milestone P3)',
      },
    ],
  },
  {
    id: 'p4',
    name: 'Lập trình có cấu trúc lớn',
    canDo: 'OOP, module hoá, xử lý lỗi chuẩn, test tự động, gọi/dựng API HTTP, TypeScript cơ bản.',
    duration: '10–12 tuần',
    languages: ['Python', 'TypeScript'],
    projectStage: 'Chặng P4 — "Có xương sống" (OOP, API, test, TypeScript)',
    projectMilestone:
      'Full-stack mini chạy local: backend API + frontend + test + Git history sạch.',
    units: [
      {
        id: 'p4-u1',
        title: 'OOP căn bản',
        topics: 'class, thuộc tính/phương thức',
        projectStep: 'Mô hình hoá lại cửa hàng bằng class (Order, Menu)',
      },
      { id: 'p4-u2', title: 'OOP kế thừa', topics: 'Kế thừa, khi nào KHÔNG dùng OOP' },
      {
        id: 'p4-u3',
        title: 'Refactor có kỷ luật',
        topics: 'Refactor code cũ của chính mình theo lát nhỏ chạy được',
        projectStep: 'Refactor trọn phần lõi (Inventory, Report)',
      },
      {
        id: 'p4-u4',
        title: 'Lỗi & logging',
        topics: 'Exception tự định nghĩa, logging',
        projectStep: 'Thêm log + lỗi nghiệp vụ rõ ràng',
      },
      { id: 'p4-u5', title: 'Test tự động 1', topics: 'pytest, nghĩ ca biên trước' },
      {
        id: 'p4-u6',
        title: 'Test tự động 2',
        topics: 'Test logic tiền/kho',
        projectStep: 'Viết test cho tính tiền — bắt lỗi ca biên giảm giá, âm kho',
      },
      { id: 'p4-u7', title: 'HTTP & REST', topics: 'request/response, REST, JSON API' },
      {
        id: 'p4-u8',
        title: 'Backend nhỏ 1',
        topics: 'FastAPI mức khái niệm',
        projectStep: 'API CRUD cho món hàng + đơn (SQLite)',
      },
      {
        id: 'p4-u9',
        title: 'Backend nhỏ 2',
        topics: 'Nối frontend với backend',
        projectStep: 'Trang đặt hàng fetch API thay localStorage',
      },
      {
        id: 'p4-u10',
        title: 'TypeScript 1',
        topics: 'type, interface — vì sao type cứu dự án lớn',
      },
      {
        id: 'p4-u11',
        title: 'TypeScript 2',
        topics: 'generic cơ bản',
        projectStep: 'Port phần JS của cửa hàng sang TS, để type bắt lỗi thật',
      },
      {
        id: 'p4-u12',
        title: 'Milestone chặng P4',
        topics: 'Ráp toàn bộ kiến thức bậc',
        projectStep: 'Hoàn thiện full-stack mini chạy local (milestone P4)',
      },
    ],
  },
  {
    id: 'p5',
    name: 'Kỹ sư tập sự',
    canDo:
      'CTDL & giải thuật nền (big-O, tìm kiếm/sắp xếp, cây/đồ thị cơ bản), thiết kế schema CSDL, dự án full-stack có deploy.',
    duration: '12–16 tuần',
    languages: ['Python', 'TypeScript', 'SQL'],
    projectStage: 'Chặng P5 — "Ra Internet" (capstone)',
    projectMilestone:
      'HOÀN THÀNH MÔN: sản phẩm chạy thật trên Internet + repo GitHub đầy đủ lịch sử từ P1.',
    units: [
      { id: 'p5-u1', title: 'Big-O trực quan', topics: 'Đo thời gian thật, so độ phức tạp' },
      {
        id: 'p5-u2',
        title: 'Tìm kiếm & sắp xếp',
        topics: 'Tìm kiếm nhị phân, các thuật toán sort',
      },
      { id: 'p5-u3', title: 'CTDL nền', topics: 'stack/queue, hash, đệ quy' },
      { id: 'p5-u4', title: 'Cây & đồ thị', topics: 'Cây, đồ thị cơ bản' },
      {
        id: 'p5-u5',
        title: 'Thiết kế CSDL',
        topics: 'Chuẩn hoá, index, transaction',
        projectStep: 'Thiết kế lại schema tử tế, transaction cho đơn hàng',
      },
      {
        id: 'p5-u6',
        title: 'Bảo mật nhập môn',
        topics: 'OWASP top 3: injection/XSS/auth',
        projectStep: 'Đăng nhập chủ quán (hash mật khẩu, session)',
      },
      {
        id: 'p5-u7',
        title: 'Hiệu năng',
        topics: 'Tìm và sửa điểm chậm',
        projectStep: 'Đo và sửa 1 điểm chậm: báo cáo trên 10.000 đơn',
      },
      {
        id: 'p5-u8',
        title: 'Deploy',
        topics: 'Free-tier, biến môi trường, HTTPS',
        projectStep: 'Deploy cửa hàng lên Internet thật',
      },
      {
        id: 'p5-u9',
        title: 'Milestone chặng P5',
        topics: 'Hoàn thiện + kể lại hành trình',
        projectStep: 'Trang "Về dự án" + nộp URL sản phẩm sống (milestone P5 = hoàn thành môn)',
      },
    ],
  },
  {
    id: 'p6',
    name: 'Chuyên sâu',
    canDo:
      'Chọn MỘT trong 14 hướng chuyên sâu (web, di động, backend, dữ liệu, AI, DevOps, bảo mật, hệ thống, game, nhúng, desktop, kiến trúc, thuật toán, toán học cho lập trình) và đi hết 4 chặng của hướng đó tới mức chuyên gia.',
    duration: 'Mở — mỗi hướng 8–18 tháng',
    languages: ['Tuỳ hướng đã chọn'],
    projectStage: 'Hướng chuyên sâu tự chọn — xem `specializations/registry.ts`',
    projectMilestone: 'Sản phẩm tốt nghiệp (capstone) của hướng đã chọn, đủ làm bằng chứng nghề.',
    // 4 unit dưới đây là các unit DẪN NHẬP mở đầu bốn hướng phổ biến nhất. Nội dung đầy đủ của
    // cả 14 hướng nằm ở `specializations/` (mỗi hướng 4 chặng × module + 5 dự án) — đó mới là
    // nguồn thi hành, các unit này chỉ là cửa vào trong dòng bài học tuần tự.
    units: [
      { id: 'p6-u1', title: 'Dẫn nhập hướng AI', topics: 'Python: gọi LLM API, RAG cơ bản' },
      {
        id: 'p6-u2',
        title: 'Dẫn nhập hướng backend/cloud',
        topics: 'Go: goroutine, Docker, CI/CD',
      },
      {
        id: 'p6-u3',
        title: 'Dẫn nhập hướng hệ thống',
        topics: 'C nền tảng bộ nhớ → Rust ownership',
      },
      { id: 'p6-u4', title: 'Dẫn nhập hướng thuật toán', topics: 'Luyện đề có Socratic hints' },
      // Từ u16 trở đi là NỘI DUNG HỌC THẬT của các hướng chuyên sâu (bản đồ hướng ở
      // `specializations/`). Dải u5…u15 đã được CHƯƠNG TRÌNH M giữ chỗ (Kotlin · Swift ·
      // paradigm), nên nội dung hướng bắt đầu từ u16 để hai dòng việc không tranh mã unit.
      {
        id: 'p6-u16',
        title: 'Hướng Web S1 — trình duyệt làm gì & bố cục hiện đại',
        topics: 'Event loop, long task; Grid vs Flex, mobile-first, design token',
      },
      {
        id: 'p6-u17',
        title: 'Hướng Web S1 — UI là hàm của state, TypeScript cho giao diện',
        topics: 'State là nguồn sự thật; union phân biệt 4 trạng thái; không tin `as`',
      },
      {
        id: 'p6-u18',
        title: 'Hướng Web S1 — accessibility nhập môn',
        topics: 'Bàn phím đi hết luồng, focus thấy được; 4 trạng thái màn hình, aria-live',
      },
      {
        id: 'p6-u19',
        title: 'Hướng Kiến trúc S1 — module có ranh giới & luật phụ thuộc',
        topics: 'Trách nhiệm duy nhất đo được; phụ thuộc một chiều, đảo phụ thuộc, vòng',
      },
      {
        id: 'p6-u20',
        title: 'Hướng Kiến trúc S1 — vẽ bản đồ & đọc hệ thống người khác',
        topics: 'C4 bốn tầng, bản đồ kiểm được bằng máy; điểm nóng fan-in, dò vòng bóc lá',
      },
      {
        id: 'p6-u21',
        title: 'Hướng Kiến trúc S1 — đặc tả kín & sổ quyết định ADR',
        topics: 'Sáu ô bắt buộc, tiêu chí đo được; ADR có phương án bị loại, điều kiện xem lại',
      },
      // Từ u22 trở đi là chặng S4 (bậc chuyên gia) của các hướng — đặc tả:
      // `docs/specs/2026-08-27-chang-s4-13-huong.md` (dải u22…u60, 3 unit mỗi hướng).
      {
        id: 'p6-u22',
        title: 'Hướng Web S4 — thời gian thực: thứ tự, gửi lại, presence',
        topics: 'Hoà giải gói tin theo seq, lũy đẳng khi gửi lại; presence bằng dấu vết sống',
      },
      {
        id: 'p6-u23',
        title: 'Hướng Web S4 — offline: chọn chiến lược cache, đồng bộ khi có mạng lại',
        topics: 'Cache-first/network-first/SWR theo rủi ro; hàng đợi ghi, LWW tất định',
      },
      {
        id: 'p6-u24',
        title: 'Hướng Web S4 — vận hành: đọc p95, cảnh báo theo triệu chứng người dùng',
        topics: 'Log/metric/trace; phân vị nearest-rank; SLO, ngân sách lỗi, tốc độ tiêu',
      },
      // Từ u61 trở đi là chặng S1 của 11 hướng CÒN LẠI (web và architecture đã có ở u16…u21).
      // Đặc tả S4 chiếm trọn u22…u60 mà quên chừa chỗ cho S1 của 11 hướng này — vá ở
      // `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`.
      {
        id: 'p6-u61',
        title: 'Hướng Backend S1 — HTTP đúng nghĩa: mã trạng thái & phân trang',
        topics: 'Chọn mã theo ai-phải-sửa; 401≠403, 409/422; con trỏ thay offset',
      },
      {
        id: 'p6-u62',
        title: 'Hướng Backend S1 — đúng đắn dữ liệu: kiểm ở biên & lũy đẳng',
        topics: 'Kiểu tĩnh không cứu lúc chạy; bỏ trường lạ; khoá lũy đẳng, tiền số nguyên',
      },
      {
        id: 'p6-u63',
        title: 'Hướng Backend S1 — vận hành: ba nhóm lỗi, log lần ra được, tắt êm',
        topics: 'Ai bị đánh thức; log có cấu trúc + mã yêu cầu, che dữ liệu nhạy cảm; tắt êm',
      },
      // p6-u64/u65 khép nốt chặng S1 của hướng AI: p6-u1 (đã có từ trước, module gọi mô hình
      // + RAG) chỉ phủ 2/4 module của ai-s1 (specializations/ai.ts) — thiếu "Đánh giá tự động"
      // và "An toàn và chi phí". Đăng ký cầu nối ở `specializations/stageUnits.ts`.
      {
        id: 'p6-u64',
        title: 'Hướng AI S1 — đánh giá tự động: bộ vàng, recall@k, chặn hồi quy trong CI',
        topics: 'Bộ dữ liệu vàng, recall@k của khâu truy hồi; cổng so baseline, DAT/HONG',
      },
      {
        id: 'p6-u65',
        title: 'Hướng AI S1 — an toàn & chi phí: định tuyến model, tiêm lệnh',
        topics: 'Chọn model theo độ khó, đếm lượt theo gói; nhận diện tiêm lệnh (prompt injection)',
      },
      // u94…u101 là 4 CHẶNG RIÊNG CỦA LỘ TRÌNH "Kỹ Sư Trưởng AI" (principal-s1…s4, giai đoạn
      // P5 "Tầm trưởng") — không phải hướng chuyên sâu thứ 15, xem
      // `packages/subject-programming/learningPaths/pathStages.ts`. Đặc tả:
      // `docs/specs/2026-08-31-dot-4-p5-tam-truong.md`. Dải để dành cho S2/S3 của 11 hướng
      // (từng ghi `u94 trở đi` ở đặc tả `dai-ma-unit-s1-cac-huong-con-lai.md`) dời xuống u102+.
      {
        id: 'p6-u94',
        title: 'Tầm trưởng S1 — đặc tả giao việc cho AI',
        topics: '6 ô bắt buộc của đặc tả; tiêu chí chấp nhận đo được vs mơ hồ',
      },
      {
        id: 'p6-u95',
        title: 'Tầm trưởng S1 — eval & ngân sách chi phí',
        topics: 'Recall/precision trên bộ ca vàng; ước lượng token, cache prompt, điểm hoà vốn',
      },
      {
        id: 'p6-u96',
        title: 'Tầm trưởng S2 — vòng lặp agent tối giản',
        topics: 'Bảng tool + dispatch theo tên; vòng lặp nhiều bước có điều kiện dừng, log',
      },
      {
        id: 'p6-u97',
        title: 'Tầm trưởng S2 — tool-use an toàn & MCP',
        topics: 'Validate tham số, allowlist; MCP là hợp đồng liệt kê/gọi tool chuẩn hoá',
      },
      {
        id: 'p6-u98',
        title: 'Tầm trưởng S3 — ADR & build vs buy',
        topics: 'Khuôn 5 phần của ADR; điểm hoà vốn tự vận hành vs thuê API',
      },
      {
        id: 'p6-u99',
        title: 'Tầm trưởng S3 — RAG vs fine-tune, chọn model theo chi phí',
        topics: 'Chọn theo tần suất đổi dữ liệu; loại phương án bị áp đảo, đường biên hiệu quả',
      },
      {
        id: 'p6-u100',
        title: 'Tầm trưởng S4 — review công việc AI',
        topics: 'Checklist 5 điểm; đọc diff theo thứ tự rủi ro',
      },
      {
        id: 'p6-u101',
        title: 'Tầm trưởng S4 — post-mortem & trách nhiệm vận hành',
        topics: '5 whys không đổ lỗi; sự cố AI hỏng âm thầm, ngưỡng cảnh báo',
      },
      // p6-u102…u104: chặng S2 của hướng Backend (backend-s2, specializations/backend.ts,
      // 4 module). Dải p6-u94…u101 đã bị lộ trình "Kỹ Sư Trưởng AI" lấy trước cùng ngày, nên
      // S2 của backend dùng dải TIẾP THEO còn trống (p6-u102 trở đi) thay vì p6-u94 như kế
      // hoạch cũ đã ghi trong dac-ta-dai-ma-unit-s1-cac-huong-con-lai.md.
      {
        id: 'p6-u102',
        title: 'Hướng Backend S2 — CSDL quan hệ chuyên sâu: lost update & composite index',
        topics: 'Khoá lạc quan (version) chống lost update; quy tắc tiền tố của composite index',
      },
      {
        id: 'p6-u103',
        title: 'Hướng Backend S2 — cache: cache-aside, TTL, cache stampede',
        topics: 'Đọc/ghi cache-aside, làm mất hiệu lực đúng lúc; chặn stampede bằng khoá/jitter',
      },
      {
        id: 'p6-u104',
        title: 'Hướng Backend S2 — hàng đợi idempotent & race condition',
        topics: 'At-least-once buộc idempotent, dead letter queue; race condition tái hiện được',
      },
      // p6-u105…u107: chặng S3 "Hệ phân tán" của hướng Backend (backend-s3,
      // specializations/backend.ts, 4 module).
      {
        id: 'p6-u105',
        title: 'Hướng Backend S3 — nền tảng: sharding & gọi mạng khác gọi hàm',
        topics: 'Sharding modulo xáo trộn khi thêm máy; timeout là KHÔNG BIẾT, không phải lỗi',
      },
      {
        id: 'p6-u106',
        title: 'Hướng Backend S3 — giao tiếp giữa dịch vụ: outbox & saga',
        topics: 'Outbox pattern chống mất sự kiện; saga bù trừ cho giao dịch nhiều dịch vụ',
      },
      {
        id: 'p6-u107',
        title: 'Hướng Backend S3 — chịu lỗi & quan sát: circuit breaker, error budget',
        topics: 'Circuit breaker 3 trạng thái chặn dồn tải; SLO và ngân sách lỗi còn lại',
      },
      // p6-u108…u110: chặng S4 "Chuyên gia — quy mô lớn và trách nhiệm vận hành" của hướng
      // Backend (backend-s4, specializations/backend.ts, 4 module).
      {
        id: 'p6-u108',
        title: 'Hướng Backend S4 — thiết kế quy mô: ước lượng dung lượng, độ trễ đa vùng',
        topics: 'QPS trung bình/đỉnh, dung lượng lưu trữ; RTT theo tốc độ ánh sáng trong sợi quang',
      },
      {
        id: 'p6-u109',
        title: 'Hướng Backend S4 — lưu trữ chuyên biệt: chọn kho dữ liệu, LSM vs B-tree',
        topics: 'Chọn loại kho theo mẫu truy vấn; đánh đổi ghi nhanh (LSM) vs đọc nhanh (B-tree)',
      },
      {
        id: 'p6-u110',
        title: 'Hướng Backend S4 — bảo mật & vận hành: đặc quyền tối thiểu, phân loại sự cố',
        topics: 'Phân quyền deny-by-default; phân loại mức độ sự cố + quy trình leo thang',
      },
      // p6-u66..u68: chặng S1 của hướng Dữ liệu (data-s1, specializations/data.ts, 4 module).
      // p3-u8/p3-u9 đã dạy SELECT/JOIN/GROUP BY/HAVING cơ bản — u66 đi XA HƠN (hàm cửa sổ, CTE)
      // để không dạy trùng. Đăng ký cầu nối ở `specializations/stageUnits.ts`.
      {
        id: 'p6-u66',
        title: 'Hướng Dữ liệu S1 — hàm cửa sổ & CTE: xếp hạng và luỹ kế không mất dòng',
        topics:
          'RANK/DENSE_RANK OVER PARTITION BY; CTE (WITH) chia truy vấn dài, SUM() OVER luỹ kế',
      },
      {
        id: 'p6-u67',
        title: 'Hướng Dữ liệu S1 — làm sạch dữ liệu: thiếu/trùng/sai kiểu, chuẩn hoá ngày giờ',
        topics:
          'Phát hiện thiếu/trùng/ngoại lệ; chuẩn hoá định dạng ngày; ghi lại giả định làm sạch',
      },
      {
        id: 'p6-u68',
        title: 'Hướng Dữ liệu S1 — thống kê đủ dùng & trực quan hoá trung thực',
        topics:
          'Trung bình vs trung vị, tương quan không phải nhân quả; chọn biểu đồ không đánh lừa mắt',
      },
    ],
  },
]

const levelMap = new Map<string, ProgrammingLevel>(PROGRAMMING_LEVELS.map((l) => [l.id, l]))

/** Lấy bậc theo id ('p1'…'p6'), không phân biệt hoa thường; undefined nếu id lạ. */
export function getProgrammingLevel(levelId: string): ProgrammingLevel | undefined {
  return levelMap.get(levelId.toLowerCase())
}

/**
 * Suy BẬC từ mã bài học: 'p3-u9-l1' → 'p3'. Trả undefined nếu mã không đúng khuôn hoặc
 * bậc không tồn tại.
 *
 * Có hàm này để giao diện không phải đoán bậc bằng cách ghi cứng — lỗi PR-UX1 vá chính là
 * `ProgrammingLessonPage` luôn quay lại '/lap-trinh/p1' kể cả khi đang học bài P5.
 */
export function getLevelIdOfLesson(lessonId: string): ProgrammingLevelId | undefined {
  const prefix = lessonId.toLowerCase().split('-')[0]
  return PROGRAMMING_LEVEL_IDS.find((id) => id === prefix)
}

/** Ba phương án dự án trục — học viên chọn 1 lúc vào môn (MVP mới mở T1). */
export interface ProjectTrack {
  id: 'T1' | 'T2' | 'T3'
  name: string
  description: string
  /** MVP chỉ mở T1; T2/T3 hiển thị "sắp mở". */
  available: boolean
}

export const PROJECT_TRACKS: ProjectTrack[] = [
  {
    id: 'T1',
    name: 'Cửa hàng của tôi',
    description:
      'Quản lý bán hàng nhỏ: menu, đơn, kho, doanh thu, trang đặt hàng — từ console P1 đến web chạy thật trên Internet ở P5.',
    available: true,
  },
  {
    id: 'T2',
    name: 'Quỹ lớp / Chi tiêu nhà mình',
    description: 'Thu chi, thành viên, báo cáo, trang minh bạch quỹ.',
    available: false,
  },
  {
    id: 'T3',
    name: 'Sổ học tập của tôi',
    description: 'Quản lý môn học, deadline, điểm, thẻ ôn, trang chia sẻ tài liệu.',
    available: false,
  },
]
