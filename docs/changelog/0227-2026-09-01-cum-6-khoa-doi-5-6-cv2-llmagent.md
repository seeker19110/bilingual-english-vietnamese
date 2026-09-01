# 0227 — Cụm 6 khoá "Kỹ sư AI thực chiến": đợt 5-6 song song (`cv2` + `llmagent`)

- **PR:** (đang mở, xem nhánh `claude/soan-song-song-dot-5-6-bocyd8`)
- **Ngày:** 2026-09-01

## Việc đã làm

Đợt 5 của kế hoạch 5-đợt ở `docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` §⑥ (đặc tả gốc
ghi "cv2 + llmagent — tách 2 PR nếu quá lớn") — theo đúng cách đã làm ở đợt 3-4, tách thành
đợt 5 (`cv2`) và đợt 6 (`llmagent`) rồi giao 2 subagent `spec-executor` viết SONG SONG, nội dung
lấy nguyên văn từ hai đặc tả kín đã soạn sẵn trước đó: `docs/specs/2026-09-01-cv2-bai-hoc-chi-tiet.md`
và `docs/specs/2026-09-01-llmagent-bai-hoc-chi-tiet.md`. Đây là đợt cuối cùng theo thứ tự soạn
(đợt 5 của kế hoạch), nhưng đợt 1-2 (`pyai`, `mathai`) vẫn chưa làm — xem mục cuối bên dưới.

1. `lessons/cv2u1.ts` (4 bài, "Transformer & ViT") + `lessons/cv2u2.ts` (4 bài, "Object
   detection") + `lessons/cv2u3.ts` (4 bài, "Mô hình sinh ảnh") + `lessons/cv2u4.ts` (2 bài,
   tổng hợp) — đủ 14 bài `cv2-u1-l1..cv2-u4-l2`: self-attention một đầu tự cài, IoU + non-max
   suppression tự cài, GAN 2 người chơi trên phân phối 1 chiều, mô phỏng khuếch tán trên vector
   nhỏ. `courses/cv2.ts` đăng ký `CV2_COURSE` (4 chương, `prerequisites: ['Khoá Deep Learning
for CV cơ bản (cv1)']`).
2. `lessons/llmagentu1.ts` (5 bài, "NLP → LLM") + `lessons/llmagentu2.ts` (4 bài, "RAG") +
   `lessons/llmagentu3.ts` (5 bài, "AI Agents & triển khai") — đủ 14 bài: tokenizer BPE mini tự
   cài, embedding + cosine similarity, mô hình ngôn ngữ n-gram tự cài, RAG mini tự cài trọn
   pipeline, vòng lặp agent ReAct tự cài, máy ước lượng chi phí. `courses/llmagent.ts` đăng ký
   `LLMAGENT_COURSE` (3 chương, `prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1) hoặc
nắm vững MLP/attention']`) — khoá CUỐI của chuỗi 6 khoá.

Vì hai đợt không có điểm chạm file chung (mỗi khoá chỉ tạo file bài học + file khoá riêng), sau
khi cả 2 subagent xong, phiên chính tự nối dây phần chung một lần: import + nối 7 mảng bài học
mới vào `lessons.ts`, đăng ký `CV2_COURSE`/`LLMAGENT_COURSE` vào `courses/registry.ts`, thêm
tiền tố `cv2-u`/`llmagent-u` vào danh sách "unit ảo của khoá ngắn" ở `lessons.test.ts`. Regex
`lessonId` ở 4 chỗ (`lessonTypes.ts` ×2, `apps/server/.../progress.ts`, `.../feedback.ts`) **đã
có sẵn nhánh `cv2`/`llmagent`** từ đợt PR chore trước (#799, cùng đợt đã nới cho `mlds`/`cv1`) —
đợt này không cần đụng lại.

## Lỗi nội dung bắt được bởi cổng tự động (đã sửa tại chỗ)

Cả 5 lỗi dưới đây có sẵn trong chính 2 đặc tả kín (agent chép đúng ký tự đặc tả) — không phải
lỗi thi hành, mà là lỗi nội dung của đặc tả bị cổng CI bắt được đúng như thiết kế:

- `cv2-u2-l2` (IoU): lựa chọn Predict sai `'0'` là SUBSTRING của đáp án đúng `'100'` →
  `lessonsPython.test.ts` bắt được (chấm bằng `output.includes()`). Đổi thành `'Khong tinh
duoc'`.
- `cv2-u3-l1` (GAN tự cài): ca test ẨN có `expected` trích 2 dòng không liền nhau trong khi
  `sampleSolution` luôn in đủ 5 vòng lặp → `match: 'contains'` trượt. Đổi `expected` thành đúng
  2 dòng CUỐI liền nhau của output thật (`Vong 5: ...` + `Trung binh that: ...`).
- `llmagent-u1-l1` (tokenizer): đáp án Predict nối 2 dòng output bằng `" rồi "` trong khi code
  in ra 2 dòng `print()` riêng biệt → không phải substring của output thật. Đổi nối bằng `\n`.
- `llmagent-u1-l5` (chi phí token): tương tự, đáp án nối 3 cặp bằng `", "` trong khi code in 3
  dòng riêng → đổi nối bằng `\n`.
- `llmagent-u3-l5` (log chi phí có cache): lựa chọn Predict sai `'0'` là SUBSTRING của đáp án
  đúng `'1000'` → đổi thành `'Khong tinh duoc'`.

Ngoài ra: subagent soạn `cv2` viết thêm một file test riêng `lessonsCv2.test.ts` (import thẳng
4 mảng bài, dùng để tự canh nội dung trước khi được nối dây) — phiên chính XOÁ file này sau khi
nối dây xong, vì các cổng tổng hợp có sẵn (`lessons.test.ts`, `lessonsPython.test.ts`,
`srsCards.test.ts`) đã phủ đủ một khi `PROGRAMMING_LESSONS` chứa các bài mới, và `cv1`/`mlds`
không có tiền lệ file test riêng cho từng khoá ngắn.

## Bằng chứng kiểm chứng

`npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npx prettier --check` ✅ ·
`npx vitest run packages/subject-programming` ✅ 3554/3554 (49 file test, bao gồm chạy python3
thật qua `lessonsPython.test.ts`) · `npm test` ✅ 10513/10513 (532 file test) · `npm run build`
✅ (client + server + hub).

## Trạng thái cụm 6 khoá sau đợt này

`docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` §⑥ có 5 đợt PR theo thứ tự `pyai` → `mathai`
→ `mlds` → `cv1` → `cv2`+`llmagent`. Đã làm: đợt 3 (`mlds`), đợt 4 (`cv1`, PR #226) và đợt 5
(`cv2` + `llmagent`, PR này). **Đợt 1 (`pyai`) và đợt 2 (`mathai`) CHƯA làm** — dù đã có sẵn
đặc tả kín `docs/specs/2026-09-01-pyai-bai-hoc-chi-tiet.md` +
`docs/specs/2026-09-01-mathai-bai-hoc-chi-tiet.md`, chưa được soạn thành file bài học. `mlds`
đang tham chiếu `mathai`/`pyai` trong `prerequisites` bằng CHỮ (không phải id thật), nên chuỗi
6 khoá vẫn hoạt động độc lập từng khoá — nhưng cửa vào đầu tiên của chuỗi (`pyai`) chưa tồn tại
trong `courses/registry.ts`. Việc tiếp theo: soạn đợt 1-2 (`pyai` 17 bài + `mathai` 13 bài) để
khép kín chuỗi.
