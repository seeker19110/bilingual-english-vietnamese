# V2 — Chiến lược model API theo tác vụ

## Trạng thái

**Accepted baseline — 2026-08-16.** Đây là baseline để triển khai và benchmark, không phải cam kết giữ vĩnh viễn một vendor/model. Mọi thay đổi production phải đi qua Phase 23 Model Router, Phase 32 AI Benchmark và Phase 36 Cost Intelligence.

## Quyết định

1. Không dùng một model chung cho mọi tác vụ.
2. Business code gọi `task_id`/capability; chỉ Model Router biết provider và model cụ thể.
3. Ưu tiên xử lý deterministic, dữ liệu có sẵn, template và cache trước khi gọi model.
4. Model rẻ chỉ được dùng khi vượt quality/safety floor; model mạnh chỉ được escalation khi có lý do quan sát được.
5. Toàn bộ model/provider/giá/budget được cấu hình server-side qua environment/registry; client không chọn model.
6. Không chạy đồng thời nhiều model cho mọi lượt. Chỉ retry/escalate khi lỗi provider, schema invalid, confidence thấp hoặc task thuộc nhóm chất lượng cao.
7. Preview model không được làm fallback cuối duy nhất cho luồng production quan trọng.

## Baseline routing

| Task class                                                 | Primary baseline                 | Escalation/fallback                              | Ghi chú                                                 |
| ---------------------------------------------------------- | -------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `tutor.chat`, giải thích ngắn, sửa một câu                 | `gemini-2.5-flash-lite`          | model đã benchmark theo registry                 | Mặc định khối lượng lớn                                 |
| `tutor.speaking_feedback`                                  | `gemini-2.5-flash-lite`          | Gemini 2.5 Flash khi confidence/schema không đạt | STT tách riêng                                          |
| `assessment.writing`, rubric mở, bài dài                   | `gemini-2.5-flash`               | moderation/fallback đã duyệt                     | Không dùng Flash cho chat thường                        |
| memory extraction, summary, diễn đạt kế hoạch              | `gemini-2.5-flash-lite`          | bỏ ghi nếu confidence thấp                       | AI chỉ đề xuất state                                    |
| diagnostic, mastery, SRS, entitlement, billing, permission | deterministic                    | không có model fallback                          | Model không quyết định invariant                        |
| speech-to-text Anh–Việt                                    | Groq `whisper-large-v3-turbo`    | model STT dự phòng đã benchmark                  | Đo theo giây audio                                      |
| pronunciation phoneme tiếng Anh                            | Azure Pronunciation Assessment   | browser/rule fallback                            | Không áp English assessor cho tiếng Việt                |
| voice hội thoại/narration                                  | Gemini voice model theo registry | cache/pre-generated/fallback đã duyệt            | Voice dùng Gemini; không phụ thuộc TTS text provider cũ |

Tên model trên là baseline hiện hành. Registry phải cho phép đổi qua environment mà không sửa frontend.

## Environment contract mục tiêu

```env
AI_PROVIDER_PRIMARY=gemini
AI_PROVIDER_FALLBACK=groq

AI_MODEL_CHAT=gemini-2.5-flash-lite
AI_MODEL_CORRECTION=gemini-2.5-flash-lite
AI_MODEL_SPEAKING_FEEDBACK=gemini-2.5-flash-lite
AI_MODEL_WRITING=gemini-2.5-flash
AI_MODEL_ASSESSMENT=gemini-2.5-flash
AI_MODEL_MEMORY=gemini-2.5-flash-lite
AI_MODEL_CURRICULUM=gemini-2.5-flash-lite

STT_PROVIDER_PRIMARY=groq
STT_MODEL_PRIMARY=whisper-large-v3-turbo
STT_MODEL_FALLBACK=whisper-large-v3

VOICE_PROVIDER_PRIMARY=gemini
GEMINI_VOICE_MODEL=<stable-or-approved-preview-from-registry>
```

Trong giai đoạn tương thích, server có thể đọc `AI_MODEL_CHAT ?? GEMINI_MODEL ?? default`. Biến cũ chỉ bị xóa sau khi có migration, telemetry và rollback.

## Routing contract

Input tối thiểu:

- `task_id`, locale/direction, plan/tier;
- structured-output requirement;
- context/output budget;
- latency class và quality floor;
- privacy/region constraint;
- request/session correlation ID.

Output tối thiểu:

- provider/model/version đã chọn;
- policy version và reason code;
- timeout, retry/escalation chain;
- input/output token hoặc audio seconds;
- estimated/actual cost và latency;
- schema/confidence/quality result.

Không log nội dung nhạy cảm chỉ để tính chi phí.

## Cơ chế giảm chi phí bắt buộc

- deterministic-first cho mastery, SRS, diagnostic stop rule, quiz đóng, curriculum prerequisite, billing và permission;
- semantic/context selection trước prompt; không gửi toàn bộ lịch sử;
- rolling summary có version và chỉ cập nhật khi đủ thay đổi;
- structured output ngắn, giới hạn output theo task;
- cache nội dung/voice an toàn với key gồm locale, voice, provider và version;
- pre-generate nội dung lặp lại; batch cho workload không realtime;
- debounce/dedupe/idempotency để một hành động người dùng không phát sinh nhiều lượt;
- escalation có điều kiện, không gọi model mạnh mặc định;
- hard budget theo user/plan/task/ngày/tháng và circuit breaker theo provider.

Mục tiêu V2 cần được kiểm chứng bằng telemetry, không coi là số đảm bảo trước đo:

- giảm 35–55% số lần gọi API/người dùng;
- giảm 50–75% input token;
- giảm 40–60% thời lượng voice tính phí.

## Quality và release gate

Một route chỉ được phát hành khi:

- đạt threshold correctness, CEFR fit, pedagogy, safety và structured-output của task;
- không regression đáng kể so với baseline/holdout;
- p95 latency và cost/task trong budget;
- fallback, timeout, provider outage và malformed response được test;
- model/provider/version/prompt/policy có provenance;
- canary và rollback environment switch đã diễn tập.

Flash-Lite không tự động được chấp nhận chỉ vì rẻ; Flash không tự động được chọn chỉ vì mạnh hơn.

## Liên kết phase

- Phase 14 Tutor Agent: dùng `task_id`, không hard-code vendor.
- Phase 23 Model Router: triển khai registry, policy và escalation trong tài liệu này.
- Phase 27 Voice Intelligence: áp dụng registry/cache/usage cho Gemini voice.
- Phase 32 AI Benchmark: sở hữu quality floor và regression gate.
- Phase 36 Cost Intelligence: sở hữu ledger, budget và reconciliation.
- Phase 38 Backward Compatibility: migration từ `GEMINI_MODEL`/model hard-code.
- Phase 45 Final Audit: đối chiếu config, telemetry, benchmark và hóa đơn thực.
