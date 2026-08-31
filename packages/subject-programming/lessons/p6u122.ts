// lessons/p6u122.ts — P6-U122: HƯỚNG DỮ LIỆU, chặng S2 — Điều phối + Chất lượng dữ liệu
// (gộp module `data-s2-m3` và `data-s2-m4`).
//
// Gộp hai module vào một unit vì chúng trả lời cùng MỘT câu hỏi ở hai đầu: "đường ống chạy
// sai thì làm sao BIẾT và làm sao SỬA". Điều phối lo thứ tự chạy và phạm vi chạy lại; kiểm
// chất lượng lo việc CHẶN dữ liệu bẩn trước khi nó lan xuống báo cáo. Đúng tiền lệ
// backend-s2/s3/s4 gộp m3+m4 thành unit cuối chặng.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không Airflow, không dbt thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U122_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u122-l1',
    unitId: 'p6-u122',
    language: 'typescript',
    title: 'DAG điều phối — chạy đúng thứ tự, và chạy lại đúng phần cần chạy lại',
    hook: 'Bước "nạp đơn hàng" hỏng lúc 2 giờ sáng. Bạn sửa xong lúc 8 giờ và đứng trước câu hỏi thật sự khó: chạy lại MỘT MÌNH bước đó là đủ, hay phải chạy lại cả 40 bước phía sau? Đoán sai kiểu thứ nhất thì báo cáo còn số cũ; đoán sai kiểu thứ hai thì tốn 6 tiếng máy để làm lại thứ đã đúng.',
    theory:
      'Đường ống dữ liệu không phải một danh sách bước chạy nối đuôi — nó là một ĐỒ THỊ CÓ HƯỚNG KHÔNG CHU TRÌNH (DAG — Directed Acyclic Graph). Mỗi đỉnh là một tác vụ, mỗi cạnh là quan hệ "cái này phải xong trước cái kia". "Không chu trình" là điều kiện bắt buộc: nếu A cần B mà B lại cần A thì không có thứ tự nào chạy được, và bộ điều phối phải từ chối ngay khi khai báo chứ không phải khi chạy.\n\n**SẮP XẾP TÔ-PÔ (topological sort)** là thuật toán tìm một thứ tự chạy hợp lệ: chỉ chạy một tác vụ khi MỌI tác vụ nó phụ thuộc đã xong. Cách làm phổ biến (Kahn): đếm số phụ thuộc chưa xong của từng tác vụ, lấy ra những tác vụ đếm bằng 0, chạy chúng, rồi trừ đi ở các tác vụ phía sau. Nhiều tác vụ cùng sẵn sàng thì được chạy SONG SONG — đó chính là chỗ bộ điều phối tiết kiệm thời gian tường.\n\nLưu ý cho việc kiểm thử: khi nhiều tác vụ cùng sẵn sàng, cần một quy tắc phá hoà TẤT ĐỊNH (ví dụ theo thứ tự chữ cái) — nếu không, mỗi lần chạy ra một thứ tự khác nhau và không viết được test.\n\n**CHẠY LẠI MỘT PHẦN.** Khi một tác vụ hỏng và đã sửa, thứ cần chạy lại là chính nó CỘNG toàn bộ tác vụ XUÔI DÒNG của nó (descendants) — vì kết quả của chúng được tính từ dữ liệu sai. Tác vụ ngược dòng và các nhánh không liên quan thì KHÔNG cần đụng tới. Đây là lý do đáng giá nhất để mô tả đường ống bằng DAG: phạm vi chạy lại được TÍNH RA, không phải đoán.\n\n**LỊCH, SLA VÀ CẢNH BÁO.** Mỗi đường ống có một cam kết kiểu "dữ liệu ngày hôm qua phải sẵn sàng trước 7 giờ sáng" (SLA). Điều quan trọng nhất, và cũng hay bị quên nhất: **cảnh báo phải bắn khi tác vụ CHẠY QUÁ LÂU hoặc KHÔNG CHẠY, chứ không chỉ khi nó BÁO LỖI.** Một tác vụ chết lặng lẽ không sinh ra lỗi nào cả — và bảng báo cáo hiển thị số của hôm kia trông y hệt số của hôm qua.\n\n**CHẠY BÙ QUÁ KHỨ (backfill)** là chạy lại đường ống cho một dải ngày trong quá khứ, thường vì logic biến đổi vừa được sửa. Backfill chỉ an toàn khi mỗi lượt chạy idempotent và có tham số NGÀY rõ ràng — đường ống nào lấy `hôm nay` từ đồng hồ hệ thống thay vì nhận ngày làm tham số thì không backfill được, vì mọi lượt chạy lại đều ghi vào phân vùng hôm nay.',
    workedExample: {
      code: `// DAG khai bang danh sach phu thuoc: task -> nhung task phai xong TRUOC no.
const DAG: Record<string, string[]> = {
  nap_don_hang: [],
  nap_khach: [],
  lam_sach_don: ["nap_don_hang"],
  kho_ban_hang: ["lam_sach_don", "nap_khach"],
  bao_cao_doanh_thu: ["kho_ban_hang"],
}

// Sap xep to-po kieu Kahn, pha hoa theo thu tu chu cai cho TAT DINH.
function thuTuChay(dag: Record<string, string[]>): string[] {
  const conLai = new Set(Object.keys(dag))
  const xong: string[] = []
  while (conLai.size > 0) {
    const sanSang = [...conLai]
      .filter((t) => dag[t].every((p) => xong.includes(p)))
      .sort()
    if (sanSang.length === 0) throw new Error("DAG co chu trinh")
    for (const t of sanSang) {
      xong.push(t)
      conLai.delete(t)
    }
  }
  return xong
}

console.log(thuTuChay(DAG).join(" -> "))

// Task xuoi dong cua mot task hong = nhung task phai chay lai cung no.
function xuoiDong(dag: Record<string, string[]>, goc: string): string[] {
  const canChay = new Set<string>([goc])
  for (const t of thuTuChay(dag)) {
    if (dag[t].some((p) => canChay.has(p))) canChay.add(t)
  }
  return thuTuChay(dag).filter((t) => canChay.has(t))
}

console.log("Chay lai khi lam_sach_don hong:", xuoiDong(DAG, "lam_sach_don").join(","))`,
      stdinLines: [],
    },
    predict: {
      code: `const DAG: Record<string, string[]> = {
  a: [],
  b: ["a"],
  c: ["b"],
  d: [],
}
const canChay = new Set<string>(["b"])
for (const t of ["a", "b", "c", "d"]) {
  if (DAG[t].some((p) => canChay.has(p))) canChay.add(t)
}
console.log([...canChay].sort().join(","))`,
      question: 'Tác vụ b hỏng. Danh sách tác vụ phải chạy lại gồm những gì?',
      choices: [
        'b,c',
        'Ca bon tac vu deu phai chay lai',
        'Chi mot minh tac vu b',
        'Tac vu a va b vi a nam truoc',
      ],
      answerIndex: 0,
      explain:
        'Chạy lại gồm chính b và mọi tác vụ XUÔI DÒNG của nó — ở đây là c (c phụ thuộc b). Tác vụ a nằm NGƯỢC dòng nên kết quả của nó vẫn đúng, còn d là nhánh độc lập không liên quan. Chạy lại cả bốn là tốn công vô ích; chạy lại mỗi b thì c vẫn giữ số tính từ dữ liệu sai.',
    },
    parsons: {
      prompt:
        'Xếp lại vòng lặp Kahn: chọn tác vụ đã đủ phụ thuộc, phá hoà theo chữ cái, rồi đánh dấu xong.',
      lines: [
        'while (conLai.size > 0) {',
        '  const sanSang = [...conLai].filter((t) => dag[t].every((p) => xong.includes(p))).sort()',
        '  if (sanSang.length === 0) throw new Error("DAG co chu trinh")',
        '  for (const t of sanSang) {',
        '    xong.push(t)',
        '    conLai.delete(t)',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm canChayLai(dag, thuTu, taskHong) trả về danh sách tác vụ phải chạy lại.\n\n- `dag`: Record<string, string[]> — mỗi tác vụ ánh xạ tới danh sách tác vụ phải xong TRƯỚC nó.\n- `thuTu`: mảng tên tác vụ đã sắp tô-pô sẵn (bạn KHÔNG phải tự sắp xếp lại).\n- Kết quả gồm chính taskHong và mọi tác vụ XUÔI DÒNG của nó (trực tiếp lẫn gián tiếp), trả về theo đúng thứ tự trong `thuTu`.\n- Duyệt `thuTu` MỘT lượt là đủ để bắt cả phụ thuộc gián tiếp — vì tác vụ luôn đứng sau mọi thứ nó phụ thuộc.',
      starterCode: `function canChayLai(
  dag: Record<string, string[]>,
  thuTu: string[],
  taskHong: string,
): string[] {
  // TODO
  return []
}

// ---- Đừng sửa phần dưới đây ----
const DAG: Record<string, string[]> = {
  nap_don: [],
  nap_khach: [],
  lam_sach: ["nap_don"],
  kho_ban: ["lam_sach", "nap_khach"],
  bao_cao: ["kho_ban"],
  bao_cao_khach: ["nap_khach"],
}
const THU_TU = ["nap_don", "nap_khach", "lam_sach", "bao_cao_khach", "kho_ban", "bao_cao"]
console.log("Hong lam_sach:", canChayLai(DAG, THU_TU, "lam_sach").join(","))
console.log("Hong nap_khach:", canChayLai(DAG, THU_TU, "nap_khach").join(","))
console.log("Hong bao_cao:", canChayLai(DAG, THU_TU, "bao_cao").join(","))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Hong lam_sach: lam_sach,kho_ban,bao_cao',
          match: 'contains',
          hidden: false,
          label: 'lam_sach hỏng → kéo theo kho_ban rồi bao_cao (gián tiếp), không đụng nhánh khách',
        },
        {
          stdinLines: [],
          expected: 'Hong nap_khach: nap_khach,bao_cao_khach,kho_ban,bao_cao',
          match: 'contains',
          hidden: false,
          label: 'nap_khach hỏng → lan sang CẢ HAI nhánh xuôi dòng, theo đúng thứ tự tô-pô',
        },
        {
          stdinLines: [],
          expected: 'Hong bao_cao: bao_cao',
          match: 'contains',
          hidden: false,
          label: 'Tác vụ lá hỏng → chỉ chạy lại một mình nó, không có gì phía sau',
        },
        {
          stdinLines: [],
          expected:
            'Hong lam_sach: lam_sach,kho_ban,bao_cao\nHong nap_khach: nap_khach,bao_cao_khach,kho_ban,bao_cao\nHong bao_cao: bao_cao',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'Dùng một Set chứa những tác vụ "đã nhiễm", khởi tạo bằng chính taskHong.',
        'Duyệt thuTu theo thứ tự: nếu dag[t] có BẤT KỲ phụ thuộc nào nằm trong Set thì thêm t vào Set. Vì thuTu đã sắp tô-pô nên phụ thuộc gián tiếp tự động được bắt trong một lượt duy nhất.',
        'Cuối cùng lọc thuTu theo Set để giữ đúng thứ tự chạy: thuTu.filter((t) => nhiem.has(t)).',
      ],
      sampleSolution: `function canChayLai(
  dag: Record<string, string[]>,
  thuTu: string[],
  taskHong: string,
): string[] {
  const nhiem = new Set<string>([taskHong])
  for (const t of thuTu) {
    const phuThuoc = dag[t] ?? []
    if (phuThuoc.some((p) => nhiem.has(p))) nhiem.add(t)
  }
  return thuTu.filter((t) => nhiem.has(t))
}

// ---- Đừng sửa phần dưới đây ----
const DAG: Record<string, string[]> = {
  nap_don: [],
  nap_khach: [],
  lam_sach: ["nap_don"],
  kho_ban: ["lam_sach", "nap_khach"],
  bao_cao: ["kho_ban"],
  bao_cao_khach: ["nap_khach"],
}
const THU_TU = ["nap_don", "nap_khach", "lam_sach", "bao_cao_khach", "kho_ban", "bao_cao"]
console.log("Hong lam_sach:", canChayLai(DAG, THU_TU, "lam_sach").join(","))
console.log("Hong nap_khach:", canChayLai(DAG, THU_TU, "nap_khach").join(","))
console.log("Hong bao_cao:", canChayLai(DAG, THU_TU, "bao_cao").join(","))`,
    },
    homework:
      'Vẽ DAG cho một quy trình bạn làm đều đặn ngoài đời (nấu một bữa cơm, chuẩn bị đi học, dựng một bản build). Ghi rõ mỗi việc phụ thuộc việc nào. Rồi tự hỏi: nếu một việc ở giữa hỏng (cơm khê, gói cài lỗi), theo DAG của bạn thì phải làm lại đúng những việc nào? So sánh với cách bạn vẫn xử lý trong thực tế — thường ta làm lại NHIỀU HƠN cần thiết, đúng như đường ống dữ liệu chạy lại cả 40 bước.',
    srsCards: [
      {
        hoi: 'Vì sao đường ống dữ liệu được mô tả bằng DAG chứ không phải danh sách bước nối đuôi?',
        dap: 'Vì DAG ghi lại quan hệ phụ thuộc thật, nhờ đó tính được thứ tự chạy hợp lệ, biết tác vụ nào chạy song song được, và tính ra chính xác phạm vi phải chạy lại khi một bước hỏng.',
      },
      {
        hoi: 'Khi một tác vụ hỏng và đã sửa, phải chạy lại những tác vụ nào?',
        dap: 'Chính nó cộng toàn bộ tác vụ xuôi dòng (phụ thuộc trực tiếp lẫn gián tiếp), vì kết quả của chúng tính từ dữ liệu sai. Tác vụ ngược dòng và các nhánh độc lập không cần chạy lại.',
      },
      {
        hoi: 'Cảnh báo SLA của đường ống phải bắn trong những trường hợp nào ngoài "tác vụ báo lỗi"?',
        dap: 'Khi tác vụ chạy quá lâu hoặc KHÔNG chạy — vì một tác vụ chết lặng lẽ không sinh lỗi nào, mà báo cáo giữ số cũ trông y hệt số mới nên không ai phát hiện ra.',
      },
      {
        hoi: 'Điều kiện để một đường ống chạy bù dữ liệu quá khứ (backfill) được là gì?',
        dap: 'Mỗi lượt chạy phải idempotent và phải NHẬN NGÀY LÀM THAM SỐ. Đường ống tự lấy "hôm nay" từ đồng hồ hệ thống thì mọi lượt chạy lại đều ghi vào phân vùng hôm nay nên không backfill được.',
      },
    ],
  },
  {
    id: 'p6-u122-l2',
    unitId: 'p6-u122',
    language: 'typescript',
    title: 'Kiểm chất lượng dữ liệu — hỏng thì CHẶN, đừng để nó lan xuống báo cáo',
    hook: 'Sáng thứ hai, giám đốc mở bảng doanh thu và thấy con số 0 ở một chi nhánh đang bán rất tốt. Đường ống đêm qua chạy "thành công": không lỗi, không cảnh báo. Nguồn chỉ trả về một nửa dữ liệu, và đường ống ngoan ngoãn chép đúng một nửa đó vào kho. Chạy xong không có nghĩa là chạy đúng.',
    theory:
      'Đường ống nào cũng có lúc nhận dữ liệu sai từ nguồn. Việc của KIỂM CHẤT LƯỢNG (data quality check) không phải ngăn chuyện đó xảy ra — mà là **phát hiện ngay và CHẶN, để dữ liệu bẩn không chảy tiếp xuống lớp phục vụ.** Nguyên tắc gọi là "fail fast": thà báo cáo hôm nay THIẾU (và mọi người biết) còn hơn báo cáo hôm nay SAI (mà không ai biết).\n\nBốn nhóm kiểm gần như luôn cần, theo thứ tự từ rẻ tới đắt:\n\n1. **KHÔNG RỖNG (not null)** — cột bắt buộc phải có giá trị. Rẻ nhất và bắt được nhiều lỗi nhất.\n2. **DUY NHẤT (unique)** — khoá tự nhiên không được lặp. Trùng khoá thường là dấu hiệu bước ghi mất tính idempotent.\n3. **KHOẢNG GIÁ TRỊ (range)** — số tiền không âm, tuổi trong 0–130, tỉ lệ trong 0–1. Bắt được lỗi đơn vị (nhầm đồng với nghìn đồng) mà không kiểm nào khác bắt được.\n4. **KHỚP TỔNG (reconciliation)** — tổng ở kho phải bằng tổng ở nguồn. Đây là kiểm MẠNH NHẤT vì nó bắt được thứ ba kiểm trên không thấy: dữ liệu THIẾU. Mỗi dòng còn lại đều hợp lệ hoàn hảo, chỉ là có ít dòng hơn phải có.\n\nNgoài các kiểm kỹ thuật còn có **HỢP ĐỒNG DỮ LIỆU (data contract)** — thoả thuận giữa đội SINH ra dữ liệu và đội DÙNG nó: những cột nào tồn tại, kiểu gì, ý nghĩa gì, cột nào không bao giờ rỗng, đổi thì báo trước bao lâu. Không có hợp đồng thì đội nguồn đổi tên một cột lúc 3 giờ chiều và mười đường ống ở hạ nguồn gãy — mà họ hoàn toàn không biết mình vừa làm gãy cái gì.\n\nVà **THEO VẾT NGUỒN GỐC (lineage)** trả lời hai câu hỏi luôn được hỏi lúc khủng hoảng: xuôi dòng — "cột này hỏng thì những bảng/báo cáo nào bị ảnh hưởng?"; ngược dòng — "con số trên dashboard này thật ra tính từ đâu ra?". Lineage chính là DAG ở bài trước, nhưng vẽ ở mức CỘT thay vì mức tác vụ.\n\nMột lời cảnh báo cuối: kiểm chất lượng cũng phải TIẾT CHẾ. Đặt 200 kiểm rồi mỗi sáng có 30 cảnh báo mà 29 cái là báo động giả thì chẳng ai đọc nữa — và cái thứ 30 (cái thật) cũng chìm luôn. Ít kiểm nhưng mỗi kiểm đều đáng để đánh thức người trực dậy.',
    workedExample: {
      code: `interface Dong {
  ma: string
  tien: number
}

// Moi kiem tra tra ve chuoi mo ta LOI, hoac chuoi rong neu dat.
function kiemKhongRong(rows: Dong[]): string {
  const soLoi = rows.filter((r) => r.ma === "").length
  return soLoi > 0 ? "khong_rong: " + soLoi + " dong thieu ma" : ""
}

function kiemDuyNhat(rows: Dong[]): string {
  const thay = new Set<string>()
  let trung = 0
  for (const r of rows) {
    if (thay.has(r.ma)) trung++
    thay.add(r.ma)
  }
  return trung > 0 ? "duy_nhat: " + trung + " ma bi lap" : ""
}

function kiemKhoang(rows: Dong[]): string {
  const soLoi = rows.filter((r) => r.tien < 0).length
  return soLoi > 0 ? "khoang: " + soLoi + " dong tien am" : ""
}

// Kiem MANH NHAT: bat duoc du lieu THIEU, thu ba kiem tren khong thay.
function kiemKhopTong(rows: Dong[], tongNguon: number): string {
  const tongKho = rows.reduce((t, r) => t + r.tien, 0)
  return tongKho !== tongNguon ? "khop_tong: kho " + tongKho + " vs nguon " + tongNguon : ""
}

const ROWS: Dong[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "DH2", tien: 30000 },
]

// Nguon bao co 100000 nhung kho chi co 80000 -> thieu du lieu
const loi = [
  kiemKhongRong(ROWS),
  kiemDuyNhat(ROWS),
  kiemKhoang(ROWS),
  kiemKhopTong(ROWS, 100000),
].filter((m) => m !== "")

console.log("So loi:", loi.length)
for (const m of loi) console.log("-", m)
console.log(loi.length > 0 ? "CHAN: khong ghi xuong lop phuc vu" : "DAT: cho di tiep")`,
      stdinLines: [],
    },
    predict: {
      code: `interface Dong {
  ma: string
  tien: number
}
const ROWS: Dong[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "DH2", tien: 30000 },
]
const coMaRong = ROWS.some((r) => r.ma === "")
const coTienAm = ROWS.some((r) => r.tien < 0)
const tongKho = ROWS.reduce((t, r) => t + r.tien, 0)
console.log("Ma rong:", coMaRong, "| Tien am:", coTienAm, "| Khop tong:", tongKho === 100000)`,
      question:
        'Nguồn báo tổng 100.000đ nhưng kho chỉ có hai dòng 50.000 + 30.000. Ba kiểm in ra gì?',
      choices: [
        'Ma rong: false | Tien am: false | Khop tong: false',
        'Ba kiem deu dat vi tung dong deu hop le',
        'Ma rong: true | Tien am: false | Khop tong: false',
        'Ma rong: false | Tien am: true | Khop tong: true',
      ],
      answerIndex: 0,
      explain:
        'Từng dòng đều hoàn hảo — mã đầy đủ, tiền dương — nên hai kiểm đầu đều "sạch". Chỉ kiểm KHỚP TỔNG phát hiện ra vấn đề: kho có 80.000 trong khi nguồn báo 100.000, tức là một dòng 20.000 đã BIẾN MẤT. Đây chính là lý do kiểm khớp tổng không thể thiếu: dữ liệu thiếu không để lại dấu vết nào trên các dòng còn lại.',
    },
    parsons: {
      prompt:
        'Xếp lại kiểm KHỚP TỔNG: cộng tổng ở kho rồi so với tổng nguồn, lệch thì trả về mô tả lỗi.',
      lines: [
        'function kiemKhopTong(rows: Dong[], tongNguon: number): string {',
        '  const tongKho = rows.reduce((t, r) => t + r.tien, 0)',
        '  if (tongKho !== tongNguon) {',
        '    return "khop_tong: kho " + tongKho + " vs nguon " + tongNguon',
        '  }',
        '  return ""',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemChatLuong(rows, tongNguon) chạy đủ BỐN kiểm và quyết định cho đi tiếp hay chặn.\n\nMỗi dòng có: ma (chuỗi), tien (số). Trả về mảng chuỗi mô tả lỗi, theo ĐÚNG thứ tự sau, và chỉ thêm khi thật sự có lỗi:\n\n1. `khong_rong: <n> dong thieu ma` — đếm dòng có ma là chuỗi rỗng.\n2. `duy_nhat: <n> ma bi lap` — đếm số lần gặp lại một mã đã thấy trước đó.\n3. `khoang: <n> dong tien am` — đếm dòng có tien < 0.\n4. `khop_tong: kho <tongKho> vs nguon <tongNguon>` — chỉ thêm khi tổng tien của rows KHÁC tongNguon.\n\nKhông có lỗi nào thì trả về mảng rỗng.',
      starterCode: `interface Dong {
  ma: string
  tien: number
}

function kiemChatLuong(rows: Dong[], tongNguon: number): string[] {
  // TODO: bon kiem, dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const BAN: Dong[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "", tien: 30000 },
  { ma: "DH1", tien: -1000 },
]
const loi = kiemChatLuong(BAN, 100000)
console.log("So loi:", loi.length)
for (const m of loi) console.log("-", m)
console.log(loi.length > 0 ? "CHAN" : "DAT")

const SACH: Dong[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "DH2", tien: 30000 },
]
console.log("Lo sach:", kiemChatLuong(SACH, 80000).length, "loi ->", kiemChatLuong(SACH, 80000).length > 0 ? "CHAN" : "DAT")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'So loi: 4',
          match: 'contains',
          hidden: false,
          label: 'Lô bẩn vi phạm cả bốn kiểm cùng lúc',
        },
        {
          stdinLines: [],
          expected: '- khong_rong: 1 dong thieu ma',
          match: 'contains',
          hidden: false,
          label: 'Một dòng có mã rỗng',
        },
        {
          stdinLines: [],
          expected: '- khop_tong: kho 79000 vs nguon 100000',
          match: 'contains',
          hidden: false,
          label: 'Tổng kho 50.000 + 30.000 − 1.000 = 79.000, lệch nguồn 100.000',
        },
        {
          stdinLines: [],
          expected: 'Lo sach: 0 loi -> DAT',
          match: 'contains',
          hidden: false,
          label: 'Lô sạch khớp tổng 80.000 → không lỗi nào, cho đi tiếp',
        },
        {
          stdinLines: [],
          expected:
            '- khong_rong: 1 dong thieu ma\n- duy_nhat: 1 ma bi lap\n- khoang: 1 dong tien am\n- khop_tong: kho 79000 vs nguon 100000\nCHAN',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ bốn lỗi ĐÚNG THỨ TỰ rồi mới tới kết luận CHAN',
        },
      ],
      hints: [
        'Tạo một mảng kết quả rỗng rồi push từng lỗi theo đúng thứ tự bốn kiểm — đừng gom điều kiện vào một if lớn, vì thứ tự lỗi là một phần của yêu cầu.',
        'Kiểm duy nhất: duyệt rows với một Set; mỗi lần gặp mã ĐÃ có trong Set thì tăng biến đếm trùng, sau đó vẫn add mã vào Set.',
        'Kiểm khớp tổng: tính tongKho bằng reduce cộng r.tien (dòng tiền âm vẫn được cộng vào, nên 50000 + 30000 - 1000 = 79000), rồi so !== tongNguon.',
      ],
      sampleSolution: `interface Dong {
  ma: string
  tien: number
}

function kiemChatLuong(rows: Dong[], tongNguon: number): string[] {
  const loi: string[] = []

  const soRong = rows.filter((r) => r.ma === "").length
  if (soRong > 0) loi.push("khong_rong: " + soRong + " dong thieu ma")

  const thay = new Set<string>()
  let trung = 0
  for (const r of rows) {
    if (thay.has(r.ma)) trung++
    thay.add(r.ma)
  }
  if (trung > 0) loi.push("duy_nhat: " + trung + " ma bi lap")

  const soAm = rows.filter((r) => r.tien < 0).length
  if (soAm > 0) loi.push("khoang: " + soAm + " dong tien am")

  const tongKho = rows.reduce((t, r) => t + r.tien, 0)
  if (tongKho !== tongNguon) {
    loi.push("khop_tong: kho " + tongKho + " vs nguon " + tongNguon)
  }

  return loi
}

// ---- Đừng sửa phần dưới đây ----
const BAN: Dong[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "", tien: 30000 },
  { ma: "DH1", tien: -1000 },
]
const loi = kiemChatLuong(BAN, 100000)
console.log("So loi:", loi.length)
for (const m of loi) console.log("-", m)
console.log(loi.length > 0 ? "CHAN" : "DAT")

const SACH: Dong[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "DH2", tien: 30000 },
]
console.log("Lo sach:", kiemChatLuong(SACH, 80000).length, "loi ->", kiemChatLuong(SACH, 80000).length > 0 ? "CHAN" : "DAT")`,
    },
    homework:
      'Chọn một bảng dữ liệu bạn đang dùng (bảng trong dự án, một file CSV tải về, hay bảng tính công việc) và viết ra 8 kiểm chất lượng cụ thể cho nó — ít nhất một cái thuộc mỗi nhóm trong bài, và bắt buộc có một kiểm khớp tổng. Với từng kiểm, ghi thêm một câu: "kiểm này đỏ thì mình sẽ làm gì?". Kiểm nào bạn không trả lời được câu đó thì gạch đi — nó sẽ chỉ góp phần vào đống cảnh báo không ai đọc.',
    srsCards: [
      {
        hoi: 'Nguyên tắc "fail fast" trong kiểm chất lượng dữ liệu nghĩa là gì?',
        dap: 'Phát hiện dữ liệu sai là CHẶN ngay, không cho chảy xuống lớp phục vụ — thà báo cáo hôm nay thiếu và mọi người biết, còn hơn báo cáo sai mà không ai nhận ra.',
      },
      {
        hoi: 'Vì sao kiểm KHỚP TỔNG bắt được lỗi mà kiểm không-rỗng, duy-nhất, khoảng-giá-trị đều bỏ sót?',
        dap: 'Vì nó là kiểm duy nhất nhìn vào TOÀN LÔ chứ không nhìn từng dòng: khi dữ liệu bị thiếu, mọi dòng còn lại vẫn hợp lệ hoàn hảo, chỉ tổng mới cho thấy có dòng đã biến mất.',
      },
      {
        hoi: 'Hợp đồng dữ liệu (data contract) giữa đội sinh và đội dùng gồm những gì?',
        dap: 'Thoả thuận về các cột tồn tại, kiểu dữ liệu, ý nghĩa, cột nào không bao giờ rỗng, và thời hạn báo trước khi thay đổi — để đội nguồn không vô tình làm gãy hàng loạt đường ống hạ nguồn.',
      },
      {
        hoi: 'Theo vết nguồn gốc (lineage) trả lời được hai câu hỏi nào?',
        dap: 'Xuôi dòng: cột/bảng này hỏng thì những báo cáo nào bị ảnh hưởng. Ngược dòng: con số trên dashboard này thật ra được tính ra từ những nguồn nào — chính là DAG vẽ ở mức cột.',
      },
    ],
  },
]
