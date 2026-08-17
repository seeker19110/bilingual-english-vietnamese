# 23 — Event Outbox Strategy (quyết định xuyên suốt)

| Thuộc tính | Giá trị                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement (owner yêu cầu viết đặc tả 2026-08-17)                                                                                |
| Loại       | Cross-cutting decision, KHÔNG phải phase có gate riêng (giống `22-MODEL-API-STRATEGY.md`)                                                          |
| Nguồn      | `02-SYSTEM-ARCHITECTURE.md` mục 11 (Cross-domain protocol), 13 (Persistence); `21-ROADMAP.md` mục "Cross-cutting decision — Event outbox strategy" |
| Dùng bởi   | V2-09 (Companion Runtime — ghi audit + outbox cùng transaction), V2-14 (Learning → Career), V2-18 (worker tiêu thụ event làm trigger automation)   |

## 1. Outcome — tại sao cần

Mục 11 kiến trúc CẤM domain query thẳng bảng của domain khác. Nhưng V2-14 lại cần một luồng ngược:
Learning cập nhật mastery → Career phải tính lại `skill_gaps`. Không có event thì chỉ còn hai cách,
đều sai: Career query thẳng bảng Learning (vi phạm mục 11), hoặc Learning gọi thẳng service Career
(ghép chặt hai domain, Learning phải biết mọi consumer).

Domain event giải quyết đúng chỗ đó: Learning phát `learning.mastery_updated`, Career nghe và tự cập
nhật, Learning không biết ai đang nghe.

Vấn đề kỹ thuật thật sự KHÔNG phải "gửi message" mà là **dual-write**: nếu ghi state vào Postgres rồi
mới gửi event ra một hệ thống khác, hai thao tác đó không nằm trong một transaction — crash ở giữa
làm mastery đã đổi nhưng Career không bao giờ biết (mất event), hoặc event đã gửi nhưng transaction
rollback (event ma). Transactional outbox loại bỏ hoàn toàn khả năng này.

Trạng thái thật hiện tại (đã kiểm, không phải giả định): **chưa có hạ tầng outbox nào**. Chỉ có
contract hình dạng sự kiện `packages/core-contracts/eventEnvelope.ts` (alias `domainEvent.ts`) từ
V2-02, và `createIdempotencyTracker()` là bộ dedupe TRONG BỘ NHỚ, tự nó ghi rõ "không dùng cho quyết
định liên quan tiền/dữ liệu thật". Toàn bộ mục 3–6 dưới đây là việc chưa làm.

## 2. Contract sự kiện — dùng lại, không tạo mới

`EventEnvelopeSchema` (V2-02) đã đủ trường cho outbox, KHÔNG tạo contract thứ hai:

| Trường           | Vai trò trong outbox                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`             | Định danh duy nhất MỘT lần phát — khoá dedupe phía consumer (mục 13 kiến trúc: "idempotent theo event ID") |
| `idempotencyKey` | Băm NGUYÊN NHÂN gây ra sự kiện (vd `evidence:<id>:mastery_updated`) — chống phát trùng phía producer       |
| `type`           | `domain.action`, vd `learning.mastery_updated`                                                             |
| `occurredAt`     | Thời điểm nghiệp vụ xảy ra (khác thời điểm giao)                                                           |
| `payload`        | Nội dung; chỉ mang ĐỊNH DANH + số liệu tối thiểu, không copy nguyên bản ghi của domain sở hữu              |

Phân biệt hai khoá (nguồn nhầm lẫn thường gặp): `idempotencyKey` chống PHÁT trùng (producer retry
sinh ra cùng key), `id` chống XỬ LÝ trùng (consumer nhận lại cùng event). Consumer dedupe theo `id`.

Câu hỏi mở còn lại: `payload` có nên union theo `type` ở tầng contract không (xem mục 7).

## 3. Entities / schema sketch

```
platform.domain_events              -- BẢNG OUTBOX, append-only, không sửa nội dung sự kiện
  id             uuid pk            -- = EventEnvelope.id
  idempotency_key text not null unique   -- chống producer phát trùng (DB ép, không tin code)
  type           text not null      -- 'learning.mastery_updated'
  person_id      uuid               -- null nếu là sự kiện hệ thống; có thì bắt buộc khớp aggregate
  occurred_at    timestamptz not null
  payload        jsonb not null
  schema_version integer not null
  -- trạng thái GIAO, tách khỏi nội dung sự kiện (nội dung bất biến, trạng thái thì đổi)
  status         text not null check (status in ('pending','delivered','dead')) default 'pending'
  attempts       integer not null default 0
  next_attempt_at timestamptz not null default now()
  last_error     text
  delivered_at   timestamptz
  created_at     timestamptz not null default now()

  index (status, next_attempt_at)   -- poller quét đúng dòng cần, không full scan

platform.domain_event_consumptions  -- dedupe phía consumer, append-only
  event_id       uuid not null
  consumer       text not null      -- 'career.skill_gap_recalc'
  processed_at   timestamptz not null default now()
  primary key (event_id, consumer)
```

Vì sao tách bảng dedupe theo `(event_id, consumer)` thay vì cột `processed` trên `domain_events`:
một event có nhiều consumer, mỗi consumer xử lý xong ở thời điểm khác nhau. Consumer mới thêm sau
không được coi là "đã xử lý" chỉ vì consumer cũ xong rồi.

Bảng đặt ở schema `platform` (hạ tầng dùng chung, mục 2 kiến trúc "Platform Layer: events/outbox"),
không thuộc `personal` hay domain nào — outbox không phải dữ liệu người dùng.

## 4. Cơ chế publish — transactional outbox

Đúng khuôn transaction mục 13 kiến trúc, KHÔNG được tách ra:

```text
BEGIN
  validate expected version / authority
  mutate owning aggregate          -- vd learning.mastery
  insert audit record
  INSERT INTO platform.domain_events (... status='pending')   -- CÙNG transaction
COMMIT
-- (không gửi gì trong transaction; việc giao là của worker riêng)
```

Sau commit, một **worker/poller riêng** đọc `status='pending' AND next_attempt_at <= now()`, khoá
dòng bằng `SELECT ... FOR UPDATE SKIP LOCKED` (an toàn khi về sau chạy nhiều tiến trình PM2 cluster),
gọi lần lượt các consumer đã đăng ký cho `type` đó, rồi đánh dấu `delivered`.

Điều CẤM: gọi consumer ngay trong transaction của producer. Làm vậy thì lỗi của consumer sẽ rollback
thao tác nghiệp vụ của producer — Career hỏng kéo Learning hỏng theo, đúng thứ ghép chặt mà kiến trúc
này sinh ra để tránh.

### Polling vs LISTEN/NOTIFY — chưa chốt công nghệ

| Phương án                          | Ưu                                                                                                                                           | Nhược                                                                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Polling** (quét bảng mỗi N giây) | Đơn giản nhất; không mất event khi worker restart; retry/backoff dùng luôn cột `next_attempt_at`; không phụ thuộc tính năng đặc thù Postgres | Độ trễ = chu kỳ quét (vài giây); có truy vấn rỗng khi nhàn rỗi                                                                                              |
| **LISTEN/NOTIFY**                  | Gần thời gian thực                                                                                                                           | `NOTIFY` KHÔNG bền: worker đang offline thì mất tín hiệu → vẫn PHẢI có polling dự phòng, tức là thêm cơ chế chứ không thay thế; cần connection giữ mở riêng |

**Đề xuất: polling trước** (chu kỳ 5–10 giây), vì quy mô hiện tại nhỏ — VPS 1 vCPU, và không luồng
nào trong V2-14/V2-18 cần độ trễ dưới một giây (tính lại skill gap chậm vài giây là chấp nhận được,
chỉ cần hiển thị `fetchedAt` như V2-14 đã yêu cầu). LISTEN/NOTIFY để dành, chỉ thêm khi ĐO ĐƯỢC độ
trễ polling gây vấn đề thật — và khi thêm thì thêm CHỒNG LÊN polling, không thay thế.

## 5. Delivery guarantee, retry, dead-letter

**At-least-once.** Không cố đạt exactly-once (không khả thi khi có side effect ngoài Postgres); thay
vào đó ép consumer idempotent — đó là lý do có bảng `domain_event_consumptions`.

Consumer bắt buộc theo khuôn:

```text
BEGIN
  INSERT INTO platform.domain_event_consumptions (event_id, consumer) -- ON CONFLICT DO NOTHING
  nếu 0 dòng được chèn → đã xử lý rồi, THOÁT (không làm gì thêm)
  xử lý nghiệp vụ (vd tính lại career.skill_gaps)
COMMIT
```

Ghi dấu đã-xử-lý và thay đổi nghiệp vụ nằm CÙNG transaction — nếu tách ra thì crash ở giữa lại sinh
đúng bài toán dual-write mà tài liệu này đang giải.

Retry: exponential backoff qua `next_attempt_at` (vd 10s, 1p, 5p, 30p, 2h...), tối đa N lần (đề xuất
N=8, cần owner xác nhận). Hết lượt → `status='dead'`. Dòng `dead` KHÔNG bị xoá và KHÔNG tự chạy lại;
cần cảnh báo (Sentry đã bật) + công cụ cho owner replay thủ công sau khi sửa nguyên nhân.

Thứ tự: outbox này **không đảm bảo thứ tự toàn cục**. Consumer phải chịu được event đến sai thứ tự —
với `learning.mastery_updated` thì cách an toàn là payload mang giá trị mastery hiện tại kèm
`occurredAt`, consumer bỏ qua event cũ hơn dữ liệu đang có, thay vì cộng dồn delta.

## 6. Consumer đầu tiên có thật

Không xây hạ tầng suông. Consumer thật đầu tiên là **V2-14 Cross-domain Life Graph**:

- Producer: Learning, phát `learning.mastery_updated` khi mastery của một `skill` đổi;
- Consumer: `career.skill_gap_recalc`, tính lại `career.skill_gaps` cho các `career_goals` đang
  active có tham chiếu `skill_key` tương ứng, ghi `observed_source` kèm `fetchedAt`;
- Bằng chứng đạt: test chứng minh giao cùng event hai lần chỉ tạo một lần cập nhật, và test chứng
  minh 0 truy vấn từ code Career sang bảng Learning (gate sẵn có của V2-14).

Consumer thứ hai dự kiến: worker trigger theo sự kiện của V2-18 (`trigger.kind='event'`).

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                         | Vì sao cần owner                  | Ảnh hưởng nếu chọn sai                                             |
| ------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Số lần retry tối đa và mốc backoff cụ thể trước khi vào dead-letter?            | Chính sách vận hành               | Quá ít → mất cập nhật khi provider chập chờn; quá nhiều → tồn đọng |
| Event `dead` cảnh báo qua kênh nào (Sentry, email, in-app admin)?               | Vận hành sự cố                    | Không ai thấy → lỗi âm thầm, dữ liệu lệch lâu dài                  |
| Giữ event đã `delivered` bao lâu rồi mới dọn (30/90/365 ngày, hay vĩnh viễn)?   | Dung lượng vs khả năng replay     | Xoá sớm → không replay/audit lại được                              |
| `payload` có union theo `type` ở tầng contract Zod không?                       | Đánh đổi an toàn kiểu vs công sức | Không union → payload sai chỉ lộ lúc chạy                          |
| Chu kỳ polling cụ thể (5s? 10s?) và chạy trong tiến trình web hay worker riêng? | Chi phí hạ tầng (VPS 1 vCPU)      | Chạy chung tiến trình web → tranh CPU với request người dùng       |
| Event có được đưa ra ngoài (webhook cho người dùng) không?                      | Bề mặt bảo mật + phạm vi          | Mở sớm → lộ dữ liệu cá nhân qua payload                            |

## 8. Không làm

- Không dùng message broker ngoài (Kafka/RabbitMQ/SQS) — Postgres là mặc định (mục 1, 13 kiến trúc).
- Không gọi consumer trong transaction của producer.
- Không hứa exactly-once hay thứ tự toàn cục.
- Không tạo contract sự kiện mới song song `EventEnvelope`.
- Không xoá dòng dead-letter để "cho sạch bảng".
- Không dựng outbox khi chưa có consumer thật cần nó (consumer đầu tiên: V2-14).
