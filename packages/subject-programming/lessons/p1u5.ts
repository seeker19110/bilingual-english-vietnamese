// lessons/p1u5.ts — Bài học P1-U5 (PR-L4). Khuôn: xem lessons/p1u4.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u5-l1',
    unitId: 'p1-u5',
    language: 'python',
    title: 'Vòng lặp while — tiết kiệm đủ tiền mua xe đạp',
    hook: 'Bạn để dành tiền mua một chiếc xe đạp mới, mỗi tháng bỏ ống heo một số tiền cố định. Bạn không biết trước cần bao nhiêu tháng — chỉ biết là phải LẶP LẠI việc bỏ tiền cho tới khi đủ. Đó chính là lúc cần vòng lặp while.',
    theory:
      'Có những việc ta KHÔNG biết trước sẽ lặp bao nhiêu lần — chỉ biết "cứ làm cho tới khi đạt điều kiện". Python dùng while (nghĩa là "trong khi") cho việc này:\n\nwhile <điều kiện>:\n    <khối lệnh lặp>\n\nMáy kiểm tra điều kiện TRƯỚC mỗi vòng: còn đúng (True) thì chạy tiếp khối lệnh, sai (False) thì dừng, nhảy ra khỏi vòng lặp.\n\nRất quan trọng: bên trong vòng lặp phải có gì đó làm điều kiện dần dần chuyển sang sai (ví dụ cộng dồn một biến, hoặc đọc input mới) — nếu không, vòng lặp sẽ chạy MÃI MÃI (gọi là "lặp vô hạn"), treo cả chương trình.\n\nMột cách dùng khác của while: lặp để ĐẾM SỐ LẦN làm một việc cho tới khi đạt mục tiêu (ví dụ đếm số lần đoán số cho tới khi đoán đúng).',
    workedExample: {
      code: `# Đếm xem gửi bao nhiêu tháng thì đủ tiền mua đôi giày 500.000 đồng
muc_tieu = 500000
so_tien = 0        # số tiền đã để dành, bắt đầu từ 0
so_thang = 0        # đếm số tháng đã gửi

while so_tien < muc_tieu:   # còn thiếu tiền thì lặp tiếp
    so_tien = so_tien + 100000   # mỗi tháng để dành thêm 100.000 đồng
    so_thang = so_thang + 1      # cộng dồn số tháng — nếu thiếu dòng này sẽ lặp vô hạn!

print(f"Cần để dành {so_thang} tháng mới đủ {muc_tieu} đồng")`,
      stdinLines: [],
    },
    predict: {
      code: `n = 0\ntong = 0\nwhile n < 3:\n    n = n + 1\n    tong = tong + n\nprint(tong)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['3', '6', '0', 'Lặp vô hạn'],
      answerIndex: 1,
      explain:
        'Vòng lặp chạy khi n < 3: lần 1 n=1, tong=1; lần 2 n=2, tong=3; lần 3 n=3, tong=6; tới đây n=3 không còn nhỏ hơn 3 nên dừng. Kết quả in ra là 6.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình đếm xem đoán bao nhiêu lần thì trúng số bí mật là 7 (giả lập bằng danh sách các lần đoán cho trước, mỗi lần input() trả về 1 số).',
      lines: [
        'so_bi_mat = 7',
        'so_lan_doan = 0',
        'da_doan_dung = False',
        'while not da_doan_dung:',
        '    doan = int(input("Đoán số: "))',
        '    so_lan_doan = so_lan_doan + 1',
        '    if doan == so_bi_mat:',
        '        da_doan_dung = True',
        'print(f"Đoán đúng sau {so_lan_doan} lần")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình mô phỏng trò chơi đoán số: số bí mật cố định là 42. Chương trình đọc lần lượt các lượt đoán bằng input() (mỗi lần một số nguyên) cho tới khi người chơi đoán TRÚNG 42 thì dừng, rồi in ra dòng có dạng:\nDoan dung sau <số lần> lan\n\nVí dụ nhập lần lượt "10", "42" (2 lượt, lượt 2 trúng) → in "Doan dung sau 2 lan". Đề bài LUÔN đảm bảo dãy input có một lượt trúng 42 (không cần xử lý trường hợp không bao giờ trúng).',
      starterCode: `so_bi_mat = 42\n# Dùng while đọc từng lượt đoán bằng input(), đếm số lần, dừng khi trúng\n# rồi in: Doan dung sau <so lan> lan\n`,
      testCases: [
        {
          stdinLines: ['42'],
          expected: 'Doan dung sau 1 lan',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: đoán trúng ngay lượt đầu tiên (1 lần)',
        },
        {
          stdinLines: ['10', '42'],
          expected: 'Doan dung sau 2 lan',
          match: 'contains',
          hidden: false,
          label: 'Đoán sai 1 lần rồi trúng ở lượt 2',
        },
        {
          stdinLines: ['5', '20', '30', '42'],
          expected: 'Doan dung sau 4 lan',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đoán sai 3 lần rồi trúng ở lượt 4',
        },
        {
          stdinLines: ['1', '2', '3', '4', '42'],
          expected: 'Doan dung sau 5 lan',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đoán sai 4 lần rồi trúng ở lượt 5',
        },
      ],
      hints: [
        'Nhớ ví dụ mẫu: while lặp khi CHƯA đúng điều kiện dừng — ở đây điều kiện dừng là "đã đoán trúng 42".',
        'Dùng một biến cờ (ví dụ da_dung = False) hoặc so sánh trực tiếp trong while; nhớ tăng biến đếm lượt (+= 1) MỖI lần đọc input, kể cả lần trúng.',
        'Khung gợi ý: while chưa trúng: đọc input, tăng đếm, if bằng 42 thì đổi cờ sang True. Sau vòng lặp: print(f"Doan dung sau {so_lan} lan").',
      ],
      sampleSolution: `so_bi_mat = 42\nso_lan = 0\nda_dung = False\n\nwhile not da_dung:\n    doan = int(input("Doan so: "))\n    so_lan = so_lan + 1\n    if doan == so_bi_mat:\n        da_dung = True\n\nprint(f"Doan dung sau {so_lan} lan")`,
    },
    homework:
      'Về nhà: đổi số bí mật thành ngày sinh của bạn (ví dụ ngày 15 thì số bí mật là 15), tự nghĩ ra 3-4 lượt đoán rồi chạy thử chương trình xem đúng số lần không. Thử thêm: nếu người chơi không bao giờ đoán trúng thì chuyện gì xảy ra? Vì sao nguy hiểm?',
  },
]
