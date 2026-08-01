import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

// Tính năng "kéo 1 tay" (giống Reachability trên iPhone): TỔNG thời gian từ lúc bấm
// xuống (chạm hoặc chuột) tới hiện tại — kể cả lúc đang di chuyển — vượt quá 0.05s là
// cho phép kéo header + toàn bộ nội dung trang xuống, tối đa 60% chiều cao màn hình,
// giúp bấm các nút phía trên dễ hơn khi cầm điện thoại 1 tay. Buông ra, nếu 3 giây
// không thao tác gì thêm thì tự trôi ngược lên trong 3 giây.
//
// Dùng Pointer Events (không phải Touch Events riêng) để hoạt động thống nhất dù là
// chạm tay thật trên điện thoại hay bấm chuột (vd khi test bằng chế độ giả lập mobile
// trên máy tính).
//
// QUAN TRỌNG — xung đột với cuộn trang gốc: nếu để trình duyệt tự quyết định, nó sẽ
// nhận diện thao tác kéo dọc là CUỘN TRANG ngay từ đầu và giành quyền xử lý. Với CHUỘT
// thì không sao (chuột không có cuộn-chạm gốc để tranh giành), nhưng với CẢM ỨNG THẬT,
// gọi preventDefault() TRONG LÚC chạy KHÔNG đủ tin cậy trên Safari iOS — Safari có thể
// đã "chốt" quyền xử lý cuộn ngay khi vừa chạm, trước khi JS kịp phản hồi. Cách duy
// nhất chắc chắn: khai báo CSS `touch-action: none` NGAY TỪ ĐẦU (trước khi cử chỉ bắt
// đầu, không thể set bằng JS sau khi đã chạm), để trình duyệt biết trước là nhường
// quyền xử lý gesture dọc cho JS. Ta chỉ bật `touch-action: none` khi đang Ở ĐỈNH CUỘN
// (window.scrollY === 0, theo dõi bằng listener scroll) hoặc đang kéo xuống sẵn — các
// lúc khác vẫn để trình duyệt tự cuộn bình thường.
const ACTIVATE_MS = 50 // Tổng thời gian bấm+giữ+kéo vượt quá mốc này là kích hoạt kéo
const RETURN_DELAY_MS = 3000 // Sau khi buông, chờ chừng này rồi mới tự trôi lên
const RETURN_DURATION_MS = 3000 // Thời gian trôi ngược lên lại vị trí cũ
const MAX_DRAG_RATIO = 0.6 // Kéo xuống tối đa 60% chiều cao màn hình

export function useOneHandedDrag() {
  const [translateY, setTranslateY] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const [atTop, setAtTop] = useState(() =>
    typeof window === 'undefined' ? true : window.scrollY <= 0,
  )
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

  // Đang kéo xuống (translateY > 0) → không cho scrollY lệch khỏi 0, để header luôn
  // nằm trên cùng, body luôn dính liền ngay sau. LƯU Ý: KHÔNG dùng document.documentElement
  // .style.overflow = 'hidden' — cách đó set 1 style TOÀN CỤC, nếu effect dọn dẹp không
  // kịp chạy đúng lúc (vd chuyển trang/route ngay trong lúc đang kéo) thì overflow bị
  // "kẹt" lại mãi mãi, khoá cuộn cả trang vĩnh viễn (đã xảy ra thật ở trang Luyện tập).
  // Thay vào đó, chỉ PHẢN ỨNG lại: hễ scrollY lệch khỏi 0 trong lúc đang kéo thì ép về
  // lại ngay — không set style nào nên không thể bị kẹt.
  const translateYRef = useRef(0)
  useEffect(() => {
    translateYRef.current = translateY
  }, [translateY])

  useEffect(() => {
    const onScroll = () => {
      if (translateYRef.current > 0 && window.scrollY !== 0) {
        window.scrollTo(0, 0)
        return
      }
      setAtTop(window.scrollY <= 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => clearReturnTimer, [])

  const onPointerDown = (e: PointerEvent) => {
    // LƯU Ý: KHÔNG huỷ hẹn giờ tự trôi lên ở đây — nếu không, chỉ cần bấm/chạm thêm
    // 1 lần (cuộn trang, bấm nút khác…) sau khi kéo xuống là bị "kẹt" luôn, không bao
    // giờ tự về nữa. Hẹn giờ chỉ bị huỷ khi THỰC SỰ kéo lại (xem onPointerMove) và luôn
    // được đặt lại mỗi khi buông ra (xem onPointerUp).
    const alreadyPulledDown = translateY > 0
    // Chỉ nhận cử chỉ khi ở đỉnh cuộn (hoặc đã đang kéo xuống sẵn) — nếu trang còn có
    // thể cuộn lên, để trình duyệt xử lý cuộn bình thường, không tranh giành gesture.
    if (!alreadyPulledDown && window.scrollY > 0) {
      activePointerId.current = null
      return
    }
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
    if (elapsed < ACTIVATE_MS && !alreadyPulledDown) {
      if (e.cancelable) e.preventDefault()
      return
    }
    if (e.cancelable) e.preventDefault()
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
    // Chỉ khoá cuộn mặc định của trình duyệt lúc đang ở đỉnh cuộn / đang kéo xuống —
    // đây là điều kiện BẮT BUỘC phải khai báo TRƯỚC (không set được bằng JS lúc đang
    // chạm) để Safari iOS nhường quyền xử lý gesture dọc cho JS thay vì tự cuộn trang.
    touchAction: atTop || translateY > 0 ? 'none' : 'auto',
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
