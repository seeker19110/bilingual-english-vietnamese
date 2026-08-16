# Đồng Hành V2 — Kế hoạch giảm số lần gọi và chi phí API

**Trạng thái:** Proposed — cần owner phê duyệt trước implementation  
**Ngày lập:** 2026-08-16  
**Phạm vi:** chat, writing, speaking, STT, voice, pronunciation, memory/context và agent  
**Mục tiêu:** giảm API mà không giảm learning outcome, độ an toàn hoặc continuity của V2

## 1. Quyết định đã chốt

- Hội thoại, sửa lỗi, đánh giá và agent V2 dùng **Gemini 2.5 Flash-Lite** mặc định.
- Voice V2 dùng **Gemini**, không dùng Google Cloud TTS.
- Thứ tự ưu tiên: deterministic → cache → Gemini Flash-Lite → model mạnh hơn.
- Gemini Voice chỉ dùng cho tương tác cần voice; nội dung dài ưu tiên text.
- Audio tái sử dụng phải cache; memory cập nhật cuối phiên, không gọi model sau mỗi message.
- Mọi gói có quota voice và hard cost cap phía server.
- Ngân sách API mục tiêu hiện tại: **500–600 triệu VND/tháng cho 10.000 thuê bao hoạt động
  tích cực**, sau đó hạ tiếp dựa trên số liệu production.

Baseline đang dùng: Gemini 2.5 Flash-Lite $0,10/1M input token và $0,40/1M output token; Batch
khoảng một nửa. Giá phải là cấu hình versioned cập nhật từ
[bảng giá Gemini chính thức](https://ai.google.dev/gemini-api/docs/pricing), không là invariant.

## 2. Audit hiện trạng

### Điểm đã tối ưu tốt — phải giữ

- TTS tra tts_cache trước provider và cache dùng chung giữa user.
- tts_cache_pending chống nhiều request cùng sinh một audio.
- Nội dung phổ biến có seed/prefetch; chạy lại bỏ qua cache hit.
- Usage gate, rate limit, concurrency limit và refund khi provider lỗi đã có.
- Từ điển, curriculum, CEFR và SRS chủ yếu chạy local/DB, không gọi AI mỗi lần xem.

### Khoảng trống gây tốn chi phí

1. packages/core-ai/ai.ts hiện ưu tiên Groq → Anthropic → Gemini, trái với đích V2. Một lượt lỗi
   có thể gọi hai hoặc ba provider.
2. Client gửi lại system prompt và lịch sử; server cho tối đa 30 message/40.000 ký tự.
3. callGemini() giả lập system bằng một cặp user/model xác nhận, lặp ở mọi request.
4. max tokens mặc định 1.024 và trần 2.048 cho mọi mode, chưa có budget theo task.
5. Dashboard dùng USD/lượt ước tính; chưa đo token, audio seconds, cache và provider attempts thật.
6. Một lượt speaking động có thể cần STT → LLM → voice; pronunciation gọi Azure riêng.
7. STT chưa có VAD/silence trim và duration budget authoritative tại server.
8. Chưa có exact-response cache, idempotency hoặc single-flight cho evaluation/chat trùng.
9. Nếu V2 gọi model theo mỗi event hoặc để agent loop tự do, chi phí sẽ nhân rất nhanh.

## 3. North-star metrics

| Metric | Mục tiêu sau Wave 1–3 |
| --- | --- |
| API calls / active user / day | giảm 35–55% |
| Input tokens / successful turn | giảm 50–75% |
| Output tokens / successful turn | giảm 25–45% |
| Audio billed seconds / active user | giảm 40–60% |
| Audio cache hit cho nội dung tĩnh | ≥90% |
| Provider attempts / successful turn | p95 ≤1, tối đa 2 |
| Fallback/escalation cost | <5% tổng inference |
| Cost / paid active user / month | ≤20–25% ARPPU |
| Learning outcome và quality | không regression |

Chi phí authoritative của một request:

    request_cost =
      input_tokens × input_price
      + output_tokens × output_price
      + cached_input_tokens × cached_price
      + audio_input_seconds × audio_input_price
      + audio_output_seconds × audio_output_price
      + tool/provider surcharges

Không lưu raw prompt/audio chỉ để đo tiền. Receipt chỉ chứa requestId, personId băm, plan,
feature, model, provider, prompt version, token/audio counts, cache, latency, result và cost.

## 4. Kiến trúc mục tiêu: API Budget Gateway

    Intent
      → Deterministic resolver
      → Safe cache
      → Budget estimator + quota
      → Model/voice router
      → Provider call
      → Usage receipt
      → Cost ledger + outcome

Gateway phải quyết định trước provider call:

- task có thật sự cần AI không;
- cache dùng chung có an toàn hay phải user-scoped;
- context tối thiểu cần thiết;
- model, token/audio budget, timeout và số attempt;
- budget user/plan/day/month còn đủ không;
- khi vượt budget thì trả text, deterministic fallback hay yêu cầu xác nhận.

AI output không được tự tăng budget, tự retry hoặc tự gọi capability tốn tiền.

## 5. Các lớp tiết kiệm

### A — Không gọi API

- Dictionary, CEFR, SRS, progress, quest, achievement, entitlement và validation giữ deterministic.
- Chỉ gọi sửa lỗi khi detector local thấy có khả năng lỗi; câu đúng/đơn giản dùng feedback mẫu.
- Phát âm dùng local phoneme/trap feedback trước; assessment sâu chỉ khi user bấm và còn quota.
- Dùng rubric/rule cho phần cố định của writing/speaking; AI chỉ giải thích điểm cần nhận xét.
- Greeting, navigation, acknowledgement, retry/quota message và static lesson turn không gọi model.
- Debounce double-submit; Idempotency-Key + single-flight theo user/task/payload.
- Hủy request đã bỏ trang trước khi provider call bắt đầu khi có thể.

**Target:** 20–35% intent không cần provider.

### B — Cache đúng phạm vi

- Exact key gồm task + normalized input + locale + level + rubric/prompt/model version.
- Chỉ shared-cache nội dung không có dữ liệu cá nhân: grammar, vocab, câu mẫu và static feedback.
- Personal chat chỉ cache user/session-scoped TTL ngắn; tuyệt đối không cross-user.
- Cache structured result trước, render boilerplate ở client.
- Negative cache ngắn khi provider overload để tránh retry storm.
- Gemini audio: seed nội dung tĩnh phổ biến, cache-on-demand phần còn lại; không seed toàn bộ
  tổ hợp câu × giọng.
- Đổi prompt/voice cần version, remap hoặc retention; không tự xoá cache đang phục vụ.

**Target:** ≥90% audio hit nội dung tĩnh; ≥25% exact hit cho giải thích/rubric lặp lại.

### C — Giảm token text

- Gemini 2.5 Flash-Lite là primary; model mạnh hơn chỉ qua escalation policy.
- Dùng systemInstruction thay cặp user/model xác nhận giả.
- Context mỗi turn: session summary + 4–6 turns cuối + facts/goal thật sự liên quan.
- Tóm tắt session khi kết thúc hoặc vượt ngưỡng, không summary mỗi message.
- Memory chỉ ghi candidate cuối phiên qua Batch; deterministic dedup trước model.
- Output target ban đầu: chat 192–320, correction 256–384, speaking feedback 320–512,
  writing 640–1.024, memory/session summary 256–512 qua Batch.
- Response schema ngắn; client dựng label/boilerplate. Không có lỗi thì không sinh giải thích dài.
- Retrieve đúng curriculum/dictionary đoạn cần dùng, không nhét toàn bộ vào prompt.

**Target:** giảm 50–75% input và 25–45% output token/turn.

### D — Voice tiết kiệm

- Voice V2 dùng Gemini. Google Cloud TTS chỉ là compatibility production v1 và rời V2 sau cutover.
- Push-to-talk hoặc client VAD; cắt silence đầu/cuối trước upload.
- Giới hạn duration từng utterance theo task; không stream microphone khi im lặng.
- Gemini Voice chỉ nói câu trả lời/correction cốt lõi; giải thích dài hiển thị text.
- Replay dùng buffer/cache đã nhận, không gọi API lần nữa.
- Static lesson/story/reference dùng Gemini pre-generate + shared cache; personalized live turn dùng
  session cache, không shared-cache.
- Một speaking turn chỉ có một voice pipeline; không tạo text TTS và audio model trùng nội dung.
- Quota tính theo phút audio, không chỉ số request; server từ chối trước provider call.

**Target:** giảm 40–60% audio seconds tính phí.

### E — Router và fallback không nhân chi phí

Router ba tầng: deterministic/cache → Gemini Flash-Lite → model mạnh khi task khó hoặc user yêu cầu.

- tối đa một fallback sau primary;
- chỉ fallback timeout, 429 và 5xx; không fallback validation/4xx;
- circuit breaker dừng provider đang lỗi;
- retry backoff + jitter và giữ idempotency key;
- không gọi song song hai provider để đua trong luồng thường;
- escalation có reason code và budget riêng;
- offline eval quyết định policy, không cho model tự nâng model mỗi turn.

**Target:** provider attempts/success gần 1; fallback cost <5%.

### F — Batch và async

Dùng Gemini Batch cho session summary, memory candidate, weekly insight, content tagging/generation,
offline eval, backfill và aggregate curriculum feedback. Gom nhiều event cùng session thành một job;
latest-state-wins cho job chưa chạy. Batch không được quyết định auth, permission, entitlement hoặc
authoritative state transition.

## 6. Quota và hard cost cap

Mỗi plan có: feature turns, text token quota, voice-minute quota và monetary hard cap.

- 70%: dashboard cảnh báo.
- 85%: giảm context/output, tắt automatic escalation.
- 95%: text/deterministic/cache only.
- 100%: chặn provider call mới; offline/cache learning vẫn hoạt động và hiển thị thời điểm reset.

Monetary cap không fail-open. Provider lỗi refund entitlement/usage hợp lý nhưng không xoá receipt
của attempt đã phát sinh chi phí.

## 7. Kế hoạch PR nhỏ

### Wave 0 — Đo đúng (P0)

1. Usage receipt contract: parse usageMetadata, attempts, tokens, audio seconds, cache, latency.
2. Cost ledger + dashboard: actual/estimated theo plan, feature, model, cache và fallback.

**Gate:** ≥95% call có receipt; ledger lệch billing provider <10% trong 7 ngày.

### Wave 1 — Quick wins không đổi UX (P0)

3. Idempotency, double-submit guard và single-flight.
4. Mode-specific token budgets + system instruction chuẩn.
5. Gemini Flash-Lite primary, một fallback, retry classification + circuit breaker.
6. Context summary + 4–6 turns; shadow/A-B quality.

**Gate:** success rate không giảm; p95 latency không tăng; cost/successful-turn giảm ≥40%.

### Wave 2 — Deterministic/cache (P1)

7. Registry task deterministic/cacheable/realtime-ai/batch-ai.
8. Safe exact cache cho grammar/vocab/rubric, có prompt/model version.
9. Local pre-check và deep-analysis opt-in cho pronunciation/writing.
10. Memory cuối phiên qua Batch, deterministic dedup trước extraction.

**Gate:** không cache leak; quality không regression; API calls/DAU giảm thêm ≥20%.

### Wave 3 — Gemini Voice V2 (P1)

11. Client VAD/silence trim, duration metadata và voice-minute meter.
12. Gemini voice pipeline duy nhất; text-only cho giải thích dài.
13. Gemini static audio seed theo popularity + cache-on-demand + replay local.
14. Canary/parity eval; gỡ Google Cloud TTS khỏi V2 route sau retention window.

**Gate:** voice quality đạt threshold; billed minutes giảm ≥40%; không double-generation; rollback
compatibility route đã diễn tập.

### Wave 4 — Budget enforcement và scale (P1)

15. Per-plan token/minute/cost budgets + degrade ladder.
16. Global daily/monthly hard cap, anomaly detection và kill switch theo capability.
17. Batch scheduler, job coalescing, budget reservation và receipt reconciliation.

**Gate:** concurrency/retry tests xanh; cap không bypass; cached/offline learning vẫn chạy khi tắt
provider.

## 8. Module dự kiến

- packages/core-ai/ai.ts, aiConfig.ts và geminiApi.ts: router, token/context budget.
- packages/core-ai/aiCost.ts: actual receipt + price version thay estimate cố định.
- packages/core-ai/tts.ts, geminiTts.ts và stt.ts: audio seconds, VAD contract, Gemini voice.
- packages/core-billing/usage.ts: token/minute/cost quota và reservation/refund.
- packages/core-contracts: usage receipt, budget decision, provider attempt.
- packages/core-db: append-only cost ledger, idempotency và job coalescing.
- api/admin-usage-stats.ts: actual cost, cache/fallback/escalation metrics.
- apps/english/src/lib/ai.ts và speaking UI: dedup, cancel, context summary và replay.

Tên/path cuối phải theo ADR boundary; Learning rubric không đặt vào platform core.

## 9. Không làm

- Không đổi model chỉ vì rẻ nếu learning outcome giảm.
- Không cache personalized response xuyên user hoặc lưu raw prompt/audio vào cost ledger.
- Không cho client quyết định model, quota, token budget hoặc cost.
- Không retry vô hạn, provider race hoặc agent loop không giới hạn.
- Không pre-generate toàn bộ tổ hợp audio.
- Không dùng vector DB/context dài trước khi structured retrieval chứng minh chưa đủ.
- Không xoá provider/cache v1 trước parity, canary và rollback evidence.

## 10. Definition of Done

- Actual cost trace được đến capability/model/provider attempt.
- ≥35% intent không cần provider hoặc được safe-cache.
- Input token/turn giảm ≥50%; audio billed minutes giảm ≥40%.
- Fallback/escalation <5% tổng cost.
- Hard cap không bypass bằng retry/concurrency.
- Quality, learning outcome, privacy và latency không regression.
- 10.000 thuê bao tích cực nằm trong budget đã chốt và cost/ARPPU đạt ngưỡng lợi nhuận.
