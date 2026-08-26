# 0157 — ci: huỷ run của commit cũ khi push mới lên PR (concurrency)

- **Ngày:** 2026-08-26
- **PR:** #703
- **Nhánh:** `claude/programming-lessons-tl3tbg`

## Triệu chứng

Trên PR #703, branch protection báo `quality — Waiting for status to be reported` mãi không
đổi. Nhìn kỹ thì CI **không hỏng** — nó chưa hề chạy cho commit head hiện tại:

| Run            | Commit                    | Trạng thái lúc 15:51                 |
| -------------- | ------------------------- | ------------------------------------ |
| CI #1482       | `dfcc679`                 | ✅ success                           |
| CI #1481       | `75fc0fb` (đã lỗi thời)   | ⏳ queued từ 15:21 — kẹt gần 30 phút |
| PR policy #495 | `8de1ebc` (đã lỗi thời)   | ⏳ queued từ 15:18                   |
| —              | `f1acf77` (head hiện tại) | chưa được xếp hàng                   |

## Nguyên nhân

`ci.yml` và `pr-policy.yml` KHÔNG có khối `concurrency` (chỉ `deploy.yml` có, thêm ở PR #173
cho việc khác). GitHub Actions không tự huỷ run của commit cũ khi PR có push mới, nên mỗi lần
push lại đẻ thêm một run; các run lỗi thời nằm lại trong hàng đợi và ăn suất runner của repo.
Kết quả: commit mới nhất — commit DUY NHẤT mà branch protection quan tâm — phải xếp hàng sau
những run đã không còn ý nghĩa gì.

## Việc đã làm

Thêm cùng một khối `concurrency` vào `ci.yml` và `pr-policy.yml`:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

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
- Hiệu lực thật kiểm được ngay ở chính lần push này: run của `f1acf77` phải bị huỷ và chỉ còn
  một run cho commit mới nhất.
