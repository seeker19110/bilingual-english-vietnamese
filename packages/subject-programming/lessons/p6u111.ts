// lessons/p6u111.ts — P6-U111: HƯỚNG WEB, chặng S2 — API HTTP tử tế (module `web-s2-m1`).
//
// Hai bài: l1 CHỌN ĐÚNG MÃ TRẠNG THÁI theo hành động + kết quả (không đoán, không luôn trả
// 200); l2 PHÂN TRANG + IDEMPOTENCY KEY (client bấm gửi lại một yêu cầu POST vì mất mạng —
// server phải nhận ra đây là YÊU CẦU CŨ, không tạo đơn hàng thứ hai).
//
// Mọi giá trị số trong theory/predict/testCases đã chạy thật qua tsc --strict + node trước
// khi soạn, không suy đoán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U111_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u111-l1',
    unitId: 'p6-u111',
    language: 'typescript',
    title: 'Mã trạng thái HTTP — máy khách đọc SỐ, không đọc câu chữ tiếng Việt',
    hook: 'Bạn viết API, mọi trường hợp đều trả về 200 kèm { "loi": "Không tìm thấy đơn hàng" }. Ứng dụng di động của đối tác gọi API bạn — code của họ chỉ kiểm `if (response.status === 200)` rồi coi là THÀNH CÔNG, hiển thị "Đặt hàng thành công!" cho một đơn hàng KHÔNG HỀ TỒN TẠI. Máy không đọc được câu tiếng Việt trong body — nó chỉ tin con số.',
    theory:
      'MÃ TRẠNG THÁI HTTP (status code) là ngôn ngữ chung MÁY ĐỌC ĐƯỢC giữa server và mọi máy khách — trình duyệt, app di động, một server khác gọi API bạn. Trả sai mã, dù body có giải thích đúng bằng tiếng Việt, vẫn là một API HỎNG — vì máy khách quyết định luồng xử lý (thành công/thất bại/thử lại) dựa trên CON SỐ, không đọc chuỗi.\n\nBốn nhóm cần nhớ (chữ số đầu tiên nói nhóm):\n\n- 2xx THÀNH CÔNG — nhưng KHÔNG PHẢI lúc nào cũng là 200: 200 (OK, có dữ liệu trả về — GET/PUT/PATCH thành công), 201 (Created — POST tạo tài nguyên mới thành công, nên kèm địa chỉ tài nguyên vừa tạo), 204 (No Content — DELETE thành công nhưng không có gì để trả về, body rỗng).\n- 4xx LỖI DO PHÍA NGƯỜI GỌI — người gọi phải SỬA yêu cầu rồi mới gọi lại được: 400 (Bad Request — dữ liệu gửi lên sai định dạng/thiếu trường bắt buộc), 404 (Not Found — tài nguyên không tồn tại), 409 (Conflict — yêu cầu hợp lệ nhưng xung đột với trạng thái hiện tại, ví dụ tạo tài khoản với email ĐÃ CÓ NGƯỜI DÙNG).\n- 5xx LỖI DO PHÍA SERVER — người gọi không sửa được gì, lỗi nằm ở server (crash, hết kết nối CSDL).\n\nSự khác biệt quan trọng nhất giữa 4xx và 5xx: máy khách THỬ LẠI (retry) một lỗi 5xx thường hợp lý (server có thể đã hồi phục), nhưng thử lại một lỗi 4xx y hệt yêu cầu cũ chỉ nhận lại đúng lỗi đó — vô ích, thậm chí có hại nếu request đó có tác dụng phụ.\n\nMỘT LỖI HAY GẶP: luôn trả 200 cho mọi trường hợp rồi nhét lỗi vào trong body JSON (`{ "loi": "..." }`). Cách này BUỘC mọi máy khách phải tự parse body để biết thành hay bại — trong khi HTTP đã có sẵn một kênh chuẩn hoá cho đúng việc đó.',
    workedExample: {
      code: `type HanhDong = "tao" | "sua" | "xoa" | "doc"
type KetQua = "thanhCong" | "khongTonTai" | "khongHopLe" | "daTonTai"

function chonMaTrangThai(hanhDong: HanhDong, ketQua: KetQua): number {
  if (ketQua === "khongHopLe") return 400
  if (ketQua === "khongTonTai") return 404
  if (ketQua === "daTonTai") return 409
  if (hanhDong === "tao") return 201
  if (hanhDong === "xoa") return 204
  return 200
}

console.log(chonMaTrangThai("tao", "thanhCong"))   // POST thanh cong -> 201
console.log(chonMaTrangThai("xoa", "thanhCong"))   // DELETE thanh cong -> 204
console.log(chonMaTrangThai("sua", "thanhCong"))   // PATCH thanh cong -> 200
console.log(chonMaTrangThai("doc", "khongTonTai")) // GET mot ID khong co -> 404
console.log(chonMaTrangThai("tao", "daTonTai"))    // POST trung email -> 409`,
      stdinLines: [],
    },
    predict: {
      code: `type HanhDong = "tao" | "sua" | "xoa" | "doc"
type KetQua = "thanhCong" | "khongTonTai" | "khongHopLe" | "daTonTai"

function chonMaTrangThai(hanhDong: HanhDong, ketQua: KetQua): number {
  if (ketQua === "khongHopLe") return 400
  if (ketQua === "khongTonTai") return 404
  if (ketQua === "daTonTai") return 409
  if (hanhDong === "tao") return 201
  if (hanhDong === "xoa") return 204
  return 200
}

console.log(chonMaTrangThai("sua", "khongTonTai"))`,
      question: 'PATCH (sửa) một đơn hàng KHÔNG TỒN TẠI. Hàm trả về mã nào?',
      choices: ['404', '200', '400', '204'],
      answerIndex: 0,
      explain:
        'Kết quả là 404. Điều kiện kiểm `ketQua === "khongTonTai"` đứng TRƯỚC mọi nhánh xét theo `hanhDong`, nên dù hành động là "sửa" (bình thường trả 200), việc tài nguyên không tồn tại luôn thắng trước — 404 áp dụng cho mọi hành động nhắm vào một tài nguyên không có, không riêng GET.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm chọn mã trạng thái — chú ý thứ tự kiểm: lỗi trước, rồi mới tới hành động thành công.',
      lines: [
        'function chonMaTrangThai(hanhDong: HanhDong, ketQua: KetQua): number {',
        '  if (ketQua === "khongHopLe") return 400',
        '  if (ketQua === "khongTonTai") return 404',
        '  if (ketQua === "daTonTai") return 409',
        '  if (hanhDong === "tao") return 201',
        '  if (hanhDong === "xoa") return 204',
        '  return 200',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm phanLoaiKetQuaApi(danhSachYeuCau) chấm mã trạng thái cho một loạt yêu cầu.\n\n- Dùng lại đúng luật của chonMaTrangThai(hanhDong, ketQua) ở ví dụ mẫu (viết lại cả hàm).\n- danhSachYeuCau là mảng các cặp [hanhDong, ketQua] (kiểu [HanhDong, KetQua][]).\n- Với mỗi cặp, gọi chonMaTrangThai rồi đẩy mã trạng thái (number) vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `type HanhDong = "tao" | "sua" | "xoa" | "doc"
type KetQua = "thanhCong" | "khongTonTai" | "khongHopLe" | "daTonTai"

function chonMaTrangThai(hanhDong: HanhDong, ketQua: KetQua): number {
  // TODO: kiem loi truoc (khongHopLe -> 400, khongTonTai -> 404, daTonTai -> 409),
  // roi moi xet hanh dong thanh cong (tao -> 201, xoa -> 204, con lai -> 200)
  return 0
}

function phanLoaiKetQuaApi(danhSachYeuCau: [HanhDong, KetQua][]): number[] {
  // TODO: voi moi cap [hanhDong, ketQua], goi chonMaTrangThai va gom ket qua theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const YEU_CAU: [HanhDong, KetQua][] = [
  ["tao", "thanhCong"],
  ["xoa", "thanhCong"],
  ["sua", "thanhCong"],
  ["doc", "khongTonTai"],
  ["tao", "daTonTai"],
  ["sua", "khongHopLe"],
]
console.log(JSON.stringify(phanLoaiKetQuaApi(YEU_CAU)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '[201,204,200,404,409,400]',
          match: 'contains',
          hidden: false,
          label:
            'Sáu yêu cầu phân loại đúng theo thứ tự: tạo→201, xoá→204, sửa→200, đọc thiếu→404, tạo trùng→409, sửa sai định dạng→400',
        },
        {
          stdinLines: [],
          expected: '409',
          match: 'contains',
          hidden: false,
          label: 'daTonTai luôn thắng thành 409 dù hành động là gì',
        },
        {
          stdinLines: [],
          expected: '[201,204,200,404,409,400]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kiểm cả mảng đầy đủ khớp thứ tự — không hardcode một mã riêng lẻ',
        },
      ],
      hints: [
        'Bên trong chonMaTrangThai: kiểm ketQua trước tiên (400/404/409), vì lỗi phải THẮNG bất kể hành động là gì.',
        'Chỉ khi ketQua === "thanhCong" (đi hết qua ba if lỗi mà không return) mới xét tới hanhDong để chọn 201/204/200.',
        'phanLoaiKetQuaApi: dùng vòng lặp, mỗi phần tử là const [hanhDong, ketQua] = cap, rồi push chonMaTrangThai(hanhDong, ketQua).',
      ],
      sampleSolution: `type HanhDong = "tao" | "sua" | "xoa" | "doc"
type KetQua = "thanhCong" | "khongTonTai" | "khongHopLe" | "daTonTai"

function chonMaTrangThai(hanhDong: HanhDong, ketQua: KetQua): number {
  if (ketQua === "khongHopLe") return 400
  if (ketQua === "khongTonTai") return 404
  if (ketQua === "daTonTai") return 409
  if (hanhDong === "tao") return 201
  if (hanhDong === "xoa") return 204
  return 200
}

function phanLoaiKetQuaApi(danhSachYeuCau: [HanhDong, KetQua][]): number[] {
  const ketQua: number[] = []
  for (const [hanhDong, kq] of danhSachYeuCau) {
    ketQua.push(chonMaTrangThai(hanhDong, kq))
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const YEU_CAU: [HanhDong, KetQua][] = [
  ["tao", "thanhCong"],
  ["xoa", "thanhCong"],
  ["sua", "thanhCong"],
  ["doc", "khongTonTai"],
  ["tao", "daTonTai"],
  ["sua", "khongHopLe"],
]
console.log(JSON.stringify(phanLoaiKetQuaApi(YEU_CAU)))`,
    },
    homework:
      'Mở một API bạn hay dùng thật (ứng dụng ngân hàng, app đặt đồ ăn, mạng xã hội — mở DevTools tab Network khi dùng app trên trình duyệt). Tìm MỘT lần gọi API trả về khác 200 — ghi lại mã trạng thái và đoán vì sao (400? 401? 404?). Nếu tìm mãi chỉ thấy toàn 200, thử một hành động CỐ TÌNH sai (đăng nhập sai mật khẩu, gửi form thiếu trường) rồi xem mã trả về là gì.',
    srsCards: [
      {
        hoi: 'Vì sao trả 200 kèm { "loi": "..." } trong body là một API hỏng, dù nội dung lỗi viết đúng?',
        dap: 'Máy khách quyết định luồng xử lý (thành công/thất bại/thử lại) dựa vào MÃ TRẠNG THÁI, không phải đọc chuỗi trong body — 200 luôn có nghĩa "thành công" với mọi máy khách chuẩn, bất kể body viết gì.',
      },
      {
        hoi: '201, 204, 200 khác nhau ở đâu dù đều là "thành công"?',
        dap: '201 = tạo mới thành công (POST, nên kèm địa chỉ tài nguyên vừa tạo); 204 = thành công nhưng không có gì để trả về (DELETE); 200 = thành công và có dữ liệu trả về (GET/PUT/PATCH).',
      },
      {
        hoi: 'Vì sao máy khách thử lại (retry) một lỗi 5xx thường hợp lý, nhưng thử lại 4xx thì vô ích?',
        dap: '5xx là lỗi phía server — server có thể đã hồi phục nên thử lại có cơ hội thành công. 4xx là lỗi do chính yêu cầu gửi lên (thiếu trường, sai định dạng) — gửi lại y hệt yêu cầu cũ chỉ nhận lại đúng lỗi đó, phải SỬA yêu cầu trước.',
      },
    ],
  },
  {
    id: 'p6-u111-l2',
    unitId: 'p6-u111',
    language: 'typescript',
    title: 'Phân trang & Idempotency-Key — chống bấm gửi hai lần thành hai đơn hàng',
    hook: 'Người dùng bấm "Đặt hàng" trên mạng chập chờn. Ứng dụng không thấy phản hồi trong 3 giây, tự động GỬI LẠI y hệt yêu cầu đó. Nếu server không có cách nào phân biệt "đây là yêu cầu CŨ gửi lại" với "đây là một đơn hàng MỚI", khách hàng sẽ bị trừ tiền hai lần cho một món hàng.',
    theory:
      'Hai vấn đề tách biệt nhưng cùng thuộc "thiết kế API HTTP tử tế":\n\nPHÂN TRANG (pagination): danh sách 10.000 đơn hàng không thể trả về trong MỘT lần gọi — chậm, tốn băng thông, và client chỉ hiển thị được vài chục dòng trên màn hình cùng lúc. Phân trang cắt danh sách thành từng TRANG theo số trang (1-based, trang 1 là trang đầu tiên người dùng thấy) và kích thước trang: vị trí bắt đầu = (trang - 1) × kích_thước.\n\nIDEMPOTENCY-KEY: một thao tác được gọi là IDEMPOTENT nếu gọi nó NHIỀU LẦN với cùng đầu vào cho ra đúng MỘT kết quả (không tạo thêm tác dụng phụ ở lần gọi thứ hai trở đi). GET tự nhiên idempotent (đọc không đổi gì). Nhưng POST tạo đơn hàng thì KHÔNG — gọi hai lần tạo hai đơn hàng thật, đúng như tên gọi "tạo" ngụ ý.\n\nGiải pháp chuẩn ngành: client tự sinh một IDEMPOTENCY-KEY duy nhất (thường là UUID) cho MỖI Ý ĐỊNH thao tác, gửi kèm trong header. Nếu mạng lỗi và client GỬI LẠI, nó gửi lại CÙNG key đó (không sinh key mới — đây là điểm hay nhầm nhất: sinh key mới ở lần gửi lại sẽ vô hiệu hoá toàn bộ cơ chế). Server LƯU LẠI kết quả đã xử lý theo key: thấy key đã xử lý rồi thì TRẢ LẠI kết quả CŨ, không chạy lại logic tạo đơn hàng lần nữa.\n\nĐây chính là khái niệm IDEMPOTENT đã học ở hướng Backend (hàng đợi at-least-once) — áp dụng sang một ngữ cảnh khác: không phải hàng đợi tin nhắn, mà là một request HTTP có thể bị gửi lại bởi chính trình duyệt hoặc app di động khi mất kết nối.',
    workedExample: {
      code: `function phanTrang<T>(danhSach: T[], trang: number, kichThuoc: number): T[] {
  const batDau = (trang - 1) * kichThuoc
  return danhSach.slice(batDau, batDau + kichThuoc)
}

const DON_HANG = [1, 2, 3, 4, 5, 6, 7]
console.log(JSON.stringify(phanTrang(DON_HANG, 2, 3))) // trang 2, moi trang 3 phan tu
console.log(JSON.stringify(phanTrang(DON_HANG, 3, 3))) // trang cuoi, khong du 3 phan tu

function xuLyYeuCauIdempotent(
  key: string,
  cache: Map<string, string>,
  taoKetQuaMoi: () => string
): { ketQua: string; daXuLyTruoc: boolean } {
  if (cache.has(key)) {
    return { ketQua: cache.get(key)!, daXuLyTruoc: true }
  }
  const kq = taoKetQuaMoi()
  cache.set(key, kq)
  return { ketQua: kq, daXuLyTruoc: false }
}

const cache = new Map<string, string>()
let soDonDaTao = 0
const taoDon = () => { soDonDaTao++; return \`don-\${soDonDaTao}\` }

console.log(JSON.stringify(xuLyYeuCauIdempotent("key-abc", cache, taoDon)))
console.log(JSON.stringify(xuLyYeuCauIdempotent("key-abc", cache, taoDon))) // gui lai CUNG key
console.log("So don THAT da tao:", soDonDaTao)`,
      stdinLines: [],
    },
    predict: {
      code: `function xuLyYeuCauIdempotent(
  key: string,
  cache: Map<string, string>,
  taoKetQuaMoi: () => string
): { ketQua: string; daXuLyTruoc: boolean } {
  if (cache.has(key)) {
    return { ketQua: cache.get(key)!, daXuLyTruoc: true }
  }
  const kq = taoKetQuaMoi()
  cache.set(key, kq)
  return { ketQua: kq, daXuLyTruoc: false }
}

const cache = new Map<string, string>()
let dem = 0
const taoDon = () => { dem++; return \`don-\${dem}\` }
xuLyYeuCauIdempotent("key-xyz", cache, taoDon)
xuLyYeuCauIdempotent("key-xyz", cache, taoDon)
xuLyYeuCauIdempotent("key-xyz", cache, taoDon)
console.log(dem)`,
      question:
        'Cùng MỘT key gọi 3 lần liên tiếp. Số đơn hàng THẬT được tạo (biến dem) là bao nhiêu?',
      choices: ['1', '3', '0', '2'],
      answerIndex: 0,
      explain:
        'Kết quả là 1. Lần gọi đầu tiên cache chưa có key nên chạy taoDon() thật, tăng dem lên 1 và LƯU kết quả vào cache. Hai lần gọi sau, cache.has(key) đã đúng nên hàm return NGAY kết quả cũ, không bao giờ chạy tới taoKetQuaMoi() — dem không tăng thêm. Đây chính là mục đích của idempotency key: dù client gọi lại bao nhiêu lần, tác dụng phụ (tạo đơn hàng thật) chỉ xảy ra ĐÚNG MỘT LẦN.',
    },
    parsons: {
      prompt: 'Xếp lại hàm xử lý yêu cầu idempotent — kiểm cache trước, chỉ tạo mới khi chưa có.',
      lines: [
        'function xuLyYeuCauIdempotent(key, cache, taoKetQuaMoi) {',
        '  if (cache.has(key)) {',
        '    return { ketQua: cache.get(key), daXuLyTruoc: true }',
        '  }',
        '  const kq = taoKetQuaMoi()',
        '  cache.set(key, kq)',
        '  return { ketQua: kq, daXuLyTruoc: false }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hai hàm.\n\n- phanTrang(danhSach, trang, kichThuoc): trả về đoạn của danhSach ứng với trang (1-based) — vị trí bắt đầu = (trang - 1) × kichThuoc, dùng slice(batDau, batDau + kichThuoc).\n- xuLyNhieuYeuCau(danhSachKey, taoKetQuaMoi): nhận một mảng key (string[], có thể lặp lại), một Map cache RỖNG tự tạo bên trong hàm; với MỖI key theo đúng thứ tự trong mảng, xử lý idempotent y như ví dụ mẫu rồi đẩy chỉ riêng trường ketQua vào mảng trả về (string[]).',
      starterCode: `function phanTrang<T>(danhSach: T[], trang: number, kichThuoc: number): T[] {
  // TODO: batDau = (trang - 1) * kichThuoc, tra ve danhSach.slice(batDau, batDau + kichThuoc)
  return []
}

function xuLyNhieuYeuCau(danhSachKey: string[], taoKetQuaMoi: () => string): string[] {
  // TODO: tao Map cache rong; voi moi key, neu cache co roi thi lay ket qua cu,
  // khong thi goi taoKetQuaMoi() va luu vao cache; day ketQua vao mang tra ve
  return []
}

// ---- Đừng sửa phần dưới đây ----
console.log(JSON.stringify(phanTrang([1, 2, 3, 4, 5, 6, 7], 2, 3)))
let dem = 0
const taoDon = () => { dem++; return \`don-\${dem}\` }
console.log(JSON.stringify(xuLyNhieuYeuCau(["k1", "k1", "k2", "k1"], taoDon)))
console.log("dem:", dem)`,
      testCases: [
        {
          stdinLines: [],
          expected: '[4,5,6]',
          match: 'contains',
          hidden: false,
          label: 'Trang 2, kích thước 3, trên 7 phần tử → phần tử thứ 4,5,6',
        },
        {
          stdinLines: [],
          expected: '["don-1","don-1","don-2","don-1"]',
          match: 'contains',
          hidden: false,
          label: 'k1 lặp lại 3 lần chỉ tạo MỘT don-1 thật, k2 tạo don-2 riêng',
        },
        {
          stdinLines: [],
          expected: 'dem: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỉ 2 key KHÁC NHAU (k1, k2) trong 4 lần gọi → chỉ 2 đơn thật được tạo',
        },
      ],
      hints: [
        'phanTrang: batDau = (trang - 1) * kichThuoc — trang 1 thì batDau = 0, đúng như slice thường dùng.',
        'xuLyNhieuYeuCau: khai báo const cache = new Map<string, string>() NGAY ĐẦU hàm — mỗi lần gọi hàm là một cache mới, không giữ giữa các lần gọi khác nhau.',
        'Với mỗi key trong vòng lặp: if (cache.has(key)) lấy cache.get(key)!, ngược lại gọi taoKetQuaMoi() rồi cache.set(key, kq) trước khi push.',
      ],
      sampleSolution: `function phanTrang<T>(danhSach: T[], trang: number, kichThuoc: number): T[] {
  const batDau = (trang - 1) * kichThuoc
  return danhSach.slice(batDau, batDau + kichThuoc)
}

function xuLyNhieuYeuCau(danhSachKey: string[], taoKetQuaMoi: () => string): string[] {
  const cache = new Map<string, string>()
  const ketQua: string[] = []
  for (const key of danhSachKey) {
    if (cache.has(key)) {
      ketQua.push(cache.get(key)!)
    } else {
      const kq = taoKetQuaMoi()
      cache.set(key, kq)
      ketQua.push(kq)
    }
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
console.log(JSON.stringify(phanTrang([1, 2, 3, 4, 5, 6, 7], 2, 3)))
let dem = 0
const taoDon = () => { dem++; return \`don-\${dem}\` }
console.log(JSON.stringify(xuLyNhieuYeuCau(["k1", "k1", "k2", "k1"], taoDon)))
console.log("dem:", dem)`,
    },
    homework:
      'Tìm trong tài liệu API của một dịch vụ thanh toán thật (Stripe, hoặc SePay mà dự án này đang dùng — đọc `docs/research/dac-ta-thanh-toan-2026-07-25.md`) xem họ có cơ chế chống gửi trùng yêu cầu thanh toán không, và họ gọi nó là gì. So sánh với idempotency key vừa học: giống hay khác cơ chế nào?',
    srsCards: [
      {
        hoi: 'Vì sao client GỬI LẠI yêu cầu (retry) phải dùng CÙNG idempotency key, không sinh key mới?',
        dap: 'Idempotency key là cách SERVER nhận ra "đây là cùng một Ý ĐỊNH thao tác đã gửi trước đó". Sinh key mới ở lần gửi lại khiến server coi đó là một yêu cầu HOÀN TOÀN MỚI, chạy lại logic tạo đơn hàng lần nữa — đúng thứ cơ chế này sinh ra để ngăn.',
      },
      {
        hoi: 'Công thức tính vị trí bắt đầu khi phân trang (trang 1-based) là gì?',
        dap: 'batDau = (trang - 1) × kichThuoc. Trang 1 cho batDau = 0 (đúng vị trí đầu mảng); trang 2 với kích thước 3 cho batDau = 3 (bỏ qua 3 phần tử của trang 1).',
      },
      {
        hoi: 'GET có cần idempotency key không? Vì sao?',
        dap: 'Không cần — GET tự nhiên đã IDEMPOTENT: đọc dữ liệu không tạo tác dụng phụ, gọi lại nhiều lần với cùng tham số luôn cho cùng kết quả (trừ khi dữ liệu đổi giữa các lần đọc, nhưng đó không phải do chính hành động GET gây ra).',
      },
    ],
  },
]
