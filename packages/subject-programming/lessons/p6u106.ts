// lessons/p6u106.ts — P6-U106: HƯỚNG BACKEND, chặng S3 "Hệ phân tán" — Giao tiếp giữa
// dịch vụ (module `backend-s3-m2`).
//
// Hai bài dạy hai kỹ thuật đứng sau kiến trúc hướng sự kiện (event-driven): OUTBOX PATTERN
// (đảm bảo ghi dữ liệu và phát sự kiện không bao giờ lệch nhau) và SAGA (giao dịch trải
// nhiều dịch vụ, không có transaction chung nên phải BÙ TRỪ khi giữa chừng thất bại). Bài
// saga nối lại khái niệm IDEMPOTENT đã học ở `p6-u104-l1`/`p6-u105-l2`: hành động bù trừ cũng
// phải an toàn khi lặp lại.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không mạng/CSDL thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U106_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u106-l1',
    unitId: 'p6-u106',
    language: 'typescript',
    title: 'Outbox pattern — ghi dữ liệu và gửi sự kiện phải là MỘT thao tác, không phải hai',
    hook: 'Dịch vụ Đơn Hàng ghi đơn hàng vào CSDL THÀNH CÔNG, rồi gọi tiếp lệnh gửi sự kiện "đơn hàng mới" sang dịch vụ Kho — nhưng tiến trình CRASH đúng giữa hai bước đó. Đơn hàng đã nằm trong CSDL, nhưng sự kiện KHÔNG BAO GIỜ được gửi. Dịch vụ Kho không hề hay biết đơn hàng này tồn tại — hàng không bao giờ được chuẩn bị.',
    theory:
      'Đây gọi là vấn đề DUAL WRITE (ghi kép): một thao tác nghiệp vụ cần làm HAI việc riêng biệt — ghi dữ liệu vào CSDL của mình, và báo cho dịch vụ khác biết (qua message/sự kiện). Hai việc này không nằm trong CÙNG một transaction (CSDL và hệ thống gửi tin là hai công nghệ khác nhau), nên luôn có một khe hở: nếu tiến trình crash, mạng lỗi, hoặc dịch vụ gửi tin đang "đơ" đúng giữa hai bước, một trong hai việc THÀNH CÔNG còn việc kia THẤT BẠI — dữ liệu và sự kiện đã phát ra LỆCH NHAU.\n\nCÁCH LÀM SAI (rất hay gặp ở người mới): ghi CSDL trước bằng một lệnh, rồi gọi lệnh gửi message SAU, tách rời. Nếu ghi CSDL xong mà gửi message thất bại (crash, mất mạng, hàng đợi đầy) — sự kiện MẤT VĨNH VIỄN dù dữ liệu đã ghi đúng. Không ai phát hiện ra, cho tới khi khách hàng thắc mắc "tôi đặt hàng rồi sao không thấy giao".\n\nOUTBOX PATTERN giải quyết bằng cách: thay vì gửi message TRỰC TIẾP, ghi một BẢN GHI "cần gửi sự kiện gì" vào một bảng riêng gọi là OUTBOX (hộp thư đi) — NẰM TRONG CÙNG một CSDL, CÙNG một transaction/thao tác nguyên tử với dữ liệu nghiệp vụ. Vì cả hai (dữ liệu + bản ghi outbox) ghi cùng lúc nguyên tử, chúng luôn ĐỒNG BỘ: hoặc cả hai cùng thành công, hoặc cả hai cùng không có gì xảy ra — không còn khe hở ở giữa.\n\nSau đó, một tiến trình RIÊNG gọi là WORKER quét bảng outbox theo chu kỳ, tìm các bản ghi CHƯA GỬI, gửi chúng đi (gọi API dịch vụ khác, hoặc đẩy vào message queue thật), rồi đánh dấu ĐÃ GỬI. Nếu worker crash giữa chừng, lần quét sau nó vẫn thấy bản ghi CHƯA đánh dấu và gửi lại — sự kiện không bao giờ bị mất, nhiều nhất chỉ bị GỬI TRỄ hoặc gửi TRÙNG (nên phía nhận cũng cần idempotent, như đã học ở bài hàng đợi).',
    workedExample: {
      code: `type DonHang = { id: string; sanPham: string; soLuong: number }
type MucOutbox = { id: string; noiDung: string; daGui: boolean }

const dsDonHang: DonHang[] = []
const outbox: MucOutbox[] = []

// Ghi don hang: ghi ca DU LIEU THAT lan BAN GHI OUTBOX trong CUNG mot lan goi ham
// (mo phong tinh nguyen tu — thuc te se la mot transaction CSDL that)
function taoDonHang(id: string, sanPham: string, soLuong: number): void {
  dsDonHang.push({ id, sanPham, soLuong })
  outbox.push({ id: "evt-" + id, noiDung: "don hang " + id + " (" + sanPham + " x" + soLuong + ")", daGui: false })
}

// Worker quet outbox, gui cac su kien CHUA gui, danh dau da gui
function workerGuiOutbox(): void {
  for (const muc of outbox) {
    if (muc.daGui) continue // da gui roi thi bo qua
    console.log("Gui su kien:", muc.noiDung)
    muc.daGui = true
  }
}

taoDonHang("dh-1", "Ao thun", 2)
taoDonHang("dh-2", "Quan jean", 1)

console.log("--- Truoc worker chay: don hang da co trong CSDL ---")
console.log("So don hang:", dsDonHang.length, "- so muc outbox chua gui:", outbox.filter(m => !m.daGui).length)

console.log("--- Worker chay ---")
workerGuiOutbox()
console.log("So muc outbox chua gui sau khi worker chay:", outbox.filter(m => !m.daGui).length)`,
      stdinLines: [],
    },
    predict: {
      code: `type MucOutbox = { id: string; daGui: boolean }
const outbox: MucOutbox[] = [
  { id: "e1", daGui: false },
  { id: "e2", daGui: true },
  { id: "e3", daGui: false },
]
function workerGuiOutbox() {
  for (const m of outbox) {
    if (m.daGui) continue
    m.daGui = true
  }
}
workerGuiOutbox()
console.log(outbox.filter(m => m.daGui).length)`,
      question:
        'Sau khi workerGuiOutbox chạy một lần trên outbox có sẵn 3 mục (2 chưa gửi, 1 đã gửi), có bao nhiêu mục daGui = true?',
      choices: ['3', '2', '1', '0'],
      answerIndex: 0,
      explain:
        'Kết quả là 3 — worker duyệt cả 3 mục, mục "e2" vốn đã daGui=true nên bị `continue` bỏ qua (giữ nguyên true), còn "e1" và "e3" đang false thì được gửi và đặt thành true. Kết quả cuối: cả 3 mục đều daGui=true. Bẫy: đừng nhầm "worker gửi 2 mục mới" với "tổng số mục đã gửi sau khi chạy" — câu hỏi hỏi TỔNG, không phải số mục vừa đổi trạng thái trong lần chạy này.',
    },
    parsons: {
      prompt: 'Xếp lại hàm worker quét bảng outbox và gửi các mục CHƯA gửi.',
      lines: [
        'function workerGuiOutbox(outbox: MucOutbox[]): void {',
        '  for (const muc of outbox) {',
        '    if (muc.daGui) continue',
        '    console.log("Gui su kien:", muc.noiDung)',
        '    muc.daGui = true',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hai hàm mô phỏng outbox pattern.\n\n1. taoDonHang(id, sanPham, soLuong, dsDonHang, outbox): thêm một đơn hàng { id, sanPham, soLuong } vào dsDonHang, ĐỒNG THỜI thêm một mục outbox { id: "evt-" + id, noiDung: "don hang " + id, daGui: false } vào outbox — trong CÙNG một lần gọi hàm.\n2. workerGuiOutbox(outbox): duyệt outbox, với mỗi mục CHƯA gửi (daGui === false) thì in ra "Gui: " + noiDung rồi đặt daGui = true. Mục đã gửi rồi thì bỏ qua, không in lại.\n\nKiểu MucOutbox và DonHang đã cho sẵn trong starter, dùng lại nguyên.',
      starterCode: `type DonHang = { id: string; sanPham: string; soLuong: number }
type MucOutbox = { id: string; noiDung: string; daGui: boolean }

function taoDonHang(
  id: string,
  sanPham: string,
  soLuong: number,
  dsDonHang: DonHang[],
  outbox: MucOutbox[],
): void {
  // TODO: them don hang vao dsDonHang VA them muc outbox chua gui, trong CUNG mot lan goi
}

function workerGuiOutbox(outbox: MucOutbox[]): void {
  // TODO: voi moi muc CHUA gui (daGui === false), in "Gui: " + noiDung roi dat daGui = true
}

// ---- Đừng sửa phần dưới đây ----
const dsDonHang: DonHang[] = []
const outbox: MucOutbox[] = []
taoDonHang("dh-1", "Ao thun", 2, dsDonHang, outbox)
taoDonHang("dh-2", "Quan jean", 1, dsDonHang, outbox)
console.log("So don hang:", dsDonHang.length)
console.log("So muc outbox:", outbox.length)
workerGuiOutbox(outbox)
workerGuiOutbox(outbox) // chay lan 2, khong duoc gui lai`,
      testCases: [
        {
          stdinLines: [],
          expected: 'So don hang: 2',
          match: 'contains',
          hidden: false,
          label: 'Tạo 2 đơn hàng → dsDonHang có đúng 2 phần tử',
        },
        {
          stdinLines: [],
          expected: 'So muc outbox: 2',
          match: 'contains',
          hidden: false,
          label: 'Mỗi đơn hàng tạo ra ĐÚNG một mục outbox tương ứng',
        },
        {
          stdinLines: [],
          expected: 'Gui: don hang dh-1',
          match: 'contains',
          hidden: false,
          label: 'Worker gửi mục chưa gửi, in đúng nội dung',
        },
        {
          stdinLines: [],
          expected: 'Gui: don hang dh-2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mục thứ hai cũng được gửi đúng nội dung',
        },
      ],
      hints: [
        'taoDonHang phải làm HAI việc trong CÙNG một lần gọi: push vào dsDonHang VÀ push vào outbox — không tách thành hai lệnh gọi riêng.',
        'Mục outbox mới tạo phải có daGui: false — chỉ workerGuiOutbox mới được đổi nó thành true.',
        'workerGuiOutbox chạy lần 2 sẽ không in gì thêm vì mọi mục đã daGui=true — kiểm tra if (muc.daGui) rồi bỏ qua (continue) trước khi in.',
      ],
      sampleSolution: `type DonHang = { id: string; sanPham: string; soLuong: number }
type MucOutbox = { id: string; noiDung: string; daGui: boolean }

function taoDonHang(
  id: string,
  sanPham: string,
  soLuong: number,
  dsDonHang: DonHang[],
  outbox: MucOutbox[],
): void {
  dsDonHang.push({ id, sanPham, soLuong })
  outbox.push({ id: "evt-" + id, noiDung: "don hang " + id, daGui: false })
}

function workerGuiOutbox(outbox: MucOutbox[]): void {
  for (const muc of outbox) {
    if (muc.daGui) continue
    console.log("Gui: " + muc.noiDung)
    muc.daGui = true
  }
}

// ---- Đừng sửa phần dưới đây ----
const dsDonHang: DonHang[] = []
const outbox: MucOutbox[] = []
taoDonHang("dh-1", "Ao thun", 2, dsDonHang, outbox)
taoDonHang("dh-2", "Quan jean", 1, dsDonHang, outbox)
console.log("So don hang:", dsDonHang.length)
console.log("So muc outbox:", outbox.length)
workerGuiOutbox(outbox)
workerGuiOutbox(outbox)`,
    },
    homework:
      'Tra cứu "transactional outbox pattern" (tiếng Anh). Tìm hiểu kỹ thuật "Change Data Capture" (CDC, ví dụ công cụ Debezium) — nó thay thế worker quét định kỳ bằng cách nào (đọc trực tiếp log ghi của CSDL thay vì SELECT lặp lại)? Viết 2-3 câu so sánh ưu/nhược của "worker quét định kỳ" so với "CDC đọc log" về độ trễ và tải lên CSDL.',
    srsCards: [
      {
        hoi: 'Vấn đề "dual write" trong kiến trúc hướng sự kiện là gì?',
        dap: 'Ghi dữ liệu vào CSDL và gửi sự kiện báo dịch vụ khác là HAI thao tác tách rời, không nằm trong cùng transaction — nếu tiến trình crash giữa hai bước, một việc thành công còn việc kia thất bại, làm dữ liệu và sự kiện đã phát ra bị LỆCH nhau.',
      },
      {
        hoi: 'Outbox pattern giải quyết dual write bằng cách nào?',
        dap: 'Ghi bản ghi "cần gửi sự kiện gì" vào một bảng OUTBOX nằm CÙNG CSDL, CÙNG transaction với dữ liệu nghiệp vụ — nên cả hai luôn đồng bộ. Một WORKER riêng quét outbox, gửi các mục chưa gửi rồi đánh dấu đã gửi.',
      },
      {
        hoi: 'Vì sao ghi CSDL trước rồi gửi message bằng lệnh riêng, tách rời, là cách làm SAI?',
        dap: 'Vì nếu tiến trình crash đúng lúc giữa hai lệnh, dữ liệu đã ghi CSDL thành công nhưng sự kiện gửi thất bại sẽ MẤT VĨNH VIỄN — không có cơ chế nào phát hiện hay gửi lại nó.',
      },
    ],
  },
  {
    id: 'p6-u106-l2',
    unitId: 'p6-u106',
    language: 'typescript',
    title: 'Saga — không có transaction chung, phải tự BÙ TRỪ khi bước giữa chừng thất bại',
    hook: 'Đặt vé máy bay gồm 3 bước ở 3 dịch vụ khác nhau: trừ tiền ví, giữ chỗ ngồi, gửi email xác nhận. Bước "trừ tiền" và "giữ chỗ" đều THÀNH CÔNG — nhưng bước "gửi email" thất bại vì dịch vụ email đang sập. Ba dịch vụ có ba CSDL RIÊNG, không có transaction chung để tự động "rollback" — vậy ai sẽ trả lại tiền và huỷ giữ chỗ đã lỡ làm?',
    theory:
      'Trong MỘT dịch vụ, một transaction CSDL đảm bảo: hoặc TẤT CẢ các thay đổi cùng thành công, hoặc TẤT CẢ cùng bị huỷ (rollback) — không có trạng thái lỡ dở. Nhưng khi một giao dịch nghiệp vụ trải dài NHIỀU dịch vụ (mỗi dịch vụ một CSDL riêng, như bài đặt vé ở trên), không có transaction nào bao trùm được cả ba — CSDL của dịch vụ Ví không hề biết gì về CSDL của dịch vụ Ghế.\n\nSAGA giải quyết bằng cách coi giao dịch dài là một CHUỖI CÁC BƯỚC tuần tự, và mỗi bước có một HÀNH ĐỘNG BÙ TRỪ (compensating action) đi kèm — một thao tác "làm ngược lại" ý nghĩa của bước đó. Ví dụ: bước "trừ tiền ví" có bù trừ là "hoàn tiền vào ví"; bước "giữ chỗ ngồi" có bù trừ là "huỷ giữ chỗ". Lưu ý: bù trừ KHÔNG PHẢI rollback CSDL thật — nó là một THAO TÁC NGHIỆP VỤ MỚI, chạy sau, làm đảo ngược tác dụng của bước trước.\n\nSaga chạy các bước TUẦN TỰ. Nếu MỌI bước đều thành công, xong — không cần bù trừ gì. Nhưng nếu một bước Ở GIỮA thất bại (như "gửi email" thất bại), saga phải chạy hành động bù trừ của TẤT CẢ các bước ĐÃ THÀNH CÔNG trước đó, theo THỨ TỰ NGƯỢC LẠI (bước gần nhất, tức bước cuối cùng đã thành công, được bù trừ TRƯỚC — giống như tháo dỡ một chồng đĩa từ trên xuống). Với ví dụ đặt vé: "gửi email" thất bại → bù trừ "giữ chỗ" (huỷ giữ chỗ) trước, rồi mới bù trừ "trừ tiền" (hoàn tiền) — đúng thứ tự ngược của "trừ tiền → giữ chỗ".\n\nMột điểm quan trọng nối lại bài IDEMPOTENT đã học (`p6-u105-l2`): hành động bù trừ cũng phải AN TOÀN KHI GỌI LẶP LẠI, vì mạng có thể timeout ngay cả khi đang chạy bù trừ, buộc hệ thống thử gọi lại — nếu "hoàn tiền" không idempotent, gọi lại hai lần sẽ hoàn tiền HAI LẦN, tạo ra lỗi mới ngay trong lúc đang sửa lỗi cũ.',
    workedExample: {
      code: `type Buoc = {
  ten: string
  thucHien: () => boolean // true = thanh cong, false = that bai
  buTru: () => void
}

function chaySaga(cacBuoc: Buoc[]): void {
  const daThanhCong: Buoc[] = []

  for (const buoc of cacBuoc) {
    const ok = buoc.thucHien()
    if (ok) {
      console.log("OK:", buoc.ten)
      daThanhCong.push(buoc)
    } else {
      console.log("THAT BAI:", buoc.ten, "- bat dau bu tru")
      // Bu tru cac buoc DA THANH CONG, theo thu tu NGUOC LAI
      for (let i = daThanhCong.length - 1; i >= 0; i--) {
        console.log("Bu tru:", daThanhCong[i].ten)
        daThanhCong[i].buTru()
      }
      return // dung saga, khong chay tiep cac buoc sau
    }
  }
  console.log("Saga hoan tat, khong can bu tru")
}

const cacBuocDatVe: Buoc[] = [
  { ten: "Tru tien vi", thucHien: () => true, buTru: () => console.log("  -> Hoan tien vao vi") },
  { ten: "Giu cho ngoi", thucHien: () => true, buTru: () => console.log("  -> Huy giu cho") },
  { ten: "Gui email xac nhan", thucHien: () => false, buTru: () => console.log("  -> (khong ap dung)") },
]

chaySaga(cacBuocDatVe)`,
      stdinLines: [],
    },
    predict: {
      code: `type Buoc = { ten: string; thucHien: () => boolean; buTru: () => void }
function chaySaga(cacBuoc: Buoc[]) {
  const daThanhCong: Buoc[] = []
  for (const buoc of cacBuoc) {
    if (buoc.thucHien()) {
      daThanhCong.push(buoc)
    } else {
      for (let i = daThanhCong.length - 1; i >= 0; i--) {
        console.log("bu tru", daThanhCong[i].ten)
      }
      return
    }
  }
}
chaySaga([
  { ten: "A", thucHien: () => true, buTru: () => {} },
  { ten: "B", thucHien: () => true, buTru: () => {} },
  { ten: "C", thucHien: () => false, buTru: () => {} },
])`,
      question: 'Ba bước A, B thành công rồi C thất bại. In ra "bu tru <ten>" theo thứ tự nào?',
      choices: [
        'bu tru B\nbu tru A',
        'bu tru A\nbu tru B',
        'bu tru B\nbu tru C',
        'bu tru A\nbu tru C',
      ],
      answerIndex: 0,
      explain:
        'Đúng thứ tự là "bu tru B" rồi "bu tru A" — daThanhCong chứa [A, B] (C thất bại không được thêm vào), vòng lặp bù trừ chạy từ chỉ số CUỐI về ĐẦU (i-- từ length-1 xuống 0), nên B (thêm sau, chỉ số 1) được bù trừ TRƯỚC, A (chỉ số 0) bù trừ SAU. Bẫy: C không hề được bù trừ vì nó CHƯA từng thành công (không nằm trong daThanhCong) — bù trừ chỉ áp dụng cho bước đã LỠ LÀM XONG, không áp dụng cho bước vừa thất bại.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm chạy saga: chạy tuần tự, gặp thất bại thì bù trừ các bước đã thành công theo thứ tự ngược.',
      lines: [
        'function chaySaga(cacBuoc: Buoc[]): void {',
        '  const daThanhCong: Buoc[] = []',
        '  for (const buoc of cacBuoc) {',
        '    if (buoc.thucHien()) {',
        '      daThanhCong.push(buoc)',
        '    } else {',
        '      for (let i = daThanhCong.length - 1; i >= 0; i--) daThanhCong[i].buTru()',
        '      return',
        '    }',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm chaySaga(cacBuoc: Buoc[]): { chayDuoc: string[]; buTruTheoThuTu: string[] }.\n\nKiểu Buoc = { ten: string; thucHien: () => boolean; buTru: () => void } đã cho sẵn.\n\n- Chạy TUẦN TỰ từng bước trong cacBuoc, gọi thucHien(). Bước thành công (trả true) thì thêm tên vào chayDuoc.\n- Gặp bước THẤT BẠI (thucHien trả false): DỪNG luôn (không chạy các bước sau), rồi bù trừ TẤT CẢ bước đã thành công trước đó theo THỨ TỰ NGƯỢC (bước gần nhất bù trừ trước) — với mỗi bước bù trừ, gọi buTru() của nó VÀ thêm tên vào buTruTheoThuTu.\n- Nếu MỌI bước đều thành công, buTruTheoThuTu là mảng rỗng.\n- Trả về { chayDuoc, buTruTheoThuTu }.',
      starterCode: `type Buoc = { ten: string; thucHien: () => boolean; buTru: () => void }

function chaySaga(cacBuoc: Buoc[]): { chayDuoc: string[]; buTruTheoThuTu: string[] } {
  const chayDuoc: string[] = []
  const buTruTheoThuTu: string[] = []
  // TODO: chay tuan tu, gap that bai thi bu tru cac buoc DA THANH CONG theo thu tu NGUOC
  return { chayDuoc, buTruTheoThuTu }
}

// ---- Đừng sửa phần dưới đây ----
const ketQua1 = chaySaga([
  { ten: "Tru tien", thucHien: () => true, buTru: () => {} },
  { ten: "Giu cho", thucHien: () => true, buTru: () => {} },
  { ten: "Gui email", thucHien: () => false, buTru: () => {} },
])
console.log("Chay duoc:", ketQua1.chayDuoc.join(","))
console.log("Bu tru:", ketQua1.buTruTheoThuTu.join(","))

const ketQua2 = chaySaga([
  { ten: "Buoc 1", thucHien: () => true, buTru: () => {} },
  { ten: "Buoc 2", thucHien: () => true, buTru: () => {} },
])
console.log("Ca thanh cong, bu tru:", ketQua2.buTruTheoThuTu.length)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Chay duoc: Tru tien,Giu cho',
          match: 'contains',
          hidden: false,
          label: 'Hai bước đầu thành công, bước 3 thất bại → chayDuoc có đúng 2 tên đó',
        },
        {
          stdinLines: [],
          expected: 'Bu tru: Giu cho,Tru tien',
          match: 'contains',
          hidden: false,
          label: 'Bù trừ theo thứ tự NGƯỢC — "Giu cho" (thành công sau) bù trừ trước "Tru tien"',
        },
        {
          stdinLines: [],
          expected: 'Ca thanh cong, bu tru: 0',
          match: 'contains',
          hidden: false,
          label: 'Mọi bước đều thành công → không cần bù trừ gì, mảng rỗng',
        },
        {
          stdinLines: [],
          expected: 'Chay duoc: Tru tien,Giu cho\nBu tru: Giu cho,Tru tien',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đối chiếu cả hai dòng cùng lúc theo đúng thứ tự in',
        },
      ],
      hints: [
        'Dùng vòng for...of duyệt cacBuoc, gọi buoc.thucHien() — true thì push(buoc.ten) vào chayDuoc, false thì dừng và bắt đầu bù trừ.',
        'Muốn bù trừ đúng thứ tự ngược, phải duyệt chayDuoc (hoặc mảng các bước đã thành công) TỪ CHỈ SỐ CUỐI về 0 (for i = length-1; i >= 0; i--), không dùng for...of xuôi.',
        'Bước gây thất bại (thucHien trả false) KHÔNG được đưa vào danh sách bù trừ — nó chưa từng "thành công" nên không có gì để bù.',
      ],
      sampleSolution: `type Buoc = { ten: string; thucHien: () => boolean; buTru: () => void }

function chaySaga(cacBuoc: Buoc[]): { chayDuoc: string[]; buTruTheoThuTu: string[] } {
  const chayDuoc: string[] = []
  const buTruTheoThuTu: string[] = []
  const daThanhCong: Buoc[] = []

  for (const buoc of cacBuoc) {
    if (buoc.thucHien()) {
      chayDuoc.push(buoc.ten)
      daThanhCong.push(buoc)
    } else {
      for (let i = daThanhCong.length - 1; i >= 0; i--) {
        daThanhCong[i].buTru()
        buTruTheoThuTu.push(daThanhCong[i].ten)
      }
      return { chayDuoc, buTruTheoThuTu }
    }
  }
  return { chayDuoc, buTruTheoThuTu }
}

// ---- Đừng sửa phần dưới đây ----
const ketQua1 = chaySaga([
  { ten: "Tru tien", thucHien: () => true, buTru: () => {} },
  { ten: "Giu cho", thucHien: () => true, buTru: () => {} },
  { ten: "Gui email", thucHien: () => false, buTru: () => {} },
])
console.log("Chay duoc:", ketQua1.chayDuoc.join(","))
console.log("Bu tru:", ketQua1.buTruTheoThuTu.join(","))

const ketQua2 = chaySaga([
  { ten: "Buoc 1", thucHien: () => true, buTru: () => {} },
  { ten: "Buoc 2", thucHien: () => true, buTru: () => {} },
])
console.log("Ca thanh cong, bu tru:", ketQua2.buTruTheoThuTu.length)`,
    },
    homework:
      'Tra cứu hai kiểu saga trong tài liệu ngành: "choreography-based saga" (mỗi dịch vụ tự lắng nghe sự kiện và tự quyết định bước tiếp theo, không ai chỉ huy) và "orchestration-based saga" (có MỘT bộ điều phối trung tâm gọi tuần tự từng dịch vụ, như hàm chaySaga trong bài). Viết 2-3 câu: với hệ có TRÊN 5 bước, kiểu nào dễ THEO DÕI LỖI hơn khi có sự cố, vì sao?',
    srsCards: [
      {
        hoi: 'Vì sao không thể dùng transaction CSDL thông thường cho giao dịch trải nhiều dịch vụ?',
        dap: 'Mỗi dịch vụ có CSDL RIÊNG, không có transaction nào bao trùm được nhiều CSDL cùng lúc — CSDL của dịch vụ này không biết gì về CSDL của dịch vụ khác nên không thể tự động rollback chung.',
      },
      {
        hoi: 'Saga xử lý một bước ở giữa bị thất bại như thế nào?',
        dap: 'Chạy hành động BÙ TRỪ (compensating action) của TẤT CẢ các bước ĐÃ THÀNH CÔNG trước đó, theo THỨ TỰ NGƯỢC LẠI (bước gần nhất bù trừ trước) — bước vừa gây thất bại thì không có gì để bù vì nó chưa từng thành công.',
      },
      {
        hoi: 'Vì sao hành động bù trừ trong saga cũng cần idempotent?',
        dap: 'Vì gọi bù trừ qua mạng cũng có thể timeout (kết cục KHÔNG BIẾT như đã học), buộc hệ thống thử gọi lại — nếu bù trừ không an toàn khi lặp lại (ví dụ hoàn tiền hai lần), việc sửa lỗi lại tạo ra một lỗi mới.',
      },
    ],
  },
]
