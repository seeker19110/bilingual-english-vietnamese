# Đặc tả: CHẶNG S2 — chi tiết thi hành được cho cả 13 hướng chuyên sâu (2026-08-27)

> Khuôn: `docs/templates/dac-ta-tinh-nang.md` (6 ô bắt buộc).
> Nền tảng: `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md`
> (§2.1 khuôn 4 chặng · §2.4 bản đồ kiến trúc · §2.5 sáu ô đặc tả kín · §5.1 việc còn để ngỏ).

## 0. Một câu

Biến chặng **S2 ("vững tay") của cả 13 hướng** từ mấy dòng bản đồ thành một **chặng học đi được
thật**: mỗi module có mục tiêu · bài luyện tay · câu tự kiểm · dấu hiệu đã nắm; dự án S2 có
**rubric nghiệm thu đo được** và một **đặc tả kín mẫu 6 ô**; người học đánh dấu được tiến độ và
tiến độ lưu xuống Postgres.

## 0.1. Vì sao là S2 chứ không phải S1

S1 là "căn bản của hướng" — phần lớn trùng với P4/P5 xương sống mà app đã dạy. **S2 là chỗ đường
rẽ thật sự bắt đầu** (web ≠ nhúng ≠ dữ liệu) và cũng là chỗ người học rơi rụng nhiều nhất vì
không biết "thế nào là đủ". Đó cũng là chặng đầu tiên mà **dự án đủ lớn để phải ĐẶC TẢ trước khi
làm** — đúng kỹ năng mà §2.4/§2.5 đặt làm trọng tâm của cả tầng này.

---

## ① Phạm vi

**LÀM:**

- Thêm kiểu `SpecStageDetail` (chi tiết một chặng) vào tầng hướng chuyên sâu.
- Soạn **13 file nội dung S2** — mỗi hướng một file, phủ **đủ mọi module S2 đang có** trong
  `stages` (không thêm/bớt module: id phải khớp 1–1 với bản đồ đã chốt).
- Mỗi module S2 khai 4 ô: `objective` (làm được gì) · `practice[]` (2–4 bài luyện tay, mô tả
  việc phải làm, KHÔNG chấm tự động) · `selfCheck[]` (2–4 câu tự kiểm có đáp án ngắn) ·
  `doneSignals[]` (2–3 dấu hiệu quan sát được là đã nắm).
- Mỗi hướng khai thêm cho **dự án S2**: `rubric[]` (≥ 4 tiêu chí nghiệm thu, mỗi tiêu chí có
  `howToProve` — chứng minh bằng cách nào) và `specBrief` (6 ô của §2.5: phạm vi + KHÔNG làm ·
  điểm chạm · hợp đồng · tiêu chí chấp nhận · bất biến · quy ước).
- Sổ đăng ký + hàm tra `getSpecStageDetail(stageId)`; trả `undefined` với mã lạ.
- **Trang chặng mới** `/lap-trinh/huong/:specId/:stageId` — dùng chung cho MỌI chặng; chặng chưa
  có chi tiết (S1/S3/S4) hiển thị đúng phần bản đồ sẵn có + ghi chú "chi tiết soạn ở đợt sau",
  không báo lỗi. Lối vào: nút ở từng thẻ chặng trong `ProgrammingSpecializationPage`.
- **Tiến độ**: đánh dấu xong từng module S2 và từng tiêu chí rubric; lưu qua endpoint tiến độ
  môn Lập trình sẵn có (mở rộng khoá hợp lệ, KHÔNG đổi bảng).
- Test bất biến chặn CI + hai cổng a11y cho route mới + giữ ngân sách bundle.
- Nhật ký đợt việc trong `docs/changelog/`.

**KHÔNG LÀM (quan trọng ngang mục trên):**

- **Không soạn bài học 8 bước** (`lessonTypes.ts`, Predict/Parsons/Make chấm tự động) cho tầng
  hướng. Lý do: 9/13 hướng (nhúng, game, an toàn, hệ thống…) không có bộ chạy trong trình duyệt;
  ép khuôn 8 bước lên chúng sẽ đẻ ra nội dung giả. Tầng này là **bản đồ + nghiệm thu**, việc chấm
  code tự động vẫn thuộc xương sống P1–P5.
- **Không đụng nội dung S1/S3/S4** và không sửa `stages` đã chốt ở PR #712 (id chặng/module là
  khoá tiến độ — đổi là di trú dữ liệu).
- **Không tạo migration mới.** `programming.lesson_progress.lesson_id` là `text` tự do.
- Không làm gợi ý hướng theo hồ sơ năng lực (giữ nguyên lý do ở §5.3 đặc tả gốc).
- Không đụng `curriculum.ts`, `lessons/`, `projectSteps*`, luồng thanh toán, hay bất kỳ file nào
  của môn tiếng Anh.

## ② Điểm chạm

| Việc | Đường dẫn                                                                               | Ghi chú                                                                     |
| ---- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Thêm | `packages/subject-programming/specializations/stageDetailTypes.ts`                      | `SpecStageDetail`, `SpecModuleDetail`, `SpecRubricItem`, `SpecBrief`        |
| Thêm | `packages/subject-programming/specializations/details/<id>-s2.ts` × 13                  | nội dung, mỗi hướng một file (KHÔNG đặt tên `index.ts` — xem §3 đặc tả gốc) |
| Thêm | `packages/subject-programming/specializations/stageDetails.ts`                          | sổ đăng ký + `getSpecStageDetail`                                           |
| Thêm | `packages/subject-programming/specStageDetails.test.ts`                                 | test bất biến khuôn dạng                                                    |
| Thêm | `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecStagePage.tsx`                 | trang chặng (nạp lười như 2 trang hướng hiện có)                            |
| Sửa  | `apps/dhcb/src/App.tsx`                                                                 | route `/lap-trinh/huong/:specId/:stageId` đặt SAU route `:specId`           |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecializationPage.tsx`            | nút "Mở chặng" ở mỗi thẻ chặng                                              |
| Sửa  | `apps/server/src/api/subjects/programming/progress.ts`                                  | nới `lessonId` + kiểm tồn tại qua registry hướng                            |
| Sửa  | `e2e/a11y.spec.ts`, `e2e/a11y-aaa.spec.ts`                                              | thêm 1 route mẫu `/lap-trinh/huong/web/web-s2`                              |
| Thêm | `docs/changelog/0176-2026-08-27-chang-s2-huong-chuyen-sau.md`                           | nhật ký đợt việc                                                            |
| Sửa  | `PROGRESS.md`, `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md` §5.1 | cập nhật trạng thái việc còn để ngỏ                                         |

**Ảnh hưởng lan ra:** chạy `npm run codemap -- impact` cho `progress.ts`, `registry.ts`,
`App.tsx` trước khi sửa và ghi kết quả vào mô tả PR. Điểm rủi ro đã biết: `progress.ts` cũng
phục vụ bài học P1–P5 → nới regex phải là **mở rộng thuần**, mọi khoá cũ vẫn hợp lệ.

## ③ Hợp đồng dữ liệu

**Kiểu dữ liệu nội dung (biên dịch, không I/O):**

```ts
export interface SpecModuleDetail {
  /** Khớp CHÍNH XÁC id module trong `stages` — vd 'web-s2-m1'. */
  moduleId: string
  objective: string // 1 câu: học xong module này LÀM ĐƯỢC gì (đo được)
  practice: string[] // 2–4 việc phải tự tay làm
  selfCheck: { q: string; a: string }[] // 2–4 câu tự kiểm + đáp án ngắn
  doneSignals: string[] // 2–3 dấu hiệu quan sát được
}

export interface SpecRubricItem {
  /** `<stageId>-r<số>` — vd 'web-s2-r1'. Là khoá tiến độ, phải ổn định. */
  id: string
  text: string // tiêu chí, ĐO ĐƯỢC
  howToProve: string // chứng minh bằng cách nào (lệnh/số/thao tác)
}

/** Sáu ô của một đặc tả kín (§2.5) — bản mẫu cho chính dự án S2 của hướng. */
export interface SpecBrief {
  scopeDo: string[]
  scopeDont: string[] // ≥ 2 mục — ô "không làm" là ô hay bị bỏ nhất
  touchpoints: string[]
  contracts: string[]
  acceptance: string[]
  invariants: string[]
  conventions: string[]
}

export interface SpecStageDetail {
  stageId: string // 'web-s2'
  modules: SpecModuleDetail[]
  rubric: SpecRubricItem[] // ≥ 4
  specBrief: SpecBrief
}

export function getSpecStageDetail(stageId: string): SpecStageDetail | undefined
```

**Hợp đồng API (mở rộng endpoint sẵn có, KHÔNG thêm endpoint):**

```ts
// POST /api/programming/progress
// TRƯỚC: lessonId khớp /^p[1-6]-(u\d+-l\d+|s\d+)$/
// SAU  : thêm nhánh hướng chuyên sâu
//        /^[a-z]+-s[1-4]-(m\d+|r\d+)$/   ví dụ 'web-s2-m1', 'backend-s2-r3'
// Kiểm tồn tại: module phải có trong stages của hướng; rubric phải có trong stage detail.
```

**Ca lỗi:**

| Tình huống                                         | Mã  | Hành vi                                                        |
| -------------------------------------------------- | --- | -------------------------------------------------------------- |
| `lessonId` sai khuôn                               | 400 | thông báo Zod, không ghi DB                                    |
| Khoá đúng khuôn nhưng không tồn tại (`web-s2-m99`) | 400 | `"Bài học ... không tồn tại"` — không ghi rác                  |
| Chưa đăng nhập                                     | 401 | Unauthorized (giữ nguyên)                                      |
| `specId`/`stageId` lạ trên URL                     | —   | trang nói KHÔNG BIẾT + nút quay lại danh sách, không đoán bừa  |
| Chặng chưa có chi tiết (S1/S3/S4)                  | —   | hiện phần bản đồ + ghi chú "đang soạn", không lỗi, không trắng |

## ④ Tiêu chí chấp nhận

- [ ] 13/13 hướng có `SpecStageDetail` cho chặng `s2`; `moduleId` phủ **đúng và đủ** module S2
      của hướng đó (không thừa, không thiếu) — test.
- [ ] Mỗi module: `objective` ≥ 40 ký tự, `practice` 2–4, `selfCheck` 2–4 (mỗi câu có đáp án
      ≥ 10 ký tự), `doneSignals` 2–3; không ô nào rỗng hay chỉ chép lại tên module — test.
- [ ] Mỗi hướng: `rubric` ≥ 4, mọi `id` duy nhất toàn cục và đúng tiền tố chặng, mọi
      `howToProve` ≥ 20 ký tự — test.
- [ ] `specBrief` đủ 6 ô, `scopeDont` ≥ 2, mỗi ô ≥ 2 mục — test.
- [ ] **Chống copy-paste giữa các hướng**: không câu `objective`/`rubric.text` nào trùng nguyên
      văn ở hai hướng khác nhau — test.
- [ ] `getSpecStageDetail('khong-co')` và `getSpecStageDetail('web-s9')` trả `undefined`.
- [ ] Trang chặng render đủ: canDo · thời lượng · từng module (4 ô) · dự án + rubric ·
      đặc tả mẫu 6 ô; đánh dấu xong module/rubric hiện % hoàn thành chặng.
- [ ] Tiến độ: đăng nhập → tick 1 module → tải lại trang vẫn còn (đi qua API thật, không chỉ
      localStorage). Đã `completed` thì không bị hạ về `in_progress` (hành vi sẵn có).
- [ ] Endpoint vẫn nhận mọi khoá cũ `p1-u4-l1`, `p1-s1` — test hồi quy.
- [ ] Route mới qua **cả hai cổng a11y** (A/AA 0 vi phạm + AAA cho nội dung) trên 5 theme.
- [ ] Ngân sách bundle không đội: `Initial JS` không tăng quá **+0,5 kB** so với baseline trước
      đợt (dữ liệu chỉ nạp ở route lười) — `npm run budget`.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run budget
npx playwright test e2e/a11y.spec.ts e2e/a11y-aaa.spec.ts
npm run codemap -- impact apps/server/src/api/subjects/programming/progress.ts
```

## ⑤ Bất biến không được phá

| Bất biến                                                          | Test canh                                                   |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| 13 hướng, mỗi hướng đúng 4 chặng S1→S4, id chặng/module không đổi | `packages/subject-programming/specializations.test.ts`      |
| Chi tiết chặng luôn khớp bản đồ (không có moduleId mồ côi)        | `specStageDetails.test.ts` (mới)                            |
| Tra mã lạ trả `undefined`, không đoán bừa                         | `specStageDetails.test.ts` (mới)                            |
| Khoá tiến độ cũ (P1–P6) vẫn hợp lệ sau khi nới regex              | `apps/server/src/api/subjects/programming/progress.test.ts` |
| Không ghi tiến độ cho khoá không tồn tại                          | như trên                                                    |
| A/AA 0 vi phạm + AAA cho nội dung, 5 theme                        | `e2e/a11y.spec.ts`, `e2e/a11y-aaa.spec.ts`                  |
| Ngân sách bundle + sàn coverage (branches ≥ 90%)                  | cổng CI `quality`                                           |

## ⑥ Quy ước dự án liên quan

- Import xuyên gói: `@dhcb/subject-programming/...` **không đuôi `.js`**; import nội bộ gói dùng
  đường tương đối **có** `.js`. `packages/` không import `apps/`.
- Tên file dữ liệu **không được là `index.ts`** (Rollup đặt tên chunk theo file → đội ngân sách
  `Initial JS`).
- Handler API tự kiểm quyền qua `validateAuth()`; validate input bằng Zod `.strict()`.
- Màu lấy từ token `--a-*`/`--z-*`, không ghi cứng; nội dung chữ đạt **AAA (≥ 7:1)**, phần còn
  lại AA; vùng chạm ≥ 44px, mobile-first.
- Nội dung hiển thị bằng **tiếng Việt**; comment tiếng Việt ở chỗ quan trọng.
- Route mới phải đặt SAU/khác route param sẵn có để không nuốt nhau (bài học `/lap-trinh/huong`
  vs `:levelId` ở PR trước).
- Conventional commits; **tạo PR ở trạng thái ready + bật auto-merge (squash) ngay**; nhật ký
  đợt việc là **file mới** trong `docs/changelog/`, không chồng mục vào `PROGRESS.md`.

---

## Thứ tự thi hành (dự kiến 5 commit)

1. `feat`: kiểu + sổ đăng ký + test bất biến (chưa có nội dung → test đỏ có chủ đích, xanh ngay
   khi hướng đầu tiên xong).
2. `feat`: nội dung S2 cho 13 hướng (chia 3 commit nhỏ nếu diff quá lớn).
3. `feat`: trang chặng + route + lối vào.
4. `feat`: tiến độ (nới endpoint + test hồi quy + nối UI).
5. `docs`: changelog + PROGRESS + cập nhật §5.1 đặc tả gốc.

## Nghiệm thu (điền sau khi làm xong — 2026-08-27)

- **Lệnh đã chạy + kết quả thật:** `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) ·
  `npm run build` ✅ · `npx vitest run packages/subject-programming apps/server/src/api/subjects/programming`
  → **996/996 xanh (28 file)** · `npx playwright test e2e/a11y.spec.ts e2e/a11y-aaa.spec.ts -g "web-s2"`
  → **10/10 xanh** (5 theme × 2 cổng) · `npm run budget` → Initial JS 124,78/140 kB, CSS 16,27/18 kB.
- **Tiêu chí ④:** đạt hết. Ngân sách JS tăng 0,43 kB so với baseline 124,35 kB của đợt trước —
  trong hạn +0,5 kB đã đặt; phần tăng là mã trang mới, dữ liệu nội dung nằm ở chunk nạp lười.
- **Bất biến ⑤:** không phá. Khoá tiến độ cũ (`p1-u4-l1`, `p1-s1`) vẫn hợp lệ, có test hồi quy;
  khoá hướng không tồn tại bị chặn 400 và không ghi DB.
- **Còn để ngỏ:** chi tiết S1/S3/S4 (khuôn đã sẵn); bài học 8 bước cho tầng hướng — cố ý không làm,
  lý do ghi ở ô ① và trong nhật ký `docs/changelog/0176-2026-08-27-chang-s2-huong-chuyen-sau.md`.
