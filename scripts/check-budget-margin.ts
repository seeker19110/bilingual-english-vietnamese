// scripts/check-budget-margin.ts — In BIÊN ĐỘ CÒN LẠI của các ngân sách chất lượng.
//
// VÌ SAO CÓ FILE NÀY (audit 2026-08-25, F3):
// `size-limit` và ngưỡng coverage của Vitest chỉ trả pass/fail. Nghĩa là "còn 0,3 kB" và
// "còn 40 kB" hiện ra giống hệt nhau — cổng xanh cho tới đúng lúc một PR nhỏ vô hại làm nó
// đỏ, và người viết PR đó lãnh trọn cái nợ mà người khác đã tiêu dần. Đo được lúc audit:
// bundle JS dùng 99,7% ngân sách, coverage branches chỉ dư 0,13 điểm.
//
// Script này KHÔNG thay cổng — cổng thật vẫn là `size-limit` và ngưỡng trong `vitest.config.ts`.
// Nó chỉ làm cho biên độ hiện ra thành số, và kêu lên khi biên độ đã mỏng.
//
// Dùng: `npm run budget` (sau khi đã có `dist/` và/hoặc `coverage/coverage-summary.json`).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

// Bundle: đã tiêu bao nhiêu % ngân sách thì kêu. 95% = còn 5% đệm.
const WARN_BUNDLE_AT_PCT = 95
// Coverage: biên độ tính bằng ĐIỂM PHẦN TRĂM, không quy về tỉ lệ. Coverage vốn đã là một
// phần trăm nên "tỉ số của tỉ số" vô nghĩa: 93,36% trên sàn 90 (dư 3,36 điểm — rất thoải mái)
// sẽ ra "đã dùng 96,4% ngân sách", báo động ngang với 90,13% (dư 0,13 điểm — sát đỏ thật).
// Một điểm phần trăm là đệm đủ để một PR cỡ vừa không tự làm đỏ cổng.
const WARN_COVERAGE_MARGIN_POINTS = 1

type SizeEntry = { name: string; passed: boolean; size: number; sizeLimit: number }
type CoverageTotal = Record<string, { pct: number }>

/** Một dòng ngân sách đã quy về cùng đơn vị để in chung một bảng. */
type Budget = {
  label: string
  used: number // giá trị thực đo
  limit: number // ngưỡng
  unit: string
  /** true = vượt ngưỡng khi used LỚN hơn limit (bundle); false = khi used NHỎ hơn (coverage). */
  higherIsWorse: boolean
}

/** Biên độ còn lại, luôn dương khi còn trong ngân sách. */
function marginOf(b: Budget): number {
  return b.higherIsWorse ? b.limit - b.used : b.used - b.limit
}

/** Biên độ đã mỏng chưa — mỗi loại ngân sách có thước riêng (xem hai hằng ở đầu file). */
function isThin(b: Budget): boolean {
  if (b.higherIsWorse) return (b.used / b.limit) * 100 >= WARN_BUNDLE_AT_PCT
  return marginOf(b) < WARN_COVERAGE_MARGIN_POINTS
}

function readSizeBudgets(): Budget[] {
  if (!existsSync('dist')) {
    console.log('· Bỏ qua bundle: chưa có thư mục dist/ (chạy `npm run build` trước).')
    return []
  }
  const raw = execFileSync('npx', ['size-limit', '--json'], { encoding: 'utf-8' })
  const entries = JSON.parse(raw) as SizeEntry[]
  return entries.map((e) => ({
    label: e.name,
    used: e.size / 1000,
    limit: e.sizeLimit / 1000,
    unit: 'kB',
    higherIsWorse: true,
  }))
}

function readCoverageBudgets(): Budget[] {
  const summaryPath = 'coverage/coverage-summary.json'
  if (!existsSync(summaryPath)) {
    console.log(
      '· Bỏ qua coverage: chưa có coverage/coverage-summary.json (chạy `npm run test:coverage` trước).',
    )
    return []
  }
  const total = (JSON.parse(readFileSync(summaryPath, 'utf-8')) as { total: CoverageTotal }).total
  // Đọc ngưỡng từ chính vitest.config.ts — KHÔNG chép số vào đây (đúng bài học Tầng 5a:
  // số chép tay trong tài liệu/script sẽ lệch với cấu hình thật).
  const config = readFileSync('vitest.config.ts', 'utf-8')
  const block = /thresholds:\s*\{([^}]*)\}/.exec(config)?.[1] ?? ''
  return (['statements', 'branches', 'functions', 'lines'] as const)
    .map((key) => {
      const threshold = Number(new RegExp(`${key}:\\s*([0-9.]+)`).exec(block)?.[1])
      const pct = total[key]?.pct
      if (!Number.isFinite(threshold) || !Number.isFinite(pct)) return null
      return {
        label: `Coverage ${key}`,
        used: pct as number,
        limit: threshold,
        unit: '%',
        higherIsWorse: false,
      }
    })
    .filter((b): b is Budget => b !== null)
}

function report(budgets: Budget[]): { warnings: string[]; failures: string[] } {
  const warnings: string[] = []
  const failures: string[] = []

  for (const b of budgets) {
    const margin = marginOf(b)
    const over = margin < 0
    const thin = !over && isThin(b)
    // Bundle nói theo % ngân sách đã tiêu; coverage nói theo số điểm còn dư trên sàn.
    const detail = b.higherIsWorse
      ? `đã dùng ${((b.used / b.limit) * 100).toFixed(1)}% ngân sách`
      : `dư ${margin.toFixed(2)} điểm trên sàn`
    console.log(
      `  ${over ? '❌' : thin ? '⚠️ ' : '✅'} ${b.label}: ` +
        `${b.used.toFixed(2)}${b.unit} / ${b.limit.toFixed(2)}${b.unit} — ` +
        `còn ${margin.toFixed(2)}${b.unit} (${detail})`,
    )

    if (over) failures.push(b.label)
    else if (thin) warnings.push(b.label)
  }
  return { warnings, failures }
}

const budgets = [...readSizeBudgets(), ...readCoverageBudgets()]
if (budgets.length === 0) {
  console.log('Không có ngân sách nào đo được — không kết luận gì.')
  process.exit(0)
}

console.log('\nBIÊN ĐỘ NGÂN SÁCH CHẤT LƯỢNG:')
const { warnings, failures } = report(budgets)

if (failures.length > 0) {
  console.error(`\n❌ VƯỢT ngân sách: ${failures.join(', ')}`)
  process.exit(1)
}
if (warnings.length > 0) {
  console.warn(
    `\n⚠️  Biên độ đã mỏng: ${warnings.join(', ')}.\n` +
      '   Chưa đỏ, nhưng tính năng nhỏ kế tiếp nhiều khả năng sẽ làm CI đỏ. Xử lý trước khi\n' +
      '   nó rơi vào tay người khác: giảm bundle / thêm test, hoặc nâng ngưỡng có chủ đích\n' +
      '   kèm lý do ghi vào PROGRESS.md.',
  )
}
console.log('')
