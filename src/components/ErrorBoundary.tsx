// ErrorBoundary — bắt mọi lỗi render trong cây con và hiện màn hình thân thiện
// (kèm nút thử lại) thay vì để app trắng xoá. Đặc biệt quan trọng vì app lazy-load
// rất nhiều chunk: chỉ cần 1 chunk lỗi mạng là cả trang có thể sập nếu không bắt.
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  // React gọi hàm này khi có lỗi ném ra trong lúc render con → bật cờ để hiện UI dự phòng.
  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Ghi log ra console để debug; không gửi đi đâu (giữ riêng tư + miễn phí).
    console.error('[ErrorBoundary] Lỗi render:', error)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">😵</div>
          <h1 className="text-lg font-semibold text-zinc-100">Đã có lỗi xảy ra</h1>
          <p className="text-sm text-zinc-400">
            Trang gặp sự cố khi tải. Hãy thử tải lại — thường là do mất mạng tạm thời hoặc app vừa
            được cập nhật.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-400 transition"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }
}
