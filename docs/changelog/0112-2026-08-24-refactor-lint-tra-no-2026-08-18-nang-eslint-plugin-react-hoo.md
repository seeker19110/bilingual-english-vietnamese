# refactor(lint): trả nợ 2026-08-18 — nâng eslint-plugin-react-hooks 4.6.2 → 7.1.1 + sửa 95 lỗi React Compiler (2026-08-24)

Món nợ "ghim tạm plugin về 4.6.2" nay ĐÃ TRẢ: nâng lên 7.1.1 và sửa ĐÚNG BẢN CHẤT toàn bộ
95 lỗi rule mới trên ~64 file (68 `set-state-in-effect` · 12 `purity` · 11 `exhaustive-deps` ·
9 `immutability` · 3 `preserve-manual-memoization` · 2 `globals` · 1 `refs`) — **0 eslint-disable
mới**, còn gỡ được ~10 dòng disable cũ. Chia 4 nhóm file rời nhau giao 4 subagent song song theo
cẩm nang sửa chung, phiên chính soát lại diff các luồng nhạy (Chat/Speaking/useChat/AuthProvider/
ThemeProvider) trước khi commit.

Các mẫu sửa chính (để lần sau viết code khỏi tái phạm):

- `set-state-in-effect`: effect mount-only đọc localStorage → `useState(() => ...)` lazy init;
  `setLoading(true)` đồng bộ đầu effect → khởi tạo mặc định `true`, chỉ set từ handler refetch;
  reset state khi prop đổi → mẫu chuẩn React "so sánh prev prop trong render"; loader gọi từ
  effect → `void Promise.resolve().then(load)` để mọi setState nằm trong callback bất đồng bộ.
- `purity`: `crypto.randomUUID`/`Date.now`/`Math.random` không gọi trong render/useMemo — tách
  helper module-level (`newMessage()` ở Chat/Speaking) hoặc lazy initializer.
- `immutability`: khai báo trước khi dùng; biến closure gán trong render → `useRef` (vd
  `connectWsRef` trong `useChat.ts`, mảng offset `unitLessonStarts` ở CefrLevelPage).
- `preserve-manual-memoization`: useMemo compiler không bảo toàn được → BỎ memo thủ công cho hàm
  thuần rẻ (EnglishHome/Home/Challenge), compiler tự lo.
- `ThemeProvider` tái cấu trúc đúng bản chất: theme hiển thị = derived `locked ? kid : theme`,
  state luôn giữ lựa chọn thật của user; effect chỉ đồng bộ DOM.

Cổng: lint 0 lỗi 0 cảnh báo (plugin 7.1.1) · typecheck · format · test 5181/5181 · build. Bundle
không đổi (208.58 kB).

**Nợ mới ghi nhận (thấp):** ~~`computeLockedMapPersisted` có side effect trong render~~ — **ĐÃ
TRẢ ngay trong ngày**, xem mục "refactor(cefr)" ở trên.
