// scripts/load-test/k6-baseline.js — Kịch bản load test k6 cơ bản (GĐ4 kế hoạch scale, xem
// docs/research/ke-hoach-scale-30k-concurrent.md mục "GĐ4 — Quan sát & kiểm chứng tải").
//
// MỤC ĐÍCH: đo trần thật của hệ thống (thay vì chỉ ước lượng lý thuyết như trong kế hoạch) —
// p95 latency, tỷ lệ lỗi, tại các mức VU (virtual user) khác nhau, tìm điểm hệ thống bắt đầu
// suy giảm trước khi tuyên bố "đã đạt Nk concurrent".
//
// CHỈ TEST 2 route KHÔNG cần đăng nhập, KHÔNG gọi AI trả phí (health + dictionary — đọc RAM/
// cache, an toàn chạy lặp lại nhiều lần không tốn tiền Anthropic/Groq/Google). Test luồng có
// đăng nhập + gọi AI thật (chat/speaking/stt) cần kịch bản riêng, cẩn thận hơn nhiều (tốn tiền
// thật mỗi request, dễ vượt giới hạn nhà cung cấp) — CHƯA viết ở đây, làm sau khi có ngân sách
// test riêng.
//
// CÁCH DÙNG:
//   1. Cài k6: https://k6.io/docs/get-started/installation/ (không phải npm package, binary
//      riêng — vd `brew install k6` / tải binary Linux).
//   2. Chạy nhắm vào STAGING trước (không phải production thật) nếu có:
//        BASE_URL=https://staging.example.com k6 run scripts/load-test/k6-baseline.js
//   3. Nếu bắt buộc chạy thẳng production (vd chưa có staging), BÁO TRƯỚC cho người vận hành,
//      chọn giờ ít traffic thật, bắt đầu từ VU_TARGET thấp rồi tăng dần — đọc kỹ biến môi
//      trường bên dưới.
//
// BIẾN MÔI TRƯỜNG:
//   BASE_URL   — bắt buộc, vd https://en-vi.donghanhcungban.com (KHÔNG có dấu / cuối)
//   VU_TARGET  — số virtual user tối đa muốn đạt (mặc định 100 — mức AN TOÀN khởi điểm; kế
//                hoạch mục tiêu 50k concurrent, nhưng KHÔNG nhảy thẳng lên số đó — tăng dần qua
//                nhiều lần chạy: 100 → 500 → 2.000 → ... để tránh làm sập hệ thống đang phục vụ
//                người dùng thật, và để biết CHÍNH XÁC hệ thống gãy ở đâu).

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL
if (!BASE_URL) {
  throw new Error(
    'Thiếu biến môi trường BASE_URL — vd: BASE_URL=https://en-vi.donghanhcungban.com k6 run ...',
  )
}
const VU_TARGET = Number(__ENV.VU_TARGET) || 100

// Metric riêng để dễ đọc báo cáo cuối (k6 tự có http_req_duration/http_req_failed, thêm 2 cái
// này để tách riêng theo từng route thay vì gộp chung).
const healthLatency = new Trend('health_latency_ms')
const dictLatency = new Trend('dictionary_latency_ms')
const errorRate = new Rate('custom_error_rate')

// Ramp thận trọng: lên từ từ, giữ ở đỉnh 2 phút để thấy trạng thái ổn định (không phải đỉnh
// nhọn tức thời), rồi xuống từ từ — tránh làm gãy kết nối đột ngột gây nhiễu số liệu.
export const options = {
  stages: [
    { duration: '30s', target: Math.ceil(VU_TARGET * 0.25) },
    { duration: '30s', target: Math.ceil(VU_TARGET * 0.5) },
    { duration: '1m', target: VU_TARGET },
    { duration: '2m', target: VU_TARGET }, // giữ đỉnh
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // Ngưỡng THAM KHẢO theo mục tiêu "DoD GĐ4" trong kế hoạch scale — chỉnh lại sau khi có số
    // đo thật đầu tiên, đừng coi đây là số cố định.
    http_req_failed: ['rate<0.01'], // tỷ lệ lỗi < 1%
    http_req_duration: ['p(95)<1000'], // p95 < 1s cho 2 route nhẹ này (KHÔNG áp cho AI)
  },
}

export default function () {
  // Route 1: health check — rẻ nhất, đo được overhead network/LB thuần tuý.
  const healthRes = http.get(`${BASE_URL}/api/health`)
  healthLatency.add(healthRes.timings.duration)
  const healthOk = check(healthRes, { 'health: status 200': (r) => r.status === 200 })
  errorRate.add(!healthOk)

  sleep(1) // mô phỏng người dùng thật không bắn request liên tục

  // Route 2: dictionary — có tải thật (đọc ~10k+ từ trong RAM), không cần đăng nhập, không gọi
  // AI trả phí. Đại diện tốt cho "traffic đọc nhẹ" (tra từ, mở trang) trong kế hoạch scale.
  const dictRes = http.get(`${BASE_URL}/api/dictionary?word=hello`)
  dictLatency.add(dictRes.timings.duration)
  const dictOk = check(dictRes, {
    'dictionary: status 200 hoặc 429': (r) => [200, 429].includes(r.status),
  })
  errorRate.add(!dictOk)

  sleep(Math.random() * 2 + 1) // 1-3s "think time" giữa các thao tác, gần giống người dùng thật
}
