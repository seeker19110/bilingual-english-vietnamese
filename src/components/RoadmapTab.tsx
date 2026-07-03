// ──────────────────────────────────────────────────────────────────────
// BẢN ĐỒ LỘ TRÌNH — TỔNG QUAN 4 CẤP CEFR (A1 → B2)
//
// Là nội dung chính của trang /learning-path (Learn.tsx): mỗi cấp 1 thẻ
// (tiến độ từ vựng + ngữ pháp, trạng thái khóa, nhãn "Bạn đang ở đây") —
// bấm vào để mở TRANG RIÊNG của cấp (/learning-path/a1…b2).
// Các màn chi tiết (bài ngữ pháp, flashcard, hội thoại) ở
// src/components/CefrLessonViews.tsx + src/pages/CefrLevelPage.tsx;
// các tab học (Hôm nay/Ôn SRS/Từ khó/Kiểm tra) ở src/components/StudyTabs.tsx.
// ──────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, CheckCircle2, Layers, Lock, MapPin, Sparkles } from 'lucide-react'
import type { CefrLevel } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import { loadCefr } from '../data/cefrLoader'
import { loadFoundation } from '../data/curriculumLoader'
import { getLearnedWords } from '../lib/vocab'
import {
  getDoneGrammar,
  computeLockedMapPersisted,
  levelVocabCounts,
  levelGrammarCounts,
} from '../lib/cefrProgress'
import { ACCENT } from '../lib/cefrAccent'

// % an toàn (0 khi total = 0).
const pct = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0)

export default function RoadmapTab({ uid, isA }: { uid: string; isA: boolean }) {
  const nav = useNavigate()
  const [levels, setLevels] = useState<CefrLevel[]>([])
  const [circleById, setCircleById] = useState<Record<string, Circle>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([loadCefr(), loadFoundation()]).then(([lv, foundation]) => {
      setLevels(lv)
      setCircleById(Object.fromEntries(foundation.map((c) => [c.id, c])))
      setReady(true)
    })
  }, [])

  // `ready` là khóa invalidation thủ công (dữ liệu đọc từ localStorage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const learned = useMemo(() => getLearnedWords(uid), [uid, ready])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doneGrammar = useMemo(() => getDoneGrammar(uid), [uid, ready])
  const lockedMap = useMemo(
    () => computeLockedMapPersisted(uid, levels, circleById, learned),
    [uid, levels, circleById, learned],
  )

  if (!ready) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <p className="text-zinc-400 text-sm">{isA ? 'Đang tải lộ trình…' : 'Loading roadmap…'}</p>
      </div>
    )
  }

  // Cấp "đang học" = cấp đầu tiên KHÔNG khóa và chưa xong 100% (từ vựng + ngữ pháp).
  const currentId = levels.find((l) => {
    if (lockedMap.get(l.id)) return false
    const v = levelVocabCounts(l, circleById, learned)
    const g = levelGrammarCounts(l, doneGrammar)
    return v.done < v.total || g.done < g.total
  })?.id

  return (
    <div className="animate-fade-in space-y-3">
      {levels.map((level) => {
        const a = ACCENT[level.accent]
        const locked = lockedMap.get(level.id) ?? false
        const v = levelVocabCounts(level, circleById, learned)
        const g = levelGrammarCounts(level, doneGrammar)
        const grammarTotal = level.units.reduce((s, u) => s + u.grammar.length, 0)
        const started = v.done > 0 || g.done > 0
        const complete = v.done >= v.total && g.done >= g.total && v.total > 0
        const isCurrent = level.id === currentId
        const prev = levels[levels.indexOf(level) - 1]

        return (
          <div
            key={level.id}
            // KHÔNG dùng opacity để làm mờ thẻ khóa: opacity nhân vào cả chữ bên trong,
            // làm tương phản chữ (đã sát ngưỡng AA) tụt dưới 4.5:1 ở theme nền sáng
            // (Blue sky/Pink) — bắt được khi /learning-path hiện thẳng bản đồ lộ trình
            // (trước đây tab "Lộ trình" không phải mặc định nên chưa lộ). Trạng thái khóa
            // đã có Lock icon + dòng "Thuộc ≥70%..." bên dưới, không cần làm mờ cả thẻ.
            className={`glass rounded-2xl p-4 border ${isCurrent ? a.ring : 'border-transparent'}`}
          >
            <div className="flex items-start gap-3">
              {/* Badge cấp */}
              <div
                className={`w-11 h-11 rounded-xl ${a.soft} border ${a.ring} flex items-center justify-center shrink-0`}
              >
                <span className={`text-sm font-bold ${a.text}`}>{level.id}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-bold text-white text-base leading-tight">
                    {isA ? level.titleVi : level.titleEn}
                  </h3>
                  {isCurrent && (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.soft} ${a.text}`}
                    >
                      <MapPin className="w-3 h-3" />
                      {isA ? 'Bạn đang ở đây' : 'You are here'}
                    </span>
                  )}
                  {complete && (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.soft} ${a.text}`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {isA ? 'Hoàn thành' : 'Done'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">{level.subtitleVi}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {level.units.length}{' '}
                    {isA ? 'chủ đề' : 'units'}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {grammarTotal}{' '}
                    {isA ? 'bài ngữ pháp' : 'grammar'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {v.total} {isA ? 'từ' : 'words'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2 thanh tiến độ mini */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-zinc-400">{isA ? 'Từ vựng' : 'Vocab'}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.bar} transition-all`}
                    style={{ width: `${pct(v.done, v.total)}%` }}
                  />
                </div>
                <span className={`w-10 shrink-0 text-right font-semibold ${a.text}`}>
                  {pct(v.done, v.total)}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-zinc-400">{isA ? 'Ngữ pháp' : 'Grammar'}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.bar} transition-all`}
                    style={{ width: `${pct(g.done, g.total)}%` }}
                  />
                </div>
                <span className={`w-10 shrink-0 text-right font-semibold ${a.text}`}>
                  {pct(g.done, g.total)}%
                </span>
              </div>
            </div>

            {/* Mục tiêu can-do — luôn hiện sẵn, không cần bấm xổ xuống */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80">
              <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${a.text}`} />
                {isA ? 'Học xong, bạn có thể…' : "After this level, you'll be able to…"}
              </p>
              <ul className="space-y-1.5 mt-2.5">
                {level.canDo.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-snug">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${a.text}`} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vào trang cấp / trạng thái khóa */}
            {locked ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {isA
                  ? `Thuộc ≥70% từ vựng cấp ${prev?.id ?? ''} để mở khóa`
                  : `Learn ≥70% of ${prev?.id ?? 'previous'} vocabulary to unlock`}
              </p>
            ) : (
              <button
                onClick={() => nav(`/learning-path/${level.id.toLowerCase()}`)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
              >
                {complete
                  ? isA
                    ? 'Ôn lại'
                    : 'Review'
                  : started
                    ? isA
                      ? 'Tiếp tục học'
                      : 'Continue'
                    : isA
                      ? 'Bắt đầu học'
                      : 'Start'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
