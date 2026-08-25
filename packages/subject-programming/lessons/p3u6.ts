// lessons/p3u6.ts — Bài học P3-U6 (bài 1): JAVASCRIPT cho người đã biết Python.
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
//
// BÀI JAVASCRIPT ĐẦU TIÊN của môn (PR-L7b1) — mở đường cho mạch Web U4–U7. Bài này chạy
// THUẦN console nên chấm được ở cả sandbox iframe lẫn cổng CI node:vm; phần DOM/sự kiện
// (đúng tiêu đề unit) sẽ là bài tiếp theo khi có bộ chấm DOM.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U6_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u6-l1',
    unitId: 'p3-u6',
    language: 'javascript',
    title: 'JavaScript — ngôn ngữ thứ hai, học trong một buổi vì bạn đã biết Python',
    hook: 'Trang web không chạy Python. Muốn cái máy tính tiền của bạn sống được trong trình duyệt để ai cũng bấm thử, nó phải viết bằng JavaScript. Tin vui: bạn đã biết lập trình rồi — buổi này chỉ đổi cách VIẾT, không đổi cách NGHĨ.',
    theory:
      'Cùng một ý tưởng, hai cách viết. Bảng đối chiếu Python → JavaScript:\n\n    print(x)              ->  console.log(x)\n    x = 5                 ->  let x = 5;      (đổi được sau)\n    (hằng số)             ->  const x = 5;    (KHÔNG gán lại được)\n    def f(a, b):          ->  function f(a, b) {\n        return a + b            return a + b;\n                              }\n    if a > b:             ->  if (a > b) {\n        ...                       ...\n    else:                 ->  } else {\n        ...                       ...\n                              }\n    f"Xin chao {ten}"     ->  `Xin chao ${ten}`   (dấu huyền, không phải nháy đơn)\n    # ghi chú            ->  // ghi chú\n\nBa khác biệt phải nhớ, không phải chuyện hình thức:\n\n1. DẤU NGOẶC NHỌN thay cho thụt lề. Python bắt bạn thụt lề đúng; JavaScript thì không quan tâm — khối lệnh do { } quyết định. Vẫn nên thụt lề cho người đọc, nhưng máy nhìn dấu ngoặc.\n\n2. let và const. Mặc định dùng const; chỉ đổi sang let khi bạn THẬT SỰ gán lại giá trị. Người mới hay dùng let khắp nơi rồi lỡ tay ghi đè biến — const là cái phanh miễn phí.\n\n3. CỘNG CHUỖI VỚI SỐ KHÔNG BÁO LỖI. Python ném TypeError; JavaScript lặng lẽ nối chuỗi:\n    "5" + 3   ->  "53"      (nối chuỗi!)\n     5  + 3   ->  8         (cộng số)\nĐây là nguồn lỗi số một của người mới. Mọi thứ đọc từ ô nhập đều là CHUỖI, nên phải đổi kiểu ngay: Number(x) hoặc parseInt(x, 10).\n\nHỆ QUẢ: so sánh cũng có hai loại. == so sánh "hơi lỏng" ("5" == 5 cho true, vì nó tự đổi kiểu); === so sánh CHẶT cả giá trị lẫn kiểu ("5" === 5 cho false). Luật của mọi dự án JavaScript nghiêm túc: LUÔN dùng === và !==, đừng bao giờ dùng ==.\n\nChia lấy phần nguyên: Python có //, JavaScript không có — dùng Math.floor(a / b).\n\nTrong bài học này, input("câu hỏi") hoạt động y như bên Python: đọc lần lượt các dòng bạn điền ở ô "Dữ liệu nhập". Trên trang web thật, dữ liệu sẽ đến từ ô nhập của người dùng — bạn sẽ gặp ở bài DOM kế tiếp.',
    workedExample: {
      code: `// Chương trình JavaScript đầu tiên — cùng logic bài Python, khác cách viết
const ten = "Lan";                       // const: không gán lại được
let soLan = 0;                           // let: sẽ đổi giá trị bên dưới

function chao(nguoi) {                   // function thay cho def
  return \`Xin chao \${nguoi}!\`;           // dấu huyền + \${} thay cho f-string
}

for (let i = 0; i < 3; i++) {            // for của JS: khởi tạo; điều kiện; bước nhảy
  soLan = soLan + 1;
  console.log(chao(ten), "lan thu", soLan);   // console.log thay cho print
}

// Cái bẫy kinh điển: chuỗi cộng số thì NỐI, không cộng
console.log("5" + 3);                    // "53"
console.log(Number("5") + 3);            // 8 — đổi kiểu trước khi tính
console.log("5" == 5, "5" === 5);        // true false — luôn dùng ===`,
      stdinLines: [],
    },
    predict: {
      code: `const a = "10";\nconst b = 5;\nconsole.log(a + b);\nconsole.log(Number(a) + b);`,
      question: 'Chạy đoạn JavaScript này, máy in ra hai dòng gì?',
      choices: ['105 rồi 15', '15 rồi 15', '105 rồi 105', 'Báo lỗi vì cộng chuỗi với số'],
      answerIndex: 0,
      explain:
        'Dòng đầu: a là CHUỖI "10" nên dấu + nối chuỗi, ra "105" — JavaScript không hề báo lỗi, đây chính là chỗ khác Python và là nguồn lỗi số một của người mới. Dòng sau đổi kiểu bằng Number(a) trước rồi mới cộng, ra 15.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình JavaScript: viết hàm tính tiền rồi in thành tiền của 3 ly trà đá 5000 đồng.',
      lines: [
        'function tinhTien(gia, soLuong) {',
        '  return gia * soLuong;',
        '}',
        'const tong = tinhTien(5000, 3);',
        'console.log(`Thanh tien: ${tong} dong`);',
      ],
    },
    make: {
      prompt:
        'Viết LẠI bằng JavaScript đúng bài máy tính tiền bạn đã làm bằng Python ở bậc P2.\n\nViết hàm tinhTien(gia, soLuong) TRẢ VỀ số tiền phải trả:\n- Tiền hàng = gia × soLuong.\n- Nếu tiền hàng TỪ 100.000 đồng trở lên thì giảm 10%, làm tròn xuống đồng nguyên: Math.floor((tong * 90) / 100).\n\nSau đó đọc 2 dòng bằng input(): dòng 1 là giá một món, dòng 2 là số lượng, rồi in ĐÚNG một dòng:\nThanh tien: <số tiền> dong\n\nCẢNH BÁO: input() trả về CHUỖI. Quên Number() thì "5000" * 3 vẫn ra 15000 (JavaScript tự đổi khi nhân) nhưng phép CỘNG sẽ nối chuỗi và bạn sẽ ngồi soi cả buổi — đổi kiểu ngay khi nhận.',
      starterCode: `function tinhTien(gia, soLuong) {\n  // Tính tiền hàng, giảm 10% nếu từ 100000 trở lên, rồi return\n}\n\nconst gia = Number(input("Gia mot mon: "));\nconst soLuong = Number(input("So luong: "));\n// Gọi hàm và in: Thanh tien: <tien> dong\n`,
      testCases: [
        {
          stdinLines: ['5000', '3'],
          expected: 'Thanh tien: 15000 dong',
          match: 'contains',
          hidden: false,
          label: '3 ly trà đá 5.000đ → 15.000đ (chưa tới mốc giảm giá)',
        },
        {
          stdinLines: ['15000', '10'],
          expected: 'Thanh tien: 135000 dong',
          match: 'contains',
          hidden: false,
          label: '10 ly nước cam 15.000đ → 150.000đ, giảm 10% → 135.000đ',
        },
        {
          stdinLines: ['20000', '5'],
          expected: 'Thanh tien: 90000 dong',
          match: 'contains',
          hidden: false,
          label: 'Đúng 100.000đ (RANH GIỚI được giảm) → 90.000đ',
        },
        {
          stdinLines: ['3000', '33'],
          expected: 'Thanh tien: 99000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 99.000đ — sát mốc nhưng CHƯA được giảm',
        },
        {
          stdinLines: ['5000', '0'],
          expected: 'Thanh tien: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mua 0 món',
        },
      ],
      hints: [
        'Khung hàm JavaScript: function tinhTien(gia, soLuong) { ... return ...; } — dấu ngoặc nhọn thay cho thụt lề, và nhớ dấu chấm phẩy cuối câu lệnh.',
        'Bên trong hàm: const tong = gia * soLuong; rồi if (tong >= 100000) { return Math.floor((tong * 90) / 100); } cuối cùng return tong. JavaScript không có toán tử // như Python nên phải dùng Math.floor.',
        'In kết quả bằng chuỗi dấu huyền: console.log(`Thanh tien: ${tinhTien(gia, soLuong)} dong`). Nếu output của bạn ra kiểu "Thanh tien: 150003 dong" thì bạn đã quên Number() — đó là phép NỐI CHUỖI chứ không phải phép cộng.',
      ],
      sampleSolution:
        'function tinhTien(gia, soLuong) {\n  const tong = gia * soLuong;\n  if (tong >= 100000) {\n    return Math.floor((tong * 90) / 100);\n  }\n  return tong;\n}\n\nconst gia = Number(input("Gia mot mon: "));\nconst soLuong = Number(input("So luong: "));\nconsole.log(`Thanh tien: ${tinhTien(gia, soLuong)} dong`);',
    },
    homework:
      'Về nhà: mở lại 3 bài Python bạn thấy dễ nhất ở bậc P1 (bảng cửu chương, đoán số, lọc điểm đậu/rớt) và viết lại bằng JavaScript. Đừng nhìn bản Python khi viết — nhìn xong mới đối chiếu. Chỗ nào bạn phải dừng lại nghĩ chính là chỗ khác biệt thật giữa hai ngôn ngữ, đáng ghi vào sổ tay hơn mọi bảng đối chiếu chép sẵn.',
  },
]
