// lessons/p2u3.ts — Bài học P2-U3: CHUỖI chuyên sâu (split/join/strip/format).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u3-l1',
    unitId: 'p2-u3',
    language: 'python',
    title: 'Chuỗi chuyên sâu — chuẩn hoá họ tên người dùng nhập bậy',
    hook: 'Người dùng gõ tên vào form không bao giờ đẹp: thừa khoảng trắng đầu cuối, gõ hai ba dấu cách giữa chữ, lúc HOA lúc thường. Nếu bạn lưu thẳng vào sổ, sau này tìm "Nguyen Van An" sẽ không ra. Chuẩn hoá chuỗi là việc lập trình viên nào cũng phải làm.',
    theory:
      'Chuỗi (string) có sẵn nhiều phương thức xử lý. Điểm quan trọng: chúng TRẢ VỀ chuỗi mới, KHÔNG sửa chuỗi cũ (chuỗi trong Python là bất biến). Phải hứng lại: ten = ten.strip().\n\n- .strip(): bỏ khoảng trắng ở HAI ĐẦU. (.lstrip()/.rstrip() cho một đầu.)\n- .lower() / .upper(): chuyển hết thường / hết hoa. Dùng .lower() khi SO SÁNH để "Tra Da" và "tra da" khớp nhau.\n- .title(): viết hoa chữ cái đầu mỗi từ.\n- .split(): cắt chuỗi thành LIST theo khoảng trắng — gọi không tham số thì nhiều dấu cách liền nhau cũng gộp làm một, rất hợp để dọn tên. .split(",") thì cắt theo dấu phẩy.\n- " ".join(danh_sach): nối list chuỗi lại thành một chuỗi, chèn dấu cách vào giữa. Đây là chiều ngược của split.\n- .replace(a, b): thay mọi lần xuất hiện của a bằng b.\n\nMẹo dọn tên gọn nhất: " ".join(ten.split()) — cắt ra rồi nối lại, mọi khoảng trắng thừa tự biến mất.',
    workedExample: {
      code: `# Dọn một dòng dữ liệu bẩn thành họ tên chuẩn
tho = "   nguyen   VAN an  "        # dữ liệu người dùng gõ vào

phan = tho.split()                   # cắt theo khoảng trắng -> ['nguyen', 'VAN', 'an']
print(phan)

sach = " ".join(phan)                # nối lại, mỗi từ cách nhau đúng 1 dấu cách
print(f"[{sach}]")                   # ngoặc vuông để thấy rõ hết khoảng trắng thừa

chuan = sach.title()                 # viết hoa chữ đầu mỗi từ
print(f"Ho ten: {chuan}")
print(f"Ma tra cuu: {chuan.lower().replace(' ', '_')}")`,
      stdinLines: [],
    },
    predict: {
      code: `ten = "  an  "\nten.strip()\nprint(f"[{ten}]")`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['[an]', '[  an  ]', '[an  ]', 'Báo lỗi'],
      answerIndex: 1,
      explain:
        'strip() trả về chuỗi MỚI đã cắt, nhưng kết quả không được gán vào đâu nên biến ten vẫn nguyên chuỗi cũ có khoảng trắng. Phải viết ten = ten.strip() mới đổi được — đây là bẫy kinh điển của chuỗi bất biến.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: đọc họ tên người dùng nhập, dọn khoảng trắng thừa, viết hoa chữ đầu mỗi từ rồi in ra.',
      lines: [
        'tho = input("Ho ten: ")',
        'phan = tho.split()',
        'sach = " ".join(phan)',
        'chuan = sach.title()',
        'print(f"Ho ten: {chuan}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình chuẩn hoá họ tên khách hàng.\n\nĐọc MỘT dòng bằng input() (có thể thừa khoảng trắng đầu/cuối và nhiều dấu cách giữa các từ, chữ hoa thường lộn xộn), rồi in đúng hai dòng:\nHo ten: <họ tên đã dọn, viết hoa chữ cái đầu mỗi từ>\nSo tu: <số từ trong tên>\n\nVí dụ nhập "  nguyen   VAN an " → in:\nHo ten: Nguyen Van An\nSo tu: 3',
      starterCode: `tho = input("Ho ten: ")\n# Dọn khoảng trắng thừa, chuẩn hoá hoa/thường, rồi in 2 dòng theo mẫu\n`,
      testCases: [
        {
          stdinLines: ['  nguyen   VAN an '],
          expected: 'Ho ten: Nguyen Van An\nSo tu: 3',
          match: 'contains',
          hidden: false,
          label: 'Tên bẩn đủ kiểu: thừa khoảng trắng + hoa thường lộn xộn',
        },
        {
          stdinLines: ['TRAN THI B'],
          expected: 'Ho ten: Tran Thi B\nSo tu: 3',
          match: 'contains',
          hidden: false,
          label: 'Tên gõ hết chữ HOA',
        },
        {
          stdinLines: ['   le    hoang   duc  minh   '],
          expected: 'Ho ten: Le Hoang Duc Minh\nSo tu: 4',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tên 4 từ, khoảng trắng thừa khắp nơi',
        },
      ],
      hints: [
        'Cắt chuỗi thành list các từ bằng tho.split() — gọi KHÔNG tham số thì mọi khoảng trắng thừa tự bị bỏ qua, bạn không phải strip() riêng.',
        'Từ list các từ, nối lại bằng " ".join(phan) rồi .title() để viết hoa chữ đầu. Số từ chính là len(phan).',
        'Hai dòng in riêng: print(f"Ho ten: {chuan}") rồi print(f"So tu: {len(phan)}"). Kiểm lại thứ tự đúng như đề.',
      ],
      sampleSolution: `tho = input("Ho ten: ")\nphan = tho.split()\nchuan = " ".join(phan).title()\n\nprint(f"Ho ten: {chuan}")\nprint(f"So tu: {len(phan)}")`,
    },
    homework:
      'Về nhà: lấy danh sách tên trong nhóm chat lớp/gia đình, dán vào một chuỗi ngăn cách bằng dấu phẩy rồi dùng .split(",") + .strip() để dọn từng tên. Bạn vừa làm đúng việc mà mọi phần mềm nhập liệu đều phải làm.',
    srsCards: [
      {
        hoi: 'Gọi ten.strip() mà không gán lại thì biến ten có đổi không? Vì sao?',
        dap: 'Không đổi. Chuỗi trong Python bất biến — mọi phương thức như strip()/lower()/upper() trả về chuỗi MỚI, không sửa chuỗi cũ. Phải viết ten = ten.strip() mới cập nhật được.',
      },
      {
        hoi: 'Cách gọn nhất để dọn sạch mọi khoảng trắng thừa (đầu, cuối, và thừa ở giữa) trong một chuỗi tên?',
        dap: '" ".join(ten.split()) — split() không tham số tự gộp mọi khoảng trắng liên tiếp thành một, rồi join lại với đúng một dấu cách giữa các từ.',
      },
      {
        hoi: 'Vì sao nên .lower() dữ liệu trước khi so sánh hai chuỗi?',
        dap: 'Vì so sánh chuỗi phân biệt hoa/thường — "Tra Da" khác "tra da" theo Python dù người đọc thấy giống nhau. .lower() cả hai vế trước khi so thì mới khớp đúng ý người dùng.',
      },
    ],
  },
]
