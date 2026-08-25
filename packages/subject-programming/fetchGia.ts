// fetchGia — Fetch GIẢ LẬP cho unit P3-U7 (PR-L7e), TÁCH RIÊNG khỏi fetchPrelude có chủ đích:
// file này KHÔNG import linkedom. Trang bài học chỉ cần FETCH_SHIM_JS để nhúng vào khung xem
// trang; nếu shim nằm chung file với bộ chạy linkedom (~94KB gzip) thì cả thư viện đó bị kéo
// vào bundle chính và nổ ngân sách Initial JS. linkedom chỉ được ở trong worker/cổng CI.
//
// MỘT NGUỒN DUY NHẤT, BA NƠI DÙNG — để không có khe hở "xanh ở CI, rớt ở người học":
//  1. Cổng CI (lessonsFetch.test.ts) và Worker chấm bài cùng gọi chayBaiFetch (fetchPrelude.ts),
//     bên trong dùng taoFetchGia() ở đây.
//  2. Khung XEM TRANG (iframe) nhúng FETCH_SHIM_JS — sinh từ ĐÚNG hàm taoFetchGia() bằng
//     .toString(), nên hành vi trong iframe không thể lệch với hành vi lúc chấm.
// Vì lẽ đó taoFetchGia() phải TỰ CHỨA (không tham chiếu gì ngoài tham số của nó) — sửa hàm
// này thì giữ nguyên ràng buộc đó, test 'FETCH_SHIM_JS tự chứa' sẽ nhắc nếu quên.
import { THOI_TIET_63_TINH, type TinhThoiTiet } from './weatherData.js'

/** Hình dạng Response rút gọn mà fetch giả trả về — đủ cho những gì bài học dạy. */
export interface ResponseGia {
  ok: boolean
  status: number
  json(): Promise<unknown>
  text(): Promise<string>
}

/**
 * Tạo fetch giả phục vụ bộ dữ liệu thời tiết. API mẫu:
 *   /api/thoi-tiet                → 200, mảng đủ 63 tỉnh {ten, nhietDo, troi}
 *   /api/thoi-tiet?tinh=<tên>    → 200 một tỉnh, hoặc 404 {error} nếu không có
 *   địa chỉ khác                  → reject TypeError (giống hệt lỗi mạng của fetch thật)
 *
 * RÀNG BUỘC: hàm TỰ CHỨA — chỉ dùng tham số `data` và API chuẩn của JavaScript, vì source
 * của nó được nhúng nguyên văn vào iframe qua FETCH_SHIM_JS (xem đầu file).
 */
export function taoFetchGia(data: TinhThoiTiet[]): (url: string) => Promise<ResponseGia> {
  // Giữ dữ liệu dưới dạng chuỗi JSON: mỗi lần gọi parse ra bản MỚI, học viên có lỡ sửa
  // object nhận được cũng không làm bẩn dữ liệu của lần gọi sau.
  const goc = JSON.stringify(data)
  return function fetchGia(url: string): Promise<ResponseGia> {
    const taoResponse = (status: number, body: unknown): ResponseGia => ({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(JSON.parse(JSON.stringify(body))),
      text: () => Promise.resolve(JSON.stringify(body)),
    })

    // Chấp nhận cả đường dẫn tương đối lẫn tuyệt đối — cắt bỏ phần https://host nếu có.
    const duongDan = String(url).replace(/^https?:\/\/[^/]+/, '')
    const dauHoi = duongDan.indexOf('?')
    const path = dauHoi === -1 ? duongDan : duongDan.slice(0, dauHoi)
    if (path !== '/api/thoi-tiet') {
      return Promise.reject(
        new TypeError(
          'Sandbox hoc tap khong co mang that — chi goi duoc API mau "/api/thoi-tiet" ' +
            '(hoac "/api/thoi-tiet?tinh=<ten tinh>"). Ban vua goi: ' +
            String(url),
        ),
      )
    }

    const danhSach = JSON.parse(goc) as TinhThoiTiet[]
    if (dauHoi === -1) return Promise.resolve(taoResponse(200, danhSach))

    // Có query: chỉ hiểu tham số tinh=<tên> (tên có dấu được URL-encode bởi trình duyệt).
    let tinh = ''
    for (const cap of duongDan.slice(dauHoi + 1).split('&')) {
      if (cap.startsWith('tinh=')) {
        tinh = decodeURIComponent(cap.slice(5).replace(/\+/g, ' ')).trim()
      }
    }
    const khop = danhSach.find((t) => t.ten.toLowerCase() === tinh.toLowerCase())
    if (!khop) {
      return Promise.resolve(
        taoResponse(404, { error: 'Khong tim thay tinh "' + tinh + '" trong du lieu' }),
      )
    }
    return Promise.resolve(taoResponse(200, khop))
  }
}

/**
 * Đoạn script nhúng vào ĐẦU khung xem trang (iframe) của bài fetch: định nghĩa `fetch` giả
 * che fetch thật trong phạm vi script, từ CHÍNH source của taoFetchGia() — một nguồn duy nhất.
 */
export const FETCH_SHIM_JS =
  // Dòng đệm __name: vài toolchain (esbuild bật keepNames — tsx, có thể cả test runner) chèn
  // lời gọi helper __name(...) vào source lấy ra bằng .toString(); trong iframe không ai định
  // nghĩa nó. Đệm một hàm no-op cùng tên (chỉ khi chưa có) thì source nào cũng chạy được.
  'var __name = typeof __name === "function" ? __name : ((fn) => fn);\n' +
  'const fetch = (' +
  taoFetchGia.toString() +
  ')(' +
  JSON.stringify(THOI_TIET_63_TINH) +
  ');\n'
