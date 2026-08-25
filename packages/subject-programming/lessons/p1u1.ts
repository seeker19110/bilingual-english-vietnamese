// lessons/p1u1.ts — Bài học P1-U1 (PR-L4). Khuôn: xem lessons/p1u4.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u1-l1',
    unitId: 'p1-u1',
    language: 'python',
    title: 'Chương trình đầu tiên — máy tính làm gì và lệnh print',
    hook: 'Bạn bấm vào app ngân hàng, màn hình hiện số dư — ai "bảo" máy tính hiện đúng con số đó? Không phải phép màu, mà là một chuỗi LỆNH ai đó đã viết sẵn. Hôm nay bạn viết lệnh đầu tiên trong đời.',
    theory:
      'Máy tính (computer) thực chất rất "ngốc": nó KHÔNG tự biết làm gì, chỉ biết làm ĐÚNG những gì được ra lệnh, theo ĐÚNG thứ tự, không thiếu không thừa. Giống như một người phụ bếp mới vào nghề — bảo thái hành thì thái hành, không tự ý nêm thêm muối.\n\nChương trình (program) là một danh sách lệnh viết bằng ngôn ngữ máy hiểu được — ở đây là Python. Máy đọc từng dòng từ TRÊN XUỐNG DƯỚI, chạy xong dòng này mới sang dòng kế tiếp.\n\nLệnh đầu tiên mọi người học là print() (nghĩa là "in ra") — bảo máy hiện một dòng chữ lên màn hình. Cú pháp: print("nội dung muốn hiện"). Chữ nằm trong cặp dấu ngoặc kép "..." gọi là chuỗi (string) — kiểu dữ liệu chữ.\n\nMáy tính không đọc được suy nghĩ, không đoán ý — sai một dấu ngoặc, sai một dấu nháy là chương trình báo lỗi ngay. Đó không phải máy "khó tính", mà vì nó cần chính xác tuyệt đối để không hiểu nhầm.',
    workedExample: {
      code: `# Lệnh print() bảo máy hiện một dòng chữ lên màn hình
print("Chao mung den voi lop lap trinh!")

# Có thể gọi print() nhiều lần — mỗi lần một dòng mới
print("Hom nay ban hoc lenh dau tien: print()")`,
      stdinLines: [],
    },
    predict: {
      code: `print("Xin chao cac ban")`,
      question: 'Chạy lệnh print("Xin chao cac ban") thì máy in ra đúng những gì?',
      choices: ['Xin chao cac ban', 'Xin chao (cac ban)', '"Xin chao cac ban"', 'Khong in gi ca'],
      answerIndex: 0,
      explain:
        'print() chỉ in ra NỘI DUNG chữ nằm bên trong dấu ngoặc kép, KHÔNG in kèm cặp dấu ngoặc kép — vậy màn hình hiện đúng Xin chao cac ban, không có dấu " nào cả.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình tự giới thiệu: in tên lớp, rồi in lời chào, rồi in môn học đang theo.',
      lines: [
        'print("Lop lap trinh khoa 1")',
        'print("Xin chao cac ban!")',
        'print("Hom nay chung ta hoc Python")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình dùng 3 lệnh print() để in đúng 3 dòng sau, theo ĐÚNG thứ tự và KHÔNG DẤU (không dấu tiếng Việt):\nDòng 1: Toi dang hoc lap trinh\nDòng 2: Ngon ngu la Python\nDòng 3: Lenh dau tien la print',
      starterCode: `# Viết 3 lệnh print() theo đúng thứ tự đề bài\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Toi dang hoc lap trinh',
          match: 'contains',
          hidden: false,
          label: 'Dòng 1 phải xuất hiện đúng chữ',
        },
        {
          stdinLines: [],
          expected: 'Ngon ngu la Python',
          match: 'contains',
          hidden: false,
          label: 'Dòng 2 phải xuất hiện đúng chữ',
        },
        {
          stdinLines: [],
          expected: 'Lenh dau tien la print',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dòng 3 phải xuất hiện đúng chữ',
        },
        {
          stdinLines: [],
          expected: 'Toi dang hoc lap trinh\nNgon ngu la Python\nLenh dau tien la print\n',
          match: 'exact',
          hidden: true,
          label: 'Ca ẩn: đúng thứ tự và KHÔNG thừa dòng nào khác',
        },
      ],
      hints: [
        'Mỗi dòng cần in dùng ĐÚNG MỘT lệnh print("...") riêng — không gộp nhiều câu vào một print().',
        'Thứ tự các lệnh print() trong code chính là thứ tự chúng hiện trên màn hình — viết đúng thứ tự đề bài.',
        'Ví dụ dòng đầu: print("Toi dang hoc lap trinh") — hai dòng còn lại làm tương tự, đổi đúng nội dung.',
      ],
      sampleSolution: `print("Toi dang hoc lap trinh")\nprint("Ngon ngu la Python")\nprint("Lenh dau tien la print")`,
    },
    homework:
      'Về nhà: viết một chương trình 3 dòng print() tự giới thiệu THẬT về bạn — tên, lớp/trường, và một điều bạn thích. Không cần dấu tiếng Việt nếu chưa quen, viết không dấu cũng được, miễn đúng cú pháp.',
  },
]
