// src/lib/preloadState.ts — Cờ trạng thái preload dùng chung (KHÔNG import gì nặng).
//
// Tách riêng để AuthProvider (nằm trong bundle khởi động) có thể reset cờ khi đăng
// xuất mà KHÔNG kéo theo curriculum + dữ liệu FOUNDATION (~100KB) vào bundle entry.
// Logic preload nặng (preloadLearnData) nằm ở preloader.ts, chỉ trang Học mới import.

export const preloadFlags = {
  learn: false, // đã preload từ điển + audio "hôm nay" cho trang Học chưa
  browse: false, // đã preload chunk đầu của Bài học/Cụm từ chưa
}

// Reset toàn bộ (gọi khi đăng xuất) để user kế tiếp được preload lại.
export function resetPreload(): void {
  preloadFlags.learn = false
  preloadFlags.browse = false
}
