// ActivityCalendarCard — thẻ "Lịch hoạt động" ở trang Tiến độ.
//
// TÁCH RA KHỎI Dashboard.tsx (2026-09-02) khi khối này có thêm điều hướng bàn phím và chi
// tiết theo ngày: nó đã tự đủ phức tạp để đứng riêng, và Dashboard vốn đã dài.
//
// HAI THỨ ĐÁNG ĐỌC TRƯỚC KHI SỬA FILE NÀY
//
// 1. MỘT điểm dừng Tab cho cả lưới, không phải một cho mỗi ngày.
//    Bản trước cho mọi ô `tabIndex={0}`. Đo thật trên desktop: **182 trong 213** điểm dừng
//    Tab của cả trang là ô lịch — người dùng bàn phím phải bấm Tab 182 lần để đi qua một thẻ
//    số liệu. Nay dùng mẫu chuẩn WAI-ARIA **roving tabindex**: đúng một ô mang `tabIndex=0`
//    (ô đang chọn), các ô còn lại `-1`; vào lưới bằng Tab, đi lại bên trong bằng phím mũi
//    tên. Luật phím nằm ở `@core/rovingGrid` (hàm thuần, có test riêng).
//
// 2. Ô lịch BẤM ĐƯỢC và trả lời câu hỏi kế tiếp.
//    Heatmap chỉ nói "ngày này đậm hơn ngày kia"; câu hỏi ngay sau đó của người học luôn là
//    "hôm đó mình đã làm gì?". Chọn một ngày thì phần chi tiết ngay dưới lưới trả lời đúng
//    câu đó. Vì ô nay là nút bấm thật, `role="img"` cũ không còn đúng — chuyển sang
//    `role="grid"`/`gridcell` với `aria-selected`.

import { useMemo, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { resolveRovingGridKey } from '@core/rovingGrid'
import { getDayBreakdown, type ActivityCalendar, type DayBreakdownItem } from '../lib/stats'

// Màu ô heatmap theo số hoạt động trong ngày (đậm dần).
function heatColor(count: number): string {
  if (count <= 0) return 'bg-zinc-800/50'
  if (count <= 2) return 'bg-accent-900'
  if (count <= 5) return 'bg-accent-700'
  if (count <= 10) return 'bg-accent-500'
  return 'bg-accent-400'
}

// Nhãn từng loại hoạt động. Gõ khoá đúng bằng `DayBreakdownItem['key']` chứ không phải
// `string`: thêm loại hoạt động mới ở lib/stats.ts mà quên nhãn ở đây thì TS báo ngay, thay
// vì giao diện lặng lẽ hiện "undefined".
const ACTIVITY_LABEL: Record<DayBreakdownItem['key'], { vi: string; en: string }> = {
  learn: { vi: 'từ đã học', en: 'words learned' },
  chat: { vi: 'lượt chat', en: 'chat turns' },
  writing: { vi: 'bài viết', en: 'writing' },
  speaking: { vi: 'lượt luyện nói', en: 'speaking' },
  stt: { vi: 'lượt ghi âm', en: 'recordings' },
  pronounce: { vi: 'lượt chấm phát âm', en: 'pronunciation checks' },
}

/** Ngày dạng YYYY-MM-DD → "T4, 12/08" (chỉ để đọc, không dùng lại làm khoá). */
function prettyDate(date: string, vi: boolean): string {
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  const wd = vi
    ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${wd}, ${dd}/${mm}`
}

export interface ActivityCalendarCardProps {
  calendar: ActivityCalendar
  uid: string
  vi: boolean
  /** true = bố cục desktop (tuần theo cột); false = bố cục cũ (tuần theo hàng). */
  isDesktop: boolean
  /** Số tuần đang hiển thị — chỉ để ghi ở nhãn góc phải. */
  weeks: number
  wdow: string[]
}

export default function ActivityCalendarCard({
  calendar,
  uid,
  vi,
  isDesktop,
  weeks,
  wdow,
}: ActivityCalendarCardProps) {
  const days = calendar.days
  const lastIndex = days.length - 1
  // Mặc định chọn HÔM NAY (ô cuối) — vào lưới bằng Tab là đứng ngay ở ngày gần nhất, chứ
  // không phải ở ngày xa nhất cách đây nửa năm.
  const [selected, setSelected] = useState(lastIndex)
  const gridRef = useRef<HTMLDivElement>(null)

  const current = days[Math.min(selected, lastIndex)]
  const breakdown = useMemo(
    () => (current ? getDayBreakdown(uid, current.date) : null),
    [uid, current],
  )

  function move(next: number) {
    setSelected(next)
    // Chuyển tiêu điểm sang ô mới: roving tabindex chỉ đúng khi tiêu điểm ĐI THEO ô được
    // chọn, nếu không người dùng bàn phím thấy viền chọn nhảy mà con trỏ đứng yên.
    const cell = gridRef.current?.querySelector<HTMLElement>(`[data-cell="${next}"]`)
    cell?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const next = resolveRovingGridKey(e.key, {
      index: selected,
      total: days.length,
      span: 7,
      flow: isDesktop ? 'column' : 'row',
    })
    // `null` = phím không dùng đến ⇒ KHÔNG preventDefault, để phím tắt trình duyệt sống.
    if (next === null) return
    e.preventDefault()
    move(next)
  }

  // Ô lịch, gom theo TUẦN. `role="grid"` bắt buộc con trực tiếp là `role="row"`, và
  // `role="gridcell"` bắt buộc có cha là `row` (axe: aria-required-children /
  // aria-required-parent, đều mức critical) — bản đầu đặt ô thẳng vào lưới nên cổng a11y đỏ
  // ở cả 5 theme. Hàng dùng `display: contents` để có ĐÚNG ngữ nghĩa mà KHÔNG tạo hộp bố
  // cục: các ô vẫn tham gia trực tiếp vào lưới CSS của phần tử cha, nên hình hài không đổi.
  const cell = (d: (typeof days)[number], idx: number) => {
    const isLast = idx === lastIndex
    const isSel = idx === selected
    const label = `${prettyDate(d.date, vi)}: ${d.count} ${vi ? 'hoạt động' : 'activities'}`
    return (
      <button
        key={d.date}
        type="button"
        data-cell={idx}
        role="gridcell"
        aria-selected={isSel}
        aria-label={label}
        title={label}
        // Roving tabindex: đúng MỘT ô nhận Tab.
        tabIndex={isSel ? 0 : -1}
        onClick={() => move(idx)}
        style={
          idx === 0
            ? isDesktop
              ? { gridRowStart: calendar.firstColumn + 1 }
              : { gridColumnStart: calendar.firstColumn + 1 }
            : undefined
        }
        className={`${isDesktop ? 'w-4 h-4' : 'aspect-square w-full'} rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${heatColor(d.count)} ${
          isSel ? 'ring-2 ring-accent-300' : isLast ? 'ring-1 ring-accent-400/70' : ''
        }`}
      />
    )
  }

  // Tuần đầu tiên thường thiếu vài ngày (lịch bắt đầu giữa tuần) — nhóm đúng theo mốc đó để
  // mỗi `row` là một tuần thật, không phải cứ 7 ô cắt một lần.
  const weekRows: { start: number; items: typeof days }[] = []
  {
    let i = 0
    let take = 7 - calendar.firstColumn
    while (i < days.length) {
      weekRows.push({ start: i, items: days.slice(i, i + take) })
      i += take
      take = 7
    }
  }

  const rows = weekRows.map((w) => (
    <div key={w.start} role="row" style={{ display: 'contents' }}>
      {w.items.map((d, j) => cell(d, w.start + j))}
    </div>
  ))

  return (
    <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-accent-400" />{' '}
          {vi ? 'Lịch hoạt động' : 'Activity calendar'}
        </h2>
        <span className="text-xs text-zinc-400">
          {calendar.activeDays} {vi ? `ngày / ${weeks} tuần` : `days / ${weeks} weeks`}
        </span>
      </div>

      {/* HAI BỐ CỤC.
          Desktop: 7 HÀNG (thứ) × N cột (tuần) — lối heatmap quen thuộc, thêm tuần là rộng ra
          chứ không cao lên, nên bề ngang desktop được dùng để kể câu chuyện dài hơn.
          Dưới 1024px giữ bố cục cũ 7 cột × N hàng: màn hẹp không đủ chỗ cho hàng chục cột. */}
      {isDesktop ? (
        <div className="flex gap-1.5 overflow-x-auto">
          <div className="grid grid-rows-7 gap-1 text-[11px] text-zinc-400 shrink-0">
            {wdow.map((w, i) => (
              <span key={i} className="h-4 leading-4 pr-0.5">
                {w}
              </span>
            ))}
          </div>
          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- mẫu WAI-ARIA
              "roving tabindex": tiêu điểm nằm ở Ô (role=gridcell, tabIndex 0/-1 ở dưới), KHÔNG
              ở khung grid; khung chỉ nhận phím uỷ quyền từ ô đang focus. Đặt tabIndex cho khung
              sẽ thêm một điểm dừng Tab thừa — đúng thứ đã bỏ đi ở đầu file. */}
          <div
            ref={gridRef}
            role="grid"
            aria-label={vi ? 'Lịch hoạt động theo ngày' : 'Daily activity calendar'}
            onKeyDown={onKeyDown}
            className="grid grid-rows-7 grid-flow-col gap-1"
          >
            {rows}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {wdow.map((w, i) => (
              <span key={i} className="text-[11px] text-zinc-400 text-center">
                {w}
              </span>
            ))}
          </div>
          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- mẫu WAI-ARIA
              "roving tabindex": tiêu điểm nằm ở Ô (role=gridcell, tabIndex 0/-1 ở dưới), KHÔNG
              ở khung grid; khung chỉ nhận phím uỷ quyền từ ô đang focus. Đặt tabIndex cho khung
              sẽ thêm một điểm dừng Tab thừa — đúng thứ đã bỏ đi ở đầu file. */}
          <div
            ref={gridRef}
            role="grid"
            aria-label={vi ? 'Lịch hoạt động theo ngày' : 'Daily activity calendar'}
            onKeyDown={onKeyDown}
            className="grid grid-cols-7 gap-1.5"
          >
            {rows}
          </div>
        </div>
      )}

      {/* Chi tiết ngày đang chọn. `aria-live="polite"`: người dùng trình đọc màn hình đi
          bằng phím mũi tên phải NGHE được nội dung đổi theo, chứ không chỉ nghe nhãn ô. */}
      {current && breakdown && (
        <div
          aria-live="polite"
          className="mt-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-300"
        >
          <span className="font-semibold text-zinc-200">{prettyDate(current.date, vi)}</span>
          {breakdown.items.length === 0 ? (
            <span className="text-zinc-400">
              {' '}
              — {vi ? 'không có hoạt động nào' : 'no activity'}
            </span>
          ) : (
            <span>
              {' '}
              —{' '}
              {breakdown.items
                .map((i) => {
                  const l = ACTIVITY_LABEL[i.key]
                  return `${i.count} ${vi ? l.vi : l.en}`
                })
                .join(' · ')}
            </span>
          )}
        </div>
      )}

      {/* Chú thích đậm nhạt */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-zinc-400">
        <span>{vi ? 'Ít' : 'Less'}</span>
        <span className="w-3 h-3 rounded-[3px] bg-zinc-800/50" />
        <span className="w-3 h-3 rounded-[3px] bg-accent-900" />
        <span className="w-3 h-3 rounded-[3px] bg-accent-700" />
        <span className="w-3 h-3 rounded-[3px] bg-accent-500" />
        <span className="w-3 h-3 rounded-[3px] bg-accent-400" />
        <span>{vi ? 'Nhiều' : 'More'}</span>
      </div>
    </section>
  )
}
