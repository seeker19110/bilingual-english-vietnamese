# Eval gia sư AI — baseline (⑤ T1)

> ⏳ **CHƯA CÓ SỐ LIỆU BASELINE.** File này sẽ được ghi đè tự động khi chạy:
>
> ```bash
> # cần GEMINI_API_KEY (hoặc GROQ_API_KEY / ANTHROPIC_API_KEY) trong .env
> npm run eval:tutor -- --write-baseline            # chế độ chat
> npm run eval:tutor -- --mode both --write-baseline # cả chat + speaking
> ```
>
> Sandbox của Claude không có key AI nên KHÔNG chạy tự động ở đây — người có key chạy 1 lệnh
> để sinh số baseline. Chi phí 1 lần chạy ≈ vài cent (≈ 60 câu × model rẻ; Groq free-tier là $0).

## Đây là gì

Bộ đo chất lượng **sửa lỗi của gia sư AI** trước khi đụng vào prompt/model — để không "đổi mù".

- **Golden set:** `scripts/eval-tutor-fixtures.json` — ~60 câu học viên giả lập: các nhóm lỗi
  điển hình của người Việt (`VIET_COMMON_ERRORS` trong `src/prompts`), câu ĐÚNG (đo bịa lỗi),
  và ca biên (trộn Việt–Anh, 1 từ, emoji).
- **Script:** `scripts/eval-tutor.ts` — gọi ĐÚNG prompt + model + guardrail production
  (`src/prompts`, `api/_lib/aiConfig.ts`) rồi chấm tự động bằng `scripts/lib/evalScoring.ts`.

## Chỉ số

| Chỉ số          | Ý nghĩa                                                        | Hướng tốt                                        |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| **Recall**      | bắt được lỗi thật / tổng câu có lỗi                            | cao (ít bỏ sót)                                  |
| **Precision**   | báo lỗi đúng / tổng lần báo lỗi                                | cao (ít bịa)                                     |
| **FP-rate**     | bịa lỗi trên câu đúng/ca biên                                  | **thấp** (với người mới, sửa SAI hại hơn bỏ SÓT) |
| **Feedback VI** | nhận xét (chiều A) đúng bằng tiếng Việt                        | cao                                              |
| **JSON hợp lệ** | câu trả lời speaking đúng schema `{speech,feedback,corrected}` | cao                                              |
| **Type-hit\***  | (gần đúng, bằng từ khoá) nhận xét nhắm đúng loại lỗi           | tham khảo                                        |

\* Type-hit chỉ là tín hiệu tham khảo — feedback tự do nên không match chính xác được.

## Kết quả

_Chạy lệnh ở đầu file để điền bảng này._

## Quy trình bắt buộc (CLAUDE.md §8)

Mọi PR đổi **prompt** (`src/prompts/*`) hoặc **model** (`api/_lib/aiConfig.ts`) PHẢI:

1. Chạy lại `npm run eval:tutor` (chế độ liên quan).
2. Dán bảng **so sánh với baseline này** vào mô tả PR.
3. Điều kiện merge (⑤ T2): recall/precision **không được tụt** so với baseline.
