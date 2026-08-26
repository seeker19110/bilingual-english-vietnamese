// RunOutput — kết quả một lần chạy code (PR-UX5, luật N4 của đặc tả UI/UX §2).
//
// Luật N4: mọi lần chạy phải kết thúc ở ĐÚNG MỘT trong ba trạng thái, không bao giờ im lặng:
//   idle    — chưa chạy lần nào (không hiện gì, đúng)
//   running — đang chạy
//   done    — xong, KỂ CẢ khi chương trình không in ra gì
//
// Trạng thái thứ tư "chạy xong mà màn hình trống trơn" bị cấm, và nó từng có thật ở đây: khối
// output cũ viết `{output && <pre>…}` nên một chương trình chạy đúng nhưng không in gì sẽ
// không hiện gì cả — học viên không phân biệt được "chưa chạy" với "chạy rồi, không in".
//
// Đây vừa là luật giao diện vừa là luật sư phạm: lỗi im lặng chính là thứ môn này dạy phải sợ,
// nên chính công cụ dạy nó không được im lặng.
import { Loader2, Terminal } from 'lucide-react'
import CodeSurface from './CodeSurface'

export type RunState = 'idle' | 'running' | 'done'

interface Props {
  state: RunState
  output: string
}

export default function RunOutput({ state, output }: Props) {
  if (state === 'idle') return null

  if (state === 'running') {
    return (
      <p
        className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300"
        aria-live="polite"
      >
        <Loader2 className="w-4 h-4 animate-spin text-accent-400" aria-hidden="true" />
        <span>Đang chạy…</span>
      </p>
    )
  }

  return (
    <div aria-live="polite" className="space-y-1.5">
      {output.trim() ? (
        <CodeSurface code={output} wrap />
      ) : (
        <p className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          <Terminal className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
          <span>
            Chạy xong — <strong>chương trình không in ra gì</strong>. Không phải lỗi: chỉ là code
            này không có lệnh in nào chạy tới.
          </span>
        </p>
      )}
    </div>
  )
}
