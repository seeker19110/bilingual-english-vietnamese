import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

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
// Đóng lại khi: (1) chạm vào nội dung đang bị đẩy xuống, (2) vuốt lên lại ở dải trigger,
// (3) cuộn trang, hoặc (4) không thao tác gì trong RETURN_DELAY_MS thì tự thu lại.
const ACTIVATE_DISTANCE_PX = 12 // Vuốt xuống ở dải trigger đủ khoảng cách này là bật
const OPEN_DURATION_MS = 220 // Thời gian trượt xuống khi bật
const RETURN_DELAY_MS = 3000 // Sau khi bật, chờ chừng này rồi mới tự thu lại
const RETURN_DURATION_MS = 3000 // Thời gian trượt ngược lên khi thu lại
const PULL_DOWN_RATIO = 0.45 // Bật xuống cố định 45% chiều cao màn hình

export function useOneHandedDrag() {
  const [translateY, setTranslateY] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const isOpen = useRef(false)
  const returnTimer = useRef<number | null>(null)
  const activePointerId = useRef<number | null>(null)
  const startY = useRef(0)
  const triggered = useRef(false)

  const clearReturnTimer = () => {
    if (returnTimer.current != null) {
      window.clearTimeout(returnTimer.current)
      returnTimer.current = null
    }
  }
  const close = () => {
    if (!isOpen.current) return
    clearReturnTimer()
    isOpen.current = false
    setTransitionMs(RETURN_DURATION_MS)
    setTranslateY(0)
  }
  const scheduleReturn = () => {
    clearReturnTimer()
    returnTimer.current = window.setTimeout(close, RETURN_DELAY_MS)
  }
  const open = () => {
    isOpen.current = true
    setTransitionMs(OPEN_DURATION_MS)
    setTranslateY(Math.round(window.innerHeight * PULL_DOWN_RATIO))
    scheduleReturn()
  }

  useEffect(() => clearReturnTimer, [])

  // Chạm vào nội dung đang bị đẩy xuống → đóng lại ngay, không chặn thao tác bấm bên dưới
  // (không preventDefault, không stopPropagation — chỉ đóng, để nút/link vẫn nhận được click).
  const onContentPointerDown = () => {
    if (isOpen.current) close()
  }

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
    contentStyle,
    contentHandlers: { onPointerDownCapture: onContentPointerDown },
    triggerHandlers: {
      onPointerDown: onTriggerPointerDown,
      onPointerMove: onTriggerPointerMove,
      onPointerUp: onTriggerPointerUp,
      onPointerCancel: onTriggerPointerUp,
    },
  }
}
