// packages/core-ui/Button.tsx — Nút bấm chuẩn của toàn nền tảng.
//
// Lý do tồn tại + các quyết định về màu/cỡ nằm ở `buttonStyles.ts` (tách riêng vì quy tắc
// react-refresh: một file không nên vừa xuất component vừa xuất hàm tiện ích).
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClass, type ButtonStyleOptions } from './buttonStyles.js'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>, ButtonStyleOptions {
  children?: ReactNode
  /**
   * Đang xử lý: hiện vòng quay và tự khoá nút.
   *
   * Tự khoá là CỐ Ý, không phải tiện tay: nút gửi biểu mẫu mà chỉ đổi hình mà không khoá thì
   * bấm nhanh hai lần sẽ gửi hai lần — đúng loại lỗi idempotency mà CLAUDE.md mục 4.9 nhắc.
   */
  loading?: boolean
  /** Nhãn đọc cho trình đọc màn hình khi đang xử lý. */
  loadingLabel?: string
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  loadingLabel = 'Đang xử lý',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      // `type` mặc định là "button": mặc định của HTML là "submit", nên một nút phụ đặt trong
      // biểu mẫu mà quên khai type sẽ lặng lẽ gửi biểu mẫu khi bấm.
      type={type}
      className={buttonClass({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      // Báo cho trình đọc màn hình biết nút đang bận, vì thay đổi này chỉ thể hiện bằng hình.
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
      {children}
    </button>
  )
}
