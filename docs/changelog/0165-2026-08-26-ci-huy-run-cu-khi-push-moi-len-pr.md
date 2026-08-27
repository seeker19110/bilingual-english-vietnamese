# 0165 — ci: huỷ run của commit cũ khi push mới lên PR (concurrency)

- **Ngày:** 2026-08-26
- **PR:** #703
- **Nhánh:** `claude/programming-lessons-tl3tbg`

> **Đọc mục "Chẩn đoán sai lần đầu" trước.** Bản đầu của file này quy sai nguyên nhân, và
> chính cái sai đó mới là bài học đáng giữ lại hơn cả bản vá.

## Triệu chứng

Trên PR #703, branch protection báo `quality — Waiting for status to be reported` mãi không
đổi. CI **không hỏng** — nó chưa hề chạy cho commit head:

| Run            | Commit                    | Trạng thái lúc 15:51                 |
| -------------- | ------------------------- | ------------------------------------ |
| CI #1482       | `dfcc679`                 | ✅ success                           |
| CI #1481       | `75fc0fb` (đã lỗi thời)   | ⏳ queued từ 15:21 — kẹt gần 30 phút |
| PR policy #495 | `8de1ebc` (đã lỗi thời)   | ⏳ queued từ 15:18                   |
| —              | `f1acf77` (head hiện tại) | chưa được tạo run nào                |

## Chẩn đoán SAI lần đầu

Tôi kết luận: `ci.yml`/`pr-policy.yml` thiếu khối `concurrency` nên run của commit cũ không bị
huỷ, chúng **nằm lại trong hàng đợi và ăn suất runner**, đẩy commit mới nhất ra sau.

Kết luận đó sai, và nó sai theo kiểu nguy hiểm: nghe rất hợp lý, khớp với một thiếu sót CÓ
THẬT trong cấu hình, nên không có gì gợn lên để phải kiểm lại.

Thứ lật ngược nó là một lỗi khi thử huỷ tay hai run kia:

```
POST /actions/runs/32984831657/cancel → 409
POST /actions/runs/32984652795/cancel → 409
"Cannot cancel a workflow run that has not been queued yet"
```

Run **chưa từng vào hàng đợi** thì không thể chiếm suất runner của ai. Toàn bộ chuỗi suy luận
"run cũ chèn chỗ run mới" sụp ngay tại đó.

## Nguyên nhân THẬT

GitHub Actions đang sự cố diện rộng:

```
githubstatus.com → Partial System Outage
  Actions          major_outage
  Git Operations   operational
  API Requests     operational
Sự cố đang mở: "Incident with Actions" — bắt đầu 15:11:58 UTC
```

Đối chiếu lịch sử run của repo thì khớp chính xác:

| Thời điểm         | Tình trạng                                                          |
| ----------------- | ------------------------------------------------------------------- |
| trước 15:06       | mọi run chạy và xanh bình thường                                    |
| 15:06 → 15:21     | 4 run kẹt `queued` (2 của PR #703, 2 của PR #702) — không khởi động |
| 15:11:58          | GitHub công bố sự cố Actions                                        |
| `f1acf77` (15:47) | không hề được tạo run                                               |
| `9e6a36a` (15:56) | không hề được tạo run                                               |

Sự cố nằm ngoài repo, ngoài cấu hình, ngoài tầm can thiệp: không huỷ được, không kích lại
được, chỉ chờ GitHub hồi phục.

## Việc đã làm (giữ lại, nhưng ĐỔI LÝ DO)

Thêm khối `concurrency` vào `ci.yml` và `pr-policy.yml`:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

Thay đổi này **đúng và đáng giữ**, nhưng phải nói cho đúng nó làm gì: mỗi lần push lên PR làm
run của commit cũ thành vô nghĩa, và để chúng chạy tiếp là đốt phút Actions cho một kết quả
không ai đọc. Đó là dọn dẹp và tiết kiệm — **không phải** bản vá cho sự cố hôm nay, và nó
KHÔNG làm PR #703 xanh sớm hơn một giây nào.

## Quyết định kèm theo

- **Chỉ huỷ với `pull_request`, KHÔNG huỷ với push lên main.** Lượt CI trên main là lưới an
  toàn cuối trước khi `deploy.yml` chạy (xem comment đầu `deploy.yml`); huỷ nó để tiết kiệm
  runner là đánh đổi sai chỗ. Vì thế `cancel-in-progress` là biểu thức theo `github.event_name`
  chứ không phải `true` cứng.
- **Nhóm theo số PR, không theo `github.ref`.** Với sự kiện `pull_request`, `github.ref` là
  `refs/pull/N/merge`; dùng số PR cho rõ ràng và không phụ thuộc dạng ref. Có `github.workflow`
  trong khoá nhóm để hai workflow không huỷ nhầm nhau.
- **KHÔNG đụng `deploy.yml`.** Nó đã có nhóm riêng `deploy-vps` với `cancel-in-progress: false`
  — chủ ý xếp hàng chứ không huỷ, vì hai lượt deploy cùng SSH vào VPS sẽ đụng nhau.

## Bằng chứng kiểm chứng

- `python3 -c "yaml.safe_load(...)"` trên cả ba workflow: YAML hợp lệ, khối `concurrency` đọc
  ra đúng như viết, `deploy.yml` giữ nguyên `{group: deploy-vps, cancel-in-progress: False}`.
- `npx prettier --check` trên hai file đã sửa: đạt.
- **Chưa kiểm chứng được hiệu lực thật** vì Actions đang sập — không có run nào được tạo để mà
  huỷ. Lần push đầu tiên sau khi GitHub hồi phục sẽ là phép thử: phải thấy run của commit trước
  chuyển sang `cancelled`.

## Bài học

Trùng đúng bài học của changelog 0156 ở PR #702 (script eval đọc cấu hình khác production rồi
báo động một sự cố không tồn tại): **một giả thuyết khớp với thiếu sót có thật vẫn có thể sai
nguyên nhân.** Repo thiếu `concurrency` là thật; nhưng cái thật đó không gây ra triệu chứng
đang thấy.

Thứ đáng lẽ phải làm TRƯỚC khi kết luận, và từ nay là bước bắt buộc khi CI đứng im: **kiểm
githubstatus.com**. Một lệnh curl 20 giây, trước cả khi đọc cấu hình workflow. Dấu hiệu nhận
biết sự cố phía GitHub, không phải phía mình: run kẹt `queued` mà `created_at == updated_at`
(chưa bao giờ chuyển trạng thái), push mới không sinh ra run nào, và huỷ thì báo 409
"has not been queued yet".
