// lessons/p6u115.ts — P6-U115: HƯỚNG WEB, chặng S3 — Kiến trúc & vòng đời trang lớn
// (gộp `web-s3-m2` "Render phía server" + `web-s3-m4` "Kiến trúc frontend lớn").
//
// U114 dạy ĐO hiệu năng bằng số. U115 dạy hai quyết định CẤU TRÚC lớn của một ứng dụng
// web: (l1) chọn CHIẾN LƯỢC RENDER đúng cho từng loại trang — SSG/SSR/CSR không phải "cái
// nào mới hơn thì dùng cái đó" mà là một luật ưu tiên rõ ràng theo tần suất đổi nội dung,
// nhu cầu SEO, và cá nhân hoá; (l2) LUẬT PHỤ THUỘC MODULE — ranh giới kiến trúc chỉ có tác
// dụng khi chặn được bằng máy (lint), không phải "mọi người tự giác nhớ".
//
// Mọi giá trị số/chuỗi đã chạy thật qua tsc --strict + node trước khi soạn, không suy đoán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U115_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u115-l1',
    unitId: 'p6-u115',
    language: 'typescript',
    title: 'SSG / SSR / CSR — chọn chiến lược render theo ĐẶC ĐIỂM trang, không theo trào lưu',
    hook: 'Bạn dựng trang "Giới thiệu" gần như không đổi bao giờ và dashboard cá nhân đổi liên tục theo mỗi người dùng — dùng CÙNG MỘT cách render cho cả hai là phí một trong hai bên: hoặc build lại toàn site chỉ vì một số liệu đổi, hoặc bắt server render lại cả một trang tĩnh chưa từng thay đổi trong sáu tháng.',
    theory:
      'BA CHIẾN LƯỢC RENDER giải quyết cùng một câu hỏi — "HTML được TẠO RA lúc nào?" — theo ba thời điểm khác nhau:\n\n- **SSG (Static Site Generation)**: HTML tạo sẵn LÚC BUILD (trước khi có bất kỳ request nào), phục vụ y hệt cho mọi người. Nhanh nhất vì server chỉ trả file có sẵn, không tính toán gì lúc request. Chỉ hợp khi nội dung ÍT ĐỔI — đổi thì phải build lại cả trang.\n- **SSR (Server-Side Rendering)**: HTML tạo MỖI LẦN CÓ REQUEST, ngay trên server, rồi gửi về trình duyệt đã có sẵn nội dung. Chậm hơn SSG một chút (phải tính toán mỗi lần) nhưng LUÔN mới, và có thể CÁ NHÂN HOÁ theo từng người dùng (server biết ai đang gọi).\n- **CSR (Client-Side Rendering)**: server chỉ gửi một trang HTML gần như rỗng + file JavaScript; trình duyệt TỰ chạy JS để dựng nội dung. Linh hoạt nhất cho tương tác liên tục (dashboard, ứng dụng sau đăng nhập) nhưng bất lợi cho SEO — máy quét của công cụ tìm kiếm không phải lúc nào cũng chờ JavaScript chạy xong để thấy nội dung thật.\n\nLUẬT ƯU TIÊN để chọn (ba tiêu chí: TẦN SUẤT nội dung đổi, có CẦN SEO không, có CẦN CÁ NHÂN HOÁ theo người dùng không):\n\n1. **Cần cá nhân hoá HOẶC nội dung đổi LIÊN TỤC** (dashboard, giỏ hàng, bảng tin riêng từng người) → không thể dùng SSG (không có "một bản HTML chung" để build sẵn). Trong nhóm này: nếu VẪN cần SEO (hiếm nhưng có, vd trang sản phẩm cá nhân hoá giá theo vùng nhưng vẫn cần lên Google) → **SSR** (server render mỗi lần, biết ai đang gọi). Nếu KHÔNG cần SEO (dashboard sau đăng nhập, máy tìm kiếm không cần thấy) → **CSR** (rẻ nhất, để trình duyệt tự lo).\n2. **Còn lại** (không cá nhân hoá, không đổi liên tục — tức nội dung CHUNG cho mọi người, chỉ khác nhau về TẦN SUẤT đổi): nếu **hiếm khi đổi** (trang giới thiệu, blog đã xuất bản, điều khoản dịch vụ) → **SSG** (build sẵn, nhanh nhất, không tính lại mỗi request). Nếu **thỉnh thoảng đổi** (trang danh mục sản phẩm cập nhật vài lần/ngày, tin tức) → **SSR** (không đáng để build lại NGUYÊN site chỉ vì vài mục đổi, nhưng vẫn cần SEO nên không thể CSR).\n\nMỘT LỖI HAY GẶP: nhầm "cần SEO" với "phải SSR". SEO chỉ loại bỏ CSR khỏi lựa chọn — SSG cũng hoàn toàn tốt cho SEO (HTML có sẵn ngay từ đầu, máy quét đọc được luôn), nên trang ít đổi vẫn nên chọn SSG chứ không cần "lên hẳn SSR cho chắc".\n\nHYDRATION là cái giá đi kèm SSR/SSG khi trang cần TƯƠNG TÁC: trình duyệt nhận HTML đã có sẵn (đẹp, hiện ngay), nhưng JavaScript vẫn phải chạy lại để "gắn" các sự kiện (onClick…) vào đúng những phần tử đó — khoảng thời gian giữa "nhìn thấy trang" và "bấm được vào trang" chính là hydration, và trang càng nhiều tương tác thì hydration càng tốn.',
    workedExample: {
      code: `type TanSuat = "hiem-khi" | "thinh-thoang" | "lien-tuc"

function chonChienLuocRender(tanSuatThayDoiNoiDung: TanSuat, canSEO: boolean, canCaNhanHoa: boolean): string {
  if (canCaNhanHoa || tanSuatThayDoiNoiDung === "lien-tuc") {
    if (canSEO) return "SSR"
    return "CSR"
  }
  if (tanSuatThayDoiNoiDung === "hiem-khi") return "SSG"
  return "SSR"
}

console.log(chonChienLuocRender("hiem-khi", true, false))     // trang gioi thieu -> SSG
console.log(chonChienLuocRender("lien-tuc", false, true))     // dashboard rieng -> CSR
console.log(chonChienLuocRender("lien-tuc", true, false))     // ban tin can SEO -> SSR
console.log(chonChienLuocRender("thinh-thoang", true, false)) // danh muc SP -> SSR
console.log(chonChienLuocRender("hiem-khi", false, false))    // dieu khoan (khong SEO) -> SSG`,
      stdinLines: [],
    },
    predict: {
      code: `type TanSuat = "hiem-khi" | "thinh-thoang" | "lien-tuc"

function chonChienLuocRender(tanSuatThayDoiNoiDung: TanSuat, canSEO: boolean, canCaNhanHoa: boolean): string {
  if (canCaNhanHoa || tanSuatThayDoiNoiDung === "lien-tuc") {
    if (canSEO) return "SSR"
    return "CSR"
  }
  if (tanSuatThayDoiNoiDung === "hiem-khi") return "SSG"
  return "SSR"
}

console.log(chonChienLuocRender("thinh-thoang", false, true))`,
      question:
        'Trang cập nhật "thỉnh thoảng", KHÔNG cần SEO, nhưng CÓ cá nhân hoá (canCaNhanHoa=true). Hàm trả về gì?',
      choices: ['CSR', 'SSR', 'SSG', 'undefined'],
      answerIndex: 0,
      explain:
        'Kết quả là "CSR". canCaNhanHoa=true rơi ngay vào nhánh đầu tiên (bất kể tanSuatThayDoiNoiDung là gì) — bên trong nhánh đó, canSEO=false nên trả "CSR". Bẫy hay nhầm: thấy "thỉnh thoảng" (không phải "liên tục") rồi vội nghĩ sẽ đi vào nhóm SSG/SSR ở dưới — nhưng canCaNhanHoa=true đã CHẶN đường đó lại từ điều kiện đầu tiên, vì cá nhân hoá nghĩa là không có "một bản HTML chung" để build sẵn hay dùng chung, bất kể nội dung đổi nhanh hay chậm.',
    },
    parsons: {
      prompt: 'Xếp lại nhánh xử lý khi CẦN cá nhân hoá hoặc nội dung đổi liên tục.',
      lines: [
        'if (canCaNhanHoa || tanSuatThayDoiNoiDung === "lien-tuc") {',
        '  if (canSEO) return "SSR"',
        '  return "CSR"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm xepChienLuocNhieuTrang(danhSachTrang) áp chiến lược render cho một loạt trang.\n\n- Dùng lại đúng luật của chonChienLuocRender(tanSuat, canSEO, canCaNhanHoa) ở ví dụ mẫu (viết lại cả hàm).\n- danhSachTrang là mảng các bộ ba [tanSuat, canSEO, canCaNhanHoa] (kiểu [TanSuat, boolean, boolean][]).\n- Với mỗi bộ ba, gọi chonChienLuocRender rồi đẩy kết quả (string) vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `type TanSuat = "hiem-khi" | "thinh-thoang" | "lien-tuc"

function chonChienLuocRender(tanSuatThayDoiNoiDung: TanSuat, canSEO: boolean, canCaNhanHoa: boolean): string {
  // TODO: neu canCaNhanHoa hoac lien-tuc -> canSEO ? SSR : CSR; con lai: hiem-khi -> SSG, con lai -> SSR
  return ""
}

function xepChienLuocNhieuTrang(danhSachTrang: [TanSuat, boolean, boolean][]): string[] {
  // TODO: voi moi bo ba, goi chonChienLuocRender va gom ket qua theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const CAC_TRANG: [TanSuat, boolean, boolean][] = [
  ["hiem-khi", true, false],
  ["lien-tuc", true, false],
  ["lien-tuc", false, true],
  ["thinh-thoang", true, false],
]
console.log(JSON.stringify(xepChienLuocNhieuTrang(CAC_TRANG)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '["SSG","SSR","CSR","SSR"]',
          match: 'contains',
          hidden: false,
          label:
            'Bốn trang xếp đúng: giới thiệu→SSG, tin tức cần SEO liên tục→SSR, dashboard cá nhân hoá→CSR, danh mục thỉnh thoảng→SSR',
        },
        {
          stdinLines: [],
          expected: '"CSR"',
          match: 'contains',
          hidden: false,
          label: 'Trang cá nhân hoá không cần SEO phải ra CSR, không phải SSG',
        },
        {
          stdinLines: [],
          expected: '["SSG","SSR","CSR","SSR"]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kiểm cả mảng đầy đủ khớp thứ tự — không hardcode một phần tử riêng lẻ',
        },
      ],
      hints: [
        'Nhánh ĐẦU TIÊN kiểm canCaNhanHoa || tanSuatThayDoiNoiDung === "lien-tuc" — cả hai điều kiện này ĐỀU dẫn vào cùng một nhánh (SSR nếu canSEO, còn lại CSR).',
        'Chỉ khi KHÔNG rơi vào nhánh trên mới xét "hiem-khi" (SSG) hay "thinh-thoang" (SSR).',
        'xepChienLuocNhieuTrang: dùng vòng lặp, mỗi phần tử là const [tanSuat, seo, caNhanHoa] = bo, rồi push chonChienLuocRender(tanSuat, seo, caNhanHoa).',
      ],
      sampleSolution: `type TanSuat = "hiem-khi" | "thinh-thoang" | "lien-tuc"

function chonChienLuocRender(tanSuatThayDoiNoiDung: TanSuat, canSEO: boolean, canCaNhanHoa: boolean): string {
  if (canCaNhanHoa || tanSuatThayDoiNoiDung === "lien-tuc") {
    if (canSEO) return "SSR"
    return "CSR"
  }
  if (tanSuatThayDoiNoiDung === "hiem-khi") return "SSG"
  return "SSR"
}

function xepChienLuocNhieuTrang(danhSachTrang: [TanSuat, boolean, boolean][]): string[] {
  const ketQua: string[] = []
  for (const [tanSuat, seo, caNhanHoa] of danhSachTrang) {
    ketQua.push(chonChienLuocRender(tanSuat, seo, caNhanHoa))
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const CAC_TRANG: [TanSuat, boolean, boolean][] = [
  ["hiem-khi", true, false],
  ["lien-tuc", true, false],
  ["lien-tuc", false, true],
  ["thinh-thoang", true, false],
]
console.log(JSON.stringify(xepChienLuocNhieuTrang(CAC_TRANG)))`,
    },
    homework:
      'Chọn 3 trang bất kỳ trong một app bạn hay dùng (vd trang chủ, trang bài viết đã xuất bản, trang giỏ hàng/dashboard sau đăng nhập). Với mỗi trang, tự trả lời ba câu hỏi (tần suất đổi/cần SEO/cần cá nhân hoá) rồi áp luật ưu tiên vừa học để đoán chiến lược render — bạn nghĩ trang đó THẬT SỰ đang dùng chiến lược nào, và có khớp với luật không?',
    srsCards: [
      {
        hoi: 'SSG, SSR, CSR khác nhau ở THỜI ĐIỂM nào tạo ra HTML?',
        dap: 'SSG: lúc BUILD, một lần cho mọi người. SSR: MỖI LẦN CÓ REQUEST, trên server. CSR: server gửi HTML gần rỗng + JS, trình duyệt TỰ dựng nội dung.',
      },
      {
        hoi: 'Vì sao "cần SEO" không tự động nghĩa là "phải SSR"?',
        dap: 'SSG cũng tốt cho SEO (HTML có sẵn ngay từ đầu, máy quét đọc được) — SEO chỉ loại CSR khỏi lựa chọn. Trang ít đổi vẫn nên chọn SSG, không cần "lên SSR cho chắc".',
      },
      {
        hoi: 'Vì sao cần cá nhân hoá lại loại bỏ SSG ngay lập tức, bất kể tần suất đổi nội dung?',
        dap: 'SSG build MỘT bản HTML chung cho mọi người lúc build — không có khái niệm "một bản HTML" khi mỗi người dùng thấy nội dung khác nhau, nên buộc phải chọn SSR (nếu vẫn cần SEO) hoặc CSR (nếu không).',
      },
    ],
  },
  {
    id: 'p6-u115-l2',
    unitId: 'p6-u115',
    language: 'typescript',
    title: 'Luật phụ thuộc module — ranh giới kiến trúc chỉ có tác dụng khi máy chặn được',
    hook: 'Bạn vẽ sơ đồ kiến trúc đẹp: "feature không được import trực tiếp từ feature khác". Ba tháng sau, code review phát hiện feature-thanh-toán đang import thẳng một hàm nội bộ của feature-học-tập — không ai cố tình phá luật, chỉ là IDE tự gợi ý import và không ai để ý. Sơ đồ trên giấy không ngăn được việc đó; chỉ có LINT CHẶN CI mới ngăn được.',
    theory:
      'KIẾN TRÚC FEATURE-BASED tổ chức code THEO TÍNH NĂNG (feature-hoc-tap/, feature-thanh-toan/…) thay vì theo LOẠI FILE (components/, hooks/, utils/ gom chung mọi tính năng vào một chỗ). Lợi ích: mọi thứ của MỘT tính năng nằm gần nhau, xoá tính năng là xoá một thư mục, không phải lùng khắp nơi.\n\nNhưng gom theo tính năng chỉ có ích nếu có RANH GIỚI rõ — nếu feature nào cũng import thẳng vào feature khác, cuối cùng mọi thứ vẫn dính chặt vào nhau như cũ, chỉ là được sắp xếp gọn hơn bề ngoài.\n\nLUẬT PHỤ THUỘC MODULE (dependency rule) phổ biến trong kiến trúc feature-based có ba tầng:\n\n- **shared**: mã dùng chung thuần tuý (component UI cơ bản, hàm tiện ích) — KHÔNG phụ thuộc bất kỳ ai.\n- **core**: hạ tầng lõi của app (auth, gọi API, cấu hình) — chỉ được phép phụ thuộc shared.\n- **feature-***: một tính năng cụ thể — được phép phụ thuộc shared và core, nhưng KHÔNG được phụ thuộc feature khác (feature-hoc-tap không được import feature-thanh-toan và ngược lại).\n\nLuật này vẽ ra một hướng phụ thuộc MỘT CHIỀU: feature → core → shared, không bao giờ ngược lại, và không bao giờ đi ngang giữa hai feature. Khi hai feature THẬT SỰ cần chia sẻ logic, thay vì import chéo trực tiếp, giải pháp đúng là RÚT phần dùng chung đó LÊN shared hoặc core — tức sửa CẤU TRÚC, không phá luật.\n\nVẤN ĐỀ THẬT: luật này chỉ là ý định trên giấy cho tới khi có LINT RULE (vd `eslint-plugin-boundaries` hoặc quy tắc tương tự cấu hình cho ESLint) chặn NGAY LÚC BUILD/CI mỗi khi có import vi phạm — giống hệt luật thật của dự án DHCB này: CLAUDE.md ghi "`packages/` không import `apps/`", và luật đó được lint CHẶN THẬT chứ không chỉ ghi trong tài liệu. Không có cổng máy kiểm, ranh giới kiến trúc chỉ tồn tại cho tới lần đầu ai đó vô tình (hoặc cố tình, dưới áp lực deadline) import tắt.\n\nDESIGN SYSTEM (bộ thiết kế dùng chung — nút bấm, ô nhập, màu sắc, khoảng cách… đóng gói thành component + token, có tài liệu cách dùng) chính là một dạng của tầng **shared**: mọi feature dùng CÙNG một Button/Input thay vì mỗi feature tự vẽ lại theo ý mình, giữ giao diện nhất quán và tránh trùng lặp code UI.',
    workedExample: {
      code: `function kiemTraViPhamRanhGioi(
  tuModule: string,
  denModule: string,
  quyTacChoPhep: [string, string][]
): { hopLe: boolean; lyDo: string } {
  if (tuModule === denModule) {
    return { hopLe: true, lyDo: "cung mot module, khong tinh la import cheo" }
  }
  const coTrongDanhSach = quyTacChoPhep.some(([tu, den]) => tu === tuModule && den === denModule)
  if (coTrongDanhSach) {
    return { hopLe: true, lyDo: \`\${tuModule} -> \${denModule} nam trong danh sach cho phep\` }
  }
  return { hopLe: false, lyDo: \`\${tuModule} -> \${denModule} khong nam trong danh sach cho phep\` }
}

const QUY_TAC: [string, string][] = [
  ["feature-hoc-tap", "shared"],
  ["feature-hoc-tap", "core"],
  ["feature-thanh-toan", "shared"],
  ["feature-thanh-toan", "core"],
]

console.log(JSON.stringify(kiemTraViPhamRanhGioi("feature-hoc-tap", "shared", QUY_TAC)))
console.log(JSON.stringify(kiemTraViPhamRanhGioi("feature-hoc-tap", "feature-thanh-toan", QUY_TAC)))
console.log(JSON.stringify(kiemTraViPhamRanhGioi("core", "shared", QUY_TAC)))`,
      stdinLines: [],
    },
    predict: {
      code: `function kiemTraViPhamRanhGioi(tuModule: string, denModule: string, quyTacChoPhep: [string, string][]) {
  if (tuModule === denModule) return { hopLe: true, lyDo: "cung mot module" }
  const coTrongDanhSach = quyTacChoPhep.some(([tu, den]) => tu === tuModule && den === denModule)
  if (coTrongDanhSach) return { hopLe: true, lyDo: "trong danh sach cho phep" }
  return { hopLe: false, lyDo: "khong trong danh sach cho phep" }
}
const QUY_TAC: [string, string][] = [["feature-hoc-tap", "shared"]]
console.log(kiemTraViPhamRanhGioi("feature-thanh-toan", "feature-hoc-tap", QUY_TAC).hopLe)`,
      question:
        'quyTacChoPhep chỉ có đúng một cặp ["feature-hoc-tap", "shared"]. Gọi kiểm tra "feature-thanh-toan" import "feature-hoc-tap" — hopLe là gì?',
      choices: ['false', 'true', 'undefined', 'lỗi runtime'],
      answerIndex: 0,
      explain:
        'Kết quả là false. Cặp (feature-thanh-toan, feature-hoc-tap) KHÔNG khớp với cặp duy nhất trong quyTacChoPhep (feature-hoc-tap, shared) — thứ tự tuModule/denModule cũng phải khớp đúng chiều, không chỉ khớp tên. Bẫy hay nhầm: thấy "feature-hoc-tap" xuất hiện ở cả quy tắc lẫn lệnh gọi rồi tưởng là hợp lệ — nhưng trong quy tắc nó là ĐÍCH (shared import từ đó), còn trong lệnh gọi nó là ĐÍCH của feature-thanh-toan, hai vai trò khác hẳn nhau và cặp [tu, den] phải khớp NGUYÊN VẸN.',
    },
    parsons: {
      prompt: 'Xếp lại phần kiểm tra cặp import có nằm trong danh sách cho phép hay không.',
      lines: [
        'const coTrongDanhSach = quyTacChoPhep.some(([tu, den]) => tu === tuModule && den === denModule)',
        'if (coTrongDanhSach) {',
        '  return { hopLe: true, lyDo: "nam trong danh sach cho phep" }',
        '}',
        'return { hopLe: false, lyDo: "khong nam trong danh sach cho phep" }',
      ],
    },
    make: {
      prompt:
        'Viết hàm demSoViPham(cacLuotImport, quyTacChoPhep) đếm số lượt import VI PHẠM ranh giới trong một danh sách.\n\n- Dùng lại đúng kiemTraViPhamRanhGioi(tuModule, denModule, quyTacChoPhep) ở ví dụ mẫu (viết lại cả hàm).\n- cacLuotImport là mảng các cặp [tuModule, denModule] (kiểu [string, string][]) — mỗi cặp là MỘT lượt import thật tìm thấy trong code.\n- Với mỗi cặp, gọi kiemTraViPhamRanhGioi; nếu hopLe === false thì tăng biến đếm.\n- Trả về tổng số lượt VI PHẠM (number).',
      starterCode: `function kiemTraViPhamRanhGioi(
  tuModule: string,
  denModule: string,
  quyTacChoPhep: [string, string][]
): { hopLe: boolean; lyDo: string } {
  // TODO: cung mot module -> hopLe true; co trong quyTacChoPhep -> hopLe true; con lai -> hopLe false. lyDo la chuoi mo ta ngan.
  return { hopLe: false, lyDo: "" }
}

function demSoViPham(
  cacLuotImport: [string, string][],
  quyTacChoPhep: [string, string][]
): number {
  // TODO: dem so cap co hopLe === false
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const QUY_TAC: [string, string][] = [
  ["feature-hoc-tap", "shared"],
  ["feature-hoc-tap", "core"],
  ["feature-thanh-toan", "shared"],
  ["feature-thanh-toan", "core"],
]
const CAC_LUOT_IMPORT: [string, string][] = [
  ["feature-hoc-tap", "shared"],
  ["feature-hoc-tap", "feature-thanh-toan"],
  ["feature-thanh-toan", "core"],
  ["core", "shared"],
]
console.log(demSoViPham(CAC_LUOT_IMPORT, QUY_TAC))
console.log(JSON.stringify(kiemTraViPhamRanhGioi("feature-hoc-tap", "feature-thanh-toan", QUY_TAC)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '2',
          match: 'contains',
          hidden: false,
          label:
            'Bốn lượt import, đúng 2 vi phạm: feature-hoc-tap→feature-thanh-toan và core→shared (đảo chiều luật)',
        },
        {
          stdinLines: [],
          expected: '"hopLe":false',
          match: 'contains',
          hidden: false,
          label: 'Import chéo giữa hai feature luôn bị đánh dấu không hợp lệ',
        },
        {
          stdinLines: [],
          expected: '2',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: kiểm lại đúng số đếm 2, không hardcode kết quả cuối mà phải tính qua vòng lặp thật',
        },
      ],
      hints: [
        'kiemTraViPhamRanhGioi: kiểm tuModule === denModule trước (cùng module luôn hợp lệ), rồi mới dùng .some() dò trong quyTacChoPhep, còn lại là false.',
        'demSoViPham: dùng vòng lặp for...of qua cacLuotImport, mỗi phần tử const [tu, den] = cap, gọi kiemTraViPhamRanhGioi(tu, den, quyTacChoPhep) rồi kiểm .hopLe === false để tăng biến đếm.',
        '"core -> shared" KHÔNG nằm trong QUY_TAC (chỉ có feature-* -> shared/core, không có core -> shared) nên đây cũng là một vi phạm, dù nghe có vẻ "hợp lý".',
      ],
      sampleSolution: `function kiemTraViPhamRanhGioi(
  tuModule: string,
  denModule: string,
  quyTacChoPhep: [string, string][]
): { hopLe: boolean; lyDo: string } {
  if (tuModule === denModule) {
    return { hopLe: true, lyDo: "cung mot module, khong tinh la import cheo" }
  }
  const coTrongDanhSach = quyTacChoPhep.some(([tu, den]) => tu === tuModule && den === denModule)
  if (coTrongDanhSach) {
    return { hopLe: true, lyDo: \`\${tuModule} -> \${denModule} nam trong danh sach cho phep\` }
  }
  return { hopLe: false, lyDo: \`\${tuModule} -> \${denModule} khong nam trong danh sach cho phep\` }
}

function demSoViPham(
  cacLuotImport: [string, string][],
  quyTacChoPhep: [string, string][]
): number {
  let soViPham = 0
  for (const [tu, den] of cacLuotImport) {
    if (!kiemTraViPhamRanhGioi(tu, den, quyTacChoPhep).hopLe) {
      soViPham++
    }
  }
  return soViPham
}

// ---- Đừng sửa phần dưới đây ----
const QUY_TAC: [string, string][] = [
  ["feature-hoc-tap", "shared"],
  ["feature-hoc-tap", "core"],
  ["feature-thanh-toan", "shared"],
  ["feature-thanh-toan", "core"],
]
const CAC_LUOT_IMPORT: [string, string][] = [
  ["feature-hoc-tap", "shared"],
  ["feature-hoc-tap", "feature-thanh-toan"],
  ["feature-thanh-toan", "core"],
  ["core", "shared"],
]
console.log(demSoViPham(CAC_LUOT_IMPORT, QUY_TAC))
console.log(JSON.stringify(kiemTraViPhamRanhGioi("feature-hoc-tap", "feature-thanh-toan", QUY_TAC)))`,
    },
    homework:
      'Đọc mục 6 của CLAUDE.md dự án này ("packages/ không import apps/ và không import api/") và tìm file cấu hình ESLint thật đang chặn luật đó (gợi ý: tìm `boundaries` hoặc luật import trong `.eslintrc.cjs`/`eslint.config`). Viết 2-3 câu: nếu luật đó CHỈ nằm trong CLAUDE.md mà không có lint chặn CI, theo bạn sau bao lâu thì có PR đầu tiên vô tình vi phạm nó — và vì sao.',
    srsCards: [
      {
        hoi: 'Ba tầng của luật phụ thuộc module feature-based là gì, và hướng phụ thuộc đi như thế nào?',
        dap: 'shared (không phụ thuộc ai) → core (chỉ phụ thuộc shared) → feature-* (phụ thuộc shared/core, KHÔNG được phụ thuộc feature khác). Một chiều, không bao giờ đi ngược hay đi ngang giữa hai feature.',
      },
      {
        hoi: 'Hai feature thật sự cần chia sẻ logic thì làm sao, thay vì import chéo trực tiếp?',
        dap: 'Rút phần dùng chung đó LÊN shared hoặc core — sửa CẤU TRÚC (tạo một chỗ chung mới), không phá luật phụ thuộc bằng cách import tắt giữa hai feature.',
      },
      {
        hoi: 'Vì sao "vẽ sơ đồ kiến trúc đẹp trên giấy" không đủ để giữ ranh giới module?',
        dap: 'Không có cổng máy kiểm (lint chặn CI), ranh giới chỉ là ý định — tồn tại cho tới lần đầu ai đó (vô tình do IDE gợi ý import, hoặc cố tình dưới áp lực deadline) import tắt mà không ai phát hiện ngay.',
      },
    ],
  },
]
