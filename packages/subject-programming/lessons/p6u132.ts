// lessons/p6u132.ts — P6-U132: HƯỚNG DI ĐỘNG, chặng S1 — Giao diện khai báo
// (module `mobile-s1-m2`).
//
// Hai bài, hai nửa của cùng một ý: (1) UI là HÀM THUẦN của state — đổi state rồi vẽ lại, chứ
// không đi sửa tay từng widget; (2) nhưng "vẽ lại" 10.000 dòng thì máy điện thoại chết, nên
// danh sách dài phải ẢO HOÁ — chỉ dựng đúng phần đang lọt vào khung nhìn.
//
// Làn `typescript` (xem lý do đã ghi ở đầu `p6u131.ts`): cả hai nguyên lý đều là phép tính
// thuần, đúng như nhau ở Compose, SwiftUI và React Native — nên kiểm chứng được bằng test mà
// không cần dựng bộ dựng giao diện thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U132_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u132-l1',
    unitId: 'p6-u132',
    language: 'typescript',
    title: 'UI là hàm của state — bốn trạng thái màn hình, không phải một',
    hook: 'Màn hình danh sách chi tiêu của bạn chạy ngon lúc test. Đến máy người dùng: mạng chậm hai giây thì màn trắng trơn, mạng lỗi thì màn trắng trơn, tài khoản mới chưa có khoản nào thì cũng màn trắng trơn. Ba nguyên nhân hoàn toàn khác nhau, một kết quả giống hệt nhau — vì code chỉ nghĩ tới đúng MỘT trạng thái: lúc có dữ liệu.',
    theory:
      'Giao diện KHAI BÁO (declarative UI — Jetpack Compose, SwiftUI, JSX của React Native) đặt lại toàn bộ cách nghĩ so với kiểu cũ. Kiểu cũ (mệnh lệnh) là: tìm widget, gọi lệnh sửa nó — `nutLuu.setEnabled(false)`, `nhan.setText("...")`. Vấn đề của kiểu đó không phải dài dòng, mà là MÀN HÌNH VÀ DỮ LIỆU DẦN LỆCH NHAU: quên một lệnh sửa ở một nhánh nào đó là màn hình hiển thị một thứ mà dữ liệu bên dưới nói thứ khác.\n\nKiểu khai báo phát biểu một luật đơn giản:\n\n    giao diện = f(trạng thái)\n\nBạn viết một HÀM nhận trạng thái và mô tả màn hình PHẢI trông như thế nào. Muốn đổi màn hình thì đổi trạng thái, rồi để thư viện tự gọi lại hàm đó. Bạn không bao giờ đi sửa widget bằng tay nữa, nên không còn chỗ để lệch.\n\nHệ quả kỷ luật quan trọng nhất: hàm vẽ phải THUẦN — cùng một trạng thái luôn cho ra cùng một màn hình, và bản thân hàm không được gọi mạng, không ghi cơ sở dữ liệu, không đổi biến bên ngoài. Lý do rất thực dụng: thư viện có quyền gọi lại hàm vẽ NHIỀU LẦN cho một lần đổi trạng thái (khi xoay máy, khi bố cục tính lại). Nếu hàm vẽ gọi mạng, một lần đổi trạng thái có thể thành mười lượt gọi API.\n\nVÀ ĐÂY LÀ PHẦN ĐẮT GIÁ NHẤT: một màn hình lấy dữ liệu từ xa không có một trạng thái, nó có BỐN, và phải xử lý cả bốn theo thứ tự ưu tiên rõ ràng:\n\n1. **Đang tải** — đã bắt đầu lấy dữ liệu, chưa có kết quả. Phải cho người dùng thấy có gì đó đang chạy.\n2. **Lỗi** — lấy thất bại. Phải nói lỗi gì và cho cách thử lại.\n3. **Rỗng** — lấy thành công nhưng không có dữ liệu nào. Khác hẳn lỗi: đây là trạng thái BÌNH THƯỜNG của tài khoản mới, và nên là chỗ hướng dẫn người dùng tạo mục đầu tiên.\n4. **Có dữ liệu** — trường hợp mà ai cũng nhớ viết.\n\nThứ tự ưu tiên phải cố định và kiểm được: đang tải thắng tất cả (vì lỗi cũ của lần trước không được che mất việc đang tải lại), lỗi thắng rỗng (vì "không có gì" khi thực ra là "hỏng" là một lời nói dối với người dùng). Viết đúng thứ tự này một lần trong hàm vẽ là xong; rải điều kiện khắp nơi thì mỗi màn hình sẽ lệch một kiểu.',
    workedExample: {
      code: `interface TrangThaiMan {
  dangTai: boolean
  loi: string | null
  muc: string[]
}

// Ham VE: thuan tuy, khong goi mang, khong ghi gi. Cung state -> cung ket qua.
function ve(s: TrangThaiMan): string {
  if (s.dangTai) return "DANG TAI"                       // uu tien 1: dang tai thang tat ca
  if (s.loi !== null) return "LOI: " + s.loi              // uu tien 2: loi thang rong
  if (s.muc.length === 0) return "TRONG"                  // uu tien 3: rong la trang thai BINH THUONG
  return "DANH SACH(" + s.muc.length + "): " + s.muc.join(", ")
}

console.log(ve({ dangTai: true, loi: "mat mang", muc: ["Ca phe"] }))
console.log(ve({ dangTai: false, loi: "mat mang", muc: ["Ca phe"] }))
console.log(ve({ dangTai: false, loi: null, muc: [] }))
console.log(ve({ dangTai: false, loi: null, muc: ["Ca phe", "Xe bus"] }))`,
      stdinLines: [],
    },
    predict: {
      code: `interface TrangThaiMan {
  dangTai: boolean
  loi: string | null
  muc: string[]
}
function ve(s: TrangThaiMan): string {
  if (s.dangTai) return "DANG TAI"
  if (s.loi !== null) return "LOI: " + s.loi
  if (s.muc.length === 0) return "TRONG"
  return "DANH SACH(" + s.muc.length + "): " + s.muc.join(", ")
}
console.log(ve({ dangTai: true, loi: "het phien", muc: [] }))`,
      question:
        'State vừa đang tải, vừa có lỗi cũ, vừa rỗng. Hàm vẽ in ra gì, và vì sao chỉ một thứ?',
      choices: ['DANG TAI', 'LOI: het phien', 'TRONG', 'DANH SACH(0): '],
      answerIndex: 0,
      explain:
        'Ba điều kiện cùng đúng, nhưng hàm vẽ trả về ngay ở nhánh ĐẦU TIÊN khớp — nên thứ tự các câu if CHÍNH LÀ thứ tự ưu tiên, không phải chuyện sắp xếp cho đẹp. Đặt "đang tải" lên đầu để lỗi của lần lấy trước không che mất việc app đang thử lại; đặt "lỗi" trước "rỗng" để không nói dối người dùng rằng họ chưa có dữ liệu trong khi thật ra là hỏng.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm vẽ theo đúng thứ tự ưu tiên bốn trạng thái: đang tải → lỗi → rỗng → có dữ liệu.',
      lines: [
        'function ve(s: TrangThaiMan): string {',
        '  if (s.dangTai) return "DANG TAI"',
        '  if (s.loi !== null) return "LOI: " + s.loi',
        '  if (s.muc.length === 0) return "TRONG"',
        '  return "DANH SACH(" + s.muc.length + "): " + s.muc.join(", ")',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm ve(s) mô tả màn hình danh sách chi tiêu từ trạng thái, đúng bốn nhánh theo thứ tự ưu tiên:\n\n1. s.dangTai là true → trả về đúng chuỗi "DANG TAI".\n2. s.loi khác null → trả về "LOI: " nối với nội dung lỗi.\n3. s.muc rỗng → trả về đúng chuỗi "TRONG".\n4. Còn lại → trả về "DANH SACH(N): " nối các mục cách nhau bằng dấu phẩy và một khoảng trắng (N là số mục).\n\nHàm phải THUẦN: không sửa gì trong s, không dùng biến ngoài. Dùng starter code có sẵn (đừng sửa phần dưới).',
      starterCode: `interface TrangThaiMan {
  dangTai: boolean
  loi: string | null
  muc: string[]
}

function ve(s: TrangThaiMan): string {
  // TODO: bon nhanh theo dung thu tu uu tien
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log("Ca 1:", ve({ dangTai: true, loi: "mat mang", muc: ["Ca phe"] }))
console.log("Ca 2:", ve({ dangTai: false, loi: "mat mang", muc: ["Ca phe"] }))
console.log("Ca 3:", ve({ dangTai: false, loi: null, muc: [] }))
console.log("Ca 4:", ve({ dangTai: false, loi: null, muc: ["Ca phe", "Xe bus"] }))
const giuNguyen = { dangTai: false, loi: null, muc: ["Com trua"] }
console.log("Thuan:", ve(giuNguyen) === ve(giuNguyen) ? "co" : "khong")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ca 1: DANG TAI',
          match: 'contains',
          hidden: false,
          label: 'Đang tải thắng cả lỗi lẫn dữ liệu cũ',
        },
        {
          stdinLines: [],
          expected: 'Ca 2: LOI: mat mang',
          match: 'contains',
          hidden: false,
          label: 'Có lỗi thì báo lỗi, không im lặng hiện danh sách cũ',
        },
        {
          stdinLines: [],
          expected: 'Ca 3: TRONG',
          match: 'contains',
          hidden: false,
          label: 'Rỗng là trạng thái riêng, không phải lỗi',
        },
        {
          stdinLines: [],
          expected: 'Ca 4: DANH SACH(2): Ca phe, Xe bus',
          match: 'contains',
          hidden: false,
          label: 'Có dữ liệu: đủ số lượng và nội dung',
        },
        {
          stdinLines: [],
          expected: 'Thuan: co',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: gọi hai lần cùng một state cho kết quả giống hệt (hàm vẽ phải thuần)',
        },
      ],
      hints: [
        'Bốn câu lệnh return, mỗi câu một nhánh. Nhánh nào đứng trước thì thắng — nên đặt đúng thứ tự đang tải → lỗi → rỗng → có dữ liệu.',
        'Kiểm lỗi phải là `s.loi !== null`, đừng viết `if (s.loi)` — chuỗi rỗng "" cũng là một lỗi có thật nhưng lại bị coi là không có lỗi.',
        'Nhánh cuối: dùng s.muc.join(", ") — có dấu phẩy VÀ một khoảng trắng, khớp đúng chuỗi mong đợi trong test.',
      ],
      sampleSolution: `interface TrangThaiMan {
  dangTai: boolean
  loi: string | null
  muc: string[]
}

function ve(s: TrangThaiMan): string {
  if (s.dangTai) return "DANG TAI"
  if (s.loi !== null) return "LOI: " + s.loi
  if (s.muc.length === 0) return "TRONG"
  return "DANH SACH(" + s.muc.length + "): " + s.muc.join(", ")
}

// ---- Đừng sửa phần dưới đây ----
console.log("Ca 1:", ve({ dangTai: true, loi: "mat mang", muc: ["Ca phe"] }))
console.log("Ca 2:", ve({ dangTai: false, loi: "mat mang", muc: ["Ca phe"] }))
console.log("Ca 3:", ve({ dangTai: false, loi: null, muc: [] }))
console.log("Ca 4:", ve({ dangTai: false, loi: null, muc: ["Ca phe", "Xe bus"] }))
const giuNguyen = { dangTai: false, loi: null, muc: ["Com trua"] }
console.log("Thuan:", ve(giuNguyen) === ve(giuNguyen) ? "co" : "khong")`,
    },
    homework:
      'Mở ba app bạn hay dùng, bật chế độ máy bay rồi thử màn hình danh sách chính của từng app. App nào phân biệt được "đang tải", "lỗi mạng" và "chưa có dữ liệu"? App nào gộp cả ba thành một màn trắng hoặc một vòng xoay bất tận? Ghi lại và tự viết câu chữ bạn sẽ hiện ở trạng thái RỖNG cho app sổ chi tiêu của mình — nhớ rằng đó là màn hình người dùng mới thấy ĐẦU TIÊN.',
    srsCards: [
      {
        hoi: 'Luật cốt lõi của giao diện khai báo là gì?',
        dap: 'giao diện = f(trạng thái): viết một hàm mô tả màn hình phải trông thế nào theo trạng thái, muốn đổi màn thì đổi trạng thái rồi để thư viện vẽ lại — không bao giờ đi sửa tay từng widget, nên màn hình không thể lệch khỏi dữ liệu.',
      },
      {
        hoi: 'Vì sao hàm vẽ tuyệt đối không được gọi mạng hay ghi cơ sở dữ liệu?',
        dap: 'Vì thư viện có quyền gọi lại hàm vẽ nhiều lần cho một lần đổi trạng thái (xoay máy, tính lại bố cục). Hàm vẽ có tác dụng phụ thì một lần đổi trạng thái có thể biến thành hàng loạt lượt gọi API.',
      },
      {
        hoi: 'Màn hình lấy dữ liệu từ xa có mấy trạng thái, theo thứ tự ưu tiên nào?',
        dap: 'Bốn: đang tải → lỗi → rỗng → có dữ liệu. Đang tải thắng tất cả để lỗi cũ không che việc đang thử lại; lỗi thắng rỗng để không nói dối rằng người dùng chưa có dữ liệu trong khi thật ra hệ thống hỏng.',
      },
    ],
  },
  {
    id: 'p6-u132-l2',
    unitId: 'p6-u132',
    language: 'typescript',
    title: 'Ảo hoá danh sách — 10.000 dòng nhưng chỉ dựng vài chục',
    hook: 'Sổ chi tiêu của bạn sau một năm có 10.000 khoản. Bạn vẽ cả 10.000 dòng vào danh sách, máy test đời mới vẫn mượt. Máy của mẹ bạn thì mở màn hình đó mất tám giây rồi văng vì hết bộ nhớ. Màn hình điện thoại cao 800 điểm ảnh, mỗi dòng 80 — người dùng chỉ nhìn được 10 dòng một lúc. Bạn vừa dựng thừa 9.990 dòng.',
    theory:
      'ẢO HOÁ DANH SÁCH (list virtualization) là kỹ thuật mà MỌI thư viện danh sách di động nghiêm túc đều dùng: `LazyColumn` của Compose, `List` của SwiftUI, `FlatList` của React Native. Ý tưởng gọn một câu: chỉ dựng những phần tử đang LỌT VÀO khung nhìn, cộng thêm một ít đệm ở hai đầu; phần tử cuộn ra khỏi màn thì thu hồi.\n\nCái làm nó chạy được là một phép tính, không phải phép màu. Với danh sách mà mọi phần tử cùng chiều cao, biết vị trí cuộn hiện tại là suy ra ngay chỉ số phần tử đầu và cuối cần dựng:\n\n    chỉ số đầu tiên thấy được = làm tròn xuống(vị trí cuộn ÷ chiều cao mục)\n    chỉ số cuối cùng thấy được = làm tròn xuống((vị trí cuộn + chiều cao khung) ÷ chiều cao mục)\n\nPhần ĐỆM (overscan) là mấy phần tử dựng thêm ở trên và dưới vùng nhìn thấy. Không có đệm thì lúc cuộn nhanh, phần tử mới chưa kịp dựng xong đã phải hiện — người dùng thấy khoảng trắng nhấp nháy. Đệm quá lớn thì lại quay về đúng vấn đề ban đầu là dựng thừa. Vài phần tử mỗi đầu là đủ, và con số đó nên ĐO trên máy yếu nhất mình hỗ trợ chứ không chọn theo cảm giác.\n\nHai chỗ phải kẹp biên, và đây là nơi lỗi hay nằm: chỉ số đầu không được âm (cuộn ở đỉnh danh sách, trừ đệm đi là ra số âm), chỉ số cuối không được vượt quá phần tử cuối cùng (cuộn tới đáy). Quên kẹp là app đọc ra ngoài mảng và văng — mà lại chỉ văng đúng ở đầu và cuối danh sách, hai chỗ ít ai nghĩ tới lúc test.\n\nĐIỀU KIỆN để phép tính trên đúng: mọi mục CÙNG CHIỀU CAO. Mục cao thấp khác nhau thì không thể chia đơn giản như vậy nữa, thư viện phải đo dần và ước lượng — chậm hơn và hay giật khi cuộn. Đó là lý do thực dụng khiến thiết kế danh sách di động nên giữ mục đồng đều nếu làm được: không phải vì đẹp, mà vì rẻ.\n\nMột lưu ý cuối gắn với bài trước: ảo hoá chỉ ảnh hưởng tới việc DỰNG, không ảnh hưởng tới DỮ LIỆU. Trạng thái của cả 10.000 mục vẫn nằm trong bộ nhớ hoặc trong cơ sở dữ liệu cục bộ — nên tuyệt đối không được giữ trạng thái quan trọng (mục nào đang chọn, ô nào gõ dở) BÊN TRONG widget của một dòng, vì widget đó sẽ bị thu hồi khi cuộn qua và trạng thái đi theo nó.',
    workedExample: {
      code: `interface CuaSo {
  dau: number
  cuoi: number
  soMucVe: number
}

function cuaSoAoHoa(
  tongMuc: number,
  chieuCaoMuc: number,
  chieuCaoKhung: number,
  viTriCuon: number,
  dem: number,
): CuaSo {
  const dauThay = Math.floor(viTriCuon / chieuCaoMuc)                    // muc dau tien lot vao khung
  const cuoiThay = Math.floor((viTriCuon + chieuCaoKhung) / chieuCaoMuc) // muc cuoi cung lot vao khung
  const dau = Math.max(0, dauThay - dem)                                 // kep bien tren: khong am
  const cuoi = Math.min(tongMuc - 1, cuoiThay + dem)                     // kep bien duoi: khong vuot cuoi mang
  return { dau, cuoi, soMucVe: cuoi - dau + 1 }
}

// 10.000 muc, moi muc cao 80, khung cao 800, dem 3 muc moi dau.
const dinh = cuaSoAoHoa(10000, 80, 800, 0, 3)
console.log("O dinh:", dinh.dau, dinh.cuoi, dinh.soMucVe)

const giua = cuaSoAoHoa(10000, 80, 800, 4000, 3)
console.log("O giua:", giua.dau, giua.cuoi, giua.soMucVe)

const day = cuaSoAoHoa(10000, 80, 800, 799200, 3)
console.log("O day:", day.dau, day.cuoi, day.soMucVe)`,
      stdinLines: [],
    },
    predict: {
      code: `function soMucVe(
  tongMuc: number,
  chieuCaoMuc: number,
  chieuCaoKhung: number,
  viTriCuon: number,
  dem: number,
): number {
  const dau = Math.max(0, Math.floor(viTriCuon / chieuCaoMuc) - dem)
  const cuoi = Math.min(tongMuc - 1, Math.floor((viTriCuon + chieuCaoKhung) / chieuCaoMuc) + dem)
  return cuoi - dau + 1
}
console.log(soMucVe(10000, 80, 800, 0, 3))`,
      question:
        'Danh sách 10.000 mục, mỗi mục cao 80, khung nhìn cao 800, đệm 3, đang cuộn ở đỉnh (vị trí 0). Dựng bao nhiêu mục?',
      choices: ['14', '10', '16', '10000'],
      answerIndex: 0,
      explain:
        'Ở đỉnh: chỉ số đầu = làm tròn xuống(0/80) − 3 = −3, kẹp về 0 (đệm phía trên không có chỗ để dùng). Chỉ số cuối = làm tròn xuống(800/80) + 3 = 10 + 3 = 13. Vậy dựng từ 0 tới 13 là 14 mục — chứ không phải 10.000. Đáp án 10 là bẫy: đó là số mục THẤY ĐƯỢC, còn số mục DỰNG luôn nhiều hơn vì có mục thứ 10 ló ra ở mép dưới cộng với đệm.',
    },
    parsons: {
      prompt:
        'Xếp lại phép tính cửa sổ ảo hoá: tính chỉ số thấy được trước, rồi kẹp biên hai đầu, rồi mới ra số mục cần dựng.',
      lines: [
        'const dauThay = Math.floor(viTriCuon / chieuCaoMuc)',
        'const cuoiThay = Math.floor((viTriCuon + chieuCaoKhung) / chieuCaoMuc)',
        'const dau = Math.max(0, dauThay - dem)',
        'const cuoi = Math.min(tongMuc - 1, cuoiThay + dem)',
        'return { dau, cuoi, soMucVe: cuoi - dau + 1 }',
      ],
    },
    make: {
      prompt:
        'Viết hàm cuaSoAoHoa(tongMuc, chieuCaoMuc, chieuCaoKhung, viTriCuon, dem) trả về { dau, cuoi, soMucVe }.\n\n- dauThay = làm tròn xuống(viTriCuon ÷ chieuCaoMuc); cuoiThay = làm tròn xuống((viTriCuon + chieuCaoKhung) ÷ chieuCaoMuc).\n- dau = lớn nhất giữa 0 và (dauThay − dem) — kẹp biên trên, không cho ra chỉ số âm.\n- cuoi = nhỏ nhất giữa (tongMuc − 1) và (cuoiThay + dem) — kẹp biên dưới, không cho vượt phần tử cuối.\n- soMucVe = cuoi − dau + 1.\n\nDùng starter code có sẵn (đừng sửa phần dưới).',
      starterCode: `interface CuaSo {
  dau: number
  cuoi: number
  soMucVe: number
}

function cuaSoAoHoa(
  tongMuc: number,
  chieuCaoMuc: number,
  chieuCaoKhung: number,
  viTriCuon: number,
  dem: number,
): CuaSo {
  // TODO: tinh chi so thay duoc, kep bien hai dau, roi tra ve cua so
  return { dau: 0, cuoi: 0, soMucVe: 0 }
}

// ---- Đừng sửa phần dưới đây ----
const dinh = cuaSoAoHoa(10000, 80, 800, 0, 3)
console.log("Dinh:", dinh.dau, dinh.cuoi, dinh.soMucVe)
const giua = cuaSoAoHoa(10000, 80, 800, 4000, 3)
console.log("Giua:", giua.dau, giua.cuoi, giua.soMucVe)
const day = cuaSoAoHoa(10000, 80, 800, 799200, 3)
console.log("Day:", day.dau, day.cuoi, day.soMucVe)
const ngan = cuaSoAoHoa(5, 80, 800, 0, 3)
console.log("Ngan:", ngan.dau, ngan.cuoi, ngan.soMucVe)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Dinh: 0 13 14',
          match: 'contains',
          hidden: false,
          label: 'Ở đỉnh: đệm trên bị kẹp về 0, dựng 14 mục thay vì 10.000',
        },
        {
          stdinLines: [],
          expected: 'Giua: 47 63 17',
          match: 'contains',
          hidden: false,
          label: 'Giữa danh sách: có đủ đệm cả hai đầu nên dựng 17 mục',
        },
        {
          stdinLines: [],
          expected: 'Day: 9987 9999 13',
          match: 'contains',
          hidden: false,
          label: 'Ở đáy: chỉ số cuối bị kẹp về 9999, không đọc ra ngoài mảng',
        },
        {
          stdinLines: [],
          expected: 'Ngan: 0 4 5',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: danh sách ngắn hơn cả khung nhìn thì dựng đúng 5 mục, không nhiều hơn',
        },
      ],
      hints: [
        'Math.floor để làm tròn xuống, Math.max(0, ...) để kẹp biên trên, Math.min(tongMuc - 1, ...) để kẹp biên dưới.',
        'Chỗ dễ sai: cuối cùng thấy được tính từ (viTriCuon + chieuCaoKhung), không phải từ chieuCaoKhung một mình — vì khung nhìn nằm ở giữa danh sách chứ không phải ở đỉnh.',
        'Ca "Ngan" (danh sách chỉ 5 mục nhưng khung cao 800) là ca bắt thiếu kẹp biên dưới: không có Math.min thì cuoi ra 13 và app đọc phần tử không tồn tại.',
      ],
      sampleSolution: `interface CuaSo {
  dau: number
  cuoi: number
  soMucVe: number
}

function cuaSoAoHoa(
  tongMuc: number,
  chieuCaoMuc: number,
  chieuCaoKhung: number,
  viTriCuon: number,
  dem: number,
): CuaSo {
  const dauThay = Math.floor(viTriCuon / chieuCaoMuc)
  const cuoiThay = Math.floor((viTriCuon + chieuCaoKhung) / chieuCaoMuc)
  const dau = Math.max(0, dauThay - dem)
  const cuoi = Math.min(tongMuc - 1, cuoiThay + dem)
  return { dau, cuoi, soMucVe: cuoi - dau + 1 }
}

// ---- Đừng sửa phần dưới đây ----
const dinh = cuaSoAoHoa(10000, 80, 800, 0, 3)
console.log("Dinh:", dinh.dau, dinh.cuoi, dinh.soMucVe)
const giua = cuaSoAoHoa(10000, 80, 800, 4000, 3)
console.log("Giua:", giua.dau, giua.cuoi, giua.soMucVe)
const day = cuaSoAoHoa(10000, 80, 800, 799200, 3)
console.log("Day:", day.dau, day.cuoi, day.soMucVe)
const ngan = cuaSoAoHoa(5, 80, 800, 0, 3)
console.log("Ngan:", ngan.dau, ngan.cuoi, ngan.soMucVe)`,
    },
    homework:
      'Đo trên chính điện thoại của bạn: mở một app có danh sách rất dài (thư viện ảnh, danh bạ, lịch sử giao dịch ngân hàng), cuộn thật nhanh xuống đáy. Có thấy khoảng trắng hay ô xám nhấp nháy trước khi nội dung hiện ra không? Đó chính là lúc phần đệm không đủ cho tốc độ cuộn. Ước lượng: màn hình bạn cao bao nhiêu dòng, và nếu đặt đệm 3 mục mỗi đầu thì app phải dựng bao nhiêu mục một lúc?',
    srsCards: [
      {
        hoi: 'Ảo hoá danh sách làm gì, và tính chỉ số phần tử cần dựng bằng cách nào?',
        dap: 'Chỉ dựng phần tử lọt vào khung nhìn cộng phần đệm, thu hồi phần đã cuộn qua. Chỉ số đầu = làm tròn xuống(vị trí cuộn ÷ chiều cao mục); chỉ số cuối = làm tròn xuống((vị trí cuộn + chiều cao khung) ÷ chiều cao mục).',
      },
      {
        hoi: 'Hai chỗ nào bắt buộc phải kẹp biên khi tính cửa sổ ảo hoá, và không kẹp thì sao?',
        dap: 'Chỉ số đầu kẹp không cho âm (cuộn ở đỉnh, trừ đệm ra số âm) và chỉ số cuối kẹp không vượt phần tử cuối cùng (cuộn tới đáy). Không kẹp thì app đọc ra ngoài mảng và văng, đúng ở hai đầu danh sách mà ít ai nghĩ tới lúc test.',
      },
      {
        hoi: 'Vì sao không được giữ trạng thái quan trọng bên trong widget của một dòng danh sách?',
        dap: 'Vì ảo hoá thu hồi widget khi dòng cuộn ra khỏi màn hình, và trạng thái nằm trong nó sẽ mất theo. Trạng thái phải nằm ở tầng dữ liệu (ViewModel hoặc kho cục bộ), widget chỉ vẽ lại từ đó.',
      },
    ],
  },
]
