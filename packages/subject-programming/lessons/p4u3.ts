// lessons/p4u3.ts — Bài học P4-U3: REFACTOR CÓ KỶ LUẬT (+ kết hợp thay vì kế thừa).
// Làn A (chạy thật trong sandbox) — hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u3-l1',
    unitId: 'p4-u3',
    language: 'python',
    title: 'Refactor — sửa cấu trúc mà KHÔNG đổi kết quả',
    hook: 'Code cũ của chính bạn ba tháng trước đọc như code người lạ. Cám dỗ lúc đó là "đập đi viết lại cho sạch" — và đó là cách phổ biến nhất để làm hỏng một chương trình đang chạy tốt. Refactor là con đường khác: đổi cấu trúc từng lát nhỏ, sau mỗi lát chạy lại vẫn ra đúng kết quả cũ.',
    theory:
      'REFACTOR = đổi CÁCH VIẾT, giữ nguyên HÀNH VI. Nếu output đổi thì đó không còn là refactor, đó là sửa tính năng — hai việc khác nhau, đừng trộn vào một lần.\n\nBa luật kỷ luật:\n1. Có cách kiểm chứng TRƯỚC khi động vào. Ở đây là bộ test-case của bài; ở dự án thật là test tự động (bạn học ở U5–U6). Không có gì để kiểm chứng thì đừng refactor — bạn đang sửa mù.\n2. Lát nhỏ, chạy lại sau mỗi lát. Gom một nhóm biến thành class → chạy. Tách một hàm → chạy. Sai ở đâu biết ngay ở đó.\n3. Một lần chỉ làm một loại thay đổi. Không vừa gom class vừa đổi công thức tính tiền.\n\nDấu hiệu nên refactor: cùng một nhóm dữ liệu bị truyền qua truyền lại giữa nhiều hàm (gom thành class); cùng một đoạn tính toán xuất hiện ở ba chỗ (tách thành phương thức); một hàm dài phải cuộn màn hình mới đọc hết (chẻ theo từng việc).\n\nỞ bài này ta gặp KẾT HỢP (composition): HoaDon KHÔNG kế thừa Mon — hoá đơn không phải một loại món. Hoá đơn CHỨA một danh sách các dòng món bên trong. Đây là quan hệ hay gặp hơn kế thừa rất nhiều trong dự án thật.',
    workedExample: {
      code: `# TRƯỚC refactor: dữ liệu xé lẻ, công thức chép ba lần (đọc thử là thấy mệt)
ten1, gia1, sl1 = "Tra da", 5000, 3
ten2, gia2, sl2 = "Ca phe", 25000, 2
print(f"{ten1} x{sl1} = {gia1 * sl1} dong")
print(f"{ten2} x{sl2} = {gia2 * sl2} dong")
print(f"Tong cong: {gia1 * sl1 + gia2 * sl2} dong")

print("---")

# SAU refactor: cùng KẾT QUẢ, nhưng dữ liệu đi thành khối và công thức chỉ còn MỘT chỗ
class Mon:
    def __init__(self, ten, gia):
        self.ten = ten
        self.gia = gia

    def thanh_tien(self, so_luong):
        return self.gia * so_luong

class HoaDon:                       # hoá đơn CHỨA món (kết hợp), không kế thừa Mon
    def __init__(self):
        self.dong = []              # mỗi phần tử là một cặp (món, số lượng)

    def them(self, mon, so_luong):
        self.dong.append((mon, so_luong))

    def tong(self):
        return sum(mon.thanh_tien(sl) for mon, sl in self.dong)

    def in_ra(self):
        for mon, sl in self.dong:
            print(f"{mon.ten} x{sl} = {mon.thanh_tien(sl)} dong")
        print(f"Tong cong: {self.tong()} dong")

hoa_don = HoaDon()
hoa_don.them(Mon("Tra da", 5000), 3)
hoa_don.them(Mon("Ca phe", 25000), 2)
hoa_don.in_ra()`,
      stdinLines: [],
    },
    predict: {
      code: `class HoaDon:\n    def __init__(self, dong=[]):\n        self.dong = dong\n\n    def them(self, x):\n        self.dong.append(x)\n\na = HoaDon()\na.them("tra da")\nb = HoaDon()\nprint(len(b.dong))`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['0', '1', 'Báo lỗi', '2'],
      answerIndex: 1,
      explain:
        'Đây là cái bẫy kinh điển của Python: giá trị mặc định [] được tạo MỘT lần lúc định nghĩa hàm, rồi mọi hoá đơn dùng chung đúng cái list ấy. a thêm vào thì b cũng thấy, nên in 1. Cách đúng: def __init__(self, dong=None) rồi self.dong = dong if dong is not None else [].',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành class HoaDon giữ nhiều dòng món và cộng được tổng tiền (dùng kết hợp, không kế thừa).',
      lines: [
        'class HoaDon:',
        '    def __init__(self):',
        '        self.dong = []',
        '    def them(self, mon, so_luong):',
        '        self.dong.append((mon, so_luong))',
        '    def tong(self):',
        '        return sum(mon.thanh_tien(sl) for mon, sl in self.dong)',
      ],
    },
    make: {
      prompt:
        'Class Mon đã có sẵn trong code khởi đầu. Hãy viết class HoaDon (KHÔNG kế thừa Mon — hoá đơn chứa món):\n- __init__: tạo danh sách dòng rỗng.\n- them(self, mon, so_luong): thêm một dòng vào hoá đơn.\n- tong(self): trả về tổng tiền của mọi dòng.\n- in_ra(self): in mỗi dòng theo mẫu "<ten> x<so_luong> = <tien> dong", rồi in dòng cuối "Tong cong: <tong> dong".\n\nChương trình đọc ĐÚNG 3 dòng input(), mỗi dòng dạng "ten,gia,so_luong" (ngăn bằng dấu phẩy, không có khoảng trắng thừa), thêm cả 3 vào một hoá đơn rồi gọi in_ra().',
      starterCode: `class Mon:\n    def __init__(self, ten, gia):\n        self.ten = ten\n        self.gia = gia\n\n    def thanh_tien(self, so_luong):\n        return self.gia * so_luong\n\n# Viết class HoaDon ở đây\n\nhoa_don = HoaDon()\nfor _ in range(3):\n    ten, gia, so_luong = input("Dong hang: ").split(",")\n    # Tạo Mon rồi thêm vào hoá đơn (nhớ đổi chuỗi sang số nguyên)\n\nhoa_don.in_ra()\n`,
      testCases: [
        {
          stdinLines: ['Tra da,5000,3', 'Ca phe,25000,2', 'Banh mi,20000,1'],
          expected:
            'Tra da x3 = 15000 dong\nCa phe x2 = 50000 dong\nBanh mi x1 = 20000 dong\nTong cong: 85000 dong',
          match: 'contains',
          hidden: false,
          label: 'Hoá đơn 3 dòng → tổng 85.000đ',
        },
        {
          stdinLines: ['Nuoc loc,10000,1', 'Nuoc loc,10000,1', 'Nuoc loc,10000,1'],
          expected: 'Tong cong: 30000 dong',
          match: 'contains',
          hidden: false,
          label: 'Ba dòng cùng một món → 30.000đ (mỗi dòng vẫn tính riêng)',
        },
        {
          stdinLines: ['Kem,0,5', 'Sinh to,30000,2', 'Tra sua,35000,4'],
          expected: 'Tong cong: 200000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: có món giá 0 (khuyến mãi) → tổng 200.000đ',
        },
      ],
      hints: [
        'HoaDon không nhận (Mon) trong ngoặc: hoá đơn không phải một loại món, nó CHỨA món.',
        'input().split(",") trả về danh sách CHUỖI — gia và so_luong phải int() lại trước khi tính, nếu không "5000" * 3 sẽ ra chuỗi lặp ba lần.',
        'in_ra() cần chính con số đã in ở mỗi dòng để cộng tổng: gọi lại self.tong() cho chắc, đừng cộng tay lần thứ hai — công thức chỉ nên tồn tại một chỗ.',
        'Khung tham chiếu:\n\nclass HoaDon:\n    def __init__(self):\n        self.dong = []\n\n    def them(self, mon, so_luong):\n        self.dong.append((mon, so_luong))\n\n    def tong(self):\n        return sum(mon.thanh_tien(sl) for mon, sl in self.dong)',
      ],
      sampleSolution: `class Mon:
    def __init__(self, ten, gia):
        self.ten = ten
        self.gia = gia

    def thanh_tien(self, so_luong):
        return self.gia * so_luong

class HoaDon:
    def __init__(self):
        self.dong = []          # danh sách các cặp (món, số lượng)

    def them(self, mon, so_luong):
        self.dong.append((mon, so_luong))

    def tong(self):
        return sum(mon.thanh_tien(sl) for mon, sl in self.dong)

    def in_ra(self):
        for mon, sl in self.dong:
            print(f"{mon.ten} x{sl} = {mon.thanh_tien(sl)} dong")
        print(f"Tong cong: {self.tong()} dong")

hoa_don = HoaDon()
for _ in range(3):
    ten, gia, so_luong = input("Dong hang: ").split(",")
    hoa_don.them(Mon(ten, int(gia)), int(so_luong))

hoa_don.in_ra()`,
    },
    homework:
      'Chọn một hàm dài nhất trong dự án quán của bạn. Trước khi sửa, ghi lại output của nó với 2–3 bộ dữ liệu mẫu (đó là "test" thủ công của bạn). Rồi tách nó thành 2–3 hàm/phương thức nhỏ, mỗi lát xong chạy lại và đối chiếu đúng output cũ. Ghi lại: lát nào làm bạn suýt đổi kết quả?',
    srsCards: [
      {
        hoi: 'Refactor khác sửa tính năng ở chỗ nào?',
        dap: 'Refactor đổi cách viết nhưng giữ nguyên hành vi — output trước và sau phải y hệt. Nếu kết quả đổi thì đó là sửa tính năng, phải làm ở một lần riêng.',
      },
      {
        hoi: 'Điều kiện bắt buộc phải có trước khi bắt đầu refactor là gì?',
        dap: 'Phải có cách kiểm chứng hành vi cũ — test tự động, hoặc ít nhất vài bộ dữ liệu mẫu đã ghi output. Không có gì để đối chiếu thì đang sửa mù.',
      },
      {
        hoi: 'Khi nào dùng kết hợp (composition) thay cho kế thừa?',
        dap: 'Khi quan hệ là "CHỨA" chứ không phải "LÀ MỘT loại": hoá đơn chứa nhiều món, nên HoaDon giữ danh sách Mon bên trong thay vì kế thừa Mon.',
      },
    ],
  },
]
