// lessons/p2u5.ts — Bài học P2-U5: LIST COMPREHENSION & SORT có key.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u5-l1',
    unitId: 'p2-u5',
    language: 'python',
    title: 'Comprehension & sort — lọc và sắp xếp trong một dòng',
    hook: 'Chủ quán hỏi: "Cho tôi xem những món từ 10.000 trở lên, sắp từ rẻ tới đắt". Với vòng lặp bạn viết 5 dòng. Với comprehension và sorted, đúng một dòng — và đọc lên gần như đọc tiếng Anh.',
    theory:
      'LIST COMPREHENSION là cách viết gọn của "duyệt list, lọc, tạo list mới":\n\ncao = [g for g in gia if g >= 10000]\n\nĐọc là: "lấy g, với mỗi g trong gia, nếu g >= 10000". Nó tương đương 4 dòng vòng lặp cao = []; for g in gia: if g >= 10000: cao.append(g) — nhưng ngắn và khó viết sai hơn.\n\nCó thể BIẾN ĐỔI luôn phần vế trái: [g * 2 for g in gia] nhân đôi mọi giá; [t.title() for t in ten] chuẩn hoá cả danh sách tên.\n\nSẮP XẾP:\n- sorted(gia) trả về list MỚI đã sắp tăng dần, list gốc giữ nguyên.\n- gia.sort() sắp xếp NGAY TRÊN list gốc và trả về None — nhớ kỹ: viết gia = gia.sort() là mất sạch dữ liệu.\n- sorted(gia, reverse=True) sắp giảm dần.\n- sorted(mon, key=...) sắp theo TIÊU CHÍ. Ví dụ với list các tuple (tên, giá): sorted(mon, key=lambda m: m[1]) sắp theo giá. lambda m: m[1] chỉ là cách viết gọn của "hàm nhận m, trả về m[1]".\n\nMẹo: sắp xếp dict theo giá trị cũng dùng key — sorted(menu.items(), key=lambda c: c[1]).',
    workedExample: {
      code: `# Lọc và sắp xếp menu trong vài dòng
gia = [12000, 5000, 30000, 8000, 15000]

cao = [g for g in gia if g >= 10000]     # comprehension: lọc món từ 10k
print(f"Mon tu 10k: {cao}")

print(f"Sap tang dan: {sorted(cao)}")     # sorted trả list mới
print(f"Sap giam dan: {sorted(cao, reverse=True)}")

mon = [("tra da", 5000), ("nuoc cam", 15000), ("sua dau", 10000)]
theo_gia = sorted(mon, key=lambda m: m[1])   # sắp theo phần tử thứ 2 của tuple = giá
for ten, g in theo_gia:
    print(f"{ten}: {g} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `gia = [3, 1, 2]\nkq = gia.sort()\nprint(kq)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['[1, 2, 3]', 'None', '[3, 1, 2]', 'Báo lỗi'],
      answerIndex: 1,
      explain:
        'Phương thức .sort() sắp xếp NGAY trên list gốc và trả về None, nên kq là None. Muốn cầm kết quả trong tay thì dùng kq = sorted(gia). Đây là bẫy khiến rất nhiều người mới mất trắng dữ liệu.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: đọc ngưỡng giá, lọc các món từ ngưỡng trở lên rồi in danh sách đã sắp tăng dần.',
      lines: [
        'gia = [12000, 5000, 30000, 8000, 15000]',
        'nguong = int(input("Nguong gia: "))',
        'cao = [g for g in gia if g >= nguong]',
        'cao = sorted(cao)',
        'print(f"Ket qua: {cao}")',
      ],
    },
    make: {
      prompt:
        'Cho sẵn bảng giá: gia = [12000, 5000, 30000, 8000, 15000].\n\nChương trình đọc MỘT số nguyên bằng input() là NGƯỠNG giá, rồi in đúng hai dòng:\nMon dat: <các giá TỪ ngưỡng trở lên, sắp TĂNG dần, cách nhau bằng dấu cách>\nSo mon: <số món thoả điều kiện>\n\nVí dụ nhập 10000 → in:\nMon dat: 12000 15000 30000\nSo mon: 3\n\nNếu không món nào thoả thì dòng đầu chỉ có "Mon dat:" (không có số nào phía sau) và So mon: 0.',
      starterCode: `gia = [12000, 5000, 30000, 8000, 15000]\nnguong = int(input("Nguong gia: "))\n# Lọc + sắp xếp, rồi in 2 dòng theo mẫu của đề\n`,
      testCases: [
        {
          stdinLines: ['10000'],
          expected: 'Mon dat: 12000 15000 30000\nSo mon: 3',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 10.000đ → 3 món, phải sắp tăng dần',
        },
        {
          stdinLines: ['5000'],
          expected: 'Mon dat: 5000 8000 12000 15000 30000\nSo mon: 5',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 5.000đ (RANH GIỚI) → lấy hết 5 món',
        },
        {
          stdinLines: ['50000'],
          expected: 'Mon dat:\nSo mon: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ngưỡng quá cao, không món nào thoả',
        },
        {
          stdinLines: ['30000'],
          expected: 'Mon dat: 30000\nSo mon: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỉ đúng món đắt nhất lọt lưới',
        },
      ],
      hints: [
        'Lọc bằng comprehension: cao = [g for g in gia if g >= nguong]. Chú ý "từ ngưỡng trở lên" là >= chứ không phải >.',
        'Sắp tăng dần bằng sorted(cao) — nhớ hứng kết quả vào biến, đừng dùng .sort() rồi in giá trị trả về (nó là None).',
        'In các số cách nhau bằng dấu cách: chúng đang là số nên phải đổi sang chuỗi trước — " ".join(str(g) for g in cao). Khi list rỗng, join trả về chuỗi rỗng nên dòng đầu tự thành "Mon dat:" đúng như đề.',
      ],
      sampleSolution: `gia = [12000, 5000, 30000, 8000, 15000]\nnguong = int(input("Nguong gia: "))\n\ncao = sorted([g for g in gia if g >= nguong])\nchuoi = " ".join(str(g) for g in cao)\n\nprint(f"Mon dat: {chuoi}".rstrip())\nprint(f"So mon: {len(cao)}")`,
    },
    homework:
      'Về nhà: đổi bảng giá thành list các tuple ("ten mon", gia) rồi in TOP 3 món đắt nhất kèm tên — dùng sorted(..., key=lambda m: m[1], reverse=True)[:3]. Đây đúng là truy vấn "bán chạy nhất" mà mọi phần mềm bán hàng đều có.',
    srsCards: [
      {
        hoi: 'kq = gia.sort() thì biến kq nhận giá trị gì?',
        dap: 'None. .sort() sắp xếp ngay trên list gốc và trả về None — không phải list đã sắp. Muốn cầm kết quả trong tay phải dùng kq = sorted(gia).',
      },
      {
        hoi: 'Comprehension [g for g in gia if g >= 10000] tương đương với đoạn code vòng lặp nào?',
        dap: 'cao = []\\nfor g in gia:\\n    if g >= 10000:\\n        cao.append(g). Comprehension chỉ là cách viết gọn của "duyệt, lọc, tạo list mới" — kết quả y hệt nhưng ngắn và ít lỗi cú pháp hơn.',
      },
      {
        hoi: 'sorted(mon, key=lambda m: m[1]) dùng để làm gì?',
        dap: 'Sắp xếp list mon theo TIÊU CHÍ do mình chọn — ở đây là theo phần tử thứ 2 (m[1]) của mỗi tuple, ví dụ sắp món theo giá thay vì sắp theo thứ tự mặc định.',
      },
    ],
  },
]
