# Nghiên cứu & Thiết kế: Bài kiểm tra cuối cấp (End-of-level Assessment)

> Ngày: 2026-07-07 · Trạng thái: **ĐÃ TRIỂN KHAI** (quyết định người dùng: CHẶN lên cấp ·
> đề đầy đủ 4 phần · ngưỡng ≥70%). Code: `src/lib/cefrExam.ts`,
> `src/components/CefrExam.tsx`, migration `0009` — xem PROGRESS.md.
> Nhánh: `claude/end-of-level-assessments-r9p54c`
> Mục tiêu: mỗi cấp CEFR (A1→C2) có **1 bài thi cuối cấp chất lượng cao**; **đạt ≥70% mới "qua"
> cấp** và mở khóa cấp tiếp theo. Bài thi kiểm tra tổng hợp (từ vựng + ngữ pháp + nghe + đọc)
> chứ không chỉ nhận biết 1 chiều như quiz hiện tại.

---

## 1. Tóm tắt cho người bận (TL;DR)

Hiện tại **không có bài thi thật**: cấp sau tự mở khóa khi cấp trước đạt "≥70% từ vựng + 100%
ngữ pháp (tự bấm _Đã học xong_)". Nghĩa là học viên có thể lật thẻ cho đủ % và bấm "đã học" mà
**chưa từng chứng minh** mình dùng được kiến thức. Tab "Kiểm tra" hiện có chỉ là quiz luyện tập
nhẹ (10 câu, làm lại vô hạn, không chặn tiến độ).

**Đề xuất:** thêm **Bài thi cuối cấp** — điều kiện thật để "qua" một cấp:

1. **Điều kiện dự thi** (đã học đủ): giữ ngưỡng cũ — cấp này đạt ≥70% từ vựng **và** 100% ngữ pháp.
   Đạt rồi thì **mở nút "Thi cuối cấp"** thay vì tự động mở khóa cấp sau.
2. **Đề tổng hợp, xáo trộn mỗi lần thi**: 20–25 câu, gồm 4 phần — Từ vựng (2 chiều), Ngữ pháp,
   Nghe (TTS), Đọc hiểu (hội thoại). Rút ngẫu nhiên từ kho lớn nên **không học vẹt đáp án** được.
3. **Đạt ≥70% tổng điểm → "Qua cấp"**: mở khóa cấp tiếp theo + cấp **chứng nhận** (huy hiệu/điểm).
4. **Thi lại không giới hạn**, nhưng mỗi lần là **đề mới** + xem lại câu sai + link mở lại bài.
5. **Lưu kết quả lên Supabase** (điểm cao nhất, số lần thi, đã qua chưa) — đồng bộ đổi máy.

Làm theo **3 đợt nhỏ** (mỗi đợt 1 PR): ① dữ liệu + logic + migration, ② luồng thi + màn chứng
nhận, ③ nối mở khóa + huy hiệu ở trang tổng quan/tiến độ.

---

## 2. Hiện trạng (đọc từ mã nguồn)

### 2.1 Luật mở khóa hiện tại — `src/lib/cefrProgress.ts`

```
computeLockedMap(): A1 luôn mở; cấp sau bị khóa tới khi cấp TRƯỚC đạt ĐỦ CẢ HAI:
  • ≥70% từ vựng  (UNLOCK_PCT = 0.7)
  • 100% ngữ pháp (mọi bài đã bấm "Đã học xong" — không kiểm tra gì)
computeLockedMapPersisted(): "grandfather" — cấp đã từng mở thì không khóa lại
  (et_cefr_unlocked_*, đồng bộ Supabase — migration 0008).
```

→ Điểm yếu: "100% ngữ pháp" chỉ cần **bấm nút**, không chứng minh hiểu; "≥70% từ vựng" chỉ cần
**bấm Đã thuộc**. Không có bước tổng hợp/vận dụng.

### 2.2 Tab "Kiểm tra" hiện có — `src/components/StudyTabs.tsx > QuizTab`

- 10 câu: `QUIZ_SIZE=10`, tối đa `GRAMMAR_QUIZ_COUNT=3` câu ngữ pháp (chỉ lấy từ bài đã "học xong")
  - còn lại là từ vựng **1 chiều EN→VI**, 4 lựa chọn.
- Không lưu kết quả, làm lại vô hạn; đạt ≥90% (`QUIZ_PASS_THRESHOLD_PCT`) chỉ để **mở thêm từ mới
  trong ngày**, không liên quan lên cấp.
- → Đây là **luyện tập**, không phải **thi cuối cấp**. Bài thi mới sẽ nằm RIÊNG, không đụng tab này.

### 2.3 Kho dữ liệu tận dụng được để dựng đề

| Nguồn                  | Hàm/tệp                                            | Dùng cho phần             |
| ---------------------- | -------------------------------------------------- | ------------------------- |
| Từ vựng theo cấp       | `getLevelWords(levelId)` — `lib/curriculum.ts`     | Từ vựng (EN→VI, VI→EN)    |
| Quiz từng bài ngữ pháp | `GrammarLesson.quiz[]` — `data/cefr.ts`            | Ngữ pháp (điền chỗ trống) |
| Ví dụ có audio         | `DictEntry.ex_en/ex_vi`, `KaraokeText`, `/api/tts` | Nghe                      |
| Hội thoại mẫu          | `data/dialogues.ts`, `dialoguesLoader`             | Đọc hiểu                  |

Mỗi cấp có **hàng trăm từ** + **hàng chục** câu quiz ngữ pháp → kho đủ lớn để rút ngẫu nhiên
mà không trùng lặp giữa các lần thi.

---

## 3. Thiết kế đề xuất

### 3.1 Vòng đời "qua cấp"

```
Học nội dung cấp X ─▶ đạt ≥70% từ vựng & 100% ngữ pháp (điều kiện DỰ THI)
      │
      ▼
  Nút "Thi cuối cấp X" bật sáng ─▶ Làm bài thi (đề xáo trộn)
      │
      ├─ < 70%  ─▶ Xem câu sai + mở lại bài ─▶ Thi lại (đề mới)
      └─ ≥ 70%  ─▶ "QUA CẤP X" 🎓 ─▶ mở khóa cấp X+1 + chứng nhận + lưu điểm cao nhất
```

**Khác biệt cốt lõi so với hiện tại:** điều kiện ≥70% từ vựng + 100% ngữ pháp **không còn tự mở
khóa** cấp sau — nó chỉ **mở nút dự thi**. Cấp sau mở khóa **chỉ khi thi đạt**. Người dùng đã mở
khóa từ trước (grandfather qua `et_cefr_unlocked_*`) **không bị khóa lại** — xem mục 3.6.

### 3.2 Cấu trúc đề (chất lượng cao = đa kỹ năng)

Tổng **~24 câu**, 4 phần, mỗi câu 1 điểm, đạt khi **tổng ≥ 70%** (≥ 17/24):

| Phần       | Số câu | Dạng                                                  | Nguồn                                |
| ---------- | ------ | ----------------------------------------------------- | ------------------------------------ |
| ① Từ vựng  | 8      | Trắc nghiệm 4 đáp án, **trộn 2 chiều** EN→VI và VI→EN | `getLevelWords`, ưu tiên từ đã học   |
| ② Ngữ pháp | 8      | Điền chỗ trống 4 đáp án                               | `GrammarLesson.quiz` các bài của cấp |
| ③ Nghe     | 4      | Nghe audio (từ/câu) → chọn nghĩa/từ đúng              | TTS ví dụ của từ trong cấp           |
| ④ Đọc hiểu | 4      | Đọc 1 hội thoại → trả lời câu hỏi                     | `dialogues` của cấp                  |

- **Xáo trộn**: thứ tự câu + thứ tự đáp án ngẫu nhiên mỗi lần; kho rút > số câu nên mỗi lần thi
  đề khác nhau (chống học vẹt).
- **Phương án nhiễu chất lượng**: đáp án sai lấy từ nghĩa/từ **cùng cấp** (giống dạng hiện có ở
  `buildQuiz`) để nhiễu hợp lý, không lộ liễu.
- Câu ①② tái dùng logic sẵn (`buildQuiz`/`buildMiniQuiz`); ③④ là phần **mới** (xem đợt 2).

> **Phương án gọn hơn (nếu muốn ra nhanh)**: v1 chỉ 2 phần **Từ vựng + Ngữ pháp** (16 câu),
> thêm Nghe + Đọc ở đợt sau. Đề xuất chốt phạm vi ở mục "Cần quyết định".

### 3.3 Ngưỡng đạt

- `EXAM_PASS_PCT = 0.70` — **đạt khi ≥ 70%** (đồng bộ với `UNLOCK_PCT` sẵn có). Yêu cầu người dùng
  ghi ">70%"; đề xuất dùng **≥70%** cho nhất quán toàn app (mốc tròn, 17/24). Nếu muốn **>70%
  nghiêm ngặt** (tức ≥ 71%, phải 18/24) thì đổi 1 hằng số — nêu ở "Cần quyết định".
- (Tùy chọn nâng cao, chưa làm v1) _sàn từng phần_: không phần nào < 50% — tránh "gánh điểm" 1 kỹ năng.

### 3.4 Thi lại

- **Không giới hạn số lần**, không thời gian chờ (giữ tinh thần khích lệ, không phạt).
- Mỗi lần **đề mới** rút lại từ kho.
- Trượt → hiện danh sách **câu sai** + với câu ngữ pháp có nút **"Mở lại bài"** (tái dùng
  `onOpenLesson` như `QuizTab`).
- (Tùy chọn) giới hạn thời gian 15–20 phút cho cảm giác "thi thật" — mặc định **tắt** ở v1.

### 3.5 Lưu trữ & đồng bộ

Thêm cột **`cefr_exams jsonb default '{}'`** vào `learning_progress` (migration **0009**), map
`levelId → { passed, bestPct, attempts, lastAt }`:

```jsonc
{ "A1": { "passed": true, "bestPct": 83, "attempts": 2, "lastAt": "2026-07-07T…" } }
```

- Lib mới `src/lib/cefrExam.ts`: `getExamResult(uid, levelId)`, `saveExamAttempt(uid, levelId, pct)`
  (giữ `bestPct` lớn hơn, `passed = passed || pct≥ngưỡng`, tăng `attempts`), `isExamPassed(...)`.
- `progressSync.ts`: thêm `cefr_exams` vào push/pull; **merge = giữ bestPct cao hơn, passed = OR,
  attempts = max** (dữ liệu chỉ "tốt lên", giống learned/hard).
- localStorage key `et_cefr_exams_<uid>` (đệm đọc nhanh + offline) — cùng mẫu `cefrProgress.ts`.

### 3.6 Nối vào luật mở khóa — `cefrProgress.ts`

- `computeLockedMap`: cấp sau khóa tới khi **thi cấp trước ĐẠT** (`isExamPassed(prev)`), thay cho
  "≥70% từ vựng + 100% ngữ pháp". Điều kiện cũ chuyển thành **điều kiện DỰ THI** của chính cấp đó.
- **Grandfather (bắt buộc, tránh hồi tố):** người đã mở khóa cấp trước tính năng này ra mắt vẫn giữ
  nguyên nhờ `et_cefr_unlocked_*`. Khi tính `computeLockedMapPersisted`, cấp `everUnlocked` **luôn
  mở** dù chưa thi → **không ai bị khóa lại**. Bài thi khi đó là **tùy chọn để lấy chứng nhận**.
- Rủi ro cần chú ý: đừng để logic mới khóa lại cấp người đang học dở → phải test kỹ ca "đã unlock
  bằng luật cũ" (viết ≥1 test ca biên, theo KHUNG mục 9).

### 3.7 Giao diện (UI)

- **Không thêm tab thứ 6** (5 tab đã chật trên mobile). Thay vào đó, trên trang cấp
  (`CefrLevelPage.tsx`) thêm **thẻ CTA nổi bật** khi đủ điều kiện dự thi:
  _"🎓 Bạn đã sẵn sàng — Thi cuối cấp A1"_ (nếu chưa đạt điều kiện thì hiện tiến độ còn thiếu).
- **Màn thi riêng** (full-screen, 1 câu/màn, thanh tiến độ) — component mới `CefrExam.tsx`
  (dựng lại từ khung `QuizTab`, thêm phần Nghe/Đọc).
- **Màn kết quả**: đạt → chứng nhận 🎓 + điểm; trượt → câu sai + mở lại bài + "Thi lại".
- **Huy hiệu** ở `/learning-path` (RoadmapTab) và `/progress` (Dashboard): cấp nào đã "Qua" hiện
  ✓/🎓 + điểm cao nhất.

### 3.8 Đa chiều A/B & i18n

Giữ quy ước `isA` sẵn có: chiều A giải thích tiếng Việt, chiều B tiếng Anh. Mọi chuỗi có 2 bản
như các component hiện tại.

---

## 4. Kế hoạch triển khai (3 đợt — mỗi đợt 1 PR nhỏ, kiểm tra được)

| Đợt   | Nội dung                                                                                                                   | Tệp chính                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **1** | Migration 0009 `cefr_exams` · `lib/cefrExam.ts` · nối `progressSync` · bộ dựng đề `buildExam()` + chấm điểm + test ca biên | `supabase/migrations/0009_*.sql`, `src/lib/cefrExam.ts`, `src/lib/progressSync.ts` |
| **2** | Màn thi `CefrExam.tsx` (4 phần) + màn chứng nhận + thẻ CTA trên trang cấp                                                  | `src/components/CefrExam.tsx`, `src/pages/CefrLevelPage.tsx`                       |
| **3** | Nối mở khóa (`computeLockedMap`) + grandfather + huy hiệu ở RoadmapTab/Dashboard                                           | `src/lib/cefrProgress.ts`, `RoadmapTab.tsx`, `Dashboard.tsx`                       |

Mỗi đợt qua đủ **cổng commit** (build · typecheck · lint 0 cảnh báo · test · format) theo CLAUDE.md.
Migration 0009 **chạy trên Supabase production TRƯỚC khi deploy** đợt 1 (giống lưu ý 0007).

---

## 5. Cần người dùng quyết định (trước khi code)

1. **Bài thi có CHẶN lên cấp không?**
   - (A — khuyến nghị) Chặn: chưa thi đạt ≥70% thì cấp sau còn khóa (người cũ đã mở vẫn giữ).
   - (B) Không chặn: chỉ là **chứng nhận** tùy chọn, giữ luật mở khóa cũ.
2. **Phạm vi đề v1:**
   - (A — khuyến nghị) Đầy đủ 4 phần: Từ vựng + Ngữ pháp + Nghe + Đọc (~24 câu).
   - (B) Gọn: chỉ Từ vựng + Ngữ pháp (~16 câu), bổ sung Nghe/Đọc sau.
3. **Ngưỡng đạt:** ≥70% (nhất quán app) hay **>70% nghiêm ngặt** (≥71%)?

---

## 6. Rủi ro & lưu ý

- **Hồi tố khóa lại**: nguy hiểm nhất — phải grandfather chuẩn (mục 3.6) + test.
- **Kho câu mỏng ở cấp học viên mới**: nếu chưa học đủ từ, đề có thể thiếu câu chất lượng → chặn dự
  thi tới khi đạt điều kiện học (đã có ở 3.1).
- **Chi phí TTS phần Nghe**: dùng cache mã hóa sẵn (`/api/tts`), thi lại dùng lại audio đã cache;
  không phát sinh lượt AI đắt.
- **Không đụng tab "Kiểm tra" luyện tập** hiện có — bài thi là luồng riêng.
