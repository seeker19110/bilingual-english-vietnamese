// lessons/p6u22.ts — P6-U22: HƯỚNG WEB, chặng S4 (chuyên gia) — THỜI GIAN THỰC
// (module `web-s4-m1`: WebSocket/pub-sub nhiều tiến trình · presence, reconnect, gửi lại
// đúng thứ tự).
//
// Vì sao hai bài này KHÔNG dựng WebSocket thật: bộ chạy bài học không có mạng, không có
// tiến trình thứ hai, và quan trọng hơn — thứ khiến hệ thống thời gian thực hỏng KHÔNG
// phải cú pháp `new WebSocket(...)`. Nó là hai phán đoán: (1) gói tin đến SAI THỨ TỰ hoặc
// đến HAI LẦN thì trạng thái cuối cùng ra sao, (2) sau khi mất kết nối rồi nối lại thì lấy
// từ đâu mà chạy tiếp. Cả hai quy được về một hàm THUẦN nhận danh sách gói tin và trả về
// trạng thái — nên chấm được bằng test-case, và mỗi lần chạy ra đúng một kết quả.
//
// Đây đúng luật số 1 của chặng S4 (docs/specs/2026-08-27-chang-s4-13-huong.md): S4 dạy
// PHÁN ĐOÁN, mô phỏng tất định; hạ tầng thật để dành cho dự án của chặng.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U22_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u22-l1',
    unitId: 'p6-u22',
    language: 'typescript',
    title: 'Gói tin đến sai thứ tự — hoà giải bằng số thứ tự',
    hook: 'Hai người cùng sửa một tài liệu. Trên máy A, chữ hiện ra là "Chao ban"; trên máy B cùng tài liệu đó lại là "Chaoban ". Không ai gõ sai, mạng cũng không mất gói nào. Chỉ là gói tin số 4 về tới trước gói số 3 — và code của bạn cứ đến đâu áp đến đó.',
    theory:
      'Trên một kết nối WebSocket duy nhất, thứ tự gói tin được giữ. Nhưng hệ thật gần như không bao giờ chỉ có một kết nối: server chạy nhiều tiến trình (dự án DHCB đang chạy PM2 cluster 3 instance), tin đi qua pub/sub Redis, client rớt mạng rồi nối lại vào tiến trình khác. Từ lúc đó, thứ tự ĐẾN không còn là thứ tự XẢY RA.\n\nLuật nghề: đừng tin thứ tự đến. Hãy đánh SỐ THỨ TỰ (seq) cho từng thay đổi tại nơi sinh ra nó, rồi bên nhận tự sắp lại.\n\nMáy nhận giữ đúng hai thứ:\n\n· `daApDung` — seq lớn nhất đã áp vào trạng thái (bắt đầu từ 0).\n· `chuong` — kho tạm giữ những gói tới sớm mà chưa tới lượt.\n\nMỗi khi một gói seq = n về, xét ba ca, và ba ca này là toàn bộ bài toán:\n\n① n === daApDung + 1 → ĐÚNG LƯỢT: áp ngay, tăng daApDung, rồi xem trong kho tạm có gói kế tiếp không, có thì áp tiếp (dây chuyền).\n② n <= daApDung → TRÙNG: đã áp rồi, BỎ QUA. Đây là ca xảy ra mỗi lần bên gửi gửi lại vì không nhận được xác nhận — bỏ qua nó chính là tính LŨY ĐẲNG (idempotent), thứ giữ cho "gửi lại" không bao giờ làm hỏng dữ liệu.\n③ n > daApDung + 1 → TỚI SỚM: chưa tới lượt, cất vào kho tạm, KHÔNG áp. Áp ngay là sinh ra đúng cái lỗi "Chaoban " ở trên.\n\nHai hệ quả phải nhớ:\n\n· Trạng thái cuối chỉ phụ thuộc TẬP gói tin, không phụ thuộc thứ tự đến. Đó là tính chất duy nhất khiến hệ thời gian thực kiểm chứng được bằng test: xáo trộn thứ tự đầu vào bao nhiêu lần cũng phải ra một kết quả.\n· Sau khi nối lại, client chỉ cần nói "tôi đang ở seq 7" là server biết phải gửi bù từ 8. Không cần lịch sử đầy đủ, không cần đoán.\n\nCái này KHÁC với giải xung đột (CRDT/OT): ở đây mọi thay đổi đã được sắp thứ tự sẵn tại nguồn, ta chỉ khôi phục lại thứ tự đó. CRDT giải bài khó hơn — hai thay đổi thật sự đồng thời, không ai sinh trước ai.',
    workedExample: {
      code: `interface GoiTin {
  seq: number
  chu: string
}

// Máy nhận: giữ văn bản + seq đã áp + kho tạm cho gói tới sớm
function apDung(goiTinDen: GoiTin[]): string {
  let vanBan = ""
  let daApDung = 0
  const chuong = new Map<number, string>()

  for (const goi of goiTinDen) {
    if (goi.seq <= daApDung) continue          // ② trùng — đã áp rồi, bỏ qua
    if (goi.seq > daApDung + 1) {              // ③ tới sớm — cất vào kho tạm
      chuong.set(goi.seq, goi.chu)
      continue
    }
    vanBan += goi.chu                          // ① đúng lượt — áp ngay
    daApDung = goi.seq
    // rồi tháo dây chuyền: gói kế tiếp có sẵn trong kho thì áp luôn
    let ke = chuong.get(daApDung + 1)
    while (ke !== undefined) {
      vanBan += ke
      chuong.delete(daApDung + 1)
      daApDung += 1
      ke = chuong.get(daApDung + 1)
    }
  }
  return vanBan
}

// Gói 4 về TRƯỚC gói 3, và gói 2 bị gửi lại lần nữa:
const den: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 2, chu: " " },
  { seq: 4, chu: "n" },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
]
console.log("Ket qua:", apDung(den))
// Đọc kết quả: "Chao ban" — đúng như khi mọi gói về đúng thứ tự.`,
      stdinLines: [],
    },
    predict: {
      code: `interface GoiTin {
  seq: number
  chu: string
}

// Cách SAI mà ai cũng viết lần đầu: đến đâu nối đến đó, không nhìn seq
function apDungNgayThang(goiTinDen: GoiTin[]): string {
  let vanBan = ""
  for (const goi of goiTinDen) {
    vanBan += goi.chu
  }
  return vanBan
}

const den: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 2, chu: " " },
  { seq: 4, chu: "n" },
  { seq: 3, chu: "ba" },
]

console.log("Ket qua:", apDungNgayThang(den))`,
      question: 'Chương trình in ra gì?',
      choices: ['Ket qua: Chao nba', 'Ket qua: Chao ban', 'Ket qua: Chaoban', 'Ket qua: nbaChao'],
      answerIndex: 0,
      explain:
        'In ra "Ket qua: Chao nba". Gói seq 4 ("n") về trước gói seq 3 ("ba"), mà hàm này nối theo đúng thứ tự ĐẾN nên chữ "n" chen vào giữa. Điều đáng sợ của loại lỗi này là nó không ném lỗi, không ghi log, và trên máy người khác kết quả lại đúng — vì mạng của họ hôm đó không đảo gói. Chỉ số seq mới nói được "chưa tới lượt".',
    },
    parsons: {
      prompt:
        'Xếp lại thân vòng lặp của máy nhận: chặn gói trùng trước, rồi cất gói tới sớm, rồi mới áp gói đúng lượt.',
      lines: [
        'for (const goi of goiTinDen) {',
        '  if (goi.seq <= daApDung) continue',
        '  if (goi.seq > daApDung + 1) {',
        '    chuong.set(goi.seq, goi.chu)',
        '    continue',
        '  }',
        '  vanBan += goi.chu',
        '  daApDung = goi.seq',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `apDung(goiTinDen: GoiTin[]): string` cho máy nhận của một trình soạn thảo cộng tác.\n\nLuật:\n· Gói có `seq === daApDung + 1`: nối `chu` vào văn bản, tăng `daApDung`, rồi áp tiếp các gói kế tiếp đang nằm trong kho tạm (dây chuyền).\n· Gói có `seq <= daApDung`: đã áp rồi — BỎ QUA (gửi lại không được nhân đôi chữ).\n· Gói có `seq > daApDung + 1`: chưa tới lượt — cất vào kho tạm, chưa nối gì cả.\n\nBắt đầu với `daApDung = 0`, văn bản rỗng. Kết quả cuối KHÔNG được phụ thuộc thứ tự các gói đến.',
      starterCode: `interface GoiTin {
  seq: number
  chu: string
}

function apDung(goiTinDen: GoiTin[]): string {
  // TODO: ba ca — trùng / tới sớm / đúng lượt
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const dungThuTu: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
  { seq: 4, chu: "n" },
]
const daoThuTu: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 4, chu: "n" },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
]
const guiLai: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 2, chu: " " },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
  { seq: 1, chu: "Chao" },
  { seq: 4, chu: "n" },
]
const thieuGoi: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 3, chu: "ba" },
  { seq: 4, chu: "n" },
]

console.log("Dung thu tu:", apDung(dungThuTu))
console.log("Dao thu tu:", apDung(daoThuTu))
console.log("Gui lai:", apDung(guiLai))
console.log("Thieu goi 2:", apDung(thieuGoi))
console.log("On dinh:", apDung(dungThuTu) === apDung(daoThuTu) ? "co" : "khong")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Dung thu tu: Chao ban',
          match: 'contains',
          hidden: false,
          label: 'Mọi gói về đúng thứ tự — ca dễ nhất, phải đúng trước đã',
        },
        {
          stdinLines: [],
          expected: 'Dao thu tu: Chao ban',
          match: 'contains',
          hidden: false,
          label: 'Gói 4 về trước gói 2 và 3 — kết quả vẫn phải y hệt',
        },
        {
          stdinLines: [],
          expected: 'Gui lai: Chao ban',
          match: 'contains',
          hidden: false,
          label: 'Gói 1 và 2 được gửi lại — chữ không được nhân đôi (lũy đẳng)',
        },
        {
          stdinLines: [],
          expected: 'Thieu goi 2: Chao',
          match: 'contains',
          hidden: false,
          label: 'Mất hẳn gói 2 — dừng ở "Chao", KHÔNG được nhảy cóc áp gói 3 và 4',
        },
        {
          stdinLines: [],
          expected: 'On dinh: co',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — cùng tập gói tin, đảo thứ tự đến vẫn ra một kết quả',
        },
      ],
      hints: [
        'Giữ đúng ba biến: `vanBan` (chuỗi kết quả), `daApDung` (số bắt đầu từ 0), và một `new Map<number, string>()` làm kho tạm.',
        'Thứ tự ba nhánh trong vòng lặp quan trọng: chặn TRÙNG (`goi.seq <= daApDung`) trước, rồi TỚI SỚM (`goi.seq > daApDung + 1`), còn lại mới là đúng lượt. Đảo hai nhánh đầu là gói trùng lọt vào kho tạm.',
        'Ca "Thieu goi 2" đang bắt bạn: sau khi áp gói 1, gói 3 và 4 phải nằm im trong kho tạm mãi mãi. Nếu bạn ra "Chaoban" nghĩa là đang áp gói chưa tới lượt.',
        'Sau khi áp một gói đúng lượt, phải THÁO DÂY CHUYỀN:\n\nlet ke = chuong.get(daApDung + 1)\nwhile (ke !== undefined) {\n  vanBan += ke\n  chuong.delete(daApDung + 1)\n  daApDung += 1\n  ke = chuong.get(daApDung + 1)\n}\n\nKhông có vòng này thì ca "Dao thu tu" dừng ở "Chao ba".',
      ],
      sampleSolution: `interface GoiTin {
  seq: number
  chu: string
}

function apDung(goiTinDen: GoiTin[]): string {
  let vanBan = ""
  let daApDung = 0
  const chuong = new Map<number, string>()

  for (const goi of goiTinDen) {
    if (goi.seq <= daApDung) continue
    if (goi.seq > daApDung + 1) {
      chuong.set(goi.seq, goi.chu)
      continue
    }
    vanBan += goi.chu
    daApDung = goi.seq
    let ke = chuong.get(daApDung + 1)
    while (ke !== undefined) {
      vanBan += ke
      chuong.delete(daApDung + 1)
      daApDung += 1
      ke = chuong.get(daApDung + 1)
    }
  }
  return vanBan
}

// ---- Đừng sửa phần dưới đây ----
const dungThuTu: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
  { seq: 4, chu: "n" },
]
const daoThuTu: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 4, chu: "n" },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
]
const guiLai: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 2, chu: " " },
  { seq: 2, chu: " " },
  { seq: 3, chu: "ba" },
  { seq: 1, chu: "Chao" },
  { seq: 4, chu: "n" },
]
const thieuGoi: GoiTin[] = [
  { seq: 1, chu: "Chao" },
  { seq: 3, chu: "ba" },
  { seq: 4, chu: "n" },
]

console.log("Dung thu tu:", apDung(dungThuTu))
console.log("Dao thu tu:", apDung(daoThuTu))
console.log("Gui lai:", apDung(guiLai))
console.log("Thieu goi 2:", apDung(thieuGoi))
console.log("On dinh:", apDung(dungThuTu) === apDung(daoThuTu) ? "co" : "khong")`,
    },
    homework:
      'Mở tính năng "Đi chung" của chính dự án này (`/nhom-di-chung`) — vị trí bạn bè đẩy qua WebSocket `/ws/location`, và server chạy 3 tiến trình PM2 nên hai gói của cùng một người có thể đi qua hai tiến trình khác nhau. Tự trả lời trên giấy: nếu gói "vị trí lúc 10:00:05" về SAU gói "10:00:07" thì bản đồ vẽ ra chấm ở đâu? Rồi tìm trong mã nguồn xem chỗ nào đang giữ vai trò `daApDung` — nếu không tìm thấy, bạn vừa tìm ra một lỗi thật.',
    srsCards: [
      {
        hoi: 'Máy nhận thấy gói có seq nhỏ hơn hoặc bằng seq đã áp thì làm gì?',
        dap: 'Bỏ qua hoàn toàn, không áp lại. Đây là gói được gửi lại vì bên gửi không nhận được xác nhận; bỏ qua chính là tính lũy đẳng, giữ cho việc gửi lại không bao giờ nhân đôi dữ liệu.',
      },
      {
        hoi: 'Vì sao không được tin thứ tự gói tin đến, dù WebSocket giữ thứ tự trên một kết nối?',
        dap: 'Vì hệ thật hiếm khi chỉ có một kết nối: server nhiều tiến trình, tin đi qua pub/sub, client rớt rồi nối lại vào tiến trình khác. Từ lúc đó thứ tự đến không còn là thứ tự xảy ra, nên phải đánh số seq tại nguồn và sắp lại ở bên nhận.',
      },
      {
        hoi: 'Gói tới sớm (seq lớn hơn daApDung + 1) được xử lý thế nào?',
        dap: 'Cất vào kho tạm và chưa áp gì cả; chỉ khi gói còn thiếu về tới thì mới áp nó rồi tháo dây chuyền các gói kế tiếp trong kho. Áp ngay sẽ làm nội dung xáo trộn mà không có lỗi nào được ném ra.',
      },
    ],
  },
  {
    id: 'p6-u22-l2',
    unitId: 'p6-u22',
    language: 'typescript',
    title: 'Presence — ai đang online, khi server có nhiều tiến trình',
    hook: 'Danh sách "đang online" của bạn hiện 47 người, trong khi phòng chat chỉ có 12 người thật sự đang gõ. 35 cái tên kia là người đã đóng tab từ hôm qua: tab đóng đột ngột thì trình duyệt không kịp báo "tôi thoát" cho ai cả.',
    theory:
      'Presence ("ai đang online") nhìn thì tầm thường, làm thì sai gần như chắc chắn, vì hai sự thật phũ phàng:\n\n· Sự kiện RỜI ĐI không đáng tin. Mất sóng 4G, sập nguồn máy, tab bị hệ điều hành giết — không cái nào gửi được lời chào tạm biệt. Ai coi "online = đã nhận connect, chưa nhận disconnect" thì danh sách chỉ có tăng.\n· Một người có NHIỀU kết nối. Điện thoại một tab, máy tính hai tab. Đóng một tab không có nghĩa người đó offline.\n\nCách làm đúng, và cũng là cách mọi thư viện presence nghiêm túc làm: KHÔNG lưu trạng thái online/offline. Chỉ lưu DẤU VẾT SỐNG — mỗi kết nối định kỳ gửi một nhịp (heartbeat), server ghi lại "kết nối này còn thấy lúc t". Online trở thành một thứ được TÍNH RA:\n\n  người X online ⇔ tồn tại kết nối của X có (bây giờ − lanCuoi) <= hạn\n\nBa điều rút ra:\n\n① Đây lại đúng luật "không lưu giá trị dẫn xuất" của chặng S1: online là giá trị TÍNH ĐƯỢC từ dấu vết, lưu nó thành cờ riêng là tự tạo ra nguồn sự thật thứ hai — cái sẽ lệch.\n② Hạn (TTL) phải LỚN HƠN vài lần chu kỳ nhịp. Nhịp 10 giây mà hạn 10 giây thì chỉ cần một nhịp về trễ là người đang gõ bỗng "offline". Quy tắc thường dùng: hạn ≈ 3 lần chu kỳ.\n③ Với nhiều tiến trình, dấu vết phải nằm ở chỗ dùng chung (Redis) chứ không nằm trong bộ nhớ tiến trình — nếu không, mỗi tiến trình biết một phần và ba người dùng thấy ba danh sách khác nhau.\n\nVà một luật kỹ thuật nhỏ mà hay bị bỏ: hàm tính presence phải NHẬN "bây giờ" làm THAM SỐ, đừng gọi Date.now() bên trong. Nhận vào thì test được mọi mốc thời gian; gọi bên trong thì hàm không kiểm chứng được, và loại lỗi lệch giờ sẽ không cổng nào bắt được.',
    workedExample: {
      code: `interface DauVet {
  nguoi: string
  ketNoi: string   // một người có thể có nhiều kết nối: điện thoại, tab 1, tab 2
  lanCuoi: number  // mốc thời gian (giây) nhận nhịp gần nhất
}

const HAN_GIAY = 30 // = 3 lần chu kỳ nhịp 10 giây

// "bây giờ" là THAM SỐ, không phải Date.now() bên trong — nhờ vậy hàm này test được
function dangOnline(dauVet: DauVet[], bayGio: number): string[] {
  const con = new Set<string>()
  for (const d of dauVet) {
    if (bayGio - d.lanCuoi <= HAN_GIAY) con.add(d.nguoi)
  }
  return [...con].sort()
}

const dauVet: DauVet[] = [
  { nguoi: "an", ketNoi: "dtdd", lanCuoi: 100 },
  { nguoi: "an", ketNoi: "laptop", lanCuoi: 60 },   // tab laptop đã chết
  { nguoi: "binh", ketNoi: "tab1", lanCuoi: 55 },   // im 45 giây — quá hạn
  { nguoi: "cuong", ketNoi: "tab1", lanCuoi: 95 },
]

console.log("Luc 100:", dangOnline(dauVet, 100).join(","))
// Đọc kết quả: "an,cuong". An vẫn online nhờ điện thoại dù tab laptop đã chết —
// đây là lý do phải gộp theo NGƯỜI chứ không đếm theo kết nối.`,
      stdinLines: [],
    },
    predict: {
      code: `interface Su {
  loai: string   // "vao" | "ra"
  nguoi: string
}

// Cách SAI: đếm vào/ra, coi "chưa thấy ra" là còn online
function demOnline(suKien: Su[]): number {
  const dang = new Set<string>()
  for (const s of suKien) {
    if (s.loai === "vao") dang.add(s.nguoi)
    if (s.loai === "ra") dang.delete(s.nguoi)
  }
  return dang.size
}

// An mở 2 tab rồi đóng 1; Binh mất sóng 4G nên không có sự kiện "ra"
const suKien: Su[] = [
  { loai: "vao", nguoi: "an" },
  { loai: "vao", nguoi: "an" },
  { loai: "vao", nguoi: "binh" },
  { loai: "ra", nguoi: "an" },
]

console.log("So nguoi online:", demOnline(suKien))`,
      question: 'Chương trình in ra gì?',
      choices: [
        'So nguoi online: 1',
        'So nguoi online: 2',
        'So nguoi online: 3',
        'So nguoi online: 0',
      ],
      answerIndex: 0,
      explain:
        'In ra 1 — và cả hai con số của nó đều sai theo hai hướng ngược nhau. An vẫn còn một tab mở nhưng bị xoá khỏi danh sách, vì `Set` không đếm được người có nhiều kết nối. Còn Bình đã mất sóng từ lâu lại vẫn nằm trong danh sách, vì mất sóng thì không có sự kiện "ra" nào được gửi. Danh sách presence dựng bằng vào/ra sẽ vừa thiếu người thật vừa thừa người ma.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm tính presence: gom theo người, chỉ nhận dấu vết còn trong hạn, rồi trả danh sách đã sắp.',
      lines: [
        'function dangOnline(dauVet: DauVet[], bayGio: number): string[] {',
        '  const con = new Set<string>()',
        '  for (const d of dauVet) {',
        '    if (bayGio - d.lanCuoi <= HAN_GIAY) con.add(d.nguoi)',
        '  }',
        '  return [...con].sort()',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `dangOnline(dauVet: DauVet[], bayGio: number): string[]` trả về danh sách tên người đang online, ĐÃ SẮP XẾP tăng dần (dùng `.sort()`), mỗi người xuất hiện đúng một lần.\n\nLuật:\n· Một dấu vết còn hiệu lực khi `bayGio - lanCuoi <= HAN_GIAY` (HAN_GIAY = 30).\n· Một người online nếu có ÍT NHẤT MỘT kết nối còn hiệu lực — kết nối chết của người đó không loại người đó ra.\n· Không được gọi `Date.now()`: "bây giờ" luôn là tham số truyền vào.\n\nKhông có ai online thì trả về mảng rỗng (phần khung sẽ in "(khong ai)").',
      starterCode: `interface DauVet {
  nguoi: string
  ketNoi: string
  lanCuoi: number
}

const HAN_GIAY = 30

function dangOnline(dauVet: DauVet[], bayGio: number): string[] {
  // TODO: gộp theo người, chỉ lấy dấu vết còn trong hạn
  return []
}

// ---- Đừng sửa phần dưới đây ----
const dauVet: DauVet[] = [
  { nguoi: "an", ketNoi: "dtdd", lanCuoi: 100 },
  { nguoi: "an", ketNoi: "laptop", lanCuoi: 60 },
  { nguoi: "binh", ketNoi: "tab1", lanCuoi: 55 },
  { nguoi: "cuong", ketNoi: "tab1", lanCuoi: 95 },
  { nguoi: "cuong", ketNoi: "tab2", lanCuoi: 98 },
]

function in_(nhan: string, ds: string[]): void {
  console.log(nhan, ds.length === 0 ? "(khong ai)" : ds.join(","))
}

in_("Luc 100:", dangOnline(dauVet, 100))
in_("Luc 85:", dangOnline(dauVet, 85))
in_("Luc 200:", dangOnline(dauVet, 200))
in_("Rong:", dangOnline([], 100))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Luc 100: an,cuong',
          match: 'contains',
          hidden: false,
          label: 'Lúc 100 — An online nhờ điện thoại (tab laptop đã chết), Bình quá hạn 45 giây',
        },
        {
          stdinLines: [],
          expected: 'Luc 85: an,binh,cuong',
          match: 'contains',
          hidden: false,
          label: 'Lúc 85 — Bình im ĐÚNG 30 giây, mốc biên `<=` phải còn nhận',
        },
        {
          stdinLines: [],
          expected: 'Luc 200: (khong ai)',
          match: 'contains',
          hidden: false,
          label: 'Lúc 200 — mọi dấu vết đều quá hạn, danh sách RỖNG chứ không phải danh sách cũ',
        },
        {
          stdinLines: [],
          expected: 'Rong: (khong ai)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — không có dấu vết nào thì không được ném lỗi',
        },
      ],
      hints: [
        'Dùng `new Set<string>()` để gộp theo người: một người có 3 kết nối còn sống vẫn chỉ xuất hiện một lần trong danh sách.',
        'Điều kiện còn hạn là `bayGio - d.lanCuoi <= HAN_GIAY`. Viết `<` thay vì `<=` sẽ làm ca "Luc 85" sai đúng một người — mốc biên luôn là chỗ lỗi trốn.',
        'Đừng lọc theo người trước rồi mới xét thời gian. Cứ duyệt mọi dấu vết, thấy cái nào còn hạn thì `con.add(d.nguoi)` — người có kết nối chết lẫn kết nối sống vẫn được nhận.',
        'Kết thúc bằng `return [...con].sort()`. Không sort thì thứ tự phụ thuộc thứ tự chèn, và test-case so chuỗi sẽ đỏ dù logic đúng.',
      ],
      sampleSolution: `interface DauVet {
  nguoi: string
  ketNoi: string
  lanCuoi: number
}

const HAN_GIAY = 30

function dangOnline(dauVet: DauVet[], bayGio: number): string[] {
  const con = new Set<string>()
  for (const d of dauVet) {
    if (bayGio - d.lanCuoi <= HAN_GIAY) con.add(d.nguoi)
  }
  return [...con].sort()
}

// ---- Đừng sửa phần dưới đây ----
const dauVet: DauVet[] = [
  { nguoi: "an", ketNoi: "dtdd", lanCuoi: 100 },
  { nguoi: "an", ketNoi: "laptop", lanCuoi: 60 },
  { nguoi: "binh", ketNoi: "tab1", lanCuoi: 55 },
  { nguoi: "cuong", ketNoi: "tab1", lanCuoi: 95 },
  { nguoi: "cuong", ketNoi: "tab2", lanCuoi: 98 },
]

function in_(nhan: string, ds: string[]): void {
  console.log(nhan, ds.length === 0 ? "(khong ai)" : ds.join(","))
}

in_("Luc 100:", dangOnline(dauVet, 100))
in_("Luc 85:", dangOnline(dauVet, 85))
in_("Luc 200:", dangOnline(dauVet, 200))
in_("Rong:", dangOnline([], 100))`,
    },
    homework:
      'Chọn một app chat bạn đang dùng (Messenger, Zalo, Discord). Bật máy bay trên điện thoại rồi nhờ người khác xem bạn còn hiện "đang hoạt động" trong bao lâu. Con số đo được chính là HẠN (TTL) mà đội đó chọn. Rồi tự hỏi: nếu họ giảm hạn xuống 5 giây thì được gì và mất gì — danh sách chính xác hơn, nhưng tốn thêm bao nhiêu nhịp mỗi phút cho mỗi người dùng, và ai trả tiền cho số nhịp đó?',
    srsCards: [
      {
        hoi: 'Vì sao không nên dựng danh sách online bằng cặp sự kiện vào/ra?',
        dap: 'Vì sự kiện "ra" không đáng tin — mất sóng, sập nguồn, tab bị hệ điều hành giết đều không gửi được gì, nên danh sách chỉ có tăng. Ngoài ra một người có nhiều kết nối, đóng một tab không có nghĩa họ offline.',
      },
      {
        hoi: 'Presence nên lưu cái gì thay cho cờ online/offline?',
        dap: 'Lưu dấu vết sống: mỗi kết nối gửi nhịp định kỳ, server ghi mốc thời gian thấy lần cuối. Online là giá trị TÍNH RA từ dấu vết đó, không phải một cờ được lưu — đúng luật không lưu giá trị dẫn xuất.',
      },
      {
        hoi: 'Hạn (TTL) của dấu vết nên đặt bằng bao nhiêu so với chu kỳ nhịp?',
        dap: 'Khoảng 3 lần chu kỳ nhịp. Đặt hạn bằng đúng chu kỳ thì chỉ một nhịp về trễ là người đang dùng bỗng bị báo offline, còn đặt quá dài thì người đã thoát vẫn nằm trong danh sách rất lâu.',
      },
    ],
  },
]
