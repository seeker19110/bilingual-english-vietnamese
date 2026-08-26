# fix(eval): `--write-baseline` từ chối ghi đè bằng dữ liệu rỗng (2026-08-26)

## Chuyện đã xảy ra thật

Chạy `npm run eval:tutor -- --write-baseline` trên VPS. **62/62 câu trả `401 Invalid API Key`**.
Mọi chỉ số ra `n/a`, mọi loại lỗi `0/0` — và script vẫn in:

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

## Lỗi thứ hai, phát hiện ngay sau đó: `401` là GIẢ

Ban đầu tôi kết luận `GROQ_API_KEY` hết hạn và **báo động một sự cố production không hề tồn
tại** (STT hỏng). Sai hoàn toàn. Nguyên nhân thật:

`scripts/eval-tutor.ts` đọc **nguyên chuỗi** `process.env.GROQ_API_KEY` làm Bearer token, trong
khi production đi qua `groqKeyPool()` — hàm tách **nhiều key cách nhau dấu phẩy**.

|                          | Kết quả                                             |
| ------------------------ | --------------------------------------------------- |
| App thật (`groqKeyPool`) | tách đúng 3 key → Groq chạy bình thường             |
| `eval-tutor.ts` (bản cũ) | gửi cả chuỗi `key1,key2,key3` làm token → `401` giả |

Đo thật trên VPS xác nhận: pool có **3 key**, và key đầu tiên trả **`200`**.

**Đã vá cùng lượt:** script nay dùng `groqKeyPool()` + `isSkippableGroqKeyError()`, thử lần lượt
từng key giống hệt production (401/429 → sang key kế, chỉ báo lỗi khi cả bể hỏng). Nhãn provider
in luôn số key để nhìn là biết.

**Bài học chung, đáng nhớ hơn cả bản vá:** _công cụ chẩn đoán phải đọc cấu hình GIỐNG HỆT
production_ — nếu không, nó đo chính nó chứ không đo hệ thống, và người đọc kết luận sai về
một thứ vốn đang khoẻ mạnh.
