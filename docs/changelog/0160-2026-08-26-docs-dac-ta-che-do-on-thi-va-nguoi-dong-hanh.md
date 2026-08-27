# docs(research): đặc tả 2 tính năng giữ chân — chế độ ôn thi + người thân theo dõi (2026-08-26)

Đợt **research-first** (KHUNG 3 · CLAUDE.md mục 0): rà soát trạng thái thật của repo để đề xuất
hướng tích hợp tiếp theo, người dùng chọn hai ý tưởng đầu, viết đặc tả trước khi viết code.

## Vì sao hai tính năng này, không phải mở thêm môn/trụ

Repo hiện đã có ~100 route API, 5 trụ, 2 môn, 16 gói workspace. Rủi ro lớn nhất không còn là
thiếu tính năng mà là **phình phạm vi**: nhiều module rộng, mỗi module nông. Hai tính năng được
chọn đều **không mở diện tích mới** — chúng gắn vòng lặp giữ chân và đường doanh thu vào thứ đã
có sẵn:

- **Chế độ ôn thi** — biến nhịp học vô hạn (CEFR/SRS/streak) thành nhịp có **hạn chót thật**.
  Dùng lại FSRS đã chạy; phần mới chỉ là lớp lập lịch ngược, hàm thuần, tất định.
- **Người thân theo dõi** — nối người **trả tiền** (phụ huynh) vào sản phẩm. Không tốn token AI,
  dùng lại `emailReminders.ts` + `mailQuota.ts` + mô hình mã mời của `friends.ts`.

## Tài liệu thêm mới

- `docs/research/dac-ta-che-do-on-thi-2026-08-26.md` — thuật toán lập lịch ngược (`build` /
  `consolidate` / `taper`, `requestRetention` nâng dần theo giai đoạn), bảng 8 ca biên bắt buộc
  có test, schema `exam_plans`, chia 4 PR. Phạm vi đợt 1 chốt cứng **một kỳ thi duy nhất**
  (vào lớp 10 — Tiếng Anh).
- `docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md` — liên kết một chiều learner → watcher,
  mã mời **dùng một lần hạn 24 giờ**, danh sách trường được xem **đóng và chốt trong code**,
  báo cáo tuần tối chủ nhật, chia 4 PR.

## Ba phát hiện khi rà soát repo (đáng ghi lại)

1. 🔴 **`packages/core-grading` KHÔNG còn trong repo.** Engine chấm dùng chung "đã viết xong +
   74 test" mà `PROGRESS.md` mục GĐ2 vẫn mô tả ở thì hiện tại đã bị xoá ở đợt cải tổ cấu trúc
   2026-08-23 (lý do ghi trong CLAUDE.md: "đã xoá `core-grading` mồ côi" — không ai import).
   Code còn nguyên trong lịch sử git: 9 file tại commit `9fa6f59`, khôi phục bằng
   `git checkout 9fa6f59 -- packages/core-grading`. Ghi lại vì GĐ3 (môn Hoá) và đợt 2 của chế độ
   ôn thi đều đang giả định engine này có sẵn.
2. **Tên "Companion" đã bị chiếm** bởi tác tử AI (`api/personal/companion.ts`). Tính năng người
   thật phải dùng tên khác (`companion_link` / "Người thân theo dõi") — nếu không, hai khái niệm
   khác hẳn nhau sẽ dùng chung một chữ trong cả code lẫn giao diện.
3. **FSRS lập lịch cho trí nhớ vô hạn, không cho một ngày cụ thể.** Đây là điểm khớp nối kỹ
   thuật thật sự của chế độ ôn thi: cần nâng `request_retention` theo khoảng cách tới ngày thi,
   và cấm mọi thẻ có `due` rơi ra **sau** ngày thi mà chưa ôn trong cửa sổ T-7.

## Luật sản phẩm được nhắc lại trong cả hai đặc tả

- Kết quả chẩn đoán **không bao giờ là màn hình chính** — màn hình chính của chế độ ôn thi là
  đếm ngược + đúng 3 việc hôm nay.
- Trễ thì **nén lịch, không phạt**; không kịp thì **nói thẳng và đề xuất cắt phạm vi**, không im
  lặng nhồi lịch không ai theo nổi.
- Riêng tư của tính năng người thân theo dõi lấy nguyên khuôn "Đi chung": mặc định TẮT · chỉ
  người học cấp quyền · tắt là ngừng ngay · danh sách trường được xem là **đóng**, chốt trong
  code, và **không bao giờ** gồm nội dung chat với Companion, nhật ký cảm xúc, hay bất kỳ con số
  năng lực nào (đã có 7 test bất biến chặn CI về việc rò con số năng lực — báo cáo này phải nằm
  trong cùng lưới đó).

## Bằng chứng

Đợt này chỉ thêm tài liệu, không đụng code chạy. Cổng đã chạy: `npm run format:check` ·
`npm run lint` · `npm test`. Mọi khẳng định về trạng thái repo ở trên đều đo bằng lệnh thật
(`git ls-tree`, `grep` toàn repo), không suy đoán — chi tiết trong phần thảo luận của PR.
