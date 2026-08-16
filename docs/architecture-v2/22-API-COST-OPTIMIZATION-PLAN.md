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
- Tên model không hard-code trong handler. Model text, voice, STT, batch/eval và fallback được
  truyền qua biến môi trường; code chỉ giữ default an toàn để tối giản vận hành.
- Ngân sách API mục tiêu hiện tại: **500–600 triệu VND/tháng cho 10.000 thuê bao hoạt động
  tích cực**, sau đó hạ tiếp dựa trên số liệu production.

Baseline đang dùng: Gemini 2.5 Flash-Lite $0,10/1M input token và $0,40/1M output token; Batch
khoảng một nửa. Giá phải là cấu hình versioned cập nhật từ
[bảng giá Gemini chính thức](https://ai.google.dev/gemini-api/docs/pricing), không là invariant.

### Cấu hình model qua environment

Một nguồn cấu hình server-side duy nhất:

    AI_TEXT_MODEL=gemini-2.5-flash-lite
    AI_VOICE_MODEL=<gemini-voice-model>
    AI_STT_MODEL=<gemini-or-compatible-stt-model>
    AI_BATCH_MODEL=gemini-2.5-flash-lite
    AI_FALLBACK_MODEL=<optional-approved-model>

Nguyên tắc vận hành:

- đổi model bằng environment + PM2 reload, không sửa code, build lại frontend hoặc đổi client;
- mọi handler đọc qua một typed model config chung, không tự đọc env theo cách riêng;
- startup phải validate model/provider/capability compatibility và fail-fast khi cấu hình sai;
- allowlist chặn model không được phê duyệt hoặc vượt cost/risk tier;
- model config đi kèm version trong usage receipt để cost/quality truy ngược được;
- fallback rỗng nghĩa là không fallback, tránh vô tình gọi provider thứ hai;
- secret API key vẫn tách khỏi model name; không đưa cả hai vào response, log hoặc frontend bundle;
- production/staging/test có env riêng; test dùng fake provider và không gọi API trả phí.

Trong giai đoạn compatibility, adapter map các biến cũ như GEMINI_MODEL, GEMINI_TTS_MODEL,
GROQ_CHAT_MODEL và ANTHROPIC_MODEL sang config chung. Sau retention window mới bỏ alias, tránh
big-bang và giảm thao tác chuyển đổi.

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

## 6. Giải thích chi tiết cách đạt các mức giảm

Các tỷ lệ dưới đây là target kỹ thuật, không phải số cộng cơ học. Nhiều biện pháp tác động lên cùng
một request nên tổng cuối phải đo bằng production baseline và cohort rollout.

### 6.1 Giảm 35–55% số lần gọi API/người dùng

#### Nguồn 1 — Deterministic/local resolver: 15–25%

Không gọi model cho greeting, acknowledgement, navigation, quota/error message, dictionary, CEFR,
SRS, progress, static lesson turn, format validation và các lỗi grammar/pronunciation đã có rule.

    User input
      → local/rule detector
      → giải quyết được: trả structured result, 0 provider call
      → không giải quyết được: tiếp tục safe cache/Gemini

Ví dụ câu cơ bản đã đúng chỉ cần feedback mẫu ngắn; không gửi Gemini để nhận một câu xác nhận.
Learning-specific rule nằm trong Learning domain, không đưa vào platform core.

#### Nguồn 2 — Safe exact cache: 10–20%

Các yêu cầu như giải thích một cấu trúc, từ vựng, câu mẫu hoặc rubric thường lặp giữa người học.
Shared cache key phải gồm task, normalized input, locale, level, prompt/rubric/model version.
Personal context chỉ được user/session cache TTL ngắn, không cross-user.

Cache structured result thay vì raw personalized wording để client render boilerplate. Cache miss
mới được phép đi tiếp tới budget gateway.

#### Nguồn 3 — Chống request trùng: 3–8%

- disable/debounce double-submit ở client;
- Idempotency-Key cho mỗi task;
- server single-flight theo user + task + payload hash;
- retry dùng lại cùng key;
- AbortController hủy request chưa vào provider khi người dùng rời trang;
- request trùng nhận lại pending/result, không tạo call thứ hai.

Mobile network, double-click, React effect hoặc timeout không được biến một intent thành nhiều call.

#### Nguồn 4 — Gom memory cuối phiên: 5–15%

Không chạy memory extraction sau mỗi message/event. Event trong một session được deterministic
dedup, rồi gom thành một Gemini Batch job khi kết thúc hoặc vượt threshold. Latest-state-wins cho
job chưa chạy. Một phiên 12 message tạo tối đa một memory job, không tạo 12 call.

#### Nguồn 5 — Giới hạn fallback: 1–5%

Luồng hiện tại có thể Groq lỗi → Anthropic lỗi → Gemini. Luồng V2 dùng Gemini primary và tối đa một
fallback. Chỉ timeout, 429 và 5xx là retryable; validation/4xx dừng ngay. Circuit breaker ngăn retry
storm và không provider race trong luồng thường.

| Nguồn | Target riêng |
| --- | ---: |
| Deterministic/local | 15–25% |
| Safe exact cache | 10–20% |
| Chống request trùng | 3–8% |
| Memory cuối phiên | 5–15% |
| Giới hạn fallback | 1–5% |
| **Tổng sau khi loại phần chồng lấn** | **35–55%** |

### 6.2 Giảm 50–75% input token

#### Nguồn 1 — Summary + 4–6 lượt gần nhất: 45–70%

Không gửi mặc định tối đa 30 message ở mọi lượt. Context mục tiêu:

    system instruction ngắn
      + session summary
      + relevant facts/goals
      + 4–6 turns gần nhất
      + current message

Một phiên 30 lượt có thể giảm từ khoảng 7.000–12.000 input token ở lượt cuối xuống khoảng
1.500–3.000 token. Summary chỉ giữ mục tiêu, chủ đề, lỗi quan trọng, item cần luyện và việc chưa
xong; không sao chép transcript.

Summary được cập nhật cuối phiên, khi context vượt ngưỡng hoặc chuyển chủ đề lớn; không gọi model
summary sau từng message.

#### Nguồn 2 — System instruction chuẩn: 3–10%

callGemini() hiện giả lập system bằng một user message và một model acknowledgement. V2 dùng
systemInstruction thật, bỏ cặp message giả lặp ở mọi request và tạo điều kiện dùng context cache.

#### Nguồn 3 — Retrieval có chọn lọc: 10–30%

Context Builder lọc theo intent → domain → goal relevance → permission → sensitivity → freshness →
token budget. Câu hỏi grammar không được mang theo toàn bộ profile, curriculum, dictionary, payment
hoặc memory không liên quan. Chỉ đoạn dữ liệu được retrieve mới vào prompt.

#### Nguồn 4 — Bỏ boilerplate và đặt budget theo task: 5–15%

Model chỉ trả field biến đổi như score/correction/reason; label, heading và text cố định do client
render. Không có lỗi thì không sinh explanation dài. Output budget khởi điểm:

| Task | Output target |
| --- | ---: |
| Greeting/navigation | 0 token AI |
| Chat | 192–320 |
| Correction | 256–384 |
| Speaking feedback | 320–512 |
| Writing evaluation | 640–1.024 |
| Session summary/memory | 256–512 qua Batch |

| Nguồn | Target riêng |
| --- | ---: |
| Summary + 4–6 turns | 45–70% |
| System instruction chuẩn | 3–10% |
| Selective context retrieval | 10–30% |
| Bỏ boilerplate/budget task | 5–15% |
| **Tổng sau khi loại phần chồng lấn** | **50–75%** |

### 6.3 Giảm 40–60% thời lượng voice tính phí

#### Nguồn 1 — VAD và silence trimming: 15–30% audio input

Client chỉ bắt đầu/gửi khi có giọng nói, cắt silence đầu/cuối, dừng sau khoảng im lặng và bỏ đoạn chỉ
có noise. Push-to-talk là mặc định; continuous mode có quota riêng. Server tự đo duration thật,
không tin số giây client khai.

Ví dụ ghi âm 30 giây nhưng chỉ có 17 giây lời nói thì payload mục tiêu khoảng 18 giây, không gửi cả
30 giây.

#### Nguồn 2 — Chỉ nói phần cốt lõi: 15–30% audio output

Gemini Voice đọc câu trả lời hội thoại, câu sửa đúng, giải thích ngắn và câu mẫu cần bắt chước.
Phân tích grammar dài, rubric, danh sách lỗi và writing feedback hiển thị text. Một response 120 từ
có thể chỉ cần đọc 25–40 từ quan trọng.

#### Nguồn 3 — Replay/cache: 10–30% lượt sinh audio

Nghe lại dùng buffer/file đã nhận; slow playback đổi tốc độ phía client, không tạo audio mới.
Static lesson/story/reference được Gemini pre-generate theo popularity + shared cache; phần ít dùng
cache-on-demand. Personalized live turn chỉ session-cache và không shared-cross-user.

#### Nguồn 4 — Một pipeline voice: 5–15%

Nếu Gemini Voice đã trả audio thì không gọi thêm TTS để đọc cùng nội dung. Mỗi speaking turn có một
audio source authoritative. Khi Gemini Live đáp ứng quality/cost gate, một session có thể thay chuỗi
STT → chat → TTS tách rời; vẫn phải benchmark trước cutover.

Server áp duration budget khởi điểm:

| Task | Duration target |
| --- | ---: |
| Pronunciation một câu | 10–20 giây |
| Speaking turn | 20–30 giây |
| Deep speaking exercise | tối đa 60 giây, quota riêng |
| Continuous conversation | quota phút/session |

| Nguồn | Target riêng |
| --- | ---: |
| VAD/silence trim | 15–30% input audio |
| Chỉ nói phần cốt lõi | 15–30% output audio |
| Replay/cache | 10–30% lượt sinh lại |
| Một pipeline voice | 5–15% |
| **Tổng sau khi loại phần chồng lấn** | **40–60%** |

### 6.4 Cách chứng minh

Ghi baseline 7–14 ngày: calls/DAU, input/output token theo task, audio input/output seconds, cache
hit/miss, provider attempts, actual cost theo plan, completion/learning outcome và p95 latency.

Rollout theo cohort 5% → 25% → 50% → 100%. Chỉ công nhận tiết kiệm khi cost giảm mà success rate,
quality, learning outcome, privacy và latency không regression. Wave 0 usage receipt là điều kiện
bắt buộc trước mọi tuyên bố phần trăm.

## 7. Quota và hard cost cap

Mỗi plan có: feature turns, text token quota, voice-minute quota và monetary hard cap.

- 70%: dashboard cảnh báo.
- 85%: giảm context/output, tắt automatic escalation.
- 95%: text/deterministic/cache only.
- 100%: chặn provider call mới; offline/cache learning vẫn hoạt động và hiển thị thời điểm reset.

Monetary cap không fail-open. Provider lỗi refund entitlement/usage hợp lý nhưng không xoá receipt
của attempt đã phát sinh chi phí.

## 8. Kế hoạch PR nhỏ

### Wave 0 — Đo đúng (P0)

1. Usage receipt contract: parse usageMetadata, attempts, tokens, audio seconds, cache, latency.
2. Cost ledger + dashboard: actual/estimated theo plan, feature, model, cache và fallback.

**Gate:** ≥95% call có receipt; ledger lệch billing provider <10% trong 7 ngày.

### Wave 1 — Quick wins không đổi UX (P0)

3. Idempotency, double-submit guard và single-flight.
4. Mode-specific token budgets + system instruction chuẩn.
5. Typed environment model config; Gemini Flash-Lite primary, một fallback, retry classification
   + circuit breaker.
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

## 9. Module dự kiến

- packages/core-ai/ai.ts, aiConfig.ts và geminiApi.ts: router, token/context budget.
- packages/core-ai/modelConfig.ts: typed environment config, default, allowlist và startup validation.
- packages/core-ai/aiCost.ts: actual receipt + price version thay estimate cố định.
- packages/core-ai/tts.ts, geminiTts.ts và stt.ts: audio seconds, VAD contract, Gemini voice.
- packages/core-billing/usage.ts: token/minute/cost quota và reservation/refund.
- packages/core-contracts: usage receipt, budget decision, provider attempt.
- packages/core-db: append-only cost ledger, idempotency và job coalescing.
- api/admin-usage-stats.ts: actual cost, cache/fallback/escalation metrics.
- apps/english/src/lib/ai.ts và speaking UI: dedup, cancel, context summary và replay.

Tên/path cuối phải theo ADR boundary; Learning rubric không đặt vào platform core.

## 10. Không làm

- Không đổi model chỉ vì rẻ nếu learning outcome giảm.
- Không cache personalized response xuyên user hoặc lưu raw prompt/audio vào cost ledger.
- Không cho client quyết định model, quota, token budget hoặc cost.
- Không retry vô hạn, provider race hoặc agent loop không giới hạn.
- Không pre-generate toàn bộ tổ hợp audio.
- Không dùng vector DB/context dài trước khi structured retrieval chứng minh chưa đủ.
- Không xoá provider/cache v1 trước parity, canary và rollback evidence.

## 11. Definition of Done

- Actual cost trace được đến capability/model/provider attempt.
- ≥35% intent không cần provider hoặc được safe-cache.
- Input token/turn giảm ≥50%; audio billed minutes giảm ≥40%.
- Fallback/escalation <5% tổng cost.
- Hard cap không bypass bằng retry/concurrency.
- Quality, learning outcome, privacy và latency không regression.
- 10.000 thuê bao tích cực nằm trong budget đã chốt và cost/ARPPU đạt ngưỡng lợi nhuận.
