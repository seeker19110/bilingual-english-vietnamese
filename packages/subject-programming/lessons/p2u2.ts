// lessons/p2u2.ts — Bài học P2-U2: DANH SÁCH (list) — index, thêm/xoá, duyệt.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u2-l1',
    unitId: 'p2-u2',
    title: 'Danh sách — một cái tên chứa được cả menu quán',
    hook: 'Quán bạn có 3 món thì đặt 3 biến gia1, gia2, gia3 còn xoay xở được. Thêm món thứ 12 thì sao? Danh sách (list) cho phép một cái tên duy nhất giữ cả trăm giá trị, và đếm/duyệt/thêm/bớt được.',
    theory:
      'LIST là dãy giá trị có thứ tự, viết trong dấu ngoặc vuông:\n\ngia = [5000, 15000, 10000]\n\n- Truy cập theo CHỈ SỐ, đếm từ 0: gia[0] là 5000, gia[2] là 10000. Chỉ số âm đếm ngược từ cuối: gia[-1] là phần tử cuối.\n- len(gia) cho số phần tử. Chỉ số hợp lệ chạy từ 0 tới len(gia) - 1; vượt ra là lỗi IndexError.\n- gia.append(20000) thêm vào CUỐI; gia.remove(5000) xoá phần tử ĐẦU TIÊN bằng giá trị đó; gia.pop() lấy ra phần tử cuối.\n- Duyệt: for g in gia: — lấy lần lượt từng GIÁ TRỊ (dùng nhiều nhất). Nếu cần cả vị trí thì for i in range(len(gia)).\n- Có sẵn: sum(gia) tổng, max(gia)/min(gia) lớn nhất/nhỏ nhất, sorted(gia) trả về bản đã sắp xếp.\n\nLát cắt (slice): gia[0:2] lấy từ vị trí 0 tới TRƯỚC vị trí 2 — tức 2 phần tử đầu. Nhớ quy tắc "tới trước", không bao gồm đầu bên phải.',
    workedExample: {
      code: `# Sổ giá của quán: một list giữ cả menu
gia = [5000, 15000, 10000]      # 3 món ban đầu
gia.append(20000)               # quán thêm món mới vào cuối menu

print(f"So mon: {len(gia)}")            # đếm phần tử
print(f"Mon dau tien: {gia[0]} dong")   # chỉ số đếm từ 0
print(f"Mon cuoi: {gia[-1]} dong")      # chỉ số âm = đếm từ cuối

tong = 0
for g in gia:                   # duyệt từng giá trị trong list
    tong = tong + g
print(f"Tong gia menu: {tong} dong")
print(f"Gia cao nhat: {max(gia)} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `mon = ["tra da", "nuoc cam", "sua dau"]\nprint(mon[1])`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['tra da', 'nuoc cam', 'sua dau', 'Báo lỗi IndexError'],
      answerIndex: 1,
      explain:
        'Chỉ số của list đếm TỪ 0: mon[0] là "tra da", mon[1] là "nuoc cam". Đây là chỗ người mới nhầm nhiều nhất — "phần tử thứ 2" nằm ở chỉ số 1.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: tạo menu 3 giá, thêm một món 20000, rồi in tổng giá của cả menu.',
      lines: [
        'gia = [5000, 15000, 10000]',
        'gia.append(20000)',
        'tong = 0',
        'for g in gia:',
        '    tong = tong + g',
        'print(f"Tong: {tong} dong")',
      ],
    },
    make: {
      prompt:
        'Menu quán bắt đầu bằng list gia = [5000, 15000, 10000].\n\nChương trình đọc MỘT số nguyên bằng input() — giá của món mới — rồi thêm nó vào cuối menu. Sau đó in đúng một dòng:\nSo mon: <số món> | Gia cao nhat: <giá lớn nhất> | Tong: <tổng các giá>\n\nVí dụ nhập 20000 → menu thành [5000, 15000, 10000, 20000] → in "So mon: 4 | Gia cao nhat: 20000 | Tong: 50000".',
      starterCode: `gia = [5000, 15000, 10000]\ngia_moi = int(input("Gia mon moi: "))\n# Thêm món mới vào list, rồi in một dòng theo đúng mẫu của đề\n`,
      testCases: [
        {
          stdinLines: ['20000'],
          expected: 'So mon: 4 | Gia cao nhat: 20000 | Tong: 50000',
          match: 'contains',
          hidden: false,
          label: 'Thêm món 20.000đ (đắt nhất menu)',
        },
        {
          stdinLines: ['8000'],
          expected: 'So mon: 4 | Gia cao nhat: 15000 | Tong: 38000',
          match: 'contains',
          hidden: false,
          label: 'Thêm món 8.000đ — món đắt nhất vẫn là 15.000đ',
        },
        {
          stdinLines: ['0'],
          expected: 'So mon: 4 | Gia cao nhat: 15000 | Tong: 30000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: món khuyến mãi giá 0đ',
        },
      ],
      hints: [
        'Thêm vào cuối list bằng gia.append(gia_moi) — nhớ gọi TRƯỚC khi đếm và tính tổng, nếu không món mới sẽ không được tính.',
        'Ba con số cần in đều có hàm sẵn: len(gia), max(gia), sum(gia). Không cần viết vòng lặp nếu bạn dùng chúng.',
        'In đúng một dòng bằng f-string, chú ý dấu gạch đứng và khoảng trắng đúng như đề: print(f"So mon: {len(gia)} | Gia cao nhat: {max(gia)} | Tong: {sum(gia)}").',
      ],
      sampleSolution: `gia = [5000, 15000, 10000]\ngia_moi = int(input("Gia mon moi: "))\ngia.append(gia_moi)\n\nprint(f"So mon: {len(gia)} | Gia cao nhat: {max(gia)} | Tong: {sum(gia)}")`,
    },
    homework:
      'Về nhà: mở tủ lạnh nhà bạn, ghi giá 5 món đồ vào một list rồi viết chương trình in ra món đắt nhất, món rẻ nhất và tổng tiền. Thử thêm gia.remove(...) để bỏ món vừa ăn hết xem list thay đổi thế nào.',
  },
]
