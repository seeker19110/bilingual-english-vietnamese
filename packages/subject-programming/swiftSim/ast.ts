// swiftSim/ast — CÂY CÚ PHÁP của bộ chạy Swift rút gọn (PR-M3).
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
  | { k: 'bool'; gia: boolean; vt: ViTri }
  | { k: 'nil'; vt: ViTri }
  | { k: 'ten'; ten: string; vt: ViTri }
  | { k: 'self'; vt: ViTri }
  | { k: 'mang'; phanTu: BieuThuc[]; vt: ViTri }
  | { k: 'tuDien'; cap: { khoa: BieuThuc; gia: BieuThuc }[]; vt: ViTri }
  | { k: 'donNguyen'; toan: '-' | '!'; ben: BieuThuc; vt: ViTri }
  | { k: 'nhiNguyen'; toan: string; trai: BieuThuc; phai: BieuThuc; vt: ViTri }
  | { k: 'khoang'; tu: BieuThuc; den: BieuThuc; kin: boolean; vt: ViTri }
  | { k: 'baNgoi'; dieuKien: BieuThuc; dung: BieuThuc; sai: BieuThuc; vt: ViTri }
  | { k: 'goi'; ham: BieuThuc; thamSo: { nhan?: string; gia: BieuThuc }[]; vt: ViTri }
  | { k: 'truyCap'; doiTuong: BieuThuc; ten: string; tuyChon: boolean; vt: ViTri }
  | { k: 'chiSo'; doiTuong: BieuThuc; khoa: BieuThuc; vt: ViTri }
  | { k: 'moBuoc'; ben: BieuThuc; vt: ViTri }
  | { k: 'thanhVienNgam'; ten: string; vt: ViTri }
  | { k: 'dong'; thamSo: ThamSo[]; than: Lenh[]; vt: ViTri }
  | { k: 'thu'; ben: BieuThuc; tuyChon: boolean; vt: ViTri }

// ───────────────────────────── Câu lệnh ─────────────────────────────

export interface ThamSo {
  /** Nhãn ngoài (Swift: `func f(nhan ten: Int)`); '_' nghĩa là gọi không cần nhãn. */
  nhan?: string
  ten: string
  kieu?: string
  macDinh?: BieuThuc
}

export interface KhaiBaoHam {
  ten: string
  thamSo: ThamSo[]
  kieuTra?: string
  than: Lenh[]
  nemLoi: boolean
  bienDoi: boolean
  tinh: boolean
  vt: ViTri
}

export interface ThuocTinh {
  ten: string
  kieu?: string
  khoiTao?: BieuThuc
  hangSo: boolean
  /** Thuộc tính TÍNH: `var x: Int { … }` — thân trả về giá trị, không lưu trữ. */
  than?: Lenh[]
  tinh: boolean
  vt: ViTri
}

export interface CaEnum {
  ten: string
  /** Giá trị thô (`case do = "do"`). */
  giaTriTho?: BieuThuc
  /** Số lượng giá trị kèm theo (`case diem(Int, Int)`) — bộ chạy chỉ cần biết có bao nhiêu. */
  kemTheo: string[]
}

export type Lenh =
  | { k: 'khaiBao'; ten: string; kieu?: string; gia?: BieuThuc; hangSo: boolean; vt: ViTri }
  | { k: 'gan'; dich: BieuThuc; toan: string; gia: BieuThuc; vt: ViTri }
  | { k: 'bieuThuc'; bt: BieuThuc; vt: ViTri }
  | { k: 'if'; dieuKien: DieuKien[]; than: Lenh[]; nguoc?: Lenh[]; vt: ViTri }
  | { k: 'guard'; dieuKien: DieuKien[]; nguoc: Lenh[]; vt: ViTri }
  | { k: 'while'; dieuKien: BieuThuc; than: Lenh[]; vt: ViTri }
  | { k: 'repeat'; than: Lenh[]; dieuKien: BieuThuc; vt: ViTri }
  | { k: 'for'; bien: string; nguon: BieuThuc; than: Lenh[]; vt: ViTri }
  | { k: 'switch'; gia: BieuThuc; ca: CaSwitch[]; macDinh?: Lenh[]; vt: ViTri }
  | { k: 'return'; gia?: BieuThuc; vt: ViTri }
  | { k: 'break'; vt: ViTri }
  | { k: 'continue'; vt: ViTri }
  | { k: 'throw'; gia: BieuThuc; vt: ViTri }
  | { k: 'do'; than: Lenh[]; bat: KhoiBat[]; vt: ViTri }
  | { k: 'ham'; ham: KhaiBaoHam; vt: ViTri }
  | { k: 'kieu'; kieu: KhaiBaoKieu; vt: ViTri }

/** Điều kiện của `if`/`guard`: hoặc một biểu thức bool, hoặc `let x = <optional>` (mở gói). */
export type DieuKien =
  { k: 'bt'; bt: BieuThuc } | { k: 'moGoi'; ten: string; gia: BieuThuc; hangSo: boolean }

export interface CaSwitch {
  /** Các mẫu của một `case` (Swift cho phép `case 1, 2:`). */
  mau: MauSwitch[]
  /** `where` lọc thêm. */
  loc?: BieuThuc
  than: Lenh[]
}

export type MauSwitch =
  | { k: 'gia'; bt: BieuThuc }
  | { k: 'buoc'; ten: string; buoc: string[] }
  | { k: 'buocNgam'; ten: string; buoc: string[] }

export interface KhoiBat {
  /** `catch let e as LoiX` — ten là `e`, kieu là `LoiX`; cả hai đều có thể vắng. */
  ten?: string
  kieu?: string
  than: Lenh[]
}

export interface KhaiBaoKieu {
  loai: 'struct' | 'class' | 'enum' | 'protocol'
  ten: string
  /** Kiểu cha / protocol tuân theo / kiểu thô của enum — Swift viết chung sau dấu ':'. */
  keThua: string[]
  thuocTinh: ThuocTinh[]
  ham: KhaiBaoHam[]
  khoiTao: KhaiBaoHam[]
  ca: CaEnum[]
  /** Yêu cầu của protocol: chỉ có chữ ký, không có thân. */
  yeuCau: { ten: string; thamSo: ThamSo[]; kieuTra?: string; bienDoi: boolean }[]
  vt: ViTri
}
