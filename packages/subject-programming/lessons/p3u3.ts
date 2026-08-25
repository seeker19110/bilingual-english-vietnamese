// lessons/p3u3.ts — Bài học P3-U3: DỮ LIỆU BẢNG (csv, tổng hợp, biểu đồ).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
//
// LƯU Ý NGƯỜI SOẠN: pandas/matplotlib KHÔNG có trên runner CI lẫn trong sandbox Pyodide, nên
// bài Make dùng thư viện chuẩn csv + biểu đồ cột bằng ký tự. pandas dạy ở lý thuyết + về nhà.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u3-l1',
    unitId: 'p3-u3',
    language: 'python',
    title: 'Dữ liệu bảng — từ file CSV thô đến con số nói được điều gì đó',
    hook: 'Sếp đưa bạn file bán hàng 2.000 dòng và hỏi "món nào ra tiền nhất?". Mở Excel cuộn tay thì mất buổi chiều và lần sau lại làm lại. Viết 15 dòng Python thì lần sau chỉ mất 2 giây — và đó chính là việc dân dữ liệu làm hằng ngày.',
    theory:
      'Ba bước LUÔN GIỐNG NHAU với mọi file bảng: ĐỌC vào -> TỔNG HỢP (gộp nhóm, cộng, đếm) -> TRÌNH BÀY (sắp xếp, biểu đồ).\n\n1) ĐỌC — dùng thư viện chuẩn csv, ĐỪNG dùng dong.split(","). Lý do: ô dữ liệu thật hay chứa dấu phẩy bên trong, khi đó nó được bọc nháy kép:\n    "banh mi, pate",20000\nsplit(",") cắt thành 3 mảnh sai bét; csv.reader hiểu nháy kép và trả đúng 2 ô.\n\n    import csv\n    with open("ban_hang.csv", encoding="utf-8") as f:\n        for hang in csv.reader(f):        # mỗi hàng là một LIST các ô\n            print(hang[0], hang[1])\n\nCó dòng tiêu đề thì DictReader tiện hơn — gọi ô theo TÊN CỘT, không phải nhớ số thứ tự:\n    for hang in csv.DictReader(f):\n        print(hang["ten"], hang["so_tien"])\nNhớ: mọi ô đọc từ CSV đều là CHUỖI. Muốn cộng phải int(...) hoặc float(...).\n\n2) TỔNG HỢP — khuôn "gộp nhóm rồi cộng" bằng dict, thuộc lòng khuôn này là làm được 80% việc:\n    tong = {}\n    for ten, tien in cac_hang:\n        tong[ten] = tong.get(ten, 0) + int(tien)\n.get(ten, 0) nghĩa là "chưa có món này thì coi như 0" — nhờ vậy không cần if kiểm tra khoá.\n\n3) TRÌNH BÀY — sắp xếp giảm dần theo giá trị:\n    for ten, tien in sorted(tong.items(), key=lambda x: x[1], reverse=True):\n        ...\nkey=lambda x: x[1] nghĩa là "so sánh bằng phần tử thứ 2 của mỗi cặp" (số tiền), reverse=True là giảm dần.\n\nBIỂU ĐỒ mà không cần thư viện vẽ: một cột chính là chuỗi ký tự lặp lại.\n    print(ten, "#" * (tien // 10000))     # mỗi dấu # là 10.000 đồng\nMắt người bắt hình nhanh hơn bắt số — bảng có cột nhìn ra ngay ai đứng đầu.\n\nCÒN PANDAS THÌ SAO? Trên máy thật, "pip install pandas matplotlib" cho bạn viết ngắn hơn nhiều:\n    import pandas as pd\n    bang = pd.read_csv("ban_hang.csv")\n    tong = bang.groupby("ten")["so_tien"].sum().sort_values(ascending=False)\n    tong.plot(kind="bar")\nBa dòng đó làm đúng ba bước bạn vừa viết tay. Học tay trước rồi mới dùng pandas là có lý: khi pandas cho kết quả lạ, bạn biết nó đang làm gì để mà sửa. (Sandbox trong trang này không cài được pandas — phần đó để dành cho bài về nhà.)',
    workedExample: {
      code: `import csv

# --- Tạo sẵn một file CSV bán hàng để có dữ liệu thật mà đọc ---
with open("ban_hang.csv", "w", encoding="utf-8") as f:
    f.write("ten,so_tien\\n")
    f.write("ca phe,25000\\n")
    f.write('"banh mi, pate",20000\\n')   # ô có dấu phẩy BÊN TRONG, phải bọc nháy kép
    f.write("ca phe,25000\\n")

# --- Bước 1: ĐỌC bằng DictReader, gọi ô theo tên cột ---
tong = {}
with open("ban_hang.csv", encoding="utf-8") as f:
    for hang in csv.DictReader(f):
        ten = hang["ten"]
        # --- Bước 2: TỔNG HỢP — khuôn gộp nhóm rồi cộng ---
        tong[ten] = tong.get(ten, 0) + int(hang["so_tien"])   # nhớ int(): CSV toàn chuỗi

# --- Bước 3: TRÌNH BÀY — sắp giảm dần + vẽ cột bằng ký tự ---
for ten, tien in sorted(tong.items(), key=lambda x: x[1], reverse=True):
    cot = "#" * (tien // 10000)          # mỗi dấu # là 10.000 đồng
    print(f"{ten}: {tien} {cot}")`,
      stdinLines: [],
    },
    predict: {
      code: `import csv\n\nhang = list(csv.reader(['"banh mi, pate",20000']))[0]\nprint(len(hang))`,
      question: 'Dòng CSV có dấu phẩy nằm trong ô được bọc nháy kép — csv.reader tách ra mấy ô?',
      choices: ['3', '2', '4', 'Báo lỗi'],
      answerIndex: 1,
      explain:
        'csv.reader hiểu luật nháy kép: "banh mi, pate" là MỘT ô dù bên trong có dấu phẩy, cộng ô 20000 là 2 ô. Nếu bạn dùng dong.split(",") thì được 3 mảnh sai — đó chính là lý do phải dùng thư viện csv thay vì tự cắt chuỗi.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành đoạn tổng hợp doanh thu theo món từ danh sách hàng đã đọc, rồi in giảm dần.',
      lines: [
        'tong = {}',
        'for ten, tien in cac_hang:',
        '    tong[ten] = tong.get(ten, 0) + int(tien)',
        'for ten, tien in sorted(tong.items(), key=lambda x: x[1], reverse=True):',
        '    print(f"{ten}: {tien}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình báo cáo doanh thu theo món.\n\nChương trình đọc bằng input():\n- Dòng đầu: một số n — số bản ghi bán hàng.\n- n dòng tiếp theo: mỗi dòng một bản ghi dạng CSV "<ten mon>,<so tien>". Tên món CÓ THỂ chứa dấu phẩy và khi đó được bọc nháy kép, ví dụ: "banh mi, pate",20000 — vì vậy phải đọc bằng thư viện csv, đừng dùng split(",").\n\nIn ra: mỗi món MỘT dòng, sắp xếp GIẢM DẦN theo tổng tiền (hai món bằng nhau thì giữ nguyên thứ tự xuất hiện), theo mẫu:\n<ten mon>: <tong tien> <cot>\ntrong đó <cot> là dấu # lặp lại (tổng tiền // 10000) lần — dưới 10.000đ thì không có dấu # nào.\nCuối cùng in một dòng:\nTong doanh thu: <tổng tất cả> dong',
      starterCode: `import csv\n\nn = int(input("So ban ghi: "))\ncac_dong = []\nfor _ in range(n):\n    cac_dong.append(input())\n\n# Đọc bằng csv.reader(cac_dong), gộp nhóm cộng dồn vào dict\ntong = {}\n\n# Sắp giảm dần, in từng món kèm cột #, rồi in tổng doanh thu\n`,
      testCases: [
        {
          stdinLines: ['3', 'ca phe,25000', 'banh,15000', 'ca phe,25000'],
          expected: 'ca phe: 50000 #####\nbanh: 15000 #\nTong doanh thu: 65000 dong',
          match: 'contains',
          hidden: false,
          label: 'Cà phê bán 2 lần → 50.000đ đứng đầu; bánh 15.000đ',
        },
        {
          stdinLines: ['1', 'tra da,5000'],
          expected: 'tra da: 5000\nTong doanh thu: 5000 dong',
          match: 'contains',
          hidden: false,
          label: 'RANH GIỚI: 5.000đ < 10.000đ → cột rỗng, không có dấu #',
        },
        {
          stdinLines: ['2', '"banh mi, pate",20000', 'ca phe,10000'],
          expected: 'banh mi, pate: 20000 ##\nca phe: 10000 #\nTong doanh thu: 30000 dong',
          match: 'contains',
          hidden: false,
          label: 'Tên món CÓ dấu phẩy bên trong — split(",") sẽ hỏng ở ca này',
        },
        {
          stdinLines: ['2', 'a,10000', 'b,10000'],
          expected: 'a: 10000 #\nb: 10000 #\nTong doanh thu: 20000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hai món BẰNG NHAU → giữ nguyên thứ tự xuất hiện',
        },
        {
          stdinLines: ['3', 'x,0', 'y,30000', 'x,10000'],
          expected: 'y: 30000 ###\nx: 10000 #\nTong doanh thu: 40000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: có bản ghi 0 đồng — vẫn cộng đúng, không bỏ sót món',
        },
      ],
      hints: [
        'csv.reader nhận BẤT KỲ danh sách chuỗi nào, không nhất thiết phải là file: csv.reader(cac_dong) sẽ trả về từng hàng đã tách ô đúng luật nháy kép.',
        'Khuôn gộp nhóm: for ten, tien in csv.reader(cac_dong): tong[ten] = tong.get(ten, 0) + int(tien). Nhớ int() vì ô CSV là chuỗi.',
        'Cột biểu đồ nên tính ra biến riêng trước khi in cho dễ đọc: cot = "#" * (tien // 10000), rồi print(f"{ten}: {tien} {cot}"). Sắp xếp: sorted(tong.items(), key=lambda x: x[1], reverse=True) — sorted giữ nguyên thứ tự với các giá trị bằng nhau nên ca hoà không cần xử lý thêm.',
      ],
      sampleSolution: `import csv\n\nn = int(input("So ban ghi: "))\ncac_dong = []\nfor _ in range(n):\n    cac_dong.append(input())\n\ntong = {}\nfor ten, tien in csv.reader(cac_dong):\n    tong[ten] = tong.get(ten, 0) + int(tien)\n\ntong_tat_ca = 0\nfor ten, tien in sorted(tong.items(), key=lambda x: x[1], reverse=True):\n    cot = "#" * (tien // 10000)\n    print(f"{ten}: {tien} {cot}")\n    tong_tat_ca += tien\n\nprint(f"Tong doanh thu: {tong_tat_ca} dong")`,
    },
    homework:
      'Về nhà (trên máy thật): "pip install pandas matplotlib", rồi làm lại đúng bài này bằng 3 dòng pandas — read_csv, groupby("ten")["so_tien"].sum().sort_values(ascending=False), .plot(kind="bar") rồi plt.show(). So sánh với bản viết tay của bạn: kết quả có khớp không? Nếu lệch, bản viết tay là thước đo để bạn tìm ra mình hiểu sai chỗ nào ở pandas. Sau đó thử với file điểm hoặc file lương thật của bạn.',
  },
]
