// lessons/p1u3.ts — Bài học P1-U3 (PR-L4). Khuôn: xem lessons/p1u4.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u3-l1',
    unitId: 'p1-u3',
    language: 'python',
    title: 'Nhập / xuất dữ liệu — input(), f-string và làm tròn',
    hook: 'Ở bài trước, giá vở và số lượng bạn phải TỰ gõ sẵn vào code. Nhưng một chương trình quán photocopy thật sự phải hỏi khách: "In mấy trang?" rồi mới tính tiền. Đó là lúc cần input() — máy biết LẮNG NGHE.',
    theory:
      'Từ đầu tới giờ, chương trình luôn chạy giống nhau vì số liệu đã gán cứng sẵn. Muốn chương trình linh hoạt theo người dùng, ta dùng input() để NHẬP dữ liệu từ bàn phím:\n\nten = input("Ban ten gi? ")\n\nDòng trên: máy hiện chữ "Ban ten gi? ", chờ người dùng gõ rồi bấm Enter, giá trị gõ vào được lưu vào biến ten. Quan trọng: input() LUÔN trả về kiểu chuỗi (str), kể cả khi người dùng gõ số! Muốn dùng làm số để tính toán, phải "ép kiểu" bằng int() (số nguyên) hoặc float() (số thập phân):\n\ntuoi = int(input("Ban bao nhieu tuoi? "))\n\nVề xuất dữ liệu, ngoài print("...", bien, "...") đã học, có cách gọn và rõ hơn là f-string — thêm chữ f trước dấu ngoặc kép, rồi đặt biến trong cặp {}:\n\nprint(f"Ban {tuoi} tuoi")\n\nKhi tính toán ra số thập phân dài (ví dụ 33.33333...), dùng round(số, số_chữ_số_sau_dấu_phẩy) để LÀM TRÒN cho gọn — ví dụ round(33.33333, 2) cho ra 33.33.',
    workedExample: {
      code: `# Hỏi tên và số ly trà sữa muốn mua, rồi tính tổng tiền
ten_khach = input("Ten ban la gi? ")           # input() luôn trả về chuỗi
so_ly = int(input("Mua may ly tra sua? "))      # ép kiểu sang số nguyên để tính toán

gia_1_ly = 25000
tong_tien = so_ly * gia_1_ly

# f-string: đặt biến trong {} để ghép thẳng vào câu chữ
print(f"Cam on {ten_khach}, ban can tra {tong_tien} dong")`,
      stdinLines: ['Mai', '2'],
    },
    predict: {
      code: `so_giay = 100\nso_phut = so_giay / 60\nprint(round(so_phut, 1))`,
      question: 'Chạy đoạn code này, máy in ra số nào?',
      choices: ['1.7', '1.66', '1.6666666666666667', '2.0'],
      answerIndex: 0,
      explain:
        'so_phut = 100 / 60 = 1.6666... Hàm round(so_phut, 1) làm tròn tới 1 chữ số sau dấu phẩy, cho ra 1.7 (vì chữ số thứ hai là 6, làm tròn lên).',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình hỏi tuổi rồi in ra năm sinh gần đúng (2026 trừ tuổi), dùng f-string.',
      lines: [
        'tuoi = int(input("Ban bao nhieu tuoi? "))',
        'nam_sinh = 2026 - tuoi',
        'print(f"Nam sinh cua ban khoang: {nam_sinh}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình quán photocopy: đọc SỐ TRANG cần in bằng input() (ép kiểu số nguyên), biết giá mỗi trang là 500 đồng. Tính tổng tiền rồi in đúng dòng dùng f-string:\nTong tien: <số tiền> dong\n(không dấu tiếng Việt, không thừa khoảng trắng)',
      starterCode: `so_trang = int(input("So trang can in: "))\n# Tính tong_tien = so_trang * 500 rồi in bằng f-string: Tong tien: <tong_tien> dong\n`,
      testCases: [
        {
          stdinLines: ['10'],
          expected: 'Tong tien: 5000 dong',
          match: 'contains',
          hidden: false,
          label: 'In 10 trang → 5.000 đồng',
        },
        {
          stdinLines: ['1'],
          expected: 'Tong tien: 500 dong',
          match: 'contains',
          hidden: false,
          label: 'In 1 trang → 500 đồng',
        },
        {
          stdinLines: ['0'],
          expected: 'Tong tien: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ca biên 0 trang → 0 đồng',
        },
        {
          stdinLines: ['200'],
          expected: 'Tong tien: 100000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: số trang lớn → 100.000 đồng',
        },
      ],
      hints: [
        'Nhớ ví dụ mẫu: input() trả về chuỗi, phải bọc int(input(...)) mới dùng để nhân được — starter code đã làm sẵn bước này.',
        'Tính tong_tien = so_trang * 500 (dấu * là phép nhân).',
        'In bằng f-string: print(f"Tong tien: {tong_tien} dong") — nhớ chữ f trước dấu ngoặc kép và biến trong cặp {}.',
      ],
      sampleSolution: `so_trang = int(input("So trang can in: "))\n\ntong_tien = so_trang * 500\n\nprint(f"Tong tien: {tong_tien} dong")`,
    },
    homework:
      'Về nhà: viết chương trình hỏi CÂN NẶNG (kg) và CHIỀU CAO (mét) của bạn bằng input(), tính chỉ số BMI = cân nặng / (chiều cao * chiều cao), in ra bằng f-string và làm tròn tới 1 chữ số sau dấu phẩy bằng round().',
  },
]
