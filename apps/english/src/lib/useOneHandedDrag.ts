import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'

// Tính năng "kéo 1 tay" (giống Reachability trên iPhone thật): vuốt xuống bắt đầu từ
// DẢI MỎNG Ở MÉP DƯỚI MÀN HÌNH (xem <div {...triggerHandlers}> render đè lên BottomNav
// trong App.tsx) — không phải kéo header hay kéo bất kỳ đâu trên trang như bản cũ.
//
// Khác bản cũ: đây là cử chỉ BẬT/TẮT (như thật ngoài đời), không phải kéo-theo-ngón-tay
// liên tục — vuốt xuống đủ NGƯỠNG (ACTIVATE_DISTANCE_PX) là toàn bộ nội dung "bật" xuống
// một khoảng CỐ ĐỊNH (PULL_DOWN_RATIO) bằng hiệu ứng trượt nhanh, không cần theo sát vị
// trí ngón tay. Nhờ dải trigger tách riêng khỏi vùng cuộn trang, không còn xung đột với
// cuộn trang gốc của trình duyệt nữa nên KHÔNG cần preventDefault() hay ngưỡng thời gian
// như bản cũ.
//
// Đóng lại khi: vuốt lên lại ở dải trigger, hoặc không có thao tác vuốt/click/scroll nào
// trên toàn trang trong RETURN_DELAY_MS liên tục thì tự thu lại (mỗi thao tác gia hạn lại
// đồng hồ đếm từ đầu — xem effect lắng nghe pointerdown/scroll/wheel/touchmove bên dưới).
const ACTIVATE_DISTANCE_PX = 12 // Vuốt xuống ở dải trigger đủ khoảng cách này là bật
const OPEN_DURATION_MS = 220 // Thời gian trượt xuống khi bật
const RETURN_DELAY_MS = 10_000 // Sau khi bật, chờ 10 giây rồi mới tự thu lại
const RETURN_DURATION_MS = 3000 // Thời gian trượt ngược lên khi thu lại
const PULL_DOWN_RATIO = 0.45 // Bật xuống cố định 45% chiều cao màn hình

export function useOneHandedDrag() {
  const [translateY, setTranslateY] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const [isOpenState, setIsOpenState] = useState(false) // reactive mirror for UI (chevron)
  const isOpen = useRef(false)
  const returnTimer = useRef<number | null>(null)
  const activePointerId = useRef<number | null>(null)
  const startY = useRef(0)
  const triggered = useRef(false)

  const clearReturnTimer = useCallback(() => {
    if (returnTimer.current != null) {
      window.clearTimeout(returnTimer.current)
      returnTimer.current = null
    }
  }, [])
  const close = useCallback(() => {
    if (!isOpen.current) return
    clearReturnTimer()
    isOpen.current = false
    setIsOpenState(false)
    setTransitionMs(RETURN_DURATION_MS)
    setTranslateY(0)
  }, [clearReturnTimer])
  const scheduleReturn = useCallback(() => {
    clearReturnTimer()
    returnTimer.current = window.setTimeout(close, RETURN_DELAY_MS)
  }, [clearReturnTimer, close])
  const open = () => {
    isOpen.current = true
    setIsOpenState(true)
    setTransitionMs(OPEN_DURATION_MS)
    setTranslateY(Math.round(window.innerHeight * PULL_DOWN_RATIO))
    scheduleReturn()
  }

  useEffect(() => clearReturnTimer, [clearReturnTimer])

  // Khi đang mở: đếm 10s CHỈ tính lúc không có thao tác nào (vuốt/click/scroll) —
  // hễ có 1 trong các thao tác đó thì hẹn giờ tự thu được gia hạn lại từ đầu.
  useEffect(() => {
    if (!isOpenState) return
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'scroll', 'wheel', 'touchmove']
    events.forEach((ev) => window.addEventListener(ev, scheduleReturn, { passive: true }))
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, scheduleReturn))
    }
  }, [isOpenState, scheduleReturn])

  // Handlers gắn vào dải trigger mỏng ở mép dưới màn hình
  const onTriggerPointerDown = (e: PointerEvent) => {
    activePointerId.current = e.pointerId
    startY.current = e.clientY
    triggered.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onTriggerPointerMove = (e: PointerEvent) => {
    if (activePointerId.current !== e.pointerId || triggered.current) return
    const dy = e.clientY - startY.current
    if (dy >= ACTIVATE_DISTANCE_PX) {
      triggered.current = true
      if (!isOpen.current) open()
      else scheduleReturn() // Đang mở sẵn, vuốt xuống tiếp → chỉ gia hạn hẹn giờ tự thu
    } else if (dy <= -ACTIVATE_DISTANCE_PX && isOpen.current) {
      // Vuốt lên lại ở dải trigger → đóng ngay
      triggered.current = true
      close()
    }
  }
  const onTriggerPointerUp = (e: PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
  }

  const contentStyle: CSSProperties = {
    transform: translateY ? `translateY(${translateY}px)` : undefined,
    transition: transitionMs ? `transform ${transitionMs}ms ease` : undefined,
  }

  return {
    isOpen: isOpenState,
    contentStyle,
    triggerHandlers: {
      onPointerDown: onTriggerPointerDown,
      onPointerMove: onTriggerPointerMove,
      onPointerUp: onTriggerPointerUp,
      onPointerCancel: onTriggerPointerUp,
    },
  }
}
