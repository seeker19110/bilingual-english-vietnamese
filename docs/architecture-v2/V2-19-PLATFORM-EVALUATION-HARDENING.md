# V2-19 — Platform evaluation and hardening

| Thuộc tính | Giá trị                                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                      |
| Phụ thuộc  | V2-06, V2-07, V2-09, V2-13/V2-14 (có ≥ 2 domain để đo handoff), V2-18                                                                                                             |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-19 — Platform evaluation and hardening"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 17 (Evaluation), 18 (Security and privacy) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: nền tảng có **bộ đo chạy được và ngưỡng chặn**, thay cho cảm nhận chủ quan; đồng thời chịu
được thử nghiệm đối kháng (prompt injection, lạm dụng tool) và có diễn tập quyền riêng tư.

Bộ đo bắt buộc (mục 17 kiến trúc + roadmap):

| Nhóm         | Chỉ số                                                        |
| ------------ | ------------------------------------------------------------- |
| Định tuyến   | độ chính xác intent/domain                                    |
| Context      | precision/recall/relevance của item đưa vào context           |
| Memory       | tỉ lệ sửa memory, tỉ lệ false memory                          |
| Quyền        | tỉ lệ tuân thủ permission, rò rỉ context nhạy cảm             |
| Capability   | tỉ lệ chọn đúng capability, tỉ lệ thành công, chi phí, độ trễ |
| Xác nhận     | tỉ lệ người dùng từ chối `ProposedAction`                     |
| Xuyên domain | tỉ lệ handoff thành công                                      |
| Outcome      | chất lượng kết quả theo Decision Ledger                       |
| Vận hành     | lỗi, fallback, chi phí, độ trễ                                |

Kèm: bộ red-team prompt injection / tool abuse, và diễn tập privacy (export/delete).

Dự án đã có tiền lệ `npm run eval:tutor` + `docs/research/eval-tutor-baseline.md`; phase này mở rộng
mô hình đó lên tầng platform, không phát minh cơ chế mới.

## 2. Entities / schema sketch

Chủ yếu là artefact test/dataset trong repo, không phải bảng dữ liệu người dùng. Nếu cần lưu kết quả
theo thời gian:

```
personal.eval_runs                  -- append-only, dữ liệu hệ thống (không phải của người dùng)
  id uuid pk, suite text not null, commit_sha text not null
  started_at, finished_at timestamptz
  metrics jsonb not null            -- {routingAccuracy, contextPrecision, ...}
  passed boolean not null
  created_at timestamptz not null default now()
```

Dataset đánh giá **không được chứa dữ liệu người dùng thật** (ràng buộc `AI_DELIVERY_LOOP.md` mục 7).

## 3. API / service contract sketch

Không có API người dùng. Đầu ra là lệnh chạy được và cổng CI:

```
npm run eval:platform          -- chạy toàn bộ suite, in bảng so baseline
npm run eval:platform -- --suite=routing|context|memory|permission|redteam|privacy
npm run eval:redteam           -- bộ tấn công prompt injection / tool abuse
npm run drill:privacy          -- export + delete end-to-end trên tài khoản thử
```

Mỗi suite trả về `metrics` + `passed`, so với file baseline có phiên bản trong repo (mô hình giống
`eval-tutor-baseline.md`).

## 4. Invariant và gate

Invariant:

1. Chỉ số **không được tụt** so với baseline đã chốt; PR làm tụt phải giải trình hoặc bị chặn.
2. Suite red-team chạy trong CI với chi phí provider bằng 0 (dùng mock/ghi lại phản hồi).
3. Diễn tập privacy phải xoá được **toàn bộ** dữ liệu của một person qua mọi schema
   (`personal`, `english`/learning, và các domain đã có) — không sót bảng.
4. Log/telemetry không chứa nội dung nhạy cảm thô; trace prompt/context phải redact được (mục 18).
5. Đánh giá permission phải bao gồm ca revoke giữa chừng.

Gate coi là đạt phase:

- toàn bộ 9 nhóm chỉ số có số đo thật + baseline được ghi lại;
- ngưỡng chặn được cấu hình và CI thực sự đỏ khi vi phạm (chứng minh bằng một lần cố tình vi phạm);
- red-team suite có ≥ N ca (N cần owner chốt) và 0 ca vượt qua được lớp policy;
- diễn tập export/delete hoàn tất, có báo cáo đối chiếu số bảng/bản ghi.

## 5. Phụ thuộc và thứ tự triển khai

1. Dựng dataset đánh giá tổng hợp (không dùng dữ liệu thật).
2. Suite deterministic trước (permission, privacy, routing) — rẻ và ổn định.
3. Suite cần LLM sau (context relevance, memory) với ghi lại phản hồi để CI không tốn tiền.
4. Red-team suite.
5. Chốt baseline + bật ngưỡng chặn CI.

## 6. Rủi ro và giả định

- **Rủi ro:** đo bằng dataset tự tạo dễ "tự chấm điểm cho mình". Giảm thiểu: dataset do người soạn
  độc lập với người viết code tính năng, và ghi rõ giới hạn.
- **Rủi ro:** suite LLM không ổn định (flaky) → CI nhiễu. Giảm thiểu: ghi lại phản hồi, chạy nhiều lần
  khi nghi ngờ (đúng luật flaky ở `AI_DELIVERY_LOOP.md` mục 5).
- **Rủi ro:** chi phí đánh giá thật tốn tiền API; cần ngân sách riêng.
- **Giả định:** đã có ≥ 2 domain production để đo cross-domain handoff — nếu chưa, chỉ số đó chưa đo được.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                       | Vì sao cần owner                     | Ảnh hưởng nếu chọn sai                    |
| ------------------------------------------------------------- | ------------------------------------ | ----------------------------------------- |
| Ngưỡng chặn cụ thể cho từng chỉ số là bao nhiêu?              | Đánh đổi chất lượng/tốc độ phát hành | Ngưỡng quá cao → không bao giờ merge được |
| Dataset đánh giá do ai soạn và ai duyệt?                      | Tính độc lập của phép đo             | Tự soạn tự chấm → số đẹp nhưng vô nghĩa   |
| Có được dùng dữ liệu production đã ẩn danh để đánh giá không? | Quyền riêng tư, quyết định pháp lý   | Dùng sai → vi phạm cam kết với người dùng |
| Ngân sách API cho eval mỗi tháng là bao nhiêu?                | Quyết định tài chính                 | Vượt ngân sách hoặc bỏ eval vì tốn        |
| Red-team cần bao nhiêu ca và ai đóng vai tấn công?            | Cần chuyên môn bảo mật               | Bộ ca yếu → cảm giác an toàn giả          |
| Chỉ số nào chặn CI, chỉ số nào chỉ theo dõi?                  | Ảnh hưởng nhịp phát hành             | Chặn hết → tắc; không chặn gì → vô dụng   |

## 8. Không làm

- Không dùng dữ liệu người dùng thật trong test.
- Không gọi API trả phí trong CI mặc định.
- Không hạ ngưỡng để test xanh (cấm rõ ở `AI_DELIVERY_LOOP.md` mục 5).
- Không xây hệ thống quan sát/observability thương mại phức tạp trong phase này.
- Không tối ưu hiệu năng sâu — đó là V2-20.
