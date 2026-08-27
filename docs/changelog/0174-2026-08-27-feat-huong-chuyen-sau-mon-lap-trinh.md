# feat(programming): 13 hướng chuyên sâu + bản đồ kiến trúc cho từng hướng (2026-08-27)

Thi hành `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md` (viết trong chính
đợt này). Yêu cầu gốc của người dùng: _"lên kế hoạch và code tất cả các hướng lập trình thành mục
riêng… từ căn bản đến nâng cao, gồm các dự án… học xong sẽ có nền tảng sâu và trở thành chuyên
gia"_.

Trước đợt này môn Lập trình có xương sống P1→P5 đầy đủ, còn bậc P6 "Chuyên sâu" chỉ là **4 dòng
mô tả** trong `curriculum.ts`. Người học đi hết P5 không có câu trả lời cho "giờ đi đâu tiếp".

## Đã làm

- **Tầng dữ liệu mới `packages/subject-programming/specializations/`** — `types.ts` (khuôn) +
  **13 file nội dung** (`web` · `mobile` · `backend` · `data` · `ai` · `devops` · `security` ·
  `systems` · `game` · `embedded` · `desktop` + hai hướng NỀN `architecture` · `algo`) +
  `registry.ts` (sổ đăng ký, 7 hàm tra cứu). Mỗi hướng: 4 chặng S1→S4, 3–5 module/chặng, 1 dự án/chặng + 1 capstone, kèm dấu hiệu
  chuyên gia · nghề nghiệp mở ra · bẫy thường gặp · nguồn học chuẩn ngành.
  **Tổng: 52 chặng, 211 module học (642 ý kiến thức), 65 dự án phải nộp.**
- **Lát cắt KIẾN TRÚC bắt buộc ở MỌI hướng** (`SpecArchitecture`, 5 ô): module điển hình kèm
  trách nhiệm duy nhất · hợp đồng qua ranh giới · quyết định phải chốt sớm + đánh đổi · NFR viết
  thành số · checklist khi viết đặc tả. **Tổng 263 mục kiến trúc, 72 module.** Bổ sung theo yêu
  cầu người dùng: _"đa phần sau này sẽ chỉ đặc tả kiến trúc cho AI code"_.
- **Hướng thứ 13 `architecture` — "Kiến trúc hệ thống & Đặc tả cho AI thi hành"**: S1 ranh giới &
  module → S2 hợp đồng & mô hình miền → S3 **đặc tả kín + nghiệm thu code mình không tự gõ** →
  S4 tiến hoá kiến trúc & dẫn dắt nhiều bên thi hành.
- **Hai khuôn dùng được ngay**: `docs/templates/dac-ta-tinh-nang.md` (6 ô bắt buộc + ô nghiệm
  thu) và `docs/templates/adr.md` (có ô "vì sao loại phương án kia" + "điều kiện xem lại").
- **Cờ `crossCutting`** cho `architecture` và `algo`; trang danh sách tách hai nhóm để người học
  không tưởng phải chọn một trong 13.
- **`specializations.test.ts`** — 15 test bất biến kiểm KHUÔN (đủ 4 chặng đúng thứ tự, id duy
  nhất và đúng tiền tố, không ô rỗng, mã lạ trả `undefined` chứ không đoán bừa, **mọi hướng đủ 5
  ô kiến trúc**, mỗi module nêu trách nhiệm thật chứ không chép lại tên, hai nhóm hướng phủ kín
  không chồng lấn). Thêm hướng mới
  đúng chuẩn thì không phải sửa test.
- **2 trang mới**: `/lap-trinh/huong` (danh sách 12 hướng + hướng dẫn chọn) và
  `/lap-trinh/huong/:specId` (chi tiết một hướng). Route đặt **trước** `/lap-trinh/:levelId` để
  `huong` không bị hiểu nhầm là mã bậc.
- **Lối vào** ở `ProgrammingHome` (khối ⑥ "Sau P5: chọn hướng chuyên sâu").
- **`curriculum.ts`**: P6 nay trỏ về tầng mới; 4 unit cũ đổi thành _unit dẫn nhập_ của bốn hướng
  phổ biến nhất thay vì tự nhận là "track" đầy đủ.
- **Hai cổng a11y** thêm 3 route mới vào `e2e/a11y.spec.ts` và `e2e/a11y-aaa.spec.ts` (quét 5
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
7. **Kiến trúc là ô BẮT BUỘC, không phải ô tuỳ chọn.** Đặt `architecture` là trường bắt buộc của
   `ProgrammingSpecialization` (không phải `architecture?`) nên soạn hướng mới mà quên là
   TypeScript đỏ ngay, không đợi ai nhớ. Kèm test canh `role` > 25 ký tự để chặn kiểu điền cho
   có ("Module UI" — "UI").
8. **Hướng `architecture` cố ý KHÔNG mở từ P3** dù nó không dạy công nghệ nào. Chưa tự tay làm
   hỏng thứ gì thì đặc tả chỉ là chữ đẹp — điều này viết thẳng trong `forWho` và có test canh.
9. **Hướng `security` viết kèm ràng buộc đạo đức ngay trong dữ liệu**: chỉ thực hành trên môi
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
Build ✅ | Type ✅ (0 lỗi) | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (6798/6798, 483 file)
a11y ✅ 30/30 (3 route mới × 5 theme × 2 cổng A/AA + AAA)
Bundle ✅ Initial JS 124,82/140 kB · CSS 15,94/18 kB
```

## Việc còn để ngỏ (cố ý, ghi ở đặc tả mục 5)

1. Chưa soạn **bài học 8 bước** cho các hướng — tầng này là _bản đồ_, không phải nội dung dạy.
   Soạn trước cho `web` vì dùng lại được `htmlPrelude`/`domPrelude`/`fetchPrelude` sẵn có.
2. Chưa lưu **tiến độ hướng** xuống Postgres. Id chặng/module đã đặt ổn định để sau này không
   phải di trú khoá.
3. Chưa **gợi ý hướng theo hồ sơ người học** — gợi ý sai còn tệ hơn không gợi ý.
