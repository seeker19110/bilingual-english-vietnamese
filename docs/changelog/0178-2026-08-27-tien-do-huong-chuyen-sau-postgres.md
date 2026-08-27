# feat(programming): lưu tiến độ hướng chuyên sâu xuống Postgres (2026-08-27)

Nối tiếp **PR #712** (dữ liệu 13 hướng + hai trang giới thiệu) và **#716** (cầu nối chặng ↔ unit
bài học). Đây là **việc để ngỏ số 2** của #712: _"chưa lưu tiến độ hướng xuống Postgres; id
chặng/module đã đặt ổn định để sau không phải di trú"_.

Trước đợt này, hai trang `/lap-trinh/huong` và `/lap-trinh/huong/:specId` chỉ là **tài liệu đọc**:
người học chọn hướng xong đóng trình duyệt là không còn dấu vết gì.

## Đã làm

- **Migration `0071_programming_specializations.sql`** (lũy đẳng, `create … if not exists`), hai
  bảng trong schema `programming` đã có:
  - `spec_enrollment (user_id, spec_id, role, started_at, updated_at)` — khoá chính
    `(user_id, spec_id)`, `role in ('primary','cross')`, **partial unique index
    `spec_enrollment_one_primary`** bắt đúng MỘT hướng chính mỗi người, index theo `user_id`.
  - `spec_stage_progress (user_id, spec_id, stage_id, status, completed_at, updated_at)` — khoá
    chính `(user_id, stage_id)`, `status in ('in_progress','completed')`, index theo `user_id`.
- **Service `packages/subject-programming/specProgressService.ts`** — `getSpecProgress` ·
  `enrollSpecialization` · `unenrollSpecialization` · `setSpecStageProgress`. Mọi phép ghi đối
  chiếu `getSpecialization()` / `getSpecStage()` trước; id lạ bị từ chối và **không chạm DB**.
  Đổi hướng chính chạy trong **một transaction** (`withTransaction`) để chỉ mục duy nhất một phần
  không bị va.
- **API `/api/programming/specialization`** (`apps/server/src/api/subjects/programming/
specialization.ts`, gắn route trong `routes.ts`): `GET` đọc snapshot; `POST` với
  `z.discriminatedUnion('action')` — `enroll` · `unenroll` · `stage`. Qua `validateAuth()`,
  rate-limit 60/phút, `user_id` LẤY TỪ TOKEN chứ không từ body (schema `.strict()` nên body kèm
  `userId` bị từ chối thẳng).
- **Client `apps/dhcb/src/lib/programmingSpecProgress.ts`** — cùng khuôn
  `programmingProgress.ts`: server là nguồn sự thật, `localStorage` chỉ là bộ đệm hiển thị.
- **Giao diện**: trang danh sách hiện nhãn _"Bạn đang theo hướng này · n/4 chặng xong"_; trang chi
  tiết có khối **chọn / bỏ hướng** (nói rõ hướng nền không thay hướng chính) và nút **"Đánh dấu đã
  xong chặng này"** ở từng chặng.
- **Test**: 14 test service + 7 test handler (đủ ca lũy đẳng, id lạ bị từ chối, người dùng A
  không đọc/ghi được dữ liệu của B). Cập nhật `routes-registered.test.ts` (đường dẫn tuỳ biến) và
  bảng migration trong `postgres/migrations/README.md`.

## Quyết định đáng ghi lại

1. **Hai bảng, không nhét thêm cột vào `programming.learner_state`.** `learner_state` là 1
   dòng/người cho xương sống P1–P6; hướng chuyên sâu là quan hệ NHIỀU (một hướng sản phẩm + tối đa
   hai hướng nền song song). Nhét thành cột thì mỗi lần đổi luật lại phải đổi schema.
2. **Vai trò `primary`/`cross` do SERVER suy ra từ cờ `crossCutting`, client không gửi.** Client
   không được tự phong một hướng nền thành hướng chính.
3. **Ràng buộc "một hướng chính" đặt ở DB** (partial unique index), không chỉ ở code — cùng cách
   làm với `exam_plans_one_active` của migration 0070. Hai tab mở song song vẫn không lách được.
4. **Service nằm trong gói MÔN** (`subject-programming`) chứ không ở `core-learner`: mọi phép ghi
   phải đối chiếu dữ liệu giáo trình của môn, đặt ở gói lõi dùng chung sẽ khiến lõi phụ thuộc
   ngược vào một môn cụ thể.
5. **`completed` là trạng thái CHỐT, không kéo lùi** — đúng luật đang dùng ở
   `programming.lesson_progress`. Vì vậy nút đánh dấu chặng khoá lại sau khi xong, thay vì cho bấm
   rồi không có gì đổi.
6. **Bỏ theo hướng KHÔNG xoá tiến độ chặng.** Trang danh sách đã hứa "đổi hướng giữa chừng không
   mất gì" từ PR #712 — dữ liệu phải hành xử đúng như lời hứa đó.
7. **Không đổi id chặng/module.** Id là khoá tiến độ; #712 đã đặt ổn định nên không phải di trú gì.

## Việc TAY còn lại

- **Chạy `npm run migrate:pg`** để áp migration `0071`. `scripts/deploy.sh` gọi lệnh này ở mọi lượt
  deploy nên merge vào `main` là tự áp; muốn chắc thì SSH VPS chạy lại (lũy đẳng, chạy lại không sao).

## Việc còn để ngỏ

1. Chưa nối tiến độ chặng với **tiến độ bài học** (`stageUnits.ts` của #716) — đánh dấu chặng hiện
   là thao tác tay của người học, chưa tự suy từ số bài đã xong.
2. Chưa có **gợi ý hướng theo hồ sơ người học** (vẫn là việc để ngỏ số 3 của #712).
