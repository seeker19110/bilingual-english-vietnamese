// shopData — MENU MẪU của dự án trục T1 "Cửa hàng của tôi", dùng cho API giả `/api/menu`
// ở bước cuối chặng P3 (PR-L8).
//
// Ba món + giá giữ ĐÚNG bộ đã dùng từ chặng P1/P2 (tra da 5000 · nuoc cam 15000 ·
// sua dau 10000) để dự án là MỘT sản phẩm tiến hoá, không phải ba đề rời nhau; thêm hai món
// mới cho danh sách đủ dài mà vẫn nhẩm tay được. Tên viết KHÔNG DẤU như mọi dòng chấm điểm
// của dự án (so chuỗi khỏi lệch dấu tiếng Việt).
//
// LƯU Ý KHI SỬA: đổi món/giá ở đây là phải sửa `expected` của các bước dự án P3 dùng API này
// (cổng projectStepsP3.test.ts chạy code mẫu thật nên sẽ đỏ ngay — không âm thầm sai).

/** Một món trong menu mà API `/api/menu` trả về. */
export interface MonCuaHang {
  ten: string
  gia: number
  nhom: string
}

export const MENU_CUA_HANG: MonCuaHang[] = [
  { ten: 'tra da', gia: 5000, nhom: 'uong' },
  { ten: 'nuoc cam', gia: 15000, nhom: 'uong' },
  { ten: 'sua dau', gia: 10000, nhom: 'uong' },
  { ten: 'ca phe sua', gia: 20000, nhom: 'uong' },
  { ten: 'banh mi', gia: 20000, nhom: 'an' },
]
