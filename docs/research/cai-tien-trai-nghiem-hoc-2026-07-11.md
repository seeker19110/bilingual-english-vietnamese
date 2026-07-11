# Audit & đặc tả: Trải nghiệm học tự nhiên, lôi cuốn (lớp cảm xúc — engagement)

> Ngày: 2026-07-11 · Trạng thái: **ĐỀ XUẤT + ĐẶC TẢ CHI TIẾT — chờ người dùng duyệt trước khi code**
> Phương pháp: lái app THẬT bằng Playwright khổ mobile 375×812 (14 ảnh chụp: luồng học trọn 1 batch
> 10 từ từ thẻ đầu → màn hoàn thành, trang chủ mới/có tiến độ, lộ trình, trang cấp A1, Tiến độ,
> Sổ lỗi, bài ngữ pháp) + đọc mã nguồn xác nhận từng phát hiện. Không suy đoán.
>
> **Ranh giới với 2 tài liệu trước** (tránh trùng):
>
> - `cai-tien-ui-ux.md` (2026-07-04) = lớp **cơ học** (điều hướng, vùng chạm, layout) — ĐÃ triển khai hết U-1→U-5.
> - `danh-gia-tien-trien-hoc-2026-07-07.md` = lớp **sư phạm** (nội dung học gì, ôn gì) — A xong, B–H chờ.
> - Tài liệu này = lớp **cảm xúc** (cảm giác khi học: phản hồi, thành tựu, động lực quay lại) — chưa từng audit.

---

## 1. Tóm tắt cho người bận (TL;DR)

App đã có nền **cơ học tốt** (bottom-nav, thẻ Học tiếp, SRS, streak + vé nghỉ, mốc từ vựng
1k→8k, màn xong-batch ráp câu từ từ vừa học) và nền **sư phạm tốt**. Nhưng lớp **cảm xúc gần
như trống**: mọi khoảnh khắc đáng ăn mừng đều diễn ra **câm lặng**, mọi thao tác học đều
**không có phản hồi xúc giác/chuyển động**. Học 1 batch giống điền form hơn là chơi 1 màn game.

| #      | Phát hiện                                                                                                   | Tác động                                          | Sửa khó/dễ |
| ------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------- |
| **E1** | **Khoảnh khắc thành tựu câm lặng** — xong bài/quiz đạt/lên mốc/tăng streak: chỉ text + icon tĩnh            | 🔴 Mất "đỉnh" cảm xúc mỗi phiên                   | Vừa        |
| **E2** | **Streak thụ động** — tăng streak không ai báo; 0 ngày hiện 💤 (đóng khung tiêu cực với người mới)          | 🔴 Bỏ phí cơ chế giữ chân #1                      | Dễ–Vừa     |
| **E3** | **Thẻ từ & quiz không có "juice"** — lật thẻ swap tức thì, đúng/sai chỉ đổi màu, 0 haptic ngoài Speaking    | 🔴 Cảm giác "điền form"                           | Dễ         |
| **E4** | **Vừa học xong đã "nợ"** — badge Ôn SRS nhảy 10 NGAY khi vừa thuộc 10 từ (`due: Date.now()`)                | 🟡 Giết cảm giác hoàn thành                       | Rất dễ     |
| **E5** | **Mốc từ vựng bị chôn** — hệ "Sống sót 1.000 từ…" có sẵn nhưng đạt mốc không có gì xảy ra; 0 huy hiệu       | 🟡 Bỏ phí hệ thành tựu sẵn có                     | Vừa        |
| **E6** | **Phiên học không có "vòng cung"** — vào thẳng thẻ 1/10 không mở màn; xong bài không có 1 CTA chính         | 🟡 Thiếu nhịp mở–cao trào–đóng                    | Vừa        |
| **E7** | **"Tổng đã thuộc: 0/12245" quay lại** ở tab học trang tổng quan + Từ điển (`StudyPanel` pool toàn lộ trình) | 🟡 Con số gây nản (đã sửa ở trang cấp, sót ở đây) | Dễ         |
| **E8** | **Trang chủ người học cũ ≈ người mới** — thẻ Học tiếp có nhưng lép vế giữa menu 7 card                      | 🟢 Ma sát nhẹ mỗi ngày                            | Vừa        |
| **E9** | **App không có "giọng nói" UI** — TTS là linh hồn sản phẩm nhưng UI câm hoàn toàn (0 âm phản hồi)           | 🟢 Tùy chọn, làm sau                              | Vừa        |

**Ràng buộc cứng phát hiện khi audit:** ngân sách `size-limit` chỉ còn **~1.7 kB** (114.31/116 kB
brotli) → mọi hiệu ứng phải **CSS thuần + mã cực nhẹ**, hoặc tách chunk lazy như `vendor-sentry`.

**Khuyến nghị thứ tự:** V-1 (juice) → V-2 (khoảnh khắc + streak) → V-3 (vòng cung phiên — nên gộp
với đề xuất B của tài liệu sư phạm) → V-4 (mốc + huy hiệu) → V-5 (trang chủ + lộ trình) → V-6 (âm, tùy chọn).

---

## 2. Bằng chứng khảo sát (đã chụp/đọc thật)

- **Luồng học trọn vẹn**: `?tab=today` → thẻ "I /aɪ/" → lật (swap tức thì, không animation —
  `WordCard.tsx:92` render điều kiện `{!flipped ? … : …}`, không có transform 3D) → bấm
  "Đã thuộc" ×10 → màn `BatchDoneView`: icon `<Check>` tĩnh + "Hoàn thành bài hôm nay!" —
  **không animation, không haptic, không nhắc streak, không CTA nổi bật** (`StudyTabs.tsx:241-271`).
- **Haptics**: `src/lib/haptics.ts` có sẵn 4 kiểu rung đặt tên (`tap/success/start/stop`) nhưng
  `grep` toàn repo: **chỉ `Speaking.tsx` dùng**. Thẻ từ, quiz, xong bài, streak: 0 chỗ gọi.
- **Quiz feedback**: đáp án đúng chỉ đổi lớp màu tĩnh `bg-accent-500/20 border-accent-500/60`
  (`StudyTabs.tsx:638,1193`); không scale/shake/haptic. Đạt quiz hiện dòng text "🎉 Đạt ≥90%…".
- **SRS due tức thì**: `addToSRS` đặt `due: Date.now()` (`srs.ts:47`) → ảnh chụp xác nhận badge
  "Ôn SRS ⓾" đỏ rực NGAY sau khi bấm xong "Đã thuộc" từ thứ 10.
- **Streak**: Trang chủ hiện `💤 0 ngày liên tiếp` cho người mới (`Home.tsx:311`); không màn nào
  báo "streak +1" khi hoàn thành ngày học; Dashboard chỉ hiện con số.
- **Mốc từ vựng**: `VocabMilestone.tsx` có 4 mốc đặt tên (1.000 "Sống sót" → 8.000) chỉ hiển thị
  dạng thanh ngang ở `/learning-path` + Từ điển; không sự kiện gì khi CHẠM mốc.
- **0/12245**: `StudyPanel.tsx` (dùng ở `/learning-path` + `/dictionary`) cố ý dùng pool
  `getLearningPath()` toàn lộ trình → tab Hôm nay ở đó hiện "Tổng đã thuộc: 0/12245".
- **Animation toàn app**: chỉ có `animate-fade-in` (grep `StudyTabs.tsx`: 15 chỗ đều là fade-in).
  `prefers-reduced-motion` đã xử lý toàn cục (`index.css`) — nền tốt để thêm chuyển động an toàn.
- **Âm thanh UI**: 0 (không có `Audio`/chime nào ngoài TTS).

### Những gì ĐÃ TỐT — giữ nguyên, chỉ xây thêm lên

Thẻ Học tiếp (Home + trang cấp) · bottom-nav · badge SRS/Từ khó · streak + vé nghỉ tuần ·
mốc từ vựng đặt tên · `BatchDoneView` ráp câu + hội thoại từ chính từ vừa học (điểm sáng sư phạm
hiếm app có) · mini-quiz sai → ôn lại đúng từ sai · thi cuối cấp có màn chứng nhận · Sổ lỗi ·
4 theme AA · karaoke TTS khắp nơi · `haptics.ts` + `animate-fade-in` + `prefers-reduced-motion`
là nền hạ tầng sẵn để làm lớp cảm xúc mà không phá gì.

---

## 3. Nguyên tắc thiết kế cho lớp cảm xúc (áp cho MỌI đề xuất dưới)

1. **Trung thực** — chỉ ăn mừng thành tựu THẬT (từ đã thuộc, streak thật, mốc thật). Không XP ảo,
   không tiền tệ game, không dark pattern. Phù hợp định vị "gia sư" chứ không phải game.
2. **Đỉnh–kết (peak-end rule)** — mỗi phiên học cần 1 "đỉnh" cảm xúc (khoảnh khắc ăn mừng) và
   1 "kết" rõ ràng (CTA kế tiếp / hẹn mai). Người ta nhớ phiên học qua đỉnh và kết, không qua trung bình.
3. **Nhẹ và tôn trọng** — mọi chuyển động ≤ 600ms, tự tắt theo `prefers-reduced-motion` (đã có
   global), haptic ≤ 40ms, âm (nếu làm) mặc định theo quyết định người dùng + toggle trong Hồ sơ.
4. **Không đổi engine học** — SRS/curriculum/quiz logic giữ nguyên 100% (trừ E4 chỉ dời `due`).
   Lớp cảm xúc là lớp TRÌNH BÀY.
5. **Ngân sách bundle** — mọi mã mới trong initial bundle ≤ ~1 kB; hiệu ứng nặng hơn tách chunk
   `import()` động (mẫu `vendor-sentry` đã có). Nếu buộc phải nới `size-limit`, nêu rõ xin duyệt.
6. **Token theme** — chỉ dùng biến `--a-*`/màu ngữ nghĩa sẵn có; AA ở cả 4 theme (gate a11y 63 test
   phải xanh nguyên).

---

## 4. Đặc tả chi tiết từng đề xuất

### V-1 — "Juice" thao tác học: lật thẻ, đúng/sai, haptic (E3) 🔴 — làm ĐẦU TIÊN

**Mục tiêu:** mỗi thao tác trong luồng học có phản hồi xúc giác + thị giác < 300ms. Không thêm UI mới.

**1a. Lật thẻ 3D** — `WordCard.tsx` (và `Flashcard.tsx` nếu cùng mẫu):

- Bọc mặt trước/sau trong container `[perspective:1000px]`; thẻ trong `transition-transform
duration-300 [transform-style:preserve-3d]` + `[transform:rotateY(180deg)]` khi `flipped`;
  2 mặt `[backface-visibility:hidden]`. Tailwind 3 arbitrary values — không cần plugin.
- Giữ nguyên state/logic; chỉ đổi cấu trúc JSX render 2 mặt đồng thời thay vì render điều kiện.
  ⚠️ Chiều cao: mặt sau dài hơn mặt trước (2 ví dụ) → container lấy `max()` chiều cao 2 mặt
  (đo bằng grid overlay: 2 mặt cùng ô `grid-area:1/1`).
- Reduced-motion: global CSS đã ép `transition:none` → tự thành swap tức thì như cũ. Không cần code thêm.
- Gọi `haptics.tap()` khi lật.

**1b. Chuyển thẻ khi bấm "Đã thuộc"/"Để sau":**

- Thẻ hiện tại trượt ra (translateX ±40px + fade 200ms), thẻ mới fade-in (đã có `animate-fade-in`).
  Cách rẻ: đổi `key` của khối thẻ theo `word` + thêm class animation `animate-card-in` (keyframe mới
  ~4 dòng CSS trong `index.css`).
- "Đã thuộc" → `haptics.success()`; "Để sau" → `haptics.tap()`.
- Progress "Từ 3/10": số bước nhảy có `transition` scale nhẹ (pop 1.15→1, 150ms) + thanh progress
  `transition-[width] duration-300` (hiện đang nhảy giật).

**1c. Quiz đúng/sai** — `StudyTabs.tsx` (2 chỗ: mini-quiz `638` + tab Kiểm tra `1193`):

- Đúng: nút đáp án đúng thêm `animate-pop-correct` (scale 1→1.06→1 + flash nền accent, 250ms)
  - `haptics.success()`.
- Sai: nút đã chọn thêm `animate-shake` (translateX ±4px ×3, 300ms) + `vibrate(60)`; đáp án đúng
  vẫn sáng như hiện tại.
- 2 keyframe mới dùng chung trong `index.css` (`@keyframes pop-correct`, `@keyframes shake`) —
  ước ~10 dòng CSS, ~0 JS.

**File đụng:** `WordCard.tsx`, `Flashcard.tsx`, `StudyTabs.tsx`, `CefrLessonViews.tsx` (VocabFlash
dùng chung WordCard thì hưởng luôn), `index.css`. **Không đổi logic/dữ liệu.**

**Kiểm tra:** E2E hiện có phải xanh nguyên (đặc biệt gate a11y — animation đã bị tắt khi quét
nên không ảnh hưởng); lái tay bằng Playwright xác nhận lật/trượt/shake chạy + reduced-motion tắt hết.
**Ước lượng bundle:** +~0.3 kB (CSS + vài class) — trong ngân sách.

---

### V-2 — Hệ "Khoảnh khắc" + streak chủ động (E1, E2, E4) 🔴

**Mục tiêu:** mỗi ngày học có đúng 1 đỉnh cảm xúc; streak thành vòng lặp có chủ đích:
mở app thấy "hôm nay chưa giữ streak" → học xong thấy "🔥 +1".

**2a. Component `Celebration.tsx` (mới, dùng chung):**

```
type CelebrationKind = 'streak' | 'daily-goal' | 'quiz-pass' | 'milestone' | 'exam-pass'
<Celebration kind={...} title="🔥 Streak 6 ngày!" subtitle="..." onDone={...}>{extraContent}</Celebration>
```

- Overlay toàn màn (như màn thi `CefrExam` đã làm): icon lớn scale-in bằng spring CSS
  (`@keyframes celebrate-in`: scale 0.5→1.08→1, 400ms), tiêu đề + phụ đề, nội dung con (vd hàng
  chấm tuần), 1 nút chính + tối đa 1 nút phụ.
- **Confetti CSS thuần, lazy**: module `src/lib/confetti.ts` tách chunk `import()` động
  (theo mẫu `vendor-sentry` trong `vite.config.ts` `manualChunks`) — ~30 hạt `<span>` absolute,
  keyframe rơi + xoay 1.2s, tự remove. Không thêm dependency. Reduced-motion → bỏ qua hoàn toàn.
- `haptics.success()` khi mở. `aria-live="polite"` cho tiêu đề (screen reader đọc 1 lần).
- Số đếm (vd "10 từ") chạy count-up 400ms bằng `requestAnimationFrame` (hàm ~10 dòng, chung).

**2b. Khoảnh khắc STREAK (đỉnh của ngày):**

- Điều kiện bắn: sau khi `BatchDoneView` xuất hiện VÀ hôm nay là lần ĐẦU đạt hoạt động
  (streak vừa nối dài so với hôm qua). Logic mới `shouldCelebrateStreak(uid): boolean` trong
  `lib/storage.ts` cạnh `getStreak()` — so `et_streak_celebrated_<uid>` (ngày VN cuối đã ăn mừng,
  dùng `vnDateStr()`) với hôm nay; bắn xong ghi lại → **mỗi ngày đúng 1 lần**, idempotent, có unit test.
- Nội dung: "🔥 Streak N ngày!" + hàng 7 chấm thứ-trong-tuần (chấm hôm nay pulse) + phụ đề động
  viên ngắn theo mốc (3/7/14/30/100 ngày có câu riêng). Nút chính: "Tiếp tục" → về BatchDoneView.
- Với người dùng đang có vé-nghỉ-bắc-cầu: KHÔNG nói dối "học liên tục", phụ đề đổi thành
  "Vé nghỉ đã cứu chuỗi của bạn 💪" (đọc được từ `et_streak_freeze_*` sẵn có).

**2c. Trang chủ — trạng thái streak chủ động (thay 💤):**

- Ô streak (`Home.tsx:306-320`) có 3 trạng thái thay vì 2:
  - Chưa học hôm nay + streak > 0: vòng viền cam nhấp nháy chậm + "Giữ chuỗi hôm nay!" (thay vì chỉ 🔥 N).
  - Đã học hôm nay: 🔥 N + dấu ✓ nhỏ ("Đã giữ hôm nay").
  - Streak 0 (người mới/đứt): đổi 💤 → 🌱 "Bắt đầu chuỗi hôm nay" (đóng khung mời gọi thay vì trống rỗng).
- Dữ liệu đều có sẵn (`getStreak` + `getDailyLearned`), chỉ đổi trình bày.

**2d. Sửa E4 — "vừa xong đã nợ":**

- `addToSRS`: `due: Date.now() + 4h` (hằng số `NEW_CARD_DELAY_MS`, comment giải thích: ôn lại
  CÙNG NGÀY buổi tối tốt hơn ôn NGAY LẬP TỨC — spacing ngắn đầu tiên vẫn giữ).
  Badge/getDueWords giữ nguyên logic — tự hết đếm từ vừa học trong 4h.
- ⚠️ Không đụng thẻ SRS cũ đang lưu (chỉ ảnh hưởng thẻ tạo mới); không cần migration.
  Sửa 1 dòng + cập nhật test `srs.test.ts`.

**File đụng:** mới `src/components/Celebration.tsx`, `src/lib/confetti.ts` (chunk lazy),
sửa `StudyTabs.tsx` (bắn streak-moment trước BatchDoneView), `lib/storage.ts` (+`shouldCelebrateStreak`

- test), `Home.tsx` (3 trạng thái ô streak), `lib/srs.ts` (1 dòng + test), `vite.config.ts`
  (manualChunk confetti), `index.css` (keyframes).
  **Ước lượng bundle:** Celebration ~0.8 kB trong bundle trang học (không phải initial — StudyTabs đã
  lazy theo route); confetti 0 kB initial (chunk riêng). Initial +~0.2 kB (Home). Trong ngân sách.

---

### V-3 — Vòng cung phiên học: mở màn → đỉnh → kết có CTA (E6) 🟡

**Mục tiêu:** phiên học có nhịp: biết mình sắp làm gì (10 giây) → học → ăn mừng → MỘT hành động kế tiếp.

**3a. Màn mở (chỉ 1 thẻ mỏng, không chặn):** đầu tab Hôm nay khi CHƯA học từ nào trong lượt:
thẻ nhỏ trên thẻ từ đầu tiên: "Lượt này: **10 từ mới** · vòng 👋 Đại từ & lời chào · ~5 phút" +
nếu có SRS đến hạn: "+ 12 thẻ ôn đang chờ sau đó". Bấm thẻ từ là bắt đầu — không thêm bước bấm.

**3b. Sắp lại màn kết (`BatchDoneView`) theo thứ tự cảm xúc:**

1. (Khoảnh khắc streak/goal — từ V-2, chỉ ngày đầu tiên đạt)
2. Khối tổng kết ngắn (giữ nội dung hiện tại, thêm count-up)
3. Câu + hội thoại từ từ vừa học (giữ nguyên — điểm mạnh)
4. **MỘT nút chính to**: ưu tiên theo ngữ cảnh:
   - còn lượt trong ngày → "Học tiếp 10 từ nữa" (quiz mở batch giữ nguyên luật);
   - hết mục tiêu ngày → "🎉 Hẹn mai nhé — mai chuỗi thành N+1" + nút phụ "Ôn SRS (n thẻ)".
   - **Nếu đề xuất B (sư phạm) được duyệt:** nút chính trở thành **"Luyện ngay 10 từ này bằng hội
     thoại"** → mở Chat/Nói kèm `targetWords` — 2 kế hoạch khớp nhau tự nhiên, nên làm cùng đợt.
5. Copy hiện tại "Còn 90 từ có thể học hôm nay — kiểm tra để mở thêm" viết lại thành hành động rõ:
   "Muốn học thêm? Làm bài kiểm tra ngắn để mở 10 từ tiếp →".

**File đụng:** `StudyTabs.tsx` (TodayLesson + BatchDoneView), i18n key mới. Không đổi logic mở batch.

---

### V-4 — Mốc từ vựng sống dậy + Huy hiệu trung thực (E5) 🟡

**4a. Khoảnh khắc MỐC:** khi `learned` vượt mốc `VocabMilestone` (1.000/3.000/5.000/8.000) hoặc
mốc tròn nhỏ hơn (100/250/500 từ — người mới cần mốc sớm): bắn `Celebration kind='milestone'`
("🏆 1.000 từ — Sống sót! Bạn hiểu ~85% hội thoại cơ bản"). Logic `checkMilestone(before, after)`
thuần + test; gọi tại chỗ duy nhất đánh dấu thuộc từ (`markLearned` trong `lib/vocab.ts` — xác
nhận lại điểm gọi khi code). Ghi `et_milestone_seen_<uid>` chống bắn lặp.

**4b. Khối "Huy hiệu" trên `/progress`:** grid huy hiệu **suy ra từ dữ liệu THẬT có sẵn** —
không thêm bảng, không đồng bộ (đọc tính lại mỗi lần render):

- Chuỗi: 3/7/14/30/100 ngày (max streak từ `et_activity`).
- Từ vựng: 100/250/500/1k/3k/5k/8k.
- Thi cuối cấp đã đạt: huy hiệu mỗi cấp (từ `getExamMap` sẵn có).
- Kỹ năng: lần đầu dùng Chat/Nói/Viết/Sổ lỗi (từ lịch sử phiên sẵn có).
  Huy hiệu chưa đạt hiện mờ + điều kiện — thành "bản đồ mục tiêu" tự nhiên. Component
  `AchievementGrid.tsx` + `lib/achievements.ts` (thuần, unit test đủ ca biên).

**File đụng:** mới `lib/achievements.ts` + `AchievementGrid.tsx`; sửa `Dashboard.tsx`,
`lib/vocab.ts` (điểm gọi checkMilestone), tái dùng `Celebration`. Trang `/progress` lazy theo
route → không ảnh hưởng initial bundle.

---

### V-5 — Trang chủ "hôm nay" + lộ trình bớt bảng số (E7, E8) 🟢

**5a. Sửa E7 (nhanh, có thể gộp vào V-1):** `StudyPanel` truyền cờ `showPathTotal=false` xuống
`TodayLesson` → dòng tổng ở trang tổng quan/Từ điển đổi thành "Đã thuộc hôm nay: n/tốc độ" (con số
hành động được trong ngày) thay vì "0/12245". Trang cấp giữ "của cấp" như U-4 đã sửa.

**5b. Trang chủ module "Hôm nay":** gom thẻ Học tiếp + ô streak (3 trạng thái V-2c) + chip mục tiêu
ngày thành 1 khối "Hôm nay" có nền nhấn; 7 card menu hạ xuống dưới thành "Khám phá" (giữ nguyên
card, chỉ thêm heading + thu gọn mô tả 1 dòng). Người học cũ mở app: 80% màn đầu là "việc hôm nay".

**5c. Lộ trình dạng hành trình (nhẹ):** `RoadmapTab` thêm cột trái: đường kẻ dọc nối 6 nút tròn
A1→C2 (nút cấp hiện tại pulse accent, cấp xong ✓ đầy, cấp khóa ổ khóa) — thị giác "con đường"
mà không đổi cấu trúc thẻ/логic khóa. CSS thuần.

---

### V-6 — Bản sắc âm thanh UI (E9) 🟢 — TÙY CHỌN, cần người dùng quyết

- 3 âm ngắn (<150ms) synth bằng WebAudio (`lib/sound.ts`, ~40 dòng, 0 asset): đúng (2 nốt lên),
  sai (1 nốt trầm ngắn), hoàn thành (chuỗi 3 nốt). Toggle trong Hồ sơ (`et_sound_<uid>`).
- Câu hỏi mặc định BẬT hay TẮT ở mục 6. Không làm nếu người dùng thấy không hợp "gia sư".

---

## 5. Kế hoạch thực hiện (mỗi đợt 1 PR, thứ tự đề xuất)

| Đợt     | Nội dung                                                                 | Phát hiện | Rủi ro                                         | Bundle                  |
| ------- | ------------------------------------------------------------------------ | --------- | ---------------------------------------------- | ----------------------- |
| **V-1** | Juice: lật 3D, trượt thẻ, pop/shake quiz, haptic toàn luồng học          | E3        | Thấp — CSS + vài class, logic nguyên           | +~0.3 kB                |
| **V-2** | `Celebration` + khoảnh khắc streak + 3 trạng thái ô streak + SRS due +4h | E1 E2 E4  | Vừa — component mới, logic 1-lần/ngày cần test | +~1 kB (lazy phần nặng) |
| **V-3** | Vòng cung phiên: màn mở mỏng + sắp lại màn kết + 1 CTA chính             | E6        | Thấp — sắp xếp lại, nên GỘP đề xuất B sư phạm  | ~0                      |
| **V-4** | Khoảnh khắc mốc + Huy hiệu `/progress`                                   | E5        | Thấp — dữ liệu suy ra, không schema mới        | ~0 (route lazy)         |
| **V-5** | "0/12245" → số trong-ngày · Home module Hôm nay · lộ trình hành trình    | E7 E8     | Vừa — đổi bố cục Home                          | +~0.5 kB                |
| **V-6** | Âm UI (tùy chọn)                                                         | E9        | Thấp — sau khi chốt mặc định                   | +~0.4 kB                |

Cổng mỗi đợt như mọi khi: build/typecheck/lint 0 cảnh báo/format/test/size-limit + full E2E
(63 test a11y × 4 theme phải xanh nguyên) + lái app thật bằng Playwright mobile trước khi commit.

## 6. Câu hỏi cần người dùng chốt trước khi code

1. **Thứ tự V-1 → V-2 trước** có đúng ý không? (2 đợt này là 80% giá trị cảm xúc.)
2. **V-3 có gộp đề xuất B của tài liệu sư phạm** (nút "Luyện từ vừa học bằng hội thoại") không?
   Gộp thì màn kết có CTA giá trị nhất; không gộp vẫn làm được với CTA "Học tiếp/Hẹn mai".
3. **SRS due +4h** (E4): đồng ý dời? (Không mất gì về sư phạm — ôn cùng ngày buổi tối vẫn giữ;
   chỉ hết cảnh "vừa xong đã nợ".)
4. **Huy hiệu** (V-4): đồng ý hướng "trung thực, suy từ dữ liệu thật, không XP ảo"?
5. **Âm UI** (V-6): làm không, và mặc định bật hay tắt?
6. Nếu ngân sách bundle chạm trần khi làm V-2: ưu tiên (a) tách chunk lazy triệt để, hay
   (b) nới `size-limit` thêm ~2 kB có chủ đích? (Khuyến nghị: a.)

> Mọi đề xuất không đụng nợ kỹ thuật đang treo (thanh toán Pro, Sentry DSN, migration 0007–0009)
> và không xung đột đề xuất sư phạm B–H — làm song song được.
