import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

// ── Hệ thống thông báo nổi (toast) dùng chung cho toàn app ───────────────────
// Thay cho việc mỗi trang tự render khối lỗi riêng. Gọi: const toast = useToast();
// rồi toast.error('...'), toast.success('...'), toast.info('...').

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: string
  kind: ToastKind
  message: string
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

// Cấu hình màu + icon theo loại toast
// Sắc độ -300 đọc tốt trên nền TỐI nhưng rớt AA hẳn trên nền SÁNG (đo được 1,38–1,52 so với
// sàn 4,5 ở Blue sky / Pink / Nhi đồng), nên các theme nền sáng đổi sang -800 (6,09–6,64) qua
// biến thể `theme-light:`. Không đổi chung một sắc độ cho cả hai được: -800 trên nền tối chỉ
// đạt ~2,0.
const STYLES: Record<ToastKind, { cls: string; Icon: typeof Info }> = {
  success: {
    cls: 'bg-accent-500/15 border-accent-500/30 text-accent-300 theme-light:text-accent-800',
    Icon: CheckCircle2,
  },
  error: {
    cls: 'bg-red-500/15 border-red-500/30 text-red-300 theme-light:text-red-800',
    Icon: AlertCircle,
  },
  info: {
    cls: 'bg-sky-500/15 border-sky-500/30 text-sky-300 theme-light:text-sky-800',
    Icon: Info,
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = crypto.randomUUID()
      setToasts((list) => [...list, { id, kind, message }])
      // Tự ẩn sau 4 giây
      setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  const success = useCallback((m: string) => show(m, 'success'), [show])
  const error = useCallback((m: string) => show(m, 'error'), [show])
  const info = useCallback((m: string) => show(m, 'info'), [show])

  // PHẢI memo hoá: đây là GIÁ TRỊ CONTEXT, mà nhiều trang đặt `toast` vào mảng phụ thuộc của
  // useEffect (LiveLocation, Profile, WorkKanban, Life, LifeGraph, ActionCanvas…). Trước đây
  // `api` là object literal tạo mới MỖI LẦN render, nên cứ hiện một toast là ToastProvider
  // render lại → `api` đổi tham chiếu → các effect kia chạy lại. Với LiveLocation điều đó thành
  // vòng lặp vô hạn: lỗi GPS → toast → effect chạy lại → gọi lại watchPosition → lỗi GPS →
  // toast… (đo được 89 toast trong 3 giây khi trình duyệt từ chối quyền vị trí).
  const api = useMemo<ToastApi>(
    () => ({ show, success, error, info }),
    [show, success, error, info],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Khu vực hiển thị toast — cố định trên cùng, an toàn cho notch */}
      <div className="fixed top-0 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pt-3 pt-safe pointer-events-none">
        {toasts.map(({ id, kind, message }) => {
          const { cls, Icon } = STYLES[kind]
          return (
            <div
              key={id}
              className={`pointer-events-auto w-full max-w-sm flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md animate-fade-in ${cls}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{message}</span>
              {/* aria-label là BẮT BUỘC: nút chỉ có mỗi icon nên không có tên đọc được —
                  thiếu nó là vi phạm WCAG "button-name" mức critical. */}
              <button
                onClick={() => remove(id)}
                aria-label="Đóng thông báo"
                className="shrink-0 opacity-60 hover:opacity-100 transition"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast phải dùng bên trong <ToastProvider>')
  return ctx
}
