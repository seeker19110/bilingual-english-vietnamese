import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

// ── Hệ thống thông báo nổi (toast) dùng chung cho toàn app ───────────────────
// Thay cho việc mỗi trang tự render khối lỗi riêng. Gọi: const toast = useToast();
// rồi toast.error('...'), toast.success('...'), toast.info('...').

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: string; kind: ToastKind; message: string }

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

// Cấu hình màu + icon theo loại toast
const STYLES: Record<ToastKind, { cls: string; Icon: typeof Info }> = {
  success: { cls: 'bg-accent-500/15 border-accent-500/30 text-accent-300', Icon: CheckCircle2 },
  error:   { cls: 'bg-red-500/15 border-red-500/30 text-red-300',             Icon: AlertCircle },
  info:    { cls: 'bg-sky-500/15 border-sky-500/30 text-sky-300',             Icon: Info },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(list => list.filter(t => t.id !== id))
  }, [])

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = crypto.randomUUID()
    setToasts(list => [...list, { id, kind, message }])
    // Tự ẩn sau 4 giây
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const api: ToastApi = {
    show,
    success: useCallback((m: string) => show(m, 'success'), [show]),
    error:   useCallback((m: string) => show(m, 'error'), [show]),
    info:    useCallback((m: string) => show(m, 'info'), [show]),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Khu vực hiển thị toast — cố định trên cùng, an toàn cho notch */}
      <div className="fixed top-0 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pt-3 pt-safe pointer-events-none">
        {toasts.map(({ id, kind, message }) => {
          const { cls, Icon } = STYLES[kind]
          return (
            <div key={id}
              className={`pointer-events-auto w-full max-w-sm flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md animate-fade-in ${cls}`}>
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{message}</span>
              <button onClick={() => remove(id)} className="shrink-0 opacity-60 hover:opacity-100 transition">
                <X className="w-3.5 h-3.5" />
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
