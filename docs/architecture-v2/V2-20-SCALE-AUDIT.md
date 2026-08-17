# V2-20 — Scale and Final Architecture Audit

| Thuộc tính | Giá trị                                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                                                                                           |
| Phụ thuộc  | Toàn bộ V2-00 → V2-19                                                                                                                                                                                                                                  |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-20 — Scale and Final Architecture Audit" + "Release discipline"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 18 (Security and privacy), 19 (Deployment evolution); docs/framework/QUY-TRINH-AUDIT.md |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: kết luận **V2 được chấp nhận hay chưa**, dựa trên bằng chứng chứ không dựa trên checklist
đã tick. Phase này không thêm tính năng — nó kiểm chứng và vá chỗ hổng.

Roadmap nêu 8 điều kiện chấp nhận; đặc tả này biến chúng thành hạng mục kiểm chứng có bằng chứng:

| #   | Điều kiện (roadmap)                                           | Bằng chứng cần có                                            |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | Một người dùng dùng một Companion trên ≥ 2 domain production  | Log/trace lượt chạy thật trên 2 domain của cùng `person_id`  |
| 2   | Life Graph nối goal/evidence xuyên domain                     | Truy vấn graph thật ra đường đi Career → Learning → evidence |
| 3   | Personal World Model có provenance/confidence/privacy control | Export dữ liệu một person cho thấy đủ 3 thuộc tính           |
| 4   | Knowledge Fabric có inspect/correct/delete                    | Diễn tập thực hiện được cả 3 thao tác, có audit              |
| 5   | Side effect ngoài tuân thủ authority                          | 100% receipt truy được về policy/grant                       |
| 6   | Vòng Decision/Outcome chạy end-to-end                         | ≥ 1 decision đi trọn `open → reviewed`                       |
| 7   | Đổi provider/agent không mất trạng thái người dùng            | Diễn tập đổi provider AI, dữ liệu person không đổi           |
| 8   | SLO/chi phí/bảo mật/backup/recovery/audit đầy đủ              | Báo cáo có số đo thật từ production                          |

## 2. Entities / schema sketch

Không có entity mới. Phase này có thể bổ sung chỉ mục/phân vùng cho bảng append-only đã phình to
(`personal.personal_facts`, `memory_records`, `automation_runs`, `external_action_receipts`) — mọi
thay đổi schema phải additive và rollback được.

## 3. API / service contract sketch

Không có API mới. Đầu ra là:

- báo cáo audit theo `docs/framework/QUY-TRINH-AUDIT.md` (7 tầng + độ phủ test);
- báo cáo SLO/chi phí/độ trễ đo trên production thật;
- runbook backup/restore đã diễn tập (đối chiếu `docs/ke-hoach-khoi-phuc-su-co-server.md`);
- danh sách residual risk và phần **không làm** được ghi rõ.

## 4. Invariant và gate

Invariant:

1. Không tuyên bố đạt điều kiện nào nếu không có bằng chứng chạy được (luật chống ảo giác, `CLAUDE.md` mục 5).
2. Không hạ tiêu chí để đạt gate.
3. Mọi phần chưa đạt được ghi vào residual risk, không bị im lặng bỏ qua.
4. Diễn tập restore phải thực sự khôi phục được dữ liệu, không chỉ kiểm tra file backup tồn tại.
5. Quyết định "V2 accepted" thuộc owner, không thuộc AI (`AI_DELIVERY_LOOP.md` mục 8, 9).

Gate coi là đạt phase: cả 8 hạng mục bảng mục 1 có bằng chứng, hoặc có quyết định tường minh của owner
chấp nhận thiếu sót cụ thể nào và vì sao.

## 5. Phụ thuộc và thứ tự triển khai

1. Đối chiếu trạng thái thật của `main` với toàn bộ gate V2-00 → V2-19 (không tin tài liệu cũ).
2. Đo SLO/chi phí/độ trễ trên production (cần quyền truy cập VPS — hiện là điểm treo từ V2-00 M1/S4).
3. Diễn tập backup/restore và đổi provider.
4. Audit 7 tầng + rà độ phủ test.
5. Tối ưu/vá theo phát hiện, ưu tiên bảo mật và mất dữ liệu.
6. Báo cáo cuối + quyết định của owner.

## 6. Rủi ro và giả định

- **Rủi ro:** phase này dễ bị biến thành "tick cho xong". Giảm thiểu: mỗi dòng bằng chứng phải là link
  tới log/test/commit thật.
- **Rủi ro hạ tầng:** VPS 1 vCPU không đủ để đo scale thật; kết luận scale có thể không kết luận được.
- **Rủi ro:** một số điều kiện (2 domain production) phụ thuộc quyết định sản phẩm ở V2-13/V2-15/V2-16;
  nếu các domain đó chỉ là proof nội bộ thì điều kiện 1 chưa thể đạt.
- **Giả định:** có quyền truy cập production để đo — hiện chưa có (`docs/goals/v2-wave-a-architecture-boundaries.md` M1/S4 vẫn WAITING).

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                | Vì sao cần owner                             | Ảnh hưởng nếu chọn sai                      |
| ---------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| "Production domain thứ hai" là domain nào và có người dùng thật không? | Điều kiện chấp nhận số 1 phụ thuộc trực tiếp | Không có → V2 không thể tuyên bố accepted   |
| Mục tiêu SLO cụ thể (p95 độ trễ, tỉ lệ lỗi) là bao nhiêu?              | Quyết định sản phẩm/vận hành                 | Không có mục tiêu → không kết luận được     |
| Trần chi phí API mỗi tháng ở quy mô mục tiêu?                          | Quyết định tài chính                         | Kiến trúc đúng nhưng không kham nổi chi phí |
| Có nâng cấp hạ tầng (thêm vCPU, Redis) để đo scale không?              | Chi phí thật                                 | Không nâng → phần scale bỏ ngỏ              |
| Ai thực hiện audit bảo mật độc lập (nếu có)?                           | Tính khách quan                              | Tự audit → bỏ sót lỗ hổng                   |
| Chấp nhận V2 với những thiếu sót nào (nếu có)?                         | Đây là quyết định chấp nhận rủi ro của owner | AI tự quyết là vượt thẩm quyền              |

## 8. Không làm

- Không thêm tính năng hay domain mới.
- Không tự tuyên bố V2 hoàn thành.
- Không tách microservice nếu chưa có bằng chứng theo mục 19 kiến trúc.
- Không tối ưu hiệu năng dựa trên phỏng đoán không có số đo.
- Không sửa tiêu chí chấp nhận trong roadmap để dễ đạt hơn.
