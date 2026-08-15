-- 0035_entitlements.sql — Bảng `entitlements`: quyền lợi gói cước theo TỪNG SẢN PHẨM
-- (nền tảng nói chung hoặc từng môn học), chuẩn bị cho lúc bán được gói riêng từng môn.
--
-- LÝ DO (Bước 2 kế hoạch quản lý user đa lĩnh vực — docs/adr/0002-quan-ly-nguoi-dung.md):
-- `profiles.plan` hiện là 1 CHUỖI DUY NHẤT cho toàn tài khoản — không diễn tả được
-- "Pro môn Anh nhưng Free môn Toán", cũng không phân biệt được NGUỒN gốc quyền lợi (mua/
-- thử/admin cấp tay/thưởng) vốn đang nằm rải rác ở nhiều cột khác nhau
-- (`trial_granted_at`, `signup_trial_granted_at`, `vip_whitelist`…).
--
-- PHẠM VI BƯỚC NÀY: chỉ THÊM bảng + BACKFILL, KHÔNG đổi bất kỳ code đọc/ghi gói cước nào.
-- `profiles.plan`/`plan_expires_at` VẪN LÀ NGUỒN SỰ THẬT — toàn bộ billing/usage/admin hiện
-- tại (packages/core-billing, api/admin-grant-plan.ts, api/payment-webhook.ts…) tiếp tục đọc
-- y như cũ. Việc chuyển các nơi đó sang đọc `entitlements` là một bước RIÊNG sau này, có audit
-- kỹ vì đụng trực tiếp tới tiền thật — không làm chung PR thuần hạ tầng này.
--
-- `product = 'platform'` = quyền lợi áp dụng cho toàn nền tảng (đúng như hành vi `profiles.plan`
-- hiện tại: 1 gói dùng chung mọi tính năng/mọi môn). Môn mới sau này có thể có dòng riêng
-- `product = 'math'`… mà không cần đổi bảng.
--
-- Mỗi user tối đa 1 dòng ĐANG HIỆU LỰC cho mỗi product (giống `profiles.plan` chỉ có 1 giá trị
-- tại một thời điểm) — khoá chính `(user_id, product)`, ghi đè khi gói đổi (nâng cấp/gia hạn/
-- hết hạn), KHÔNG giữ lịch sử (lịch sử giao dịch đã có ở bảng `payments`).
--
-- Idempotent: chạy lại nhiều lần không sao. Rollback: drop table if exists public.entitlements;
-- (dữ liệu gốc vẫn còn nguyên ở `profiles.plan`/`plan_expires_at`).

create table if not exists public.entitlements (
  user_id    uuid        not null references public.users(id) on delete cascade,
  product    text        not null default 'platform',
  tier       text        not null default 'free',   -- 'free' | 'pro' | 'vip'
  source     text        not null default 'unknown', -- 'purchase' | 'trial' | 'admin_grant' | 'vip_whitelist' | 'migration_backfill' | ...
  granted_at timestamptz not null default now(),
  expires_at timestamptz,                            -- null = không hết hạn (vd VIP whitelist vĩnh viễn)
  primary key (user_id, product)
);

create index if not exists entitlements_product_tier_idx on public.entitlements(product, tier);

-- ── Backfill từ profiles.plan/plan_expires_at (nguồn sự thật hiện tại) ───────────────────
insert into public.entitlements (user_id, product, tier, source, granted_at, expires_at)
select
  p.id,
  'platform',
  case when p.plan in ('pro', 'vip') then p.plan else 'free' end,
  'migration_backfill',
  p.created_at,
  p.plan_expires_at
from public.profiles p
on conflict (user_id, product) do nothing;
