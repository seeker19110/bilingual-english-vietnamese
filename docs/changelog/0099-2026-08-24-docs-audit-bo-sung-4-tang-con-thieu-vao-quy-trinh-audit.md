# docs(audit): bổ sung 4 tầng còn thiếu vào quy trình audit (2026-08-24)

Tiếp ngay sau lượt audit cùng ngày — chính lượt đó phơi ra chỗ hổng của **đặc tả audit**, nên vá
`docs/framework/QUY-TRINH-AUDIT.md` (+305 / −61 dòng). Không đụng code sản phẩm.

**Vá lỗi nghiêm trọng nhất của đặc tả: lệnh trỏ đường dẫn đã chết → ÂM TÍNH GIẢ.** Sau đợt cải tổ
cấu trúc (`apps/english` → `apps/dhcb`, gốc repo → `apps/server/src`), 11 lệnh `grep` trong đặc tả
trỏ vào thư mục **không còn tồn tại** → trả 0 dòng → bị chấm "✅ 0 vi phạm". Đã sửa toàn bộ 21 chỗ
và thêm cảnh báo bắt buộc kiểm đường dẫn trước khi chạy. **Mọi lệnh mới đều đã chạy thử thật** —
nhờ vậy bắt được chính mình viết sai: lệnh kiểm secret ở client dùng `apps/*/src`, mà glob đó nuốt
luôn `apps/server/src` (code server được phép đọc `process.env`) → 94 dòng dương tính giả; đã đổi
sang liệt kê tường minh `apps/dhcb/src apps/hub/src`, chạy lại còn 0.

**4 tầng mới (đều sinh ra từ lỗ hổng có thật, không phải thêm cho đủ):**

- **Tầng 1b — test không ổn định.** CI chạy `npm test` đúng MỘT lượt, nên test đỏ 1/10 lượt lọt
  lưới hàng tuần rồi đỏ đúng lúc cần merge gấp. Nay yêu cầu ≥ 3 lượt, kèm cách phân biệt flaky
  với lỗi thật (chạy riêng file ≥ 5 lượt) và **cấm kết luận "flake" mà không chứng minh được cơ
  chế bằng số**. Liệt kê 4 nguồn flaky hay gặp trong dự án.
- **Tầng 6b — tài liệu ĐIỀU HÀNH có nói đúng thực tế không.** Soát `.claude/report-status.sh`
  (dòng mọi phiên đọc đầu tiên), đường dẫn trong đặc tả, và mục "Cấu trúc" của CLAUDE.md. Lý do:
  **tài liệu điều hành sai nguy hiểm hơn code sai** — code sai làm đỏ cổng, tài liệu sai thì im
  lặng và được tin tưởng.
- **Tầng 10 — tính đúng của logic NGẪU NHIÊN & thống kê.** Tầng quan trọng nhất trong đợt này:
  đây là loại lỗi **không cổng nào bắt được** (build/type/lint/test/coverage đều xanh trong khi
  phân bố kết quả sai). Gồm 3 cờ đỏ (R1 `sort(() => Math.random() - 0.5)` không phải thuật toán
  trộn · R2 đáp án đúng ở vị trí cố định trước khi trộn · R3 nhiều bản trộn song song lệch nhau),
  lệnh đo phân bố ≥ 100.000 lượt, và tiêu chí **±1 điểm phần trăm** quanh kỳ vọng đều.
- **Tầng 11 — đường CÀI MỚI + lũy đẳng migration.** Production chỉ chạy migration MỚI trên DB đã
  có, nên đường "dựng lại từ DB rỗng" hỏng âm thầm hàng tháng — tới lúc cần nhất (khôi phục sau
  sự cố) mới biết. Kèm công thức dựng Postgres tạm ngay trong container audit (`initdb` từ chối
  chạy bằng root → phải hạ quyền `nobody`), chạy đúng runner thật của dự án, rồi boot
  `dist-server/server.js` kiểm `/api/health`.

**Sửa thêm trong đặc tả:** ngưỡng coverage chép tay đã lệch cấu trúc thật (tài liệu ghi 93/89/96/93,
`vitest.config.ts` là 90/90/90/90) → đổi thành "đọc từ config mỗi lượt, đừng chép số" + thêm cảnh
báo ratchet đi lùi · Tầng 1 nay phải ghi **biên độ còn lại** của ngân sách bundle (≥ 95% ngưỡng là
cảnh báo) chứ không chỉ đạt/không đạt · Tầng 3 thêm `codemap cycles`/`orphans` (kèm bước lọc, nếu
không toàn báo động giả) và kiểm số migration trùng · Tầng 4 thêm lệnh cụ thể xác định baseline có
cũ hơn model không · mẫu báo cáo viết lại (bỏ vết Supabase "RLS"/`SUPABASE_DB_URL`, thêm mục "ĐÃ RÀ
VÀ KHÔNG CÓ LỖI") · làm rõ **số thứ tự tầng không phải thứ tự chạy** (Tầng 7 là bước cuối dù mang
số 7).

**Đã chạy thử và khớp kết quả ghi trong tài liệu:** 8 lệnh Tầng 2b · `codemap cycles`/`orphans` ·
kiểm số migration trùng · lệnh Tầng 4 (prompts/aiConfig 2026-08-23 > baseline 2026-08-20 → đúng
là baseline cũ) · lệnh đo phân bố Tầng 10 (36,00 / 17,13 / 15,57 / 31,30%) · lệnh Tầng 6b tự soi
chính đặc tả (0 đường dẫn chết thật còn lại). Tầng 11 đã chạy trọn vẹn ở lượt audit cùng ngày.
