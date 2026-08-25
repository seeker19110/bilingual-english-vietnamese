// lessons/p1u4.ts — Bài học P1-U4: rẽ nhánh if (tiền điện bậc thang EVN).
// Soạn ở PR-L3 làm MẪU khuôn 8 bước; PR-L4 tách ra file riêng theo unit để nhiều người
// soạn song song không đụng nhau (mỗi unit một file, lessons.ts chỉ còn gộp + tra cứu).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u4-l1',
    unitId: 'p1-u4',
    title: 'Rẽ nhánh if — tính tiền điện bậc thang EVN',
    hook: 'Cuối tháng nhìn hoá đơn tiền điện, bạn có bao giờ thắc mắc vì sao dùng gấp đôi số điện mà tiền lại hơn gấp đôi? Vì giá điện tính theo BẬC THANG — dùng càng nhiều, phần vượt càng đắt. Hôm nay bạn sẽ dạy máy tính tính đúng hoá đơn đó.',
    theory:
      'Chương trình không phải lúc nào cũng chạy thẳng một mạch — có lúc phải RẼ NHÁNH: "nếu thế này thì làm A, nếu không thì làm B".\n\nPython rẽ nhánh bằng if / elif / else:\n\n- if (nếu): kiểm tra một điều kiện — đúng thì chạy khối lệnh thụt lề bên dưới.\n- elif (nếu không thì nếu): kiểm tra điều kiện TIẾP THEO, chỉ khi các điều kiện trên sai.\n- else (còn lại): chạy khi mọi điều kiện trên đều sai.\n\nĐiều kiện là phép so sánh: <= (nhỏ hơn hoặc bằng), < , >= , > , == (bằng), != (khác). Kết quả so sánh là boolean: True hoặc False.\n\nQuan trọng: Python đọc các nhánh TỪ TRÊN XUỐNG và chỉ chạy NHÁNH ĐẦU TIÊN đúng — nên với bậc thang, ta kiểm bậc thấp trước, bậc cao sau.',
    workedExample: {
      code: `# Tính tiền gửi xe theo giờ — cùng tư duy bậc thang, số nhỏ cho dễ dò
so_gio = int(input("Gửi xe mấy giờ? "))

if so_gio <= 2:            # bậc 1: 2 giờ đầu, giá gốc
    tien = so_gio * 5000
elif so_gio <= 5:          # bậc 2: từ giờ thứ 3 tới giờ thứ 5, phần vượt đắt hơn
    tien = 2 * 5000 + (so_gio - 2) * 8000
else:                      # bậc 3: từ giờ thứ 6 trở đi
    tien = 2 * 5000 + 3 * 8000 + (so_gio - 5) * 12000

print(f"Gửi {so_gio} giờ, trả {tien} đồng")`,
      stdinLines: ['4'],
    },
    predict: {
      code: `diem = 7\nif diem >= 8:\n    print("Giỏi")\nelif diem >= 5:\n    print("Khá")\nelse:\n    print("Cần cố gắng")`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['Giỏi', 'Khá', 'Cần cố gắng', 'Không in gì cả'],
      answerIndex: 1,
      explain:
        'diem = 7: điều kiện đầu (diem >= 8) sai nên bỏ qua; tới elif (diem >= 5) đúng → in "Khá" rồi DỪNG, không xét else nữa. Python chỉ chạy nhánh ĐẦU TIÊN đúng.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình xếp loại nước dùng: dưới 100 kWh in "Dùng tiết kiệm", từ 100 tới dưới 300 in "Bình thường", còn lại in "Dùng nhiều".',
      lines: [
        'so_kwh = int(input("Số điện tháng này? "))',
        'if so_kwh < 100:',
        '    print("Dùng tiết kiệm")',
        'elif so_kwh < 300:',
        '    print("Bình thường")',
        'else:',
        '    print("Dùng nhiều")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình tính tiền điện theo 3 bậc (giá minh hoạ):\n- Bậc 1: 50 kWh đầu — 1.893 đồng/kWh\n- Bậc 2: từ kWh 51 đến 100 — 1.956 đồng/kWh\n- Bậc 3: từ kWh 101 trở lên — 2.271 đồng/kWh\n\nChương trình đọc số kWh bằng input(), rồi in ra dòng có dạng:\nTien dien: <số tiền> dong\n\nVí dụ dùng 60 kWh → 50×1893 + 10×1956 = 114.210 → in "Tien dien: 114210 dong".',
      starterCode: `so_kwh = int(input("So kWh: "))\n# Tính tiền theo 3 bậc rồi in: Tien dien: <tien> dong\n`,
      testCases: [
        {
          stdinLines: ['30'],
          expected: 'Tien dien: 56790 dong',
          match: 'contains',
          hidden: false,
          label: 'Dùng 30 kWh (chỉ chạm bậc 1) → 56.790 đồng',
        },
        {
          stdinLines: ['60'],
          expected: 'Tien dien: 114210 dong',
          match: 'contains',
          hidden: false,
          label: 'Dùng 60 kWh (qua bậc 2) → 114.210 đồng',
        },
        {
          stdinLines: ['50'],
          expected: 'Tien dien: 94650 dong',
          match: 'contains',
          hidden: false,
          label: 'Đúng 50 kWh (RANH GIỚI bậc 1) → 94.650 đồng',
        },
        {
          stdinLines: ['150'],
          expected: 'Tien dien: 306000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: số kWh lớn qua cả 3 bậc',
        },
        {
          stdinLines: ['0'],
          expected: 'Tien dien: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ca biên 0 kWh',
        },
      ],
      hints: [
        'Nhớ lại bài gửi xe ở ví dụ mẫu: 3 bậc = if / elif / else, kiểm bậc THẤP trước (so_kwh <= 50, rồi <= 100).',
        'Ở bậc 2, chỉ PHẦN VƯỢT 50 mới tính giá bậc 2: tien = 50 * 1893 + (so_kwh - 50) * 1956. Bậc 3 tương tự với phần vượt 100.',
        'In đúng định dạng bằng f-string: print(f"Tien dien: {tien} dong") — chú ý viết đúng "Tien dien" và "dong" không dấu như đề.',
      ],
      sampleSolution: `so_kwh = int(input("So kWh: "))\n\nif so_kwh <= 50:\n    tien = so_kwh * 1893\nelif so_kwh <= 100:\n    tien = 50 * 1893 + (so_kwh - 50) * 1956\nelse:\n    tien = 50 * 1893 + 50 * 1956 + (so_kwh - 100) * 2271\n\nprint(f"Tien dien: {tien} dong")`,
    },
    homework:
      'Về nhà: lấy hoá đơn tiền điện THẬT của nhà bạn (hoặc hỏi bố mẹ số kWh tháng trước), sửa chương trình theo đủ 6 bậc giá thật của EVN rồi so kết quả với hoá đơn. Lệch bao nhiêu? Vì sao (gợi ý: VAT 8%)?',
  },
]
