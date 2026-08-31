// lessons/p6u127.ts — P6-U127: HƯỚNG DỮ LIỆU, chặng S3 "Quy mô và thời gian thực" —
// luồng gần thời gian thực (module `data-s3-m2`).
//
// u126 dạy xử lý tập dữ liệu ĐỨNG YÊN nhưng lớn hơn RAM. Unit này đổi trục: dữ liệu KHÔNG
// bao giờ hết — nó chảy tới liên tục, đến lệch thứ tự, và đôi khi tới muộn hàng giờ. Hai bài
// dạy hai khái niệm mà mọi hệ luồng (Kafka Streams, Flink, Spark Structured Streaming) đều
// có: CỬA SỔ theo thời gian sự kiện, và MỐC NƯỚC (watermark) để quyết định lúc nào chốt sổ.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — mảng sự kiện có sẵn hai cột thời
// gian đóng vai luồng. Không Kafka, không đồng hồ thật (đồng hồ thật là kẻ thù của test).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U127_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u127-l1',
    unitId: 'p6-u127',
    language: 'typescript',
    title: 'Thời gian sự kiện và thời gian xử lý — hai đồng hồ, hai câu trả lời khác nhau',
    hook: 'Bảng điều khiển báo lúc 21 giờ có 4.000 đơn hàng, cao gấp ba giờ trước — cả nhóm mừng rỡ. Thực ra 21 giờ là lúc mạng của một cửa hàng vừa được nối lại và đẩy ào lên toàn bộ đơn của cả buổi chiều. Không có cái đỉnh nào lúc 21 giờ cả; chỉ có một bảng điều khiển đang xem nhầm đồng hồ.',
    theory:
      'Mỗi sự kiện trong hệ thống luồng mang HAI dấu thời gian, và trộn lẫn chúng là lỗi phổ biến nhất của người mới làm dữ liệu thời gian thực.\n\n- **Thời gian sự kiện (event time):** lúc chuyện đó THẬT SỰ xảy ra ngoài đời — người dùng bấm nút, cảm biến đo được, đơn hàng được đặt. Do nguồn sinh ra sự kiện ghi lại.\n- **Thời gian xử lý (processing time):** lúc hệ thống của bạn NHÌN THẤY sự kiện đó. Do máy chủ của bạn ghi lại.\n\nHai đồng hồ này lệch nhau vì những lý do rất đời thường: điện thoại mất sóng rồi gửi bù, một bộ tiêu thụ bị nghẽn hàng đợi, một lần triển khai làm dừng dịch vụ ba phút. Khoảng lệch đó gọi là ĐỘ TRỄ (lag), và nó không bao giờ bằng không.\n\nCÂU HỎI QUYẾT ĐỊNH DÙNG ĐỒNG HỒ NÀO là: bạn đang trả lời câu hỏi về THẾ GIỚI hay về HỆ THỐNG?\n\n- "Giờ nào khách đặt hàng nhiều nhất?" là câu hỏi về thế giới, phải nhóm theo thời gian sự kiện. Nhóm theo thời gian xử lý sẽ cho ra đúng cái đỉnh giả trong phần móc mở đầu.\n- "Lúc nào máy chủ của tôi bận nhất?", "hàng đợi đang tồn đọng bao nhiêu?" là câu hỏi về hệ thống, phải nhóm theo thời gian xử lý.\n\nCỬA SỔ (window) là cách chia dòng chảy vô hạn thành từng khoảng hữu hạn để tính được. Kiểu đơn giản nhất là **cửa sổ nhảy rời** (tumbling window): chia trục thời gian thành các đoạn dài bằng nhau, không chồng lên nhau. Sự kiện thuộc cửa sổ nào tính bằng một phép chia lấy nguyên:\n\n    đầu cửa sổ = Math.floor(thời gian / độ dài) * độ dài\n\nHai kiểu cửa sổ khác cũng hay gặp: **trượt** (sliding — các cửa sổ chồng lên nhau, dùng để làm mượt đồ thị) và **theo phiên** (session — cắt cửa sổ tại chỗ người dùng ngừng hoạt động quá một khoảng lặng, dùng để đo phiên truy cập).\n\nĐiều then chốt phải hiểu trước bài sau: **nhóm theo thời gian sự kiện thì kết quả của một cửa sổ là TẤT ĐỊNH và LẶP LẠI ĐƯỢC** — chạy lại trên cùng dữ liệu luôn ra đúng con số đó, bất kể sự kiện tới sớm hay muộn. Nhóm theo thời gian xử lý thì kết quả phụ thuộc vào việc hôm đó mạng có nghẽn hay không, tức là không thể kiểm chứng và không đối chiếu được với số liệu theo lô. Cái giá của tính tất định ấy là: bạn phải CHỜ những sự kiện tới muộn — và biết chờ tới bao giờ là nội dung bài kế tiếp.',
    workedExample: {
      code: `interface SuKien {
  id: string
  tSuKien: number // luc chuyen xay ra ngoai doi
  tXuLy: number // luc he thong nhin thay
}

// Cua so nhay roi: dau cua so = phan nguyen cua (thoi gian / do dai) nhan do dai.
function dauCuaSo(t: number, doDai: number): number {
  return Math.floor(t / doDai) * doDai
}

// Dem su kien theo cua so; chon dong ho bang tham so.
function demTheoCuaSo(ds: SuKien[], doDai: number, theoSuKien: boolean): string {
  const dem = new Map<number, number>()
  for (const s of ds) {
    const t = theoSuKien ? s.tSuKien : s.tXuLy
    const cua = dauCuaSo(t, doDai)
    dem.set(cua, (dem.get(cua) ?? 0) + 1)
  }
  // Sap theo dau cua so de ket qua TAT DINH, khong phu thuoc thu tu chen.
  return [...dem.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cua, n]) => cua + ":" + n)
    .join(" ")
}

const DS: SuKien[] = [
  { id: "A", tSuKien: 5, tXuLy: 6 },
  { id: "B", tSuKien: 8, tXuLy: 12 }, // toi hoi muon
  { id: "C", tSuKien: 12, tXuLy: 13 },
  { id: "D", tSuKien: 9, tXuLy: 21 }, // toi RAT muon
]

console.log("Theo thoi gian su kien:", demTheoCuaSo(DS, 10, true))
console.log("Theo thoi gian xu ly  :", demTheoCuaSo(DS, 10, false))
// Cung mot du lieu, hai buc tranh khac han — vi hai cau hoi khac nhau.`,
      stdinLines: [],
    },
    predict: {
      code: `function dauCuaSo(t: number, doDai: number): number {
  return Math.floor(t / doDai) * doDai
}
console.log(dauCuaSo(9, 10), dauCuaSo(10, 10), dauCuaSo(19, 10), dauCuaSo(20, 10))`,
      question: 'Với cửa sổ nhảy rời dài 10, các mốc thời gian 9, 10, 19, 20 rơi vào cửa sổ nào?',
      choices: ['0 10 10 20', '0 0 10 10', '10 10 20 20', '0 10 20 20'],
      answerIndex: 0,
      explain:
        'Cửa sổ nhảy rời chứa đầu và hở đuôi: mốc 10 mở cửa sổ mới chứ không nằm nốt trong cửa sổ 0. Nhờ luật đó mỗi sự kiện thuộc ĐÚNG MỘT cửa sổ, không bị đếm hai lần ở ranh giới — thứ mà cách chia thủ công bằng chuỗi điều kiện rất hay làm sai.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm đếm theo cửa sổ: tạo bảng đếm, chọn đồng hồ cho từng sự kiện, tính đầu cửa sổ rồi cộng dồn.',
      lines: [
        'function demTheoCuaSo(ds: SuKien[], doDai: number, theoSuKien: boolean) {',
        '  const dem = new Map<number, number>()',
        '  for (const s of ds) {',
        '    const t = theoSuKien ? s.tSuKien : s.tXuLy',
        '    const cua = dauCuaSo(t, doDai)',
        '    dem.set(cua, (dem.get(cua) ?? 0) + 1)',
        '  }',
        '  return dem',
        '}',
      ],
    },
    make: {
      prompt:
        'Chứng minh bằng code rằng hai đồng hồ cho hai bức tranh khác nhau.\n\n- dauCuaSo(t, doDai): đầu cửa sổ nhảy rời chứa mốc t.\n- tongTheoCuaSo(ds, doDai, theoSuKien): cộng cột `tien` theo cửa sổ; chọn thời gian sự kiện khi theoSuKien là đúng, ngược lại dùng thời gian xử lý. Trả về chuỗi các cặp "đầuCửaSổ:tổng" sắp TĂNG theo đầu cửa sổ, nối bằng một dấu cách.\n- Chuỗi rỗng khi không có sự kiện nào.\n\nDùng starter code có sẵn (đừng sửa phần dưới): 4 sự kiện, cửa sổ dài 10.',
      starterCode: `interface SuKien {
  id: string
  tSuKien: number
  tXuLy: number
  tien: number
}

function dauCuaSo(t: number, doDai: number): number {
  // TODO
  return 0
}

function tongTheoCuaSo(ds: SuKien[], doDai: number, theoSuKien: boolean): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const DS: SuKien[] = [
  { id: "A", tSuKien: 5, tXuLy: 6, tien: 100 },
  { id: "B", tSuKien: 8, tXuLy: 12, tien: 200 },
  { id: "C", tSuKien: 12, tXuLy: 13, tien: 300 },
  { id: "D", tSuKien: 9, tXuLy: 21, tien: 400 },
]
console.log("Su kien:", tongTheoCuaSo(DS, 10, true))
console.log("Xu ly  :", tongTheoCuaSo(DS, 10, false))
console.log("Rong   :", "[" + tongTheoCuaSo([], 10, true) + "]")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Su kien: 0:700 10:300',
          match: 'contains',
          hidden: false,
          label: 'Theo thời gian sự kiện: A+B+D vào cửa sổ 0 (700), C vào cửa sổ 10 (300)',
        },
        {
          stdinLines: [],
          expected: 'Xu ly  : 0:100 10:500 20:400',
          match: 'contains',
          hidden: false,
          label: 'Theo thời gian xử lý: cùng dữ liệu nhưng ra ba cửa sổ với con số khác hẳn',
        },
        {
          stdinLines: [],
          expected: 'Rong   : []',
          match: 'contains',
          hidden: false,
          label: 'Không có sự kiện nào thì trả chuỗi rỗng, không phải chữ "undefined"',
        },
        {
          stdinLines: [],
          expected: 'Su kien: 0:700 10:300\nXu ly  : 0:100 10:500 20:400\nRong   : []',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'dauCuaSo chỉ có một dòng: Math.floor(t / doDai) * doDai. Đừng viết chuỗi if so sánh từng khoảng — cách đó luôn sai ở ranh giới.',
        'tongTheoCuaSo: dùng Map<number, number> cộng dồn, lấy giá trị cũ bằng dem.get(cua) ?? 0 để lần đầu không thành NaN.',
        'Trước khi nối chuỗi, PHẢI sắp theo khoá: [...dem.entries()].sort((a, b) => a[0] - b[0]) — thứ tự chèn vào Map không phải thứ tự thời gian, và kết quả không tất định thì không test được.',
      ],
      sampleSolution: `interface SuKien {
  id: string
  tSuKien: number
  tXuLy: number
  tien: number
}

function dauCuaSo(t: number, doDai: number): number {
  return Math.floor(t / doDai) * doDai
}

function tongTheoCuaSo(ds: SuKien[], doDai: number, theoSuKien: boolean): string {
  const tong = new Map<number, number>()
  for (const s of ds) {
    const t = theoSuKien ? s.tSuKien : s.tXuLy
    const cua = dauCuaSo(t, doDai)
    tong.set(cua, (tong.get(cua) ?? 0) + s.tien)
  }
  return [...tong.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cua, v]) => cua + ":" + v)
    .join(" ")
}

// ---- Đừng sửa phần dưới đây ----
const DS: SuKien[] = [
  { id: "A", tSuKien: 5, tXuLy: 6, tien: 100 },
  { id: "B", tSuKien: 8, tXuLy: 12, tien: 200 },
  { id: "C", tSuKien: 12, tXuLy: 13, tien: 300 },
  { id: "D", tSuKien: 9, tXuLy: 21, tien: 400 },
]
console.log("Su kien:", tongTheoCuaSo(DS, 10, true))
console.log("Xu ly  :", tongTheoCuaSo(DS, 10, false))
console.log("Rong   :", "[" + tongTheoCuaSo([], 10, true) + "]")`,
    },
    homework:
      'Lấy một nguồn sự kiện thật mà bạn chạm được: nhật ký truy cập máy chủ, lịch sử tin nhắn xuất ra tệp, hoặc dữ liệu bước chân trong ứng dụng sức khoẻ của bạn. Tìm xem nó có mấy dấu thời gian, cái nào là thời gian sự kiện và cái nào là thời gian ghi nhận. Nếu chỉ có một, hãy viết ba câu về hậu quả: bạn sẽ KHÔNG trả lời được câu hỏi nào về thế giới, và số liệu sẽ méo trong hoàn cảnh nào.',
    srsCards: [
      {
        hoi: 'Thời gian sự kiện khác thời gian xử lý ở chỗ nào?',
        dap: 'Thời gian sự kiện là lúc chuyện thật sự xảy ra ngoài đời, do nguồn ghi lại; thời gian xử lý là lúc hệ thống nhìn thấy sự kiện đó, do máy chủ ghi lại. Khoảng lệch giữa hai mốc là độ trễ.',
      },
      {
        hoi: 'Câu hỏi nào quyết định nên nhóm theo đồng hồ nào?',
        dap: 'Hỏi xem mình đang trả lời câu hỏi về THẾ GIỚI hay về HỆ THỐNG: hành vi người dùng thì nhóm theo thời gian sự kiện, còn tải máy chủ hay tồn đọng hàng đợi thì nhóm theo thời gian xử lý.',
      },
      {
        hoi: 'Cửa sổ nhảy rời (tumbling window) là gì và tính đầu cửa sổ ra sao?',
        dap: 'Là cách chia trục thời gian thành các đoạn dài bằng nhau và không chồng lên nhau; đầu cửa sổ bằng phần nguyên của thời gian chia độ dài rồi nhân lại với độ dài, nên mỗi sự kiện thuộc đúng một cửa sổ.',
      },
      {
        hoi: 'Vì sao nhóm theo thời gian sự kiện mới kiểm chứng được kết quả?',
        dap: 'Vì con số của mỗi cửa sổ chỉ phụ thuộc dữ liệu chứ không phụ thuộc lúc sự kiện tới, nên chạy lại luôn ra kết quả cũ và đối chiếu được với số liệu tính theo lô.',
      },
    ],
  },
  {
    id: 'p6-u127-l2',
    unitId: 'p6-u127',
    language: 'typescript',
    title: 'Mốc nước và sự kiện tới muộn — chờ tới bao giờ thì chốt sổ',
    hook: 'Nhóm theo thời gian sự kiện thì bạn nợ một câu trả lời khó: cửa sổ 20 giờ đã kết thúc rồi, nhưng biết đâu vẫn còn một sự kiện của 20 giờ đang lê lết đâu đó trong mạng. Chốt ngay thì có nguy cơ thiếu; chờ mãi thì bảng điều khiển không bao giờ hiện số nào cả.',
    theory:
      'MỐC NƯỚC (watermark) là câu trả lời của ngành: một tuyên bố có kiểm soát rằng **"tôi tin mọi sự kiện có thời gian sự kiện nhỏ hơn mốc này thì đã tới đủ rồi"**. Nó là một con số chạy dọc trục thời gian sự kiện, luôn tăng, không bao giờ lùi.\n\nCách sinh mốc nước phổ biến nhất là trừ đi một khoảng dung sai cố định:\n\n    mốc nước = thời gian sự kiện lớn nhất đã thấy - độ trễ cho phép\n\nMột cửa sổ được ĐÓNG (chốt sổ, phát kết quả ra ngoài) khi mốc nước đã vượt qua cuối cửa sổ đó. Sự kiện tới sau khi cửa sổ của nó đã đóng gọi là SỰ KIỆN TỚI MUỘN (late event).\n\nĐây là chỗ đánh đổi lộ ra trần trụi, và không có lựa chọn nào miễn phí:\n\n- **Độ trễ cho phép NHỎ:** bảng điều khiển hiện số nhanh, nhưng nhiều sự kiện bị coi là tới muộn và con số bị thiếu.\n- **Độ trễ cho phép LỚN:** con số đầy đủ hơn, nhưng mọi kết quả đều chậm đúng bằng khoảng đó, và hệ thống phải giữ trạng thái của nhiều cửa sổ chưa đóng trong bộ nhớ.\n\nBa cách xử lý sự kiện tới muộn, chọn theo nghiệp vụ chứ không theo sở thích:\n\n1. **Bỏ đi** và ĐẾM số bị bỏ. Đơn giản nhất, chấp nhận được cho chỉ số theo dõi. Điều bắt buộc là phải đếm — bỏ im lặng thì bạn không bao giờ biết mình đang sai bao nhiêu.\n2. **Sửa lại kết quả (cập nhật muộn):** mở lại cửa sổ, cộng thêm sự kiện, phát ra bản đã sửa. Đúng nhất, nhưng bên tiêu thụ kết quả phải chịu được việc một con số quá khứ bị thay đổi.\n3. **Đưa sang luồng phụ (side output):** ghi riêng để xử lý theo lô về sau, thường ghép với một lượt tính lại hằng đêm.\n\nMột đường ống nghiêm túc thường dùng kiến trúc **luồng nhanh cho ngay, lô chậm cho đúng**: luồng thời gian thực cho con số gần đúng trong vài giây, còn bản tính lại theo lô mỗi đêm là nguồn chân lý cuối cùng. Đó cũng là cách người ta đạt yêu cầu "sai lệch giữa luồng và lô nhỏ hơn 0,1%" trong dự án chặng này.\n\nCòn ĐÚNG-MỘT-LẦN (exactly-once) thì sao? Đường truyền thật chỉ bảo đảm được "ít nhất một lần" — nghĩa là sự kiện có thể tới TRÙNG khi có lần gửi lại. Thứ gọi là đúng-một-lần trên thực tế đạt được bằng cách xử lý trùng mà kết quả không đổi: mỗi sự kiện mang một id duy nhất, bộ tiêu thụ nhớ những id đã thấy trong một khoảng thời gian và bỏ qua bản trùng. Cái giá là bộ nhớ để giữ danh sách id ấy — nên khoảng nhớ luôn hữu hạn, và đó là lý do đúng-một-lần luôn kèm một điều kiện ngầm: chỉ đúng trong cửa sổ khử trùng.',
    workedExample: {
      code: `interface SuKien {
  id: string
  tSuKien: number
}

// Moc nuoc = thoi gian su kien lon nhat da thay tru do tre cho phep.
function mocNuoc(daThay: SuKien[], doTre: number): number {
  let lonNhat = 0
  for (const s of daThay) {
    if (s.tSuKien > lonNhat) lonNhat = s.tSuKien
  }
  return lonNhat - doTre
}

// Cua so [dau, dau + doDai) da dong khi moc nuoc vuot qua cuoi cua so.
function daDong(dauCuaSo: number, doDai: number, moc: number): boolean {
  return moc >= dauCuaSo + doDai
}

const DA_THAY: SuKien[] = [
  { id: "A", tSuKien: 5 },
  { id: "B", tSuKien: 12 },
  { id: "C", tSuKien: 23 },
]

const moc = mocNuoc(DA_THAY, 5) // 23 - 5 = 18
console.log("Moc nuoc:", moc)
console.log("Cua so [0,10) da dong:", daDong(0, 10, moc)) // 18 vuot 10 -> dong
console.log("Cua so [10,20) da dong:", daDong(10, 10, moc)) // 18 chua toi 20 -> con mo

// Su kien toi muon: thuoc cua so DA DONG thi bi bo (va phai duoc DEM).
const TOI_SAU: SuKien[] = [
  { id: "D", tSuKien: 7 }, // cua so [0,10) da dong -> muon
  { id: "E", tSuKien: 15 }, // cua so [10,20) con mo -> van kip
]
const muon = TOI_SAU.filter((s) => daDong(Math.floor(s.tSuKien / 10) * 10, 10, moc))
console.log("So su kien toi muon:", muon.length, "-", muon.map((s) => s.id).join(","))`,
      stdinLines: [],
    },
    predict: {
      code: `function mocNuoc(ts: number[], doTre: number): number {
  let lonNhat = 0
  for (const t of ts) {
    if (t > lonNhat) lonNhat = t
  }
  return lonNhat - doTre
}
const moc = mocNuoc([5, 12, 23, 9], 5)
console.log(moc, moc >= 20)`,
      question: 'Đã thấy các mốc 5, 12, 23, 9 với độ trễ cho phép 5 — mốc nước bằng bao nhiêu?',
      choices: ['18 false', '4 false', '18 true', '23 true'],
      answerIndex: 0,
      explain:
        'Mốc nước lấy theo thời gian sự kiện LỚN NHẤT đã thấy (23), không phải theo sự kiện đến sau cùng (9) — nếu lấy theo cái đến sau cùng thì mốc nước sẽ lùi lại, và một cửa sổ đã đóng có thể mở ra lần nữa, phá vỡ mọi con số đã phát. Mốc là 23 trừ 5 bằng 18, chưa vượt 20 nên cửa sổ 10 tới 20 vẫn còn mở.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm tính mốc nước: khởi tạo giá trị lớn nhất, duyệt sự kiện đã thấy, chỉ nâng khi gặp mốc lớn hơn, rồi trừ dung sai.',
      lines: [
        'function mocNuoc(daThay: SuKien[], doTre: number): number {',
        '  let lonNhat = 0',
        '  for (const s of daThay) {',
        '    if (s.tSuKien > lonNhat) lonNhat = s.tSuKien',
        '  }',
        '  return lonNhat - doTre',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết phần lõi của một bộ tiêu thụ luồng: khử trùng rồi phân loại sự kiện tới muộn.\n\n- khuTrung(ds): bỏ sự kiện có id đã gặp, GIỮ bản đầu tiên và giữ nguyên thứ tự.\n- mocNuoc(ds, doTre): thời gian sự kiện lớn nhất trừ doTre; danh sách rỗng thì trả 0.\n- demToiMuon(ds, doDai, moc): đếm số sự kiện thuộc cửa sổ đã đóng, tức cửa sổ có cuối nhỏ hơn hoặc bằng mốc nước. Nhớ khử trùng trước khi đếm — bản trùng không phải sự kiện mới.\n\nDùng starter code có sẵn (đừng sửa phần dưới): 6 bản ghi, trong đó có một bản trùng id.',
      starterCode: `interface SuKien {
  id: string
  tSuKien: number
}

function khuTrung(ds: SuKien[]): SuKien[] {
  // TODO
  return []
}

function mocNuoc(ds: SuKien[], doTre: number): number {
  // TODO
  return 0
}

function demToiMuon(ds: SuKien[], doDai: number, moc: number): number {
  // TODO
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const DS: SuKien[] = [
  { id: "A", tSuKien: 5 },
  { id: "B", tSuKien: 12 },
  { id: "A", tSuKien: 5 },
  { id: "C", tSuKien: 23 },
  { id: "D", tSuKien: 7 },
  { id: "E", tSuKien: 15 },
]
const sach = khuTrung(DS)
const moc = mocNuoc(sach, 5)
console.log("Sau khu trung:", sach.length, "-", sach.map((s) => s.id).join(","))
console.log("Moc nuoc:", moc)
console.log("Toi muon:", demToiMuon(sach, 10, moc))
console.log("Do tre lon hon, toi muon:", demToiMuon(sach, 10, mocNuoc(sach, 20)))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Sau khu trung: 5 - A,B,C,D,E',
          match: 'contains',
          hidden: false,
          label: 'Bản trùng id A bị bỏ, giữ bản đầu và giữ nguyên thứ tự',
        },
        {
          stdinLines: [],
          expected: 'Moc nuoc: 18',
          match: 'contains',
          hidden: false,
          label: 'Thời gian sự kiện lớn nhất 23 trừ độ trễ 5',
        },
        {
          stdinLines: [],
          expected: 'Toi muon: 2',
          match: 'contains',
          hidden: false,
          label: 'Cửa sổ 0 tới 10 đã đóng (cuối 10 nhỏ hơn mốc 18) nên A và D là tới muộn',
        },
        {
          stdinLines: [],
          expected: 'Do tre lon hon, toi muon: 0',
          match: 'contains',
          hidden: false,
          label: 'Độ trễ 20 kéo mốc về 3, chưa cửa sổ nào đóng — chờ lâu hơn thì mất ít hơn',
        },
        {
          stdinLines: [],
          expected:
            'Sau khu trung: 5 - A,B,C,D,E\nMoc nuoc: 18\nToi muon: 2\nDo tre lon hon, toi muon: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả bốn dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'khuTrung: dùng một Set<string> nhớ id đã gặp; gặp id mới thì thêm vào Set và đẩy sự kiện vào mảng kết quả, gặp id cũ thì bỏ qua. Cách này giữ nguyên thứ tự tới.',
        'mocNuoc: giống bài trước, duyệt tìm giá trị lớn nhất rồi trừ doTre. Khởi tạo biến lớn nhất bằng 0 để danh sách rỗng tự cho kết quả 0 khi doTre bằng 0.',
        'demToiMuon: cửa sổ của một sự kiện bắt đầu tại Math.floor(t / doDai) * doDai, cuối cửa sổ là đầu cộng doDai. Sự kiện là tới muộn khi cuối cửa sổ đó nhỏ hơn hoặc bằng mốc nước.',
      ],
      sampleSolution: `interface SuKien {
  id: string
  tSuKien: number
}

function khuTrung(ds: SuKien[]): SuKien[] {
  const daThay = new Set<string>()
  const ketQua: SuKien[] = []
  for (const s of ds) {
    if (daThay.has(s.id)) continue
    daThay.add(s.id)
    ketQua.push(s)
  }
  return ketQua
}

function mocNuoc(ds: SuKien[], doTre: number): number {
  if (ds.length === 0) return 0
  let lonNhat = 0
  for (const s of ds) {
    if (s.tSuKien > lonNhat) lonNhat = s.tSuKien
  }
  return lonNhat - doTre
}

function demToiMuon(ds: SuKien[], doDai: number, moc: number): number {
  let dem = 0
  for (const s of ds) {
    const cuoiCuaSo = Math.floor(s.tSuKien / doDai) * doDai + doDai
    if (cuoiCuaSo <= moc) dem += 1
  }
  return dem
}

// ---- Đừng sửa phần dưới đây ----
const DS: SuKien[] = [
  { id: "A", tSuKien: 5 },
  { id: "B", tSuKien: 12 },
  { id: "A", tSuKien: 5 },
  { id: "C", tSuKien: 23 },
  { id: "D", tSuKien: 7 },
  { id: "E", tSuKien: 15 },
]
const sach = khuTrung(DS)
const moc = mocNuoc(sach, 5)
console.log("Sau khu trung:", sach.length, "-", sach.map((s) => s.id).join(","))
console.log("Moc nuoc:", moc)
console.log("Toi muon:", demToiMuon(sach, 10, moc))
console.log("Do tre lon hon, toi muon:", demToiMuon(sach, 10, mocNuoc(sach, 20)))`,
    },
    homework:
      'Chọn một chỉ số thời gian thực mà bạn thật sự quan tâm (số người đang online, số đơn mỗi phút, số lỗi mỗi phút). Viết ra giấy ba con số: độ trễ cho phép bạn chọn, tỉ lệ sự kiện bạn ước sẽ bị coi là tới muộn với độ trễ đó, và hậu quả nghiệp vụ nếu con số hiển thị thiếu đúng tỉ lệ ấy. Rồi trả lời: nghiệp vụ này cần cách bỏ, cách sửa lại, hay cách đưa sang luồng phụ?',
    srsCards: [
      {
        hoi: 'Mốc nước (watermark) trong xử lý luồng tuyên bố điều gì?',
        dap: 'Rằng mọi sự kiện có thời gian sự kiện nhỏ hơn mốc đó coi như đã tới đủ, nên các cửa sổ nằm trước mốc được phép chốt sổ và phát kết quả ra ngoài.',
      },
      {
        hoi: 'Tăng độ trễ cho phép của mốc nước thì được gì và mất gì?',
        dap: 'Được kết quả đầy đủ hơn vì ít sự kiện bị coi là tới muộn, nhưng mọi kết quả đều chậm thêm đúng khoảng đó và hệ thống phải giữ trạng thái của nhiều cửa sổ chưa đóng.',
      },
      {
        hoi: 'Có ba cách xử lý sự kiện tới muộn, đó là những cách nào?',
        dap: 'Bỏ đi nhưng bắt buộc phải đếm số bị bỏ; mở lại cửa sổ và phát bản kết quả đã sửa; hoặc đưa sang luồng phụ để tính lại theo lô về sau.',
      },
      {
        hoi: 'Đúng-một-lần trên thực tế đạt được bằng cơ chế nào?',
        dap: 'Bằng khử trùng theo id sự kiện: đường truyền chỉ bảo đảm ít nhất một lần, nên bộ tiêu thụ nhớ các id đã xử lý trong một cửa sổ hữu hạn và bỏ qua bản trùng.',
      },
    ],
  },
]
