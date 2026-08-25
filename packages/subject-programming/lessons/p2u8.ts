// lessons/p2u8.ts — Bài học P2-U8: MODULE CHUẨN (datetime, math).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U8_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u8-l1',
    unitId: 'p2-u8',
    title: 'datetime & math — đếm ngược tới ngày quan trọng',
    hook: 'Còn bao nhiêu ngày nữa tới kỳ thi? Tự trừ tay là sai ngay, vì tháng thì 30 ngày tháng thì 31, lại còn năm nhuận. Python có sẵn thư viện làm đúng chuyện đó — bạn chỉ cần biết gọi.',
    theory:
      'THƯ VIỆN CHUẨN là kho hàng có sẵn của Python: không cần cài gì thêm, chỉ cần import.\n\nfrom datetime import date\n\n- date(2026, 12, 31): tạo một ngày. date.fromisoformat("2026-12-31") tạo từ chuỗi dạng năm-tháng-ngày.\n- date.today(): ngày hôm nay (kết quả đổi theo ngày chạy — nên khi cần chấm điểm hay kiểm thử, ta dùng MỐC CỐ ĐỊNH thay vì today()).\n- Trừ hai ngày cho ra một timedelta; lấy số ngày bằng .days: (thi - moc).days.\n- Cộng thêm ngày: từ datetime import timedelta rồi moc + timedelta(days=30).\n\nimport math\n\n- math.ceil(x): làm tròn LÊN (7.1 → 8). math.floor(x): làm tròn XUỐNG.\n- math.sqrt(x): căn bậc hai. math.pi: số pi.\n- Khác round(): round làm tròn về số gần nhất, còn ceil/floor luôn về một phía — chọn đúng cái mình cần, đừng dùng bừa.\n\nHai cách import: import math rồi gọi math.ceil(...) (rõ ràng, nên dùng) hoặc from math import ceil rồi gọi ceil(...) (gọn hơn nhưng dễ trùng tên với hàm của bạn).',
    workedExample: {
      code: `from datetime import date, timedelta
import math

moc = date(2026, 1, 1)                 # mốc cố định để kết quả luôn giống nhau
thi = date.fromisoformat("2026-06-15") # tạo ngày từ chuỗi ISO

con_lai = (thi - moc).days             # trừ 2 ngày -> timedelta, lấy .days
print(f"Con {con_lai} ngay")
print(f"Khoang {math.ceil(con_lai / 7)} tuan")   # ceil = làm tròn LÊN

han = moc + timedelta(days=45)         # cộng thêm ngày
print(f"Han 45 ngay sau moc: {han}")
print(f"Can bac hai cua 81: {math.sqrt(81)}")`,
      stdinLines: [],
    },
    predict: {
      code: `import math\nprint(math.ceil(7.1), math.floor(7.9), round(7.5))`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['8 7 8', '7 8 8', '8 8 8', '7 7 7'],
      answerIndex: 0,
      explain:
        'ceil luôn làm tròn LÊN (7.1 → 8), floor luôn làm tròn XUỐNG (7.9 → 7), còn round(7.5) trong Python cho 8. Ba hàm ba hành vi khác nhau — chọn nhầm là lệch số tiền, lệch số ngày.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: đọc ngày thi dạng ISO rồi in số ngày còn lại tính từ mốc 01/01/2026.',
      lines: [
        'from datetime import date',
        'moc = date(2026, 1, 1)',
        'tho = input("Ngay thi (YYYY-MM-DD): ")',
        'thi = date.fromisoformat(tho)',
        'con_lai = (thi - moc).days',
        'print(f"Con {con_lai} ngay")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình đếm ngược tới một ngày quan trọng.\n\nMốc tính là ngày CỐ ĐỊNH 01/01/2026 (để kết quả luôn kiểm tra được, không dùng date.today()).\n\nĐọc MỘT dòng bằng input() là ngày đích dạng YYYY-MM-DD, rồi in đúng một dòng:\nCon <số ngày> ngay (khoang <số tuần> tuan)\n\nSố tuần = số ngày chia 7 rồi LÀM TRÒN LÊN (math.ceil).\n\nVí dụ nhập 2026-12-31 → còn 364 ngày → 364/7 = 52 → in "Con 364 ngay (khoang 52 tuan)".',
      starterCode: `from datetime import date\nimport math\n\nmoc = date(2026, 1, 1)\ntho = input("Ngay dich (YYYY-MM-DD): ")\n# Đổi chuỗi thành date, trừ mốc lấy .days, rồi in theo mẫu của đề\n`,
      testCases: [
        {
          stdinLines: ['2026-12-31'],
          expected: 'Con 364 ngay (khoang 52 tuan)',
          match: 'contains',
          hidden: false,
          label: 'Ngày cuối năm 2026 → 364 ngày',
        },
        {
          stdinLines: ['2026-01-01'],
          expected: 'Con 0 ngay (khoang 0 tuan)',
          match: 'contains',
          hidden: false,
          label: 'Đúng ngày mốc (ca biên) → 0 ngày',
        },
        {
          stdinLines: ['2026-03-01'],
          expected: 'Con 59 ngay (khoang 9 tuan)',
          match: 'contains',
          hidden: false,
          label: '01/03/2026 → 59 ngày (tháng 2 năm 2026 có 28 ngày)',
        },
        {
          stdinLines: ['2027-01-01'],
          expected: 'Con 365 ngay (khoang 53 tuan)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tròn một năm — 52 tuần LẺ, ceil phải cho 53',
        },
      ],
      hints: [
        'Đổi chuỗi nhập thành ngày bằng date.fromisoformat(tho) — chuỗi phải đúng dạng YYYY-MM-DD thì hàm này mới nhận.',
        'Trừ hai ngày cho ra timedelta, nhớ lấy .days: con_lai = (dich - moc).days. Quên .days là in ra "364 days, 0:00:00" lệch mẫu đề.',
        'Số tuần dùng math.ceil(con_lai / 7) — chú ý ceil trả về số nguyên, đừng dùng round vì 365/7 = 52,14 phải cho 53 chứ không phải 52.',
      ],
      sampleSolution: `from datetime import date\nimport math\n\nmoc = date(2026, 1, 1)\ntho = input("Ngay dich (YYYY-MM-DD): ")\n\ndich = date.fromisoformat(tho)\ncon_lai = (dich - moc).days\ntuan = math.ceil(con_lai / 7)\n\nprint(f"Con {con_lai} ngay (khoang {tuan} tuan)")`,
    },
    homework:
      'Về nhà: đổi mốc thành date.today() rồi tính số ngày còn lại tới sinh nhật bạn — nếu sinh nhật năm nay đã qua thì cộng thêm 1 năm. Thêm module random để mỗi lần chạy in một câu động viên khác nhau.',
  },
]
