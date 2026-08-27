// kotlinSim/ast — CÂY CÚ PHÁP của bộ chạy Kotlin rút gọn (PR-M7).
//
// Chỉ khai kiểu, không có logic — để parser và interpreter cùng nhìn một hợp đồng, và để
// TypeScript bắt giúp mọi ca thiếu sót khi thêm cú pháp mới về sau.
//
// TẬP CON được mô tả ở đây là ĐÚNG những gì bộ chạy hứa: cái gì không có trong file này thì
// bộ chạy KHÔNG làm được, và bài học phải nói ra (hiến chương M §3.3 luật 2).

export interface ViTri {
  dong: number
}

// ───────────────────────────── Biểu thức ─────────────────────────────

export type BieuThuc =
  | { k: 'soNguyen'; gia: number; vt: ViTri }
  | { k: 'soThuc'; gia: number; vt: ViTri }
  | { k: 'chuoi'; manh: { loai: 'chu' | 'bieuThuc'; chu?: string; bt?: BieuThuc }[]; vt: ViTri }
  | { k: 'kyTu'; gia: string; vt: ViTri }
  | { k: 'bool'; gia: boolean; vt: ViTri }
  | { k: 'null'; vt: ViTri }
  | { k: 'ten'; ten: string; vt: ViTri }
  | { k: 'this'; vt: ViTri }
  | { k: 'super'; vt: ViTri }
  | { k: 'donNguyen'; toan: '-' | '!'; ben: BieuThuc; vt: ViTri }
  | { k: 'nhiNguyen'; toan: string; trai: BieuThuc; phai: BieuThuc; vt: ViTri }
  /** `a..b` (đóng), `a until b` (nửa mở), `a downTo b` (lùi), kèm `step n` nếu có. */
  | {
      k: 'khoang'
      tu: BieuThuc
      den: BieuThuc
      loai: 'den' | 'until' | 'downTo'
      buoc?: BieuThuc
      vt: ViTri
    }
  /** `if` của Kotlin LÀ BIỂU THỨC — đây là khác biệt lớn nhất so với Swift. */
  | { k: 'ifBt'; dieuKien: BieuThuc; dung: BieuThuc; sai: BieuThuc; vt: ViTri }
  | {
      k: 'goi'
      ham: BieuThuc
      thamSo: { nhan?: string; gia: BieuThuc }[]
      dongCuoi?: BieuThuc
      vt: ViTri
    }
  /** `?.` an toàn null hay `.` thường. */
  | { k: 'truyCap'; doiTuong: BieuThuc; ten: string; anToan: boolean; vt: ViTri }
  | { k: 'chiSo'; doiTuong: BieuThuc; khoa: BieuThuc; vt: ViTri }
  /** `!!` — ép mở null, dừng chương trình nếu đang là null. */
  | { k: 'epKhongNull'; ben: BieuThuc; vt: ViTri }
  /** `a ?: b` — toán tử Elvis. */
  | { k: 'elvis'; trai: BieuThuc; phai: BieuThuc; vt: ViTri }
  /** `x is Kieu` / `x !is Kieu`. */
  | { k: 'la'; ben: BieuThuc; kieu: string; phuDinh: boolean; vt: ViTri }
  /** `x as Kieu` / `x as? Kieu`. */
  | { k: 'ep'; ben: BieuThuc; kieu: string; anToan: boolean; vt: ViTri }
  /** Lambda `{ a, b -> ... }`; thamSo rỗng nghĩa là dùng `it`. */
  | { k: 'lambda'; thamSo: string[]; than: Lenh[]; vt: ViTri }
  /** `when` dùng như biểu thức. */
  | { k: 'whenBt'; chuDe?: BieuThuc; nhanh: NhanhWhen[]; macDinh?: Lenh[]; vt: ViTri }
  /** `try { } catch { }` dùng như biểu thức. */
  | { k: 'tryBt'; than: Lenh[]; bat: KhoiBat[]; cuoiCung?: Lenh[]; vt: ViTri }

// ───────────────────────────── Câu lệnh ─────────────────────────────

export interface ThamSo {
  ten: string
  kieu?: string
  macDinh?: BieuThuc
}

export interface KhaiBaoHam {
  ten: string
  thamSo: ThamSo[]
  kieuTra?: string
  /** Thân khối `{ … }`; với hàm một biểu thức (`fun f() = x`) thì là một lệnh `return`. */
  than: Lenh[]
  /** `override fun` — cần cho đa hình. */
  ghiDe: boolean
  /** `open fun` — Kotlin mặc định đóng, phải mở tường minh mới ghi đè được. */
  mo: boolean
  /** Yêu cầu của interface: chỉ có chữ ký, không thân. */
  truuTuong: boolean
  vt: ViTri
}

export interface ThuocTinh {
  ten: string
  kieu?: string
  khoiTao?: BieuThuc
  /** `val` là hằng, `var` là biến. */
  hangSo: boolean
  ghiDe: boolean
  /** Thuộc tính TÍNH: `val x: Int get() = …`. */
  than?: Lenh[]
  vt: ViTri
}

export interface CaEnum {
  ten: string
  /** Tham số truyền cho hàm dựng của enum (`DO("do", 1)`). */
  thamSo: BieuThuc[]
}

export type Lenh =
  | { k: 'khaiBao'; ten: string; kieu?: string; gia?: BieuThuc; hangSo: boolean; vt: ViTri }
  /** Khai báo huỷ cấu trúc: `val (a, b) = cap`. */
  | { k: 'khaiBaoRa'; ten: string[]; gia: BieuThuc; vt: ViTri }
  | { k: 'gan'; dich: BieuThuc; toan: string; gia: BieuThuc; vt: ViTri }
  | { k: 'bieuThuc'; bt: BieuThuc; vt: ViTri }
  | { k: 'if'; dieuKien: BieuThuc; than: Lenh[]; nguoc?: Lenh[]; vt: ViTri }
  | { k: 'while'; dieuKien: BieuThuc; than: Lenh[]; vt: ViTri }
  | { k: 'doWhile'; than: Lenh[]; dieuKien: BieuThuc; vt: ViTri }
  | { k: 'for'; bien: string[]; nguon: BieuThuc; than: Lenh[]; vt: ViTri }
  | { k: 'when'; chuDe?: BieuThuc; nhanh: NhanhWhen[]; macDinh?: Lenh[]; vt: ViTri }
  | { k: 'return'; gia?: BieuThuc; vt: ViTri }
  | { k: 'break'; vt: ViTri }
  | { k: 'continue'; vt: ViTri }
  | { k: 'throw'; gia: BieuThuc; vt: ViTri }
  | { k: 'try'; than: Lenh[]; bat: KhoiBat[]; cuoiCung?: Lenh[]; vt: ViTri }
  | { k: 'ham'; ham: KhaiBaoHam; vt: ViTri }
  | { k: 'kieu'; kieu: KhaiBaoKieu; vt: ViTri }

/**
 * Một nhánh của `when`.
 *
 * Kotlin cho hai dạng: có chủ đề (`when (x) { 1 -> … }`) và không chủ đề
 * (`when { x > 5 -> … }`). Với dạng có chủ đề, mẫu còn có thể là `in khoang` hoặc `is Kieu`.
 */
export interface NhanhWhen {
  mau: MauWhen[]
  than: Lenh[]
}

export type MauWhen =
  | { k: 'gia'; bt: BieuThuc }
  | { k: 'trong'; bt: BieuThuc; phuDinh: boolean }
  | { k: 'la'; kieu: string; phuDinh: boolean }
  /** Dạng không chủ đề: cả nhánh là một điều kiện bool. */
  | { k: 'dieuKien'; bt: BieuThuc }

export interface KhoiBat {
  ten: string
  kieu?: string
  than: Lenh[]
}

/** Một tham số của hàm dựng chính, có thể đồng thời khai luôn thuộc tính (`class A(val x: Int)`). */
export interface ThamSoDung extends ThamSo {
  /** `val`/`var` trong hàm dựng chính → tự thành thuộc tính. Không có thì chỉ là tham số. */
  laThuocTinh?: 'val' | 'var'
  ghiDe: boolean
}

export interface KhaiBaoKieu {
  loai: 'class' | 'interface' | 'object' | 'enum'
  ten: string
  /** `data class` — sinh sẵn toString/equals/copy/componentN. */
  laData: boolean
  /** `sealed class` — chỉ kế thừa được trong cùng tệp; dùng cho `when` vét cạn. */
  laSealed: boolean
  /** `open class` — Kotlin mặc định đóng, phải mở tường minh mới kế thừa được. */
  mo: boolean
  truuTuong: boolean
  thamSoDung: ThamSoDung[]
  /** Lớp cha kèm tham số truyền lên (`: Cha(x)`), và các interface tuân theo. */
  cha?: { ten: string; thamSo: BieuThuc[] }
  giaoDien: string[]
  thuocTinh: ThuocTinh[]
  ham: KhaiBaoHam[]
  /** Thân khối `init { … }`, chạy sau khi gán tham số hàm dựng. */
  khoiKhoiTao: Lenh[]
  ca: CaEnum[]
  /** `companion object { … }` — thành viên tĩnh, tra qua tên lớp. */
  dongHanh?: { thuocTinh: ThuocTinh[]; ham: KhaiBaoHam[] }
  vt: ViTri
}
