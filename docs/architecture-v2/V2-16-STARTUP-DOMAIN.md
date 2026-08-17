# V2-16 — Startup Domain

| Thuộc tính | Giá trị                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                           |
| Phụ thuộc  | V2-08 (Capability Registry), V2-09 (Companion Runtime), V2-10 (Decision Ledger)                                                                                        |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-16 — Startup Domain"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 12 (Domain patterns — Startup), 15 (AI and agents) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: domain Startup quản lý venture/vấn đề/khách hàng/giả thuyết/thí nghiệm, với ranh giới cứng
giữa **giả thuyết** và **bằng chứng đã kiểm chứng**.

Trong scope (đúng roadmap):

- venture, problem, customer, hypothesis, experiment;
- validated evidence tách khỏi hypothesis;
- capability về thị trường / sản phẩm / mô hình kinh doanh / tài chính / roadmap.

Giá trị kiến trúc của phase: đây là nơi dễ nhất để LLM "nói chắc như đinh" về thị trường; hệ thống
phải cấu trúc hoá để phát biểu của model **mặc định là hypothesis**, không phải fact.

> **Owner chốt 2026-08-17 — đây là tính năng SẢN PHẨM THẬT cho người dùng cuối**, không phải công cụ
> nội bộ hay bằng chứng kiến trúc dùng một lần. Mỗi người dùng có dữ liệu Startup riêng theo `person_id`,
> giống mọi bảng Personal OS Core từ V2-03 — **không cần cơ chế đặc biệt nào thêm** cho việc "mỗi
> người một bản": kiến trúc hiện tại (Person / PersonalFact / Life Graph, tất cả khoá theo
> `person_id`, FK `on delete cascade`) vốn đã per-person. Hệ quả: yêu cầu bảo mật/riêng tư/quota áp ở
> mức người dùng thật ngay từ đầu, không được nới lỏng với lý do "chỉ owner tự dùng". Thứ tự
> roll-out các domain: xem V2-13 mục 1 (ĐỀ XUẤT, chờ owner xác nhận).

## 2. Entities / schema sketch

Schema `startup`, quy ước `version` + `archived_at` + audit append-only như `0041`–`0044`.

```
startup.ventures
  id uuid pk, person_id uuid not null references personal.persons(id) on delete cascade
  name text not null, stage text check (idea|validating|building|launched|paused|stopped)
  node_id uuid                       -- projection Life Graph type='Project'
  version integer, created_at, updated_at, archived_at

startup.problems
  id uuid pk, person_id uuid not null, venture_id uuid not null
  statement text not null, severity text, created_at, version, archived_at

startup.customer_segments
  id uuid pk, person_id uuid not null, venture_id uuid not null
  label text not null, description text, size_estimate jsonb
  version, created_at, archived_at

startup.hypotheses                   -- MẶC ĐỊNH mọi phát biểu chưa kiểm chứng vào đây
  id uuid pk, person_id uuid not null, venture_id uuid not null
  statement text not null
  kind text check (problem|solution|market|pricing|channel|other)
  origin text not null check (user_declared|model_generated|imported)
  confidence numeric(3,2) not null check (confidence >= 0 and confidence <= 1)
  status text not null check (untested|testing|supported|refuted|abandoned)
  version integer, created_at, archived_at

startup.experiments
  id uuid pk, person_id uuid not null, hypothesis_id uuid not null
  method text not null, success_criteria jsonb not null
  started_at timestamptz, ended_at timestamptz
  result text check (supported|refuted|inconclusive)
  version, created_at, archived_at

startup.validated_evidence           -- append-only, KHÔNG sửa; chỉ sinh từ experiment có kết quả
  id uuid pk, person_id uuid not null, venture_id uuid not null
  hypothesis_id uuid not null, experiment_id uuid not null
  summary text not null
  source jsonb not null               -- provenance bắt buộc: ai/cái gì cung cấp
  observed_at timestamptz not null
  created_at timestamptz not null default now()
```

Ràng buộc quan trọng: **không có đường ghi trực tiếp vào `validated_evidence`** — bản ghi chỉ sinh từ
`experiments` đã có `result` và `success_criteria`.

## 3. API / service contract sketch

```ts
createVenture / updateVenture (expectedVersion)
addHypothesis(personId, ventureId, { statement, kind, origin, confidence })
startExperiment(personId, hypothesisId, { method, successCriteria })
completeExperiment(personId, experimentId, expectedVersion, { result, observation })
  // nếu result='supported' → sinh validated_evidence + cập nhật hypothesis.status
listEvidence(personId, ventureId): ValidatedEvidence[]
```

Capability đăng ký ở V2-08 (executionMode `ai`, risk `medium`), output **luôn ghi vào hypotheses**:

- `startup.analyze_market`;
- `startup.draft_business_model`;
- `startup.project_finance` (kết quả là kịch bản giả định, không phải dự báo được bảo chứng);
- `startup.draft_roadmap`.

## 4. Invariant và gate

Invariant:

1. **Phát biểu do model sinh mặc định `origin='model_generated'`, `status='untested'`** — không bao
   giờ được ghi thẳng thành `validated_evidence` (gate rõ ràng của roadmap).
2. Mọi `validated_evidence` có `experiment_id` và `source` provenance.
3. `hypothesis.status='supported'` chỉ đặt được qua `completeExperiment`.
4. Số liệu tài chính do AI sinh phải gắn nhãn giả định và các tham số đầu vào.
5. Startup không ghi trực tiếp vào Personal World Model (mục 11 kiến trúc cấm rõ).

Gate coi là đạt phase:

- test chứng minh output capability AI không thể trở thành evidence nếu không qua experiment;
- một venture chạy trọn `hypothesis → experiment → evidence` với provenance đầy đủ;
- rà UI/API: mọi nơi hiển thị đều phân biệt rõ giả thuyết và bằng chứng.

## 5. Phụ thuộc và thứ tự triển khai

1. Schema + CRUD venture/problem/segment/hypothesis (không AI).
2. Experiment + luật sinh evidence.
3. Đăng ký capability AI, output bắt buộc vào hypotheses.
4. Nối Decision Ledger (quyết định về venture dùng `domain='startup'`).

## 6. Rủi ro và giả định

- **Rủi ro:** người dùng tin số liệu thị trường do AI sinh; nhãn "giả thuyết" phải hiển thị nổi bật,
  không chỉ có trong DB.
- **Rủi ro:** phạm vi rất rộng (tài chính, roadmap, mô hình kinh doanh) dễ phình thành sản phẩm riêng.
- **Rủi ro:** chi phí AI cho phân tích dài; áp `22-API-COST-OPTIMIZATION-PLAN.md`.
- **Giả định:** Startup dùng chung Decision Ledger V2-10 thay vì bảng quyết định riêng.
- **Giả định:** chưa cần cộng tác nhiều người trên một venture.

## 7. Câu hỏi mở cần owner quyết

### Đã chốt (2026-08-17)

- **Startup là tính năng sản phẩm thật cho người dùng cuối, per-person theo `person_id`** — xem hộp quyết
  định ở mục 1. Không cần thiết kế thêm cơ chế đa người dùng.

### Còn mở

| Câu hỏi                                                                 | Vì sao cần owner                      | Ảnh hưởng nếu chọn sai                  |
| ----------------------------------------------------------------------- | ------------------------------------- | --------------------------------------- |
| Có cho phép nhiều người cùng làm một venture không?                     | Kéo theo mô hình quyền hoàn toàn khác | Thêm sau rất tốn kém                    |
| Số liệu thị trường lấy từ nguồn nào (chỉ AI? nhập tay? API dữ liệu?)    | Chi phí + độ tin cậy                  | Dựa hoàn toàn vào AI → số liệu bịa      |
| Mô hình tài chính chi tiết tới đâu (bảng dòng tiền? chỉ ước lượng thô?) | Quyết định sản phẩm                   | Làm sâu quá sớm khi chưa ai dùng        |
| Hiển thị phân biệt hypothesis/evidence bằng cách nào trong UI?          | Trải nghiệm + trách nhiệm thông tin   | Người dùng ra quyết định kinh doanh sai |
| Dữ liệu venture phân loại sensitivity nào?                              | Bí mật kinh doanh                     | Lọt vào context/logs sai mục đích       |

## 8. Không làm

- Không cho AI khẳng định sự thật thị trường.
- Không tạo bảng quyết định riêng (dùng V2-10).
- Không hỗ trợ nhiều người dùng/cộng tác trên venture.
- Không tích hợp dữ liệu tài chính/ngân hàng thật.
- Không tự động sinh evidence từ nội dung web.
