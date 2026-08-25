// lessons/p1u7.ts — Bài học P1-U7 (PR-L4). Khuôn: xem lessons/p1u4.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U7_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u7-l1',
    unitId: 'p1-u7',
    language: 'python',
    title: 'Lồng nhau — đếm học sinh đậu/rớt qua từng bài kiểm tra',
    hook: 'Cô giáo có một xấp bài kiểm tra, cần lướt qua TỪNG bài rồi với MỖI bài lại phải QUYẾT ĐỊNH xem đậu hay rớt (điểm >= 5 là đậu). Đó là hai việc lồng vào nhau: lặp qua từng bài, và bên trong mỗi lần lặp lại rẽ nhánh.',
    theory:
      'Từ hai bài trước, bạn đã có vòng lặp (for/while) để LẶP qua nhiều phần tử, và if/elif/else để RẼ NHÁNH theo điều kiện. Khi cần "với MỖI phần tử, kiểm tra MỘT điều kiện rồi xử lý khác nhau", ta LỒNG if vào bên trong vòng lặp:\n\nfor i in range(n):\n    <lấy giá trị>\n    if <điều kiện>:\n        <xử lý khi đúng>\n    else:\n        <xử lý khi sai>\n\nMẹo về thụt lề: khối lệnh của if nằm thụt lề THÊM MỘT BẬC so với dòng if, và dòng if lại thụt lề theo bên trong vòng lặp — nên phần xử lý nằm SÂU HAI BẬC so với dòng for. Thụt lề sai bậc là lỗi rất hay gặp khi lồng nhau.\n\nMẫu lồng nhau phổ biến: với mỗi phần tử, kiểm tra điều kiện rồi CỘNG DỒN vào một hoặc nhiều biến đếm khác nhau tuỳ nhánh (ví dụ đếm số đậu riêng, số rớt riêng).',
    workedExample: {
      code: `# Đếm xem trong 5 lượt tung xúc xắc, bao nhiêu lần ra số lớn (>=4) và số nhỏ (<4)
so_lan = 5
so_lan_lon = 0
so_lan_nho = 0

for i in range(so_lan):                     # lặp qua từng lượt tung
    mat_xuc_xac = int(input("Mặt xúc xắc: "))
    if mat_xuc_xac >= 4:                     # rẽ nhánh BÊN TRONG vòng lặp
        so_lan_lon = so_lan_lon + 1
    else:
        so_lan_nho = so_lan_nho + 1

print(f"So lan lon: {so_lan_lon}, so lan nho: {so_lan_nho}")`,
      stdinLines: ['6', '2', '5', '1', '4'],
    },
    predict: {
      code: `dem = 0\nfor x in [3, 8, 2, 9, 5]:\n    if x > 4:\n        dem = dem + 1\nprint(dem)`,
      question: 'Chạy đoạn code này, máy in ra gì? (đếm số phần tử lớn hơn 4)',
      choices: ['5', '3', '2', '0'],
      answerIndex: 1,
      explain:
        'Danh sách [3, 8, 2, 9, 5]: các phần tử lớn hơn 4 là 8, 9, 5 — đếm được 3 phần tử. Vòng lặp lồng if bên trong đếm đúng số phần tử thoả điều kiện.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình đếm số học sinh ĐẬU (điểm >= 5) trong n học sinh, mỗi điểm nhập bằng input().',
      lines: [
        'n = int(input("So hoc sinh: "))',
        'so_dau = 0',
        'for i in range(n):',
        '    diem = float(input("Diem: "))',
        '    if diem >= 5:',
        '        so_dau = so_dau + 1',
        'print(f"So hoc sinh dau: {so_dau}")',
      ],
    },
    make: {
      prompt:
        'Một lớp có N học sinh (N nhập từ input()). Sau đó lần lượt nhập điểm từng học sinh (N dòng input, điểm là số nguyên từ 0 đến 10). Viết chương trình đếm riêng số học sinh ĐẬU (điểm >= 5) và số học sinh RỚT (điểm < 5), rồi in ra dòng có dạng:\nDau: <số đậu>, Rot: <số rớt>\n\nVí dụ N=4, điểm 8, 3, 5, 2 → đậu 2 (8 và 5), rớt 2 (3 và 2) → in "Dau: 2, Rot: 2".',
      starterCode: `n = int(input("So hoc sinh: "))\nso_dau = 0\nso_rot = 0\n# Dùng for lặp n lần, mỗi lần đọc 1 điểm; lồng if kiểm tra >= 5 để cộng dồn đúng biến đếm\n# Cuối cùng in: Dau: <so_dau>, Rot: <so_rot>\n`,
      testCases: [
        {
          stdinLines: ['1', '5'],
          expected: 'Dau: 1, Rot: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: 1 học sinh, điểm đúng ngưỡng 5 → tính là đậu',
        },
        {
          stdinLines: ['4', '8', '3', '5', '2'],
          expected: 'Dau: 2, Rot: 2',
          match: 'contains',
          hidden: false,
          label: '4 học sinh, điểm 8/3/5/2 → 2 đậu, 2 rớt',
        },
        {
          stdinLines: ['0'],
          expected: 'Dau: 0, Rot: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 0 học sinh (không lặp lần nào) → cả hai đếm đều 0',
        },
        {
          stdinLines: ['3', '0', '4', '10'],
          expected: 'Dau: 1, Rot: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: điểm 0, 4, 10 → 1 đậu (10), 2 rớt (0 và 4)',
        },
      ],
      hints: [
        'Nhớ ví dụ mẫu: for lặp qua từng học sinh, if nằm THỤT LỀ THÊM một bậc bên trong for để rẽ nhánh cho từng người.',
        'Mỗi vòng lặp chỉ cộng dồn vào ĐÚNG MỘT trong hai biến so_dau / so_rot tuỳ điểm >= 5 hay không — nhớ dùng else để không quên nhánh còn lại.',
        'Khung gợi ý: for i in range(n): diem = int(input(...)); if diem >= 5: so_dau += 1; else: so_rot += 1. Sau vòng lặp mới in kết quả.',
      ],
      sampleSolution: `n = int(input("So hoc sinh: "))\nso_dau = 0\nso_rot = 0\n\nfor i in range(n):\n    diem = int(input("Diem: "))\n    if diem >= 5:\n        so_dau = so_dau + 1\n    else:\n        so_rot = so_rot + 1\n\nprint(f"Dau: {so_dau}, Rot: {so_rot}")`,
    },
    homework:
      'Về nhà: lấy điểm của cả tổ/nhóm bạn (hỏi từng bạn một điểm môn nào đó), chạy chương trình để đếm đậu/rớt thật. Thử mở rộng: thêm nhánh thứ ba "Gioi" cho điểm >= 8 (lồng if/elif/else, đếm 3 biến riêng).',
  },
]
