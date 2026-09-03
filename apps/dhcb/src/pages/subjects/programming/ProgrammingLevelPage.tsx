// ProgrammingLevelPage — trang một bậc P1–P6 của môn Lập trình: đề cương unit theo nhịp
// làn LUYỆN (kiến thức) + làn DỰ ÁN (bước xây tiếp dự án trục). PR-L3: unit ĐÃ CÓ bài học
// (khuôn 8 bước) hiện nút "Học bài" + trạng thái hoàn thành từ server; unit chưa soạn
// vẫn là "Sắp mở" (nội dung hàng loạt vào PR-L4).
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { BookOpen, Hammer, Trophy, Lock, CheckCircle2, Play } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import LangBadge from '../../../components/programming/LangBadge'
import { useAuth } from '../../../context/useAuth'
import {
  fetchProgress,
  isLessonCompleted,
  type ProgrammingLessonProgress,
} from '../../../lib/programmingProgress'
import { getProgrammingLevel, nhomUnitTheoTrack } from '@dhcb/subject-programming/curriculum'
import { getUnitSummaries } from '@dhcb/subject-programming/lessonsLoader'
import { buildSlugSegment, idFromSlugSegment } from '@core/slug'
import { duongDanBac } from '../../../lib/programmingRoutes'
import { PageShell } from '@core/PageShell'
import { TwoPane } from '@core/TwoPane'
import { TocRail, type TocItem } from '@core/TocRail'
import { useActiveSection } from '@core/useActiveSection'
import { useIsDesktopViewport } from '../../../lib/useIsDesktopViewport'

export default function ProgrammingLevelPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  // URL là `<mã bậc>--<tên bậc đã slug hoá>` — mã đứng đầu nên link cũ (chỉ mã) vẫn tra ra
  // đúng bậc rồi được chuyển hướng về URL chuẩn.
  const { levelId: levelSlugParam } = useParams<{ levelId: string }>()
  const level = levelSlugParam ? getProgrammingLevel(idFromSlugSegment(levelSlugParam)) : undefined
  const [progress, setProgress] = useState<ProgrammingLessonProgress[]>([])
  // Phải gọi TRƯỚC mọi `return` sớm bên dưới: hook gọi có điều kiện là vi phạm Rules of Hooks
  // (React khớp hook theo THỨ TỰ gọi, nên một lần render bỏ qua hook này sẽ làm lệch toàn bộ
  // state của component).
  const isDesktop = useIsDesktopViewport()
  // Gom unit theo track (PR-M12). Bậc P1–P5 không unit nào khai `track` nên chỉ ra ĐÚNG MỘT
  // nhóm — khi đó trang giữ nguyên danh sách phẳng như trước, không hiện tiêu đề nhóm nào.
  // Chỉ P6 (65 unit, 4 mạch khác hẳn nhau) mới thật sự được chia nhóm.
  const nhomUnit = nhomUnitTheoTrack(level?.units ?? [])
  const coNhom = nhomUnit.length > 1
  // Cùng lý do: mã mục tính ngay ở đây (mảng rỗng khi id bậc lạ) để hook luôn được gọi.
  // Có chia nhóm thì mục lục trỏ tới NHÓM (4 mục dễ quét) thay vì 65 unit liền một dải.
  const idMucLuc = coNhom
    ? nhomUnit.map((n) => `track-${n.track.id}`)
    : (level?.units ?? []).map((u) => `unit-${u.id}`)
  const activeUnit = useActiveSection(idMucLuc)

  useEffect(() => {
    if (!user) return
    void fetchProgress(user.id).then(setProgress)
  }, [user])

  // Id bậc lạ → về trang tổng quan môn, không render trang rỗng.
  if (!level) return <Navigate to="/lap-trinh" replace />

  // Link cũ (chỉ mã) hoặc tên bậc đã đổi → về URL chuẩn, tránh hai URL cùng nội dung.
  const canonicalLevel = buildSlugSegment(level.id, level.name)
  if (levelSlugParam !== canonicalLevel) {
    return <Navigate to={duongDanBac(level)} replace />
  }

  // Tiến độ bậc: đếm trên các bài ĐÃ SOẠN của bậc (unit chưa có bài không tính vào mẫu số,
  // để thanh tiến độ không "đứng im" ở mức thấp khi nội dung còn đang soạn dần).
  const levelLessons = level.units.flatMap((u) => getUnitSummaries(u.id))
  const lessonCount = levelLessons.length
  const completedCount = levelLessons.filter((l) => isLessonCompleted(progress, l.id)).length

  const percent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0

  /* Thanh tiến độ — dùng lại ở CẢ hai bố cục (trong luồng chính ở mobile, trong cột phải ở
     desktop). Tách thành biến thay vì viết hai lần để hai nơi không lệch nhau về sau. */
  const progressBar =
    lessonCount > 0 ? (
      <div
        className="h-2 overflow-hidden rounded-full border border-line-subtle bg-surface-card"
        role="progressbar"
        aria-label={`Tiến độ bậc ${level.id.toUpperCase()}`}
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={lessonCount}
      >
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
    ) : null

  /* Mục lục unit — thứ học viên quét mắt nhiều nhất ở trang này. Mã mục dùng tiền tố `unit-`
     để không đụng id nào khác trên trang. */
  const tocItems: TocItem[] = coNhom
    ? nhomUnit.map((nhom) => {
        const bai = nhom.units.flatMap((u) => getUnitSummaries(u.id))
        return {
          id: `track-${nhom.track.id}`,
          label: nhom.track.title,
          hint: `${nhom.units.length} unit`,
          done: bai.length > 0 && bai.every((l) => isLessonCompleted(progress, l.id)),
        }
      })
    : level.units.map((unit) => {
        const lessons = getUnitSummaries(unit.id)
        return {
          id: `unit-${unit.id}`,
          label: unit.title,
          // Số bài, KHÔNG phải "U1/U2" — số thứ tự đã nằm ở cột trái của mục lục rồi.
          hint: lessons.length > 0 ? `${lessons.length} bài` : 'sắp mở',
          done: lessons.length > 0 && lessons.every((l) => isLessonCompleted(progress, l.id)),
        }
      })

  /* Cột phải ở desktop: tóm tắt bậc — đích đến (chặng dự án) và mình đang ở đâu (tiến độ).
     Đưa hai khối này ra khỏi luồng dọc giúp danh sách unit — thứ học viên thật sự cần quét
     mắt — bắt đầu ngay đầu trang thay vì bị đẩy xuống dưới hai thẻ. */
  const rail = (
    <div className="space-y-4">
      <TocRail
        items={tocItems}
        activeId={activeUnit}
        title={coNhom ? `Mục lục ${nhomUnit.length} mạch` : `Mục lục ${level.units.length} unit`}
      />
      {lessonCount > 0 && (
        <section className="rounded-2xl border border-line-subtle bg-surface-card p-4">
          <h2 className="t-label text-content">Tiến độ bậc</h2>
          <p className="t-caption text-content-muted mb-2 mt-0.5">
            {completedCount}/{lessonCount} bài học ({percent}%)
          </p>
          {progressBar}
        </section>
      )}
      <section className="space-y-2 rounded-2xl border border-accent-500/30 bg-surface-card p-4">
        <h2 className="t-label flex items-center gap-2 text-content">
          <Trophy className="h-4 w-4 text-accent-400" aria-hidden="true" />
          <span>{level.projectStage}</span>
        </h2>
        <p className="t-caption leading-relaxed text-content-secondary">
          <strong>Hoàn thành bậc = </strong>
          {level.projectMilestone}
        </p>
      </section>
    </div>
  )

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      {/* [2026-09-02, đợt 1 thiết kế lại desktop] Trước đây một cột `max-w-4xl` ở mọi bề rộng. */}
      <PageShell width="standard" baseWidth="max-w-4xl">
        <TwoPane isDesktop={isDesktop} railLabel="Tóm tắt bậc học" rail={rail}>
          <div className="space-y-6">
            <PageHeader
              title={`Bậc ${level.id.toUpperCase()} — ${level.name}`}
              subtitle={level.canDo}
            />

            {/* P6 soạn TRƯỚC mốc "P1–P5 chạy thật với người học" nên dễ phải sửa hơn — nói ra vì
            đây là cảnh báo có hệ quả thực tế cho người đang học, không phải tự bôi xấu. */}
            {level.id === 'p6' && (
              <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-zinc-100 leading-relaxed">
                <strong>Bản mở đường.</strong> Bậc này được soạn trước khi có dữ liệu người học
                thật, nên nội dung của nó dễ được sửa hơn P1–P5.
              </p>
            )}

            {/* Chặng dự án trục của bậc — ở desktop khối này nằm trong cột phải, nên chỉ dựng ở
            mobile. Dựng đúng một nhánh (không `lg:hidden`) để DOM không có hai bản trùng. */}
            {!isDesktop && (
              <section className="bg-zinc-900/80 border border-accent-500/30 rounded-3xl p-5 space-y-2 shadow-sm">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent-400" />
                  <span>{level.projectStage}</span>
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Hoàn thành bậc = </strong>
                  {level.projectMilestone}
                </p>
              </section>
            )}

            {/* Danh sách unit */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  Đề cương {level.units.length} unit ({level.duration})
                </h2>
                {lessonCount > 0 && !isDesktop && (
                  <p className="text-xs text-zinc-400">
                    Đã hoàn thành{' '}
                    <strong className="text-emerald-300 theme-light:text-emerald-800">
                      {completedCount}/{lessonCount}
                    </strong>{' '}
                    bài học
                  </p>
                )}
              </div>
              {/* Ở desktop tiến độ đã nằm trong cột phải — không lặp lại trong luồng chính. */}
              {!isDesktop && progressBar}
              {nhomUnit.map((nhom) => (
                <div key={nhom.track.id} className="space-y-3">
                  {/* Tiêu đề mạch chỉ hiện khi bậc thật sự có nhiều mạch (chỉ P6) — bậc khác
                      giữ nguyên danh sách phẳng, không thêm một tầng tiêu đề vô nghĩa. */}
                  {coNhom && (
                    <div id={`track-${nhom.track.id}`} className="scroll-mt-20 pt-2">
                      <h3 className="t-label text-content">{nhom.track.title}</h3>
                      <p className="t-caption text-content-muted mt-0.5">
                        {nhom.track.moTa} · {nhom.units.length} unit
                      </p>
                    </div>
                  )}
                  {nhom.units.map((unit) => {
                    // Số thứ tự lấy theo vị trí TOÀN BẬC, không phải trong nhóm — nếu không thì
                    // ba mạch đều bắt đầu từ "Unit 1" và mã unit trên URL không còn khớp nhãn.
                    const idx = level.units.indexOf(unit)
                    const lessons = getUnitSummaries(unit.id)
                    const unitCompleted =
                      lessons.length > 0 && lessons.every((l) => isLessonCompleted(progress, l.id))
                    return (
                      <div
                        key={unit.id}
                        id={`unit-${unit.id}`}
                        // `scroll-mt-20` chừa đúng chiều cao header dính, nếu không thì nhảy tới
                        // unit qua mục lục sẽ đưa tiêu đề unit nằm KHUẤT sau header.
                        className="scroll-mt-20 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-white">
                            <span className="text-zinc-500 mr-2">Unit {idx + 1}</span>
                            {unit.title}
                          </p>
                          {lessons.length === 0 ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
                              <Lock className="w-3 h-3" /> Sắp mở
                            </span>
                          ) : unitCompleted ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 theme-light:text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed flex items-start gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
                          <span>{unit.topics}</span>
                        </p>
                        {unit.projectStep && (
                          <p className="text-xs text-accent-300 theme-light:text-accent-800 leading-relaxed flex items-start gap-1.5">
                            <Hammer className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong>Dự án:</strong> {unit.projectStep}
                            </span>
                          </p>
                        )}
                        {lessons.map((lesson) => (
                          <div key={lesson.id} className="space-y-1.5">
                            {/* Ngôn ngữ hiện TRƯỚC khi bấm (PR-UX1) — học viên biết sắp viết gì. */}
                            <LangBadge language={lesson.language} />
                            <button
                              onClick={() =>
                                nav(
                                  `/lap-trinh/bai-hoc/${buildSlugSegment(lesson.id, lesson.title)}`,
                                )
                              }
                              className="tap-44 w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition active:scale-[0.98]"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <Play className="w-4 h-4 shrink-0" />
                                <span className="truncate">Học bài: {lesson.title}</span>
                              </span>
                              {isLessonCompleted(progress, lesson.id) && (
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </section>
          </div>
        </TwoPane>
      </PageShell>
    </div>
  )
}
