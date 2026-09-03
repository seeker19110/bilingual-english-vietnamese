# 0257 — 2026-09-03 — Hook đầu phiên đọc thẳng nợ từ PROGRESS.md, thôi chép tay

**PR:** #840 · **Loại:** `fix` — sửa hạ tầng phiên làm việc + thêm cổng canh.

## Lỗi

`.claude/report-status.sh` in bản tóm tắt ở **đầu mỗi phiên** — thứ đầu tiên cả người dùng lẫn AI
đọc. Danh sách "nợ kỹ thuật" trong đó được **chép cứng** vào script, và đã lỗi thời **hai lần**:

| Lần                  | Sai gì                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Audit 2026-08-01     | Báo Sentry · thanh toán Pro · branch protection là "chưa làm" — đều đã xong từ lâu                           |
| 2026-09-03 (đợt này) | Còn ghi ngưỡng CSS **18 kB** sau khi đã nới lên 20 kB (2026-09-02), và coverage **90,56%** sau khi đã đo lại |

Chính header của script đã dự báo: _"phải TỰ TAY cập nhật... nếu để lâu không sửa sẽ lại lỗi thời
như lần audit 2026-08-01"_. Dự báo đúng — nhưng cách chữa lần trước (chép lại số mới) chỉ **đặt
lại đồng hồ đếm tới lần lỗi thời sau**.

Cái giá không nhỏ: một bản tóm tắt sai ở đầu phiên khiến phiên đó khởi hành từ dữ kiện sai — đúng
kiểu đã làm mất công thật ở đợt `0254` (đi sửa `FeedbackModal` rồi mới biết đã sửa từ lâu).

## Sửa

Bỏ hẳn chỗ chép: script **đọc thẳng** mục `## Nợ kỹ thuật còn mở` của `PROGRESS.md` — nguồn thật
duy nhất — bằng `awk`, không thêm phụ thuộc và không cần `node_modules` (hook phải chạy được
trong container mới tinh).

Rút **tiêu đề in đậm** làm đơn vị hiển thị, gom cả tiêu đề vắt qua nhiều dòng. Không cắt theo số
ký tự: `awk` đếm theo BYTE nên cắt cứng sẽ xén giữa một ký tự tiếng Việt.

Kết quả in ra **9 mục còn mở** thay vì 8 mục chép tay — trong đó **4 mục chưa từng được nhắc**:
Core Web Vitals (Tầng 8–9), mã hoá dữ liệu cũ, Gemini Live chưa test key thật, dải nhiễu eval.
Đồng thời thôi in các mục đã đóng mà bản chép tay vẫn liệt kê.

## Cổng canh + kiểm bằng đột biến

Đổi cách này thì rủi ro mới là **hỏng im lặng**: ai đó đổi định dạng mục nợ, script in ra danh
sách rỗng mà không ai hay. Nên thêm `scripts/report-status.test.ts` (5 test), trong đó có ca
"đổi định dạng → phải BÁO RÕ, không im lặng in rỗng".

5 test xanh ngay lượt đầu là chuyện đáng nghi, nên tôi phá parser 5 lần:

| Đột biến                    | Kết quả     |
| --------------------------- | ----------- |
| Không dừng ở mục kế tiếp    | ❌ 1 đỏ     |
| Bỏ gom tiêu đề nhiều dòng   | ❌ 1 đỏ     |
| Nhận cả mục đã đóng         | ❌ 1 đỏ     |
| Mất cảnh báo danh sách rỗng | ❌ 4 đỏ     |
| Sai tiêu đề mục nợ          | ❌ 3 đỏ     |
| Khôi phục nguyên trạng      | ✅ 5/5 xanh |

**Lượt đột biến đầu tiên tìm ra một lỗ hổng thật trong chính bản sửa của tôi.** Bỏ bộ lọc `~~`
(mục đã đóng) **không làm test nào đỏ** — vì mục đã đóng luôn viết dạng `- ~~...` nên đã bị mẫu
`/^- (🟡|🔴)/` loại từ đầu; bộ lọc đó là **code chết**.

Và không chỉ thừa mà **có hại**: một mục CÒN MỞ chỉ vì nhắc tới `~~gạch ngang~~` ngay dòng đầu sẽ
bị âm thầm bỏ sót — đúng loại hỏng im lặng mà cổng này sinh ra để chặn. Đã **xoá bộ lọc** (chứ
không viết test chiều theo nó) và thêm hai ca canh: dạng đóng thật `- ~~🟡~~` vẫn bị loại, mục mở
có `~~` trong tiêu đề vẫn được in.

## Cổng

`typecheck` ✅ · `lint` (max-warnings 0) ✅ · `format` ✅ · `npm test` ✅ · hook chạy thật trên
`PROGRESS.md` sau khi #839 merge ✅.
