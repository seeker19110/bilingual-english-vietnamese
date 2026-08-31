// lessons/p6u120.ts — P6-U120: HƯỚNG DỮ LIỆU, chặng S2 "Kỹ sư dữ liệu — đường ống" —
// ETL / ELT (module `data-s2-m1`).
//
// data-s1 dạy TRẢ LỜI CÂU HỎI trên dữ liệu đã có sẵn (SQL, làm sạch, thống kê). S2 lùi về
// phía trước một bước: dữ liệu ĐẾN TỪ ĐÂU, và làm sao để nó đến ĐỀU ĐẶN mỗi ngày mà không
// sai. Hai bài ở đây dạy hai bất biến sống còn của mọi đường ống: nạp GIA TĂNG (chỉ lấy
// phần mới, không quét lại cả kho) và IDEMPOTENT (chạy lại một ngày không nhân đôi dữ liệu).
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không Airflow, không kho thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U120_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u120-l1',
    unitId: 'p6-u120',
    language: 'typescript',
    title: 'Nạp gia tăng bằng mốc nước — chỉ lấy phần mới, đừng quét lại cả kho',
    hook: 'Ngày đầu bảng đơn hàng có 10.000 dòng, đường ống chạy 3 giây — ai cũng vui. Sáu tháng sau bảng có 20 triệu dòng, đường ống vẫn "SELECT * FROM don_hang" và nay chạy 40 phút mỗi đêm, chỉ để chép lại 20 triệu dòng mà 19,99 triệu trong đó KHÔNG hề đổi.',
    theory:
      'NẠP TOÀN BỘ (full load) là chép lại mọi thứ mỗi lần chạy. Đơn giản, đúng, và chết dần theo kích thước dữ liệu: thời gian chạy tăng tuyến tính theo TỔNG dữ liệu, trong khi phần THẬT SỰ MỚI mỗi ngày gần như không đổi.\n\nNẠP GIA TĂNG (incremental load) chỉ lấy phần thay đổi kể từ lần chạy trước. Cần một cột cho biết "bản ghi này mới tới mức nào" — thường là `updated_at` (thời điểm sửa lần cuối) hoặc một id tăng dần. Giá trị lớn nhất đã xử lý ở lần chạy trước gọi là MỐC NƯỚC (watermark, high-water mark), lưu lại vào một bảng trạng thái:\n\n    bản ghi cần lấy = những bản ghi có updated_at > mốc nước\n    mốc nước mới = giá trị updated_at LỚN NHẤT trong lô vừa lấy\n\nHai cái bẫy phải biết trước khi viết dòng đầu tiên:\n\n**Bẫy 1 — dùng dấu >= thay vì dấu >.** Với >=, mọi bản ghi đúng bằng mốc nước sẽ được lấy LẠI ở mỗi lần chạy. Nếu bước ghi chỉ biết nối thêm dòng (append), đó là dữ liệu nhân đôi mỗi đêm.\n\n**Bẫy 2 — dùng dấu > mà tưởng là an toàn tuyệt đối.** Bản ghi có thể được GHI XONG SAU khi đường ống đã đọc, nhưng lại mang dấu thời gian CŨ hơn (giao dịch mở lâu, đồng hồ máy lệch nhau). Bản ghi đó rơi vào khe hở và MẤT VĨNH VIỄN — thứ không ai phát hiện ra cho tới lúc đối soát doanh thu.\n\nCách ngành dùng để sống chung với cả hai: **lấy chồng lấn (overlap) rồi UPSERT theo khoá** — lùi mốc nước lại một khoảng an toàn (vài phút tới một giờ), chấp nhận lấy trùng một ít, và để bước ghi tự khử trùng bằng khoá tự nhiên. Nghĩa là chống mất dữ liệu bằng cách CỐ Ý lấy dư, còn chống nhân đôi thì giao cho tính idempotent của bước ghi (bài kế tiếp). Đó là lý do hai bài này đi liền nhau: **nạp gia tăng chỉ an toàn khi bước ghi idempotent.**\n\nCòn ETL và ELT khác nhau chỗ nào? ETL biến đổi dữ liệu TRƯỚC khi nạp vào kho (Extract → Transform → Load); ELT nạp DỮ LIỆU THÔ vào kho trước rồi mới biến đổi bằng chính sức tính của kho (Extract → Load → Transform). ELT thắng thế từ khi kho dữ liệu đám mây rẻ và mạnh, vì nó giữ được lớp THÔ NGUYÊN VẸN — sau này phát hiện logic biến đổi sai, bạn dựng lại được toàn bộ từ dữ liệu thô mà không cần xin lại nguồn.',
    workedExample: {
      code: `interface BanGhi {
  id: string
  capNhat: number // dau thoi gian, cang lon cang moi
}

// Chi lay ban ghi MOI HON moc nuoc (dung >, khong dung >=)
function locBanGhiMoi(nguon: BanGhi[], mocNuoc: number): BanGhi[] {
  return nguon.filter((b) => b.capNhat > mocNuoc)
}

// Moc nuoc moi = gia tri capNhat LON NHAT trong lo vua lay.
// Lo rong thi GIU NGUYEN moc cu — tuyet doi khong dat ve 0.
function mocNuocMoi(lo: BanGhi[], mocCu: number): number {
  let moc = mocCu
  for (const b of lo) {
    if (b.capNhat > moc) moc = b.capNhat
  }
  return moc
}

const NGUON: BanGhi[] = [
  { id: "DH1", capNhat: 100 },
  { id: "DH2", capNhat: 105 },
  { id: "DH3", capNhat: 110 },
  { id: "DH4", capNhat: 110 },
]

const lo = locBanGhiMoi(NGUON, 105)
console.log("Lay:", lo.map((b) => b.id).join(","))
console.log("Moc moi:", mocNuocMoi(lo, 105))

// Chay lai NGAY LAP TUC voi moc moi: khong con gi de lay, moc giu nguyen
const lo2 = locBanGhiMoi(NGUON, 110)
console.log("Lan hai lay:", lo2.length, "ban ghi, moc:", mocNuocMoi(lo2, 110))`,
      stdinLines: [],
    },
    predict: {
      code: `interface BanGhi {
  id: string
  capNhat: number
}
const NGUON: BanGhi[] = [
  { id: "DH1", capNhat: 100 },
  { id: "DH2", capNhat: 105 },
  { id: "DH3", capNhat: 110 },
  { id: "DH4", capNhat: 110 },
]
// CHU Y: dung >= chu khong phai >
const lo = NGUON.filter((b) => b.capNhat >= 105)
console.log(lo.map((b) => b.id).join(","))`,
      question: 'Mốc nước là 105 nhưng người viết dùng `>=`. Lô lấy được gồm những bản ghi nào?',
      choices: [
        'DH2,DH3,DH4',
        'Chi hai ban ghi moi that su: DH3 va DH4',
        'Ca bon ban ghi trong nguon',
        'Chi mot ban ghi moi nhat: DH4',
      ],
      answerIndex: 0,
      explain:
        'Với `>=`, bản ghi DH2 (capNhat đúng bằng mốc nước 105) bị lấy LẠI — nó đã được xử lý ở lần chạy trước rồi. Mỗi đêm nó lại vào lô một lần nữa, và nếu bước ghi chỉ nối thêm dòng thì doanh thu của DH2 bị cộng nhiều lần. `>` cho đúng hai bản ghi thật sự mới là DH3, DH4.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm cập nhật mốc nước: bắt đầu từ mốc cũ, duyệt lô, chỉ nâng khi gặp giá trị lớn hơn.',
      lines: [
        'function mocNuocMoi(lo: BanGhi[], mocCu: number): number {',
        '  let moc = mocCu',
        '  for (const b of lo) {',
        '    if (b.capNhat > moc) moc = b.capNhat',
        '  }',
        '  return moc',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết một lượt nạp gia tăng CÓ CHỒNG LẤN — cách ngành dùng để không mất bản ghi tới muộn.\n\n- locChongLan(nguon, mocNuoc, doChongLan): lấy mọi bản ghi có capNhat > (mocNuoc - doChongLan). Trả về mảng bản ghi.\n- mocNuocMoi(lo, mocCu): trả về capNhat LỚN NHẤT trong lô; lô rỗng thì trả về mocCu (tuyệt đối không trả 0).\n\nDùng starter code có sẵn (đừng sửa phần dưới): nguồn 4 đơn hàng, mốc nước 105, độ chồng lấn 5.',
      starterCode: `interface BanGhi {
  id: string
  capNhat: number
}

function locChongLan(nguon: BanGhi[], mocNuoc: number, doChongLan: number): BanGhi[] {
  // TODO
  return []
}

function mocNuocMoi(lo: BanGhi[], mocCu: number): number {
  // TODO
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const NGUON: BanGhi[] = [
  { id: "DH1", capNhat: 100 },
  { id: "DH2", capNhat: 105 },
  { id: "DH3", capNhat: 110 },
  { id: "DH4", capNhat: 110 },
]
const lo = locChongLan(NGUON, 105, 5)
console.log("Lo:", lo.map((b) => b.id).join(","))
console.log("Moc moi:", mocNuocMoi(lo, 105))
console.log("Lo rong giu moc:", mocNuocMoi([], 110))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Lo: DH2,DH3,DH4',
          match: 'contains',
          hidden: false,
          label: 'Chồng lấn 5 → ngưỡng 100, lấy mọi bản ghi có capNhat > 100 (DH2, DH3, DH4)',
        },
        {
          stdinLines: [],
          expected: 'Moc moi: 110',
          match: 'contains',
          hidden: false,
          label: 'Mốc mới = capNhat lớn nhất trong lô = 110',
        },
        {
          stdinLines: [],
          expected: 'Lo rong giu moc: 110',
          match: 'contains',
          hidden: false,
          label: 'Lô rỗng → giữ nguyên mốc cũ 110, không tụt về 0',
        },
        {
          stdinLines: [],
          expected: 'Lo: DH2,DH3,DH4\nMoc moi: 110\nLo rong giu moc: 110',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'locChongLan: ngưỡng so sánh KHÔNG phải mocNuoc mà là mocNuoc - doChongLan — tính ngưỡng ra một biến trước cho dễ đọc, rồi filter theo b.capNhat > nguong.',
        'mocNuocMoi: khởi tạo biến kết quả bằng mocCu (không phải 0), rồi vòng lặp chỉ nâng khi gặp giá trị lớn hơn. Cách khởi tạo này tự động xử lý luôn ca lô rỗng.',
        'Ví dụ tương tự: mốc 105, chồng lấn 5 → ngưỡng 100 → DH1 (capNhat 100) KHÔNG vào vì phép so sánh là > chứ không phải >=.',
      ],
      sampleSolution: `interface BanGhi {
  id: string
  capNhat: number
}

function locChongLan(nguon: BanGhi[], mocNuoc: number, doChongLan: number): BanGhi[] {
  const nguong = mocNuoc - doChongLan
  return nguon.filter((b) => b.capNhat > nguong)
}

function mocNuocMoi(lo: BanGhi[], mocCu: number): number {
  let moc = mocCu
  for (const b of lo) {
    if (b.capNhat > moc) moc = b.capNhat
  }
  return moc
}

// ---- Đừng sửa phần dưới đây ----
const NGUON: BanGhi[] = [
  { id: "DH1", capNhat: 100 },
  { id: "DH2", capNhat: 105 },
  { id: "DH3", capNhat: 110 },
  { id: "DH4", capNhat: 110 },
]
const lo = locChongLan(NGUON, 105, 5)
console.log("Lo:", lo.map((b) => b.id).join(","))
console.log("Moc moi:", mocNuocMoi(lo, 105))
console.log("Lo rong giu moc:", mocNuocMoi([], 110))`,
    },
    homework:
      'Tìm một bảng dữ liệu thật bạn có quyền đọc (bảng trong dự án của bạn, hoặc một tệp CSV có cột thời gian). Trả lời ba câu bằng giấy bút: (1) cột nào làm được mốc nước, (2) mỗi ngày có bao nhiêu bản ghi mới so với tổng — tỉ lệ đó cho biết nạp gia tăng tiết kiệm được bao nhiêu phần trăm công, (3) nguồn của bạn có thể sinh bản ghi "tới muộn" trong hoàn cảnh nào. Câu (3) là câu quyết định độ chồng lấn bạn cần.',
    srsCards: [
      {
        hoi: 'Mốc nước (watermark) trong nạp gia tăng là gì?',
        dap: 'Giá trị lớn nhất của cột thời gian/id đã xử lý ở lần chạy trước, được lưu lại để lần chạy sau chỉ lấy những bản ghi mới hơn nó thay vì quét lại toàn bộ nguồn.',
      },
      {
        hoi: 'Dùng `>=` thay cho `>` khi so với mốc nước gây hậu quả gì?',
        dap: 'Mọi bản ghi đúng bằng mốc nước bị lấy lại ở mỗi lần chạy; nếu bước ghi chỉ nối thêm dòng thì dữ liệu bị nhân đôi mỗi đêm và các số tổng đều sai.',
      },
      {
        hoi: 'Vì sao đường ống cố ý lấy CHỒNG LẤN (lùi mốc nước lại một khoảng)?',
        dap: 'Để không mất bản ghi tới muộn (ghi xong sau khi đã đọc nhưng mang dấu thời gian cũ). Phần lấy trùng do chồng lấn được bước ghi idempotent khử đi, nên lấy dư an toàn hơn lấy thiếu.',
      },
      {
        hoi: 'ELT khác ETL ở chỗ nào, và lợi ích chính của ELT là gì?',
        dap: 'ELT nạp dữ liệu THÔ vào kho trước rồi mới biến đổi bằng sức tính của kho, còn ETL biến đổi trước khi nạp. Lợi ích: giữ được lớp thô nguyên vẹn nên dựng lại được mọi thứ khi phát hiện logic biến đổi sai.',
      },
    ],
  },
  {
    id: 'p6-u120-l2',
    unitId: 'p6-u120',
    language: 'typescript',
    title: 'Idempotent — chạy lại một ngày không được nhân đôi dữ liệu',
    hook: 'Đường ống đêm qua hỏng ở giữa chừng. Bạn bấm chạy lại — thao tác hiển nhiên nhất trên đời. Sáng ra báo cáo doanh thu tăng gấp rưỡi, vì nửa số đơn hàng đã kịp ghi vào kho ở lượt hỏng nay được ghi thêm lần nữa. Không ai làm sai gì cả: chính đường ống mới là thứ sai.',
    theory:
      'IDEMPOTENT nghĩa là: **chạy một lần hay chạy mười lần với cùng dữ liệu vào thì kết quả cuối cùng giống hệt nhau.** Đây không phải một tính năng cho đẹp — nó là điều kiện để đường ống ĐƯỢC PHÉP chạy lại, mà chạy lại thì sớm muộn cũng phải làm: mạng rớt, nguồn trả lỗi tạm, máy chủ khởi động lại, hoặc bạn phải chạy bù dữ liệu quá khứ.\n\nBước ghi có hai kiểu, khác nhau ở đúng chỗ này:\n\n- **Nối thêm (append/INSERT):** mỗi lần ghi là một dòng mới. KHÔNG idempotent — chạy lại là nhân đôi.\n- **Ghi đè theo khoá (upsert / MERGE):** có khoá tự nhiên (natural key) xác định duy nhất một thực thể; ghi cùng khoá thì THAY dòng cũ chứ không thêm dòng. Idempotent.\n\nKHOÁ TỰ NHIÊN là mấu chốt: nó là tổ hợp cột nói "hai bản ghi này là CÙNG MỘT THỨ ngoài đời". Với đơn hàng là mã đơn; với báo cáo doanh thu ngày thì là (ngày, cửa hàng). Chọn sai khoá thì upsert vô nghĩa: khoá quá hẹp sẽ đè mất dữ liệu khác nhau, khoá quá rộng lại không khử được trùng.\n\nMột kiểu idempotent thứ hai, hay dùng cho bảng phân vùng theo ngày: **XOÁ RỒI GHI LẠI ĐÚNG MỘT PHÂN VÙNG** (delete-then-insert cho ngày đang xử lý). Chạy lại ngày 2026-08-30 thì xoá sạch dữ liệu ngày đó trong kho rồi ghi lại — kết quả luôn như nhau bất kể chạy mấy lần. Điều kiện: mỗi lượt chạy phải sở hữu TRỌN VẸN một phân vùng, không được ghi lẫn sang ngày khác.\n\nBất biến để nhớ: **"chạy lại được" không phải là thứ thêm vào sau, nó là thuộc tính của cách bạn GHI.** Đường ống append vá bằng cách "nhớ đừng chạy lại" là đường ống đang chờ một sự cố xảy ra.',
    workedExample: {
      code: `interface DonHang {
  ma: string // khoa tu nhien
  tien: number
}

// KHONG idempotent: moi lan chay lai la them dong moi
function ghiNoiThem(kho: DonHang[], lo: DonHang[]): DonHang[] {
  return [...kho, ...lo]
}

// Idempotent: cung ma don thi THAY dong cu, khong them dong
function ghiUpsert(kho: DonHang[], lo: DonHang[]): DonHang[] {
  const theoMa = new Map<string, DonHang>()
  for (const d of kho) theoMa.set(d.ma, d)
  for (const d of lo) theoMa.set(d.ma, d) // ghi de theo khoa
  return [...theoMa.values()]
}

function tongTien(kho: DonHang[]): number {
  return kho.reduce((t, d) => t + d.tien, 0)
}

const LO: DonHang[] = [
  { ma: "DH1", tien: 50000 },
  { ma: "DH2", tien: 30000 },
]

// Chay hai lan cung mot lo
console.log("Noi them  :", tongTien(ghiNoiThem(ghiNoiThem([], LO), LO)))
console.log("Upsert    :", tongTien(ghiUpsert(ghiUpsert([], LO), LO)))`,
      stdinLines: [],
    },
    predict: {
      code: `interface DonHang {
  ma: string
  tien: number
}
function ghiUpsert(kho: DonHang[], lo: DonHang[]): DonHang[] {
  const theoMa = new Map<string, DonHang>()
  for (const d of kho) theoMa.set(d.ma, d)
  for (const d of lo) theoMa.set(d.ma, d)
  return [...theoMa.values()]
}
const kho = ghiUpsert([{ ma: "DH1", tien: 50000 }], [{ ma: "DH1", tien: 70000 }])
console.log(kho.length, kho[0].tien)`,
      question:
        'Đơn DH1 được sửa giá từ 50.000 lên 70.000 rồi nạp lại. Kho có mấy dòng, giá bao nhiêu?',
      choices: [
        '1 70000',
        'Van 2 dong, gia cu 50000',
        'Mot dong nhung giu gia cu 50000',
        'Hai dong voi gia moi 70000',
      ],
      answerIndex: 0,
      explain:
        'Upsert theo khoá `ma`: DH1 đã có trong kho nên lô mới ĐÈ lên dòng cũ — vẫn đúng 1 dòng, và giá là giá mới nhất 70.000. Đây là hai việc cùng lúc: khử trùng (không thành 2 dòng) và cập nhật (không giữ giá cũ). Nếu dùng nối thêm, kho sẽ có 2 dòng DH1 và mọi phép tổng đều sai.',
    },
    parsons: {
      prompt: 'Xếp lại hàm ghi upsert theo khoá tự nhiên — nạp kho cũ trước, rồi để lô mới đè lên.',
      lines: [
        'function ghiUpsert(kho: DonHang[], lo: DonHang[]): DonHang[] {',
        '  const theoMa = new Map<string, DonHang>()',
        '  for (const d of kho) theoMa.set(d.ma, d)',
        '  for (const d of lo) theoMa.set(d.ma, d)',
        '  return [...theoMa.values()]',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bước ghi idempotent kiểu XOÁ RỒI GHI LẠI PHÂN VÙNG — cách hay dùng cho bảng chia theo ngày.\n\n- ghiPhanVung(kho, ngay, lo): trả về kho MỚI gồm (a) mọi dòng của kho cũ có ngay KHÁC `ngay`, giữ nguyên thứ tự, rồi (b) toàn bộ dòng trong `lo`. Nói cách khác: xoá sạch phân vùng `ngay` rồi ghi lại lô.\n- tongTien(kho): tổng cột tien của mọi dòng.\n\nDùng starter code có sẵn (đừng sửa phần dưới): kho đã có 1 dòng ngày 30 và 1 dòng ngày 31; chạy lại ngày 31 hai lần với cùng một lô 2 dòng.',
      starterCode: `interface Dong {
  ngay: string
  ma: string
  tien: number
}

function ghiPhanVung(kho: Dong[], ngay: string, lo: Dong[]): Dong[] {
  // TODO
  return []
}

function tongTien(kho: Dong[]): number {
  // TODO
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const KHO: Dong[] = [
  { ngay: "30", ma: "DH0", tien: 10000 },
  { ngay: "31", ma: "DH1", tien: 50000 },
]
const LO: Dong[] = [
  { ngay: "31", ma: "DH1", tien: 50000 },
  { ngay: "31", ma: "DH2", tien: 30000 },
]
const lan1 = ghiPhanVung(KHO, "31", LO)
const lan2 = ghiPhanVung(lan1, "31", LO)
console.log("Lan 1:", lan1.length, "dong, tong", tongTien(lan1))
console.log("Lan 2:", lan2.length, "dong, tong", tongTien(lan2))
console.log("Ngay 30 con nguyen:", lan2.filter((d) => d.ngay === "30").length)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Lan 1: 3 dong, tong 90000',
          match: 'contains',
          hidden: false,
          label: 'Lần 1: giữ DH0 (ngày 30) + ghi lại 2 dòng ngày 31 = 3 dòng, 10.000+50.000+30.000',
        },
        {
          stdinLines: [],
          expected: 'Lan 2: 3 dong, tong 90000',
          match: 'contains',
          hidden: false,
          label: 'Lần 2 (chạy lại): kết quả GIỐNG HỆT lần 1 — đó chính là idempotent',
        },
        {
          stdinLines: [],
          expected: 'Ngay 30 con nguyen: 1',
          match: 'contains',
          hidden: false,
          label: 'Chạy lại ngày 31 không được đụng tới phân vùng ngày 30',
        },
        {
          stdinLines: [],
          expected: 'Lan 1: 3 dong, tong 90000\nLan 2: 3 dong, tong 90000\nNgay 30 con nguyen: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'ghiPhanVung gồm đúng hai việc nối tiếp: lọc bỏ phân vùng cũ (kho.filter((d) => d.ngay !== ngay)) rồi nối lô mới vào sau bằng toán tử trải [...giuLai, ...lo].',
        'Đừng lọc theo `ma` — bài này khử trùng theo PHÂN VÙNG (cột ngay), nên lô ghi lại có mã trùng hay không đều không quan trọng.',
        'tongTien: dùng reduce cộng dồn d.tien, giá trị khởi tạo 0 — hoặc một vòng for cộng vào biến, kết quả như nhau.',
      ],
      sampleSolution: `interface Dong {
  ngay: string
  ma: string
  tien: number
}

function ghiPhanVung(kho: Dong[], ngay: string, lo: Dong[]): Dong[] {
  const giuLai = kho.filter((d) => d.ngay !== ngay)
  return [...giuLai, ...lo]
}

function tongTien(kho: Dong[]): number {
  return kho.reduce((t, d) => t + d.tien, 0)
}

// ---- Đừng sửa phần dưới đây ----
const KHO: Dong[] = [
  { ngay: "30", ma: "DH0", tien: 10000 },
  { ngay: "31", ma: "DH1", tien: 50000 },
]
const LO: Dong[] = [
  { ngay: "31", ma: "DH1", tien: 50000 },
  { ngay: "31", ma: "DH2", tien: 30000 },
]
const lan1 = ghiPhanVung(KHO, "31", LO)
const lan2 = ghiPhanVung(lan1, "31", LO)
console.log("Lan 1:", lan1.length, "dong, tong", tongTien(lan1))
console.log("Lan 2:", lan2.length, "dong, tong", tongTien(lan2))
console.log("Ngay 30 con nguyen:", lan2.filter((d) => d.ngay === "30").length)`,
    },
    homework:
      'Nhìn lại một đoạn code bạn từng viết có ghi dữ liệu (ghi tệp, INSERT vào bảng, gọi API tạo bản ghi). Trả lời: chạy lại đúng đoạn đó hai lần thì kết quả có giống nhau không? Nếu không, hãy chỉ ra khoá tự nhiên có thể dùng để biến nó thành idempotent, và viết lại một phiên bản upsert. Nếu dữ liệu không có khoá tự nhiên nào — đó cũng là một phát hiện, ghi lại vì sao.',
    srsCards: [
      {
        hoi: 'Một bước ghi idempotent nghĩa là gì?',
        dap: 'Chạy một lần hay nhiều lần với cùng dữ liệu vào đều cho kết quả cuối cùng giống hệt nhau — nhờ đó đường ống được phép chạy lại sau sự cố mà không làm hỏng dữ liệu.',
      },
      {
        hoi: 'Vì sao bước ghi kiểu nối thêm (INSERT) không chạy lại được?',
        dap: 'Mỗi lượt ghi tạo dòng mới, nên chạy lại là nhân đôi phần dữ liệu đã ghi ở lượt trước; mọi phép tổng, đếm, trung bình sau đó đều sai mà không có dấu hiệu báo lỗi.',
      },
      {
        hoi: 'Khoá tự nhiên dùng để làm gì trong upsert, và chọn sai thì sao?',
        dap: 'Nó xác định "hai bản ghi này là cùng một thứ ngoài đời" để ghi đè thay vì thêm dòng. Khoá quá hẹp sẽ đè mất dữ liệu vốn khác nhau; khoá quá rộng thì không khử được trùng.',
      },
      {
        hoi: 'Cách xoá-rồi-ghi-lại phân vùng đạt tính idempotent bằng cơ chế nào?',
        dap: 'Mỗi lượt chạy sở hữu trọn một phân vùng (thường là một ngày): xoá sạch dữ liệu phân vùng đó rồi ghi lại lô, nên kết quả luôn như nhau bất kể chạy mấy lần và không đụng phân vùng khác.',
      },
    ],
  },
]
