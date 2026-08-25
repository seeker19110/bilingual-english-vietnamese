// lessons/p1u6.ts — Bài học P1-U6 (PR-L4). Khuôn: xem lessons/p1u4.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U6_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u6-l1',
    unitId: 'p1-u6',
    language: 'python',
    title: 'Vòng lặp for — cộng dồn tiền tiết kiệm mỗi ngày',
    hook: 'Mỗi sáng bạn bỏ vào heo đất một số tiền cố định, làm liên tục đúng 10 ngày. Số lần lặp bạn BIẾT TRƯỚC — không cần chờ điều kiện như while. Đây là lúc for phát huy tác dụng: lặp đúng số lần đã định.',
    theory:
      'Khi biết TRƯỚC số lần cần lặp, Python có cách gọn hơn while: vòng lặp for kết hợp với range().\n\nfor <biến> in range(<số lần>):\n    <khối lệnh lặp>\n\nrange(n) sinh ra dãy số 0, 1, 2, ..., n-1 (đúng n số, KHÔNG có số n). Ví dụ range(5) cho 0,1,2,3,4. Biến trong for sẽ lần lượt nhận từng giá trị đó — dùng để đếm thứ tự vòng lặp (ngày thứ mấy, lần thứ mấy).\n\nMột việc rất hay làm trong for là CỘNG DỒN (tích luỹ): tạo một biến tổng = 0 trước vòng lặp, rồi mỗi vòng cộng thêm vào biến đó (tong = tong + gia_tri). Đây là cách tính tổng, đếm số lượng, hay nhân dồn (tính giai thừa, lãi kép) mà không cần biết công thức rút gọn.',
    workedExample: {
      code: `# In bảng cửu chương 7 (7 x 1 đến 7 x 10) — số lần lặp biết trước = 10
so_nhan = 7

for i in range(1, 11):     # range(1, 11) sinh 1, 2, ..., 10 (biết trước đúng 10 lần)
    ket_qua = so_nhan * i
    print(f"{so_nhan} x {i} = {ket_qua}")`,
      stdinLines: [],
    },
    predict: {
      code: `tong = 0\nfor i in range(1, 5):\n    tong = tong + i\nprint(tong)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['4', '10', '5', '15'],
      answerIndex: 1,
      explain:
        'range(1, 5) sinh ra 1, 2, 3, 4 (không có 5). Cộng dồn: tong = 1+2+3+4 = 10. Đây là ví dụ cộng dồn (tích luỹ) kinh điển với for.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình tính tổng tiền tiết kiệm sau 5 ngày, biết mỗi ngày để dành 20.000 đồng.',
      lines: [
        'so_ngay = 5',
        'tien_moi_ngay = 20000',
        'tong_tien = 0',
        'for ngay in range(so_ngay):',
        '    tong_tien = tong_tien + tien_moi_ngay',
        'print(f"Sau {so_ngay} ngay, tiet kiem duoc {tong_tien} dong")',
      ],
    },
    make: {
      prompt:
        'Lớp bạn có N học sinh (N nhập từ input()). Mỗi học sinh lần lượt nhập điểm kiểm tra của mình (mỗi lần một dòng input, N dòng liên tiếp). Viết chương trình dùng for để đọc đủ N điểm, cộng dồn tổng điểm, rồi in ra dòng có dạng:\nTong diem: <tổng> diem\n\nVí dụ N=3, điểm lần lượt 8, 7, 9 → tổng 24 → in "Tong diem: 24 diem".',
      starterCode: `n = int(input("So hoc sinh: "))\ntong = 0\n# Dùng for lặp đúng n lần, mỗi lần đọc 1 điểm bằng input() rồi cộng dồn vào tong\n# Cuối cùng in: Tong diem: <tong> diem\n`,
      testCases: [
        {
          stdinLines: ['1', '10'],
          expected: 'Tong diem: 10 diem',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: chỉ 1 học sinh, điểm 10',
        },
        {
          stdinLines: ['3', '8', '7', '9'],
          expected: 'Tong diem: 24 diem',
          match: 'contains',
          hidden: false,
          label: '3 học sinh, điểm 8, 7, 9 → tổng 24',
        },
        {
          stdinLines: ['0'],
          expected: 'Tong diem: 0 diem',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 0 học sinh (lặp 0 lần) → tổng vẫn là 0',
        },
        {
          stdinLines: ['5', '6', '7', '8', '9', '10'],
          expected: 'Tong diem: 40 diem',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 5 học sinh, điểm tăng dần 6-10 → tổng 40',
        },
      ],
      hints: [
        'Nhớ ví dụ mẫu: for i in range(n) lặp ĐÚNG n lần — dùng để đọc đủ n điểm, kể cả khi n = 0 (vòng lặp không chạy lần nào, tong giữ nguyên 0).',
        'Mỗi vòng lặp gọi input() một lần để lấy 1 điểm (nhớ int() để đổi sang số), rồi cộng dồn vào biến tong đã khởi tạo = 0 từ trước vòng lặp.',
        'Khung gợi ý: for _ in range(n): diem = int(input(...)); tong = tong + diem. Sau vòng lặp: print(f"Tong diem: {tong} diem").',
      ],
      sampleSolution: `n = int(input("So hoc sinh: "))\ntong = 0\n\nfor i in range(n):\n    diem = int(input("Diem: "))\n    tong = tong + diem\n\nprint(f"Tong diem: {tong} diem")`,
    },
    homework:
      'Về nhà: lấy điểm 5 môn học kỳ này của chính bạn, chạy chương trình để tính tổng điểm. Thử sửa chương trình để tính ĐIỂM TRUNG BÌNH (tổng chia cho số môn) thay vì chỉ tổng — chú ý phép chia lấy số thực (dùng dấu /).',
  },
]
