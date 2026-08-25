// domPrelude — Bộ chạy bài DOM, DÙNG CHUNG cho cổng CI và Worker trong trình duyệt (PR-L7d).
//
// VÌ SAO CHẤM Ở ĐÂY CHỨ KHÔNG CHẤM TRONG IFRAME: bài DOM phải chạy JavaScript của học viên,
// mà vòng lặp vô hạn là lỗi kinh điển của người mới. Chạy trong Worker thì main thread
// terminate() được; chạy trong iframe thì không có nút dừng nào chắc chắn. Worker lại không
// có DOM, nên ta nạp linkedom — MỘT thư viện dùng ở CẢ HAI nơi, nhờ vậy cổng CI và trình
// duyệt không thể lệch nhau (bài học rút từ mạch Python: python3 ở CI vs Pyodide ở học viên).
//
// Iframe vẫn còn vai trò, nhưng chỉ để XEM trang chạy thật — không dính gì tới việc chấm.
import { parseHTML } from 'linkedom'
import { moTaCayDom, type ElementLike } from './htmlPrelude.js'

/** Kết quả một lượt chạy: bản mô tả cây DOM SAU KHI script chạy và các hành động diễn ra. */
export interface DomRunResult {
  output: string
  error?: string
}

/**
 * Cú pháp HÀNH ĐỘNG của người dùng, đặt trong `stdinLines` của test-case. Với bài DOM thì
 * "dữ liệu đưa vào chương trình" chính là chuỗi thao tác của người dùng, nên dùng lại đúng
 * ô đó thay vì đẻ thêm kiểu test-case mới:
 *
 *   click #nut-tang          -> bấm vào phần tử khớp bộ chọn
 *   dien #o-ten = Lan        -> gõ "Lan" vào ô nhập rồi phát sự kiện input
 */
const RE_CLICK = /^click\s+(.+)$/
const RE_DIEN = /^dien\s+(.+?)\s*=\s*(.*)$/

export interface DomLike {
  querySelector(sel: string): unknown
  documentElement: unknown
}

/** Diễn MỘT hành động người dùng trên trang — dùng chung cho bài DOM và bài fetch (PR-L7e). */
export function thucHien(
  hanhDong: string,
  document: DomLike,
  EventCtor: new (t: string) => unknown,
): void {
  const click = RE_CLICK.exec(hanhDong)
  const dien = RE_DIEN.exec(hanhDong)
  const boChon = click?.[1] ?? dien?.[1]
  if (!boChon) {
    throw new Error(
      `Hành động không hiểu: "${hanhDong}". Chỉ nhận "click <bộ chọn>" hoặc "dien <bộ chọn> = <giá trị>".`,
    )
  }
  const el = document.querySelector(boChon.trim()) as
    ({ dispatchEvent(e: unknown): void } & { value?: string }) | null
  if (!el) throw new Error(`Không tìm thấy phần tử "${boChon.trim()}" trên trang.`)

  if (dien) {
    el.value = dien[2] ?? ''
    el.dispatchEvent(new EventCtor('input'))
    return
  }
  el.dispatchEvent(new EventCtor('click'))
}

/**
 * Dựng trang, chạy script của học viên trên trang đó, diễn các hành động, rồi mô tả cây DOM.
 * Mỗi lượt gọi là một trang MỚI TINH — không dính trạng thái lượt trước.
 */
export function chayBaiDom(html: string, js: string, hanhDong: string[] = []): DomRunResult {
  try {
    const { document, window } = parseHTML(html)
    const EventCtor = (window as unknown as { Event: new (t: string) => unknown }).Event

    // new Function: script chạy trong phạm vi hàm riêng, chỉ thấy document/window của trang
    // giả — không thấy biến của bộ chạy, không với tới môi trường ngoài.
    new Function('document', 'window', js)(document, window)

    for (const hd of hanhDong) thucHien(hd, document as unknown as DomLike, EventCtor)

    return { output: moTaCayDom(document.documentElement as unknown as ElementLike) }
  } catch (err) {
    const e = err as Error
    return { output: '', error: e?.message ? `${e.name ?? 'Lỗi'}: ${e.message}` : String(err) }
  }
}
