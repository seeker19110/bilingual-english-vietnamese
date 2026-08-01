import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

// Tính năng "kéo 1 tay" (giống Reachability trên iPhone): người dùng nhấn giữ (chạm
// hoặc bấm chuột) — GIỮ YÊN một lúc rồi kéo xuống → toàn bộ nội dung trang tụt xuống
// tối đa 60% chiều cao màn hình, giúp bấm các nút phía trên dễ hơn khi cầm điện thoại
// 1 tay. Buông ra, nếu 3 giây không thao tác gì thêm thì tự trôi ngược lên trong 3 giây.
//
// Dùng Pointer Events (không phải Touch Events riêng) để "bấm mà không nhả" luôn được
// tính là đang giữ — dù là chạm tay thật trên điện thoại hay bấm giữ chuột (vd khi test
// bằng chế độ giả lập mobile trên máy tính) — cả 2 đều phát cùng 1 loại sự kiện.
const HOLD_MS = 300 // Phải giữ yên ít nhất chừng này mới coi là muốn kéo (không phải cuộn trang bình thường)
const HOLD_MOVE_THRESHOLD_PX = 10 // Di chuyển quá ngưỡng này trong lúc giữ → huỷ, coi là cuộn trang bình thường
const RETURN_DELAY_MS = 3000 // Sau khi buông, chờ chừng này rồi mới tự trôi lên
const RETURN_DURATION_MS = 3000 // Thời gian trôi ngược lên lại vị trí cũ
const MAX_DRAG_RATIO = 0.6 // Kéo xuống tối đa 60% chiều cao màn hình

export function useOneHandedDrag() {
  const [translateY, setTranslateY] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const holdTimer = useRef<number | null>(null)
  const returnTimer = useRef<number | null>(null)
  const holdReady = useRef(false)
  const isDragging = useRef(false)
  const activePointerId = useRef<number | null>(null)
  const startY = useRef(0)
  const startTranslate = useRef(0)

  const clearHoldTimer = () => {
    if (holdTimer.current != null) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }
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

  useEffect(
    () => () => {
      clearHoldTimer()
      clearReturnTimer()
    },
    [],
  )

  const onPointerDown = (e: PointerEvent) => {
    // LƯU Ý: KHÔNG huỷ hẹn giờ tự trôi lên ở đây — nếu không, chỉ cần bấm/chạm thêm
    // 1 lần (cuộn trang, bấm nút khác…) sau khi kéo xuống là bị "kẹt" luôn, không bao
    // giờ tự về nữa. Hẹn giờ chỉ bị huỷ khi THỰC SỰ kéo lại (xem onPointerMove) và luôn
    // được đặt lại mỗi khi buông ra (xem onPointerUp).
    activePointerId.current = e.pointerId
    startY.current = e.clientY
    startTranslate.current = translateY
    holdReady.current = false
    isDragging.current = false
    clearHoldTimer()
    // Bấm giữ mà không nhả (không di chuyển) vẫn tính đủ 0.3s nhờ setTimeout chạy độc
    // lập với việc có di chuyển hay không — chỉ cần con trỏ còn nằm yên tại chỗ.
    holdTimer.current = window.setTimeout(() => {
      holdReady.current = true
    }, HOLD_MS)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    const dy = e.clientY - startY.current
    // Nội dung đang bị kéo xuống sẵn (>0) → theo con trỏ NGAY, không cần giữ yên 0.3s,
    // để người dùng chủ động đẩy lên (hoặc kéo thêm xuống) là thấy phản hồi tức thì.
    // Chỉ khi bắt đầu từ vị trí gốc (0%) mới cần giữ yên trước, tránh nhầm với cuộn trang.
    const alreadyPulledDown = startTranslate.current > 0
    if (!holdReady.current && !alreadyPulledDown) {
      // Chưa giữ đủ lâu mà đã di chuyển nhiều → đây là cuộn trang bình thường, không kéo
      if (Math.abs(dy) > HOLD_MOVE_THRESHOLD_PX) clearHoldTimer()
      return
    }
    if (!isDragging.current) clearReturnTimer() // Bắt đầu kéo lại thật → huỷ hẹn giờ cũ
    isDragging.current = true
    setTransitionMs(0)
    const maxDrag = window.innerHeight * MAX_DRAG_RATIO
    setTranslateY(Math.min(maxDrag, Math.max(0, startTranslate.current + dy)))
  }

  const onPointerUp = (e: PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
    clearHoldTimer()
    // Luôn đặt lại hẹn giờ tự trôi lên nếu nội dung đang bị kéo xuống — kể cả khi
    // lần này không phải là kéo (vd chỉ bấm 1 nút trong lúc đang ở trạng thái kéo).
    if (translateY > 0) scheduleReturn()
    holdReady.current = false
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
