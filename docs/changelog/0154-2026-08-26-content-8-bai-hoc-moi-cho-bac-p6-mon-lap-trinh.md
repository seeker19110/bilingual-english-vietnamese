# 0154 — feat(lessons): 8 bài học mới cho bậc P6 môn Lập trình

- **Ngày:** 2026-08-26
- **PR:** #703
- **Nhánh:** `claude/programming-lessons-tl3tbg`

## Bối cảnh

Rà lại nội dung môn Lập trình theo yêu cầu người dùng ("đã có bài học và giải thích kỹ càng
chưa?"). Kết quả đo thật trên repo:

- 60 bài, phủ **57/57 unit** — không unit nào rỗng.
- **60/60 bài đã có thẻ SRS** (bước ⑧). Ghi chú "srsCards optional, đang bổ sung dần" ở
  `lessonTypes.ts` chỉ còn đúng về mặt schema, không còn đúng về dữ liệu.
- Lỗ hổng thật là **P6 mỏng**: 4 unit × 1 bài, trong khi P3 có 13 unit, P4 có 12.

## Việc đã làm

Thêm **8 bài** vào 4 unit của P6 (mỗi unit lên 3 bài), giữ nguyên `curriculum.ts` — không
thêm unit mới, chỉ soạn tiếp bài cho unit đã có.

| Bài        | Nội dung                                                            | Chấm bằng                              |
| ---------- | ------------------------------------------------------------------- | -------------------------------------- |
| `p6-u1-l2` | Cắt tài liệu cho RAG: ranh giới câu, kích thước, chồng lấn          | số chunk + chunk dài nhất              |
| `p6-u1-l3` | Gọi LLM API: phân loại lỗi, chờ tăng dần, chi phí token             | số lần gọi + tổng giây chờ             |
| `p6-u2-l2` | Hàng đợi công việc so với chia tĩnh (channel/worker pool)           | makespan hai cách                      |
| `p6-u2-l3` | Hạn chót và huỷ việc (context của Go), suy giảm có duyên            | số dịch vụ kịp + tổng thời gian        |
| `p6-u3-l2` | Ba lỗi bộ nhớ: dùng sau khi giải phóng · giải phóng hai lần · rò rỉ | thông báo lỗi đầu tiên + số ô rò rỉ    |
| `p6-u3-l3` | Luật mượn của Rust: đọc nhiều HOẶC ghi một                          | thông báo lỗi đầu tiên + đỉnh mượn đọc |
| `p6-u4-l2` | Đổi thời gian lấy bộ nhớ (dict, two-sum)                            | cặp tìm được + số lần xét              |
| `p6-u4-l3` | Cửa sổ trượt, hai con trỏ, lập luận khấu hao                        | độ dài đoạn + số ký tự xét             |

Mỗi bài đủ **khuôn 8 bước** (móc thực tế → khái niệm → ví dụ mẫu chú thích từng dòng →
Predict → Parsons → Make có test-case ẩn/hiện + gợi ý bậc thang + code mẫu → ứng dụng về nhà
→ 4 thẻ SRS). Phần lý thuyết dài 2.400–3.200 ký tự/bài.

Header 4 file `lessons/p6u*.ts` được bổ sung ghi chú thiết kế chấm điểm và bẫy cài có chủ đích,
để phiên sau sửa nội dung không phá mất ý đồ.

## Quyết định kèm theo

- **P6 dạy Go/C/Rust bằng mô phỏng Python**, không đổi `language`. Lý do: sandbox trình duyệt
  chỉ có Pyodide; ý tưởng (goroutine, ownership, borrow) mô phỏng được trọn vẹn và vẫn chấm tự
  động được, còn thêm một bộ chạy mới là việc hạ tầng riêng. Bước ⑦ (về nhà) mới là chỗ học viên
  chạy Rust/Go thật trên máy mình.
- **Mọi bài chấm bằng con số hoặc chuỗi xác định**, không cần khoá API bên thứ ba — giữ đúng
  luật "môn KHÔNG proxy khoá bên thứ ba".
- Bẫy trong đề là **lỗi thật hay gặp**, không phải đánh đố: vòng lặp vô hạn khi chồng lấn ≥ số
  câu trong chunk, thử lại lỗi 401, cộng dồn độ trễ thay vì lấy max, ghi-trước-hỏi-sau sinh cặp
  giả, quên vế "chỗ lặp còn trong cửa sổ".

## Bằng chứng kiểm chứng

Chạy thật, đọc exit code:

- `npm test` → **464 file, 6.132 test xanh** (exit 0). Trong đó `lessonsPython.test.ts` chạy
  python3 thật: mọi `sampleSolution` mới đạt hết test-case, mọi `workedExample` chạy không lỗi,
  mọi đáp án `predict` khớp output thật.
- `npm run lint` → 0 lỗi, 0 cảnh báo.
- `npm run typecheck` → sạch.
- `npm run build` → xanh (Initial JS 213,73 kB — nội dung bài học nằm ở gói backend, không vào
  bundle của app).
- `npx prettier --check` trên 4 file đã sửa → đạt.

Cổng bắt được lỗi thật trong lúc soạn, đã sửa hết trước khi commit:

1. `predict.choices` phải là **output nguyên văn** — hai bài đầu ghi lựa chọn kèm lời giải thích
   nên rớt cổng "đáp án khớp output thật"; đã rút gọn về đúng chuỗi máy in ra.
2. Một bài có lựa chọn sai lại xuất hiện trong output (vì code in nhiều dòng) — đã sửa cho
   chương trình chỉ in một dòng kết quả.
3. Bảy bài vượt trần `homework` 800 ký tự và ba bài vượt trần `predict.explain` 600 ký tự
   (Zod chặn) — đã viết gọn lại.
