# feat(programming): PR-L10 — THẺ SRS môn Lập trình (bước ⑧ khép kín khuôn 8 bước) (2026-08-25)

Khuôn bài học 8 bước của môn Lập trình từ PR-L3 tới giờ mới chạy 7 bước; bước ⑧ "thẻ SRS"
vẫn để trống với ghi chú "nối vào SRS chung ở PR sau". PR này đóng nốt.

- **Không dựng hệ nhắc lại riêng.** `lib/srs.ts` đã có FSRS thật, đồng bộ server, dự phòng
  ngoại tuyến — mạch lập trình chỉ cần một NAMESPACE khoá riêng (`prog:<lessonId>:<số thẻ>`),
  đúng khuôn mà mạch ngữ pháp tiếng Anh đã dùng (`grammar:`). Mỗi thẻ một lịch ôn riêng: thẻ
  khó quay lại sớm, thẻ dễ giãn ra — đó là toàn bộ giá trị của SRS.
- **Gộp ba bản chép tay thành một** (`getDueBy`): từ vựng, bài ngữ pháp và thẻ lập trình
  trước đây mỗi mạch chép lại cùng một đoạn "lọc thẻ đến hạn + ưu tiên quá hạn lâu nhất rồi
  khó nhất + cap số lượng". Nay chỉ còn MỘT bản, ba nơi truyền vào cách lấy khoá.
- **Lỗi thật do test bắt được:** `getSRSStats` (con số từ vựng trên Dashboard) chỉ loại
  `grammar:` nên thẻ `prog:` bị tính lẫn vào — số từ vựng sẽ phồng lên im lặng. Đã đổi thành
  danh sách tiền tố có comment nhắc: thêm loại thẻ mới thì phải khai ở đây.
- **99 thẻ cho TOÀN BỘ 34 bài** của môn (P1 · P2 · P3), mỗi bài 2–3 thẻ chốt khái niệm cốt
  lõi và cái bẫy kinh điển — không hỏi chi tiết vụn vặt của đề bài. Phần P1/P2/P3 do subagent
  soạn theo brief (đúng luật phân việc CLAUDE.md mục 3), phiên chính soạn U7/U10/U11 và duyệt
  toàn bộ qua cổng.
- **Cổng CI `srsCards.test.ts` canh CHẤT LƯỢNG thẻ, không chỉ schema:** mỗi thẻ hỏi đúng một
  ý (nhưng cho phép đuôi đào sâu "Vì sao?" — luật đầu tiên viết quá cứng, đã chỉnh sau khi nó
  bắt oan một thẻ tốt) · đáp án đủ dài để tự chấm · câu hỏi không lộ sẵn đáp án · không trùng
  thẻ trong bài và giữa các bài. Kèm test chứng minh cổng thật sự bắt được lỗi.
- **Trang ôn `/lap-trinh/on-tap`** — nhịp cố ý: hiện câu hỏi → học viên NGHĨ → bấm "Xem đáp
  án" → tự đánh giá 4 mức. Hiện sẵn cả hai mặt thì học viên chỉ đọc lướt và tưởng mình nhớ.
  Hàng đợi chốt một lần mỗi phiên (`useMemo`, không `useEffect` + `setState` — lint chặn đúng
  vì cách đó gây render dây chuyền), thẻ vào vòng ôn ngay khi ĐẠT bài Make.
- **Kiểm chứng:** 450 file / **5753 test xanh** (+149 test SRS). E2E `programming-lesson`
  **26/26** với 1 test mới đi trọn luồng thật trong Chromium (chưa học → không có thẻ; đạt
  bài → thẻ vào vòng ôn; đáp án ẩn tới khi bấm; chấm xong thẻ rời hàng đợi), dùng
  `page.clock` đẩy đồng hồ thay vì chờ thật. **a11y 267/267** — trang ôn đã thêm vào danh
  sách quét của CẢ HAI cổng (AA + AAA, 5 theme). Branches 90,29%, Initial JS 88,1%.
- **Còn lại của môn:** U12 milestone chặng P3 · chặng P4–P5 của dự án trục (thuộc bậc sau).
