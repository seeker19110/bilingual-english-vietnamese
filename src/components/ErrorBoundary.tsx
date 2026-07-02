import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Bắt lỗi runtime của bất kỳ component con nào để tránh app bị trắng trang.
// Chỉ bắt được lỗi trong lúc render/lifecycle — không bắt lỗi trong event handler
// hay code async (những chỗ đó vẫn cần try/catch riêng).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh bg-zinc-950 flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <p className="text-lg font-medium text-white">Đã có lỗi xảy ra</p>
            <p className="text-sm text-zinc-500">
              Ứng dụng gặp sự cố ngoài dự kiến. Bạn có thể thử tải lại trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 transition text-sm font-medium text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
