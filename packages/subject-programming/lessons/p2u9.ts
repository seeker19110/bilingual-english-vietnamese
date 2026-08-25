// lessons/p2u9.ts — Bài học P2-U9: CHIA VAI TRÒ + hàm main().
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U9_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u9-l1',
    unitId: 'p2-u9',
    language: 'python',
    title: 'Chia vai trò và hàm main() — code lớn mà vẫn đọc được',
    hook: 'Chương trình của bạn giờ đã dài cả trăm dòng, sửa một chỗ là hồi hộp không biết có vỡ chỗ khác không. Cách chữa của dân chuyên nghiệp: chia code thành các phần có VAI TRÒ rõ ràng, và có một hàm main() đứng ra chỉ huy.',
    theory:
      'Nguyên tắc chia vai trò (separation of concerns) — mỗi hàm chỉ làm MỘT loại việc:\n\n- Phần GIAO DIỆN: nói chuyện với người dùng (input, print). Ví dụ doc_don().\n- Phần LOGIC: tính toán thuần, không input/print. Ví dụ tinh_tien(). Đây là phần dễ kiểm thử nhất vì cho cùng dữ liệu vào luôn cho cùng kết quả ra.\n- Phần LƯU TRỮ: đọc/ghi file, sau này là cơ sở dữ liệu.\n\nHàm main() là "nhạc trưởng": nó gọi lần lượt các hàm kia theo đúng trình tự, chứ bản thân không tính toán gì nhiều. Nhìn vào main() là hiểu ngay chương trình làm gì — như đọc mục lục.\n\ndef main():\n    ten, so_luong = doc_don()\n    tien = tinh_tien(ten, so_luong)\n    in_hoa_don(ten, so_luong, tien)\n\nmain()          # gọi nhạc trưởng, chương trình bắt đầu chạy từ đây\n\nDự án thật còn tách các nhóm hàm này ra NHIỀU FILE (giao_dien.py, logic.py, luu_tru.py) rồi import lẫn nhau — bước dự án của unit này làm đúng việc đó. Trong sandbox học tập ta viết một file, nhưng cách chia vai trò thì y hệt.\n\nLưu ý: các def phải được định nghĩa TRƯỚC dòng gọi main() ở cuối file — Python đọc từ trên xuống, chưa thấy hàm thì không gọi được.',
    workedExample: {
      code: `# Cùng một chương trình, chia làm 3 vai trò + main() chỉ huy
MENU = {"tra da": 5000, "nuoc cam": 15000}   # HẰNG SỐ viết HOA theo quy ước

def tinh_tien(ten, so_luong):        # LOGIC: chỉ tính, không in
    return MENU.get(ten, 0) * so_luong

def in_hoa_don(ten, so_luong, tien): # GIAO DIỆN: chỉ in, không tính
    print(f"Mon: {ten}")
    print(f"So luong: {so_luong}")
    print(f"Thanh tien: {tien} dong")

def main():                          # NHẠC TRƯỞNG: ráp trình tự
    ten = "nuoc cam"
    so_luong = 3
    in_hoa_don(ten, so_luong, tinh_tien(ten, so_luong))

main()                               # chương trình bắt đầu chạy từ đây`,
      stdinLines: [],
    },
    predict: {
      code: `def chao():\n    print("Xin chao")\n\nprint("Bat dau")`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['Bat dau', 'Xin chao', 'Xin chao rồi Bat dau', 'Bat dau rồi Xin chao'],
      answerIndex: 0,
      explain:
        'Định nghĩa hàm bằng def mới chỉ là "dạy máy cách làm", chưa phải "bảo máy làm". Hàm chao() không được GỌI nên phần thân của nó không chạy. Thiếu đúng một dòng chao() là chương trình im lặng — lỗi rất hay gặp khi mới dùng main().',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình có chia vai trò: một hàm logic, một hàm in, và main() gọi cả hai.',
      lines: [
        'def tinh_tien(gia, so_luong):',
        '    return gia * so_luong',
        'def in_hoa_don(tien):',
        '    print(f"Thanh tien: {tien} dong")',
        'def main():',
        '    in_hoa_don(tinh_tien(5000, 3))',
        'main()',
      ],
    },
    make: {
      prompt:
        'Viết lại máy tính tiền theo kiểu chia vai trò, gồm ĐÚNG 3 hàm và một dòng gọi main():\n\n1. doc_don(): đọc 2 dòng input() — tên món (dòng 1) và số lượng (dòng 2) — rồi TRẢ VỀ cặp (tên đã chuẩn hoá chữ thường không thừa khoảng trắng, số lượng dạng số nguyên).\n2. tinh_tien(ten, so_luong): TRẢ VỀ số tiền, tra bảng MENU = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}. Món không có trong menu thì trả về 0. Hàm này KHÔNG được input hay print.\n3. in_hoa_don(ten, so_luong, tien): in đúng 3 dòng:\nMon: <tên>\nSo luong: <số lượng>\nThanh tien: <tiền> dong\n\ndef main(): gọi lần lượt 3 hàm trên. Cuối file gọi main().',
      starterCode: `MENU = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\ndef doc_don():\n    ...\n\ndef tinh_tien(ten, so_luong):\n    ...\n\ndef in_hoa_don(ten, so_luong, tien):\n    ...\n\ndef main():\n    ...\n\nmain()\n`,
      testCases: [
        {
          stdinLines: ['nuoc cam', '3'],
          expected: 'Mon: nuoc cam\nSo luong: 3\nThanh tien: 45000 dong',
          match: 'contains',
          hidden: false,
          label: '3 ly nước cam → hoá đơn 45.000đ',
        },
        {
          stdinLines: ['  Tra Da ', '2'],
          expected: 'Mon: tra da\nSo luong: 2\nThanh tien: 10000 dong',
          match: 'contains',
          hidden: false,
          label: 'Tên gõ bẩn — doc_don() phải chuẩn hoá trước khi trả về',
        },
        {
          stdinLines: ['ca phe', '4'],
          expected: 'Thanh tien: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: món ngoài menu → tinh_tien trả về 0',
        },
      ],
      hints: [
        'Một hàm trả về hai giá trị bằng cách return ten, so_luong — nơi gọi hứng lại bằng ten, so_luong = doc_don().',
        'Trong tinh_tien, dùng MENU.get(ten, 0) để món không có tự cho 0 — khỏi cần if/else, và không bao giờ vỡ vì KeyError.',
        'Kiểm lại đúng vai trò: chỉ doc_don() được gọi input(), chỉ in_hoa_don() được gọi print(). Đừng quên dòng main() cuối cùng, thiếu nó chương trình không in gì cả.',
      ],
      sampleSolution: `MENU = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\ndef doc_don():\n    ten = input("Mon: ").strip().lower()\n    so_luong = int(input("So luong: "))\n    return ten, so_luong\n\ndef tinh_tien(ten, so_luong):\n    return MENU.get(ten, 0) * so_luong\n\ndef in_hoa_don(ten, so_luong, tien):\n    print(f"Mon: {ten}")\n    print(f"So luong: {so_luong}")\n    print(f"Thanh tien: {tien} dong")\n\ndef main():\n    ten, so_luong = doc_don()\n    tien = tinh_tien(ten, so_luong)\n    in_hoa_don(ten, so_luong, tien)\n\nmain()`,
    },
    homework:
      'Về nhà: trên máy tính của bạn, tách đúng chương trình này thành 3 file thật — logic.py (tinh_tien), giao_dien.py (doc_don, in_hoa_don) và main.py (import hai file kia rồi gọi). Chạy python main.py và xem import hoạt động thế nào.',
    srsCards: [
      {
        hoi: 'Định nghĩa def chao(): ... nhưng không gọi chao() ở đâu cả thì phần thân hàm có chạy không?',
        dap: 'Không. def chỉ "dạy máy cách làm", chưa "bảo máy làm". Phải có dòng gọi chao() thì thân hàm mới thực sự chạy — thiếu dòng gọi là chương trình im lặng, lỗi rất hay gặp khi mới dùng main().',
      },
      {
        hoi: 'Nguyên tắc chia vai trò (separation of concerns) nghĩa là gì?',
        dap: 'Mỗi hàm chỉ làm MỘT loại việc: hàm GIAO DIỆN chỉ input/print, hàm LOGIC chỉ tính toán thuần (không input/print), hàm LƯU TRỮ chỉ đọc/ghi dữ liệu. Tách vậy dễ đọc, dễ sửa, và hàm logic dễ kiểm thử nhất vì cùng đầu vào luôn ra cùng đầu ra.',
      },
      {
        hoi: 'Hàm main() đóng vai trò gì trong một chương trình chia vai trò?',
        dap: 'Là "nhạc trưởng" — gọi lần lượt các hàm khác theo đúng trình tự, bản thân không tính toán nhiều. Đọc main() là hiểu ngay chương trình làm gì, như đọc mục lục.',
      },
    ],
  },
]
