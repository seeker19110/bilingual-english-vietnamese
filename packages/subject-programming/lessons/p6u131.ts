// lessons/p6u131.ts — P6-U131: HƯỚNG DI ĐỘNG, chặng S1 "App đầu tiên trên máy thật" —
// Chọn nền tảng và hiểu đánh đổi (module `mobile-s1-m1`).
//
// Đây là unit MỞ ĐẦU của hướng Di động (trước đó hướng này chưa có bài nào ở bất kỳ chặng
// nào). Điều khiến lập trình di động khác web nhất KHÔNG phải cú pháp Kotlin hay Swift — mà
// là: app của bạn KHÔNG làm chủ vòng đời của chính nó. Hệ điều hành có quyền đẩy app xuống
// nền và GIẾT nó bất cứ lúc nào để lấy lại RAM, không hỏi ai. Bài này dạy đúng máy trạng
// thái đó, vì mọi lỗi "mở lại app thì mất hết dữ liệu đang nhập" đều sinh ra từ chỗ hiểu sai
// nó — và nó đúng như nhau ở Android lẫn iOS, native lẫn đa nền tảng.
//
// QUYẾT ĐỊNH LÀN NGÔN NGỮ: dùng `typescript` chứ không phải `kotlin`/`swift`. Lý do đo được:
// hai làn kia có bộ mô phỏng (`kotlinSim/`) nhưng CHƯA bài học nào dùng, nên chưa có cổng CI
// nào chứng minh chúng chấm đúng bài mới; còn `lessonsTs.test.ts` chạy tsc thật + node:vm cho
// mọi bài `typescript`. Nguyên lý dạy ở đây là nguyên lý CHUNG, mô phỏng được bằng hàm thuần
// — đúng cách `p6u108` mô phỏng ước lượng dung lượng mà không dựng hệ phân tán thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U131_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u131-l1',
    unitId: 'p6-u131',
    language: 'typescript',
    title: 'Vòng đời app — hệ điều hành có quyền giết app của bạn, và không báo trước',
    hook: 'Người dùng đang gõ dở một khoản chi 250.000đ thì có cuộc gọi tới. Nghe xong ba phút, họ quay lại app — trắng trơn, mất sạch. Đây không phải lỗi mạng, không phải lỗi cơ sở dữ liệu: hệ điều hành đã GIẾT app khi nó nằm ở nền để lấy RAM cho cuộc gọi. Đó là hành vi ĐÚNG của điện thoại, và app phải chuẩn bị cho nó.',
    theory:
      'Trên máy tính để bàn, chương trình chạy tới khi người dùng tắt. Trên điện thoại thì KHÔNG: RAM ít, pin hữu hạn, nên hệ điều hành tự cho mình quyền dừng và giết ứng dụng đang ở nền. App di động vì thế luôn sống trong một MÁY TRẠNG THÁI (state machine) mà nó không làm chủ.\n\nBốn trạng thái cốt lõi (tên gọi khác nhau giữa Android và iOS, nhưng ý nghĩa trùng nhau):\n\n- **chua-tao**: app chưa chạy, chưa có gì trong bộ nhớ.\n- **hien** (foreground): app đang hiện trên màn hình, người dùng chạm được.\n- **nen** (background): app còn trong bộ nhớ nhưng không hiện — người dùng bấm nút Home hoặc chuyển sang app khác.\n- **da-giet**: hệ điều hành đã thu hồi bộ nhớ. Mọi biến trong RAM biến mất sạch.\n\nĐiểm QUAN TRỌNG NHẤT của cả bài: chuyển từ **hien sang nen** là LẦN CUỐI CÙNG app còn được chạy code một cách chắc chắn. Sau thời điểm đó, app có thể bị giết mà KHÔNG được báo trước, không có cơ hội chạy thêm dòng nào nữa. Cho nên luật thi hành là: mọi thứ cần sống sót phải được ghi xuống bộ nhớ bền NGAY tại lần chuyển hien sang nen, không hoãn lại.\n\nHai đường quay lại rất khác nhau, và lẫn lộn chúng là nguồn của phần lớn lỗi khó tái hiện:\n\n1. Từ **nen** quay lại **hien**: RAM còn nguyên, mọi biến vẫn đó — app tiếp tục như chưa có gì xảy ra.\n2. Từ **da-giet** mở lại: app khởi động từ đầu, mọi biến reset. Nếu lần trước không ghi gì xuống bộ nhớ bền thì dữ liệu đã mất vĩnh viễn.\n\nNgười dùng KHÔNG phân biệt được hai đường này — với họ cả hai đều là "mở lại app". Nên app phải làm cả hai đường cho ra cùng một trải nghiệm, và cách duy nhất là khôi phục từ dữ liệu đã ghi chứ không tin vào RAM. Đây cũng là lý do lỗi loại này rất khó bắt lúc phát triển: máy của lập trình viên nhiều RAM, app hiếm khi bị giết, nên đường thứ hai gần như không bao giờ chạy — cho tới khi ra máy người dùng thật.\n\nCÒN CHUYỆN CHỌN NỀN TẢNG: native (Kotlin cho Android, Swift cho iOS) cho quyền chạm tận đáy hệ điều hành và hiệu năng tốt nhất, nhưng phải viết và bảo trì HAI bản. Đa nền tảng (React Native, Flutter) cho một mã nguồn chạy hai máy, đổi lại mọi thứ cần khả năng native đặc biệt đều phải viết thêm cầu nối. Đánh đổi thật không nằm ở "cái nào tốt hơn" mà ở "đội của bạn có nổi hai bản không". Điều đáng chú ý là: DÙ CHỌN GÌ, máy trạng thái vòng đời ở trên vẫn y hệt — nó là quy tắc của hệ điều hành, không phải của thư viện.',
    workedExample: {
      code: `type TrangThai = "chua-tao" | "hien" | "nen" | "da-giet"

// Mot buoc chuyen: tu trang thai hien tai + mot su kien -> trang thai moi.
// Su kien la hanh dong cua NGUOI DUNG hoac cua HE DIEU HANH, khong phai cua app.
function buocTiep(tt: TrangThai, sk: string): TrangThai {
  if (tt === "chua-tao" && sk === "mo") return "hien"     // nguoi dung mo app lan dau
  if (tt === "hien" && sk === "an-home") return "nen"     // bam Home -> xuong nen
  if (tt === "nen" && sk === "quay-lai") return "hien"    // quay lai, RAM con nguyen
  if (tt === "nen" && sk === "he-giet") return "da-giet"  // he dieu hanh thu hoi RAM
  if (tt === "da-giet" && sk === "mo") return "hien"      // mo lai = khoi dong tu dau
  return tt // su kien khong hop le o trang thai nay: bo qua, KHONG doi trang thai
}

// Chay ca chuoi su kien, dem so lan phai GHI DU LIEU (moi lan hien -> nen).
function chay(sukien: string[]): { cuoi: TrangThai; soLanLuu: number } {
  let tt: TrangThai = "chua-tao"
  let soLanLuu = 0
  for (const sk of sukien) {
    const moi = buocTiep(tt, sk)
    if (tt === "hien" && moi === "nen") soLanLuu += 1 // co hoi ghi CUOI CUNG chac chan
    tt = moi
  }
  return { cuoi: tt, soLanLuu }
}

const a = chay(["mo", "an-home", "quay-lai"])
console.log("Quay lai tu nen:", a.cuoi, a.soLanLuu)

const b = chay(["mo", "an-home", "he-giet", "mo"])
console.log("Mo lai sau khi bi giet:", b.cuoi, b.soLanLuu)`,
      stdinLines: [],
    },
    predict: {
      code: `type TrangThai = "chua-tao" | "hien" | "nen" | "da-giet"
function buocTiep(tt: TrangThai, sk: string): TrangThai {
  if (tt === "chua-tao" && sk === "mo") return "hien"
  if (tt === "hien" && sk === "an-home") return "nen"
  if (tt === "nen" && sk === "quay-lai") return "hien"
  if (tt === "nen" && sk === "he-giet") return "da-giet"
  if (tt === "da-giet" && sk === "mo") return "hien"
  return tt
}
function chay(sukien: string[]): { cuoi: TrangThai; soLanLuu: number } {
  let tt: TrangThai = "chua-tao"
  let soLanLuu = 0
  for (const sk of sukien) {
    const moi = buocTiep(tt, sk)
    if (tt === "hien" && moi === "nen") soLanLuu += 1
    tt = moi
  }
  return { cuoi: tt, soLanLuu }
}
console.log(chay(["mo", "an-home", "he-giet", "mo"]).cuoi, chay(["mo", "an-home", "quay-lai", "an-home"]).soLanLuu)`,
      question:
        'Dòng cuối in ra gì? (trạng thái cuối của chuỗi thứ nhất, rồi số lần phải lưu của chuỗi thứ hai)',
      choices: ['hien 2', 'da-giet 2', 'hien 1', 'nen 2'],
      answerIndex: 0,
      explain:
        'Chuỗi 1: mo thành hien, an-home thành nen, he-giet thành da-giet, mo thành hien. Bị giết rồi mở lại VẪN về "hien" — nhìn từ ngoài giống hệt lúc quay lại từ nền, đó chính là chỗ dễ nhầm. Chuỗi 2: mo, an-home (lưu lần 1), quay-lai, an-home (lưu lần 2) — mỗi lần xuống nền là một lần phải ghi, không phải chỉ ghi một lần lúc mở app.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm chuyển trạng thái vòng đời app theo đúng thứ tự đường đi: mở, xuống nền, quay lại, bị giết.',
      lines: [
        'function buocTiep(tt: TrangThai, sk: string): TrangThai {',
        '  if (tt === "chua-tao" && sk === "mo") return "hien"',
        '  if (tt === "hien" && sk === "an-home") return "nen"',
        '  if (tt === "nen" && sk === "quay-lai") return "hien"',
        '  if (tt === "nen" && sk === "he-giet") return "da-giet"',
        '  return tt',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết máy trạng thái vòng đời app và bộ đếm "số lần phải ghi dữ liệu".\n\n- buocTiep(tt, sk): chuyển trạng thái theo đúng 5 luật đã học — chua-tao + mo cho hien, hien + an-home cho nen, nen + quay-lai cho hien, nen + he-giet cho da-giet, da-giet + mo cho hien. Sự kiện KHÔNG hợp lệ ở trạng thái hiện tại thì GIỮ NGUYÊN trạng thái (đừng ném lỗi).\n- chay(sukien): bắt đầu từ "chua-tao", chạy hết chuỗi sự kiện, trả về { cuoi, soLanLuu } — soLanLuu đếm số lần chuyển từ "hien" sang "nen" (mỗi lần đó là một cơ hội ghi cuối cùng).\n\nDùng starter code có sẵn (đừng sửa phần dưới).',
      starterCode: `type TrangThai = "chua-tao" | "hien" | "nen" | "da-giet"

function buocTiep(tt: TrangThai, sk: string): TrangThai {
  // TODO: 5 luat chuyen; su kien khong hop le thi giu nguyen tt
  return tt
}

function chay(sukien: string[]): { cuoi: TrangThai; soLanLuu: number } {
  // TODO: chay het chuoi, dem so lan hien -> nen
  return { cuoi: "chua-tao", soLanLuu: 0 }
}

// ---- Đừng sửa phần dưới đây ----
const r1 = chay(["mo", "an-home", "quay-lai"])
console.log("Ca 1:", r1.cuoi, r1.soLanLuu)
const r2 = chay(["mo", "an-home", "he-giet", "mo"])
console.log("Ca 2:", r2.cuoi, r2.soLanLuu)
const r3 = chay(["mo", "an-home", "quay-lai", "an-home"])
console.log("Ca 3:", r3.cuoi, r3.soLanLuu)
const r4 = chay(["quay-lai", "mo"])
console.log("Ca 4:", r4.cuoi, r4.soLanLuu)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ca 1: hien 1',
          match: 'contains',
          hidden: false,
          label: 'Mở, xuống nền, quay lại: đang hiện, đã có 1 lần phải ghi',
        },
        {
          stdinLines: [],
          expected: 'Ca 2: hien 1',
          match: 'contains',
          hidden: false,
          label: 'Bị giết rồi mở lại: vẫn về "hien", vẫn chỉ 1 lần ghi (lúc xuống nền)',
        },
        {
          stdinLines: [],
          expected: 'Ca 4: hien 0',
          match: 'contains',
          hidden: false,
          label: 'Sự kiện "quay-lai" lúc chưa tạo bị bỏ qua, không làm hỏng máy trạng thái',
        },
        {
          stdinLines: [],
          expected: 'Ca 1: hien 1\nCa 2: hien 1\nCa 3: nen 2\nCa 4: hien 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả bốn ca đúng thứ tự, gồm ca xuống nền hai lần phải ghi hai lần',
        },
      ],
      hints: [
        'buocTiep: viết đúng 5 câu if, mỗi câu kiểm CẢ trạng thái hiện tại LẪN sự kiện. Dòng cuối cùng `return tt` chính là luật "sự kiện không hợp lệ thì không đổi gì".',
        'chay: cần một biến `tt` giữ trạng thái và một biến đếm. Trong vòng lặp, tính trạng thái MỚI trước, so sánh với trạng thái CŨ, rồi mới gán đè.',
        'Chỗ dễ sai nhất: đếm "đang ở nen" thay vì đếm "vừa chuyển hien sang nen". Ca 3 phân biệt được hai cách hiểu này — nó xuống nền hai lần nên phải ra 2.',
      ],
      sampleSolution: `type TrangThai = "chua-tao" | "hien" | "nen" | "da-giet"

function buocTiep(tt: TrangThai, sk: string): TrangThai {
  if (tt === "chua-tao" && sk === "mo") return "hien"
  if (tt === "hien" && sk === "an-home") return "nen"
  if (tt === "nen" && sk === "quay-lai") return "hien"
  if (tt === "nen" && sk === "he-giet") return "da-giet"
  if (tt === "da-giet" && sk === "mo") return "hien"
  return tt
}

function chay(sukien: string[]): { cuoi: TrangThai; soLanLuu: number } {
  let tt: TrangThai = "chua-tao"
  let soLanLuu = 0
  for (const sk of sukien) {
    const moi = buocTiep(tt, sk)
    if (tt === "hien" && moi === "nen") soLanLuu += 1
    tt = moi
  }
  return { cuoi: tt, soLanLuu }
}

// ---- Đừng sửa phần dưới đây ----
const r1 = chay(["mo", "an-home", "quay-lai"])
console.log("Ca 1:", r1.cuoi, r1.soLanLuu)
const r2 = chay(["mo", "an-home", "he-giet", "mo"])
console.log("Ca 2:", r2.cuoi, r2.soLanLuu)
const r3 = chay(["mo", "an-home", "quay-lai", "an-home"])
console.log("Ca 3:", r3.cuoi, r3.soLanLuu)
const r4 = chay(["quay-lai", "mo"])
console.log("Ca 4:", r4.cuoi, r4.soLanLuu)`,
    },
    homework:
      'Lấy một app bạn dùng hàng ngày (ghi chú, nhắn tin, đặt xe). Gõ dở một nội dung, bấm Home, mở 4-5 app nặng khác (bản đồ, camera, game) để hệ điều hành phải thu hồi RAM, rồi quay lại app ban đầu. Nội dung dở còn không? Viết 3 câu: app đó đã ghi trạng thái ở đâu, và nếu là bạn thì bạn ghi cái gì tại thời điểm hien sang nen — ghi TOÀN BỘ hay chỉ những trường người dùng đã sửa?',
    srsCards: [
      {
        hoi: 'Thời điểm nào là lần cuối cùng app di động chắc chắn còn được chạy code?',
        dap: 'Lần chuyển từ hien (foreground) sang nen (background). Sau đó hệ điều hành có thể giết app bất cứ lúc nào mà không báo trước, nên mọi thứ cần sống sót phải được ghi xuống bộ nhớ bền ngay tại thời điểm đó.',
      },
      {
        hoi: 'Quay lại từ nền và mở lại sau khi bị giết khác nhau ở đâu?',
        dap: 'Quay lại từ nền: RAM còn nguyên, mọi biến vẫn đó. Mở lại sau khi bị giết: app khởi động từ đầu, mọi biến reset — chỉ khôi phục được từ dữ liệu đã ghi xuống bộ nhớ bền. Người dùng không phân biệt được hai đường này.',
      },
      {
        hoi: 'Đánh đổi thật giữa native và đa nền tảng nằm ở đâu?',
        dap: 'Native cho quyền chạm sâu hệ điều hành và hiệu năng tốt nhất nhưng phải viết và bảo trì hai bản; đa nền tảng cho một mã nguồn chạy hai máy nhưng mọi khả năng native đặc biệt đều cần cầu nối. Câu hỏi thật là đội có nổi hai bản không, không phải cái nào tốt hơn.',
      },
    ],
  },
]
