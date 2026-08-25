// lessons/p2u1.ts — Bài học P2-U1: HÀM (def, tham số, return).
// Bậc P2 "Nền tảng vững" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u1-l1',
    unitId: 'p2-u1',
    language: 'python',
    title: 'Hàm — đặt tên cho một việc rồi gọi lại nhiều lần',
    hook: 'Ở bậc P1, mỗi lần muốn tính tiền bạn phải chép lại nguyên đoạn code tính toán. Chép 3 chỗ, sửa giá một lần là quên sửa 2 chỗ kia — sổ sách sai ngay. HÀM sinh ra để bạn viết MỘT lần rồi gọi lại mọi nơi.',
    theory:
      'HÀM là một việc có tên. Bạn định nghĩa nó một lần bằng def, rồi gọi lại bao nhiêu lần tuỳ thích.\n\ndef tinh_tien(gia, so_luong):\n    return gia * so_luong\n\n- def: từ khoá khai báo hàm.\n- tinh_tien: tên hàm — đặt theo VIỆC nó làm (động từ), không đặt a, b, x.\n- (gia, so_luong): THAM SỐ — dữ liệu hàm cần để làm việc.\n- return: TRẢ VỀ kết quả cho nơi gọi. Gặp return là hàm dừng ngay.\n\nKhác nhau giữa return và print: print chỉ HIỆN ra màn hình cho người xem; return ĐƯA giá trị lại cho chương trình dùng tiếp (gán vào biến, cộng thêm, so sánh...). Hàm chỉ print mà không return thì gọi xong bạn chẳng cầm được gì trong tay.\n\nPhạm vi biến: biến tạo BÊN TRONG hàm chỉ sống bên trong hàm đó; hết hàm là biến biến mất. Nhờ vậy hai hàm khác nhau dùng trùng tên biến cũng không đá nhau.',
    workedExample: {
      code: `# Hàm tính tiền gửi xe — viết một lần, gọi hai lần
def tien_gui_xe(so_gio):          # định nghĩa hàm, nhận 1 tham số
    gia_moi_gio = 5000            # biến nội bộ, chỉ sống trong hàm này
    return so_gio * gia_moi_gio   # trả kết quả về cho nơi gọi

sang = tien_gui_xe(2)             # gọi lần 1, kết quả gán vào biến sang
chieu = tien_gui_xe(3)            # gọi lần 2 với dữ liệu khác
print(f"Sang: {sang} dong")
print(f"Chieu: {chieu} dong")
print(f"Ca ngay: {sang + chieu} dong")   # return cho phép cộng tiếp`,
      stdinLines: [],
    },
    predict: {
      code: `def cong_them(x):\n    x = x + 10\n    return x\n\nso = 5\ncong_them(so)\nprint(so)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['15', '5', '10', 'Báo lỗi'],
      answerIndex: 1,
      explain:
        'Hàm cộng_thêm có sửa x, nhưng x là biến NỘI BỘ của hàm — sửa nó không đụng tới biến so bên ngoài. Hơn nữa kết quả return không được gán vào đâu cả (phải viết so = cong_them(so) mới đổi được). Nên so vẫn là 5.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: định nghĩa hàm tính tiền một món rồi in tiền của 3 ly trà đá 5000 đồng.',
      lines: [
        'def tinh_tien(gia, so_luong):',
        '    return gia * so_luong',
        'tong = tinh_tien(5000, 3)',
        'print(f"Thanh tien: {tong} dong")',
      ],
    },
    make: {
      prompt:
        'Viết hàm tinh_tien(gia, so_luong) trả về số tiền phải trả, có áp dụng khuyến mãi của quán:\n- Tiền hàng = gia × so_luong.\n- Nếu tiền hàng TỪ 100.000 đồng trở lên thì giảm 10% (làm tròn xuống đồng nguyên: dùng tong * 90 // 100).\n\nSau đó chương trình đọc 2 dòng bằng input(): dòng 1 là giá một món, dòng 2 là số lượng; rồi in đúng một dòng:\nThanh tien: <số tiền> dong\n\nVí dụ: giá 15000, số lượng 10 → tiền hàng 150.000 ≥ 100.000 → giảm 10% → in "Thanh tien: 135000 dong".',
      starterCode: `def tinh_tien(gia, so_luong):\n    # Tính tiền hàng, giảm 10% nếu từ 100000 trở lên, rồi return\n    ...\n\ngia = int(input("Gia mot mon: "))\nso_luong = int(input("So luong: "))\n# Gọi hàm và in: Thanh tien: <tien> dong\n`,
      testCases: [
        {
          stdinLines: ['5000', '3'],
          expected: 'Thanh tien: 15000 dong',
          match: 'contains',
          hidden: false,
          label: '3 ly trà đá 5.000đ → 15.000đ (chưa tới mốc giảm giá)',
        },
        {
          stdinLines: ['15000', '10'],
          expected: 'Thanh tien: 135000 dong',
          match: 'contains',
          hidden: false,
          label: '10 ly nước cam 15.000đ → 150.000đ, giảm 10% → 135.000đ',
        },
        {
          stdinLines: ['20000', '5'],
          expected: 'Thanh tien: 90000 dong',
          match: 'contains',
          hidden: false,
          label: 'Đúng 100.000đ (RANH GIỚI được giảm) → 90.000đ',
        },
        {
          stdinLines: ['3000', '33'],
          expected: 'Thanh tien: 99000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 99.000đ — sát mốc nhưng CHƯA được giảm',
        },
        {
          stdinLines: ['5000', '0'],
          expected: 'Thanh tien: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mua 0 món',
        },
      ],
      hints: [
        'Khung hàm luôn có 3 phần: dòng def ..., phần thân thụt lề, và một dòng return trả kết quả. Đừng print bên trong hàm — đề yêu cầu hàm TRẢ VỀ số tiền.',
        'Bên trong hàm: tính tong = gia * so_luong trước, rồi mới if tong >= 100000: tong = tong * 90 // 100. Cuối cùng return tong.',
        'Bên ngoài hàm, nhớ hứng kết quả: tien = tinh_tien(gia, so_luong) rồi print(f"Thanh tien: {tien} dong"). Gọi hàm mà không gán vào biến thì kết quả rơi mất.',
      ],
      sampleSolution: `def tinh_tien(gia, so_luong):\n    tong = gia * so_luong\n    if tong >= 100000:\n        tong = tong * 90 // 100\n    return tong\n\ngia = int(input("Gia mot mon: "))\nso_luong = int(input("So luong: "))\ntien = tinh_tien(gia, so_luong)\nprint(f"Thanh tien: {tien} dong")`,
    },
    homework:
      'Về nhà: thêm hàm thứ hai in_hoa_don(ten_mon, gia, so_luong) — gọi tinh_tien bên trong rồi in hoá đơn 3 dòng (tên món, số lượng, thành tiền). Thử gọi nó 3 lần với 3 món khác nhau: bạn vừa tránh được việc chép code 3 lần.',
  },
]
