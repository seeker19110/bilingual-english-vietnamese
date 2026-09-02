// packages/core-ui/Card.tsx — Thẻ nội dung chuẩn.
//
// Lý do tồn tại + các quyết định về nền/viền/bo góc nằm ở `cardStyles.ts` (tách riêng vì quy
// tắc react-refresh: một file không nên vừa xuất component vừa xuất hàm tiện ích).
import type { HTMLAttributes, ReactNode } from 'react'
import { cardClass, type CardPadding, type CardVariant } from './cardStyles.js'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode
  variant?: CardVariant
  padding?: CardPadding
  className?: string
}

export function Card({ children, variant, padding, className, ...rest }: CardProps) {
  return (
    <div className={cardClass({ variant, padding, className })} {...rest}>
      {children}
    </div>
  )
}
