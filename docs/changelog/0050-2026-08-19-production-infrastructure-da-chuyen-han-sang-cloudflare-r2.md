# Production Infrastructure — Đã chuyển hẳn sang Cloudflare R2 (2026-08-19)

- Xác nhận `STORAGE_DRIVER=r2` (Cloudflare R2) đã được kích hoạt hoàn toàn trên production cho toàn bộ kho audio cache TTS và phát âm từ điển (mã hóa AES-256-GCM).
- Giải phóng 100% gánh nặng I/O và dung lượng ổ cứng trên VPS. Không còn lưu trữ file audio tĩnh cục bộ trong thư mục `uploads/` trên máy chủ.
- Đã đồng bộ tài liệu hệ thống (`CLAUDE.md`, `docs/deploy-vps-ubuntu.md`, `docs/system-requirements.md`, `docs/ke-hoach-khoi-phuc-su-co-server.md`).
