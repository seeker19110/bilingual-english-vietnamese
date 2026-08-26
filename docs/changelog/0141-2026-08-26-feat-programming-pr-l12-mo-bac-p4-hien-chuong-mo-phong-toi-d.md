# feat(programming): PR-L12 — MỞ BẬC P4: hiến chương "mô phỏng tới đâu" + U1–U4 (2026-08-26)

Bậc P4 khác mọi bậc trước ở chỗ nó chạm tới thứ **không mô phỏng trung thực được** trong
sandbox trình duyệt (server thật, API có key thật, deploy). Nên PR mở bậc này làm hai việc:
chốt ranh giới trước, rồi soạn phần không cần hạ tầng mới.

- **Hiến chương bậc P4** — `docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md`:
  mọi bài P4 phải rơi vào ĐÚNG MỘT trong ba làn và giao diện phải nói rõ đang ở làn nào —
  **A** chạy thật trong sandbox · **B** mô phỏng KHAI BÁO MINH BẠCH (in `[GIẢ LẬP]`, cấm câu
  "server của bạn đang chạy tại…") · **C** làm trên MÁY THẬT + nộp bằng chứng. Luật kèm:
  làn B luôn có làn C đi kèm ở bước ⑦; **không chấm "đạt" thay học viên ở làn C** khi không
  có gì kiểm chứng được; không dựng judge server đa ngôn ngữ ở P4 (để P5+, cần đặc tả riêng).
  Tài liệu chốt luôn hạ tầng cần cho từng unit và thứ tự PR-L12…L17.
- **Quyết định kỹ thuật đáng chú ý:** cổng TypeScript (U10–U11) sẽ chạy **phía server**
  (`/api/ts-check`, dùng `typescript` repo đã có) chứ KHÔNG nhét compiler TS vào bundle —
  ngân sách bundle đang ở 99,7% (nợ kỹ thuật #7).
- **Nội dung U1–U4 (làn A thuần, không hạ tầng mới):** U1 class/thuộc tính/phương thức ·
  U2 kế thừa **và khi nào ĐỪNG dùng OOP** (câu thử "con LÀ MỘT loại cha", kết hợp vs kế thừa)
  · U3 refactor có kỷ luật (đổi cấu trúc, giữ nguyên hành vi; lát nhỏ; phải có cách kiểm
  chứng trước) · U4 lỗi nghiệp vụ tự định nghĩa + logging.
- **Bẫy được đưa vào bước Predict có chủ đích** — mỗi bài một lỗi kinh điển của người mới:
  `b = a` không sao chép đồ vật · `super()` gọi bản của cha · **đối số mặc định `[]` dùng
  chung giữa mọi đồ vật** · `finally` chạy trước khi lỗi bay ra khỏi hàm.
- **Kiểm chứng:** 450 file / **5788 test xanh**. Cổng `lessonsPython.test.ts` chạy THẬT bằng
  python3: 4 code mẫu đạt hết test-case, 4 ví dụ mẫu chạy không lỗi, 4 đáp án Predict khớp
  output thật — cổng này bắt được 3 lỗi soạn ngay trong PR (đáp án Predict trùng chuỗi con
  với lựa chọn sai).
- **Tiếp theo:** PR-L13 `pytestPrelude` + U5–U6 (test tự động).
