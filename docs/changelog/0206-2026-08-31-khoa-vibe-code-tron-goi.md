# 0206 — Khoá "Vibe Code — từ số 0 đến chuyên gia", trọn 4 chương/20 bài (1 PR)

Khoá ngắn thứ BA của môn Lập trình (sau `git`, `hermes`) — đặc tả
`docs/specs/2026-08-31-khoa-vibe-code.md`, làm đúng tiền lệ khoá Hermes nhưng gộp cả
đặc tả + hạ tầng + nội dung 4 chương vào MỘT PR (khác khoá Git/Hermes chia 3–4 PR) vì
phạm vi vừa đủ nhỏ để đi trọn trong một phiên mà vẫn kiểm chứng được từng chương một trước
khi sang chương kế (chạy cổng nội dung sau mỗi chương, không dồn hết cuối cùng mới test).

## Đã làm

- **Đặc tả** `docs/specs/2026-08-31-khoa-vibe-code.md` — nghiên cứu "vibe coding" (thuật
  ngữ Karpathy 2/2025), phân biệt mức ngây thơ vs kỷ luật, đối tượng, đề cương chi tiết
  20 bài (§③b) làm hợp đồng thi hành cho từng bài.
- **`packages/subject-programming/vibeSim.ts`** — bộ mô phỏng TÁC TỬ AI VIẾT CODE tất định
  tuyệt đối, khuôn `gitSim`/`hermesSim`: máy ảo dựng mới mỗi lượt, in dòng tự khai
  `[GIA LAP]` đầu mọi lượt. Bộ lệnh đóng: `vibe` (bảng trạng thái) · `mota "…"` ·
  `kehoach "…"` · `xemdiff <id>` · `giaithich <id>` · `nhan <id>` · `sua <id> "…"` ·
  `kiemtra` · `luu "…"` · `lichsu` · `quaylai` · `trienkhai`.
- **4 luật sư phạm nạp thẳng vào máy**: ① mô tả mơ hồ (< 25 ký tự bỏ dấu) → agent hỏi lại
  3 câu, không xây; ② `nhan` khi chưa `xemdiff` → từ chối, `sua` xoá cờ đã-xem; ③ `trienkhai`
  đòi test đang "xanh" (đã kiểm SAU lần `nhan` cuối); ④ secret dạng khoá API/mật khẩu trong
  mô tả → từ chối thẳng. Cộng cơ chế CA BIÊN: bản nháp không nhắc từ khoá ca biên (rỗng/số
  0/âm/quá dài/giới hạn/lỗi) thì `kiemtra` báo đỏ đích danh — mô phỏng đúng thói quen AI
  ngoài đời hay quên ca biên khi mô tả không nhắc.
- **`vibeSim.test.ts`** — 21 ca: tự khai, bộ lệnh đóng, cả 4 luật (dương + âm mỗi luật), cơ
  chế ca biên, mốc/hoàn tác, tất định 2 lượt, `lenhChuanBi`.
- **Ngôn ngữ bài học `'vibe'`** nối trọn đường: `LESSON_LANGUAGES` + nới regex `id`/`unitId`
  (`lessonTypes.ts`) · nới regex `lessonId` ở `feedback.ts` + `progress.ts` (chỉ NỚI) ·
  `vibeRunner.ts` (khuôn `hermesRunner.ts`, không worker) · `codeRunner.ts`
  (`laBaiDongLenh` nhận `vibe`) · `LangBadge` (nhãn "Tác tử AI code · mô phỏng") ·
  `ShortCourseId` thêm `'vibe'`.
- **Khoá `vibe` đủ 4 chương / 20 bài** (`lessons/vibeu1..4.ts`, unit ảo `vibe-u1..4`,
  `courses/vibe.ts`), bám đúng đề cương §③b:
  - **C1 Tư duy & vòng lặp** (6 bài): vibe code là gì · mô tả đủ ba vế (mơ hồ thì hỏi lại) ·
    kế hoạch trước code sau (`kehoach`) · xem diff trước khi nhận · nhận & yêu cầu sửa ·
    hỏi cho hiểu (`giaithich`).
  - **C2 Lưới an toàn** (5 bài): `kiemtra` là trọng tài · ca biên (AI hay quên) · secret
    không vào mô tả · `luu`/`lichsu` mốc trước thay đổi lớn · `quaylai` hoàn tác không sợ.
  - **C3 Từ bản nháp đến sản phẩm** (4 bài): `trienkhai` chỉ mở khi test xanh · chuỗi đầy đủ
    trọn vòng đời · sửa lỗi trên sản phẩm đang chạy · tính năng lớn = nhiều mô tả nhỏ.
  - **C4 Bậc chuyên gia** (5 bài): đặc tả có mục "KHÔNG làm" · tiêu chí chấp nhận đo được
    trước khi mô tả · mỗi tính năng một mốc (phản xạ) · vùng KHÔNG được vibe code (thanh
    toán/bảo mật/dữ liệu thật/khó hoàn tác) · tổng kết checklist 7 điều (capstone 2 tính
    năng, 1 cái cố ý thiếu ca biên phải tự cứu).
  - Mỗi bài đủ 8 bước + 3 thẻ SRS; phần LÀM THẬT (Claude Code/Cursor/Lovable/v0…) ở
    homework kèm checklist tự kiểm, không chấm.
- **`lessonsVibe.test.ts`** — cổng chấm nội dung khuôn `lessonsHermes.test.ts`: đúng 20 bài,
  sampleSolution đạt 100% test-case, starter không tự đạt bài, cấm lệnh ngoài bộ mô phỏng
  (`docker|curl|git|npm|pip|bash|sh|cursor|claude|npx|yarn`) trong code chạy, tất định 2
  lượt. **E2E** thêm 3 ca vào `e2e/programming-course.spec.ts`: vào thẳng
  `/lap-trinh/khoa-hoc/vibe` học được ngay, bấm bài dẫn đúng `vibe-u1-l1`, lối vào từ trang
  môn — chạy thật trên Chromium, cả 10 ca (Git+Hermes+Vibe) xanh.

## KHÔNG làm ở PR này

- Không gọi AI thật, không mạng, không chạy code thật khi chấm.
- Không đổi khuôn bài 8 bước, không đổi `grading.ts`, không thêm bảng DB.
- Không đụng khoá `git`/`hermes` (không sửa file của hai khoá đó ngoài `registry.ts`).
- Không thêm trang khoá `vibe` vào danh sách quét a11y 15 trang × 5 theme — theo đúng tiền
  lệ khoá Hermes, chỉ `git` đại diện cho khuôn trang `/lap-trinh/khoa-hoc/:courseId`.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm run format` ✅ ·
  `npm test` ✅ **8449/8449 (509 file)** — gồm 21 ca `vibeSim.test.ts`, 101 ca
  `lessonsVibe.test.ts` (20 bài × 5 ca + tổng), `courses.test.ts`/`lessons.test.ts`/
  `srsCards.test.ts` tự phủ dữ liệu mới, `LangBadge.test.tsx` cập nhật danh sách mô phỏng ·
  `npm run build` (client + server + hub) ✅.
- E2E thật trên trình duyệt: `npx playwright test e2e/programming-course.spec.ts
--project=chromium` ✅ **10/10** (3 ca mới của khoá Vibe Code, chạy thật không mock DOM).
- Soạn từng chương, chạy cổng nội dung của CHƯƠNG ĐÓ trước khi sang chương kế (bắt lỗi từ
  khoá "rong"/"khong co" trong mô tả không khớp regex ca-biên ngay khi viết, không dồn tới
  cuối mới phát hiện).

## Việc tiếp theo

Không có — khoá đã đủ 20/20 bài, mọi cổng xanh. Theo dõi phản hồi người học thật sau khi
merge để biết bài nào cần tinh chỉnh độ khó.
