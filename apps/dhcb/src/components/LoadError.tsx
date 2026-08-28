// apps/dhcb/src/components/LoadError.tsx — bảng báo lỗi khi TẢI dữ liệu thất bại.
//
// Vì sao có file này: 5 trang trụ cột đều nuốt lỗi tải bằng `.catch(() => [])`, nên
// mất mạng hay API 500 lại hiện ra đúng màn hình rỗng "Chưa có ... nào. Nhấn Thêm để
// bắt đầu!". Người dùng tưởng dữ liệu của mình biến mất và sẽ nhập lại — nguy hiểm
// nhất ở Work/Startup nơi dữ liệu là công việc thật.
//
// CLAUDE.md mục 4.3: mọi thao tác có thể fail đều phải có nhánh lỗi trên UI, tách bạch
// với trạng thái rỗng.
import { AlertTriangle, RefreshCw } from 'lucide-react'

export type LoadErrorProps = {
  /** Nội dung lỗi hiển thị cho người dùng. */
  message: string
  /** Tải lại. Bỏ trống nếu không có cách thử lại. */
  onRetry?: () => void
  retrying?: boolean
}

export default function LoadError({ message, onRetry, retrying }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-500/40 bg-red-950/30 theme-light:bg-red-50 p-5 text-center space-y-3"
    >
      <AlertTriangle className="w-8 h-8 mx-auto text-red-400 theme-light:text-red-800" />
      <div>
        <p className="text-sm font-semibold text-zinc-100">Không tải được dữ liệu</p>
        <p className="text-xs text-zinc-300 mt-1">{message}</p>
        <p className="text-xs text-zinc-400 mt-1">
          Dữ liệu của bạn vẫn còn nguyên — đây chỉ là lỗi kết nối.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 border border-zinc-700 text-sm font-semibold text-zinc-100 transition"
        >
          <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          Thử lại
        </button>
      )}
    </div>
  )
}
