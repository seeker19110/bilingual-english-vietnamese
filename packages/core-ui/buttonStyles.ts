// packages/core-ui/Button.tsx — Nút bấm chuẩn của toàn nền tảng.
//
// VÌ SAO CẦN (đo 2026-09-02 trên apps/dhcb/src): app có 915 thẻ `<button>` và KHÔNG có một
// component nút dùng chung nào — mỗi trang tự ghép class Tailwind. Hậu quả đo được:
//   • Riêng "nút chính" (nền `bg-accent-500`) được viết ~50 biến thể khác nhau: bo góc
//     `rounded-xl` lẫn `rounded-2xl`, đệm dọc `py-2.5` / `py-3` / `py-3.5`, mờ khi vô hiệu
//     `disabled:opacity-40` / `50` / `60`.
//   • Màu chữ trên cùng một nền accent có tới BỐN giá trị: `text-black` (88), `text-white`
//     (25), `text-[#09090b]` (18), `text-[#fff]` (2).
//
// Cái thứ hai không chỉ là lệch thẩm mỹ mà là LỖI TƯƠNG PHẢN THẬT. `text-white` map sang biến
// `--c-white`, biến này bị đảo thành màu tối ở 3 theme nền sáng — nên ở theme nền sáng nó
// tình cờ đúng, còn ở theme NỀN TỐI (Xanh đêm mặc định, Rực rỡ) nó là chữ trắng thật trên nền
// accent, tương phản ~2,3–3,4:1, dưới sàn AA 4,5:1 mà mục 4.5 của CLAUDE.md quy định là sàn
// cứng. 17 file đang dính lỗi này. Cổng `e2e/a11y.spec.ts` không bắt được vì các nút đó nằm
// sau đăng nhập (bảng quản trị, cổng tính năng), ngoài 15 trang được quét.
//
// Vì vậy component này KHÔNG nhận tham số màu chữ. Màu chữ là hệ quả của biến thể, do đây
// quyết định một lần cho cả 5 theme — chỗ duy nhất còn phải sửa nếu bảng màu đổi về sau.

/**
 * Vai trò của nút trong trang, KHÔNG phải màu sắc của nó.
 *
 * Đặt tên theo vai trò để lời gọi tự nói lên ý định ("nút này là hành động chính của màn
 * hình") thay vì mô tả hình thức ("nút này màu xanh"). Đổi bảng màu về sau thì lời gọi không
 * phải sửa theo.
 *
 * - `primary`   — hành động chính, MỖI MÀN HÌNH CHỈ NÊN CÓ MỘT. Nhiều nút primary cùng lúc thì
 *   không còn nút nào nổi bật, mắt người dùng mất điểm neo.
 * - `secondary` — hành động phụ quan trọng, vẫn mang màu thương hiệu nhưng nền nhạt.
 * - `ghost`     — hành động phụ trợ/huỷ bỏ, chỉ hiện nền khi rê chuột.
 * - `danger`    — thao tác phá huỷ (xoá, huỷ gói). Cố ý dùng màu hồng-đỏ cố định, không theo
 *   accent: cảnh báo phải trông GIỐNG NHAU ở cả 5 theme, không hoà vào màu thương hiệu.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/**
 * Cỡ nút. `md` là mặc định và là cỡ nên dùng cho gần như mọi chỗ.
 *
 * Chiều cao chọn theo luật vùng chạm ≥ 44px (CLAUDE.md mục 4.7): `md` = h-11 = 44px chẵn,
 * `lg` = 48px. `sm` = 36px nên KHÔNG đạt 44px — chỉ dùng cho thanh công cụ dày đặc trên
 * desktop, nơi con trỏ chuột chính xác hơn ngón tay; đừng dùng cho luồng chính trên mobile.
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** Nền + chữ + trạng thái rê chuột, theo từng vai trò. */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // Chữ tối cố định (#09090b) trên nền accent: đo trên cả 5 theme đều ≥ 5,8:1 nên đạt AA ở
  // theme yếu nhất (Pink), và không bao giờ bị `--c-white` đảo màu. Đây chính là chỗ vá lỗi
  // tương phản nói ở đầu file.
  primary:
    'bg-accent-500 text-[#09090b] hover:bg-accent-400 active:bg-accent-600 shadow-sm shadow-accent-500/20',
  // Chữ accent trên nền accent rất nhạt. Cần hai sắc độ vì thang accent không đảo theo theme:
  // ở theme nền tối phải lấy sắc SÁNG (300), ở theme nền sáng phải lấy sắc TỐI (800).
  secondary:
    'bg-accent-500/15 text-accent-300 theme-light:text-accent-800 hover:bg-accent-500/25 active:bg-accent-500/30',
  // Dùng token NGỮ NGHĨA (`content`, `surface-raised`) thay vì bậc màu `zinc-*`: hai token này
  // đã được đo đạt ngưỡng WCAG trên cả 5 theme (scripts/contrast-audit.ts), nên không phải
  // đoán xem bậc nào đủ tương phản ở theme nào.
  ghost: 'bg-transparent text-content hover:bg-surface-raised active:bg-surface-raised/70',
  // Hồng-đỏ cố định + chữ trắng cố định `#fff`: nền này luôn tối ở mọi theme nên chữ trắng
  // luôn đúng, nhưng phải viết `text-[#fff]` chứ KHÔNG phải `text-white` — `text-white` map
  // sang `--c-white` và sẽ bị đảo thành chữ tối ở 3 theme nền sáng (CLAUDE.md mục 4.5).
  danger:
    'bg-rose-600 text-[#fff] hover:bg-rose-500 active:bg-rose-700 shadow-sm shadow-rose-600/20',
}

/** Chiều cao + đệm ngang + cỡ chữ. */
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}

/**
 * Phần dùng chung cho mọi nút.
 *
 * `focus-visible` (không phải `focus`) để viền lấy nét chỉ hiện khi đi bằng bàn phím — bấm
 * chuột không làm loé viền, nhưng người dùng bàn phím vẫn luôn thấy mình đang ở đâu (WCAG
 * 2.4.7). Viền lấy nét KHÔNG được bỏ đi ở bất kỳ biến thể nào.
 *
 * `disabled:pointer-events-none` đi kèm `disabled:opacity-50`: chỉ làm mờ thôi thì nút vẫn
 * bắt được rê chuột và vẫn đổi màu, khiến người dùng tưởng bấm được.
 */
const BASE_CLASS =
  'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Giãn hết bề ngang thẻ cha. Dùng cho biểu mẫu và thẻ hẹp trên mobile. */
  fullWidth?: boolean
  /** Class thêm — dùng cho bố cục (`mt-4`, `sm:w-auto`), KHÔNG dùng để đè màu/bo góc. */
  className?: string
}

/**
 * Sinh chuỗi class của nút mà không dựng component.
 *
 * VÌ SAO TÁCH RA: rất nhiều "nút" trong app thật ra là `<Link>` của react-router hoặc thẻ
 * `<a>`. `packages/` không được phụ thuộc router của app, nên thay vì dựng một component đa
 * hình phức tạp, ta xuất luôn phần tạo class: `<Link className={buttonClass({ variant:
 * 'primary' })}>`. Nhờ vậy nút-điều-hướng và nút-hành-động dùng CHUNG một nguồn sự thật về
 * hình thức, mà vẫn giữ đúng ngữ nghĩa HTML (điều hướng là `<a>`, hành động là `<button>`).
 */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ButtonStyleOptions = {}): string {
  return [
    BASE_CLASS,
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
