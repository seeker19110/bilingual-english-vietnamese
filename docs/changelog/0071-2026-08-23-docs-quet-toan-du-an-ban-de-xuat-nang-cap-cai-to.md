# docs: quét toàn dự án + bản đề xuất nâng cấp/cải tổ (2026-08-23)

**Việc đã làm:** người dùng yêu cầu "quét toàn dự án và đưa ra đề xuất nâng cấp, cải tổ tốt
nhất". Đã chạy 4 lượt khảo sát song song (backend API, frontend, kiến trúc monorepo, nợ kỹ
thuật/tài liệu) và tổng hợp thành
**`docs/research/de-xuat-nang-cap-cai-to-2026-08-23.md`** — đọc file đó để biết đầy đủ.

**Phát hiện nổi bật (tóm tắt):**

- 33/48 API mở rộng (Platform Vx/Companion) KHÔNG có persistence — `Map` in-memory, vỡ trong
  PM2 cluster 3 instance; dữ liệu giả (ReferralVipBanner, DailyQuestsCard) hiện ngay trang chủ.
- 5 đường gọi AI trả tiền không đếm lượt (`gemini-live`, `companion`, `vision-solve`,
  `ambient-vision`, `co-learning-audio`); `ecosystem.config.cjs` thiếu `REDIS_URL`; scheduler
  chạy ×3 instance (push nhắc học gửi 3 lần/người); `/api/health/deep` không auth.
- Workspace monorepo "giả" (17 gói + apps/english không có package.json); 49 shim pages mồ côi;
  `core-grading` 1.355 dòng không ai dùng; 3 bảng DB chết; 2 cặp migration trùng số 0026/0027;
  Sổ tay lỗi sai chỉ nằm localStorage (rủi ro mất dữ liệu người dùng thật).

**Đề xuất (chờ người dùng duyệt):** 2 quyết định chiến lược N0 (Q1 chốt phạm vi — khuyến nghị
quay về lõi gia sư, đóng băng Platform Vx chưa thật; Q2 chốt 1 lộ trình kiến trúc duy nhất) +
5 nhóm việc N1→N5, trong đó **N1 (vá tiền/bảo mật) đề xuất chèn TRƯỚC PR D** của loạt A→G
đang dở. Trình tự chi tiết ở mục 4 của bản đề xuất. Nhánh: `claude/project-upgrade-proposal-c3wb5h`.

**Bổ sung cùng ngày — đặc tả cải tổ CẤU TRÚC THƯ MỤC** (người dùng yêu cầu nghiên cứu riêng):
**`docs/research/dac-ta-cai-to-cau-truc-2026-08-23.md`** — cây thư mục đích chuẩn
(`apps/{english,hub,server}` + 14 gói `@dhcb/*` có package.json thật, `api/` chia theo domain,
`core-english`/`core-domains` mới), quyết định kỹ thuật then chốt (bundle server bằng esbuild
để hết cấm alias ở backend, giữ bất biến `dist/` + `dist-server/server.js` nên KHÔNG cần việc
tay trên VPS), lộ trình 6 PR (S1→S6, ~6,5 ngày công) kèm rủi ro/cách đỡ. Chờ người dùng chốt
3 cổng: phương án esbuild, cây đích, thời điểm (sau hay chen giữa loạt PR D→G).
