import { useState, useEffect, useCallback } from 'react'
import { ThumbsDown, MessageSquare, Mic, RefreshCw, AlertCircle } from 'lucide-react'
import type { FeedbackRow } from '../../../../../api/admin-feedback'

export default function AdminFeedbackPanel() {
  const [items, setItems] = useState<FeedbackRow[]>([])
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (sourceFilter !== 'all') params.set('source', sourceFilter)

      const res = await fetch(`/api/admin-feedback?${params.toString()}`)
      if (res.status === 403) {
        setError('Chỉ admin mới truy cập được')
        return
      }
      if (!res.ok) throw new Error('Không thể tải danh sách phản hồi')
      const data = await res.json()
      setItems(data.feedbackList || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [sourceFilter])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  return (
    <div className="space-y-4 text-sm">
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Phản Hồi 👎 Chất Lượng Gia Sư AI</h3>
              <p className="text-xs text-zinc-400">
                Danh sách các câu hội thoại bị người dùng đánh giá 👎 (Chat & Speaking) để bổ sung
                dữ liệu huấn luyện.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="chat">Chat AI</option>
              <option value="speaking">Luyện nói (Speaking)</option>
            </select>

            <button
              type="button"
              onClick={fetchFeedback}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="text-xs text-zinc-500 py-8 text-center">
              Đang tải danh sách phản hồi...
            </div>
          ) : items.length === 0 ? (
            <div className="text-xs text-zinc-500 py-8 text-center">Chưa có phản hồi 👎 nào</div>
          ) : (
            items.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {fb.source === 'chat' ? (
                      <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                        <MessageSquare className="w-3 h-3" /> Chat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                        <Mic className="w-3 h-3" /> Speaking
                      </span>
                    )}
                    <span className="text-white font-medium">{fb.userEmail || fb.userId}</span>
                  </div>

                  <span className="text-zinc-500 text-[11px]">
                    {new Date(fb.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-zinc-950 rounded border border-zinc-800/50">
                    <span className="text-zinc-500 font-semibold block text-[11px]">
                      Người dùng nhập:
                    </span>
                    <span className="text-zinc-200">{fb.userInput}</span>
                  </div>
                  <div className="p-2 bg-rose-500/5 rounded border border-rose-500/20">
                    <span className="text-rose-400 font-semibold block text-[11px]">
                      AI phản hồi (bị chê):
                    </span>
                    <span className="text-rose-200">{fb.aiFeedback}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
