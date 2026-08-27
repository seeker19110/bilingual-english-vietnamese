// lessons/p6u62.ts — P6-U62: HƯỚNG BACKEND, chặng S1 — đúng đắn dữ liệu (module
// `backend-s1-m2`).
//
// Mã unit thuộc dải `p6-u61…p6-u93` dành cho S1 của 11 hướng còn lại — xem
// `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md` và ghi chú đầu `p6u61.ts`.
//
// Chữ "đúng đắn" trong tên chặng là có chủ ý: ở S1 chưa bàn quy mô hay tốc độ, chỉ bàn chuyện
// dịch vụ có làm SAI DỮ LIỆU không khi bị gọi bậy, gọi lại, hay gọi song song. Hai bài này là
// hai nguồn sai dữ liệu hay gặp nhất và tốn tiền thật nhất: l1 KIỂM Ở BIÊN (tin client là mất
// dữ liệu), l2 LŨY ĐẲNG + TIỀN SỐ NGUYÊN (bấm hai lần trừ tiền hai lần).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U62_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u62-l1',
    unitId: 'p6-u62',
    language: 'typescript',
    title: 'Kiểm ở biên — vì sao kiểu tĩnh KHÔNG cứu bạn',
    hook: 'Bạn khai `interface Don { soLuong: number }` và yên tâm. Rồi một client gửi `{"soLuong": "3"}`, TypeScript không nói gì (nó đã biến mất lúc biên dịch), và `soLuong * gia` cho ra chuỗi "33333". Đơn hàng ghi vào cơ sở dữ liệu với tổng tiền là một chuỗi. Không có ngoại lệ nào được ném ra — dữ liệu chỉ đơn giản là hỏng, và bạn phát hiện ba tuần sau khi đối soát sổ sách.',
    theory:
      'Luật nền của mọi dịch vụ: **kiểu tĩnh sống tới lúc BIÊN DỊCH, dữ liệu đến lúc CHẠY.** Hai thời điểm đó không gặp nhau.\n\n`as Don` và `interface Don` chỉ nói với trình biên dịch "hãy tin tôi". Lúc chạy không còn ai kiểm gì cả. Nên mọi thứ đi vào từ NGOÀI — thân yêu cầu HTTP, tham số URL, biến môi trường, phản hồi của dịch vụ khác, hàng đợi, thậm chí cả cơ sở dữ liệu của chính bạn sau một lần migration lỗi — đều phải kiểm LÚC CHẠY.\n\n**BIÊN là gì.** Là đường ranh giữa vùng bạn kiểm soát và vùng bạn không. Kiểm ở biên nghĩa là dữ liệu bậy bị chặn NGAY tại cửa vào, trước khi nó chạm tới một dòng logic nghiệp vụ nào. Lợi ích lớn nhất không phải là bắt được lỗi — mà là sau cửa đó, mọi hàm còn lại được quyền tin dữ liệu và không phải tự phòng thủ nữa.\n\n**Bốn thứ một bộ kiểm ở biên phải làm, xếp theo mức hay bị quên:**\n\n① ĐÚNG KIỂU — `"3"` không phải `3`. Không tự ép kiểu ngầm giúp client, vì ép ngầm là giấu lỗi của họ.\n② ĐỦ TRƯỜNG BẮT BUỘC — thiếu `soLuong` phải bị từ chối, không được lặng lẽ coi là 0.\n③ TRONG MIỀN HỢP LỆ — `soLuong: -5` đúng kiểu số nhưng vô nghĩa; `email` phải có dạng email; `trangThai` phải nằm trong tập giá trị cho phép.\n④ **BỎ TRƯỜNG LẠ** — đây là thứ hay bị quên nhất và nguy hiểm nhất. Client gửi thêm `{"vaiTro": "admin"}` mà bạn lưu nguyên cả object vào cơ sở dữ liệu là vừa tự trao quyền quản trị cho người lạ. Lỗi này có tên riêng: mass assignment.\n\n**Báo lỗi thế nào cho dùng được.** Trả về DANH SÁCH mọi trường sai, không phải trường đầu tiên gặp — nếu không, client phải gửi lại năm lần mới điền xong một biểu mẫu năm lỗi. Mỗi lỗi nói rõ trường nào và sai ở đâu.\n\nTrong dự án này, việc đó làm bằng **Zod** (xem `packages/core-contracts`), và luật là: mọi handler API kiểm thân yêu cầu bằng schema trước khi động tới nghiệp vụ. Bài này bạn tự viết một bộ kiểm tí hon để hiểu bên trong nó làm gì — rồi sau đó dùng thư viện, đừng tự viết trong dự án thật.',
    workedExample: {
      code: `// Bộ kiểm ở biên tí hon: nhận dữ liệu THÔ (kiểu unknown, vì ta chưa biết gì về nó),
// trả về hoặc dữ liệu đã sạch, hoặc DANH SÁCH lỗi.
type KetQua =
  | { ok: true; du_lieu: { ten: string; soLuong: number } }
  | { ok: false; loi: string[] }

function kiem(tho: unknown): KetQua {
  const loi: string[] = []
  // Bước 0 hay bị quên: bản thân dữ liệu có phải object không?
  if (typeof tho !== "object" || tho === null) {
    return { ok: false, loi: ["than yeu cau phai la object"] }
  }
  const o = tho as Record<string, unknown>

  // ① đúng kiểu · ② đủ trường · ③ trong miền hợp lệ
  const ten = o["ten"]
  if (typeof ten !== "string") loi.push("ten: phai la chuoi")
  else if (ten.trim() === "") loi.push("ten: khong duoc rong")

  const sl = o["soLuong"]
  if (typeof sl !== "number") loi.push("soLuong: phai la so")
  else if (!Number.isInteger(sl) || sl < 1) loi.push("soLuong: phai la so nguyen >= 1")

  // Gom HẾT lỗi rồi mới trả — không dừng ở lỗi đầu tiên.
  if (loi.length > 0) return { ok: false, loi }

  // ④ CHỈ lấy đúng trường mình biết. Trường lạ bị bỏ, không đi tiếp được.
  return { ok: true, du_lieu: { ten: ten as string, soLuong: sl as number } }
}

console.log("Sach: " + JSON.stringify(kiem({ ten: "But", soLuong: 2 })))
console.log("Lam: " + JSON.stringify(kiem({ ten: "", soLuong: "3" })))
console.log("La: " + JSON.stringify(kiem({ ten: "But", soLuong: 1, vaiTro: "admin" })))
// Dòng cuối là điểm quan trọng nhất: "vaiTro" biến mất khỏi kết quả.`,
      stdinLines: [],
    },
    predict: {
      code: `// Cách "kiểm" mà thực ra không kiểm gì cả — chỉ nói với trình biên dịch "hãy tin tôi".
interface Don {
  soLuong: number
}

const tho: unknown = JSON.parse('{"soLuong": "3"}')
const don = tho as Don

// Cộng thêm 2 sản phẩm khuyến mãi vào đơn.
console.log("So luong cuoi: " + (don.soLuong + 2))`,
      question: 'Đoạn này in ra gì?',
      choices: [
        'So luong cuoi: 32',
        'So luong cuoi: 5',
        'So luong cuoi: NaN',
        'So luong cuoi: loi kieu',
      ],
      answerIndex: 0,
      explain:
        'JSON trả `soLuong` là CHUỖI "3". `as Don` không kiểm gì lúc chạy — nó chỉ tắt cảnh báo của trình biên dịch, và kiểu tĩnh thì biến mất sau khi biên dịch. Nên `"3" + 2` là phép NỐI CHUỖI, cho "32". Đơn hàng vừa nhảy từ 3 lên 32 sản phẩm mà không một ngoại lệ nào được ném ra. Đây là dạng hỏng tệ nhất: không có lỗi để lần, dữ liệu chỉ đơn giản là sai, và bạn phát hiện lúc đối soát sổ sách. Cách duy nhất chặn được là kiểm LÚC CHẠY ngay tại biên.',
    },
    parsons: {
      prompt: 'Xếp lại bộ kiểm ở biên — chú ý bước nào phải làm trước, và vì sao lỗi được gom lại.',
      lines: [
        'function kiem(tho: unknown): KetQua {',
        '  const loi: string[] = []',
        '  if (typeof tho !== "object" || tho === null) {',
        '    return { ok: false, loi: ["than yeu cau phai la object"] }',
        '  }',
        '  const o = tho as Record<string, unknown>',
        '  const sl = o["soLuong"]',
        '  if (typeof sl !== "number") loi.push("soLuong: phai la so")',
        '  if (loi.length > 0) return { ok: false, loi }',
        '  return { ok: true, du_lieu: { soLuong: sl as number } }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiem(tho) kiểm một thân yêu cầu tạo người dùng ở BIÊN.\n\nDữ liệu sạch có đúng ba trường: `email` (chuỗi, phải chứa dấu @), `tuoi` (số nguyên từ 13 đến 120), `goi` (một trong "free" | "pro").\n\nTrả về `{ ok: true, du_lieu }` khi hợp lệ, hoặc `{ ok: false, loi }` với `loi` là MẢNG mọi thông báo lỗi, theo đúng thứ tự email → tuoi → goi.\n\nBốn luật phải làm đúng:\n  ① Dữ liệu không phải object → trả đúng một lỗi "than yeu cau phai la object".\n  ② Gom HẾT lỗi rồi mới trả, không dừng ở lỗi đầu tiên.\n  ③ Thông báo lỗi theo khuôn "<ten truong>: <ly do>" — dùng đúng chữ trong ca chấm.\n  ④ Kết quả sạch CHỈ chứa ba trường trên. Trường lạ client gửi kèm phải biến mất — đây là chỗ chặn lỗi mass assignment.\n\nBốn dòng in ở cuối đã viết sẵn, đừng sửa — chúng chính là bốn ca chấm.',
      starterCode: `type NguoiDung = { email: string; tuoi: number; goi: "free" | "pro" }
type KetQua = { ok: true; du_lieu: NguoiDung } | { ok: false; loi: string[] }

function kiem(tho: unknown): KetQua {
  // TODO: kiểm theo 4 luật trong đề
  return { ok: false, loi: [] }
}

// ---- Đừng sửa phần dưới đây ----
const g = (x: unknown) => JSON.stringify(kiem(x))
console.log("Sach: " + g({ email: "a@b.c", tuoi: 20, goi: "pro" }))
console.log("Khong object: " + g("chuoi tran"))
console.log("Nhieu loi: " + g({ email: "abc", tuoi: 5, goi: "vip" }))
console.log("Truong la: " + g({ email: "a@b.c", tuoi: 20, goi: "free", vaiTro: "admin" }))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Sach: {"ok":true,"du_lieu":{"email":"a@b.c","tuoi":20,"goi":"pro"}}',
          match: 'contains',
          hidden: false,
          label: 'Dữ liệu hợp lệ đi qua, đúng ba trường',
        },
        {
          stdinLines: [],
          expected: 'Khong object: {"ok":false,"loi":["than yeu cau phai la object"]}',
          match: 'contains',
          hidden: false,
          label: 'Không phải object thì chặn ngay, đúng một lỗi',
        },
        {
          stdinLines: [],
          expected:
            'Nhieu loi: {"ok":false,"loi":["email: phai chua @","tuoi: phai la so nguyen tu 13 den 120","goi: phai la free hoac pro"]}',
          match: 'contains',
          hidden: false,
          label: 'Gom HẾT lỗi rồi mới trả — client sửa một lần là xong',
        },
        {
          stdinLines: [],
          expected: 'Truong la: {"ok":true,"du_lieu":{"email":"a@b.c","tuoi":20,"goi":"free"}}',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — trường lạ "vaiTro" phải biến mất (chặn mass assignment)',
        },
      ],
      hints: [
        'Bắt đầu bằng bước 0: `typeof tho !== "object" || tho === null` thì trả ngay mảng đúng một lỗi. Đừng quên `tho === null`, vì typeof null cũng là "object".',
        'Ép về `Record<string, unknown>` rồi đọc từng trường bằng `o["email"]`. Với mỗi trường: kiểm kiểu trước, rồi mới kiểm miền giá trị.',
        'Đẩy lỗi vào một mảng `loi` thay vì return sớm. Chỉ sau khi kiểm hết ba trường mới hỏi `if (loi.length > 0)`.',
        'Chỗ chặn mass assignment nằm ở dòng return cuối: dựng một object MỚI với đúng ba trường, đừng trả lại `o` hay dùng spread `...o`. Khung tham chiếu:\n\nreturn { ok: true, du_lieu: { email: em as string, tuoi: t as number, goi: g as "free" | "pro" } }',
      ],
      sampleSolution: `type NguoiDung = { email: string; tuoi: number; goi: "free" | "pro" }
type KetQua = { ok: true; du_lieu: NguoiDung } | { ok: false; loi: string[] }

function kiem(tho: unknown): KetQua {
  // Bước 0: typeof null cũng là "object", nên phải loại null tường minh.
  if (typeof tho !== "object" || tho === null) {
    return { ok: false, loi: ["than yeu cau phai la object"] }
  }
  const o = tho as Record<string, unknown>
  const loi: string[] = []

  const em = o["email"]
  if (typeof em !== "string" || !em.includes("@")) loi.push("email: phai chua @")

  const t = o["tuoi"]
  if (typeof t !== "number" || !Number.isInteger(t) || t < 13 || t > 120) {
    loi.push("tuoi: phai la so nguyen tu 13 den 120")
  }

  const g = o["goi"]
  if (g !== "free" && g !== "pro") loi.push("goi: phai la free hoac pro")

  // Gom HẾT lỗi rồi mới trả — client sửa một lượt thay vì gửi lại ba lần.
  if (loi.length > 0) return { ok: false, loi }

  // Dựng object MỚI với đúng ba trường. Không spread \`...o\`, vì spread sẽ
  // kéo theo cả trường lạ — đó chính là lỗ hổng mass assignment.
  return {
    ok: true,
    du_lieu: { email: em as string, tuoi: t as number, goi: g as "free" | "pro" },
  }
}

// ---- Đừng sửa phần dưới đây ----
const g2 = (x: unknown) => JSON.stringify(kiem(x))
console.log("Sach: " + g2({ email: "a@b.c", tuoi: 20, goi: "pro" }))
console.log("Khong object: " + g2("chuoi tran"))
console.log("Nhieu loi: " + g2({ email: "abc", tuoi: 5, goi: "vip" }))
console.log("Truong la: " + g2({ email: "a@b.c", tuoi: 20, goi: "free", vaiTro: "admin" }))`,
    },
    homework:
      'Mở một handler API bạn đã viết và tìm chỗ nó đọc thân yêu cầu. Có `as` nào ở đó không? Nếu có, thử gửi vào một thân sai kiểu (chuỗi thay số) bằng công cụ dòng lệnh và xem chuyện gì xảy ra — dữ liệu hỏng có xuống tới cơ sở dữ liệu không. Sau đó thêm một schema Zod ở đúng cửa vào đó và gửi lại cùng thân sai để thấy nó bị chặn. Cuối cùng, thử gửi kèm một trường lạ và kiểm tra trường đó có bị lưu không.',
    srsCards: [
      {
        hoi: 'Vì sao `as Don` không phải là kiểm dữ liệu?',
        dap: 'Nó chỉ tắt cảnh báo của trình biên dịch. Kiểu tĩnh biến mất sau khi biên dịch, nên lúc chạy không có ai kiểm gì — dữ liệu sai vẫn đi tiếp và làm hỏng dữ liệu ở tầng sau.',
      },
      {
        hoi: 'Bốn việc một bộ kiểm ở biên phải làm?',
        dap: '① đúng kiểu ② đủ trường bắt buộc ③ trong miền hợp lệ ④ BỎ trường lạ. Việc ④ hay bị quên nhất và là lỗ hổng mass assignment.',
      },
      {
        hoi: 'Vì sao phải gom hết lỗi rồi mới trả, thay vì dừng ở lỗi đầu?',
        dap: 'Vì client phải sửa một lượt là xong. Trả từng lỗi một buộc họ gửi lại năm lần cho một biểu mẫu năm lỗi.',
      },
      {
        hoi: 'Lỗi mass assignment xảy ra thế nào?',
        dap: 'Khi bạn lưu nguyên object client gửi lên (hoặc spread `...o`) thay vì dựng object mới với đúng các trường mình biết. Client gửi kèm `vaiTro: "admin"` là tự trao quyền cho họ.',
      },
    ],
  },
  {
    id: 'p6-u62-l2',
    unitId: 'p6-u62',
    language: 'typescript',
    title: 'Lũy đẳng và tiền — bấm hai lần không được trừ tiền hai lần',
    hook: 'Người dùng bấm "Thanh toán". Mạng chập chờn, ba giây không thấy gì, họ bấm lại. Điện thoại cũng tự gửi lại một lần nữa khi sóng về. Server nhận ba yêu cầu giống hệt nhau và tạo ba đơn hàng, trừ tiền ba lần. Không có bug nào trong code của bạn — mỗi lần chạy đều đúng. Cái sai nằm ở chỗ bạn chưa bao giờ trả lời câu hỏi: "gọi lại thì sao?"',
    theory:
      'Mạng không bảo đảm gửi ĐÚNG MỘT LẦN. Nó chỉ bảo đảm được "ít nhất một lần" hoặc "nhiều nhất một lần" — và với tiền thì mất yêu cầu còn tệ hơn nhận trùng, nên thực tế mọi hệ thống đều chọn gửi lại. Việc chống trùng là của SERVER.\n\n**LŨY ĐẲNG (idempotent)** nghĩa là: gọi một lần hay mười lần cho ra CÙNG một trạng thái hệ thống. Không phải "cùng một phản hồi" — mà cùng một trạng thái.\n\nMột số thao tác lũy đẳng sẵn: `GET` (đọc không đổi gì), `PUT` (thay toàn bộ tài nguyên bằng giá trị đã cho), `DELETE` (xoá rồi thì xoá nữa vẫn là đã xoá). Thứ KHÔNG lũy đẳng sẵn là `POST` tạo mới — và đó đúng là chỗ tiền đi qua.\n\n**Cách làm: KHOÁ LŨY ĐẲNG.** Client sinh một khoá duy nhất cho MỘT Ý ĐỊNH (không phải cho mỗi lần gửi), đặt vào header, và gửi lại đúng khoá đó ở mọi lần thử lại. Server:\n\n  ① Đã thấy khoá này chưa? Rồi → trả lại KẾT QUẢ CŨ, không làm gì thêm.\n  ② Chưa → làm việc, lưu lại (khoá → kết quả), rồi trả kết quả.\n\nBa chi tiết quyết định nó đúng hay chỉ trông có vẻ đúng:\n\n· Khoá phải do CLIENT sinh trước khi gửi lần đầu. Server sinh khoá là vô nghĩa: lần thử lại sẽ mang khoá khác.\n· Việc "kiểm và ghi" phải NGUYÊN TỬ. Hai yêu cầu tới cùng lúc mà cùng đọc thấy "chưa có" thì cả hai cùng tạo đơn. Trong dự án này việc đó dựa vào ràng buộc DUY NHẤT ở cơ sở dữ liệu — chốt chặn cuối, không phải câu `if` trong mã ứng dụng.\n· Bản ghi lũy đẳng có hạn dùng (24 giờ là phổ biến), nếu không bảng sẽ phình vô hạn.\n\n**TIỀN KHÔNG BAO GIỜ LƯU BẰNG SỐ THỰC.** `0.1 + 0.2` cho `0.30000000000000004` — không phải lỗi của ngôn ngữ mà là bản chất của số dấu phẩy động nhị phân: nó không biểu diễn chính xác được nhiều giá trị thập phân. Cộng dồn vài nghìn dòng là lệch tới mức đối soát ra sai.\n\nCách đúng: lưu bằng **số nguyên theo đơn vị nhỏ nhất** — với VND là đồng, với USD là cent. Chỉ chia cho 100 lúc HIỂN THỊ, không bao giờ trong lúc tính. Cùng luật đó áp cho mọi phép cộng dồn, và nó biến bài toán tiền thành số học số nguyên, chính xác tuyệt đối.',
    workedExample: {
      code: `// Cửa lũy đẳng tí hon: khoá → kết quả đã trả lần đầu.
type Don = { id: number; tongDong: number }

const daXuLy = new Map<string, Don>()
let idKe = 1

function taoDon(khoa: string, soLuong: number, donGiaDong: number): Don {
  // ① Đã thấy khoá này rồi thì TRẢ LẠI KẾT QUẢ CŨ, không tạo thêm gì.
  const cu = daXuLy.get(khoa)
  if (cu !== undefined) return cu

  // ② Chưa thấy: làm việc thật. Tiền tính bằng SỐ NGUYÊN đơn vị đồng.
  const don: Don = { id: idKe, tongDong: soLuong * donGiaDong }
  idKe += 1
  daXuLy.set(khoa, don)
  return don
}

// Người dùng bấm một lần, nhưng yêu cầu được gửi đi ba lần (thử lại + gửi trùng).
const a = taoDon("y-dinh-001", 3, 25000)
const b = taoDon("y-dinh-001", 3, 25000)
const c = taoDon("y-dinh-001", 3, 25000)
console.log("Ba lan goi: id=" + a.id + "," + b.id + "," + c.id)
console.log("So don da tao: " + daXuLy.size)
console.log("Tong tien: " + a.tongDong + " dong")

// Một ý định KHÁC thì khoá khác, và phải tạo đơn mới.
const d = taoDon("y-dinh-002", 1, 25000)
console.log("Y dinh khac: id=" + d.id)`,
      stdinLines: [],
    },
    predict: {
      code: `// Lưu tiền bằng số thực — cộng dồn ba dòng hàng lẻ.
const gia = [0.1, 0.2, 0.3]
let tong = 0
for (const g of gia) tong += g

console.log("Tong: " + tong + " | bang 0.6? " + (tong === 0.6))`,
      question: 'Dòng này in ra gì?',
      choices: [
        'Tong: 0.6000000000000001 | bang 0.6? false',
        'Tong: 0.6 | bang 0.6? true',
        'Tong: 0.5999999999999999 | bang 0.6? false',
        'Tong: 0.60 | bang 0.6? true',
      ],
      answerIndex: 0,
      explain:
        'Số dấu phẩy động nhị phân không biểu diễn chính xác được 0.1, 0.2, 0.3 — mỗi phép cộng làm sai số tích luỹ thêm một chút, và tổng ra 0.6000000000000001. Phép so sánh bằng vì thế trả false. Với ba dòng hàng thì lệch không nhìn thấy; với vài nghìn dòng trong một kỳ đối soát thì lệch tới mức kế toán không khớp sổ. Đó là lý do luật của dự án là: tiền lưu bằng SỐ NGUYÊN đơn vị nhỏ nhất (đồng), chỉ chia lúc hiển thị.',
    },
    parsons: {
      prompt: 'Xếp lại cửa lũy đẳng — chú ý bước kiểm khoá phải đứng TRƯỚC khi làm bất cứ việc gì.',
      lines: [
        'function taoDon(khoa: string, soLuong: number, donGiaDong: number): Don {',
        '  const cu = daXuLy.get(khoa)',
        '  if (cu !== undefined) return cu',
        '  const don: Don = { id: idKe, tongDong: soLuong * donGiaDong }',
        '  idKe += 1',
        '  daXuLy.set(khoa, don)',
        '  return don',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết lớp CuaThanhToan mô phỏng một cửa thanh toán LŨY ĐẲNG, tiền tính bằng số nguyên đơn vị ĐỒNG.\n\nHai phương thức:\n  · `tra(khoa, soDong)` → trả về `{ id, soDong, lapLai }`. Lần đầu với một khoá: tạo giao dịch mới, `id` tăng dần từ 1, `lapLai` là false. Gọi lại CÙNG khoá: trả nguyên kết quả cũ nhưng `lapLai` là true — và KHÔNG được tạo giao dịch mới, KHÔNG được cộng thêm vào tổng.\n  · `tongDaTra()` → tổng số đồng đã thực sự trừ, tính bằng số nguyên.\n\nĐiểm dễ sai nhất: `lapLai` phải phản ánh lần gọi HIỆN TẠI, còn `id` và `soDong` phải là của lần ĐẦU. Trả về nguyên object đã lưu là sai, vì nó mang `lapLai: false` của lần đầu.\n\nBốn dòng in ở cuối đã viết sẵn, đừng sửa — chúng chính là bốn ca chấm.',
      starterCode: `type KetQua = { id: number; soDong: number; lapLai: boolean }

class CuaThanhToan {
  tra(khoa: string, soDong: number): KetQua {
    // TODO: lũy đẳng theo khoá
    return { id: 0, soDong, lapLai: false }
  }
  tongDaTra(): number {
    // TODO
    return 0
  }
}

// ---- Đừng sửa phần dưới đây ----
const cua = new CuaThanhToan()
const r1 = cua.tra("y1", 25000)
const r2 = cua.tra("y1", 25000)
const r3 = cua.tra("y2", 10000)
const g = (r: KetQua) => r.id + "/" + r.soDong + "/" + r.lapLai
console.log("Lan dau: " + g(r1))
console.log("Goi lai: " + g(r2))
console.log("Y dinh khac: " + g(r3))
console.log("Tong da tra: " + cua.tongDaTra())`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Lan dau: 1/25000/false',
          match: 'contains',
          hidden: false,
          label: 'Lần đầu tạo giao dịch id=1, chưa lặp lại',
        },
        {
          stdinLines: [],
          expected: 'Goi lai: 1/25000/true',
          match: 'contains',
          hidden: false,
          label: 'Gọi lại cùng khoá trả KẾT QUẢ CŨ (id=1) nhưng cờ lapLai của lần này là true',
        },
        {
          stdinLines: [],
          expected: 'Y dinh khac: 2/10000/false',
          match: 'contains',
          hidden: false,
          label: 'Ý định khác thì khoá khác, phải tạo giao dịch mới',
        },
        {
          stdinLines: [],
          expected: 'Tong da tra: 35000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — gọi lại KHÔNG được cộng thêm tiền; tổng là số nguyên đồng',
        },
      ],
      hints: [
        'Giữ một Map từ khoá sang kết quả đã trả, và một biến đếm id bắt đầu từ 1.',
        'Bước đầu tiên của `tra` là tra Map. Có rồi thì đừng làm gì thêm — mọi việc tạo mới và cộng tiền phải nằm SAU nhánh đó.',
        'Chỗ dễ sai: khi trả lại kết quả cũ, đừng trả nguyên object đã lưu (nó mang lapLai: false). Dựng object mới giữ id và soDong cũ, đặt lapLai: true.',
        'Khung tham chiếu:\n\nconst cu = this.daTra.get(khoa)\nif (cu !== undefined) return { id: cu.id, soDong: cu.soDong, lapLai: true }',
      ],
      sampleSolution: `type KetQua = { id: number; soDong: number; lapLai: boolean }

class CuaThanhToan {
  private daTra = new Map<string, KetQua>()
  private idKe = 1
  private tong = 0

  tra(khoa: string, soDong: number): KetQua {
    // ① Đã thấy khoá này rồi: trả lại kết quả cũ, KHÔNG tạo mới, KHÔNG cộng tiền.
    //    Nhưng cờ lapLai phải mô tả LẦN GỌI NÀY, nên dựng object mới.
    const cu = this.daTra.get(khoa)
    if (cu !== undefined) return { id: cu.id, soDong: cu.soDong, lapLai: true }

    // ② Ý định mới: làm việc thật. Tiền là SỐ NGUYÊN đơn vị đồng.
    const kq: KetQua = { id: this.idKe, soDong, lapLai: false }
    this.idKe += 1
    this.tong += soDong
    this.daTra.set(khoa, kq)
    return kq
  }

  tongDaTra(): number {
    return this.tong
  }
}

// ---- Đừng sửa phần dưới đây ----
const cua = new CuaThanhToan()
const r1 = cua.tra("y1", 25000)
const r2 = cua.tra("y1", 25000)
const r3 = cua.tra("y2", 10000)
const g = (r: KetQua) => r.id + "/" + r.soDong + "/" + r.lapLai
console.log("Lan dau: " + g(r1))
console.log("Goi lai: " + g(r2))
console.log("Y dinh khac: " + g(r3))
console.log("Tong da tra: " + cua.tongDaTra())`,
    },
    homework:
      'Mở endpoint ghi dữ liệu quan trọng nhất của bạn (tạo đơn, thanh toán, gửi thư) và tự tấn công nó: viết một vòng lặp gửi 20 yêu cầu GIỐNG HỆT nhau cùng lúc, rồi đếm số bản ghi trong cơ sở dữ liệu. Nếu ra 20 thì bạn vừa tìm được một lỗi tiền thật. Sửa bằng khoá lũy đẳng, và nhớ rằng chốt chặn phải là ràng buộc DUY NHẤT ở cơ sở dữ liệu chứ không phải câu `if` trong mã — chạy lại bài thử để chứng minh.',
    srsCards: [
      {
        hoi: 'Lũy đẳng nghĩa là gì với một endpoint ghi?',
        dap: 'Gọi một lần hay mười lần đều cho ra CÙNG một trạng thái hệ thống. Không phải cùng phản hồi — cùng trạng thái.',
      },
      {
        hoi: 'Khoá lũy đẳng phải do ai sinh, và vì sao?',
        dap: 'Do CLIENT sinh, một khoá cho một Ý ĐỊNH, gửi lại y nguyên ở mọi lần thử lại. Server sinh khoá là vô nghĩa vì lần gửi lại sẽ mang khoá khác.',
      },
      {
        hoi: 'Vì sao câu `if (chưa có khoá)` trong mã ứng dụng không đủ?',
        dap: 'Hai yêu cầu tới cùng lúc có thể cùng đọc thấy "chưa có" rồi cùng tạo. Chốt chặn phải là ràng buộc DUY NHẤT ở cơ sở dữ liệu.',
      },
      {
        hoi: 'Vì sao tiền không được lưu bằng số thực?',
        dap: 'Số dấu phẩy động nhị phân không biểu diễn chính xác nhiều giá trị thập phân, nên cộng dồn sẽ lệch dần. Lưu số nguyên theo đơn vị nhỏ nhất (đồng), chỉ chia lúc hiển thị.',
      },
    ],
  },
]
