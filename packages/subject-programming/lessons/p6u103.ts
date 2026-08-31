// lessons/p6u103.ts — P6-U103: HƯỚNG BACKEND, chặng S2 — CACHE (module `backend-s2-m2`).
//
// backend-s2-m1 (p6u102) dạy lỗi trong CHÍNH cơ sở dữ liệu (lost update, index). Unit này đi
// tiếp sang tầng CACHE đứng trước CSDL — hai bài dạy đúng 3 topic của module: cache-aside +
// TTL + cách làm mất hiệu lực (l1), và cache stampede + khoá tái tạo, kèm "cái gì KHÔNG nên
// cache" (l2, chỉ nêu trong theory, không cần code riêng).
//
// Dùng làn `typescript`, không có Redis/CSDL thật — mọi hành vi (thời gian trôi qua, nhiều
// request cùng lúc) được MÔ PHỎNG bằng hàm thuần, tất định: "thời điểm hiện tại" là một tham
// số số nguyên truyền tay (không Date.now()/setTimeout), và "N request cùng lúc" là một vòng
// lặp xử lý tuần tự trên cùng một trạng thái khoá — đúng cách p6u102 mô phỏng version mà
// không cần transaction thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U103_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u103-l1',
    unitId: 'p6-u103',
    language: 'typescript',
    title: 'Cache-aside + TTL — đọc qua cache, ghi thì làm mất hiệu lực chứ đừng ghi thẳng',
    hook: 'Trang sản phẩm đọc tồn kho 200 lần/giây nhưng tồn kho chỉ đổi vài lần/phút — đọc thẳng CSDL mỗi lần là phí. Bạn thêm cache. Vài hôm sau khách báo: mua xong rồi mà trang vẫn hiện tồn kho CŨ, y như chưa hề mua. Cache không tự biết dữ liệu gốc vừa đổi — nó chỉ biết những gì NÓ được BẢO cho biết.',
    theory:
      'CACHE-ASIDE (còn gọi lazy loading) là cách dùng cache phổ biến nhất: ứng dụng tự quản cache, không phải CSDL. Luồng ĐỌC:\n\n1. Kiểm cache trước. Có (hit) và chưa hết hạn → trả thẳng, KHÔNG đụng nguồn.\n2. Không có hoặc hết hạn (miss) → đọc NGUỒN THẬT, rồi ghi kết quả vào cache để lần sau dùng lại.\n\nLuồng GHI — đây là chỗ hay nhầm nhất: KHÔNG ghi thẳng giá trị mới vào cache. Đúng cách là cập nhật NGUỒN trước, rồi LÀM MẤT HIỆU LỰC (invalidate — thường là xoá) mục cache tương ứng. Lần đọc kế tiếp sẽ miss, tự đọc lại nguồn và có giá trị mới nhất. Vì sao không ghi thẳng vào cache cho nhanh: nếu hai nơi cùng ghi nguồn gần như đồng thời, "ghi thẳng cache" rất dễ khiến cache kẹt lại giá trị SAI thứ tự — còn xoá cache thì lần đọc lại luôn lấy đúng nguồn tại thời điểm đó, không thể sai thứ tự.\n\nTTL (time-to-live) là lưới an toàn thứ hai, phòng khi có chỗ nào đó quên gọi invalidate (bug, cập nhật trực tiếp CSDL bỏ qua app...): mỗi mục cache có thêm "thời điểm hết hạn". Ví dụ TTL = 60 giây, ghi lúc t=20 thì hết hạn ở t=80 — dù không ai xoá tay, tới t=80 cache tự coi như miss và đọc lại nguồn. TTL ngắn → dữ liệu tươi hơn nhưng cache đỡ được ít tải hơn (nguồn bị hỏi thường xuyên hơn); TTL dài → đỡ tải nhiều hơn nhưng nguy cơ hiện dữ liệu cũ lâu hơn nếu lỡ quên invalidate ở đâu đó. Không có con số TTL "đúng" chung — chọn theo mức chấp nhận được của dữ liệu đó bị cũ bao lâu.',
    workedExample: {
      code: `type MucCache = { giaTri: string; hetHan: number } // hetHan: thời điểm (giây) cache hết hạn

const TTL_GIAY = 60 // cache sống 60 giây rồi phải đọc lại nguồn

const cache = new Map<string, MucCache>()
const nguonThat: Record<string, string> = { "sp-1": "Ao thun - con 50" }

// Đọc kiểu cache-aside: kiểm cache trước, miss (hoặc hết hạn) mới đọc nguồn rồi ghi lại cache.
function doc(key: string, thoiDiemHienTai: number): { giaTri: string; tuDau: "cache" | "nguon" } {
  const muc = cache.get(key)
  if (muc && muc.hetHan > thoiDiemHienTai) {
    // Còn trong cache VÀ chưa hết hạn -> trả thẳng, không đụng nguồn
    return { giaTri: muc.giaTri, tuDau: "cache" }
  }
  // Miss hoặc hết hạn -> đọc nguồn thật rồi ghi vào cache với TTL mới
  const giaTri = nguonThat[key]!
  cache.set(key, { giaTri, hetHan: thoiDiemHienTai + TTL_GIAY })
  return { giaTri, tuDau: "nguon" }
}

// Ghi: cập nhật NGUỒN trước, rồi LÀM MẤT HIỆU LỰC cache (xoá) — không ghi thẳng vào cache.
function ghi(key: string, giaTriMoi: string): void {
  nguonThat[key] = giaTriMoi
  cache.delete(key) // lần đọc kế tiếp bắt buộc lấy lại từ nguồn
}

console.log(doc("sp-1", 0).tuDau)       // miss lần đầu -> đọc từ nguồn
console.log(doc("sp-1", 10).tuDau)      // còn hạn (10 < 60) -> lấy từ cache
ghi("sp-1", "Ao thun - con 48")          // bán được 2 cái, cập nhật nguồn + xoá cache
console.log(doc("sp-1", 20).tuDau)      // vừa bị xoá -> đọc lại nguồn, thấy số MỚI
console.log(doc("sp-1", 20).giaTri)
console.log(doc("sp-1", 90).tuDau)      // t=90, cache ghi lúc t=20 hết hạn ở t=80 -> đọc lại nguồn`,
      stdinLines: [],
    },
    predict: {
      code: `type MucCache = { giaTri: number; hetHan: number }
const TTL = 30
const cache = new Map<string, MucCache>()
const nguon: Record<string, number> = { gia: 100 }

function doc(key: string, t: number): number {
  const muc = cache.get(key)
  if (muc && muc.hetHan > t) return muc.giaTri
  const giaTri = nguon[key]!
  cache.set(key, { giaTri, hetHan: t + TTL })
  return giaTri
}

doc("gia", 0)
nguon.gia = 200 // đổi nguồn NHƯNG không gọi hàm ghi() -> cache KHÔNG bị xoá
console.log(doc("gia", 25))`,
      question:
        'Nguồn bị đổi thẳng (không qua hàm ghi/invalidate) lúc cache còn hạn. doc("gia", 25) in ra gì?',
      choices: ['200', '100', '50', '300'],
      answerIndex: 1,
      explain:
        'Kết quả là 100 — giá trị CŨ. Vì việc đổi nguon.gia không đi qua hàm ghi() nên cache KHÔNG bị xoá; lúc t=25 mục cache (ghi lúc t=0, hết hạn ở t=30) vẫn còn hạn, nên doc() trả thẳng từ cache mà không đụng tới nguồn đã đổi. Đây chính là lý do luồng ghi PHẢI đi qua bước làm mất hiệu lực — sửa trực tiếp nguồn mà bỏ qua bước đó là cache sẽ nói dối cho tới khi TTL hết (t=30).',
    },
    parsons: {
      prompt:
        'Xếp lại hàm đọc cache-aside — kiểm cache còn hạn TRƯỚC, miss mới đọc nguồn rồi ghi lại cache.',
      lines: [
        'function doc(key: string, thoiDiemHienTai: number) {',
        '  const muc = cache.get(key)',
        '  if (muc && muc.hetHan > thoiDiemHienTai) {',
        '    return { giaTri: muc.giaTri, tuDau: "cache" }',
        '  }',
        '  const giaTri = nguonThat[key]!',
        '  cache.set(key, { giaTri, hetHan: thoiDiemHienTai + TTL_GIAY })',
        '  return { giaTri, tuDau: "nguon" }',
        '}',
      ],
    },
    make: {
      prompt:
        'Cài hai hàm quản cache-aside kèm TTL:\n\n- `doc(key, t)`: nếu cache có mục CHƯA hết hạn (hetHan > t) thì trả `{ giaTri, tuDau: "cache" }`. Ngược lại (miss hoặc hết hạn) đọc từ `nguonThat`, GHI vào cache với `hetHan = t + TTL_GIAY`, rồi trả `{ giaTri, tuDau: "nguon" }`.\n- `ghi(key, giaTriMoi)`: cập nhật `nguonThat[key] = giaTriMoi` rồi XOÁ mục cache của key đó (không ghi thẳng giá trị mới vào cache).\n\nTTL_GIAY = 30. Dùng starter code có sẵn phần dưới, đừng sửa.',
      starterCode: `type MucCache = { giaTri: string; hetHan: number }

const TTL_GIAY = 30
const cache = new Map<string, MucCache>()
const nguonThat: Record<string, string> = { "kho-1": "Ton: 100" }

function doc(key: string, t: number): { giaTri: string; tuDau: "cache" | "nguon" } {
  // TODO: kiểm cache còn hạn -> trả cache; ngược lại đọc nguồn rồi ghi cache mới
  return { giaTri: "", tuDau: "nguon" }
}

function ghi(key: string, giaTriMoi: string): void {
  // TODO: cập nhật nguồn rồi xoá mục cache của key này
}

// ---- Đừng sửa phần dưới đây ----
console.log("B1:", doc("kho-1", 0).tuDau)
console.log("B2:", doc("kho-1", 10).tuDau)
ghi("kho-1", "Ton: 90")
console.log("B3:", doc("kho-1", 15).tuDau, doc("kho-1", 15).giaTri)
console.log("B4:", doc("kho-1", 50).tuDau)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'B1: nguon',
          match: 'contains',
          hidden: false,
          label: 'Lần đọc đầu tiên (t=0): cache trống -> miss, đọc từ nguồn',
        },
        {
          stdinLines: [],
          expected: 'B2: cache',
          match: 'contains',
          hidden: false,
          label: 'Đọc lại ở t=10, TTL=30 nên chưa hết hạn -> lấy từ cache',
        },
        {
          stdinLines: [],
          expected: 'B3: nguon Ton: 90',
          match: 'contains',
          hidden: false,
          label:
            'Sau ghi() ở t giữa B2 và B3: cache đã bị xoá -> đọc lại nguồn, thấy giá trị MỚI 90',
        },
        {
          stdinLines: [],
          expected: 'B4: nguon',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: t=50, mục cache ghi ở B3 (t=15) hết hạn ở t=45 -> B4 lại miss, đọc nguồn',
        },
      ],
      hints: [
        'doc(): điều kiện còn hạn là `muc && muc.hetHan > t` — chỉ trả thẳng cache khi đúng cả hai vế.',
        'Nhớ SET lại cache trong nhánh miss: `cache.set(key, { giaTri, hetHan: t + TTL_GIAY })` trước khi return — quên bước này thì cache không bao giờ hit.',
        'ghi() chỉ cần hai dòng: gán lại `nguonThat[key]` rồi `cache.delete(key)`. Đừng set giá trị mới vào cache ở đây — đó chính là lỗi "ghi thẳng cache" bài học vừa cảnh báo.',
      ],
      sampleSolution: `type MucCache = { giaTri: string; hetHan: number }

const TTL_GIAY = 30
const cache = new Map<string, MucCache>()
const nguonThat: Record<string, string> = { "kho-1": "Ton: 100" }

function doc(key: string, t: number): { giaTri: string; tuDau: "cache" | "nguon" } {
  const muc = cache.get(key)
  if (muc && muc.hetHan > t) {
    return { giaTri: muc.giaTri, tuDau: "cache" }
  }
  const giaTri = nguonThat[key]!
  cache.set(key, { giaTri, hetHan: t + TTL_GIAY })
  return { giaTri, tuDau: "nguon" }
}

function ghi(key: string, giaTriMoi: string): void {
  nguonThat[key] = giaTriMoi
  cache.delete(key)
}

// ---- Đừng sửa phần dưới đây ----
console.log("B1:", doc("kho-1", 0).tuDau)
console.log("B2:", doc("kho-1", 10).tuDau)
ghi("kho-1", "Ton: 90")
console.log("B3:", doc("kho-1", 15).tuDau, doc("kho-1", 15).giaTri)
console.log("B4:", doc("kho-1", 50).tuDau)`,
    },
    homework:
      'Mở một hệ thống bạn từng dùng có cache rõ ràng (CDN ảnh, cache trang web, app đặt vé...) và thử tìm dấu hiệu TTL: có lúc nào bạn thấy dữ liệu "cũ" một lúc rồi mới cập nhật không (ảnh đại diện đổi rồi mà vẫn thấy ảnh cũ vài phút, giá vé vừa hết mà vẫn thấy còn chỗ...)? Ước lượng TTL đó khoảng bao lâu dựa trên thời gian bạn chờ thấy dữ liệu mới. Rồi tự hỏi: nếu bạn là người thiết kế, bạn sẽ chọn TTL ngắn hơn (tươi hơn, tốn tải nguồn hơn) hay giữ nguyên — vì sao?',
    srsCards: [
      {
        hoi: 'Luồng ĐỌC của cache-aside gồm mấy bước, theo thứ tự nào?',
        dap: 'Kiểm cache trước — hit và chưa hết hạn thì trả thẳng. Miss hoặc hết hạn thì đọc nguồn thật, rồi ghi kết quả vào cache để lần sau dùng lại.',
      },
      {
        hoi: 'Vì sao luồng GHI nên làm mất hiệu lực (xoá) cache thay vì ghi thẳng giá trị mới vào cache?',
        dap: 'Ghi thẳng vào cache dễ kẹt lại giá trị sai thứ tự khi có nhiều nơi cùng ghi gần như đồng thời. Xoá cache thì lần đọc kế tiếp luôn lấy đúng nguồn tại thời điểm đó, không thể sai thứ tự.',
      },
      {
        hoi: 'TTL đóng vai trò gì trong cache-aside, kể cả khi invalidate luôn được gọi đúng?',
        dap: 'Là lưới an toàn thứ hai: phòng trường hợp có chỗ nào đó quên gọi invalidate (bug, cập nhật CSDL trực tiếp bỏ qua app...). Hết TTL, cache tự coi như miss và đọc lại nguồn dù không ai xoá tay.',
      },
    ],
  },
  {
    id: 'p6-u103-l2',
    unitId: 'p6-u103',
    language: 'typescript',
    title: 'Cache stampede — cache vừa hết hạn, nguồn bị hàng nghìn request dồn vào cùng lúc',
    hook: 'Trang chủ có một mục cache TTL=60 giây, mỗi giây 2.000 request đọc mục đó. Giây thứ 60, cache hết hạn — và gần 2.000 request cùng thấy miss trong đúng khoảnh khắc đó, tất cả cùng dồn thẳng vào CSDL để tái tạo lại CÙNG MỘT giá trị. CSDL vốn xử lý ngon 2.000 req/giây khi có cache đỡ, giờ nhận nguyên 2.000 request THẬT CÙNG LÚC và sập.',
    theory:
      'CACHE STAMPEDE (còn gọi thundering herd) xảy ra khi một mục cache RẤT ĐƯỢC HỎI NHIỀU vừa hết hạn: thay vì một request âm thầm tái tạo lại cache, HÀNG LOẠT request cùng thấy miss trong cùng khoảnh khắc và cùng dồn vào nguồn — nguồn vốn được cache che chắn, giờ hứng trọn tải thật và có thể sập, kéo theo cache CÀNG không tái tạo được (nguồn quá tải, request nào cũng timeout), một vòng xoáy càng lúc càng tệ.\n\nCÁCH CHẶN: KHOÁ TÁI TẠO (rebuild lock / mutex tái tạo). Ý tưởng: khi một mục cache hết hạn, chỉ CHO PHÉP ĐÚNG MỘT request đi tái tạo (gọi nguồn, ghi lại cache) — mọi request khác đến trong lúc đó phải chọn một trong hai cách chờ:\n\n1. **Chờ đơn giản**: đứng đợi tới khi request giữ khoá tái tạo xong, rồi dùng luôn giá trị mới.\n2. **Trả tạm giá trị CŨ (stale-while-revalidate)**: trả ngay giá trị cache cũ (dù đã hết hạn) trong lúc chờ tái tạo, thay vì bắt người dùng chờ. Đánh đổi: người dùng thấy dữ liệu cũ thêm một nhịp, nhưng nguồn chỉ nhận ĐÚNG MỘT request thay vì hàng nghìn.\n\nDù chọn cách nào, điểm chung là: nguồn chỉ bị gọi MỘT LẦN cho mỗi lần hết hạn, bất kể có bao nhiêu request đang chờ. Với cache phân tán nhiều máy (Redis dùng chung), khoá này thường cài bằng `SETNX` (chỉ ghi được nếu key chưa tồn tại) kèm TTL riêng cho chính cái khoá — phòng trường hợp máy giữ khoá bị crash giữa chừng thì khoá cũng tự hết hạn, không kẹt vĩnh viễn.\n\nCÁI GÌ KHÔNG NÊN CACHE: dữ liệu đổi giá trị THEO TỪNG REQUEST (số dư ví đang trong giao dịch, kết quả random cá nhân hoá theo thời điểm) — cache sẽ trả nhầm cho request sau; và dữ liệu NHẠY CẢM RIÊNG TỪNG NGƯỜI DÙNG (token phiên, thông tin thanh toán, hồ sơ riêng tư) nếu cache dùng chung key không phân biệt người dùng — rò dữ liệu người này sang người khác là lỗi bảo mật nghiêm trọng, không phải lỗi hiệu năng.',
    workedExample: {
      code: `let soLanGoiNguon = 0 // đếm số lần "nguồn dữ liệu chậm" thực sự bị gọi

function nguonCham(): number {
  soLanGoiNguon++
  return 999 // giá trị mới sau khi tái tạo
}

const giaTriCu = 100 // giá trị cache CŨ, còn dùng tạm khi đang tái tạo (chỉ ở bản có khoá)

// KHÔNG khoá: cache vừa hết hạn, N request cùng lúc đều thấy miss -> ai cũng tự gọi nguồn.
function moPhongKhongKhoa(soRequest: number): number {
  for (let i = 0; i < soRequest; i++) {
    nguonCham() // mỗi request coi mình là người đầu tiên -> gọi nguồn riêng
  }
  return soLanGoiNguon
}

// CÓ khoá tái tạo: chỉ request ĐẦU TIÊN trong đợt được gọi nguồn; các request đến sau
// trong CÙNG đợt hết hạn thấy đang tái tạo (dangTaiLai=true) -> dùng tạm giá trị cũ.
function moPhongCoKhoa(soRequest: number): number {
  let dangTaiLai = false // khoá dùng CHUNG cho cả đợt N request đến cùng lúc
  for (let i = 0; i < soRequest; i++) {
    if (!dangTaiLai) {
      dangTaiLai = true // request đầu tiên giữ khoá, các request sau trong đợt sẽ thấy khoá này
      nguonCham() // chỉ request giữ khoá mới gọi nguồn thật
    }
    // else: request đến sau, thấy dangTaiLai=true -> dùng TẠM giaTriCu, không gọi nguồn
  }
  dangTaiLai = false // hết đợt, tái tạo xong, mở khoá cho đợt hết hạn KẾ TIẾP
  return soLanGoiNguon
}

soLanGoiNguon = 0
console.log("Khong khoa, 5 request cung luc goi nguon:", moPhongKhongKhoa(5))

soLanGoiNguon = 0
console.log("Co khoa, 5 request cung luc goi nguon:", moPhongCoKhoa(5))
console.log("Gia tri cu con dung tam:", giaTriCu)`,
      stdinLines: [],
    },
    predict: {
      code: `let demGoi = 0
function nguon(): number {
  demGoi++
  return 1
}

function moPhongCoKhoa(soRequest: number): number {
  let dangTaiLai = false
  for (let i = 0; i < soRequest; i++) {
    if (!dangTaiLai) {
      dangTaiLai = true
      nguon()
    }
  }
  dangTaiLai = false
  return demGoi
}

console.log(moPhongCoKhoa(8))`,
      question:
        'Có khoá tái tạo, 8 request cùng đến trong một đợt cache hết hạn. Số lần nguồn bị gọi in ra là bao nhiêu?',
      choices: ['8', '1', '0', '4'],
      answerIndex: 1,
      explain:
        'Kết quả là 1. Request đầu tiên thấy dangTaiLai=false, tự đặt thành true rồi gọi nguon() — đó là lần gọi DUY NHẤT. Bảy request còn lại trong cùng đợt thấy dangTaiLai đã là true nên bỏ qua nhánh gọi nguồn, dù vòng lặp vẫn chạy đủ 8 lần. Đây đúng là điều khoá tái tạo làm được: bất kể bao nhiêu request cùng đến, nguồn chỉ nhận đúng 1.',
    },
    parsons: {
      prompt: 'Xếp lại hàm mô phỏng khoá tái tạo — chỉ request GIỮ ĐƯỢC khoá mới gọi nguồn.',
      lines: [
        'function moPhongCoKhoa(soRequest: number): number {',
        '  let dangTaiLai = false',
        '  for (let i = 0; i < soRequest; i++) {',
        '    if (!dangTaiLai) {',
        '      dangTaiLai = true',
        '      nguonCham()',
        '    }',
        '  }',
        '  dangTaiLai = false',
        '  return soLanGoiNguon',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `moPhongCoKhoa(soRequest)` mô phỏng khoá tái tạo cho MỘT đợt cache hết hạn có `soRequest` request cùng đến:\n\n- Dùng một biến cờ `dangTaiLai` khởi tạo `false`, DÙNG CHUNG cho cả đợt.\n- Request nào thấy `dangTaiLai === false` thì: đặt `dangTaiLai = true` rồi gọi `nguonCham()` (hàm đã có sẵn, tự tăng biến đếm toàn cục `soLanGoiNguon`).\n- Request nào thấy `dangTaiLai === true` thì bỏ qua, KHÔNG gọi `nguonCham()`.\n- Sau khi xử lý hết `soRequest` request, đặt lại `dangTaiLai = false` (mở khoá cho đợt hết hạn kế tiếp) rồi trả về `soLanGoiNguon`.\n\nDùng đúng starter code có sẵn, không sửa phần dưới.',
      starterCode: `let soLanGoiNguon = 0

function nguonCham(): number {
  soLanGoiNguon++
  return 1
}

function moPhongCoKhoa(soRequest: number): number {
  // TODO: chỉ request GIỮ được khoá (dangTaiLai vẫn false) mới gọi nguonCham()
  return 0
}

// ---- Đừng sửa phần dưới đây ----
soLanGoiNguon = 0
console.log("3 request:", moPhongCoKhoa(3))
soLanGoiNguon = 0
console.log("10 request:", moPhongCoKhoa(10))
soLanGoiNguon = 0
console.log("1 request:", moPhongCoKhoa(1))
soLanGoiNguon = 0
console.log("0 request:", moPhongCoKhoa(0))`,
      testCases: [
        {
          stdinLines: [],
          expected: '3 request: 1',
          match: 'contains',
          hidden: false,
          label: '3 request cùng đợt -> nguồn chỉ bị gọi đúng 1 lần',
        },
        {
          stdinLines: [],
          expected: '10 request: 1',
          match: 'contains',
          hidden: false,
          label:
            'Đợt đông hơn (10 request) -> vẫn chỉ 1 lần, khoá không phụ thuộc số lượng request',
        },
        {
          stdinLines: [],
          expected: '1 request: 1',
          match: 'contains',
          hidden: false,
          label: 'Chỉ 1 request duy nhất -> vẫn phải gọi nguồn 1 lần (không phải 0)',
        },
        {
          stdinLines: [],
          expected: '0 request: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 0 request thì vòng lặp không chạy lần nào -> nguồn không bị gọi',
        },
      ],
      hints: [
        'Vòng lặp `for (let i = 0; i < soRequest; i++)` chạy đúng soRequest lần, không hơn không kém.',
        'Trong mỗi lần lặp: `if (!dangTaiLai) { dangTaiLai = true; nguonCham() }` — điều kiện chỉ đúng đúng MỘT lần duy nhất trong cả vòng lặp, vì ngay sau lần đầu dangTaiLai đã thành true.',
        'Đừng quên đặt lại `dangTaiLai = false` SAU vòng lặp (không phải bên trong) rồi mới return — nếu quên, không sao với test này vì mỗi lần gọi hàm là biến cục bộ mới, nhưng đúng bản chất thật (khoá phải mở lại cho đợt sau) thì vẫn nên có dòng đó.',
      ],
      sampleSolution: `let soLanGoiNguon = 0

function nguonCham(): number {
  soLanGoiNguon++
  return 1
}

function moPhongCoKhoa(soRequest: number): number {
  let dangTaiLai = false
  for (let i = 0; i < soRequest; i++) {
    if (!dangTaiLai) {
      dangTaiLai = true
      nguonCham()
    }
  }
  dangTaiLai = false
  return soLanGoiNguon
}

// ---- Đừng sửa phần dưới đây ----
soLanGoiNguon = 0
console.log("3 request:", moPhongCoKhoa(3))
soLanGoiNguon = 0
console.log("10 request:", moPhongCoKhoa(10))
soLanGoiNguon = 0
console.log("1 request:", moPhongCoKhoa(1))
soLanGoiNguon = 0
console.log("0 request:", moPhongCoKhoa(0))`,
    },
    homework:
      'Tra cứu lệnh `SET key value NX EX <giây>` của Redis (hoặc `SETNX` + `EXPIRE` cũ hơn) — đây chính là cách cài khoá tái tạo thật trong hệ thống phân tán nhiều máy: NX nghĩa là "chỉ ghi nếu key chưa tồn tại" (chỉ một máy giành được khoá), EX là TTL riêng của chính cái khoá (phòng máy giữ khoá bị crash thì khoá tự hết hạn, không kẹt vĩnh viễn). Rồi tự liệt kê: trong sản phẩm/hệ thống bạn biết, có mục dữ liệu nào rất được hỏi nhiều (trang chủ, bảng xếp hạng, giá vàng...) có nguy cơ bị stampede khi cache hết hạn không?',
    srsCards: [
      {
        hoi: 'Cache stampede là gì và vì sao nó nguy hiểm hơn một lượt tải chậm bình thường?',
        dap: 'Một mục cache rất được hỏi nhiều vừa hết hạn, hàng loạt request cùng thấy miss trong cùng khoảnh khắc và cùng dồn vào nguồn. Nguồn vốn được cache che chắn giờ hứng trọn tải thật, có thể sập, và sập rồi thì càng không tái tạo được cache — vòng xoáy tự làm tệ hơn.',
      },
      {
        hoi: 'Khoá tái tạo (rebuild lock) chặn stampede bằng cách nào?',
        dap: 'Khi cache hết hạn, chỉ cho ĐÚNG MỘT request đi tái tạo (gọi nguồn, ghi lại cache); các request khác đến cùng lúc phải chờ hoặc dùng tạm giá trị cũ (stale-while-revalidate), không được tự ý gọi nguồn.',
      },
      {
        hoi: 'Nêu hai loại dữ liệu KHÔNG nên cache và lý do.',
        dap: 'Dữ liệu đổi theo TỪNG request (số dư đang giao dịch) — cache sẽ trả nhầm cho request sau. Dữ liệu nhạy cảm RIÊNG từng người dùng (token, thanh toán) nếu dùng chung key — rò dữ liệu người này sang người khác, là lỗi bảo mật chứ không chỉ hiệu năng.',
      },
    ],
  },
]
