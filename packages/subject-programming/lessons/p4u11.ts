// lessons/p4u11.ts — Bài học P4-U11: GENERIC CƠ BẢN (kèm union type).
// Làn A (chạy thật qua tsc) — tiếp nối U10. Trọng tâm: vì sao viết MỘT hàm generic tốt hơn
// hẳn viết ba hàm trùng lặp cho ba kiểu dữ liệu, và tốt hơn hẳn dùng any (thứ vừa học ở U10
// là phải tránh).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U11_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u11-l1',
    unitId: 'p4-u11',
    language: 'typescript',
    title: 'Generic — viết một hàm dùng được cho mọi kiểu, mà vẫn giữ kiểm tra kiểu',
    hook: 'Bạn cần một hàm "lấy phần tử đầu tiên của mảng" — nhưng có lúc mảng đó chứa số, có lúc chứa tên khách hàng (chuỗi), có lúc chứa cả đối tượng SanPham của bài trước. Viết ba hàm layPhanTuDauSo, layPhanTuDauTen, layPhanTuDauSanPham giống hệt nhau chỉ khác mỗi kiểu là chép code ba lần. Còn viết layPhanTuDau(ds: any[]): any thì lại đúng thứ U10 vừa dạy là phải tránh.',
    theory:
      'GENERIC là cách viết một hàm (hoặc kiểu) mà KIỂU DỮ LIỆU cụ thể được để trống lúc viết, và chỉ xác định khi hàm được GỌI. Cú pháp: đặt một chữ hoa (quy ước thường là T) trong dấu <>, ngay sau tên hàm:\n\n  function layPhanTuDau<T>(ds: T[]): T {\n    return ds[0]\n  }\n\nGọi layPhanTuDau([10, 20, 30]) thì TypeScript tự suy ra T là number, nên kết quả trả về được coi là number — bạn vẫn được kiểm tra kiểu đầy đủ, y như viết tay một hàm riêng cho number. Gọi layPhanTuDau(["An", "Binh"]) thì T lại là string. MỘT hàm, dùng được cho mọi kiểu, và không mất một chút kiểm tra kiểu nào.\n\nSo với any: any nói với trình biên dịch "đừng kiểm tra kiểu ở đây nữa" — bạn được viết ít hơn, đổi lại tsc không còn bắt lỗi giúp bạn ở chỗ đó nữa. Generic thì ngược lại: bạn viết hàm một lần, nhưng tsc VẪN kiểm tra kiểu đầy đủ cho từng lần gọi cụ thể. Generic là cách "viết chung mà không đánh đổi an toàn kiểu"; any là cách "viết chung bằng cách vứt bỏ an toàn kiểu". Đó là lý do U10 cấm dùng any còn bài này thì học generic.\n\nMột công cụ khác cũng hay dùng cùng generic là UNION TYPE — một giá trị có thể là MỘT TRONG vài kiểu, nối bằng dấu |:\n\n  function dinhDangGia(gia: number | string): string {\n    if (typeof gia === "number") {\n      return gia + " d"\n    }\n    return gia\n  }\n\ntsc buộc bạn phải kiểm tra typeof (gọi là "thu hẹp kiểu" — narrowing) trước khi dùng gia theo cách chỉ number mới làm được (như phép +), vì nếu không kiểm, gia có thể đang là string. Union type mô tả đúng thực tế "giá có thể đã được định dạng sẵn thành chuỗi, hoặc còn là số thô", còn any thì lại xoá sạch thông tin đó.',
    workedExample: {
      code: `// Cach 1: dung any - tsc khong con kiem tra gi o day (mat an toan, dung de SO SANH)
function dauTienAny(ds: any[]): any {
  return ds[0]
}

// Cach 2: dung generic - MOT ham, van giu duoc kiem tra kieu cho tung lan goi
function dauTienGeneric<T>(ds: T[]): T {
  return ds[0]
}

const soDau = dauTienGeneric<number>([100, 200, 300])
const tenDau = dauTienGeneric<string>(["An", "Binh"])

console.log("Any (mat kieu):", dauTienAny([1, 2, 3]))
console.log("Generic so:", soDau)
console.log("Generic ten:", tenDau)`,
      stdinLines: [],
    },
    predict: {
      code: `function boxDau<T>(ds: T[]): T {
  return ds[0]
}

const ketQua = boxDau<number>(["a", "b", "c"])
console.log(ketQua)`,
      question:
        'Hàm được chỉ định rõ T là number (boxDau<number>), nhưng mảng truyền vào lại là mảng chuỗi. Chuyện gì xảy ra?',
      choices: ['Dong 5: TS2322', 'Dong 5: TS7006', 'Dong 2: TS2322', 'Dong 2: TS7006'],
      answerIndex: 0,
      explain:
        'Đã chỉ định rõ T = number qua boxDau<number>, nên mảng truyền vào bắt buộc phải là number[]. Với mảng chuỗi ["a", "b", "c"] gõ trực tiếp như thế này, tsc kiểm TỪNG phần tử theo đúng kiểu number đó nên báo TS2322 ("Type string is not assignable to type number") ở dòng khai ketQua — mỗi phần tử sai một lỗi. Đây chính là thứ generic mang lại so với any: dù T được để trống lúc định nghĩa hàm, mỗi LẦN GỌI cụ thể với một T xác định vẫn bị kiểm tra chặt chẽ như thể hàm được viết tay riêng cho number.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: định nghĩa hàm generic, gọi hàm với kiểu number, rồi in kết quả.',
      lines: [
        'function layPhanTuDau<T>(ds: T[]): T {',
        '  return ds[0]',
        '}',
        'const so = layPhanTuDau<number>([1, 2, 3])',
        'console.log(so)',
      ],
    },
    make: {
      prompt:
        'Hoàn thiện hai hàm còn thiếu kiểu bên dưới:\n\n1) layPhanTuDau — hàm GENERIC nhận một mảng bất kỳ kiểu gì (T[]) và trả về phần tử đầu tiên (T). KHÔNG được dùng any.\n\n2) dinhDangGia — nhận một giá trị kiểu number | string (union). Nếu là number, trả về chuỗi "<số> d" (nối thêm " d"). Nếu đã là string, trả về nguyên văn không đổi. Phải dùng typeof để kiểm tra trước khi xử lý theo từng nhánh — không được ép kiểu bừa (as number, as string) để né việc kiểm tra.\n\nĐừng sửa phần gọi hàm ở cuối.',
      starterCode: `// TODO: viết lại thành hàm GENERIC <T>, không dùng any
function layPhanTuDau(ds) {
  return ds[0]
}

// TODO: tham số kiểu number | string, dùng typeof để thu hẹp kiểu
function dinhDangGia(gia) {
  if (typeof gia === "number") {
    return gia + " d"
  }
  return gia
}

// ---- Đừng sửa phần dưới đây ----
console.log("So dau:", layPhanTuDau([10, 20, 30]))
console.log("Ten dau:", layPhanTuDau(["Lan", "Minh"]))
console.log("Gia so:", dinhDangGia(25000))
console.log("Gia chuoi:", dinhDangGia("Lien he"))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'So dau: 10',
          match: 'contains',
          hidden: false,
          label: 'layPhanTuDau với mảng number trả về phần tử đầu tiên là số',
        },
        {
          stdinLines: [],
          expected: 'Ten dau: Lan',
          match: 'contains',
          hidden: false,
          label: 'CÙNG một hàm layPhanTuDau dùng được cho mảng string',
        },
        {
          stdinLines: [],
          expected: 'Gia so: 25000 d',
          match: 'contains',
          hidden: false,
          label: 'dinhDangGia với number nối thêm " d"',
        },
        {
          stdinLines: [],
          expected: 'Gia chuoi: Lien he',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — dinhDangGia với string trả về nguyên văn, không nối thêm " d"',
        },
      ],
      hints: [
        'layPhanTuDau cần dùng được cho cả mảng số lẫn mảng chuỗi bằng CÙNG MỘT hàm — đó là dấu hiệu cần generic <T>, không phải viết đè kiểu cụ thể hay dùng any.',
        'Cú pháp generic: đặt <T> ngay sau tên hàm, rồi dùng T như một kiểu bình thường: function layPhanTuDau<T>(ds: T[]): T { ... }.',
        'dinhDangGia nhận number | string. Muốn cộng chuỗi " d" an toàn, phải kiểm typeof gia === "number" trước — nếu bỏ qua bước kiểm, tsc sẽ không cho bạn coi gia như một number.',
        'Khung tham chiếu:\n\nfunction layPhanTuDau<T>(ds: T[]): T {\n  return ds[0]\n}\n\nfunction dinhDangGia(gia: number | string): string {\n  if (typeof gia === "number") {\n    return gia + " d"\n  }\n  return gia\n}',
      ],
      sampleSolution: `function layPhanTuDau<T>(ds: T[]): T {
  return ds[0]
}

function dinhDangGia(gia: number | string): string {
  if (typeof gia === "number") {
    return gia + " d"
  }
  return gia
}

console.log("So dau:", layPhanTuDau([10, 20, 30]))
console.log("Ten dau:", layPhanTuDau(["Lan", "Minh"]))
console.log("Gia so:", dinhDangGia(25000))
console.log("Gia chuoi:", dinhDangGia("Lien he"))`,
    },
    homework:
      'Trên máy của bạn (tiếp tục dùng tsconfig.json strict đã tạo ở bài U10): viết một hàm generic của riêng bạn, ví dụ layPhanTuCuoi<T>(ds: T[]): T trả về phần tử cuối cùng, rồi gọi nó với ít nhất hai kiểu dữ liệu khác nhau (mảng số và mảng chuỗi). Chạy npx tsc --noEmit để xác nhận sạch kiểu. Sau đó cố tình gọi hàm với generic chỉ định sai (giống ca Predict ở trên) để tự tay thấy tsc chặn lại.',
    srsCards: [
      {
        hoi: 'Generic khác any ở điểm mấu chốt nào?',
        dap: 'any tắt hẳn việc kiểm tra kiểu ở chỗ đó, còn generic để kiểu cụ thể được xác định lúc GỌI hàm mà vẫn giữ nguyên việc kiểm tra kiểu cho từng lần gọi — không đánh đổi an toàn để lấy sự linh hoạt.',
      },
      {
        hoi: 'Cú pháp khai một hàm generic đơn giản trông như thế nào?',
        dap: 'Đặt <T> ngay sau tên hàm rồi dùng T như một kiểu bình thường trong tham số và giá trị trả về, ví dụ function layPhanTuDau<T>(ds: T[]): T.',
      },
      {
        hoi: 'Vì sao dùng union type number | string tốt hơn any khi một giá trị có thể ở một trong hai dạng?',
        dap: 'Union type buộc bạn kiểm tra bằng typeof trước khi dùng giá trị theo cách chỉ một kiểu làm được, nên tsc vẫn bắt được lỗi nếu bạn quên kiểm — any thì bỏ qua mọi kiểm tra đó.',
      },
    ],
  },
]
