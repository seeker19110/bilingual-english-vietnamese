import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

// Tính năng "kéo 1 tay" (giống Reachability trên iPhone): TỔNG thời gian từ lúc bấm
// xuống (chạm hoặc chuột) tới hiện tại — kể cả lúc đang di chuyển — vượt quá 0.2s là
// cho phép kéo header + toàn bộ nội dung trang xuống, tối đa 60% chiều cao màn hình,
// giúp bấm các nút phía trên dễ hơn khi cầm điện thoại 1 tay. Buông ra, nếu 3 giây
// không thao tác gì thêm thì tự trôi ngược lên trong 3 giây.
//
// Dùng Pointer Events (không phải Touch Events riêng) để hoạt động thống nhất dù là
// chạm tay thật trên điện thoại hay bấm chuột (vd khi test bằng chế độ giả lập mobile
// trên máy tính).
const ACTIVATE_MS = 200 // Tổng thời gian bấm+giữ+kéo vượt quá mốc này là kích hoạt kéo
const RETURN_DELAY_MS = 3000 // Sau khi buông, chờ chừng này rồi mới tự trôi lên
const RETURN_DURATION_MS = 3000 // Thời gian trôi ngược lên lại vị trí cũ
const MAX_DRAG_RATIO = 0.6 // Kéo xuống tối đa 60% chiều cao màn hình

export function useOneHandedDrag() {
  const [translateY, setTranslateY] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const returnTimer = useRef<number | null>(null)
  const isDragging = useRef(false)
  const activePointerId = useRef<number | null>(null)
  const startY = useRef(0)
  const startTime = useRef(0)
  const startTranslate = useRef(0)

  const clearReturnTimer = () => {
    if (returnTimer.current != null) {
      window.clearTimeout(returnTimer.current)
      returnTimer.current = null
    }
  }
  const scheduleReturn = () => {
    clearReturnTimer()
    returnTimer.current = window.setTimeout(() => {
      setTransitionMs(RETURN_DURATION_MS)
      setTranslateY(0)
    }, RETURN_DELAY_MS)
  }

  useEffect(() => clearReturnTimer, [])

  const onPointerDown = (e: PointerEvent) => {
    // LƯU Ý: KHÔNG huỷ hẹn giờ tự trôi lên ở đây — nếu không, chỉ cần bấm/chạm thêm
    // 1 lần (cuộn trang, bấm nút khác…) sau khi kéo xuống là bị "kẹt" luôn, không bao
    // giờ tự về nữa. Hẹn giờ chỉ bị huỷ khi THỰC SỰ kéo lại (xem onPointerMove) và luôn
    // được đặt lại mỗi khi buông ra (xem onPointerUp).
    activePointerId.current = e.pointerId
    startY.current = e.clientY
    startTime.current = performance.now()
    startTranslate.current = translateY
    isDragging.current = false
  }

  const onPointerMove = (e: PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    const dy = e.clientY - startY.current
    const elapsed = performance.now() - startTime.current
    // Nội dung đang bị kéo xuống sẵn (>0) → theo con trỏ NGAY, không cần đủ 0.2s, để
    // người dùng chủ động đẩy lên (hoặc kéo thêm xuống) là thấy phản hồi tức thì. Chỉ
    // khi bắt đầu từ vị trí gốc (0%) mới cần đủ thời gian, tránh nhầm với cuộn trang.
    const alreadyPulledDown = startTranslate.current > 0
    if (elapsed < ACTIVATE_MS && !alreadyPulledDown) return
    if (!isDragging.current) clearReturnTimer() // Bắt đầu kéo lại thật → huỷ hẹn giờ cũ
    isDragging.current = true
    setTransitionMs(0)
    const maxDrag = window.innerHeight * MAX_DRAG_RATIO
    setTranslateY(Math.min(maxDrag, Math.max(0, startTranslate.current + dy)))
  }

  const onPointerUp = (e: PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
    // Luôn đặt lại hẹn giờ tự trôi lên nếu nội dung đang bị kéo xuống — kể cả khi
    // lần này không phải là kéo (vd chỉ bấm 1 nút trong lúc đang ở trạng thái kéo).
    if (translateY > 0) scheduleReturn()
    isDragging.current = false
  }

  const style: CSSProperties = {
    transform: translateY ? `translateY(${translateY}px)` : undefined,
    transition: transitionMs ? `transform ${transitionMs}ms ease` : undefined,
  }

  return {
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  }
}
