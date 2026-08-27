// swift-conformance — ĐỐI CHIẾU bộ chạy Swift của DHCB với trình biên dịch Swift THẬT.
//
// Vì sao cần: hiến chương chương trình M §3.4 đòi mỗi ca đối chiếu phải được chạy MỘT LẦN trên
// trình biên dịch thật, "không suy đoán từ trí nhớ". Máy dựng PR-M3 không có Swift (và không
// tải được), nên việc đó phải làm trên máy có Xcode/Swift toolchain — script này để chạy đúng
// một lệnh là xong.
//
// Cách dùng:
//   npm run swift:conformance            # có `swift` thì chạy thật và so; không có thì chỉ sinh file
//   npm run swift:conformance -- --out /duong/dan.swift
//
// Thoát mã 1 khi có ca lệch — để dùng được trong CI của máy có Swift.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CA_DOI_CHIEU } from '../packages/subject-programming/swiftSim/conformance.js'
import { chaySwift, DONG_TU_KHAI } from '../packages/subject-programming/swiftSim/index.js'

const NGAN = '@@@DHCB-CA@@@'

/** Sinh MỘT file .swift chứa mọi ca, mỗi ca bọc trong một hàm riêng để tên biến không đụng nhau. */
function sinhFileSwift(): string {
  const phan = CA_DOI_CHIEU.map((ca, i) => {
    const than = ca.code
      .split('\n')
      .map((d) => `    ${d}`)
      .join('\n')
    return `func ca${i}() {\n${than}\n}\nprint("${NGAN}${ca.ma}")\nca${i}()`
  })
  return `// Sinh tu dong boi scripts/swift-conformance.ts — KHONG sua tay.\n${phan.join('\n')}\nprint("${NGAN}HET")\n`
}

/** Tách output thật thành từng ca theo dấu ngăn. */
function tach(raw: string): Map<string, string> {
  const ra = new Map<string, string>()
  let maHienTai: string | null = null
  let dem: string[] = []
  for (const dong of raw.split('\n')) {
    if (dong.startsWith(NGAN)) {
      if (maHienTai) ra.set(maHienTai, dem.join('\n') + (dem.length ? '\n' : ''))
      const ma = dong.slice(NGAN.length)
      maHienTai = ma === 'HET' ? null : ma
      dem = []
      continue
    }
    dem.push(dong)
  }
  return ra
}

function coSwift(): boolean {
  try {
    execFileSync('swift', ['--version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function main(): void {
  const args = process.argv.slice(2)
  const viTriOut = args.indexOf('--out')
  const thuMuc = mkdtempSync(join(tmpdir(), 'dhcb-swift-'))
  const duongDan = viTriOut === -1 ? join(thuMuc, 'conformance.swift') : args[viTriOut + 1]!
  writeFileSync(duongDan, sinhFileSwift(), 'utf8')
  console.log(`Da sinh ${CA_DOI_CHIEU.length} ca vao: ${duongDan}`)

  if (!coSwift()) {
    console.log(
      '\nMay nay KHONG co `swift`. Chep file tren sang may co Xcode/Swift roi chay:\n' +
        `  swift ${duongDan}\n` +
        'Roi chay lai script nay tren may do de tu so sanh.\n' +
        'Cho toi luc do, moi ca trong conformance.ts van phai giu daDoiChieu = false.',
    )
    process.exit(0)
  }

  const that = tach(execFileSync('swift', [duongDan], { encoding: 'utf8' }))
  let lech = 0
  for (const ca of CA_DOI_CHIEU) {
    const mo = chaySwift(ca.code).output.replace(`${DONG_TU_KHAI}\n`, '')
    const thuc = that.get(ca.ma) ?? '(khong co output)'
    const khopKy = thuc === ca.ky
    const khopMo = thuc === mo
    if (khopKy && khopMo) continue
    lech += 1
    console.log(`\n✗ ${ca.ma} — ${ca.tinhNang}`)
    console.log(`  swift that : ${JSON.stringify(thuc)}`)
    console.log(`  ky vong    : ${JSON.stringify(ca.ky)}`)
    console.log(`  bo chay DHCB: ${JSON.stringify(mo)}`)
  }
  if (lech === 0) {
    console.log(
      `\n✅ ${CA_DOI_CHIEU.length}/${CA_DOI_CHIEU.length} ca KHOP voi swift that.\n` +
        'Buoc cuoi: dat daDoiChieu = true cho moi ca trong conformance.ts, ghi phien ban swift ' +
        '(`swift --version`) vao docs/research/dac-ta-bo-chay-swift-2026-08-27.md, roi commit.',
    )
    process.exit(0)
  }
  console.log(
    `\n❌ ${lech}/${CA_DOI_CHIEU.length} ca LECH — sua bo chay hoac sua ky vong truoc khi soan noi dung.`,
  )
  process.exit(1)
}

main()
