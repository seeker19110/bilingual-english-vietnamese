# PROJECT.md — Đồng Hành: hiện trạng sản phẩm và đích V2

> Đây là bản mô tả sản phẩm cấp cao. `PROGRESS.md` là nguồn trạng thái thực thi; code, migration,
> test và production evidence mới là nguồn xác nhận một khả năng đã hoạt động.

## 1. Tầm nhìn đã chốt

Đồng Hành là **Personal AI Companion đa lĩnh vực**, không chỉ là app học tiếng Anh. Sản phẩm cần
hiểu đúng người dùng xuyên thời gian, giúp biến mục tiêu thành quyết định/kế hoạch/hành động, kết
nối kết quả giữa các domain, và luôn giữ người dùng kiểm soát dữ liệu lẫn quyền thực thi.

Giá trị cốt lõi:

1. continuity xuyên phiên, thiết bị, thời gian và domain;
2. dữ liệu cá nhân có nguồn gốc, độ tin cậy, mức nhạy cảm và vòng đời rõ ràng;
3. AI lập kế hoạch và đề xuất, domain engine mới quyết định state transition;
4. quyền đọc/ghi/tự động hoá theo purpose, scope, expiry và có thể revoke;
5. học từ outcome thật, không biến suy đoán của model thành sự thật.

## 2. Sản phẩm production hiện tại

Domain đầu tiên là **Learning**, với ứng dụng gia sư AI song ngữ Việt ⇄ Anh tại
<https://en-vi.donghanhcungban.org>.

Khả năng đang có:

- auth email/password + Google, session và email verification;
- chat, writing, speaking, STT, phản hồi voice và chấm cuối phiên;
- từ vựng theo chủ đề, CEFR A1–C2, SRS, phát âm, từ điển 12.000+ mục và truyện;
- tiến độ đồng bộ PostgreSQL, streak, challenge, quest, achievement, referral và push/email;
- Free / Pro / VIP, hạn mức server-side, VietQR/SePay, lịch sử thanh toán và admin controls;
- hub đa lĩnh vực mới ở mức experience shell; chưa sở hữu Personal OS business truth.

Production vẫn là Learning-centric. Personal World Model, Life Graph, Knowledge Fabric, Context
Engine và Companion Runtime chưa được tuyên bố là đã chạy thật chỉ vì contract/tài liệu đã tồn tại.

## 3. AI và voice

### Hiện tại

- Chat đi qua server-side gateway với chuỗi provider để giữ khả dụng và kiểm soát usage/cost.
- STT dùng Whisper qua Groq/OpenAI theo cấu hình.
- Voice/TTS hiện có Google Cloud TTS, ElevenLabs cho một số tier và Gemini native audio cho nội
  dung phù hợp; audio được cache/mã hoá qua storage abstraction.

### Định hướng đã chốt

- **Gemini là engine chính mục tiêu cho hội thoại và trải nghiệm voice mới.**
- Không xây kiến trúc phụ thuộc cứng vào một model: Gemini đi sau `AI Platform` / capability
  contract để có thể benchmark, đổi model, fallback và kiểm soát chi phí.
- Provider cũ chỉ được loại bỏ khi telemetry, quality eval, latency/cost, parity và rollback gate
  chứng minh migration an toàn.
- Voice tương lai ưu tiên trải nghiệm hội thoại Gemini end-to-end thay vì ghép thêm TTS rời cho
  luồng companion mới; TTS hiện hữu vẫn được giữ cho nội dung đọc/cache và compatibility trong
  giai đoạn chuyển tiếp.

## 4. Mô hình kinh doanh

Đồng Hành không còn ở trạng thái “chưa có thanh toán”. Production đã có:

- gói Free / Pro / VIP;
- giá và feature flags quản trị từ DB;
- checkout VietQR, webhook SePay, polling trạng thái và đối soát/admin match;
- cấp entitlement atomic/idempotent, hạn dùng và lịch sử thanh toán;
- usage/cost controls theo tính năng.

Giá niêm yết hiện là cấu hình vận hành, không phải invariant kiến trúc; nguồn runtime nằm ở
`plan_prices` với fallback trong `api/_lib/prices.ts`. Tối ưu lợi nhuận phải dựa trên usage và chi
phí provider production, không hard-code dự báo kinh doanh vào roadmap kỹ thuật.

## 5. Kiến trúc hiện tại

- Frontend: React 18, Vite 7, TypeScript strict, Tailwind 3; monorepo `apps/*` + `packages/*`.
- Backend: Express + handler API, PostgreSQL self-hosted, Redis khi scale nhiều process.
- Platform modules: auth, billing/usage, DB/transaction, contracts, AI, storage, errors/logging.
- Learning domain: `apps/english/` và phần lớn handler học tập hiện hữu.
- Hub: experience/platform shell, không phải domain source of truth.
- Deploy: VPS Ubuntu, PM2/Nginx/Cloudflare; domain chuẩn `.org`.

Boundary đang enforce: `packages/**` không import `apps/**`. Khi domain thứ hai xuất hiện phải bổ
sung luật domain không import internals của domain khác; giao tiếp qua typed contract/read model/event.

## 6. Đích kiến trúc V2

Thứ tự roadmap active:

1. **Wave A — Architecture & boundaries:** baseline, ownership, ADR và core contracts.
2. **Wave B — Personal OS Core:** Personal World Model, consent/policy, Life Graph, Knowledge
   Fabric và Context Engine.
3. **Wave C — Companion runtime:** Capability Registry, planner/policy/router và Decision Ledger.
4. **Wave D — Learning migration:** tách global/domain profile và mở rộng đa môn.
5. **Wave E — Cross-domain proof:** Career → Work → Startup → Life.
6. **Wave F — Automation/hardening/scale:** approved automation, eval, security, SLO, backup,
   recovery và final architecture audit.

V2 chỉ được coi là thành công khi cùng một person dùng một companion qua ít nhất hai production
domain, dữ liệu/quyền có thể inspect-correct-delete-revoke, và provider/agent có thể thay thế mà
không mất person state.

## 7. Chiến lược chuyển đổi

- strangler migration, không rewrite/big-bang;
- additive trước destructive; schema/contract v1 tiếp tục được hỗ trợ bằng adapter;
- shadow → benchmark → feature flag → canary → cutover → retention window;
- một source of truth và một owner cho mỗi entity tại từng thời điểm;
- không microservice hoá, graph database hoá hay vectorize toàn bộ khi chưa có nhu cầu đo được;
- mọi migration phải có mismatch metric, authorization test, rollback và recovery evidence.

English Tutor OS v1 đã frozen. Các tài liệu `docs/phases/*` chỉ còn là lịch sử/tham khảo cho
Learning stability hoặc migration; roadmap active duy nhất là `docs/architecture-v2/21-ROADMAP.md`.

## 8. Trạng thái và bước kế tiếp

Đến 2026-08-16:

- V2-00 đã có inventory, ownership map, tám critical flow và risk register; latency/cost production
  vẫn `WAITING` vì cần số liệu vận hành thật.
- V2-01 đã chốt boundary Platform / Learning và lint enforcement.
- V2-02 đã thêm 13 contract theo hướng additive; tám shape do AI đề xuất phải được owner review
  lại khi Wave B dùng thật.
- Bước phát triển hợp lý tiếp theo là V2-03 Personal World Model, sau khi đóng/ghi nhận rõ phần
  baseline còn chờ và duyệt contract cần dùng cho vertical slice đầu tiên.

Theo dõi chi tiết tại `PROGRESS.md` và `docs/goals/v2-wave-a-architecture-boundaries.md`.

## 9. Invariant và Definition of Done

- Không tin client; auth, billing, usage và provider calls nằm server-side.
- AI output không trực tiếp mutate billing, permissions, mastery hoặc authoritative state.
- Payment/entitlement/usage phải atomic, idempotent và có concurrent/retry tests.
- Cross-user access, consent revoke và sensitive-context filtering phải có test.
- External side effect cần authority phù hợp; automation cần budget, pause/revoke và receipt.
- Mọi thay đổi phải qua build, typecheck, lint, format, test; UI/API/auth cần E2E tương ứng.
- Production claim cần telemetry/evidence mới, không suy ra từ mock hoặc tài liệu.
