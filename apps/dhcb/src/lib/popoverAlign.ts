// apps/dhcb/src/lib/popoverAlign.ts — chọn phía neo cho popover gắn dưới một nút.
//
// VÌ SAO: popover "Đóng vai" (rộng 16rem = 256px) trước đây neo cứng `right-0`; nút này nằm ở
// nửa TRÁI thanh điều khiển nên ở màn 390px popover tràn ra ngoài mép trái (nợ ở changelog
// 0282). Đổi sang `left-0` cứng thì ở 768px (nút đã trôi sang phải) lại tràn mép PHẢI. Vậy
// phải quyết theo vị trí thật của nút lúc mở: còn đủ chỗ bên phải thì neo trái, không thì
// neo phải.

/** Chiều rộng popover chọn vai — khớp class Tailwind `w-64` (16rem × 16px). */
export const ROLE_PICKER_WIDTH_PX = 256

/**
 * `true` = popover nên neo mép PHẢI của nút (`right-0`), vì mở về bên phải sẽ tràn viewport.
 * Tách thuần theo số để test được, không đụng DOM.
 */
export function shouldAlignPopoverRight(
  anchorLeft: number,
  viewportWidth: number,
  popoverWidth = ROLE_PICKER_WIDTH_PX,
): boolean {
  return anchorLeft + popoverWidth > viewportWidth
}

/** Đọc vị trí thật của nút và viewport rồi gọi hàm thuần ở trên. */
export function shouldAlignPopoverRightFor(anchor: HTMLElement, popoverWidth?: number): boolean {
  return shouldAlignPopoverRight(
    anchor.getBoundingClientRect().left,
    window.innerWidth,
    popoverWidth,
  )
}
