# Đặc tả: Khoá học "Kỹ Sư Trưởng AI" — lộ trình mục tiêu cá nhân hoá đầu tiên của môn Lập trình

> Ngày: 2026-08-31 · Trạng thái: **CHỜ NGƯỜI DÙNG DUYỆT** — chưa thi hành.
> Khuôn: `docs/templates/dac-ta-tinh-nang.md`. Bối cảnh nghiên cứu: mô hình cá nhân hoá của
> repo `ai-engineering-from-scratch` (tri thức tĩnh có cấu trúc + manifest lộ trình + chẩn đoán
> đầu vào + vòng lặp học có bằng chứng) — mượn KIẾN TRÚC, không import nội dung.

## 0. Một câu

Thêm tầng **LỘ TRÌNH MỤC TIÊU** vào môn Lập trình, với lộ trình đầu tiên "Kỹ Sư Trưởng AI":
từ cùng kho tri thức 14 hướng chuyên sâu sẵn có, hệ thống chẩn đoán trình độ → chọn điểm vào →
Companion dẫn từng bài theo vòng lặp _concept → code → quiz → artifact_, đích đến là năng lực
kỹ sư trưởng AI (nắm nhiều trục kỹ thuật + vận hành AI hiệu quả + ra quyết định).

## Toàn cảnh 4 đợt (mỗi đợt một PR, thi hành theo thứ tự)

| Đợt | Tên                                                      | Bản chất                                  | Phụ thuộc                            |
| --- | -------------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| 1   | Hạ tầng `learningPaths` + manifest `principal-ai`        | thuần dữ liệu + UI đọc, 0 AI, 0 migration | —                                    |
| 2   | Chẩn đoán chọn điểm vào + tiến độ lộ trình               | logic + 1 migration                       | Đợt 1                                |
| 3   | Vòng lặp học có bằng chứng (quiz + artifact + Companion) | logic + AI + 1 migration                  | Đợt 1–2                              |
| 4   | ✅ Giai đoạn 5 "Tầm trưởng" — nội dung mới               | soạn nội dung (unit + bài học thật)       | Đợt 1 (dùng được ngay không cần 2–3) |

**Vì sao là tầng MỚI chứ không nhét vào tầng có sẵn:** ba tầng hiện có đều không khớp —
`curriculum.ts` (xương sống P1–P6) là đường chung một chiều; `specializations/` là MỘT hướng
× 4 chặng; `courses/` (khoá ngắn) tham chiếu BÀI HỌC lẻ và cố ý không có thứ tự bậc. Lộ trình
mục tiêu cần tham chiếu **CHẶNG của nhiều hướng** theo thứ tự có phụ thuộc — đúng mô hình
"learning path manifest" (JSON manifest trỏ vào bài có sẵn) của repo tham khảo. Nó tái dùng
đúng luật vàng tầng khoá ngắn: **CHỈ THAM CHIẾU bằng id, không bao giờ nhúng nội dung.**

---

# ĐỢT 1 — Hạ tầng `learningPaths` + manifest "Kỹ Sư Trưởng AI"

## ① Phạm vi

**LÀM:**

- Tạo thư mục `packages/subject-programming/learningPaths/` theo đúng khuôn
  `specializations/` (types + registry + 1 file dữ liệu/lộ trình + test canh khuôn dạng).
- Manifest đầu tiên `principal-ai.ts` — 5 giai đoạn ghép từ chặng ĐÃ CÓ (bảng ở ③).
- Trang tổng quan lộ trình `/lap-trinh/lo-trinh/principal-ai` (route mới trong `App.tsx`,
  nạp lười như các trang môn Lập trình khác): hiện 5 giai đoạn, từng chặng kèm trạng thái
  **"đã có bài" / "chưa có bài"** đọc từ `unitsOfStage()` — KHÔNG hứa suông (cùng luật
  `stageUnits.ts`); chặng đã có bài thì nút "Vào học" trỏ về trang chặng sẵn có
  (`ProgrammingSpecStagePage`).
- Lối vào: thẻ giới thiệu lộ trình trên `ProgrammingHome.tsx` (khu riêng "Lộ trình mục tiêu",
  tách khỏi khu hướng chuyên sâu và khoá ngắn).

**KHÔNG LÀM:**

- KHÔNG chẩn đoán, KHÔNG tiến độ riêng của lộ trình (đợt 2) — đợt này trạng thái chặng hiển
  thị suy ra từ `specProgressService` sẵn có (chặng completed ở hướng nào thì lộ trình cũng
  hiện completed), chỉ ĐỌC.
- KHÔNG migration, KHÔNG endpoint mới, KHÔNG gọi AI.
- KHÔNG soạn nội dung bài học mới (đợt 4). KHÔNG làm lộ trình thứ hai.
- KHÔNG đụng `curriculum.ts`, `specializations/*` (chỉ import), `courses/*`.

## ② Điểm chạm

| Việc | Đường dẫn file                                                              | Ghi chú                                  |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------- |
| Thêm | `packages/subject-programming/learningPaths/types.ts`                       | kiểu ở ③                                 |
| Thêm | `packages/subject-programming/learningPaths/registry.ts`                    | khuôn `specializations/registry.ts`      |
| Thêm | `packages/subject-programming/learningPaths/principal-ai.ts`                | dữ liệu manifest                         |
| Thêm | `packages/subject-programming/learningPaths/learningPaths.test.ts`          | test canh ở ⑤                            |
| Thêm | `apps/dhcb/src/pages/subjects/programming/ProgrammingPathPage.tsx` (+ test) | trang tổng quan                          |
| Sửa  | `apps/dhcb/src/App.tsx`                                                     | thêm route `/lap-trinh/lo-trinh/:pathId` |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingHome.tsx`              | thẻ lối vào                              |

**Ảnh hưởng lan ra:** chạy `npm run codemap -- impact` cho `App.tsx` và `ProgrammingHome.tsx`
trước khi sửa (hai file hotspot); gói mới không ai import nên không lan.

## ③ Hợp đồng dữ liệu

```ts
// learningPaths/types.ts
/** Mã lộ trình — ổn định, làm URL /lap-trinh/lo-trinh/<id> và khoá tiến độ (đợt 2). */
export type LearningPathId = 'principal-ai'

/** Một mục trong giai đoạn: trỏ CHẶNG đã tồn tại. getSpecStage(stageId) PHẢI tra ra được. */
export interface PathStageRef {
  stageId: string // ví dụ 'ai-s1'
  /** Vì sao chặng này nằm ở đây — 1 câu, hiện trên UI để người học hiểu logic lộ trình. */
  why: string
  /** Tuỳ chọn: chỉ khi đạt các chặng này mới nên vào (kiểm bằng test không vòng lặp). */
  requires?: string[] // stageId khác TRONG cùng lộ trình
}

export interface PathPhase {
  id: string // '<path>-p<số>', ví dụ 'principal-ai-p1'
  name: string
  /** Can-do đo được của giai đoạn. */
  canDo: string
  stages: PathStageRef[]
  /** Artifact chốt giai đoạn (đợt 3 dùng; đợt 1 chỉ hiển thị mô tả). */
  artifact: { name: string; brief: string }
}

export interface LearningPath {
  id: LearningPathId
  title: string // 'Kỹ Sư Trưởng AI'
  tagline: string
  forWho: string
  /** Bậc xương sống tối thiểu để bắt đầu giai đoạn 1. */
  prerequisite: 'p3' | 'p4' | 'p5'
  duration: string
  phases: PathPhase[] // đúng 5, theo thứ tự
  /** Dấu hiệu ĐÃ đạt đích — hành vi quan sát được (cùng triết lý expertSignals). */
  outcomes: string[]
}
```

**Nội dung manifest `principal-ai` (dữ liệu chốt, thi hành đúng bảng này):**

| Giai đoạn                | Chặng (thứ tự)                                                                | Can-do                                                                         |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| P1 Nền toán & thuật toán | `mathforcode-s1..s4`, `algo-s1`, `algo-s2`                                    | đọc/viết được thuật toán ML căn bản không dùng thư viện                        |
| P2 Dữ liệu & backend     | `data-s1..s3`, `backend-s1`, `backend-s2`                                     | dựng đường ống dữ liệu + API phục vụ mô hình                                   |
| P3 Trục AI chính         | `ai-s1..s4`                                                                   | xây sản phẩm AI có eval, có guardrail, có tinh chỉnh                           |
| P4 Vận hành & tin cậy    | `devops-s1`, `devops-s2`, `security-s1`, `security-s2`, `architecture-s1..s4` | đưa hệ AI ra production an toàn, chịu tải, đặc tả được cho người khác thi hành |
| P5 Tầm trưởng            | các chặng MỚI của đợt 4 (đợt 1 khai `stages: []` + ghi chú "đang soạn")       | vận hành AI, quyết định kiến trúc, dẫn dắt                                     |

**Ca lỗi:** `getLearningPath(id)` với id lạ → `undefined`, KHÔNG đoán bừa (cùng hợp đồng
`getSpecialization`). Route `:pathId` lạ → trang 404 hiện có của app.

## ④ Tiêu chí chấp nhận

- [ ] Mọi `stageId` trong manifest tra ra được qua `getSpecStage()` — test lặp toàn manifest.
- [ ] `requires` không có vòng lặp và chỉ trỏ stageId thuộc cùng lộ trình — test topo-sort.
- [ ] P5 rỗng được phép ở đợt 1 nhưng UI phải hiện rõ "đang soạn", không có nút "Vào học".
- [ ] Trang `/lap-trinh/lo-trinh/principal-ai` render đủ 5 giai đoạn; chặng có trong
      `SPEC_STAGE_UNITS` mới có nút "Vào học" — test component.
- [ ] Không import ngược: `learningPaths/` chỉ import `specializations/`, không import `apps/`.

**Lệnh chứng minh:** `npm run typecheck && npm run lint && npm test && npm run build`

## ⑤ Bất biến không được phá

| Bất biến                                            | Test canh                                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| Manifest chỉ THAM CHIẾU, không nhúng nội dung chặng | `learningPaths.test.ts` (không có trường modules/project trong PathStageRef) |
| Khuôn 14 hướng không đổi                            | `specializations.test.ts` sẵn có                                             |
| Bundle budget (Initial JS dư ~10,8%)                | `npm run budget` — trang mới PHẢI nạp lười                                   |

## ⑥ Quy ước dự án

Import xuyên gói `@dhcb/subject-programming/...` không đuôi `.js`, nội bộ gói có đuôi `.js` ·
dữ liệu là hằng biên dịch, không I/O · chữ nội dung AAA, màu từ token `--a-*` · tiếng Việt
trên UI · tiêu đề PR: `feat(programming): ...`.

---

# ĐỢT 2 — Chẩn đoán chọn điểm vào + tiến độ lộ trình

## ① Phạm vi

**LÀM:**

- Bài chẩn đoán đầu vào `/lap-trinh/lo-trinh/principal-ai/chan-doan`: **5–7 câu hỏi trắc
  nghiệm + 2 bài code ngắn** chấm CLIENT bằng prelude/Sim sẵn có (`jsPrelude`, `pyLanes`,
  `sqlPrelude`) — mỗi giai đoạn P1–P4 có ít nhất 1 tín hiệu đo. Kết quả → đề xuất **điểm
  vào** (giai đoạn + chặng đầu tiên chưa vững). Người học được sửa tay đề xuất (chọn vào sớm
  hơn) — chẩn đoán là công cụ chọn việc, không phải phán quyết.
- Ghi kết quả: enroll lộ trình + đánh dấu các chặng "được miễn" (skipped). Bảng mới
  `programming.path_progress` (migration kế tiếp theo số ở `postgres/migrations/`):
  `user_id · path_id · stage_id · status ('skipped'|'in_progress'|'completed') · updated_at`,
  khoá chính `(user_id, path_id, stage_id)`. Hàm service đặt TRONG
  `specProgressService.ts` hoặc file chị em `pathProgressService.ts` cùng gói — id lạ bị TỪ
  CHỐI đối chiếu registry, không ghi rác.
- Endpoint: `GET/POST /api/path-progress` (handler ở `apps/server/src/api/subjects/english`
  → **không** — đặt ở `apps/server/src/api/learning/` cạnh handler programming hiện có),
  `validateAuth()` bắt buộc, đăng ký trong `apps/server/src/routes.ts`.
- Trang tổng quan lộ trình (đợt 1) chuyển sang đọc tiến độ hợp nhất: completed từ
  `specProgressService` HOẶC skipped/completed từ `path_progress`; hiện đúng **"3 việc hôm
  nay"** = chặng kế tiếp chưa xong theo thứ tự manifest.

**KHÔNG LÀM:**

- KHÔNG gọi AI trong chẩn đoán (tất định, chấm bằng Sim — mỗi lần làm lại ra cùng kết quả
  với cùng bài làm). KHÔNG chấm ở server.
- KHÔNG hiển thị "điểm số năng lực" — chỉ hiện đề xuất điểm vào ("bạn có thể bắt đầu từ…").
  **Luật số 1 của sản phẩm:** kết quả chẩn đoán không bao giờ là màn hình chính.
- KHÔNG đụng bảng của migration 0071 (spec progress) — chỉ đọc.

## ② Điểm chạm

| Việc | Đường dẫn file                                                                    | Ghi chú                                           |
| ---- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| Thêm | `packages/subject-programming/learningPaths/diagnostic.ts` (+ test)               | ngân hàng câu hỏi + luật suy điểm vào (hàm thuần) |
| Thêm | `packages/subject-programming/pathProgressService.ts` (+ test)                    | theo khuôn `specProgressService.ts`               |
| Thêm | `postgres/migrations/<số kế tiếp>_programming_path_progress.sql`                  | lũy đẳng, rollback được                           |
| Thêm | handler `apps/server/src/api/learning/pathProgress.ts` (+ test)                   | `validateAuth()`                                  |
| Sửa  | `apps/server/src/routes.ts`                                                       | 2 route mới                                       |
| Thêm | `apps/dhcb/src/pages/subjects/programming/ProgrammingPathDiagnostic.tsx` (+ test) |                                                   |
| Sửa  | `ProgrammingPathPage.tsx`, `App.tsx`                                              | đọc tiến độ + route                               |

**Ảnh hưởng lan ra:** `routes.ts` là hotspot — codemap trước khi sửa.

## ③ Hợp đồng dữ liệu

```ts
// diagnostic.ts — hàm thuần, tất định
export interface DiagnosticAnswer {
  questionId: string
  correct: boolean
}
export interface DiagnosticResult {
  /** stageId đề xuất bắt đầu (chặng đầu tiên có tín hiệu CHƯA vững). */
  entryStageId: string
  /** Các chặng đề xuất miễn — mọi tín hiệu của chúng đều vững. */
  skippedStageIds: string[]
}
export function suggestEntry(path: LearningPath, answers: DiagnosticAnswer[]): DiagnosticResult
```

`POST /api/path-progress` body: `{ pathId, stages: [{ stageId, status }] }` — server đối
chiếu registry, status chỉ nhận 3 giá trị, hợp nhất kiểu "chỉ tốt lên" (`skipped` →
`in_progress` → `completed`, không kéo lùi — cùng luật `learning_progress`).

**Ca lỗi:**

| Tình huống                         | Mã  | Hành vi                                                   |
| ---------------------------------- | --- | --------------------------------------------------------- |
| pathId/stageId lạ                  | 400 | từ chối, thông điệp tiếng Việt, không ghi gì              |
| thiếu/sai token                    | 401 | `validateAuth()` chuẩn hiện hành                          |
| status kéo lùi (completed→skipped) | 200 | bỏ qua ghi, giữ trạng thái tốt hơn                        |
| mạng lỗi khi lưu                   | —   | UI giữ kết quả ở localStorage, thử lại; có trạng thái lỗi |

## ④ Tiêu chí chấp nhận

- [ ] `suggestEntry` tất định: cùng answers → cùng result (property test tối thiểu 3 ca cố định).
- [ ] Trả lời đúng hết → entry = chặng đầu P5-chưa-có thì lùi về chặng cuối có bài; sai hết → entry = chặng đầu P1. Test 2 biên này.
- [ ] Ghi 2 lần cùng payload không tạo 2 dòng; kéo lùi bị bỏ qua — test service với pool giả theo khuôn `specProgressService.test.ts`.
- [ ] Handler thiếu token trả 401; user A không đọc/ghi được tiến độ user B — test handler.
- [ ] Migration chạy 2 lần liên tiếp không lỗi (lũy đẳng — Tầng 11 audit).

**Lệnh chứng minh:** cổng chuẩn + `npm run migrate:pg` trên DB dev.

## ⑤ Bất biến không được phá

| Bất biến                                      | Test canh                                 |
| --------------------------------------------- | ----------------------------------------- |
| Mọi truy vấn tiến độ kèm `user_id = $1`       | `pathProgressService.test.ts`             |
| Không con số năng lực nào rò lên UI chẩn đoán | test component: không render chuỗi điểm/% |
| Tiến độ "chỉ tốt lên"                         | `pathProgressService.test.ts`             |

## ⑥ Quy ước dự án

`validateAuth()` trước mọi query · Zod validate body · migration có số thứ tự + README ·
lịch/kết quả tính ở CLIENT, server chỉ giữ ý định (cùng triết lý `core-examplan`).

---

# ĐỢT 3 — Vòng lặp học có bằng chứng: quiz + kho artifact + Companion kiểm hiểu

## ① Phạm vi

**LÀM:**

- **Quiz sau chặng:** mỗi chặng trong lộ trình có 5 câu trắc nghiệm sinh TỪ dữ liệu
  `topics` của các module chặng đó (ngân hàng câu soạn tay trong
  `learningPaths/stageQuizzes.ts`, tham chiếu stageId — không nhúng lại nội dung chặng).
  Đạt ≥ 4/5 mới đánh dấu `completed` trên `path_progress` (hoàn thành chặng ở hướng gốc
  KHÔNG đổi luật — quiz chỉ là cổng của LỘ TRÌNH).
- **Kho artifact cá nhân:** cuối mỗi giai đoạn P1–P4, người học nộp artifact khai báo ở
  manifest (đường link repo/bài viết/ảnh chụp + mô tả ngắn). Bảng
  `programming.path_artifacts` (migration kế tiếp): `user_id · path_id · phase_id · url ·
note · created_at`. Trang lộ trình có mục "Hồ sơ bằng chứng" liệt kê artifact đã nộp.
- **Companion kiểm hiểu:** sau quiz đạt, MỘT lượt hội thoại tuỳ chọn "giải thích lại cho
  Bạn Đồng Hành" — đi qua `/api/agent` hiện có với prompt mới
  `apps/dhcb/src/prompts/pathCheckPrompt.ts` (hỏi 1 câu đào sâu + phản hồi động viên,
  tiếng Việt). Tính lượt vào mode `chat` hiện hành — KHÔNG thêm mode đếm lượt mới.

**KHÔNG LÀM:**

- KHÔNG chấm artifact bằng AI (người học tự lưu bằng chứng — chống phình phạm vi và chi phí).
- KHÔNG bắt buộc bước Companion (tuỳ chọn; Free hết lượt vẫn qua chặng bằng quiz).
- KHÔNG đụng `feedbackPrompt.ts` của môn Lập trình. Nếu trong lúc làm buộc phải đụng →
  DỪNG, chạy `npm run eval:code-feedback`, dán kết quả vào PR (luật CLAUDE.md mục 8).
- KHÔNG lưu nội dung hội thoại Companion vào path_progress.

## ② Điểm chạm

| Việc | Đường dẫn file                                                                 | Ghi chú                                                    |
| ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Thêm | `packages/subject-programming/learningPaths/stageQuizzes.ts` (+ test)          | ngân hàng câu + `quizOfStage()`                            |
| Thêm | migration `programming.path_artifacts`                                         |                                                            |
| Sửa  | `pathProgressService.ts` + handler + `routes.ts`                               | thêm artifact CRUD (chỉ create/list/delete của chính mình) |
| Thêm | `apps/dhcb/src/components/PathStageQuiz.tsx`, `PathArtifactVault.tsx` (+ test) |                                                            |
| Thêm | `apps/dhcb/src/prompts/pathCheckPrompt.ts`                                     | prompt mới, KHÔNG sửa prompt cũ                            |
| Sửa  | `ProgrammingPathPage.tsx`                                                      | gắn quiz + vault                                           |

## ③ Hợp đồng dữ liệu

```ts
export interface StageQuizQuestion {
  id: string // '<stageId>-q<số>'
  prompt: string
  choices: string[] // 4 lựa chọn
  answerIndex: number // 0-3
  explain: string // giải thích tiếng Việt sau khi trả lời
}
export function quizOfStage(stageId: string): StageQuizQuestion[] // [] = chưa có quiz → chặng qua không cần quiz, UI nói rõ
```

**Ca lỗi:** nộp artifact với `phase_id` lạ → 400; url không phải http(s) → 400 (Zod);
quiz < 4/5 → được làm lại không giới hạn, không phạt, hiện giải thích từng câu.

## ④ Tiêu chí chấp nhận

- [ ] Mọi câu quiz có đúng 4 lựa chọn, `answerIndex` hợp lệ, stageId tra được — test lặp ngân hàng.
- [ ] Chặng có quiz: `completed` trên path chỉ ghi khi đạt ≥ 4/5 — test service.
- [ ] Chặng chưa có quiz (mảng rỗng): qua chặng như đợt 2, UI ghi rõ "chưa có bài kiểm" — test component.
- [ ] Artifact: user chỉ thấy/xoá của mình — test handler.
- [ ] Prompt mới có eval khói tối thiểu: script kiểm prompt chứa các ràng buộc bất biến (tiếng Việt, không lộ đáp án quiz) — thêm ca vào test prompt hiện có nếu khuôn cho phép.

## ⑤ Bất biến không được phá

| Bất biến                                                     | Test canh                                               |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| Không gọi AI nào không đếm lượt                              | soát diff + test handler dùng đường `/api/agent` sẵn có |
| `feedbackPrompt.ts` và eval baseline không đổi               | `git diff` sạch file đó                                 |
| Quiz làm lại không giới hạn, không lưu điểm hiển thị lâu dài | test component                                          |

## ⑥ Quy ước dự án

Prompt để riêng `apps/dhcb/src/prompts/` · mọi thao tác fail có nhánh lỗi + trạng thái UI ·
vùng chạm ≥ 44px, mobile-first.

---

# ĐỢT 4 — Giai đoạn 5 "Tầm trưởng": nội dung mới duy nhất

## ① Phạm vi

**LÀM:** soạn 4 chặng mới dạng **chặng lộ trình riêng** (không phải hướng thứ 15 — chúng chỉ
có nghĩa trong lộ trình này), khai trong `learningPaths/principal-ai.ts` P5 + unit/bài học
thật theo dòng bài học 8 bước hiện có (`lessons/` + dải unit mới, khai vào
`SPEC_STAGE_UNITS` chỉ khi bài đã thật — đúng luật `stageUnits.ts`):

| Chặng                                  | Nội dung                                                                                                                                  | Dự án                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `principal-s1` Vận hành AI             | viết đặc tả giao việc cho AI (dạy chính khuôn `docs/templates/dac-ta-tinh-nang.md`), thiết kế bộ eval, ngân sách token/chi phí, guardrail | bộ đặc tả + eval cho một tính năng AI tự chọn   |
| `principal-s2` Hệ tác tử & MCP         | tự dựng agent loop, tool-use, viết MCP server nhỏ (mô phỏng bằng hạ tầng Sim — cân nhắc `agentSim` mới theo khuôn `openclawSim`)          | agent giải quyết một việc thật có log từng bước |
| `principal-s3` Quyết định kiến trúc AI | build vs buy, RAG vs fine-tune, chọn model theo chi phí — dạy và nộp bằng ADR (`docs/templates/adr.md`)                                   | 2 ADR có đánh đổi định lượng                    |
| `principal-s4` Dẫn dắt & trách nhiệm   | review code AI của người khác, post-mortem sự cố AI, đạo đức & trách nhiệm                                                                | 1 bản review + 1 post-mortem theo khuôn         |
| Capstone lộ trình                      | hệ AI hoàn chỉnh: có người dùng, có eval, có giám sát chi phí                                                                             | hồ sơ artifact P1→P5                            |

**KHÔNG LÀM:** không import bài từ repo tham khảo · không thêm ngôn ngữ lập trình mới ngoài
JS/TS/Python đã có Sim · `agentSim` nếu quá đắt thì tách PR riêng có đặc tả riêng (cổng cứng
như tiền lệ swiftsim: bộ test đối chiếu phải xanh trước khi nối vào bài học).

## ② Điểm chạm

`learningPaths/principal-ai.ts` (điền P5) · `lessons/` (bài mới theo dải unit xin cấp trong
đặc tả con — noi khuôn `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`) ·
`stageUnits.ts` · `stageQuizzes.ts` (quiz 4 chặng mới). Đợt này SẼ có đặc tả con chi tiết
từng chặng trước khi soạn (nội dung là phần đắt nhất — không soạn đại trà một lượt).

## ④ Tiêu chí chấp nhận (mức đợt)

- [ ] 4 chặng P5 khai đúng khuôn `PathStageRef`, tra được, có quiz, có bài thật trước khi bật "Vào học".
- [ ] Mọi bài học qua đủ cổng test khuôn bài học hiện có (`lessons*.test.ts`).
- [ ] Nội dung thuần tiếng Việt, ví dụ sát thực tế Việt Nam; không chép nguyên văn nguồn ngoài.

## ⑤ Bất biến

Giữ nguyên toàn bộ bất biến đợt 1–3; thêm: `SPEC_STAGE_UNITS` chỉ nhận unit đã có bài
(`stageUnits.test.ts` sẵn có canh).

---

## Rủi ro chung & điểm cần người dùng quyết khi duyệt

1. ~~**P5 rỗng lúc ra mắt (sau đợt 1–3)**~~ — **ĐÃ XONG (đợt 4, 2026-08-31):** hiện luôn từ
   đợt 1 như đề xuất; P5 nay đã có 4 chặng thật, không còn "đang soạn".
2. ~~**`agentSim` (đợt 4)** là hạng mục đắt~~ — **không cần đến**: chặng `principal-s2` (Hệ
   tác tử & MCP) dạy bằng cách tự cài vòng lặp agent thuần Python/JavaScript, chấm được bằng
   test-case có sẵn, không cần mô phỏng tương tác riêng.
3. **Chi phí AI đợt 3** dùng chung lượt `chat` Free/Pro hiện hành — không thêm chi phí mới,
   nhưng người học Free dùng nhiều sẽ hết lượt sớm hơn; chấp nhận?
4. Mỗi đợt tạo PR theo đủ quy ước 4 bước (tiêu đề `feat(programming): ...`, auto-merge,
   changelog `docs/changelog/`, cập nhật `PROGRESS.md`).

## Nghiệm thu (điền sau từng đợt)

- Lệnh đã chạy + kết quả thật:
- Tiêu chí ④ đạt hết chưa:
- Có phá bất biến ⑤ nào không:
- Có mở rộng ngoài phạm vi ① không:
- Còn để ngỏ:
