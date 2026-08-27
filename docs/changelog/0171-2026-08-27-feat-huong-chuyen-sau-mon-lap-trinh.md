# feat(programming): 12 hướng chuyên sâu — từ căn bản tới chuyên gia (2026-08-27)

Thi hành `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md` (viết trong chính
đợt này). Yêu cầu gốc của người dùng: _"lên kế hoạch và code tất cả các hướng lập trình thành mục
riêng… từ căn bản đến nâng cao, gồm các dự án… học xong sẽ có nền tảng sâu và trở thành chuyên
gia"_.

Trước đợt này môn Lập trình có xương sống P1→P5 đầy đủ, còn bậc P6 "Chuyên sâu" chỉ là **4 dòng
mô tả** trong `curriculum.ts`. Người học đi hết P5 không có câu trả lời cho "giờ đi đâu tiếp".

## Đã làm

- **Tầng dữ liệu mới `packages/subject-programming/specializations/`** — `types.ts` (khuôn) +
  **12 file nội dung** (`web` · `mobile` · `backend` · `data` · `ai` · `devops` · `security` ·
  `systems` · `game` · `embedded` · `desktop` · `algo`) + `registry.ts` (sổ đăng ký, 4 hàm tra
  cứu). Mỗi hướng: 4 chặng S1→S4, 3–5 module/chặng, 1 dự án/chặng + 1 capstone, kèm dấu hiệu
  chuyên gia · nghề nghiệp mở ra · bẫy thường gặp · nguồn học chuẩn ngành.
  **Tổng: 48 chặng, 195 module (584 ý kiến thức), 60 dự án phải nộp.**
- **`specializations.test.ts`** — 11 test bất biến kiểm KHUÔN (đủ 4 chặng đúng thứ tự, id duy
  nhất và đúng tiền tố, không ô rỗng, mã lạ trả `undefined` chứ không đoán bừa). Thêm hướng mới
  đúng chuẩn thì không phải sửa test.
- **2 trang mới**: `/lap-trinh/huong` (danh sách 12 hướng + hướng dẫn chọn) và
  `/lap-trinh/huong/:specId` (chi tiết một hướng). Route đặt **trước** `/lap-trinh/:levelId` để
  `huong` không bị hiểu nhầm là mã bậc.
- **Lối vào** ở `ProgrammingHome` (khối ⑥ "Sau P5: chọn hướng chuyên sâu").
- **`curriculum.ts`**: P6 nay trỏ về tầng mới; 4 unit cũ đổi thành _unit dẫn nhập_ của bốn hướng
  phổ biến nhất thay vì tự nhận là "track" đầy đủ.
- **Hai cổng a11y** thêm 2 route mới vào `e2e/a11y.spec.ts` và `e2e/a11y-aaa.spec.ts` (quét 5
  theme).

## Quyết định đáng ghi lại

1. **Không dùng chữ "track" cho hướng chuyên sâu.** Trong môn này `PROJECT_TRACKS` đã mang nghĩa
   "chủ đề dự án trục T1/T2/T3". Dùng `specialization` / "hướng" để hai khái niệm không đè nhau.
2. **Khuôn cứng 4 chặng cho MỌI hướng.** Đồng nhất cấu trúc là điều kiện để so sánh các hướng và
   để test kiểm khuôn dạng thay vì kiểm từng chữ nội dung.
3. **Tiêu chí "xong" của dự án phải ĐO ĐƯỢC.** Không nhận tiêu chí cảm tính. Ví dụ hướng game:
   _"giữ ≥ 60 FPS trên máy mục tiêu, có biểu đồ thời gian khung hình"_, không phải _"game mượt"_.
4. **`expertSignals` là hành vi quan sát được, không phải số năm kinh nghiệm** — bám luật của
   `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`.
5. **Không xếp hạng hướng nào hơn hướng nào.** Mỗi hướng nói rõ hợp với ai / không hợp với ai;
   đây là công cụ chọn việc, không phải bảng chấm điểm con người (luật số 1 của sản phẩm).
6. **Hướng `algo` khai báo rõ là BỔ TRỢ**, học song song chứ không thay một hướng sản phẩm.
7. **Hướng `security` viết kèm ràng buộc đạo đức ngay trong dữ liệu**: chỉ thực hành trên môi
   trường của mình hoặc lab hợp pháp, luôn có văn bản cho phép trước khi kiểm thử. Điều này nằm
   trong `pitfalls` và `forWho` để người học không thể đọc lướt qua.

## Phát hiện đo được

**Đặt tên file là `index.ts` làm đội ngân sách bundle 27 kB — dù dữ liệu chỉ nạp ở route lười.**
Bản đầu đặt sổ đăng ký ở `specializations/index.ts`; Rollup đặt tên chunk theo tên file nên sinh
ra `dist/js/index-*.js`, trùng đúng glob `"Initial JS"` trong `.size-limit.json`:

|                                 | Initial JS (brotli) | Ngưỡng |
| ------------------------------- | ------------------- | ------ |
| Trước đợt (đo bằng `git stash`) | 124,08 kB           | 140 kB |
| Bản đầu (`index.ts`)            | **151,17 kB ❌**    | 140 kB |
| Sau khi đổi tên `registry.ts`   | **124,35 kB ✅**    | 140 kB |

Bài học ghi vào đặc tả mục 3: trong `packages/`, **không đặt tên file là `index.ts`** khi file đó
có thể vào chunk riêng.

**Cổng a11y bắt được `text-accent-400` dùng cho CHỮ.** Nhãn chặng ban đầu dùng `text-accent-400`;
3 theme nền sáng đỏ với `color-contrast (serious, 4 phần tử)`. Đổi sang `text-zinc-300`. Đây đúng
là loại lỗi mà mắt người soạn không thấy vì mặc định đang xem theme Xanh đêm.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ (0 lỗi) | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (6794/6794, 483 file)
a11y A/AA ✅ 10/10 (2 route mới × 5 theme) | a11y AAA ✅ 10/10
Bundle ✅ Initial JS 124,35/140 kB · CSS 15,94/18 kB
```

## Việc còn để ngỏ (cố ý, ghi ở đặc tả mục 5)

1. Chưa soạn **bài học 8 bước** cho các hướng — tầng này là _bản đồ_, không phải nội dung dạy.
   Soạn trước cho `web` vì dùng lại được `htmlPrelude`/`domPrelude`/`fetchPrelude` sẵn có.
2. Chưa lưu **tiến độ hướng** xuống Postgres. Id chặng/module đã đặt ổn định để sau này không
   phải di trú khoá.
3. Chưa **gợi ý hướng theo hồ sơ người học** — gợi ý sai còn tệ hơn không gợi ý.
