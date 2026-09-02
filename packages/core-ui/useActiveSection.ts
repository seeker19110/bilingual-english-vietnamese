// packages/core-ui/useActiveSection.ts — theo dõi "đang đọc tới mục nào" của một trang dài.
//
// Tách khỏi `TocRail.tsx` vì file đó chỉ được phép xuất COMPONENT: React Fast Refresh (và luật
// lint `react-refresh/only-export-components`) mất khả năng thay nóng khi một file trộn cả
// component lẫn hàm thường.
import { useEffect, useState } from 'react'

/**
 * Mục nào đang hiện trên màn hình — trả về `id` của mục gần đỉnh khung nhìn nhất.
 *
 * Dùng `IntersectionObserver` chứ không nghe sự kiện `scroll`: trình duyệt tự gộp nhịp, nên
 * không phải tự chống dội và không chạy hàm tính toán ở mỗi khung hình khi người dùng cuộn.
 *
 * `rootMargin` cắt 20% trên và 65% dưới khung nhìn: phần còn lại là một dải hẹp gần đỉnh màn
 * hình, nên "mục đang đọc" là mục vừa đi qua dải đó — nếu để nguyên cả khung nhìn thì lúc nào
 * cũng có 2–3 mục cùng hiện và mục lục sẽ nhảy qua lại.
 */
export function useActiveSection(ids: readonly string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0])
  // Ghép thành chuỗi để mảng mới nhưng NỘI DUNG không đổi không kích hoạt lại effect (mảng
  // `items` thường được dựng mới ở mỗi lần render của trang).
  const key = ids.join('|')

  useEffect(() => {
    const list = key ? key.split('|') : []
    if (list.length === 0) return
    // Trình duyệt quá cũ (hoặc môi trường test không có API này) thì bỏ qua phần theo dõi —
    // mục lục vẫn bấm được, chỉ không tự tô sáng.
    if (typeof IntersectionObserver === 'undefined') return

    const seen = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting)
        // Mục đầu tiên (theo thứ tự trang) đang nằm trong dải quan sát thắng — giữ cho mục lục
        // đi xuôi theo trang thay vì nhảy tới mục cuối vừa lọt vào.
        const first = list.find((id) => seen.get(id))
        if (first) setActive(first)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    )

    const els = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    for (const el of els) observer.observe(el)
    return () => observer.disconnect()
  }, [key])

  return active
}
