# feat(programming): THIẾT KẾ LẠI UI/UX MÔN LẬP TRÌNH — trọn 5 đợt UX0→UX5 (2026-08-26)

Môn Lập trình đã đủ 60 bài (P1→P6) nhưng chưa từng có đợt thiết kế giao diện riêng: đặc tả gốc
chỉ có MỘT dòng về UI ("tái dùng khuôn `CefrLevelPage`" của môn English). Đợt này đóng khoảng
cách đó — đặc tả rồi thi hành trọn vẹn trong cùng một nhánh.

**Đặc tả:** `docs/research/dac-ta-uiux-mon-lap-trinh-2026-08-26.md` — 8 vấn đề đo được, 7 nguyên
tắc riêng của môn, 3 bề mặt thị giác (Giấy / Bảng đen / Bàn làm việc), nguyên văn trang mô tả
khoá học, 12 tiêu chí nghiệm thu.

**Năm đợt thi hành:**

- **UX1** — vá 2 lỗi thật: nút quay lại rơi về bậc P1 dù đang học bài P5; ngôn ngữ bài không hiện
  ra dù schema có sẵn trường `language`. Thêm `LangBadge`.
- **UX2** — tách 7 component `components/programming/`; `ProgrammingLessonPage` **662 → 378 dòng**.
- **UX3** — trang `/lap-trinh/gioi-thieu` **CÔNG KHAI** (route ngoài `RequireAuth`): mô tả khoá
  học, năng lực nghề, 6 thói quen tư duy, và mục nói thẳng thứ khoá học KHÔNG dạy.
- **UX4** — dựng lại `/lap-trinh`: thẻ **"Học tiếp"** (khiếm khuyết nặng nhất về giữ chân người
  học, nay đã vá), tiến độ thật, lộ trình 6 bậc dạng cột mốc có vòng SVG, dự án trục hiện chặng
  đang ở.
- **UX5** — luật N3 (thanh bước 2 pha NẠP/TRẢ), N4 (3 trạng thái chạy code), N5 (ca chấm không
  đạt là hổ phách, đỏ chỉ dành cho lỗi hệ thống).

**Bốn lỗi thật lộ ra TRONG LÚC làm, không có trong danh sách ban đầu — đáng ghi vì đều thuộc
loại "cổng bắt được, mắt không":**

1. **V2 có HAI ca.** Ngoài `Layout onBack`, nút "Về trang bậc P1" ở màn ⑦ cũng ghi cứng. Vá một
   chỗ rồi tưởng xong chính là cách lỗi sống sót.
2. **Có 11 ngôn ngữ chứ không phải 7** (P4 thêm `pytest`/`httpsim`/`apisim`/`typescript`).
   Typecheck bắt nhờ `Record<Lang, …>` đòi đủ khoá. Đã tách hằng `LESSON_LANGUAGES` để schema và
   giao diện dùng chung, test duyệt qua chính hằng đó → thêm ngôn ngữ mà quên nhãn là CI đỏ.
3. **Ca N4 ở trang bài học:** `{output && <pre>…}` nên chương trình chạy đúng mà không in gì thì
   màn hình trống trơn — học viên không phân biệt được với "chưa chạy".
4. **Ca N4 ở sandbox, tệ hơn:** chạy xong quay về `idle` nên hiện lại "Bấm Chạy để xem kết quả"
   — không phải im lặng mà là **nói dối rằng chưa chạy lần nào**.

**Bài học a11y ghi vào đặc tả:** cùng cặp class `text-accent-300 theme-light:text-accent-800`
đạt AAA trong `<button>` nhưng TRƯỢT trong `<p>`/`<li>` — cổng AAA chỉ soi nội dung/tiêu đề, và
`li` không nằm trong danh sách "chrome" của `a11y-aaa.spec.ts`. Copy class từ nút sang đoạn văn
là đủ làm đỏ CI. Đã sửa 2 chỗ ở trang môn.

**Kiểm chứng (chạy thật):** build ✅ · typecheck ✅ · lint ✅ 0 cảnh báo · format ✅ ·
**460 file / 6049 test xanh** · e2e môn Lập trình **43/43** · a11y **277/277, 0 vi phạm**
(16 trang × 5 theme, cả A/AA lẫn AAA) · bundle JS 123,9/140 kB · CSS 15,82/18 kB.

**Ba quyết định người dùng đã chốt:** (1) câu "chưa ai đi hết môn" chỉ đặt ở trang giới thiệu,
không rải khắp nơi — ngoại lệ duy nhất là nhãn "bản mở đường" của P6; (2) trang giới thiệu mở
cho người chưa đăng nhập; (3) giữ nguyên thứ tự 5 PR.

**Ghi chú vận hành:** nợ kỹ thuật #7 (ngân sách bundle "99,7%") đã LẠC HẬU — đo thật còn dư
~11% cả JS lẫn CSS. Và phải `npm ci` lại **sau khi merge `main`**, không chỉ đầu phiên: PR #691
thêm gói `@dhcb/core-location` nên build đỏ với 4 lỗi `Cannot find module` trông y như lỗi code.
