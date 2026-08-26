// lessons/p4u1.ts — Bài học P4-U1: OOP CĂN BẢN (class, thuộc tính, phương thức).
// Bậc P4 "Lập trình có cấu trúc lớn" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
// Làn A (chạy thật trong sandbox) theo hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u1-l1',
    unitId: 'p4-u1',
    language: 'python',
    title: 'Class — buộc dữ liệu và việc làm với dữ liệu đó vào một chỗ',
    hook: 'Sổ sách quán của bạn ở bậc P2 đang có ten_mon ở một list, gia_mon ở list khác, ton_kho ở dict thứ ba. Thêm một món mà quên cập nhật đủ ba chỗ là sai số ngay hôm đó. CLASS sinh ra để ba thứ ấy đi chung một khối, không rời nhau được.',
    theory:
      'CLASS là khuôn để tạo ra ĐỒ VẬT (object). Khuôn mô tả: đồ vật đó GIỮ dữ liệu gì (thuộc tính) và LÀM được việc gì (phương thức).\n\nclass Mon:\n    def __init__(self, ten, gia):\n        self.ten = ten\n        self.gia = gia\n\n- class Mon: khai báo khuôn, tên khuôn viết hoa chữ đầu (quy ước Python).\n- __init__: hàm KHỞI TẠO, chạy tự động đúng một lần lúc bạn tạo đồ vật mới.\n- self: chính đồ vật đang được nói tới. Mọi phương thức đều nhận self làm tham số ĐẦU TIÊN.\n- self.ten = ten: cất dữ liệu vào trong đồ vật, để lát nữa lấy ra dùng.\n\nTạo đồ vật: tra_da = Mon("Tra da", 5000). Từ giờ tra_da.ten và tra_da.gia luôn đi cùng nhau.\n\nPHƯƠNG THỨC là hàm sống bên trong class, làm việc với dữ liệu của chính đồ vật đó:\n\n    def thanh_tien(self, so_luong):\n        return self.gia * so_luong\n\nGọi: tra_da.thanh_tien(3). Bạn không phải truyền giá vào nữa — đồ vật tự biết giá của nó.\n\nKhác biệt then chốt so với dict: dict chỉ GIỮ dữ liệu; class giữ dữ liệu VÀ mang theo các việc làm với dữ liệu đó. Khi số việc nhiều lên, đây là thứ giữ cho dự án khỏi rối.',
    workedExample: {
      code: `# Khuôn "Mon" cho quán cà phê — dữ liệu và việc làm đi chung một khối
class Mon:
    def __init__(self, ten, gia):   # chạy tự động khi tạo món mới
        self.ten = ten              # cất tên vào chính đồ vật này
        self.gia = gia              # cất giá vào chính đồ vật này

    def thanh_tien(self, so_luong):     # phương thức: việc mà một món làm được
        return self.gia * so_luong      # tự lấy giá của mình ra tính

    def mo_ta(self):
        return f"{self.ten}: {self.gia} dong"

tra_da = Mon("Tra da", 5000)        # tạo đồ vật thứ nhất từ khuôn
ca_phe = Mon("Ca phe sua", 25000)   # tạo đồ vật thứ hai, dữ liệu riêng biệt

print(tra_da.mo_ta())
print(ca_phe.mo_ta())
print(f"3 ly tra da: {tra_da.thanh_tien(3)} dong")
print(f"2 ly ca phe: {ca_phe.thanh_tien(2)} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `class Mon:\n    def __init__(self, gia):\n        self.gia = gia\n\na = Mon(5000)\nb = a\nb.gia = 9000\nprint(a.gia)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['5000', '9000', 'Báo lỗi', 'None'],
      answerIndex: 1,
      explain:
        'b = a KHÔNG tạo món mới — nó chỉ đặt thêm một cái tên nữa cho CÙNG một đồ vật. Sửa b.gia chính là sửa a.gia, nên in ra 9000. Muốn có món độc lập phải tạo bằng khuôn: b = Mon(a.gia).',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: khai báo class Mon giữ tên và giá, tạo món trà đá 5000 rồi in tiền của 4 ly.',
      lines: [
        'class Mon:',
        '    def __init__(self, ten, gia):',
        '        self.ten = ten',
        '        self.gia = gia',
        '    def thanh_tien(self, so_luong):',
        '        return self.gia * so_luong',
        'tra_da = Mon("Tra da", 5000)',
        'print(f"{tra_da.ten}: {tra_da.thanh_tien(4)} dong")',
      ],
    },
    make: {
      prompt:
        'Viết class Mon cho quán:\n- __init__(self, ten, gia): cất self.ten và self.gia.\n- thanh_tien(self, so_luong): trả về tiền hàng = gia × so_luong; nếu số lượng TỪ 10 trở lên thì giảm 10% (dùng tien * 90 // 100 để làm tròn xuống đồng nguyên).\n\nSau đó đọc 3 dòng bằng input(): dòng 1 tên món, dòng 2 giá (số nguyên), dòng 3 số lượng (số nguyên), rồi in đúng một dòng:\n<ten> x<so_luong> = <tien> dong\n\nVí dụ: "Tra da", 5000, 3 → in "Tra da x3 = 15000 dong".',
      starterCode: `class Mon:\n    def __init__(self, ten, gia):\n        # Cất tên và giá vào đồ vật\n        ...\n\n    def thanh_tien(self, so_luong):\n        # Tính tiền, giảm 10% nếu mua từ 10 trở lên\n        ...\n\nten = input("Ten mon: ")\ngia = int(input("Gia: "))\nso_luong = int(input("So luong: "))\n# Tạo món rồi in: <ten> x<so_luong> = <tien> dong\n`,
      testCases: [
        {
          stdinLines: ['Tra da', '5000', '3'],
          expected: 'Tra da x3 = 15000 dong',
          match: 'contains',
          hidden: false,
          label: '3 ly trà đá 5.000đ → 15.000đ (chưa tới mốc giảm)',
        },
        {
          stdinLines: ['Ca phe sua', '25000', '10'],
          expected: 'Ca phe sua x10 = 225000 dong',
          match: 'contains',
          hidden: false,
          label: 'Đúng 10 ly (RANH GIỚI được giảm): 250.000 → 225.000đ',
        },
        {
          stdinLines: ['Nuoc cam', '15000', '9'],
          expected: 'Nuoc cam x9 = 135000 dong',
          match: 'contains',
          hidden: false,
          label: '9 ly — sát mốc nhưng CHƯA được giảm',
        },
        {
          stdinLines: ['Sinh to', '30000', '12'],
          expected: 'Sinh to x12 = 324000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 12 ly sinh tố 30.000đ → 360.000 giảm 10% → 324.000đ',
        },
      ],
      hints: [
        'Nhớ rằng mọi phương thức trong class đều có self là tham số đầu tiên — kể cả __init__.',
        'Trong thanh_tien, đừng nhận giá từ ngoài truyền vào: món đã tự giữ giá rồi, lấy bằng self.gia.',
        'Mốc giảm là "TỪ 10 trở lên", tức so_luong >= 10 — không phải > 10. Ca 9 ly và ca 10 ly trong danh sách test chính là để bắt lỗi này.',
        'Khung tham chiếu:\n\nclass Mon:\n    def __init__(self, ten, gia):\n        self.ten = ten\n        self.gia = gia\n\n    def thanh_tien(self, so_luong):\n        tien = self.gia * so_luong\n        if so_luong >= 10:\n            tien = tien * 90 // 100\n        return tien',
      ],
      sampleSolution: `class Mon:
    def __init__(self, ten, gia):
        self.ten = ten
        self.gia = gia

    def thanh_tien(self, so_luong):
        tien = self.gia * so_luong
        if so_luong >= 10:          # từ 10 trở lên mới giảm
            tien = tien * 90 // 100
        return tien

ten = input("Ten mon: ")
gia = int(input("Gia: "))
so_luong = int(input("So luong: "))

mon = Mon(ten, gia)
print(f"{mon.ten} x{so_luong} = {mon.thanh_tien(so_luong)} dong")`,
    },
    homework:
      'Mở lại dự án quán của bạn ở bậc P2. Chọn MỘT thứ đang bị xé lẻ ra nhiều biến (ví dụ tên món / giá / tồn kho) và gom nó vào một class Mon. Chưa cần sửa hết chương trình — chỉ cần tạo được 3 món bằng class rồi in bảng giá. Ghi lại: sau khi gom, bạn còn phải nhớ đồng bộ mấy chỗ khi thêm món mới?',
    srsCards: [
      {
        hoi: 'Trong class, tham số self nghĩa là gì?',
        dap: 'self là chính đồ vật đang được thao tác. Nhờ self, phương thức lấy được dữ liệu của riêng đồ vật đó (self.gia, self.ten) mà không cần ai truyền vào.',
      },
      {
        hoi: '__init__ chạy vào lúc nào?',
        dap: 'Chạy tự động đúng một lần, ngay khi bạn tạo đồ vật mới từ class (ví dụ Mon("Tra da", 5000)). Việc của nó là cất dữ liệu ban đầu vào đồ vật.',
      },
      {
        hoi: 'Class hơn dict ở điểm nào?',
        dap: 'Dict chỉ giữ dữ liệu; class giữ dữ liệu VÀ mang theo các phương thức làm việc với dữ liệu đó, nên dữ liệu và cách xử lý không bị lạc nhau khi dự án lớn lên.',
      },
    ],
  },
]
