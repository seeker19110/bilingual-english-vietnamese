// lessons/p3u1.ts — Bài học P3-U1: THƯ VIỆN (import, đọc tài liệu, pip).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
//
// LƯU Ý NGƯỜI SOẠN: bài Make chỉ được dùng THƯ VIỆN CHUẨN (statistics, json, csv...) vì cổng
// lessonsPython.test.ts chạy python3 trần trên CI và sandbox Pyodide trong trình duyệt KHÔNG
// có mạng — `pip install requests` chỉ dạy ở lý thuyết + bài về nhà (làm trên máy thật).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u1-l1',
    unitId: 'p3-u1',
    title: 'Thư viện — đứng lên vai người đi trước thay vì tự viết lại',
    hook: 'Muốn tính trung bình cộng bạn tự viết vòng lặp cũng được. Nhưng tính trung vị, độ lệch chuẩn, làm tròn tiền tệ, gọi API thời tiết... tự viết hết thì hết đời. Người ta viết sẵn rồi, đóng gói thành THƯ VIỆN — việc của bạn là biết tìm và biết đọc tài liệu.',
    theory:
      'THƯ VIỆN là code người khác viết sẵn, bạn import về dùng. Có hai loại:\n\n1. THƯ VIỆN CHUẨN — cài sẵn cùng Python, dùng ngay: math, random, datetime, json, csv, statistics, collections... Bạn đã gặp random và datetime ở bậc trước.\n2. THƯ VIỆN NGOÀI — phải cài thêm bằng pip: requests (gọi API qua mạng), pandas (dữ liệu bảng), matplotlib (vẽ biểu đồ).\n\nCài thư viện ngoài, gõ ở CỬA SỔ DÒNG LỆNH (không phải trong file Python):\n    pip install requests\nGhi lại những gì dự án cần vào file requirements.txt để máy khác cài đúng bộ:\n    requests==2.32.3\nMáy khác chỉ cần: pip install -r requirements.txt\n\nBa cách import, dùng đúng chỗ:\n    import statistics                      -> gọi statistics.mean(...)\n    from statistics import mean, median    -> gọi mean(...) cho gọn\n    import statistics as st                -> đặt biệt danh, gọi st.mean(...)\nTránh "from statistics import *": kéo về cả đống tên, đè lên biến của bạn lúc nào không hay.\n\nKỸ NĂNG QUAN TRỌNG NHẤT của unit này KHÔNG phải nhớ tên hàm — mà là ĐỌC TÀI LIỆU một thư viện lạ. Bốn câu hỏi luôn hỏi khi gặp hàm mới:\n- Hàm này NHẬN vào cái gì? (một số? một danh sách? một chuỗi?)\n- Nó TRẢ VỀ cái gì, kiểu gì?\n- Nó có thể NÉM LỖI khi nào? (statistics.mean([]) ném StatisticsError vì danh sách rỗng)\n- Có ví dụ chạy được để chép ra thử không?\n\nTra tài liệu ngay trong Python, không cần mạng:\n    import statistics\n    help(statistics.median)    # in mô tả hàm\n    print(dir(statistics))     # liệt kê mọi thứ thư viện có\n\nVí dụ thư viện ngoài (CHẠY TRÊN MÁY THẬT, không chạy trong trang web này vì sandbox không có mạng):\n    import requests\n    r = requests.get("https://api.exchangerate-api.com/v4/latest/USD", timeout=10)\n    ty_gia = r.json()["rates"]["VND"]   # .json() đổi phản hồi thành dict Python\n    print(ty_gia)\nĐọc tài liệu requests bạn sẽ thấy đúng bốn câu hỏi trên: get() nhận URL, trả về đối tượng Response, ném lỗi khi mất mạng/quá hạn, và có ví dụ ngay trang đầu.',
    workedExample: {
      code: `# Dùng thư viện CHUẨN statistics — không phải tự viết công thức
import statistics                       # cách 1: import cả thư viện
from statistics import median           # cách 2: lấy đúng hàm cần

diem = [7, 9, 10, 4, 9]

print("Trung binh:", statistics.mean(diem))   # gọi qua tên thư viện
print("Trung vi:", median(diem))              # gọi thẳng vì đã from-import
print("Hay gap nhat:", statistics.mode(diem)) # mode = giá trị xuất hiện nhiều nhất

# Đọc tài liệu ngay trong code, không cần mở trình duyệt:
print(statistics.median.__doc__.splitlines()[0])   # dòng mô tả đầu tiên của hàm`,
      stdinLines: [],
    },
    predict: {
      code: `from statistics import mean, median\n\nso = [1, 2, 300]\nprint(median(so))`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['101', '2', '300', 'Báo lỗi vì chưa pip install statistics'],
      answerIndex: 1,
      explain:
        'median là TRUNG VỊ — số nằm giữa khi sắp xếp, ở đây là 2; còn 101 là trung bình cộng (mean). Hai hàm khác nhau, đọc tài liệu là biết ngay. Và statistics là thư viện CHUẨN, cài sẵn cùng Python, không cần pip install.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: dùng thư viện statistics tính và in trung bình cộng của danh sách điểm.',
      lines: [
        'import statistics',
        'diem = [6, 8, 10]',
        'tb = statistics.mean(diem)',
        'print(f"Trung binh: {tb}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình chấm bảng điểm bằng thư viện chuẩn statistics (KHÔNG tự viết công thức).\n\nChương trình đọc MỘT dòng bằng input(): các điểm cách nhau bằng khoảng trắng, ví dụ "8 9 10".\nSau đó in ĐÚNG 2 dòng:\nTrung binh: <trung bình cộng, 1 chữ số thập phân>\nTrung vi: <trung vị, 1 chữ số thập phân>\n\nVí dụ với "1 2 100": trung bình 34.333... → in 34.3; trung vị là 2 → in 2.0.\n\nGợi ý định dạng 1 chữ số thập phân: f"{gia_tri:.1f}".',
      starterCode: `import statistics\n\ndong = input("Nhap cac diem, cach nhau khoang trang: ")\n# Tách chuỗi thành danh sách SỐ (nhớ đổi kiểu!)\ndiem = ...\n# Dùng statistics.mean và statistics.median rồi in 2 dòng\n`,
      testCases: [
        {
          stdinLines: ['8 9 10'],
          expected: 'Trung binh: 9.0\nTrung vi: 9.0',
          match: 'contains',
          hidden: false,
          label: '"8 9 10" → trung bình 9.0, trung vị 9.0',
        },
        {
          stdinLines: ['1 2 100'],
          expected: 'Trung binh: 34.3\nTrung vi: 2.0',
          match: 'contains',
          hidden: false,
          label: '"1 2 100" → trung bình 34.3 nhưng trung vị chỉ 2.0 (khác nhau rõ rệt)',
        },
        {
          stdinLines: ['5'],
          expected: 'Trung binh: 5.0\nTrung vi: 5.0',
          match: 'contains',
          hidden: false,
          label: 'Chỉ 1 điểm duy nhất → cả hai đều là 5.0',
        },
        {
          stdinLines: ['3 1 4 2'],
          expected: 'Trung binh: 2.5\nTrung vi: 2.5',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: SỐ CHẴN điểm — trung vị là trung bình của hai số giữa',
        },
        {
          stdinLines: ['10 0 10 0'],
          expected: 'Trung binh: 5.0\nTrung vi: 5.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: có điểm 0 — đừng lọc mất số 0',
        },
      ],
      hints: [
        'input() luôn trả về CHUỖI. "8 9 10".split() cho bạn danh sách chuỗi ["8", "9", "10"] — vẫn chưa phải số.',
        'Đổi cả danh sách sang số: diem = [float(x) for x in dong.split()]. Dùng float chứ đừng int, vì đề in 1 chữ số thập phân.',
        'In đúng định dạng: print(f"Trung binh: {statistics.mean(diem):.1f}") rồi tương tự với statistics.median(diem). Chú ý :.1f nằm TRONG dấu ngoặc nhọn.',
      ],
      sampleSolution: `import statistics\n\ndong = input("Nhap cac diem, cach nhau khoang trang: ")\ndiem = [float(x) for x in dong.split()]\n\nprint(f"Trung binh: {statistics.mean(diem):.1f}")\nprint(f"Trung vi: {statistics.median(diem):.1f}")`,
    },
    homework:
      'Về nhà (làm trên MÁY THẬT, không làm trong trang web vì sandbox không có mạng): mở cửa sổ dòng lệnh, gõ "pip install requests", rồi viết 10 dòng lấy tỷ giá USD→VND từ một API công khai và in ra. Trước khi viết, mở tài liệu requests và tự trả lời 4 câu hỏi trong bài: get() nhận gì, trả về gì, ném lỗi khi nào, ví dụ ở đâu. Xong thì tạo file requirements.txt ghi "requests" vào — đó là thói quen của dự án thật.',
  },
]
