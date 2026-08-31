// lessons/p6u114.ts — P6-U114: HƯỚNG WEB, chặng S3 — Hiệu năng web đo bằng số (module
// `web-s3-m1`).
//
// Hai bài: l1 PHÂN LOẠI CORE WEB VITALS theo đúng ba ngưỡng chuẩn ngành (tốt/cần cải
// thiện/kém cho LCP, INP, CLS — CHÍNH LÀ ngưỡng dự án DHCB đặt trong CLAUDE.md); l2 NGÂN
// SÁCH BUNDLE chặn CI — số liệu thật của dự án này (Initial JS 140kB, CSS 18kB, xem
// `npm run budget`) làm ví dụ, không phải số bịa.
//
// Mọi giá trị số đã chạy thật qua tsc --strict + node trước khi soạn, không suy đoán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U114_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u114-l1',
    unitId: 'p6-u114',
    language: 'typescript',
    title: 'Core Web Vitals — "trang chậm" không phải cảm giác, là ba con số có ngưỡng',
    hook: 'Sếp bảo "trang chậm lắm, sửa đi". Bạn hỏi lại: chậm ở đâu — tải lần đầu, bấm nút không phản hồi, hay chữ nhảy lung tung khi cuộn? Không có số đo, "chậm" là một cảm giác không ai sửa được. Google đo trải nghiệm thật bằng ba con số CÓ NGƯỠNG RÕ RÀNG — và ba ngưỡng đó ảnh hưởng trực tiếp thứ hạng tìm kiếm của trang bạn.',
    theory:
      'CORE WEB VITALS (CWV) là ba chỉ số Google dùng để đo TRẢI NGHIỆM THẬT của người dùng, mỗi chỉ số có 3 mức: TỐT, CẦN CẢI THIỆN, KÉM — không phải một con số mơ hồ.\n\n- **LCP (Largest Contentful Paint)** — thời gian tới khi phần tử LỚN NHẤT trên màn hình (thường là ảnh hero hoặc khối chữ chính) hiển thị xong. Đo "trang có VẼ XONG cho người dùng thấy nội dung chính chưa". Ngưỡng: ≤2.5s tốt, ≤4s cần cải thiện, >4s kém.\n- **INP (Interaction to Next Paint)** — thời gian từ lúc người dùng TƯƠNG TÁC (bấm, gõ) tới lúc trình duyệt VẼ LẠI phản hồi. Đo "bấm nút có phản hồi ngay không" — đây chính là chỉ số bị Event Loop bị chặn (đã học ở `web-s1`) làm hỏng. Ngưỡng: ≤200ms tốt, ≤500ms cần cải thiện, >500ms kém.\n- **CLS (Cumulative Layout Shift)** — tổng mức DỊCH CHUYỂN BỐ CỤC ngoài ý muốn (ảnh tải xong đẩy chữ xuống, quảng cáo chèn vào giữa đoạn đang đọc). Đo bằng một điểm số không đơn vị (0 = không dịch chuyển gì). Ngưỡng: ≤0.1 tốt, ≤0.25 cần cải thiện, >0.25 kém.\n\nDự án DHCB (chính app bạn đang học) đặt ngân sách ba chỉ số này TRONG CLAUDE.md: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 — tức mục tiêu là mức TỐT ở cả ba, không chỉ "chấp nhận được".\n\nMỘT LỖI HAY GẶP: nhầm ranh giới ngưỡng là "nhỏ hơn" thay vì "nhỏ hơn hoặc bằng". LCP đúng 2.5 giây vẫn là TỐT, 2.501 giây mới rớt xuống "cần cải thiện" — sai lệch một chữ số thập phân trong code chấm điểm sẽ báo sai hạng cho đúng những trang đang ở SÁT ranh giới, dễ gây tranh cãi vô ích khi review hiệu năng.',
    workedExample: {
      code: `type LoaiCWV = "LCP" | "INP" | "CLS"

function phanLoaiCoreWebVital(loai: LoaiCWV, giaTri: number): string {
  if (loai === "LCP") {
    if (giaTri <= 2.5) return "tot"
    if (giaTri <= 4) return "can-cai-thien"
    return "kem"
  }
  if (loai === "INP") {
    if (giaTri <= 200) return "tot"
    if (giaTri <= 500) return "can-cai-thien"
    return "kem"
  }
  // CLS
  if (giaTri <= 0.1) return "tot"
  if (giaTri <= 0.25) return "can-cai-thien"
  return "kem"
}

console.log(phanLoaiCoreWebVital("LCP", 2.5))  // dung nguong -> van TOT
console.log(phanLoaiCoreWebVital("LCP", 3.0))  // -> can cai thien
console.log(phanLoaiCoreWebVital("LCP", 5.0))  // -> kem
console.log(phanLoaiCoreWebVital("INP", 150))  // -> tot
console.log(phanLoaiCoreWebVital("CLS", 0.3))  // -> kem`,
      stdinLines: [],
    },
    predict: {
      code: `type LoaiCWV = "LCP" | "INP" | "CLS"

function phanLoaiCoreWebVital(loai: LoaiCWV, giaTri: number): string {
  if (loai === "LCP") {
    if (giaTri <= 2.5) return "tot"
    if (giaTri <= 4) return "can-cai-thien"
    return "kem"
  }
  if (loai === "INP") {
    if (giaTri <= 200) return "tot"
    if (giaTri <= 500) return "can-cai-thien"
    return "kem"
  }
  if (giaTri <= 0.1) return "tot"
  if (giaTri <= 0.25) return "can-cai-thien"
  return "kem"
}

console.log(phanLoaiCoreWebVital("INP", 200))`,
      question: 'INP đo được ĐÚNG BẰNG 200ms (ngưỡng tối đa của mức tốt). Hàm trả về gì?',
      choices: ['tot', 'can-cai-thien', 'kem', 'undefined'],
      answerIndex: 0,
      explain:
        'Kết quả là "tot". Điều kiện `giaTri <= 200` dùng TOÁN TỬ NHỎ HƠN HOẶC BẰNG, nên giá trị đúng bằng ngưỡng vẫn thoả điều kiện và được xếp mức tốt. Đây là bẫy hay nhầm: nếu code lỡ viết `giaTri < 200` (thiếu dấu bằng), đúng giá trị NGƯỠNG CHUẨN theo tài liệu Google lại bị xếp sai xuống "cần cải thiện" — một lỗi một-ký-tự nhưng đổi kết quả chấm điểm của đúng những trang đạt sát ngưỡng.',
    },
    parsons: {
      prompt: 'Xếp lại nhánh phân loại LCP — nhớ kiểm từ ngưỡng THẤP nhất (tốt) lên cao dần.',
      lines: [
        'if (loai === "LCP") {',
        '  if (giaTri <= 2.5) return "tot"',
        '  if (giaTri <= 4) return "can-cai-thien"',
        '  return "kem"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm phanLoaiBaoCao(danhSachDo) chấm điểm một loạt phép đo Core Web Vitals.\n\n- Dùng lại đúng luật của phanLoaiCoreWebVital(loai, giaTri) ở ví dụ mẫu (viết lại cả hàm, ba ngưỡng LCP/INP/CLS).\n- danhSachDo là mảng các cặp [loai, giaTri] (kiểu [LoaiCWV, number][]).\n- Với mỗi cặp, gọi phanLoaiCoreWebVital rồi đẩy kết quả (string) vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `type LoaiCWV = "LCP" | "INP" | "CLS"

function phanLoaiCoreWebVital(loai: LoaiCWV, giaTri: number): string {
  // TODO: LCP <=2.5 tot/<=4 can-cai-thien/con lai kem; INP <=200/<=500 tuong tu; CLS <=0.1/<=0.25 tuong tu
  return ""
}

function phanLoaiBaoCao(danhSachDo: [LoaiCWV, number][]): string[] {
  // TODO: voi moi cap [loai, giaTri], goi phanLoaiCoreWebVital va gom ket qua theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const BAO_CAO: [LoaiCWV, number][] = [
  ["LCP", 2.5],
  ["LCP", 5.0],
  ["INP", 150],
  ["INP", 200],
  ["CLS", 0.3],
]
console.log(JSON.stringify(phanLoaiBaoCao(BAO_CAO)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '["tot","kem","tot","tot","kem"]',
          match: 'contains',
          hidden: false,
          label:
            'Năm phép đo phân loại đúng, gồm cả hai ca ĐÚNG NGƯỠNG (LCP 2.5, INP 200) đều là "tot"',
        },
        {
          stdinLines: [],
          expected: '"kem"',
          match: 'contains',
          hidden: false,
          label: 'CLS 0.3 vượt ngưỡng 0.25 → kem',
        },
        {
          stdinLines: [],
          expected: '["tot","kem","tot","tot","kem"]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kiểm cả mảng đầy đủ khớp thứ tự — không hardcode một phần tử riêng lẻ',
        },
      ],
      hints: [
        'Bên trong phanLoaiCoreWebVital: dùng <= (nhỏ hơn HOẶC BẰNG) ở mọi so sánh ngưỡng — đúng bằng ngưỡng vẫn tính là mức tốt hơn.',
        'Ba nhóm ngưỡng độc lập theo `loai`: kiểm loai === "LCP" trước, rồi "INP", còn lại mặc định là CLS.',
        'phanLoaiBaoCao: dùng vòng lặp, mỗi phần tử là const [loai, giaTri] = cap, rồi push phanLoaiCoreWebVital(loai, giaTri).',
      ],
      sampleSolution: `type LoaiCWV = "LCP" | "INP" | "CLS"

function phanLoaiCoreWebVital(loai: LoaiCWV, giaTri: number): string {
  if (loai === "LCP") {
    if (giaTri <= 2.5) return "tot"
    if (giaTri <= 4) return "can-cai-thien"
    return "kem"
  }
  if (loai === "INP") {
    if (giaTri <= 200) return "tot"
    if (giaTri <= 500) return "can-cai-thien"
    return "kem"
  }
  if (giaTri <= 0.1) return "tot"
  if (giaTri <= 0.25) return "can-cai-thien"
  return "kem"
}

function phanLoaiBaoCao(danhSachDo: [LoaiCWV, number][]): string[] {
  const ketQua: string[] = []
  for (const [loai, giaTri] of danhSachDo) {
    ketQua.push(phanLoaiCoreWebVital(loai, giaTri))
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const BAO_CAO: [LoaiCWV, number][] = [
  ["LCP", 2.5],
  ["LCP", 5.0],
  ["INP", 150],
  ["INP", 200],
  ["CLS", 0.3],
]
console.log(JSON.stringify(phanLoaiBaoCao(BAO_CAO)))`,
    },
    homework:
      'Mở PageSpeed Insights (pagespeed.web.dev) hoặc tab Lighthouse trong DevTools, chạy trên một trang web thật bạn hay dùng. Ghi lại ba số LCP/INP/CLS và tự phân loại theo đúng ngưỡng vừa học — trang đó đạt "tốt" ở mấy trong ba chỉ số?',
    srsCards: [
      {
        hoi: 'Ba chỉ số Core Web Vitals đo gì, mỗi cái một câu?',
        dap: 'LCP: trang vẽ xong nội dung CHÍNH mất bao lâu. INP: bấm/gõ xong tới lúc trình duyệt VẼ LẠI phản hồi mất bao lâu. CLS: bố cục DỊCH CHUYỂN ngoài ý muốn nhiều hay ít.',
      },
      {
        hoi: 'Ba ngưỡng "tốt" của LCP, INP, CLS là bao nhiêu?',
        dap: 'LCP ≤ 2.5 giây, INP ≤ 200 mili-giây, CLS ≤ 0.1 điểm — đây cũng đúng là ngân sách dự án DHCB đặt trong CLAUDE.md.',
      },
      {
        hoi: 'Vì sao dùng <= (nhỏ hơn hoặc bằng) chứ không phải < khi so ngưỡng CWV?',
        dap: 'Giá trị ĐÚNG BẰNG ngưỡng chuẩn vẫn được tính là đạt mức đó (ví dụ INP đúng 200ms vẫn là "tốt"). Dùng < sẽ xếp sai xuống mức thấp hơn cho đúng những phép đo nằm sát ranh giới nhất — dễ gây tranh cãi khi review.',
      },
    ],
  },
  {
    id: 'p6-u114-l2',
    unitId: 'p6-u114',
    language: 'typescript',
    title: 'Ngân sách bundle chặn CI — đừng để trang "phình dần" mà không ai nhận ra',
    hook: 'Mỗi PR chỉ thêm vài KB — một icon, một thư viện tiện dụng, một dòng CSS. Không ai nhận ra CHỈ MỘT PR nào đó làm trang chậm hẳn đi. Nhưng cộng dồn 100 PR như vậy trong một năm, trang từ 80KB phình lên 300KB mà không có PR nào "đáng bị đổ lỗi" — vì mỗi cái chỉ thêm một chút. Đây chính là lý do NGÂN SÁCH BUNDLE phải được máy kiểm tra, không phải con người nhớ.',
    theory:
      'NGÂN SÁCH BUNDLE (bundle budget) là một GIỚI HẠN CỨNG về kích thước file JavaScript/CSS gửi cho trình duyệt, được CI TỰ ĐỘNG CHẶN nếu build vượt quá — không chờ con người phát hiện bằng cảm giác "hình như chậm hơn trước".\n\nDự án DHCB (chính app này) có ngân sách thật, chạy bằng `npm run budget` (`scripts/check-budget-margin.ts`): Initial JS (script tải ngay khi mở trang, đã nén brotli) ≤ 140KB, Initial CSS ≤ 18KB — xem CLAUDE.md mục "Nợ kỹ thuật" để biết biên độ hiện tại.\n\nBa kỹ thuật chính để ở TRONG ngân sách khi tính năng cứ tăng dần:\n\n- **CHIA BUNDLE (code splitting)**: tách JavaScript của một TRANG/TÍNH NĂNG riêng thành file riêng, chỉ tải khi người dùng THẬT SỰ vào trang/tính năng đó — không nhét hết vào MỘT file tải ngay từ đầu.\n- **TẢI LƯỜI (lazy load)**: trì hoãn tải một phần tài nguyên (ảnh dưới màn hình đầu tiên, component ít dùng) tới khi CẦN tới, thay vì tải hết ngay khi mở trang.\n- **ẢNH ĐÚNG ĐỊNH DẠNG/KÍCH THƯỚC**: dùng định dạng nén tốt (WebP/AVIF thay JPEG/PNG khi phù hợp) và đúng kích thước hiển thị thật (ảnh 4000px hiển thị ở khung 200px là lãng phí băng thông thuần tuý).\n\nCÁI GIÁ CỦA VIỆC KHÔNG CÓ NGÂN SÁCH TỰ ĐỘNG: mỗi PR trông "vô hại" — ai cũng thêm một thư viện nhỏ, một icon set tiện dùng. Không có cổng chặn, tổng kích thước TRƯỜN DẦN qua nhiều tháng mà không PR đơn lẻ nào "đáng bị chặn" nếu xét riêng — CHỈ khi có một NGƯỠNG CỐ ĐỊNH, PR nào đẩy tổng vượt ngưỡng mới bị chặn đúng lúc, dù bản thân PR đó chỉ thêm một phần rất nhỏ.',
    workedExample: {
      code: `function kiemTraNganSachBundle(kichThuocKB: number, nganSachKB: number): { datNganSach: boolean; conLaiKB: number } {
  const conLai = Math.round((nganSachKB - kichThuocKB) * 100) / 100
  return { datNganSach: kichThuocKB <= nganSachKB, conLaiKB: conLai }
}

// So voi ngan sach that cua du an nay: Initial JS <= 140KB
console.log(JSON.stringify(kiemTraNganSachBundle(127.36, 140))) // dang dat, con du
console.log(JSON.stringify(kiemTraNganSachBundle(145, 140)))    // vuot ngan sach -> CI phai chan`,
      stdinLines: [],
    },
    predict: {
      code: `function kiemTraNganSachBundle(kichThuocKB: number, nganSachKB: number): { datNganSach: boolean; conLaiKB: number } {
  const conLai = Math.round((nganSachKB - kichThuocKB) * 100) / 100
  return { datNganSach: kichThuocKB <= nganSachKB, conLaiKB: conLai }
}

console.log(JSON.stringify(kiemTraNganSachBundle(140, 140)))`,
      question: 'Bundle nặng ĐÚNG BẰNG ngân sách (140KB / 140KB). Kết quả datNganSach là gì?',
      choices: ['true', 'false', 'undefined', 'lỗi runtime'],
      answerIndex: 0,
      explain:
        'Kết quả là true. Điều kiện `kichThuocKB <= nganSachKB` dùng nhỏ hơn HOẶC BẰNG, nên đúng bằng ngân sách vẫn được tính là ĐẠT (còn lại 0KB, không phải âm). Nếu code lỡ dùng `<` (thiếu dấu bằng), một build đúng khít ngân sách — vốn hợp lệ — sẽ bị CI chặn nhầm dù không hề vượt quá.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm kiểm ngân sách bundle — tính phần còn lại trước, rồi mới xét đạt hay không.',
      lines: [
        'function kiemTraNganSachBundle(kichThuocKB, nganSachKB) {',
        '  const conLai = Math.round((nganSachKB - kichThuocKB) * 100) / 100',
        '  return { datNganSach: kichThuocKB <= nganSachKB, conLaiKB: conLai }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm chamNhieuBundle(danhSachBundle, nganSachKB) chấm một loạt bundle theo CÙNG một ngân sách.\n\n- Dùng lại đúng kiemTraNganSachBundle(kichThuocKB, nganSachKB) ở ví dụ mẫu (viết lại cả hàm).\n- danhSachBundle là mảng số (number[], kích thước từng bundle tính bằng KB).\n- Với mỗi kích thước, gọi kiemTraNganSachBundle(kichThuoc, nganSachKB) rồi đẩy CHỈ RIÊNG trường datNganSach (boolean) vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `function kiemTraNganSachBundle(kichThuocKB: number, nganSachKB: number): { datNganSach: boolean; conLaiKB: number } {
  // TODO: conLai = lam tron 2 chu so (nganSachKB - kichThuocKB); datNganSach = kichThuocKB <= nganSachKB
  return { datNganSach: false, conLaiKB: 0 }
}

function chamNhieuBundle(danhSachBundle: number[], nganSachKB: number): boolean[] {
  // TODO: voi moi kich thuoc, goi kiemTraNganSachBundle va lay truong datNganSach, gom theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const CAC_BUNDLE = [127.36, 140, 145, 90]
console.log(JSON.stringify(chamNhieuBundle(CAC_BUNDLE, 140)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '[true,true,false,true]',
          match: 'contains',
          hidden: false,
          label: 'Bốn bundle chấm đúng theo ngân sách 140KB — đúng bằng ngân sách (140) vẫn ĐẠT',
        },
        {
          stdinLines: [],
          expected: 'false',
          match: 'contains',
          hidden: false,
          label: '145KB vượt ngân sách 140KB → không đạt',
        },
        {
          stdinLines: [],
          expected: '[true,true,false,true]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kiểm cả mảng đầy đủ khớp thứ tự — không hardcode một phần tử riêng lẻ',
        },
      ],
      hints: [
        'kiemTraNganSachBundle: conLai làm tròn 2 chữ số bằng Math.round((nganSachKB - kichThuocKB) * 100) / 100; datNganSach dùng <= (không phải <).',
        'chamNhieuBundle: dùng vòng lặp, mỗi phần tử gọi kiemTraNganSachBundle(kichThuoc, nganSachKB) rồi push kết quả.datNganSach (chỉ lấy đúng trường boolean, không push cả object).',
      ],
      sampleSolution: `function kiemTraNganSachBundle(kichThuocKB: number, nganSachKB: number): { datNganSach: boolean; conLaiKB: number } {
  const conLai = Math.round((nganSachKB - kichThuocKB) * 100) / 100
  return { datNganSach: kichThuocKB <= nganSachKB, conLaiKB: conLai }
}

function chamNhieuBundle(danhSachBundle: number[], nganSachKB: number): boolean[] {
  const ketQua: boolean[] = []
  for (const kichThuoc of danhSachBundle) {
    ketQua.push(kiemTraNganSachBundle(kichThuoc, nganSachKB).datNganSach)
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const CAC_BUNDLE = [127.36, 140, 145, 90]
console.log(JSON.stringify(chamNhieuBundle(CAC_BUNDLE, 140)))`,
    },
    homework:
      'Chạy `npm run budget` trong repo dự án này (cần `dist/` — chạy `npm run build` trước nếu chưa có). Đọc số Initial JS/CSS hiện tại và biên độ còn lại. Nếu bạn thêm một thư viện mới ~15KB (đã nén), biên độ còn lại có đủ không? Nếu không đủ, bạn sẽ áp dụng kỹ thuật nào trong ba kỹ thuật đã học (chia bundle / tải lười / ảnh đúng định dạng) để bù lại?',
    srsCards: [
      {
        hoi: 'Vì sao ngân sách bundle cần CI TỰ ĐỘNG chặn, không đủ nếu chỉ dựa vào con người nhớ kiểm tra?',
        dap: 'Mỗi PR chỉ thêm một lượng nhỏ, trông "vô hại" khi xét riêng — không PR nào tự thấy mình đáng bị chặn. Chỉ một NGƯỠNG CỐ ĐỊNH do máy kiểm mới chặn đúng lúc tổng kích thước vượt giới hạn, dù phần đóng góp của từng PR rất nhỏ.',
      },
      {
        hoi: 'Ba kỹ thuật chính giữ bundle trong ngân sách khi tính năng vẫn tăng dần?',
        dap: 'Chia bundle theo trang/tính năng (chỉ tải khi cần); tải lười tài nguyên chưa cần ngay; dùng ảnh đúng định dạng nén tốt và đúng kích thước hiển thị thật.',
      },
      {
        hoi: 'Ngân sách Initial JS/CSS của chính dự án DHCB là bao nhiêu, và lệnh nào để xem biên độ hiện tại?',
        dap: 'Initial JS ≤ 140KB, Initial CSS ≤ 18KB (đã nén brotli) — xem bằng `npm run budget` (cần `dist/` đã build).',
      },
    ],
  },
]
