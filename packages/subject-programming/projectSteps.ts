// projectSteps — DỰ ÁN TRỤC T1 "Cửa hàng của tôi": các bước chặng P1 (PR-L3b).
// Đặc tả: dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md §3 (bản đồ chặng P1) + §4
// (workspace + milestone check chấm HÀNH VI, không chấm giống code mẫu).
//
// Học viên xây MỘT file `cua_hang.py` lớn dần qua 5 bước; mỗi bước có hợp đồng I/O rõ
// (in KHÔNG DẤU các dòng chấm điểm — tránh lệch dấu tiếng Việt khi so chuỗi) và bộ check
// tái dùng TestCaseSchema + engine grading.ts. Bước sau GIỮ nguyên các dòng in của bước
// trước để code tiến hoá chứ không đập đi viết lại.
import { z } from 'zod'
import { TestCaseSchema, type ProgrammingTestCase } from './lessonTypes.js'

/** File làm việc của chặng P1 (P2 trở đi mới chia nhiều file). */
export const PROJECT_MAIN_FILE = 'cua_hang.py'

export const ProjectStepSchema = z
  .object({
    /** id ổn định `p<bậc>-s<số>` — khoá tiến độ (cùng bảng lesson_progress). */
    id: z.string().regex(/^p[1-6]-s\d+$/),
    title: z.string().min(1).max(120),
    /** Unit cung cấp kiến thức cho bước (tham chiếu curriculum). */
    unitId: z.string().regex(/^p[1-6]-u\d+$/),
    /** Yêu cầu bước — nói rõ hợp đồng nhập/xuất để chấm được. */
    requirement: z.string().min(1).max(2000),
    /** Gợi ý khi kẹt (1 mức — gợi ý bậc thang đầy đủ nằm ở bài học unit tương ứng). */
    hint: z.string().min(1).max(500),
    /** Code tham chiếu của bước (phao — mở được, đánh dấu đã xem). */
    referenceCode: z.string().min(1).max(6000),
    /** Milestone check: đạt HẾT thì mở bước sau. */
    checks: z.array(TestCaseSchema).min(1).max(8),
    /** true = bước cuối chặng: đạt xong thì chốt snapshot milestone. */
    isMilestone: z.boolean().default(false),
  })
  .strict()

export type ProjectStep = z.infer<typeof ProjectStepSchema>

/** Code khởi đầu khi mở dự án lần đầu. */
export const PROJECT_STARTER_CODE = `# cua_hang.py — Cửa hàng của tôi (dự án xuyên suốt, chặng P1)
# Bạn sẽ xây file này lớn dần qua 5 bước. Bắt đầu từ bước 1 nhé!
`

const tc = (
  stdinLines: string[],
  expected: string,
  label: string,
  hidden = false,
): ProgrammingTestCase => TestCaseSchema.parse({ stdinLines, expected, label, hidden })

// Menu cố định của chặng P1 (đề bài quy ước — học viên có thể đổi TÊN QUÁN thoải mái,
// nhưng 3 món + giá giữ nguyên để chấm được):
//   1. Tra da  - 5000   ·  2. Nuoc cam - 15000  ·  3. Sua dau - 10000

export const P1_PROJECT_STEPS: ProjectStep[] = [
  {
    id: 'p1-s1',
    isMilestone: false,
    title: 'In menu + chào theo tên chủ quán',
    unitId: 'p1-u2',
    requirement:
      'Chương trình hỏi tên chủ quán bằng input(), rồi in dòng "Quan cua <ten>" và in menu 3 món (mỗi món một dòng, không dấu):\n1. Tra da - 5000\n2. Nuoc cam - 15000\n3. Sua dau - 10000',
    hint: 'Dùng input() lấy tên vào biến, f-string để ghép "Quan cua {ten}", rồi 3 lệnh print cho 3 món.',
    referenceCode: `ten = input("Ten chu quan: ")
print(f"Quan cua {ten}")
print("1. Tra da - 5000")
print("2. Nuoc cam - 15000")
print("3. Sua dau - 10000")`,
    checks: [
      tc(['Lan'], 'Quan cua Lan', 'Chào đúng tên chủ quán nhập vào'),
      tc(['Lan'], 'Nuoc cam - 15000', 'Menu có đủ món và giá'),
      tc(['Minh'], 'Quan cua Minh', 'Ca ẩn: đổi tên khác vẫn đúng (không hardcode)', true),
    ],
  },
  {
    id: 'p1-s2',
    isMilestone: false,
    title: 'Chọn món + số lượng → tính tiền',
    unitId: 'p1-u3',
    requirement:
      'Sau khi in menu, hỏi tiếp: số món (1-3) và số lượng. Tính tiền = giá món × số lượng, in dòng "Tong: <tien>" (giữ nguyên phần chào + menu của bước 1).',
    hint: 'Giá 3 món lần lượt 5000/15000/10000. Đọc số bằng int(input(...)). Chọn giá theo món bằng if/elif.',
    referenceCode: `ten = input("Ten chu quan: ")
print(f"Quan cua {ten}")
print("1. Tra da - 5000")
print("2. Nuoc cam - 15000")
print("3. Sua dau - 10000")

mon = int(input("Chon mon (1-3): "))
so_luong = int(input("So luong: "))
if mon == 1:
    gia = 5000
elif mon == 2:
    gia = 15000
else:
    gia = 10000
tong = gia * so_luong
print(f"Tong: {tong}")`,
    checks: [
      tc(['Lan', '2', '3'], 'Tong: 45000', 'Nước cam × 3 = 45.000'),
      tc(['Lan', '1', '2'], 'Tong: 10000', 'Trà đá × 2 = 10.000'),
      tc(['Lan', '3', '1'], 'Tong: 10000', 'Ca ẩn: sữa đậu × 1', true),
    ],
  },
  {
    id: 'p1-s3',
    isMilestone: false,
    title: 'Giảm giá bậc thang cho hoá đơn',
    unitId: 'p1-u4',
    requirement:
      'Áp giảm giá theo bậc (tư duy tiền điện EVN đảo chiều): đơn từ 100.000 giảm 20%, từ 50.000 giảm 10%, dưới 50.000 không giảm. Sau dòng "Tong: <tien>", in thêm "Thanh toan: <tien sau giam>" (số nguyên).',
    hint: 'Kiểm bậc CAO trước: if tong >= 100000 → 20%, elif tong >= 50000 → 10%, else giữ nguyên. Dùng int() để ra số nguyên: int(tong * 0.9).',
    referenceCode: `ten = input("Ten chu quan: ")
print(f"Quan cua {ten}")
print("1. Tra da - 5000")
print("2. Nuoc cam - 15000")
print("3. Sua dau - 10000")

mon = int(input("Chon mon (1-3): "))
so_luong = int(input("So luong: "))
if mon == 1:
    gia = 5000
elif mon == 2:
    gia = 15000
else:
    gia = 10000
tong = gia * so_luong
print(f"Tong: {tong}")

if tong >= 100000:
    thanh_toan = int(tong * 0.8)
elif tong >= 50000:
    thanh_toan = int(tong * 0.9)
else:
    thanh_toan = tong
print(f"Thanh toan: {thanh_toan}")`,
    checks: [
      tc(['Lan', '2', '4'], 'Thanh toan: 54000', 'Đơn 60.000 → giảm 10% còn 54.000'),
      tc(['Lan', '2', '8'], 'Thanh toan: 96000', 'Đơn 120.000 → giảm 20% còn 96.000'),
      tc(['Lan', '1', '2'], 'Thanh toan: 10000', 'Đơn nhỏ không giảm'),
      tc(['Lan', '2', '4'], 'Tong: 60000', 'Vẫn giữ dòng Tong của bước 2'),
      // Ca biên RANH GIỚI bậc — đúng chỗ người mới hay sai >= vs >.
      tc(['Lan', '3', '5'], 'Thanh toan: 45000', 'Ca ẩn: đúng 50.000 phải được giảm 10%', true),
    ],
  },
  {
    id: 'p1-s4',
    isMilestone: false,
    title: 'Bán nhiều đơn liên tiếp (vòng lặp)',
    unitId: 'p1-u7',
    requirement:
      'Đổi luồng: sau phần chào + menu, hỏi "So don" rồi LẶP: mỗi đơn hỏi món + số lượng, in "Tong: <tien>" và "Thanh toan: <tien>" cho từng đơn như bước 3. Kết thúc in "Doanh thu: <tong cac thanh toan>".',
    hint: 'Dùng for _ in range(so_don): và một biến doanh_thu cộng dồn thanh_toan sau mỗi đơn.',
    referenceCode: `ten = input("Ten chu quan: ")
print(f"Quan cua {ten}")
print("1. Tra da - 5000")
print("2. Nuoc cam - 15000")
print("3. Sua dau - 10000")

so_don = int(input("So don: "))
doanh_thu = 0
for _ in range(so_don):
    mon = int(input("Chon mon (1-3): "))
    so_luong = int(input("So luong: "))
    if mon == 1:
        gia = 5000
    elif mon == 2:
        gia = 15000
    else:
        gia = 10000
    tong = gia * so_luong
    print(f"Tong: {tong}")
    if tong >= 100000:
        thanh_toan = int(tong * 0.8)
    elif tong >= 50000:
        thanh_toan = int(tong * 0.9)
    else:
        thanh_toan = tong
    print(f"Thanh toan: {thanh_toan}")
    doanh_thu = doanh_thu + thanh_toan
print(f"Doanh thu: {doanh_thu}")`,
    checks: [
      tc(['Lan', '2', '2', '3', '1', '2'], 'Doanh thu: 55000', '2 đơn: cam×3 + trà×2 = 55.000'),
      tc(['Lan', '1', '2', '4'], 'Doanh thu: 54000', '1 đơn có giảm giá: 60.000 → 54.000'),
      tc(['Lan', '0'], 'Doanh thu: 0', 'Ca ẩn: 0 đơn — vòng lặp không chạy', true),
    ],
  },
  {
    id: 'p1-s5',
    title: 'Milestone P1 — tiền khách đưa & tiền thừa',
    unitId: 'p1-u10',
    requirement:
      'Hoàn thiện máy tính tiền: trong mỗi đơn, sau khi in "Thanh toan", hỏi thêm tiền khách đưa. Đủ tiền → in "Thoi lai: <thua>" và cộng doanh thu; thiếu → in "Khong du tien" và KHÔNG cộng. Cuối vẫn in "Doanh thu: <t>".',
    hint: 'So sánh tien_dua với thanh_toan: đủ thì in thối lại (tien_dua - thanh_toan) và cộng doanh thu; thiếu thì chỉ in "Khong du tien".',
    referenceCode: `ten = input("Ten chu quan: ")
print(f"Quan cua {ten}")
print("1. Tra da - 5000")
print("2. Nuoc cam - 15000")
print("3. Sua dau - 10000")

so_don = int(input("So don: "))
doanh_thu = 0
for _ in range(so_don):
    mon = int(input("Chon mon (1-3): "))
    so_luong = int(input("So luong: "))
    if mon == 1:
        gia = 5000
    elif mon == 2:
        gia = 15000
    else:
        gia = 10000
    tong = gia * so_luong
    print(f"Tong: {tong}")
    if tong >= 100000:
        thanh_toan = int(tong * 0.8)
    elif tong >= 50000:
        thanh_toan = int(tong * 0.9)
    else:
        thanh_toan = tong
    print(f"Thanh toan: {thanh_toan}")
    tien_dua = int(input("Khach dua: "))
    if tien_dua >= thanh_toan:
        print(f"Thoi lai: {tien_dua - thanh_toan}")
        doanh_thu = doanh_thu + thanh_toan
    else:
        print("Khong du tien")
print(f"Doanh thu: {doanh_thu}")`,
    checks: [
      tc(
        ['Lan', '1', '2', '3', '50000'],
        'Thoi lai: 5000',
        'Cam×3 = 45.000, đưa 50.000 → thối 5.000',
      ),
      tc(['Lan', '1', '2', '3', '50000'], 'Doanh thu: 45000', 'Doanh thu cộng đúng đơn đã trả'),
      tc(['Lan', '1', '2', '3', '20000'], 'Khong du tien', 'Thiếu tiền phải báo'),
      tc(
        ['Lan', '1', '2', '3', '20000'],
        'Doanh thu: 0',
        'Ca ẩn: đơn thiếu tiền KHÔNG cộng doanh thu',
        true,
      ),
      tc(['Lan', '1', '2', '3', '45000'], 'Thoi lai: 0', 'Ca ẩn: đưa vừa đủ — ranh giới >=', true),
    ],
    isMilestone: true,
  },
]

const stepMap = new Map(P1_PROJECT_STEPS.map((s) => [s.id, s]))

export function getProjectStep(stepId: string): ProjectStep | undefined {
  return stepMap.get(stepId)
}
