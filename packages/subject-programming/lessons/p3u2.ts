// lessons/p3u2.ts — Bài học P3-U2: JSON (đọc/ghi/lồng nhau).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u2-l1',
    unitId: 'p3-u2',
    language: 'python',
    title: 'JSON — định dạng để dữ liệu LỒNG NHAU đi được ra khỏi chương trình',
    hook: 'Ở bậc P2 bạn lưu sổ sách bằng CSV. CSV chỉ là bảng phẳng: một đơn hàng có 3 món thì nhét vào một dòng kiểu gì? JSON sinh ra cho đúng chuyện đó — nó giữ nguyên hình dạng dict và list của bạn, và gần như MỌI API trên đời đều nói bằng JSON.',
    theory:
      'JSON (JavaScript Object Notation) là dữ liệu viết dưới dạng VĂN BẢN mà máy nào cũng đọc được. Nhìn gần giống dict Python:\n    {"ten": "Lan", "tuoi": 20, "mon": ["ca phe", "banh"]}\n\nBốn hàm cần nhớ — nhớ theo mẹo: có chữ "s" là làm việc với String (chuỗi), không "s" là làm việc với File.\n    json.dumps(obj)     -> đổi dữ liệu Python thành CHUỖI JSON\n    json.loads(chuoi)   -> đọc CHUỖI JSON thành dữ liệu Python\n    json.dump(obj, f)   -> ghi thẳng vào FILE đang mở\n    json.load(f)        -> đọc thẳng từ FILE đang mở\n\nBảng đổi kiểu (nhớ để khỏi ngạc nhiên):\n    dict <-> object   |   list <-> array   |   str <-> string\n    int/float <-> number   |   True/False <-> true/false   |   None <-> null\n\nBA CÁI BẪY hay dính, biết trước đỡ mất buổi tối:\n1. JSON chỉ chấp nhận NHÁY KÉP. \'{"a": 1}\' hợp lệ, "{\'a\': 1}" thì json.loads ném lỗi.\n2. KHOÁ trong JSON luôn là chuỗi. Ghi dict {1: "mot"} rồi đọc lại, khoá thành "1" — số biến thành chuỗi, so sánh sẽ trượt.\n3. Tiếng Việt có dấu: json.dumps mặc định escape thành \\u00e0... Muốn đọc được bằng mắt thì thêm ensure_ascii=False.\n\nGhi cho người đọc được, thêm indent:\n    json.dump(du_lieu, f, ensure_ascii=False, indent=2)\n\nĐI VÀO DỮ LIỆU LỒNG NHAU: cứ bóc từng lớp, đọc từ trái sang phải.\n    don["items"][0]["gia"]\n    -> lấy khoá "items" (một list) -> phần tử đầu tiên (một dict) -> khoá "gia".\nThiếu khoá thì d["x"] ném KeyError; muốn an toàn dùng d.get("x", 0) để có giá trị mặc định.',
    workedExample: {
      code: `import json

# Dữ liệu LỒNG NHAU: một đơn có nhiều món — CSV không diễn tả nổi, JSON thì tự nhiên
don = {
    "khach": "Lan",
    "items": [
        {"ten": "ca phe", "gia": 25000, "sl": 2},
        {"ten": "banh mi", "gia": 15000, "sl": 1},
    ],
}

# 1) Ghi ra FILE (không "s") — ensure_ascii=False để tiếng Việt đọc được bằng mắt
with open("don_hang.json", "w", encoding="utf-8") as f:
    json.dump(don, f, ensure_ascii=False, indent=2)

# 2) Đọc lại từ FILE — nhận về ĐÚNG dict/list như lúc ghi
with open("don_hang.json", "r", encoding="utf-8") as f:
    doc_lai = json.load(f)

print("Khach:", doc_lai["khach"])
print("Mon dau tien:", doc_lai["items"][0]["ten"])   # bóc từng lớp: list -> dict -> khoá

# 3) Bản CHUỖI (có "s") — dùng khi gửi qua mạng hoặc in ra xem
print(json.dumps(doc_lai["items"][1], ensure_ascii=False))`,
      stdinLines: [],
    },
    predict: {
      code: `import json\n\ngoc = {1: "mot", 2: "hai"}\nlai = json.loads(json.dumps(goc))\nprint(list(lai.keys()))`,
      question: 'Ghi dict ra JSON rồi đọc lại ngay, máy in ra gì?',
      choices: ['[1, 2]', "['1', '2']", '[]', 'Báo lỗi vì khoá không phải chuỗi'],
      answerIndex: 1,
      explain:
        'Bẫy số 2 trong bài: KHOÁ của JSON bắt buộc là chuỗi. Khi dumps, Python tự đổi khoá số 1 thành "1"; lúc loads nó không biết đường đổi ngược, nên bạn nhận về khoá chuỗi. Hậu quả thật: lai[1] sẽ ném KeyError dù trước khi lưu goc[1] chạy ngon.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: đọc chuỗi JSON của một khách rồi in tên món đầu tiên trong đơn.',
      lines: [
        'import json',
        'chuoi = \'{"khach": "Lan", "items": [{"ten": "ca phe"}]}\'',
        'don = json.loads(chuoi)',
        'mon_dau = don["items"][0]["ten"]',
        'print(f"Mon dau tien: {mon_dau}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình tính tiền một đơn hàng nhận dưới dạng JSON.\n\nChương trình đọc MỘT dòng bằng input(): chuỗi JSON của đơn hàng, dạng\n{"khach": "Lan", "items": [{"ten": "ca phe", "gia": 25000, "sl": 2}]}\n- "khach": tên khách.\n- "items": danh sách các món, mỗi món có "gia" (giá một cái) và "sl" (số lượng).\n\nIn ĐÚNG 2 dòng:\nKhach: <tên khách>\nTong: <tổng tiền> dong\n\nTổng tiền = cộng gia × sl của MỌI món. Đơn không có món nào thì tổng là 0.',
      starterCode: `import json\n\ndong = input("Dan JSON don hang: ")\ndon = json.loads(dong)\n\ntong = 0\n# Duyệt don["items"], cộng dồn gia * sl\n\n# In 2 dòng theo đúng mẫu đề bài\n`,
      testCases: [
        {
          stdinLines: [
            '{"khach": "Lan", "items": [{"ten": "ca phe", "gia": 25000, "sl": 2}, {"ten": "banh", "gia": 15000, "sl": 1}]}',
          ],
          expected: 'Khach: Lan\nTong: 65000 dong',
          match: 'contains',
          hidden: false,
          label: '2 món: 25.000×2 + 15.000×1 = 65.000đ',
        },
        {
          stdinLines: ['{"khach": "Nam", "items": [{"ten": "tra da", "gia": 5000, "sl": 3}]}'],
          expected: 'Khach: Nam\nTong: 15000 dong',
          match: 'contains',
          hidden: false,
          label: '1 món: 5.000×3 = 15.000đ',
        },
        {
          stdinLines: ['{"khach": "Khach le", "items": []}'],
          expected: 'Khach: Khach le\nTong: 0 dong',
          match: 'contains',
          hidden: false,
          label: 'RANH GIỚI: đơn rỗng → tổng 0 (đừng để chương trình vỡ)',
        },
        {
          stdinLines: [
            '{"khach": "Quan 3", "items": [{"ten": "a", "gia": 1000, "sl": 0}, {"ten": "b", "gia": 2000, "sl": 7}]}',
          ],
          expected: 'Khach: Quan 3\nTong: 14000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: có món số lượng 0 — vẫn phải cộng đúng, không được bỏ qua nhầm',
        },
      ],
      hints: [
        'json.loads(dong) trả về một DICT. Từ đó don["items"] là một LIST các dict — duyệt nó bằng for như mọi list khác.',
        'Trong vòng lặp, mỗi phần tử là một dict món: tong += mon["gia"] * mon["sl"]. Nhớ khởi tạo tong = 0 TRƯỚC vòng lặp, nếu không đơn rỗng sẽ báo lỗi tên chưa định nghĩa.',
        'Lấy tên khách ra biến riêng cho dễ in: khach = don["khach"], rồi print(f"Khach: {khach}") và print(f"Tong: {tong} dong").',
      ],
      sampleSolution: `import json\n\ndong = input("Dan JSON don hang: ")\ndon = json.loads(dong)\n\ntong = 0\nfor mon in don["items"]:\n    tong += mon["gia"] * mon["sl"]\n\nkhach = don["khach"]\nprint(f"Khach: {khach}")\nprint(f"Tong: {tong} dong")`,
    },
    homework:
      'Về nhà: mở lại sổ chi tiêu CSV của bậc P2 và chuyển sang JSON. Mỗi khoản là một dict {"ngay": ..., "muc": ..., "so_tien": ...}, cả sổ là một list, ghi bằng json.dump(..., ensure_ascii=False, indent=2). Chạy thử: thêm khoản mới, lưu, tắt chương trình, mở lại — dữ liệu còn nguyên và bạn MỞ FILE RA ĐỌC BẰNG MẮT được. Đó là lý do JSON thắng CSV khi dữ liệu bắt đầu lồng nhau.',
  },
]
