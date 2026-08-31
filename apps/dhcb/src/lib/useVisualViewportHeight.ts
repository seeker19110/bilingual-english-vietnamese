import { useEffect, useState } from 'react'

/**
 * Ngưỡng (px) coi là "bàn phím ảo đang mở".
 * iOS/Android khi bật bàn phím sẽ thu nhỏ `visualViewport` vài trăm px, trong khi
 * `window.innerHeight` (và cả đơn vị CSS `100dvh` trên iOS Safari) KHÔNG đổi —
 * đó là lý do khung chat bị bàn phím che. Đặt 100px để không nhầm với thanh
 * địa chỉ trình duyệt co lại khi cuộn (chỉ vài chục px).
 */
const KEYBOARD_THRESHOLD_PX = 100

export interface VisualViewportState {
  /** Chiều cao vùng thực sự nhìn thấy (px). Bằng `window.innerHeight` nếu không có API. */
  height: number
  /** true khi vùng nhìn thấy bị thu hẹp đáng kể → gần như chắc chắn là bàn phím ảo. */
  keyboardOpen: boolean
}

function readViewport(): VisualViewportState {
  // SSR / môi trường test không có DOM: trả giá trị trung tính, không bao giờ "mở bàn phím".
  if (typeof window === 'undefined') return { height: 0, keyboardOpen: false }

  const innerHeight = window.innerHeight
  const vv = window.visualViewport
  if (!vv) return { height: innerHeight, keyboardOpen: false }

  // Chỉ tính phần bị che ở đáy: `height` đã trừ bàn phím, nhưng khi người dùng
  // phóng to (pinch-zoom) height cũng nhỏ đi — `scale` giúp loại bớt ca đó.
  const height = Math.round(vv.height * (vv.scale > 1 ? vv.scale : 1))
  const hidden = innerHeight - height
  return {
    height: Math.min(height, innerHeight),
    keyboardOpen: hidden > KEYBOARD_THRESHOLD_PX,
  }
}

/**
 * Theo dõi chiều cao vùng nhìn thấy thật (visual viewport) để bố cục co lại khi
 * bàn phím ảo mở — thứ mà `100dvh` không làm được trên iOS Safari.
 *
 * Dùng cho các trang chiếm trọn màn hình có ô nhập ở đáy (Chat, Speaking).
 */
export function useVisualViewportHeight(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(readViewport)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport

    const update = () => {
      const next = readViewport()
      // So sánh trước khi set để tránh render thừa mỗi lần cuộn (sự kiện bắn rất dày).
      setState((prev) =>
        prev.height === next.height && prev.keyboardOpen === next.keyboardOpen ? prev : next,
      )
    }

    update()

    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update)
      return () => {
        vv.removeEventListener('resize', update)
        vv.removeEventListener('scroll', update)
      }
    }

    // Đường lui khi trình duyệt không hỗ trợ visualViewport (rất cũ).
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}
