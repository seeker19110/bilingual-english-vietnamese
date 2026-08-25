// htmlPrelude — Cách MÔ TẢ một trang HTML thành văn bản để đem đi chấm (PR-L7c).
//
// VÌ SAO KHÔNG SO CHUỖI HTML THÔ: so thô sẽ bắt học viên gõ trùng từng dấu cách, từng thứ tự
// thuộc tính — dạy sai hoàn toàn. Cái đáng chấm là CẤU TRÚC trang: có thẻ nào, lồng trong
// nhau ra sao, chữ gì, thuộc tính quan trọng nào. Nên bài HTML chấm trên bản mô tả cây DOM;
// nhờ vậy `grading.ts` (so chuỗi contains/exact) dùng lại được y nguyên, không phải đổi.
//
// LƯU Ý VỀ HAI ENGINE: hàm dựng cây (parser) ở cổng CI là happy-dom, còn trong trình duyệt là
// DOMParser thật. Bộ ĐI CÂY và ĐỊNH DẠNG thì dùng chung file này, nên chỉ còn khác nhau ở
// phần phân tích cú pháp — với HTML của người mới thì hai bên tương đương, và có E2E chạy
// code mẫu trong Chromium thật để bắt trường hợp lệch.

/** Thuộc tính đáng đưa vào bản mô tả — những thứ làm nên Ý NGHĨA của thẻ, không phải trang trí. */
const ATTRS_QUAN_TRONG = [
  'id',
  'class',
  'href',
  'src',
  'alt',
  'type',
  'name',
  'value',
  'for',
  // lang và charset thuộc nhóm "đúng chuẩn" mà dự án bắt buộc dạy từ bài HTML đầu tiên
  // (a11y + hiển thị tiếng Việt có dấu), nên chúng phải hiện ra trong bản mô tả để chấm được.
  'lang',
  'charset',
]

/** Thẻ không cần đi vào bên trong (nội dung của chúng không phải cây con). */
const THE_LA = new Set(['SCRIPT'])

/** Node văn bản (nodeType 3) — dùng để lấy đúng chữ TRỰC TIẾP của một thẻ. */
export interface NodeLike {
  nodeType: number
  textContent: string | null
}

/** Kiểu tối thiểu của một phần tử DOM mà bộ đi cây cần — hợp cả happy-dom lẫn trình duyệt. */
export interface ElementLike {
  tagName: string
  children: ArrayLike<ElementLike>
  childNodes: ArrayLike<NodeLike>
  textContent: string | null
  getAttribute(name: string): string | null
  hasAttribute(name: string): boolean
}

const NODE_VAN_BAN = 3

/** Gom khoảng trắng thừa: người mới xuống dòng/thụt lề tuỳ ý, đó không phải lỗi. */
function gonChu(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/**
 * Chuẩn hoá CSS trong thẻ <style> để chấm được mà không phụ thuộc cách gõ: mỗi luật một dòng,
 * khai báo sắp theo bảng chữ cái, bỏ khoảng trắng thừa và dấu chấm phẩy cuối.
 *
 * Ở đây CHẤM PHẦN KHAI BÁO, không chấm kết quả hiển thị thật (cần trình duyệt thật mới đo
 * được). Với bậc nhập môn thì mục tiêu học đúng là "biết đặt display: flex cho .menu".
 */
export function chuanHoaCss(css: string): string {
  const luat: string[] = []
  // Bỏ chú thích /* ... */ trước khi tách luật.
  const sach = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(sach)) !== null) {
    const bo_chon = gonChu(m[1] ?? '')
    const khai_bao = (m[2] ?? '')
      .split(';')
      .map((d) => gonChu(d))
      .filter(Boolean)
      .map((d) => {
        const [ten, ...phanConLai] = d.split(':')
        return `${gonChu(ten ?? '').toLowerCase()}: ${gonChu(phanConLai.join(':'))}`
      })
      .sort()
    if (bo_chon) luat.push(`${bo_chon} { ${khai_bao.join('; ')} }`)
  }
  return luat.join('\n')
}

function moTaMotThe(el: ElementLike, muc: number): string[] {
  const thut = '  '.repeat(muc)
  const ten = el.tagName.toLowerCase()

  // Hỏi hasAttribute chứ KHÔNG dựa vào getAttribute trả null: linkedom trả chuỗi rỗng cho
  // thuộc tính không tồn tại (class), nên kiểm bằng null sẽ đẻ ra class="" rác khắp nơi.
  // Dùng hasAttribute cũng giữ đúng alt="" của ảnh trang trí — đó là giá trị CÓ Ý NGHĨA.
  const thuocTinh = ATTRS_QUAN_TRONG.filter((a) => el.hasAttribute(a)).map(
    (a) => `${a}="${gonChu(el.getAttribute(a) ?? '')}"`,
  )

  // Thẻ <style>: in CSS đã chuẩn hoá thay vì coi như chữ thường.
  if (ten === 'style') {
    const css = chuanHoaCss(el.textContent ?? '')
    return [
      `${thut}style`,
      ...css
        .split('\n')
        .filter(Boolean)
        .map((d) => `${thut}  ${d}`),
    ]
  }

  // Chữ TRỰC TIẾP của thẻ = chỉ các node văn bản con ruột, KHÔNG lấy chữ của thẻ con.
  // (Trừ chuỗi con bằng replace sẽ sai khi cha và con trùng chữ, ví dụ <p>den <b>den</b></p>.)
  const chuTrucTiep = gonChu(
    Array.from(el.childNodes)
      .filter((n) => n.nodeType === NODE_VAN_BAN)
      .map((n) => n.textContent ?? '')
      .join(' '),
  )

  const dong =
    `${thut}${ten}` +
    (thuocTinh.length ? ` ${thuocTinh.join(' ')}` : '') +
    (chuTrucTiep ? ` "${chuTrucTiep}"` : '')

  if (THE_LA.has(el.tagName.toUpperCase())) return [dong]
  const con = Array.from(el.children).flatMap((c) => moTaMotThe(c, muc + 1))
  return [dong, ...con]
}

/**
 * Bản mô tả cây DOM để chấm và để học viên tự đối chiếu. Ví dụ:
 *   html
 *     body
 *       h1 "Quan ca phe cua toi"
 *       ul class="menu"
 *         li "Ca phe den"
 */
export function moTaCayDom(goc: ElementLike): string {
  return moTaMotThe(goc, 0).join('\n')
}
