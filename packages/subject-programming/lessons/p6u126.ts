// lessons/p6u126.ts — P6-U126: HƯỚNG DỮ LIỆU, chặng S3 "Quy mô và thời gian thực" —
// dữ liệu lớn hơn RAM (module `data-s3-m1`).
//
// data-s2 dạy đường ống chạy ĐÚNG mỗi ngày (nạp gia tăng, idempotent, star schema, DAG).
// S3 hỏi câu tiếp theo: đúng rồi, nhưng dữ liệu lớn hơn bộ nhớ máy thì làm sao? Hai bài ở
// đây dạy hai kỹ thuật nền của mọi engine phân tán (Spark, DuckDB, Parquet reader): XỬ LÝ
// THEO KHỐI với bộ nhớ hằng, và SẮP XẾP NGOÀI bằng chia run rồi trộn nhiều đường.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — mảng nhỏ đóng vai "đĩa", kích
// thước khối đóng vai "RAM có hạn". Không Spark, không tệp thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U126_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u126-l1',
    unitId: 'p6-u126',
    language: 'typescript',
    title: 'Xử lý theo khối — tổng hợp 40 GB dữ liệu trên máy 8 GB RAM',
    hook: 'Đoạn code chạy ngon suốt nửa năm bỗng chết một sáng thứ hai với đúng một dòng: "JavaScript heap out of memory". Không ai sửa gì cả — chỉ là tệp nhật ký hôm ấy vượt qua mốc RAM của máy. Cách viết cũ nạp cả tệp vào mảng, nên nó luôn chết, chỉ là chưa tới ngày.',
    theory:
      'Có hai cách đọc một tập dữ liệu, và chúng khác nhau ở MỘT điểm quyết định tất cả: đỉnh bộ nhớ.\n\n**Nạp trọn (materialize):** đọc hết vào một mảng rồi mới tính. Bộ nhớ cần bằng KÍCH THƯỚC DỮ LIỆU. Dữ liệu lớn hơn RAM là chương trình chết — không có cách vá nào ngoài viết lại.\n\n**Xử lý theo luồng / theo khối (streaming, chunking):** đọc từng phần nhỏ, cập nhật kết quả tích luỹ, vứt phần vừa đọc đi rồi đọc phần tiếp. Bộ nhớ cần bằng KÍCH THƯỚC MỘT KHỐI cộng kích thước kết quả tích luỹ — một hằng số, không phụ thuộc tổng dữ liệu.\n\nĐiều kiện để làm được: phép tổng hợp phải **cộng dồn được** (kết hợp từng phần rồi gộp lại cho ra đúng kết quả như làm một lần trên toàn bộ). Tổng, đếm, nhỏ nhất, lớn nhất đều cộng dồn được. Trung bình thì KHÔNG trực tiếp — nhưng giữ cặp (tổng, số phần tử) rồi chia ở cuối là được. Trung vị và "đếm giá trị khác nhau" chính xác thì không, nên ngành dùng thuật toán xấp xỉ (t-digest, HyperLogLog) — đổi một chút sai số lấy bộ nhớ hằng.\n\nCòn phần KẾT QUẢ TÍCH LUỸ thì sao? Tổng doanh thu là một con số nên không lo. Nhưng "doanh thu theo từng khách hàng" là một bảng băm lớn dần theo SỐ KHÓA — 50 triệu khách là 50 triệu ô nhớ, và bạn lại tràn RAM ở chỗ khác. Đó chính là lý do các engine phân tán chia dữ liệu theo khoá (shuffle / partition by key) trước khi gộp: mỗi máy chỉ giữ phần bảng băm của những khoá thuộc về nó.\n\nBất biến để nhớ: **đỉnh bộ nhớ phải là hằng số theo kích thước dữ liệu, không phải tuyến tính.** Câu hỏi kiểm tra một đoạn code xử lý dữ liệu lớn luôn là: "dữ liệu tăng gấp mười thì đỉnh bộ nhớ có tăng gấp mười không?" Có, là đoạn code đó đang chờ ngày chết.',
    workedExample: {
      code: `// Chia mang thanh cac khoi <= coKhoi phan tu (khoi cuoi co the ngan hon).
// Day la vai tro "doc tung phan tu dia" — mo phong tren mang nho.
function chiaKhoi(du: number[], coKhoi: number): number[][] {
  const khoi: number[][] = []
  for (let i = 0; i < du.length; i += coKhoi) {
    khoi.push(du.slice(i, i + coKhoi))
  }
  return khoi
}

// CACH XAU: nap tron roi moi tinh — dinh bo nho bang ca tap du lieu.
function tongNapTron(du: number[]): number {
  const tatCa = [...du] // giu ban sao TOAN BO trong RAM
  return tatCa.reduce((t, x) => t + x, 0)
}

// CACH DUNG: doc tung khoi, cong don, vut khoi di.
// Bo nho giu cung luc = mot khoi + mot bien tich luy.
function tongTheoKhoi(du: number[], coKhoi: number): number {
  let tong = 0
  for (const k of chiaKhoi(du, coKhoi)) {
    for (const x of k) tong += x
  }
  return tong
}

const DU = [5, 3, 8, 1, 9, 2, 7]

console.log("Nap tron :", tongNapTron(DU), "- dinh bo nho", DU.length, "phan tu")
console.log("Theo khoi:", tongTheoKhoi(DU, 3), "- dinh bo nho 3 phan tu")
// Ket qua GIONG NHAU vi phep tong cong don duoc; chi dinh bo nho la khac.`,
      stdinLines: [],
    },
    predict: {
      code: `function chiaKhoi(du: number[], coKhoi: number): number[][] {
  const khoi: number[][] = []
  for (let i = 0; i < du.length; i += coKhoi) {
    khoi.push(du.slice(i, i + coKhoi))
  }
  return khoi
}
const DU = [5, 3, 8, 1, 9, 2, 7]
const k = chiaKhoi(DU, 3)
console.log(k.length, k[k.length - 1].length)`,
      question: 'Chia 7 phần tử thành các khối 3 phần tử: có mấy khối, khối cuối dài bao nhiêu?',
      choices: ['3 1', '2 3', '3 3', '4 1'],
      answerIndex: 0,
      explain:
        'Vòng lặp nhảy bước 3 nên cắt ở vị trí 0, 3, 6 — được ba khối [5,3,8], [1,9,2], [7]. Khối cuối chỉ còn 1 phần tử vì 7 không chia hết cho 3, và `slice` tự dừng ở cuối mảng chứ không báo lỗi. Khối cuối ngắn là chuyện BÌNH THƯỜNG của xử lý theo khối — code nào giả định mọi khối đều đầy sẽ sai đúng ở lần chạy cuối cùng.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm tổng hợp theo khối với bộ nhớ hằng: khởi tạo biến tích luỹ, duyệt từng khối, cộng dồn rồi trả về.',
      lines: [
        'function tongTheoKhoi(du: number[], coKhoi: number): number {',
        '  let tong = 0',
        '  for (const k of chiaKhoi(du, coKhoi)) {',
        '    for (const x of k) tong += x',
        '  }',
        '  return tong',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết một lượt tổng hợp theo khối và ĐO đỉnh bộ nhớ để tự chứng minh nó là hằng số.\n\n- chiaKhoi(du, coKhoi): chia mảng thành các khối tối đa coKhoi phần tử, khối cuối có thể ngắn hơn.\n- trungBinhTheoKhoi(du, coKhoi): duyệt từng khối, giữ cặp (tổng, số phần tử), cuối cùng trả tổng chia số phần tử. Mảng rỗng thì trả 0.\n- dinhBoNho(du, coKhoi): số phần tử nhiều nhất nằm trong bộ nhớ cùng lúc — chính là độ dài khối dài nhất. Mảng rỗng thì trả 0.\n\nDùng starter code có sẵn (đừng sửa phần dưới): dữ liệu 8 số, khối 3 phần tử.',
      starterCode: `function chiaKhoi(du: number[], coKhoi: number): number[][] {
  // TODO
  return []
}

function trungBinhTheoKhoi(du: number[], coKhoi: number): number {
  // TODO
  return 0
}

function dinhBoNho(du: number[], coKhoi: number): number {
  // TODO
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const DU = [4, 8, 6, 2, 10, 12, 14, 8]
console.log("So khoi:", chiaKhoi(DU, 3).length)
console.log("Trung binh:", trungBinhTheoKhoi(DU, 3))
console.log("Dinh bo nho:", dinhBoNho(DU, 3))
console.log("Du lieu gap doi, dinh bo nho:", dinhBoNho([...DU, ...DU], 3))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'So khoi: 3',
          match: 'contains',
          hidden: false,
          label: '8 phần tử chia khối 3 → 3 khối (3 + 3 + 2)',
        },
        {
          stdinLines: [],
          expected: 'Trung binh: 8',
          match: 'contains',
          hidden: false,
          label: 'Tổng 64 chia 8 phần tử = 8 — cộng dồn theo khối cho đúng kết quả như làm một lần',
        },
        {
          stdinLines: [],
          expected: 'Dinh bo nho: 3',
          match: 'contains',
          hidden: false,
          label: 'Đỉnh bộ nhớ = khối dài nhất = 3, không phải 8',
        },
        {
          stdinLines: [],
          expected: 'Du lieu gap doi, dinh bo nho: 3',
          match: 'contains',
          hidden: false,
          label: 'Dữ liệu gấp đôi mà đỉnh bộ nhớ KHÔNG đổi — đó là điều cần chứng minh',
        },
        {
          stdinLines: [],
          expected: 'So khoi: 3\nTrung binh: 8\nDinh bo nho: 3\nDu lieu gap doi, dinh bo nho: 3',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả bốn dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'chiaKhoi: vòng for nhảy bước coKhoi, mỗi vòng lấy du.slice(i, i + coKhoi) — slice tự dừng ở cuối mảng nên khối cuối ngắn là chuyện tự nhiên, không cần xử lý riêng.',
        'trungBinhTheoKhoi: giữ HAI biến tích luỹ (tong và dem), cộng dồn qua từng khối, chỉ chia MỘT LẦN ở cuối. Nhớ trả 0 khi dem bằng 0 để tránh chia cho không.',
        'dinhBoNho: duyệt các khối, giữ lại độ dài lớn nhất gặp được — khởi tạo bằng 0 để mảng rỗng tự ra 0.',
      ],
      sampleSolution: `function chiaKhoi(du: number[], coKhoi: number): number[][] {
  const khoi: number[][] = []
  for (let i = 0; i < du.length; i += coKhoi) {
    khoi.push(du.slice(i, i + coKhoi))
  }
  return khoi
}

function trungBinhTheoKhoi(du: number[], coKhoi: number): number {
  let tong = 0
  let dem = 0
  for (const k of chiaKhoi(du, coKhoi)) {
    for (const x of k) {
      tong += x
      dem += 1
    }
  }
  return dem === 0 ? 0 : tong / dem
}

function dinhBoNho(du: number[], coKhoi: number): number {
  let dinh = 0
  for (const k of chiaKhoi(du, coKhoi)) {
    if (k.length > dinh) dinh = k.length
  }
  return dinh
}

// ---- Đừng sửa phần dưới đây ----
const DU = [4, 8, 6, 2, 10, 12, 14, 8]
console.log("So khoi:", chiaKhoi(DU, 3).length)
console.log("Trung binh:", trungBinhTheoKhoi(DU, 3))
console.log("Dinh bo nho:", dinhBoNho(DU, 3))
console.log("Du lieu gap doi, dinh bo nho:", dinhBoNho([...DU, ...DU], 3))`,
    },
    homework:
      'Tìm một tệp dữ liệu thật đủ lớn (nhật ký máy chủ, CSV xuất từ bảng tính, dữ liệu mở của thành phố). Viết hai phiên bản đếm số dòng: một nạp trọn tệp vào bộ nhớ, một đọc theo khối. Đo bộ nhớ đỉnh của cả hai (Node có `process.memoryUsage()`, Python có `tracemalloc`), rồi nhân đôi tệp bằng cách nối nó với chính nó và đo lại. Ghi lại bốn con số đó — đồ thị của chúng chính là bài học.',
    srsCards: [
      {
        hoi: 'Xử lý theo khối giữ đỉnh bộ nhớ ở mức nào so với nạp trọn dữ liệu?',
        dap: 'Nạp trọn cần bộ nhớ bằng cả tập dữ liệu (tuyến tính), còn xử lý theo khối chỉ cần một khối cộng kết quả tích luỹ — một hằng số không phụ thuộc tổng dữ liệu.',
      },
      {
        hoi: 'Phép tổng hợp phải có tính chất gì mới xử lý theo khối được?',
        dap: 'Phải cộng dồn được: tính trên từng phần rồi gộp lại cho ra đúng kết quả như tính một lần trên toàn bộ, ví dụ tổng, đếm, nhỏ nhất, lớn nhất.',
      },
      {
        hoi: 'Trung bình không cộng dồn trực tiếp được, xử lý theo khối bằng cách nào?',
        dap: 'Giữ hai biến tích luỹ là tổng và số phần tử qua mọi khối, rồi chia đúng một lần ở cuối; chia trong từng khối rồi lấy trung bình của các trung bình sẽ sai khi khối lệch kích thước.',
      },
      {
        hoi: 'Vì sao gộp theo khoá vẫn có thể tràn RAM dù đã đọc theo khối?',
        dap: 'Vì bảng kết quả tích luỹ lớn dần theo SỐ KHOÁ khác nhau; nhiều triệu khoá là nhiều triệu ô nhớ, nên engine phân tán phải chia dữ liệu theo khoá để mỗi máy chỉ giữ phần bảng của mình.',
      },
    ],
  },
  {
    id: 'p6-u126-l2',
    unitId: 'p6-u126',
    language: 'typescript',
    title: 'Sắp xếp ngoài — sắp thứ không vừa bộ nhớ bằng chia run rồi trộn',
    hook: 'Sắp xếp là thứ ai cũng tưởng đã học xong ở bài thứ ba của môn thuật toán: gọi một hàm là xong. Rồi bạn gặp tệp 200 GB trên máy 16 GB RAM, và câu hỏi đổi hoàn toàn: sắp xếp một thứ mà bạn không bao giờ nhìn thấy trọn vẹn cùng một lúc thì làm thế nào?',
    theory:
      'SẮP XẾP NGOÀI (external sort) là câu trả lời, và nó chỉ có hai bước.\n\n**Bước 1 — tạo run.** Đọc dữ liệu theo từng khối vừa RAM, sắp xếp khối đó trong bộ nhớ, ghi ra đĩa thành một tệp tạm. Mỗi tệp tạm gọi là một RUN: bên trong đã sắp đúng thứ tự, chỉ là các run chưa liên quan gì tới nhau. Dữ liệu 200 GB với RAM 16 GB cho khoảng 13 run.\n\n**Bước 2 — trộn nhiều đường (k-way merge).** Mở tất cả các run cùng lúc, mỗi run giữ MỘT con trỏ ở phần tử đầu chưa lấy. Lặp: nhìn các phần tử đang được trỏ tới, lấy phần tử nhỏ nhất, ghi ra kết quả, đẩy con trỏ của run đó lên một bước. Lặp tới khi mọi run cạn.\n\nĐiều kỳ diệu nằm ở bộ nhớ bước 2: dù các run to bao nhiêu, cùng lúc trong RAM chỉ có **k phần tử đầu run** (thực tế là k bộ đệm nhỏ). Nghĩa là bạn sắp được tập dữ liệu lớn tuỳ ý bằng lượng RAM cố định — đổi lại là đọc/ghi đĩa thêm vài lượt.\n\nVài điều thực chiến ngành đã học được:\n\n- **k không phải càng lớn càng tốt.** k quá lớn thì mỗi run chỉ còn bộ đệm tí hon, đĩa phải nhảy lung tung giữa các tệp và tốc độ đọc tuần tự sụp đổ. Nhiều engine trộn nhiều vòng thay vì trộn hết một lần.\n- **Chọn nhỏ nhất trong k phần tử nên dùng hàng đợi ưu tiên (heap).** Duyệt tuyến tính là O(k) cho mỗi phần tử ghi ra; heap cho O(log k). Với k nhỏ thì duyệt tuyến tính vẫn ổn — và ta dùng cách đó ở bài này cho dễ đọc.\n- **Trộn phải ỔN ĐỊNH khi có giá trị bằng nhau:** khi hai run cùng trỏ tới giá trị bằng nhau, luôn ưu tiên run có chỉ số nhỏ hơn. Không có luật đó thì hai lần chạy có thể cho hai thứ tự khác nhau, và mọi so sánh kết quả sau này thành vô nghĩa.\n\nĐây không phải kiến thức bảo tàng: chính khuôn hình này chạy bên trong lệnh `sort` của Linux, bên trong bước sắp xếp của Spark, và bên trong phép nối kiểu sort-merge join của mọi cơ sở dữ liệu. Hiểu nó là hiểu vì sao "sắp xếp dữ liệu lớn" tốn đĩa chứ không tốn RAM.',
    workedExample: {
      code: `// Buoc 1 — tao run: chia thanh khoi vua RAM roi SAP tung khoi.
function taoRun(du: number[], coKhoi: number): number[][] {
  const run: number[][] = []
  for (let i = 0; i < du.length; i += coKhoi) {
    // slice() tao ban sao roi sort() tai cho — khong dung mang goc.
    run.push(du.slice(i, i + coKhoi).sort((a, b) => a - b))
  }
  return run
}

// Buoc 2 — tron nhieu duong: moi run mot con tro, moi vong lay phan tu nho nhat.
function tronNhieuDuong(run: number[][]): number[] {
  const viTri = run.map(() => 0) // con tro cua tung run
  const ketQua: number[] = []
  for (;;) {
    let chon = -1
    for (let i = 0; i < run.length; i++) {
      if (viTri[i] >= run[i].length) continue // run nay da can
      // Dau < (khong phai <=) giu tinh ON DINH: bang nhau thi uu tien run truoc.
      if (chon === -1 || run[i][viTri[i]] < run[chon][viTri[chon]]) chon = i
    }
    if (chon === -1) break // moi run da can
    ketQua.push(run[chon][viTri[chon]])
    viTri[chon] += 1
  }
  return ketQua
}

const DU = [9, 3, 7, 1, 8, 2, 5]
const run = taoRun(DU, 3)
console.log("So run:", run.length)
console.log("Ket qua:", tronNhieuDuong(run).join(","))
// Bo nho luc tron: chi 3 con tro, du moi run to bao nhieu.`,
      stdinLines: [],
    },
    predict: {
      code: `function taoRun(du: number[], coKhoi: number): number[][] {
  const run: number[][] = []
  for (let i = 0; i < du.length; i += coKhoi) {
    run.push(du.slice(i, i + coKhoi).sort((a, b) => a - b))
  }
  return run
}
const run = taoRun([9, 3, 7, 1, 8, 2, 5], 3)
console.log(run.map((r) => r.join("")).join(" "))`,
      question: 'Chia [9,3,7,1,8,2,5] thành run 3 phần tử rồi sắp từng run: được những run nào?',
      choices: ['379 128 5', '123 578 9', '937 182 5', 'Mot run duy nhat da sap: 1235789'],
      answerIndex: 0,
      explain:
        'Cắt trước, sắp sau — và chỉ sắp BÊN TRONG từng khối: [9,3,7] thành [3,7,9], [1,8,2] thành [1,2,8], [5] giữ nguyên. Toàn bộ dãy CHƯA hề được sắp; đó là việc của bước trộn. Nhầm lẫn hay gặp là tưởng bước tạo run đã cho kết quả cuối — nếu vậy thì đã chẳng cần bước hai.',
    },
    parsons: {
      prompt:
        'Xếp lại vòng lặp trộn: tìm run có phần tử nhỏ nhất, hết run thì dừng, ghi phần tử ra kết quả rồi đẩy con trỏ.',
      lines: [
        'for (;;) {',
        '  let chon = -1',
        '  for (let i = 0; i < run.length; i++) {',
        '    if (viTri[i] >= run[i].length) continue',
        '    if (chon === -1 || run[i][viTri[i]] < run[chon][viTri[chon]]) chon = i',
        '  }',
        '  if (chon === -1) break',
        '  ketQua.push(run[chon][viTri[chon]])',
        '  viTri[chon] += 1',
        '}',
      ],
    },
    make: {
      prompt:
        'Cài trọn một lượt sắp xếp ngoài trên dữ liệu giả lập "không đủ RAM".\n\n- taoRun(du, coKhoi): chia mảng thành các khối tối đa coKhoi phần tử rồi sắp TĂNG DẦN từng khối. Không được sửa mảng gốc.\n- tronNhieuDuong(run): trộn các run đã sắp thành một mảng sắp tăng dần, dùng một con trỏ cho mỗi run. Khi hai run cùng trỏ tới giá trị BẰNG NHAU thì lấy của run có chỉ số nhỏ hơn (giữ tính ổn định).\n- Bộ nhớ khi trộn chỉ được là số con trỏ — đừng nối hết các run lại rồi gọi sort, vì như thế là nạp trọn, đúng thứ bài này dạy phải tránh.\n\nDùng starter code có sẵn (đừng sửa phần dưới): 9 số, khối 4 phần tử.',
      starterCode: `function taoRun(du: number[], coKhoi: number): number[][] {
  // TODO
  return []
}

function tronNhieuDuong(run: number[][]): number[] {
  // TODO
  return []
}

// ---- Đừng sửa phần dưới đây ----
const DU = [9, 3, 7, 1, 8, 2, 5, 3, 6]
const run = taoRun(DU, 4)
console.log("So run:", run.length)
console.log("Run dau:", run[0].join(","))
console.log("Da sap:", tronNhieuDuong(run).join(","))
console.log("Goc nguyen ven:", DU.join(","))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'So run: 3',
          match: 'contains',
          hidden: false,
          label: '9 phần tử chia khối 4 → 3 run (4 + 4 + 1)',
        },
        {
          stdinLines: [],
          expected: 'Run dau: 1,3,7,9',
          match: 'contains',
          hidden: false,
          label: 'Run đầu là [9,3,7,1] đã sắp tăng dần',
        },
        {
          stdinLines: [],
          expected: 'Da sap: 1,2,3,3,5,6,7,8,9',
          match: 'contains',
          hidden: false,
          label: 'Trộn ba run cho dãy sắp đầy đủ, giữ đủ cả hai số 3',
        },
        {
          stdinLines: [],
          expected: 'Goc nguyen ven: 9,3,7,1,8,2,5,3,6',
          match: 'contains',
          hidden: false,
          label: 'taoRun không được sắp tại chỗ trên mảng gốc',
        },
        {
          stdinLines: [],
          expected:
            'So run: 3\nRun dau: 1,3,7,9\nDa sap: 1,2,3,3,5,6,7,8,9\nGoc nguyen ven: 9,3,7,1,8,2,5,3,6',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả bốn dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'taoRun: du.slice(i, i + coKhoi) đã tạo BẢN SAO rồi, nên gọi .sort() trên kết quả slice là an toàn — sort() thẳng trên mảng gốc mới là thứ làm hỏng dòng "Goc nguyen ven".',
        'sort() mặc định so sánh theo CHUỖI, nên phải truyền hàm so sánh (a, b) tới a - b để sắp số cho đúng.',
        'tronNhieuDuong: giữ mảng viTri song song với mảng run. Mỗi vòng, bỏ qua run đã cạn (viTri lớn hơn hoặc bằng độ dài), chọn chỉ số có phần tử nhỏ nhất bằng phép so sánh nghiêm ngặt (dấu bé hơn, không phải bé hơn hoặc bằng) để giữ ổn định, không chọn được ai nữa thì thoát vòng.',
      ],
      sampleSolution: `function taoRun(du: number[], coKhoi: number): number[][] {
  const run: number[][] = []
  for (let i = 0; i < du.length; i += coKhoi) {
    run.push(du.slice(i, i + coKhoi).sort((a, b) => a - b))
  }
  return run
}

function tronNhieuDuong(run: number[][]): number[] {
  const viTri = run.map(() => 0)
  const ketQua: number[] = []
  for (;;) {
    let chon = -1
    for (let i = 0; i < run.length; i++) {
      const r = run[i]!
      if (viTri[i]! >= r.length) continue
      if (chon === -1 || r[viTri[i]!]! < run[chon]![viTri[chon]!]!) chon = i
    }
    if (chon === -1) break
    ketQua.push(run[chon]![viTri[chon]!]!)
    viTri[chon] = viTri[chon]! + 1
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const DU = [9, 3, 7, 1, 8, 2, 5, 3, 6]
const run = taoRun(DU, 4)
console.log("So run:", run.length)
console.log("Run dau:", run[0].join(","))
console.log("Da sap:", tronNhieuDuong(run).join(","))
console.log("Goc nguyen ven:", DU.join(","))`,
    },
    homework:
      'Lệnh `sort` của Linux chính là một bộ sắp xếp ngoài. Tạo một tệp vài trăm nghìn dòng số ngẫu nhiên, rồi chạy `sort` với tuỳ chọn giới hạn bộ nhớ rất nhỏ (`sort -S 1M tep.txt`) và theo dõi thư mục tạm trong lúc nó chạy — bạn sẽ thấy chính các tệp run xuất hiện rồi biến mất. Ghi lại: có bao nhiêu tệp tạm, và thời gian chạy đổi thế nào khi bạn cho nó nhiều bộ nhớ hơn.',
    srsCards: [
      {
        hoi: 'Sắp xếp ngoài gồm hai bước nào?',
        dap: 'Bước tạo run (đọc từng khối vừa bộ nhớ, sắp khối đó rồi ghi ra đĩa) và bước trộn nhiều đường (mở mọi run cùng lúc, mỗi vòng lấy phần tử nhỏ nhất trong các đầu run).',
      },
      {
        hoi: 'Khi trộn nhiều đường, cùng lúc trong bộ nhớ có những gì?',
        dap: 'Chỉ k phần tử đầu của k run cùng vài bộ đệm nhỏ — không phụ thuộc độ lớn các run, nên sắp được tập dữ liệu lớn tuỳ ý bằng lượng bộ nhớ cố định.',
      },
      {
        hoi: 'Vì sao tăng số đường trộn k lên rất lớn lại phản tác dụng?',
        dap: 'Vì bộ đệm chia cho mỗi run nhỏ dần, đĩa phải nhảy qua lại giữa nhiều tệp và mất lợi thế đọc tuần tự; nên các engine thường trộn nhiều vòng thay vì trộn hết trong một lượt.',
      },
      {
        hoi: 'Luật nào giữ cho phép trộn ổn định khi hai run có giá trị bằng nhau?',
        dap: 'Luôn ưu tiên run có chỉ số nhỏ hơn, tức so sánh bằng dấu bé hơn nghiêm ngặt; nhờ vậy hai lần chạy trên cùng dữ liệu cho ra đúng một thứ tự và kết quả so sánh được.',
      },
    ],
  },
]
