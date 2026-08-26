# fix(eval): `--write-baseline` từ chối ghi đè bằng dữ liệu rỗng (2026-08-26)

## Chuyện đã xảy ra thật

Chạy `npm run eval:tutor -- --write-baseline` trên VPS. `GROQ_API_KEY` đã hết hiệu lực nên
**62/62 câu trả `401 Invalid API Key`**. Mọi chỉ số ra `n/a`, mọi loại lỗi `0/0` — và script
vẫn in:

```
✅ Đã ghi docs/research/eval-tutor-baseline.md
```

Baseline thật bị thay bằng một bảng rỗng.

## Vì sao nguy hiểm hơn vẻ ngoài

Baseline là **mốc so sánh duy nhất** để biết một PR đổi prompt/model có làm tụt chất lượng sư
phạm hay không (CLAUDE.md mục 8 bắt buộc đối chiếu). Baseline rỗng còn tệ hơn baseline cũ: nó
xoá mốc đi, và mọi PR sau đó sẽ "không tụt so với baseline" vì **chẳng còn gì để tụt**. Cổng
chất lượng vẫn xanh trong khi thứ nó canh đã biến mất.

Đây đúng loại lỗi mà chính môn Lập trình của dự án dạy phải sợ: **công cụ báo thành công cho
một lần chạy không đo được gì**.

## Vá

`--write-baseline` nay chỉ ghi khi chấm được **≥ 80% số câu ở mọi chế độ đã chạy**. Không đạt
thì thoát mã 1, giữ nguyên baseline cũ, và in chẩn đoán theo mã lỗi:

```
❌ KHÔNG ghi baseline — lượt chạy này không đo được đủ dữ liệu.
   chat: chấm được 0/3 câu (cần ≥ 3), 3 câu lỗi provider.
   Baseline CŨ giữ nguyên — nó vẫn là mốc so sánh đúng.
   Sửa nguyên nhân rồi chạy lại: lỗi 401 = khoá API sai/hết hạn (kiểm .env),
   lỗi 404 = tên model sai, lỗi 429 = chạm hạn mức nhà cung cấp.
```

## Kiểm chứng

Tái hiện **đúng** tình huống trên VPS bằng cách chạy với khoá sai cố ý:

|           | Kết quả                                                           |
| --------- | ----------------------------------------------------------------- |
| Mã thoát  | `1` (trước đây: `0`)                                              |
| Baseline  | **giữ nguyên** — `diff` xác nhận không đổi (trước đây: bị ghi đè) |
| Thông báo | chẩn đoán rõ nguyên nhân, không còn dấu ✅ giả                    |

Ngưỡng 80% chọn để một vài câu lỗi lẻ tẻ (mạng chập chờn, 429 tạm thời) không chặn được lượt
chạy hợp lệ — chỉ chặn khi lượt chạy hỏng về bản chất.

## Việc còn lại, KHÔNG thuộc PR này

`GROQ_API_KEY` trên VPS đang bị Groq từ chối (`401`). Groq không chỉ dùng cho eval — **STT của
chế độ Luyện nói cũng đi qua đó**, nên cần kiểm ngay key còn sống không và cấp lại nếu cần.
Đáng chú ý: trang Trạng thái tính năng lượt 07:00 cùng ngày vẫn báo Groq hoạt động 426ms, tức
key hỏng trong khoảng giữa.
