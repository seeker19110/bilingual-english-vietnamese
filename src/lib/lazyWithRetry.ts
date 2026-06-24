// lazyWithRetry — bọc React.lazy để xử lý lỗi tải chunk động.
//
// Vì sao cần: app này tách thành >100 file chunk (mỗi trang + mỗi khối dữ liệu là
// 1 file .js riêng có hash trong tên). Sau MỖI lần deploy, tên file đổi hash; nếu
// trình duyệt đang mở tab cũ (index.html cũ) bấm sang trang chưa tải, nó sẽ xin
// đúng tên chunk CŨ — file đó không còn trên server → import() ném lỗi
// ("Failed to fetch dynamically imported module"). Mặc định React.lazy không tự
// hồi phục → màn hình trắng.
//
// Cách xử lý chuẩn: khi import lỗi, tải lại trang MỘT lần để lấy index.html mới
// (trỏ tới tên chunk mới). Dùng cờ trong sessionStorage để tránh reload vô hạn
// nếu lỗi là do mất mạng thật chứ không phải do deploy.

import { lazy, type ComponentType } from 'react'

export function lazyWithRetry<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const FLAG = 'chunk-reload-once'
    try {
      const mod = await importer()
      // Tải thành công → xoá cờ để lần lỗi sau (deploy khác) lại được reload 1 lần.
      window.sessionStorage.removeItem(FLAG)
      return mod
    } catch (err) {
      const alreadyReloaded = window.sessionStorage.getItem(FLAG)
      if (!alreadyReloaded) {
        window.sessionStorage.setItem(FLAG, '1')
        window.location.reload()
        // Trả về một promise không bao giờ resolve để React giữ trạng thái chờ
        // trong lúc trang đang reload (tránh nháy lỗi).
        return new Promise<{ default: T }>(() => {
          /* không bao giờ resolve — trang đang reload */
        })
      }
      // Đã reload 1 lần mà vẫn lỗi → để ErrorBoundary bắt và hiện nút thử lại.
      throw err
    }
  })
}
