// staticApps.ts — Chọn bản build tĩnh nào phục vụ cho một Host header.
//
// Tách khỏi server.ts vì server.ts gọi `app.listen()` ngay lúc import, nên không thể import nó
// trong test. Logic chọn app là thứ ĐÁNG canh nhất trong khối phục vụ static: một lần trôi mất
// nó đã khiến `apps/hub` build ra rồi bị bỏ đi suốt nhiều tuần mà không cổng nào đỏ (audit toàn
// diện 2026-08-28). Ở đây nó là hàm thuần + có test.

import path from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Đọc danh sách host phục vụ landing hub từ biến môi trường.
 *
 * Nhận nhiều host phân cách dấu phẩy (vd chạy song song .org/.com trong lúc chuyển đổi domain).
 * Chuẩn hoá: bỏ khoảng trắng thừa, hạ chữ thường, bỏ phần tử rỗng — để `HUB_HOSTNAME="a, ,B"`
 * không sinh ra host rỗng khớp nhầm mọi request.
 */
export function parseHubHostnames(raw: string | undefined): string[] {
  return (raw ?? 'hub.donghanhcungban.org')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Thư mục build tương ứng với host của request.
 *
 * MẶC ĐỊNH LÀ APP NỀN TẢNG, có chủ đích: chọn sai theo hướng "host lạ → app nền tảng" thì người
 * dùng vẫn vào được chỗ họ cần; sai theo hướng ngược lại thì domain đang chạy thật mất trắng.
 * Nên hub phải được GỌI TÊN tường minh trong `hubHostnames` mới được chọn.
 *
 * Hub cũng chỉ được chọn khi bản build của nó CÓ THẬT trên đĩa (`index.html` tồn tại) — thiếu
 * (vd môi trường dev chưa chạy `npm run build -w @dhcb/hub`) thì rơi về app nền tảng, thà hiện
 * sai app còn hơn trả 404 cho cả một domain.
 */
export function resolveDistDir(opts: {
  hostname: string | undefined
  hubHostnames: string[]
  appDistDir: string
  hubDistDir: string
  /** Bơm được để test không phụ thuộc đĩa thật. */
  hubBuildExists?: (dir: string) => boolean
}): string {
  const { hostname, hubHostnames, appDistDir, hubDistDir } = opts
  const exists = opts.hubBuildExists ?? ((dir: string) => existsSync(path.join(dir, 'index.html')))
  if (!hostname) return appDistDir
  if (!hubHostnames.includes(hostname.toLowerCase())) return appDistDir
  return exists(hubDistDir) ? hubDistDir : appDistDir
}
