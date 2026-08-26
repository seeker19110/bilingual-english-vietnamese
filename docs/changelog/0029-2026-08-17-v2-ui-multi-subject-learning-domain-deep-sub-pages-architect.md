# V2 UI — Multi-Subject Learning & Domain Deep Sub-Pages Architecture (2026-08-17)

Hoàn thành xây dựng và kết nối hệ thống Trang con Chuyên sâu (Sub-pages) cho toàn bộ hệ sinh thái Platform V2:

- **Phân hệ Môn Học Mới & STEM Solver (V2-12)**:
  - `apps/english/src/lib/subjectApi.ts` & `subjectApi.test.ts` (4 unit tests passed 100%).
  - **Trang Danh mục Môn học (`/subjects`, `/mon-hoc` — `Subjects.tsx`)**: Khám phá 5 môn học cốt lõi (Tiếng Anh, Toán học, Vật lý, Hóa học, Sinh học) với bộ lọc theo danh mục, hiển thị cấp độ chuẩn hóa và chế độ đánh giá (`exact_formula`, `step_analysis`, `rubric_ai`).
  - **Trang Tương tác Học & Giải bài tập STEM (`/subjects/:subjectId` — `SubjectDetail.tsx`)**: Bộ công cụ **Step-by-step AI Problem Solver** phân tích giả thiết, định lý áp dụng, các bước biến đổi chi tiết và kiểm tra đáp số cho Toán, Lý, Hóa, Sinh.
- **Phân hệ Trang Con Nghiệp Vụ Chuyên Sâu (Domain Deep Sub-Pages)**:
  - 🎙️ **Career Hub — Phòng Luyện Phỏng Vấn AI (`/career/interview` — `CareerInterview.tsx`)**: Giả lập phỏng vấn chuyên môn / hành vi (mô hình STAR) theo đúng `targetRole`, chấm điểm phản xạ (Score/10), phân tích điểm mạnh, điểm cần cải thiện và gợi ý câu trả lời tối ưu.
  - 📋 **Work Hub — Bảng Kanban Tương Tác (`/work/kanban` — `WorkKanban.tsx`)**: Theo dõi tiến độ task theo cột (Cần làm $\leftrightarrow$ Hoàn thành), phân loại độ ưu tiên (`urgent`/`high`/`medium`/`low`), lọc theo dự án và thêm việc nhanh.
  - 📊 **Startup Hub — Khung Lean Canvas 9 Ô Chuẩn Hóa (`/startup/canvas` — `StartupCanvas.tsx`)**: Giao diện 9 ô trực quan (Problem, Customer Segments, UVP, Solution, Channels, Revenue, Cost, Key Metrics, Unfair Advantage) cho phép chỉnh sửa trực tiếp và lưu mô hình kinh doanh khởi nghiệp.
  - 🎡 **Life Foundation Hub — Bánh Xe Cuộc Đời (`/life/wheel` — `LifeWheel.tsx`)**: Đánh giá 8 khía cạnh cuộc sống (Sức khỏe, Sự nghiệp, Tài chính, Mối quan hệ, Tâm trí, Môi trường, Giải trí, Phát triển) với biểu đồ Radar SVG sắc nét, tính điểm cân bằng và gợi ý cải thiện từ AI.
- **Tích hợp Điều hướng & Routing**:
  - Đăng ký 8 routes mới trong `App.tsx` kèm `lazyWithRetry` và bảo vệ phiên bằng `<RequireAuth>`.
  - Bổ sung nút truy cập nhanh trên header của `Career.tsx`, `Work.tsx`, `Startup.tsx`, `Life.tsx` và thêm thẻ môn học vào `Profile.tsx`.
- **Quality Gates**:
  - `npm run build` passed 100% (Client, Server, Hub).
  - `npm run typecheck` passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint` passed with 0 warnings.
  - `npm run format:check` passed 100% (All matched files use Prettier code style).
  - `npm test` (**4.112 / 4.112 tests passed 100%** trên 269 test files).
  - `npm run eval:v2:audit` passed 100% (8/8 Acceptance Criteria).

Tái cấu trúc giao diện theo chuẩn Platform V2:

- **Tách biệt Cài đặt học Tiếng Anh chuyên biệt (`apps/english/src/pages/EnglishSettings.tsx`)**:
  - Trang riêng `/cai-dat` (và alias `/settings`, `/cai-dat-tieng-anh`) quản lý 100% cấu hình học tiếng Anh: Chiều học (Việt học Anh ⇄ Nước ngoài học Việt), Nhóm tuổi, Tốc độ học từ mới/ngày (5/10/20), Mục tiêu tuần (3/5/7 ngày), 14 Giọng đọc AI (`VoicePicker`), Tốc độ phát (`RateToggle`), và Âm thanh phản hồi UI.
- **Trang Cá Nhân trở thành Personal Command Center (`apps/english/src/pages/Profile.tsx`)**:
  - Loại bỏ hoàn toàn các cài đặt học tập vụn vặt khỏi trang cá nhân.
  - Tích hợp cổng truy cập **6 Không Gian Chuyên Biệt**: 💼 Sự nghiệp (`/career`), 📁 Công việc (`/work`), 🚀 Khởi nghiệp (`/startup`), ❤️ Đời sống (`/life`), 🌐 Mạng lưới cá nhân (`/life-graph`), 💬 Bạn Đồng Hành AI (`/dong-hanh`).
  - Quản lý thông tin tài khoản, gói cước (Free/Pro/VIP), nâng cấp, xác thực email, Quests, Referral, Huy hiệu & mốc thành tựu.
  - Liên kết trực tiếp sang Cài đặt học Tiếng Anh (`/cai-dat`).
- **Tinh gọn Trang chủ Học Tiếng Anh (`apps/english/src/pages/Home.tsx`)**:
  - Gỡ bỏ hoàn toàn khối thẻ "Không Gian Chuyên Biệt" khỏi trang chủ để giữ trải nghiệm học tiếng Anh thuần túy, mượt mà và tập trung tối đa cho người học.
- **Cập nhật Điều hướng (`BottomNav.tsx`, `Layout.tsx`, `i18n`)**:
  - Tab 5 ở BottomNav đổi từ "Cài đặt" sang **"Cá nhân"** (`icon: User`, `to: /profile`).
  - Avatar ở Header điều hướng về `/profile`.
- **Quality Gates**:
  - `npm run build` passed 100%.
  - `npm run typecheck` passed 100% (0 errors).
  - `npm run lint` passed 100% (0 warnings).
  - `npm run format:check` passed 100%.
  - `npm test` passed 100% (4108/4108 tests).
  - `npm run eval:v2:audit` passed 100% (8/8 Acceptance Criteria).

Hoàn thành Bộ Giao diện Chuyên biệt cho 4 Sub-Domains (Career Hub, Work Hub, Startup Hub, Life Foundation Hub):

- **Client API Layer & Unit Tests**:
  - `apps/english/src/lib/careerApi.ts` & `careerApi.test.ts` (8 tests passed).
  - `apps/english/src/lib/workApi.ts` & `workApi.test.ts` (7 tests passed).
  - `apps/english/src/lib/startupApi.ts` & `startupApi.test.ts` (5 tests passed).
  - `apps/english/src/lib/lifeApi.ts` & `lifeApi.test.ts` (3 tests passed).
  - Tổng cộng 23/23 tests client API passed 100%.
- **Specialized Domain Pages**:
  - 💼 **Career Hub (`/career`, `/su-nghiep`)**: Quản lý hồ sơ sự nghiệp (`targetRole`, kỳ vọng lương, số năm kinh nghiệm), kinh nghiệm làm việc theo timeline, mục tiêu nghề nghiệp, và phân tích khoảng cách kỹ năng (Skill Gap Analysis) liên kết với lộ trình học tập.
  - 📁 **Work Hub (`/work`, `/cong-viec`)**: Quản lý dự án, bảng công việc (`todo`/`done`, mức độ ưu tiên `low`/`medium`/`high`/`urgent`), biên bản cuộc họp (`Meeting Minutes` kèm `Action Items`), tài liệu nghiệp vụ (`specs`, `proposals`, `reports`).
  - 🚀 **Startup Hub (`/startup`, `/khoi-nghiep`)**: Khung Lean Discovery Canvas, quản lý bài toán khách hàng (`Problems`), chu kỳ giai đoạn khởi nghiệp (`ideation` $\rightarrow$ `validation` $\rightarrow$ `mvp` $\rightarrow$ `growth` $\rightarrow$ `scale`), kiểm chứng giả thuyết (`Hypotheses`), và nhật ký bằng chứng thị trường có nguồn gốc minh bạch (`Validated Evidence with Provenance`).
  - ❤️ **Life Foundation Hub (`/life`, `/cuoc-song`)**: Theo dõi chuỗi thói quen hàng ngày (Daily Habit Streaks & Check-in), nhật ký sức khỏe & tâm trạng (Mood / Energy / Stress check-in), kế hoạch cuộc sống theo chu kỳ (Life Plans), và lưu giữ cột mốc phát triển bản thân (Growth Milestones).
- **Routing & Navigation**:
  - Đăng ký 8 routes mới trong `apps/english/src/App.tsx` với tính năng `lazyWithRetry` và bảo vệ phiên bằng `<RequireAuth>`.
  - Thêm thẻ điều hướng nhóm "Không Gian Chuyên Biệt (Specialized Domain Hubs)" trên trang chủ `apps/english/src/pages/Home.tsx`.
- **Quality Gates**:
  - `npm run build` (client, server, hub) passed 100%.
  - `npm run typecheck` passed 100%.
  - `npm run lint` passed with 0 warnings.
  - `npm run format:check` passed 100%.
  - `npm test` (**4110 tests passed 100%** trên 268 test files).

Hoàn thành Giao diện Quản lý Mạng lưới Cá nhân & Ký ức (Life Graph & Personal Knowledge Fabric UI):

- **Client API Layer (`apps/english/src/lib/knowledgeFabricApi.ts` & `knowledgeFabricApi.test.ts`)**:
  - Bọc các hàm gọi API cho Personal Facts, Memories, Automation Grants, Cross-domain Sync, Data Portability Export & GDPR Erasure.
  - Unit tests đạt 100% pass (10/10 tests).
- **Life Graph & Knowledge Explorer Page (`apps/english/src/pages/LifeGraph.tsx`)**:
  - Giao diện Dark theme tinh tế gồm 4 Tabs toàn diện:
    1. 🌐 **Mạng lưới Cá nhân (Life Graph)**: Quản lý 9 loại node, 7 quan hệ, và nút kích hoạt Đồng bộ Đa miền (Cross-Domain Sync).
    2. 📝 **Sự thật & Ràng buộc (Personal Facts)**: Xem, khai báo mới, và xoá các facts theo danh mục, độ nhạy cảm và độ tin cậy.
    3. 🧠 **Bộ nhớ Ký ức (Memory Fabric)**: Lọc và quản lý ký ức theo 5 namespaces (`semantic`, `episodic`, `preference`, `commitment`, `domain`).
    4. ⚡ **Quyền Tự động hoá (Automation & Receipts)**: Tạm dừng / Tiếp tục / Thu hồi quyền tự động (`AutomationGrant`) và xem biên nhận bất biến (`ActionReceipt`).
  - **GDPR Data Portability & Erasure Toolbar**: 1-click xuất file `.json` toàn bộ dữ liệu 13 schemas và nút Xóa vĩnh viễn với xác nhận an toàn 2 lớp.
- **Quality Gates**: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` (**4087 tests passed 100%** trên 264 test files).
