import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'

// Tính năng "kéo 1 tay" (giống Reachability trên iPhone): người dùng chạm và GIỮ YÊN
// một lúc rồi kéo xuống → toàn bộ nội dung trang tụt xuống tối đa 60% chiều cao màn
// hình, giúp bấm các nút phía trên dễ hơn khi cầm điện thoại 1 tay. Buông tay ra, nếu
// 3 giây không thao tác gì thêm thì tự trôi ngược lên vị trí cũ trong 3 giây.
const HOLD_MS = 300 // Phải giữ yên ngón tay ít nhất chừng này mới coi là muốn kéo (không phải cuộn trang bình thường)
const HOLD_MOVE_THRESHOLD_PX = 10 // Di chuyển quá ngưỡng này trong lúc giữ → huỷ, coi là cuộn trang bình thường
const RETURN_DELAY_MS = 3000 // Sau khi buông tay, chờ chừng này rồi mới tự trôi lên
const RETURN_DURATION_MS = 3000 // Thời gian trôi ngược lên lại vị trí cũ
const MAX_DRAG_RATIO = 0.6 // Kéo xuống tối đa 60% chiều cao màn hình

export function useOneHandedDrag() {
  const [translateY, setTranslateY] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const holdTimer = useRef<number | null>(null)
  const returnTimer = useRef<number | null>(null)
  const holdReady = useRef(false)
  const isDragging = useRef(false)
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

  const onTouchStart = (e: TouchEvent) => {
    // LƯU Ý: KHÔNG huỷ hẹn giờ tự trôi lên ở đây — nếu không, chỉ cần chạm màn hình
    // thêm 1 lần (cuộn trang, bấm nút khác…) sau khi kéo xuống là bị "kẹt" luôn,
    // không bao giờ tự về nữa. Hẹn giờ chỉ bị huỷ khi người dùng THỰC SỰ kéo lại
    // (xem onTouchMove) và luôn được đặt lại mỗi khi buông tay (xem onTouchEnd).
    const touch = e.touches[0]
    if (!touch) return
    startY.current = touch.clientY
    startTranslate.current = translateY
    holdReady.current = false
    isDragging.current = false
    clearHoldTimer()
    holdTimer.current = window.setTimeout(() => {
      holdReady.current = true
    }, HOLD_MS)
  }

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    const dy = touch.clientY - startY.current
    if (!holdReady.current) {
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

  const onTouchEnd = () => {
    clearHoldTimer()
    // Luôn đặt lại hẹn giờ tự trôi lên nếu nội dung đang bị kéo xuống — kể cả khi
    // lần chạm này không phải là kéo (vd chỉ bấm 1 nút trong lúc đang ở trạng thái kéo).
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
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd },
  }
}
