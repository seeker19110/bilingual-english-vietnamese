// ProgrammingReview — ÔN THẺ môn Lập trình (PR-L10), bước ⑧ của khuôn bài học 8 bước.
//
// Vì sao môn này cần ôn: học viên đạt bài Make xong là hiểu ngay lúc đó, nhưng ba tuần sau
// vẫn quên "vì sao có vùng chờ", "input() trả kiểu gì". Thẻ SRS giữ lại đúng những khái niệm
// cốt lõi ấy, giãn dần theo FSRS của hệ SRS chung (lib/srs.ts) — không dựng hệ nhắc riêng.
//
// NHỊP CỦA MÀN ÔN (cố ý): hiện câu hỏi → học viên NGHĨ đã rồi mới bấm "Xem đáp án" → tự đánh
// giá 4 mức. Bắt nghĩ trước khi thấy đáp án chính là thứ tạo ra trí nhớ; hiện sẵn cả hai mặt
// thì học viên chỉ đọc lướt và tưởng mình nhớ.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Eye, CheckCircle2, Trophy, BookOpen } from 'lucide-react'
import { usePageTitle } from '../../../lib/usePageTitle'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { PageShell } from '@core/PageShell'
import { useAuth } from '../../../context/useAuth'
import {
  getDueProgCards,
  hydrateProgCards,
  reviewProgCard,
  countProgCards,
  type ProgSrsCard,
  type ProgSrsCardRef,
} from '../../../lib/programmingSrs'
import { SRS_SESSION_CAP, type Rating } from '../../../lib/srs'
import { buildSlugSegment } from '@core/slug'

/** 4 mức tự đánh giá — nhãn nói bằng lời người học, không dùng thuật ngữ FSRS. */
const MUC: { rating: Rating; nhan: string; mau: string }[] = [
  { rating: 'again', nhan: 'Quên rồi', mau: 'border-rose-500/40 hover:border-rose-400' },
  { rating: 'hard', nhan: 'Khó nhớ', mau: 'border-amber-500/40 hover:border-amber-400' },
  { rating: 'good', nhan: 'Nhớ được', mau: 'border-emerald-500/40 hover:border-emerald-400' },
  { rating: 'easy', nhan: 'Quá dễ', mau: 'border-sky-500/40 hover:border-sky-400' },
]

export default function ProgrammingReview() {
  usePageTitle('Ôn tập | Môn Lập trình · Đồng hành cùng bạn')
  const nav = useNavigate()
  const { user } = useAuth()
  const [viTri, setViTri] = useState(0)
  const [hienDap, setHienDap] = useState(false)
  const [daOn, setDaOn] = useState(0)

  const tongThe = useMemo(() => countProgCards(), [])

  // Chốt hàng đợi MỘT LẦN lúc vào phiên (useMemo theo user, KHÔNG theo state của phiên ôn):
  // chấm xong một thẻ là nó hết đến hạn, nếu tính lại sau mỗi lần chấm thì danh sách tụt dần
  // dưới chân người học và số đếm nhảy loạn. getDueProgCards đọc localStorage đồng bộ nên
  // không cần effect — dùng effect + setState ở đây còn gây render dây chuyền (lint chặn).
  const hangDoiRef = useMemo<ProgSrsCardRef[] | null>(
    () => (user ? getDueProgCards(user.id, SRS_SESSION_CAP) : null),
    [user],
  )

  // Nội dung thẻ (câu hỏi/đáp án) nằm trong bài học, nạp lười đúng các unit có thẻ đến hạn —
  // không kéo cả môn vào màn ôn. Ba trạng thái: chưa nạp (null) · lỗi mạng ('error') · xong.
  const [hangDoi, setHangDoi] = useState<ProgSrsCard[] | 'error' | null>(null)
  const [lanThu, setLanThu] = useState(0)
  useEffect(() => {
    if (!hangDoiRef) return
    let huy = false
    hydrateProgCards(hangDoiRef)
      .then((cards) => {
        if (!huy) setHangDoi(cards)
      })
      .catch(() => {
        if (!huy) setHangDoi('error')
      })
    return () => {
      huy = true
    }
  }, [hangDoiRef, lanThu])

  const the = hangDoi !== null && hangDoi !== 'error' ? hangDoi[viTri] : undefined

  const cham = (rating: Rating) => {
    if (!user || !the) return
    reviewProgCard(user.id, the.key, rating)
    setDaOn((n) => n + 1)
    setHienDap(false)
    setViTri((i) => i + 1)
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      {/* [2026-09-02, đợt 4 thiết kế lại desktop] Trước đây một cột `max-w-2xl` ở mọi bề rộng. */}
      <PageShell width="standard" baseWidth="max-w-2xl" className="space-y-5">
        <PageHeader
          title="Ôn thẻ Lập trình"
          subtitle={`Những khái niệm cốt lõi bạn đã học, quay lại đúng lúc sắp quên. Kho thẻ hiện có ${tongThe} thẻ — thẻ vào vòng ôn khi bạn đạt bài tương ứng.`}
        />

        {hangDoi === null && (
          <p
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300"
            role="status"
          >
            Đang tải thẻ của bạn…
          </p>
        )}

        {hangDoi === 'error' && (
          <div className="rounded-2xl border border-rose-500/40 bg-zinc-900/60 p-4 space-y-3">
            <p className="text-sm text-zinc-200" role="alert">
              Không tải được nội dung thẻ (mất mạng?). Thử lại nhé.
            </p>
            <button
              type="button"
              onClick={() => {
                setHangDoi(null)
                setLanThu((n) => n + 1)
              }}
              className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
            >
              Tải lại thẻ
            </button>
          </div>
        )}

        {hangDoi !== null && hangDoi !== 'error' && hangDoi.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 theme-light:text-emerald-900" />
              <span>Hôm nay không có thẻ nào tới hạn</span>
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Nghỉ ngơi là một phần của việc nhớ lâu — ôn dồn không giúp bạn nhớ hơn. Học thêm một
              bài mới đi, thẻ của bài đó sẽ tự vào vòng ôn khi bạn đạt phần tự viết.
            </p>
            <button
              onClick={() => nav('/lap-trinh')}
              className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Về trang môn học</span>
            </button>
          </div>
        )}

        {hangDoi !== null && hangDoi !== 'error' && hangDoi.length > 0 && !the && (
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex items-start gap-3">
            <Trophy className="w-6 h-6 text-emerald-400 theme-light:text-emerald-900 shrink-0" />
            <div>
              <p className="font-bold text-white">Xong phiên ôn — {daOn} thẻ! 🎉</p>
              <p className="mt-1 text-sm text-zinc-100 leading-relaxed">
                Thẻ bạn nhớ được sẽ giãn ra xa hơn, thẻ còn lấn cấn quay lại sớm. Cứ đều đặn vậy
                thôi, không cần học thuộc.
              </p>
            </div>
          </div>
        )}

        {the && (
          <section className="space-y-4">
            <p className="text-xs text-zinc-400" aria-live="polite">
              Thẻ {viTri + 1}/{hangDoi !== null && hangDoi !== 'error' ? hangDoi.length : 0} · từ
              bài “{the.lessonTitle}”
            </p>

            <div className="rounded-3xl border border-accent-500/30 bg-zinc-900/80 p-6">
              <p className="text-base font-semibold text-white leading-relaxed whitespace-pre-line">
                {the.hoi}
              </p>
              {hienDap && (
                <p className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                  {the.dap}
                </p>
              )}
            </div>

            {!hienDap ? (
              <button
                onClick={() => setHienDap(true)}
                className="tap-44 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
              >
                <Eye className="w-4 h-4" />
                <span>Xem đáp án</span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Bạn nhớ tới đâu?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MUC.map((m) => (
                    <button
                      key={m.rating}
                      onClick={() => cham(m.rating)}
                      className={`tap-44 px-3 py-2.5 rounded-2xl bg-zinc-900 border text-zinc-100 font-semibold text-sm transition ${m.mau}`}
                    >
                      {m.nhan}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() =>
                nav(`/lap-trinh/bai-hoc/${buildSlugSegment(the.lessonId, the.lessonTitle)}`)
              }
              className="tap-44 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-sm transition"
            >
              <Brain className="w-4 h-4" />
              <span>Mở lại bài này</span>
            </button>
          </section>
        )}
      </PageShell>
    </div>
  )
}
