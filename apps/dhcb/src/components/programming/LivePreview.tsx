// LivePreview — khung xem TRANG WEB mà học viên đang viết, ở bước ⑥ (PR-UX2 tách ra).
//
// Hai chế độ, khác nhau ở chỗ nguy hiểm nhất — thời điểm chạy script:
//  • bài `html`: xem TRỰC TIẾP theo từng phím gõ. Không có script, nên trang dở dang cùng lắm
//    là xấu; thấy ngay kết quả là thứ khiến người mới bám trụ được với web.
//  • bài `dom`/`fetch`: KHÔNG xem trực tiếp. Script gõ nửa chừng (một vòng lặp vô hạn đang
//    viết dở) sẽ chạy ngay trong khung. Học viên bấm nút thì mới chụp lại code hiện tại.
import { useState } from 'react'
import { HtmlPreview } from '../HtmlPreview'
import { FETCH_SHIM_JS } from '@dhcb/subject-programming/fetchGia'
import type { ProgrammingLesson } from '@dhcb/subject-programming/lessonTypes'

interface Props {
  language: ProgrammingLesson['language']
  /** Trang có sẵn của bài dom/fetch — học viên không sửa trang này. */
  domHtml: string | undefined
  /** Code học viên đang viết. */
  code: string
}

export default function LivePreview({ language, domHtml, code }: Props) {
  // null = chưa bấm xem lần nào.
  const [script, setScript] = useState<string | null>(null)

  if (language === 'html') return <HtmlPreview html={code} />
  if ((language !== 'dom' && language !== 'fetch') || !domHtml) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() =>
          // Bài fetch: nhét fetch giả (cùng nguồn với bộ chấm) vào TRƯỚC code — iframe không
          // có mạng thật nên fetch thật kiểu gì cũng thất bại.
          setScript(language === 'fetch' ? FETCH_SHIM_JS + code : code)
        }
        className="tap-44 inline-flex items-center px-4 py-2 rounded-2xl border border-zinc-700 hover:border-zinc-500 text-sm text-zinc-200 transition"
      >
        Xem trang chạy
      </button>
      {script !== null && <HtmlPreview html={domHtml} script={script} />}
    </div>
  )
}
