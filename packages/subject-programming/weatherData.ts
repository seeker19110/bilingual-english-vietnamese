// weatherData — Bộ dữ liệu MẪU "thời tiết 63 tỉnh thành" cho unit P3-U7 Fetch API (PR-L7e).
//
// Đây là DỮ LIỆU HỌC TẬP, không phải thời tiết thật: sandbox học tập không có mạng, nên
// "API thời tiết" là một fake fetch (fetchPrelude.ts) phục vụ đúng bộ dữ liệu này. Nhiệt độ
// và trạng thái trời sinh DETERMINISTIC theo vị trí trong danh sách — không Math.random(),
// vì test-case của bài học phải chấm được trên giá trị cố định.
//
// Danh sách dùng 63 tỉnh thành theo phân cấp TRƯỚC đợt sáp nhập 2025 — chủ ý giữ đúng đề bài
// của đặc tả môn ("Trang tra thời tiết 63 tỉnh thành", dac-ta-mon-lap-trinh-2026-08-24.md §4):
// đây là bộ dữ liệu mẫu kinh điển, bài học có ghi chú rõ cho học viên.

/** Một dòng dữ liệu API trả về cho học viên. */
export interface TinhThoiTiet {
  ten: string
  nhietDo: number
  troi: string
}

const TEN_63_TINH = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cần Thơ',
  'Cao Bằng',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'TP. Hồ Chí Minh',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
]

const TRANG_THAI_TROI = ['nắng', 'nhiều mây', 'mưa rào', 'có giông']

/** 63 dòng dữ liệu, giá trị cố định (18–35°C, 4 trạng thái trời xoay vòng). */
export const THOI_TIET_63_TINH: TinhThoiTiet[] = TEN_63_TINH.map((ten, i) => ({
  ten,
  nhietDo: 18 + ((i * 7) % 18),
  troi: TRANG_THAI_TROI[i % TRANG_THAI_TROI.length]!,
}))
