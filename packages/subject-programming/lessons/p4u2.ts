// lessons/p4u2.ts — Bài học P4-U2: KẾ THỪA (và khi nào KHÔNG nên dùng OOP).
// Làn A (chạy thật trong sandbox) — hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u2-l1',
    unitId: 'p4-u2',
    language: 'python',
    title: 'Kế thừa — và câu hỏi quan trọng hơn: khi nào ĐỪNG dùng',
    hook: 'Quán bạn thêm nhóm món nóng: mọi thứ y hệt món thường, chỉ khác là tính thêm 2.000đ tiền ly giữ nhiệt. Chép nguyên class Mon ra rồi sửa một dòng là cách tệ nhất — vì mai mốt đổi chính sách giảm giá, bạn phải nhớ sửa cả hai bản.',
    theory:
      'KẾ THỪA: một class mới nhận hết mọi thứ của class cũ, rồi chỉ nói phần KHÁC.\n\nclass MonNong(Mon):\n    def thanh_tien(self, so_luong):\n        return super().thanh_tien(so_luong) + 2000 * so_luong\n\n- (Mon): MonNong là con của Mon, tự có sẵn __init__, self.ten, self.gia.\n- Viết lại thanh_tien = GHI ĐÈ (override): gọi món nóng thì bản này chạy, không phải bản cha.\n- super(): gọi đúng bản của CHA. Nhờ nó, phần tính tiền gốc chỉ tồn tại ở MỘT chỗ; sửa chính sách giảm giá ở Mon là món nóng cũng đúng theo.\n\nĐây là điểm quan trọng của cả unit: kế thừa chỉ đúng khi câu "con LÀ MỘT loại của cha" đọc lên thấy thuận. MonNong là một loại Mon — thuận. HoaDon KHÔNG phải một loại Mon (hoá đơn CHỨA nhiều món) — nên HoaDon phải giữ một danh sách món bên trong, gọi là kết hợp (composition), chứ không kế thừa.\n\nKHI NÀO ĐỪNG DÙNG OOP: nếu một class chỉ có dữ liệu mà không có việc gì làm, hoặc chỉ có đúng một phương thức và không giữ dữ liệu gì cả, thì dict hoặc một hàm thường là đủ và dễ đọc hơn. OOP là công cụ trị sự phức tạp — chưa phức tạp mà bọc class là tự làm khó mình. Quy tắc thực dụng: viết bằng hàm trước; khi thấy cùng một nhóm dữ liệu bị truyền qua truyền lại giữa nhiều hàm, lúc đó mới gom thành class.',
    workedExample: {
      code: `class Mon:
    def __init__(self, ten, gia):
        self.ten = ten
        self.gia = gia

    def thanh_tien(self, so_luong):
        return self.gia * so_luong

    def mo_ta(self):
        return f"{self.ten} ({self.gia} dong)"

class MonNong(Mon):                       # MonNong LÀ MỘT loại Mon
    def thanh_tien(self, so_luong):       # ghi đè: chỉ nói phần KHÁC
        goc = super().thanh_tien(so_luong)   # nhờ cha tính phần chung
        return goc + 2000 * so_luong         # cộng tiền ly giữ nhiệt

tra_da = Mon("Tra da", 5000)
ca_phe_nong = MonNong("Ca phe nong", 25000)

print(tra_da.mo_ta())            # mo_ta thừa hưởng từ cha, không viết lại
print(ca_phe_nong.mo_ta())       # món nóng cũng có sẵn mo_ta
print(f"2 tra da: {tra_da.thanh_tien(2)} dong")
print(f"2 ca phe nong: {ca_phe_nong.thanh_tien(2)} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `class A:\n    def chao(self):\n        return "A"\n\nclass B(A):\n    def chao(self):\n        return "B" + super().chao()\n\nprint(B().chao())`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['BA', 'AB', 'Bao loi', 'Khong in gi'],
      answerIndex: 0,
      explain:
        'B().chao() chạy bản của B trước: nó ghép chữ "B" với kết quả của super().chao() — tức bản của cha A, trả về "A". Ghép lại thành "BA".',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau: class MonNong kế thừa Mon, ghi đè thanh_tien để cộng thêm 2000 mỗi ly, rồi in tiền 2 ly cà phê nóng 25000.',
      lines: [
        'class MonNong(Mon):',
        '    def thanh_tien(self, so_luong):',
        '        goc = super().thanh_tien(so_luong)',
        '        return goc + 2000 * so_luong',
        'ca_phe = MonNong("Ca phe nong", 25000)',
        'print(ca_phe.thanh_tien(2))',
      ],
    },
    make: {
      prompt:
        'Đã có sẵn class Mon (giữ ten, gia; thanh_tien = gia × số lượng). Hãy viết thêm class MonNong kế thừa Mon:\n- Ghi đè thanh_tien: gọi super() lấy tiền gốc rồi CỘNG 2000 đồng mỗi ly (tiền ly giữ nhiệt).\n- Ghi đè mo_ta: trả về đúng chuỗi "<ten> (nong)".\n\nSau đó đọc 3 dòng input(): dòng 1 tên món, dòng 2 giá, dòng 3 số lượng; tạo MỘT món nóng rồi in đúng hai dòng:\n<mo_ta>\nThanh tien: <tien> dong\n\nVí dụ: "Ca phe", 25000, 2 → in "Ca phe (nong)" rồi "Thanh tien: 54000 dong".',
      starterCode: `class Mon:\n    def __init__(self, ten, gia):\n        self.ten = ten\n        self.gia = gia\n\n    def thanh_tien(self, so_luong):\n        return self.gia * so_luong\n\n    def mo_ta(self):\n        return f"{self.ten} ({self.gia} dong)"\n\n# Viết class MonNong kế thừa Mon ở đây\n\nten = input("Ten mon: ")\ngia = int(input("Gia: "))\nso_luong = int(input("So luong: "))\n# Tạo món nóng, in mô tả rồi in thành tiền\n`,
      testCases: [
        {
          stdinLines: ['Ca phe', '25000', '2'],
          expected: 'Ca phe (nong)\nThanh tien: 54000 dong',
          match: 'contains',
          hidden: false,
          label: '2 ly cà phê 25.000đ → 50.000 + 2×2.000 = 54.000đ',
        },
        {
          stdinLines: ['Tra gung', '12000', '1'],
          expected: 'Tra gung (nong)\nThanh tien: 14000 dong',
          match: 'contains',
          hidden: false,
          label: '1 ly trà gừng 12.000đ → 14.000đ',
        },
        {
          stdinLines: ['Sua nong', '18000', '5'],
          expected: 'Sua nong (nong)\nThanh tien: 100000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 5 ly sữa nóng 18.000đ → 90.000 + 10.000 = 100.000đ',
        },
      ],
      hints: [
        'Khai báo class con bằng cách để tên cha trong ngoặc: class MonNong(Mon). Bạn KHÔNG cần viết lại __init__ — con thừa hưởng của cha.',
        'Phụ thu là 2000 MỖI LY, không phải 2000 cho cả đơn: nhớ nhân với so_luong.',
        'mo_ta của cha in kèm giá; đề yêu cầu bản của con chỉ có "<ten> (nong)" — nên đây là ghi đè hoàn toàn, không gọi super() trong mo_ta.',
        'Khung tham chiếu:\n\nclass MonNong(Mon):\n    def thanh_tien(self, so_luong):\n        return super().thanh_tien(so_luong) + 2000 * so_luong\n\n    def mo_ta(self):\n        return f"{self.ten} (nong)"',
      ],
      sampleSolution: `class Mon:
    def __init__(self, ten, gia):
        self.ten = ten
        self.gia = gia

    def thanh_tien(self, so_luong):
        return self.gia * so_luong

    def mo_ta(self):
        return f"{self.ten} ({self.gia} dong)"

class MonNong(Mon):
    def thanh_tien(self, so_luong):
        return super().thanh_tien(so_luong) + 2000 * so_luong   # phụ thu mỗi ly

    def mo_ta(self):
        return f"{self.ten} (nong)"

ten = input("Ten mon: ")
gia = int(input("Gia: "))
so_luong = int(input("So luong: "))

mon = MonNong(ten, gia)
print(mon.mo_ta())
print(f"Thanh tien: {mon.thanh_tien(so_luong)} dong")`,
    },
    homework:
      'Nhìn lại dự án quán của bạn và tìm MỘT chỗ bạn từng định "chép class ra sửa vài dòng". Viết ra giấy hai câu: (1) "X LÀ MỘT loại Y" — đọc lên có thuận không? (2) Nếu không thuận, X nên CHỨA Y bên trong (composition) thì đúng hơn ở chỗ nào? Không cần code — unit này muốn bạn quen với việc hỏi trước khi kế thừa.',
    srsCards: [
      {
        hoi: 'super() dùng để làm gì?',
        dap: 'Gọi đúng bản phương thức của class CHA từ trong class con. Nhờ vậy phần logic chung chỉ nằm ở một chỗ (class cha), con chỉ viết thêm phần khác biệt.',
      },
      {
        hoi: 'Câu hỏi nào giúp quyết định có nên kế thừa không?',
        dap: 'Đọc thử câu "con LÀ MỘT loại của cha". Thuận thì kế thừa đúng; không thuận (như hoá đơn với món) thì dùng kết hợp — class này giữ class kia bên trong.',
      },
      {
        hoi: 'Khi nào KHÔNG nên bọc code vào class?',
        dap: 'Khi class chỉ có dữ liệu mà không có việc gì làm, hoặc chỉ có đúng một phương thức không giữ dữ liệu — lúc đó dict hoặc một hàm thường ngắn và dễ đọc hơn.',
      },
    ],
  },
]
