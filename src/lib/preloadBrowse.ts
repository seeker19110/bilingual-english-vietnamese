// src/lib/preloadBrowse.ts — Nạp trước chunk ĐẦU của trang Bài học + Cụm từ (nhẹ).
// KHÔNG import curriculum/từ điển → an toàn để gọi ngay lúc đăng nhập (không kéo
// dữ liệu nặng vào bundle khởi động). Chỉ dynamic-import 2 loader nhỏ.

import { preloadFlags } from './preloadState'

export async function preloadBrowseChunks(): Promise<void> {
  if (preloadFlags.browse) return
  preloadFlags.browse = true
  const [lessonsLoader, patternsLoader] = await Promise.all([
    import('../data/lessons/loader').catch(() => null),
    import('../data/patterns/loader').catch(() => null),
  ])
  await Promise.all([
    lessonsLoader?.loadChunk(0) ?? Promise.resolve(),  // 10 bài học đầu
    patternsLoader?.loadChunk(0) ?? Promise.resolve(), // 8 chủ đề cụm từ đầu
  ])
}
