// samplesP1 — 10 bài Python mẫu bậc P1 cho trang "Chạy thử" (PR-L2).
// Mỗi bài khớp một unit P1 trong curriculum.ts, code THẬT chạy được trong sandbox Pyodide.
// Đây là bài mẫu để vọc — bài học tương tác đầy đủ (khuôn 8 bước) vào ở PR-L3/L4.

export interface PythonSample {
  /** Trùng id unit P1 tương ứng (curriculum.ts) — 'p1-u1'..'p1-u10'. */
  id: string
  title: string
  code: string
  /** Dữ liệu điền sẵn cho input() — mỗi phần tử một lần input(). */
  stdinLines: string[]
}

export const P1_SAMPLES: PythonSample[] = [
  {
    id: 'p1-u1',
    title: 'Chào bạn — chương trình đầu tiên',
    code: `# Chương trình đầu tiên: máy tính in ra lời chào
print("Xin chào! Đây là chương trình Python đầu tiên của mình.")
print("Lập trình = ra lệnh cho máy tính làm việc, từng dòng một.")
`,
    stdinLines: [],
  },
  {
    id: 'p1-u2',
    title: 'Đổi tiền USD → VND',
    code: `# Biến lưu giá trị, phép toán làm việc với biến
ty_gia = 25400          # 1 USD đổi được bao nhiêu VND
so_usd = 50
so_vnd = so_usd * ty_gia
print("Bạn có", so_usd, "USD")
print("Đổi được:", so_vnd, "VND")
`,
    stdinLines: [],
  },
  {
    id: 'p1-u3',
    title: 'Chia tiền ăn nhóm',
    code: `# input() đọc dữ liệu người dùng nhập (điền sẵn ở ô "Dữ liệu nhập" bên phải)
tong_tien = int(input("Tổng hoá đơn (đồng): "))
so_nguoi = int(input("Số người ăn: "))
moi_nguoi = tong_tien / so_nguoi
print(f"Mỗi người trả: {moi_nguoi:,.0f} đồng")
`,
    stdinLines: ['480000', '4'],
  },
  {
    id: 'p1-u4',
    title: 'Tiền điện bậc thang EVN',
    code: `# Rẽ nhánh if/elif: giá điện sinh hoạt tính theo BẬC (số liệu minh hoạ)
so_kwh = int(input("Tháng này nhà bạn dùng bao nhiêu kWh? "))

if so_kwh <= 50:
    tien = so_kwh * 1893
elif so_kwh <= 100:
    tien = 50 * 1893 + (so_kwh - 50) * 1956
elif so_kwh <= 200:
    tien = 50 * 1893 + 50 * 1956 + (so_kwh - 100) * 2271
else:
    tien = 50 * 1893 + 50 * 1956 + 100 * 2271 + (so_kwh - 200) * 2860

print(f"Dùng {so_kwh} kWh → tiền điện khoảng {tien:,.0f} đồng (chưa VAT)")
`,
    stdinLines: ['180'],
  },
  {
    id: 'p1-u5',
    title: 'Đoán số bí mật (while)',
    code: `# Vòng lặp while: lặp lại tới khi đoán đúng
so_bi_mat = 7
so_lan = 0

while True:
    doan = int(input("Đoán số bí mật (1-10): "))
    so_lan = so_lan + 1
    if doan == so_bi_mat:
        print(f"Chính xác! Bạn đoán {so_lan} lần thì trúng.")
        break
    elif doan < so_bi_mat:
        print("Nhỏ hơn số bí mật, thử lại nhé.")
    else:
        print("Lớn hơn số bí mật, thử lại nhé.")
`,
    stdinLines: ['5', '9', '7'],
  },
  {
    id: 'p1-u6',
    title: 'Tiết kiệm mỗi tháng (for)',
    code: `# Vòng lặp for + range: gửi tiết kiệm đều đặn 12 tháng
moi_thang = 500_000
tong = 0
for thang in range(1, 13):
    tong = tong + moi_thang
    print(f"Tháng {thang:2d}: đã để dành {tong:,.0f} đồng")
print("Sau 1 năm bạn có:", f"{tong:,.0f}", "đồng")
`,
    stdinLines: [],
  },
  {
    id: 'p1-u7',
    title: 'Điểm đậu / rớt cả lớp',
    code: `# if nằm TRONG vòng lặp: xét từng bạn một
diem_ca_lop = [8.5, 4.0, 6.5, 9.0, 3.5, 5.0, 7.5]
so_dau = 0

for diem in diem_ca_lop:
    if diem >= 5.0:
        ket_qua = "ĐẬU"
        so_dau = so_dau + 1
    else:
        ket_qua = "rớt"
    print(f"Điểm {diem} → {ket_qua}")

print(f"Cả lớp {len(diem_ca_lop)} bạn, {so_dau} bạn đậu.")
`,
    stdinLines: [],
  },
  {
    id: 'p1-u8',
    title: 'Bác sĩ code — tự sửa 1 lỗi',
    code: `# Đoạn code này CÓ 1 LỖI: chạy thử, đọc thông báo lỗi rồi tự sửa.
# Gợi ý: Python phân biệt chữ hoa/chữ thường trong tên biến.
tien_trong_vi = 100000
gia_tra_sua = 30000
con_lai = tien_trong_vi - gia_tra_Sua
print("Còn lại:", con_lai, "đồng")
`,
    stdinLines: [],
  },
  {
    id: 'p1-u9',
    title: 'Oẳn tù tì với máy',
    code: `# import module: mượn "đồ nghề" có sẵn của Python
import random

lua_chon = ["búa", "kéo", "bao"]
may = random.choice(lua_chon)
ban = input("Bạn ra gì (búa/kéo/bao)? ")

print("Máy ra:", may)
if ban == may:
    print("Hoà!")
elif (ban == "búa" and may == "kéo") or (ban == "kéo" and may == "bao") or (ban == "bao" and may == "búa"):
    print("Bạn THẮNG!")
else:
    print("Máy thắng, chơi lại nào.")
`,
    stdinLines: ['búa'],
  },
  {
    id: 'p1-u10',
    title: 'Máy bán nước tự động (milestone P1)',
    code: `# Milestone P1: ráp biến + input + if + vòng lặp thành máy bán hàng nhỏ
menu = "1. Trà đá 5000đ | 2. Nước cam 15000đ | 3. Sữa đậu 10000đ"
gia = [5000, 15000, 10000]
ten = ["Trà đá", "Nước cam", "Sữa đậu"]
doanh_thu = 0

for luot in range(2):  # bán 2 lượt cho gọn (đổi số này để bán thêm)
    print(menu)
    chon = int(input("Chọn món (1-3): "))
    tra = int(input("Khách đưa bao nhiêu tiền? "))
    tien_mon = gia[chon - 1]
    if tra < tien_mon:
        print("Không đủ tiền, trả lại khách", tra, "đồng")
    else:
        doanh_thu = doanh_thu + tien_mon
        print(f"Bán {ten[chon - 1]}, thối lại {tra - tien_mon} đồng")

print(f"Tổng doanh thu: {doanh_thu:,.0f} đồng")
`,
    stdinLines: ['2', '20000', '1', '5000'],
  },
]
