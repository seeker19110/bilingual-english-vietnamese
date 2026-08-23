import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Check, Trash2, RotateCcw, Sparkles, ArrowRight, BookMarked } from 'lucide-react'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import KaraokeText from '../../components/KaraokeText'
import { useAuth } from '../../context/useAuth'
import { getDirection } from '../../lib/storage'
import {
  getMistakes,
  getDueMistakes,
  markReviewed,
  deleteMistake,
  type Mistake,
  type MistakeSource,
} from '../../lib/mistakes'

// Nhãn + emoji cho từng nguồn lỗi (Chat / Viết / Nói).
const SOURCE_META: Record<MistakeSource, { emoji: string; vi: string; en: string }> = {
  chat: { emoji: '💬', vi: 'Trò chuyện', en: 'Chat' },
  writing: { emoji: '✍️', vi: 'Luyện viết', en: 'Writing' },
  speaking: { emoji: '🎤', vi: 'Luyện nói', en: 'Speaking' },
}

function SourceBadge({ source, vi }: { source: MistakeSource; vi: boolean }) {
  const m = SOURCE_META[source]
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/70 border border-zinc-700/50 rounded-full px-2 py-0.5">
      <span aria-hidden>{m.emoji}</span>
      {vi ? m.vi : m.en}
    </span>
  )
}

// ── Thẻ ôn 1 lỗi (câu sai → tự sửa → lật xem đáp án) ──────────────────────────
function ReviewCard({
  mistake,
  isA,
  onRemembered,
  onSkip,
  onDelete,
}: {
  mistake: Mistake
  isA: boolean
  onRemembered: () => void
  onSkip: () => void
  onDelete: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  // Chiều A: câu sai/đúng là tiếng Anh, giải thích tiếng Việt · Chiều B: ngược lại.
  const targetLang = isA ? ('en-US' as const) : ('vi-VN' as const)
  const explLang = isA ? ('vi-VN' as const) : ('en-US' as const)

  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <SourceBadge source={mistake.source} vi={isA} />
        <div className="flex items-center gap-2">
          {mistake.count > 1 && (
            <span className="text-[11px] text-amber-400 theme-light:text-amber-800 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
              {isA ? `Lặp ${mistake.count} lần` : `${mistake.count}× repeated`}
            </span>
          )}
          <button
            onClick={onDelete}
            className="tap-44 text-zinc-500 hover:text-red-400 transition p-1"
            aria-label={isA ? 'Xóa lỗi này' : 'Delete this mistake'}
            title={isA ? 'Xóa lỗi này' : 'Delete this mistake'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Câu sai */}
      <p className="text-[11px] text-zinc-500 mb-1">{isA ? 'Câu bạn đã viết' : 'What you wrote'}</p>
      <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5 mb-3">
        <KaraokeText
          text={mistake.wrong}
          lang={targetLang}
          textClass="text-sm leading-relaxed text-red-300 theme-light:text-red-700"
        />
      </div>

      {!revealed ? (
        <>
          <p className="text-xs text-zinc-500 text-center mb-3">
            {isA ? 'Bạn thử tự sửa trong đầu, rồi xem đáp án nhé.' : 'Try to fix it, then reveal.'}
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-teal-400 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98]"
          >
            <Eye className="w-4 h-4" />
            {isA ? 'Xem đáp án' : 'Reveal answer'}
          </button>
        </>
      ) : (
        <div className="animate-fade-in space-y-3">
          {mistake.corrected && (
            <div>
              <p className="text-[11px] text-zinc-500 mb-1">{isA ? 'Câu đúng' : 'Corrected'}</p>
              <div className="bg-accent-500/8 border border-accent-500/25 rounded-xl px-3 py-2.5">
                <KaraokeText
                  text={mistake.corrected}
                  lang={targetLang}
                  textClass="text-sm leading-relaxed text-accent-300 theme-light:text-accent-800"
                />
              </div>
            </div>
          )}
          {mistake.explanation && (
            <div>
              <p className="text-[11px] text-zinc-500 mb-1">{isA ? 'Giải thích' : 'Explanation'}</p>
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <KaraokeText
                  text={mistake.explanation}
                  lang={explLang}
                  textClass="text-xs leading-relaxed text-amber-200 theme-light:text-amber-800"
                  iconSize="xs"
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSkip}
              className="tap-44 flex-1 flex items-center justify-center gap-1.5 border border-zinc-700/70 hover:border-zinc-600 text-zinc-300 rounded-xl py-2.5 text-sm transition hover:bg-zinc-800/50 active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              {isA ? 'Vẫn khó' : 'Still hard'}
            </button>
            <button
              onClick={onRemembered}
              className="tap-44 flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-teal-400 text-white font-semibold rounded-xl py-2.5 text-sm transition active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              {isA ? 'Đã nhớ' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Một dòng trong danh sách "Tất cả" (gọn, có nút xóa) ───────────────────────
function ListRow({
  mistake,
  isA,
  onDelete,
}: {
  mistake: Mistake
  isA: boolean
  onDelete: () => void
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <SourceBadge source={mistake.source} vi={isA} />
        <button
          onClick={onDelete}
          className="tap-44 text-zinc-500 hover:text-red-400 transition p-1"
          aria-label={isA ? 'Xóa' : 'Delete'}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-red-300 theme-light:text-red-700 line-through break-words">
        {mistake.wrong}
      </p>
      {mistake.corrected && (
        <p className="text-xs text-accent-300 theme-light:text-accent-800 break-words mt-0.5">
          → {mistake.corrected}
        </p>
      )}
      {mistake.explanation && (
        <p className="text-[11px] text-zinc-400 break-words mt-1">{mistake.explanation}</p>
      )}
    </div>
  )
}

export default function MistakeBank() {
  const user = useAuth().user! // RequireAuth đảm bảo có user
  const nav = useNavigate()
  const dir = getDirection()
  const isA = dir === 'A'

  const [tab, setTab] = useState<'review' | 'all'>('review')
  // "Bộ ôn" chốt 1 lần khi vào để thứ tự không nhảy khi ta markReviewed từng thẻ.
  const [deck, setDeck] = useState<Mistake[]>(() => getDueMistakes(user.id))
  const [pos, setPos] = useState(0)
  // Toàn bộ lỗi (tab "Tất cả") giữ ở state, cập nhật lại sau mỗi lần xóa.
  const [all, setAll] = useState<Mistake[]>(() => getMistakes(user.id))

  const totalDue = deck.length
  const current = deck[pos]

  const advance = useCallback(() => setPos((p) => p + 1), [])

  const handleRemembered = useCallback(() => {
    if (current) markReviewed(user.id, current.id)
    advance()
  }, [current, user.id, advance])

  const handleDeleteInDeck = useCallback(() => {
    if (current) deleteMistake(user.id, current.id)
    setAll(getMistakes(user.id))
    advance()
  }, [current, user.id, advance])

  const handleDeleteInList = useCallback(
    (id: string) => {
      deleteMistake(user.id, id)
      setDeck((d) => d.filter((m) => m.id !== id))
      setAll((a) => a.filter((m) => m.id !== id))
    },
    [user.id],
  )

  const restartDeck = useCallback(() => {
    setDeck(getDueMistakes(user.id))
    setPos(0)
  }, [user.id])

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-5">
        <PageHeader
          title={isA ? 'Sổ lỗi của tôi' : 'My Mistake Bank'}
          subtitle={
            isA
              ? 'Ôn lại chính những lỗi AI đã sửa cho bạn — nhớ lâu hơn'
              : 'Review the very mistakes the AI corrected for you'
          }
        />

        {all.length === 0 ? (
          // ── Chưa có lỗi nào ──────────────────────────────────────────────
          <div className="glass rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
              <BookMarked className="w-7 h-7 text-accent-400" />
            </div>
            <p className="text-sm text-zinc-300 mb-1 font-medium">
              {isA ? 'Chưa có lỗi nào được ghi' : 'No mistakes recorded yet'}
            </p>
            <p className="text-xs text-zinc-500 mb-5 max-w-xs mx-auto">
              {isA
                ? 'Khi bạn luyện Chat, Viết hoặc Nói và AI sửa lỗi, lỗi đó sẽ tự động vào đây để ôn lại.'
                : 'When you practise Chat, Writing or Speaking and the AI corrects you, the mistake lands here to review.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => nav('/tro-truyen')}
                className="tap-44 text-sm bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium px-4 py-2.5 rounded-xl transition active:scale-[0.98]"
              >
                {isA ? 'Luyện Chat →' : 'Practise Chat →'}
              </button>
              <button
                onClick={() => nav('/luyen-viet')}
                className="tap-44 text-sm border border-zinc-700/70 text-zinc-300 px-4 py-2.5 rounded-xl transition hover:bg-zinc-800/50"
              >
                {isA ? 'Luyện Viết' : 'Writing'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs: Cần ôn / Tất cả */}
            <div className="flex gap-2">
              <button
                onClick={() => setTab('review')}
                className={`tap-44 flex-1 py-2 rounded-xl text-sm font-medium border transition ${
                  tab === 'review'
                    ? 'bg-accent-500/15 border-accent-500/40 text-accent-300 theme-light:text-accent-800'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {isA ? 'Cần ôn' : 'To review'} ({totalDue})
              </button>
              <button
                onClick={() => setTab('all')}
                className={`tap-44 flex-1 py-2 rounded-xl text-sm font-medium border transition ${
                  tab === 'all'
                    ? 'bg-accent-500/15 border-accent-500/40 text-accent-300 theme-light:text-accent-800'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {isA ? 'Tất cả' : 'All'} ({all.length})
              </button>
            </div>

            {tab === 'review' ? (
              current ? (
                <>
                  <p className="text-center text-xs text-zinc-500">
                    {pos + 1} / {totalDue}
                  </p>
                  <ReviewCard
                    key={current.id}
                    mistake={current}
                    isA={isA}
                    onRemembered={handleRemembered}
                    onSkip={advance}
                    onDelete={handleDeleteInDeck}
                  />
                </>
              ) : (
                // Hết bộ ôn
                <div className="glass rounded-2xl p-8 text-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-accent-400" />
                  </div>
                  <p className="text-sm text-zinc-200 font-medium mb-1">
                    {totalDue > 0
                      ? isA
                        ? 'Xong rồi! Bạn đã ôn hết lỗi hôm nay 🎉'
                        : 'Done! You reviewed all due mistakes 🎉'
                      : isA
                        ? 'Không có lỗi nào cần ôn hôm nay'
                        : 'No mistakes due today'}
                  </p>
                  <p className="text-xs text-zinc-500 mb-5">
                    {isA
                      ? 'Lỗi đã ôn sẽ quay lại sau vài ngày để nhớ lâu hơn.'
                      : 'Reviewed mistakes come back in a few days to strengthen memory.'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {totalDue > 0 && (
                      <button
                        onClick={restartDeck}
                        className="text-sm border border-zinc-700/70 text-zinc-300 px-4 py-2.5 rounded-xl transition hover:bg-zinc-800/50 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {isA ? 'Ôn lại' : 'Review again'}
                      </button>
                    )}
                    <button
                      onClick={() => nav('/tien-do')}
                      className="text-sm bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium px-4 py-2.5 rounded-xl transition active:scale-[0.98] flex items-center gap-1.5"
                    >
                      {isA ? 'Xem tiến độ' : 'View progress'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Tab "Tất cả" — danh sách gọn, có nút xóa
              <div className="space-y-2 animate-fade-in">
                {all.map((m) => (
                  <ListRow
                    key={m.id}
                    mistake={m}
                    isA={isA}
                    onDelete={() => handleDeleteInList(m.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
