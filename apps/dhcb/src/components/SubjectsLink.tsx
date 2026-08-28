// SubjectsLink.tsx — Liên kết tới trụ Học tập, tự chọn <Link> hay <a> theo host.
//
// Vì sao cần component riêng thay vì `<Link to={...}>`: trên production, trụ Học tập nằm ở
// ORIGIN KHÁC (`hoc-tap.donghanhcungban.org`). React Router chỉ điều hướng trong cùng ứng dụng;
// đưa cho nó một URL tuyệt đối là rơi vào vùng hành vi không được dự án này kiểm chứng. Dùng
// thẻ `<a>` thật cho trường hợp đó — trình duyệt lo phần còn lại, và đó cũng là điều đúng về
// mặt ngữ nghĩa: đây là một lượt tải trang mới.

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { subjectsLinkTarget } from '../lib/subjectsHost'

export default function SubjectsLink({
  subjectId,
  children,
  className,
  ariaCurrent,
}: {
  subjectId?: string
  children: ReactNode
  className?: string
  ariaCurrent?: 'page' | undefined
}) {
  const target = subjectsLinkTarget(subjectId)
  if (target.kind === 'url') {
    return (
      <a href={target.value} aria-current={ariaCurrent} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={target.value} aria-current={ariaCurrent} className={className}>
      {children}
    </Link>
  )
}
