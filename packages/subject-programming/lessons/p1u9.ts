// lessons/p1u9.ts — Bài học P1-U9: số ngẫu nhiên & import module đầu tiên (random).
// Lưu ý sư phạm QUAN TRỌNG: mọi phần được CHẤM đều dùng random.seed() cố định để output
// tất định (deterministic) — xem lessonsPython.test.ts, chạy python3 thật và so chuỗi.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U9_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u9-l1',
    unitId: 'p1-u9',
    language: 'python',
    title: 'Số ngẫu nhiên & import — oẳn tù tì với máy',
    hook: 'Bạn có từng chơi oẳn tù tì (kéo búa bao) chưa? Hôm nay máy tính sẽ là đối thủ của bạn — nó "chọn" ngẫu nhiên nhờ một MODULE có sẵn tên là random, bạn không cần tự viết lại từ đầu.',
    theory:
      'MODULE là một "hộp công cụ" Python đã viết sẵn, bạn chỉ cần IMPORT (nhập vào) để dùng, không phải tự viết lại. Cú pháp: import random ở ĐẦU FILE, rồi gọi công cụ bên trong bằng dấu chấm: random.randint(...), random.choice(...).\n\nHai hàm hay dùng nhất của module random:\n\n- random.randint(a, b): trả về một SỐ NGUYÊN ngẫu nhiên, TỪ a ĐẾN b (cả hai đầu đều có thể ra).\n- random.choice(danh_sach): trả về MỘT PHẦN TỬ ngẫu nhiên được chọn ra từ một list cho sẵn — ví dụ random.choice(["keo", "bua", "bao"]).\n\nVấn đề: kết quả "ngẫu nhiên thật" thì mỗi lần chạy một khác — rất khó để KIỂM TRA chương trình có đúng không (thầy cô, hay chính máy chấm bài, cần chạy lại và ra CÙNG một kết quả). Cách giải quyết: random.seed(<một số cố định>) đặt NGAY SAU dòng import — nó ép "bộ tạo số ngẫu nhiên" bắt đầu từ đúng một điểm xuất phát, nên mọi lần chạy lại chương trình (với cùng seed) sẽ luôn ra CÙNG một chuỗi kết quả. Đây là mẹo thật sự các lập trình viên dùng khi viết test tự động.',
    workedExample: {
      code: `import random          # nhập module random để dùng công cụ tạo số ngẫu nhiên

random.seed(3)         # cố định "hạt giống" — chạy lại vẫn ra đúng số này, dễ đối chiếu
so_may_man = random.randint(1, 100)   # số nguyên ngẫu nhiên từ 1 đến 100
print(f"So may man hom nay: {so_may_man}")`,
      stdinLines: [],
    },
    predict: {
      code: `import random\n\nrandom.seed(1)\nso = random.randint(1, 6)\nprint(so)`,
      question: 'Chạy đoạn code này (chỉ có random.seed(1)), máy in ra số nào?',
      choices: ['1', '2', '6', 'Một số bất kỳ, đổi mỗi lần chạy'],
      answerIndex: 1,
      explain:
        'random.seed(1) cố định "hạt giống" của bộ sinh số ngẫu nhiên — với đúng seed này, random.randint(1, 6) LUÔN trả về 2, dù bạn chạy lại bao nhiêu lần. Đó chính là lý do ta dùng seed: kết quả trở nên TẤT ĐỊNH (đoán trước được), không còn "đổi mỗi lần chạy" như thường lệ.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình "rút thăm trúng thưởng": cố định seed rồi chọn ngẫu nhiên 1 phần thưởng từ danh sách cho sẵn.',
      lines: [
        'import random',
        'random.seed(2)',
        'phan_thuong = ["but", "vo", "keo", "ao", "non"]',
        'trung = random.choice(phan_thuong)',
        'print(f"Ban trung: {trung}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình chơi oẳn tù tì (kéo/búa/bao) với máy:\n1. Đọc lựa chọn của người chơi bằng input() — chuỗi "keo", "bua" hoặc "bao".\n2. Máy chọn ngẫu nhiên bằng random.choice(["keo", "bua", "bao"]) — nhưng PHẢI gọi random.seed(7) ngay sau dòng import random, để mọi lần chấm bài máy luôn chọn giống nhau.\n3. In dòng: May chon: <lựa chọn của máy>\n4. So sánh rồi in đúng 1 trong 3 dòng:\n   - Bằng nhau → Ket qua: Hoa\n   - Người chơi thắng (kéo thắng bao, búa thắng kéo, bao thắng búa) → Ket qua: Ban thang\n   - Còn lại → Ket qua: May thang',
      starterCode: `import random
random.seed(7)

lua_chon_nguoi = input("Ban chon keo/bua/bao? ")
lua_chon_may = random.choice(["keo", "bua", "bao"])
print(f"May chon: {lua_chon_may}")

# TODO: so sánh lua_chon_nguoi với lua_chon_may rồi in "Ket qua: ..."
`,
      testCases: [
        {
          stdinLines: ['keo'],
          expected: 'Ket qua: May thang',
          match: 'contains',
          hidden: false,
          label: 'Người chọn kéo, máy chọn búa → búa thắng kéo',
        },
        {
          stdinLines: ['bao'],
          expected: 'Ket qua: Ban thang',
          match: 'contains',
          hidden: false,
          label: 'Người chọn bao, máy chọn búa → bao thắng búa',
        },
        {
          stdinLines: ['bua'],
          expected: 'Ket qua: Hoa',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — ca biên: hai bên cùng chọn búa → hoà',
        },
        {
          stdinLines: ['bao'],
          expected: 'May chon: bua',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dòng "May chon" luôn in ra lựa chọn cố định của máy (seed 7)',
        },
      ],
      hints: [
        'import random ở đầu file, rồi random.seed(7) NGAY SAU dòng import — đặt sai chỗ (ví dụ sau khi đã gọi random.choice) sẽ không cố định được kết quả.',
        'random.choice(["keo","bua","bao"]) trả về một CHUỖI — gán nó cho lua_chon_may rồi in bằng f-string, y như ví dụ mẫu "rút thăm trúng thưởng".',
        'So sánh 2 chuỗi bằng ==: nếu bằng nhau in Hoa; rồi liệt kê đúng 3 cặp người thắng (keo-bao, bua-keo, bao-bua) bằng if/elif nối bằng "or"; còn lại (else) là máy thắng.',
      ],
      sampleSolution: `import random

random.seed(7)

lua_chon_nguoi = input("Ban chon keo/bua/bao? ")
lua_chon_may = random.choice(["keo", "bua", "bao"])
print(f"May chon: {lua_chon_may}")

if lua_chon_nguoi == lua_chon_may:
    ket_qua = "Hoa"
elif (
    (lua_chon_nguoi == "keo" and lua_chon_may == "bao")
    or (lua_chon_nguoi == "bua" and lua_chon_may == "keo")
    or (lua_chon_nguoi == "bao" and lua_chon_may == "bua")
):
    ket_qua = "Ban thang"
else:
    ket_qua = "May thang"

print(f"Ket qua: {ket_qua}")`,
    },
    homework:
      'Về nhà: đổi random.seed(7) thành một số khác (ví dụ ngày sinh của bạn), chạy chương trình vài lần và quan sát máy luôn ra CÙNG một lựa chọn (vì seed cố định). Sau đó thử XOÁ hẳn dòng random.seed(...) đi rồi chạy lại nhiều lần — máy có đổi lựa chọn thật sự ngẫu nhiên không? Giải thích vì sao khi CHẤM BÀI ta bắt buộc phải cố định seed.',
  },
]
