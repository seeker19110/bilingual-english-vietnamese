# V2-14 — Cross-domain Life Graph

| Thuộc tính | Giá trị                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                            |
| Phụ thuộc  | V2-05 (Life Graph foundation), V2-11 (Learning read model), V2-13 (Career Domain)                                                                                       |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-14 — Cross-domain Life Graph"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 5 (Life Graph), 11 (Cross-domain protocol) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: chạy được **một luồng xuyên domain thật**, đúng ví dụ roadmap:

```
Career goal: Data Analyst
  → skill gap: SQL / English / Statistics
    → Learning plan cho từng skill
      → evidence + mastery từ Learning
        → cập nhật tiến độ Career
```

Trong scope: liên kết node/edge giữa Career goal, Skill, Learning goal/plan; cơ chế truyền tiến độ
ngược lại Career qua domain event/read model; view đọc "goal graph" xuyên domain.

Đây là phase **không tạo domain mới** — nó nối hai domain đã có bằng đúng giao thức cho phép.

## 2. Entities / schema sketch

Dùng lại bảng `personal.life_graph_nodes` / `life_graph_edges` của `0043`. Không tạo bảng graph thứ hai.

Cạnh sử dụng trong luồng này (đều nằm trong 7 relation đã có):

```
Goal(Career: Data Analyst) --requires--> Skill(SQL)
Skill(SQL) <--contributes_to-- Goal(Learning: học SQL)
Goal(Learning) --belongs_to--> Project/Plan (nếu có)
Constraint(quỹ thời gian) --blocks--> Goal(Learning)     (khi xung đột)
```

Bổ sung bảng nguồn giống mẫu `personal.life_goal_sources` (đã có ở V2-05), mở rộng cho nhiều domain:

```
personal.life_node_sources
  id uuid pk, person_id uuid not null
  node_id uuid not null
  domain text not null              -- 'learning' | 'career'
  source_type text not null         -- 'goal' | 'skill' | 'plan'
  source_id text not null
  created_at, archived_at
  unique (person_id, domain, source_type, source_id) where archived_at is null
```

Không copy payload domain vào graph — graph giữ định danh + quan hệ, payload đọc lại từ domain
(nguyên tắc đã chốt ở `V2-05-SLICE-1.md`).

## 3. API / service contract sketch

```ts
linkCareerGoalToSkills(personId, careerGoalId, skillKeys[]): Edge[]
proposeLearningPlanForGap(personId, skillGapId): ProposedAction   // Companion đề xuất, Learning commit
getGoalGraph(personId, rootNodeId, depth?): GoalGraphView         // read view xuyên domain
getCareerProgress(personId, careerGoalId): {
  skills: Array<{ skillKey; requiredLevel; observedLevel; source }>
  overallProgress: number
}
```

Truyền tiến độ ngược: Learning phát `DomainEvent` (`learning.mastery_updated`) qua outbox; Career
tiêu thụ **idempotent theo event id** và tính lại `skill_gaps`. Career không hỏi thẳng bảng Learning.
Cơ chế outbox (bảng, transactional publish, at-least-once, retry/dead-letter, polling vs
LISTEN/NOTIFY): [`23-EVENT-OUTBOX-STRATEGY.md`](23-EVENT-OUTBOX-STRATEGY.md) — luồng này là
**consumer thật đầu tiên** của outbox (`career.skill_gap_recalc`).

## 4. Invariant và gate

Invariant:

1. **Không truy vấn trực tiếp bảng Learning từ Career** — gate rõ ràng của roadmap.
2. Mọi edge cùng `person_id` (đã enforce bằng composite FK từ `0043`).
3. Graph mutation idempotent: nối lại cùng cặp node/relation không tạo cạnh trùng.
4. Consumer event idempotent theo event id (mục 13 kiến trúc).
5. Không có vòng lặp vô hạn khi duyệt graph (`getGoalGraph` giới hạn depth và phát hiện chu trình).
6. Payload hiển thị luôn đọc lại từ domain sở hữu, không đọc bản sao trong graph.

Gate coi là đạt phase:

- luồng ví dụ chạy end-to-end trên dữ liệu thật của một người dùng, có bằng chứng từng bước;
- test chứng minh 0 câu truy vấn từ Career tới bảng Learning;
- test chu trình graph và test idempotency của event consumer.

## 5. Phụ thuộc và thứ tự triển khai

1. Mở rộng `life_node_sources` cho nhiều domain (di trú từ `life_goal_sources`).
2. Liên kết Career goal ↔ Skill node.
3. Đường Learning plan (Companion đề xuất → Learning commit).
4. Dựng hạ tầng outbox theo `23-EVENT-OUTBOX-STRATEGY.md`, rồi nối event Learning → consumer Career.
5. `getGoalGraph` + view đọc; UI tối thiểu nếu cần chứng minh.

## 6. Rủi ro và giả định

- **Rủi ro:** graph phình thành bản sao của mọi domain → mất ý nghĩa "read view". Giảm thiểu: chỉ
  đưa vào graph những gì có quan hệ xuyên domain thật.
- **Rủi ro:** event mất/trùng gây tiến độ Career lệch. Giảm thiểu: outbox + reconciliation job.
- **Rủi ro:** độ trễ cập nhật khiến người dùng thấy số liệu cũ; cần hiển thị `fetchedAt`.
- **Giả định:** V2-05 đã có adapter đọc ngược an toàn và cơ chế phát hiện lệch nhãn (đã có).
- **ĐÃ XÁC NHẬN (owner chốt 2026-08-17), không còn là giả định:** hạ tầng outbox/event CHƯA tồn tại —
  mới chỉ có contract `EventEnvelope`/`DomainEvent` (V2-02), không có bảng outbox, không có worker.
  Đặc tả cơ chế: [`23-EVENT-OUTBOX-STRATEGY.md`](23-EVENT-OUTBOX-STRATEGY.md). Khối lượng dựng outbox
  thuộc phase này, phải tính vào ước lượng.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                     | Vì sao cần owner                      | Ảnh hưởng nếu chọn sai                        |
| --------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| Tiến độ Career tính theo công thức nào (trung bình gap? có trọng số?)       | Quyết định sản phẩm                   | Công thức sai làm người dùng hiểu sai tiến độ |
| Người dùng có được tự nối/gỡ cạnh trong graph không?                        | Quyết định sản phẩm + rủi ro toàn vẹn | Cho sửa tự do → graph mâu thuẫn với domain    |
| Có UI đồ thị xuyên domain trong phase này không?                            | Phạm vi                               | Làm UI sớm tốn công trước khi dữ liệu ổn      |
| Cập nhật tiến độ theo thời gian thực hay theo lô định kỳ?                   | Chi phí vận hành                      | Thời gian thực tốn tài nguyên VPS 1 vCPU      |
| Xử lý thế nào khi người dùng xoá Learning goal đang được Career tham chiếu? | Chính sách dữ liệu                    | Xoá cứng → graph gãy, mất tiến độ             |

## 8. Không làm

- Không tạo domain mới.
- Không đồng bộ hai chiều tự do (Career không ghi vào Learning).
- Không dựng graph database riêng — vẫn PostgreSQL (mục 1, 13 kiến trúc).
- Không suy diễn tự động quan hệ giữa mọi node (chỉ nối theo luật tường minh).
- Không mở rộng bộ node/relation type ngoài 9 node + 7 relation đã chốt.
