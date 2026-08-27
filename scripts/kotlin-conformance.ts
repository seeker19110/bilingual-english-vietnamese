// kotlin-conformance — ĐỐI CHIẾU bộ chạy Kotlin của DHCB với trình biên dịch Kotlin THẬT.
//
// Vì sao cần: hiến chương chương trình M §3.4 đòi mỗi ca đối chiếu phải được chạy MỘT LẦN trên
// trình biên dịch thật, "không suy đoán từ trí nhớ". Máy dựng PR-M7 không có Kotlin (và không
// tải được), nên việc đó phải làm trên máy có Kotlin toolchain — script này để chạy đúng một
// lệnh là xong.
//
// Cách dùng:
//   npm run kotlin:conformance            # có `kotlinc` thì chạy thật và so; không có thì chỉ sinh file
//   npm run kotlin:conformance -- --out /duong/dan.kt
//
// Thoát mã 1 khi có ca lệch — để dùng được trong CI của máy có Kotlin.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CA_DOI_CHIEU } from '../packages/subject-programming/kotlinSim/conformance.js'
import { chayKotlin, DONG_TU_KHAI } from '../packages/subject-programming/kotlinSim/chayKotlin.js'

const NGAN = '@@@DHCB-CA@@@'

/**
 * Sinh MỘT file .kt chứa mọi ca.
 *
 * KHÁC bản Swift một chỗ đáng ghi: Kotlin KHÔNG cho khai `class`/`interface`/`enum class` bên
 * trong thân hàm ở mọi phiên bản như Swift, nên không bọc từng ca vào một hàm được. Thay vào
 * đó mỗi ca thành một FILE-LEVEL block: khai báo kiểu nâng ra ngoài (đổi tên theo số ca để
 * không đụng nhau), phần còn lại vào `fun caN()`.
 */
function sinhFileKotlin(): string {
  const phan = CA_DOI_CHIEU.map((ca, i) => {
    const dong = ca.code.split('\n')
    const khaiKieu: string[] = []
    const than: string[] = []
    let dangTrongKieu = 0
    for (const d of dong) {
      const batDauKieu =
        dangTrongKieu === 0 &&
        /^\s*(data\s+|sealed\s+|open\s+|abstract\s+)*(class|interface|object|enum\s+class|fun)\b/.test(
          d,
        )
      if (batDauKieu || dangTrongKieu > 0) {
        khaiKieu.push(d)
        dangTrongKieu += (d.match(/\{/g) ?? []).length - (d.match(/\}/g) ?? []).length
        if (dangTrongKieu < 0) dangTrongKieu = 0
        continue
      }
      than.push(d)
    }
    const thanThut = than.map((d) => `    ${d}`).join('\n')
    return `${khaiKieu.join('\n')}\nfun ca${i}() {\n${thanThut}\n}`
  })
  // CHỐT CHẶN: file sinh ra có `fun main()` của riêng nó, nên ca nào tự khai `fun main` sẽ
  // làm trùng tên và kotlinc không dịch được — hỏng IM LẶNG vì máy dựng PR không có Kotlin để
  // phát hiện. Báo to ngay lúc sinh thay vì để người chạy đối chiếu mất buổi đi dò.
  const coMain = CA_DOI_CHIEU.filter((ca) => /^\s*fun\s+main\s*\(/m.test(ca.code))
  if (coMain.length > 0) {
    console.error(
      `Ca ${coMain.map((c) => c.ma).join(', ')} khai "fun main()" — trung voi ham main cua file ` +
        'sinh ra. Doi ten ham trong ca do (vi du "fun ngoai()") roi chay lai.',
    )
    process.exit(1)
  }
  const goi = CA_DOI_CHIEU.map((ca, i) => `    println("${NGAN}${ca.ma}")\n    ca${i}()`).join('\n')
  return (
    '// Sinh tu dong boi scripts/kotlin-conformance.ts — KHONG sua tay.\n' +
    `${phan.join('\n')}\n\nfun main() {\n${goi}\n    println("${NGAN}HET")\n}\n`
  )
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

/** `kotlin` chạy thẳng file .kt như script; `kotlinc` phải biên dịch trước. Ưu tiên cái nhanh. */
function timLenhKotlin(): 'kotlin' | 'kotlinc' | null {
  for (const lenh of ['kotlin', 'kotlinc'] as const) {
    try {
      execFileSync(lenh, ['-version'], { stdio: 'ignore' })
      return lenh
    } catch {
      // thử lệnh kế tiếp
    }
  }
  return null
}

function main(): void {
  const args = process.argv.slice(2)
  const viTriOut = args.indexOf('--out')
  const thuMuc = mkdtempSync(join(tmpdir(), 'dhcb-kotlin-'))
  const duongDan = viTriOut === -1 ? join(thuMuc, 'conformance.kt') : args[viTriOut + 1]!
  writeFileSync(duongDan, sinhFileKotlin(), 'utf8')
  console.log(`Da sinh ${CA_DOI_CHIEU.length} ca vao: ${duongDan}`)

  const lenh = timLenhKotlin()
  if (lenh === null) {
    console.log(
      '\nMay nay KHONG co `kotlin`/`kotlinc`. Chep file tren sang may co Kotlin roi chay:\n' +
        `  kotlinc ${duongDan} -include-runtime -d ca.jar && java -jar ca.jar\n` +
        'Roi chay lai script nay tren may do de tu so sanh.\n' +
        'Cho toi luc do, moi ca trong conformance.ts van phai giu daDoiChieu = false.',
    )
    process.exit(0)
  }

  let raw: string
  if (lenh === 'kotlin') {
    raw = execFileSync('kotlin', [duongDan], { encoding: 'utf8' })
  } else {
    const jar = join(thuMuc, 'ca.jar')
    execFileSync('kotlinc', [duongDan, '-include-runtime', '-d', jar], { stdio: 'inherit' })
    raw = execFileSync('java', ['-jar', jar], { encoding: 'utf8' })
  }

  const that = tach(raw)
  let lech = 0
  for (const ca of CA_DOI_CHIEU) {
    const mo = chayKotlin(ca.code).output.replace(`${DONG_TU_KHAI}\n`, '')
    const thuc = that.get(ca.ma) ?? '(khong co output)'
    const khopKy = thuc === ca.ky
    const khopMo = thuc === mo
    if (khopKy && khopMo) continue
    lech += 1
    console.log(`\n✗ ${ca.ma} — ${ca.tinhNang}`)
    console.log(`  kotlin that : ${JSON.stringify(thuc)}`)
    console.log(`  ky vong     : ${JSON.stringify(ca.ky)}`)
    console.log(`  bo chay DHCB: ${JSON.stringify(mo)}`)
  }
  if (lech === 0) {
    console.log(
      `\n✅ ${CA_DOI_CHIEU.length}/${CA_DOI_CHIEU.length} ca KHOP voi kotlin that.\n` +
        'Buoc cuoi: dat daDoiChieu = true cho moi ca trong conformance.ts, ghi phien ban kotlin ' +
        '(`kotlin -version`) vao docs/research/dac-ta-bo-chay-kotlin-2026-08-27.md, roi commit.',
    )
    process.exit(0)
  }
  console.log(
    `\n❌ ${lech}/${CA_DOI_CHIEU.length} ca LECH — sua bo chay hoac sua ky vong truoc khi soan noi dung.`,
  )
  process.exit(1)
}

main()
