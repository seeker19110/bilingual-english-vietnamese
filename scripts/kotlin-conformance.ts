// kotlin-conformance — ĐỐI CHIẾU bộ chạy Kotlin của DHCB với trình biên dịch Kotlin THẬT.
//
// Vì sao cần: hiến chương chương trình M §3.4 đòi mỗi ca đối chiếu phải được chạy MỘT LẦN trên
// trình biên dịch thật, "không suy đoán từ trí nhớ".
//
// ĐÃ CHẠY THẬT 2026-09-03: 48/48 ca khớp `kotlinc 2.0.21` (JRE 21.0.10) — cổng §3.4 đã mở. Chỉ
// cần JVM cộng bản `kotlin-compiler` tải từ GitHub releases, KHÔNG cần máy riêng như trước
// tưởng. Chạy lại lệnh dưới bất cứ lúc nào thêm/sửa ca.
//
// Cách dùng:
//   npm run kotlin:conformance            # có `kotlinc` thì chạy thật và so; không có thì chỉ sinh file
//   npm run kotlin:conformance -- --out /duong/dan/thu-muc
//
// Lưu ý `--out` trỏ tới THƯ MỤC, không phải một file .kt: mỗi ca sinh ra một file riêng trong
// `package` riêng (lý do ở docstring của `sinhCacFileKotlin`).
//
// Thoát mã 1 khi có ca lệch — để dùng được trong CI của máy có Kotlin.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CA_DOI_CHIEU } from '../packages/subject-programming/kotlinSim/conformance.js'
import { chayKotlin, DONG_TU_KHAI } from '../packages/subject-programming/kotlinSim/chayKotlin.js'

const NGAN = '@@@DHCB-CA@@@'

/**
 * Sinh MỘT file .kt cho MỖI ca, cộng một `Main.kt` gọi lần lượt.
 *
 * Vì sao mỗi ca một file + một `package` riêng, chứ không dồn hết vào một file: Kotlin KHÔNG
 * cho khai `class`/`interface`/`enum class` trong thân hàm, nên khai báo kiểu của từng ca phải
 * nâng lên mức file. Dồn chung một file thì hai ca cùng đặt tên kiểu là TRÙNG — đo thật ngày
 * 2026-09-03: hai ca cùng khai `data class Diem`, kotlinc báo "redeclaration" và chết trước khi
 * so được ca nào. Bản đầu của script có ghi trong docstring là "đổi tên theo số ca để không
 * đụng nhau" nhưng code KHÔNG hề làm; `package ca<N>` giải quyết triệt để mà không phải viết
 * bộ đổi tên (đổi tên thì còn phải sửa mọi chỗ dùng kiểu đó bên trong ca — dễ sai hơn nhiều).
 *
 * Kèm lợi ích thứ hai: lỗi biên dịch nay chỉ ra đúng file của ca gây lỗi, thay vì một số dòng
 * trong file gộp 48 ca.
 */
function sinhCacFileKotlin(): { ten: string; noiDung: string }[] {
  const file = CA_DOI_CHIEU.map((ca, i) => {
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
    // KHONG thut cac dong than ca. Thut cho de doc thi hong ca co chuoi tho `"""..."""`:
    // dau cach them vao NAM TRONG chuoi va thanh noi dung that. Do that 2026-09-03 — ca K05
    // (`val s = """dong mot\ndong hai"""`) bao lech chi vi khung do thut 4 dau cach, con bo
    // chay DHCB va ky vong deu dung. Kotlin khong doi thut dong, nen bo han cho an toan.
    return {
      ten: `ca${i}.kt`,
      noiDung: `package ca${i}\n\n${khaiKieu.join('\n')}\nfun than() {\n${than.join('\n')}\n}\n`,
    }
  })

  // CHỐT CHẶN: `Main.kt` có `fun main()` của riêng nó. Ca nào tự khai `fun main` sẽ nằm trong
  // package riêng nên KHÔNG còn trùng tên nữa, nhưng vẫn chặn: một ca có `main()` riêng gần
  // như chắc chắn là ca viết nhầm khuôn, và để lọt thì nó im lặng không bao giờ được gọi.
  const coMain = CA_DOI_CHIEU.filter((ca) => /^\s*fun\s+main\s*\(/m.test(ca.code))
  if (coMain.length > 0) {
    console.error(
      `Ca ${coMain.map((c) => c.ma).join(', ')} khai "fun main()" — khuon ca doi than ca la cac ` +
        'cau lenh chay thang, khong boc trong main(). Doi ten ham do (vi du "fun ngoai()") roi chay lai.',
    )
    process.exit(1)
  }

  const goi = CA_DOI_CHIEU.map((ca, i) => `    println("${NGAN}${ca.ma}")\n    ca${i}.than()`).join(
    '\n',
  )
  file.push({
    ten: 'Main.kt',
    noiDung:
      '// Sinh tu dong boi scripts/kotlin-conformance.ts — KHONG sua tay.\n' +
      `fun main() {\n${goi}\n    println("${NGAN}HET")\n}\n`,
  })
  return file
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

/**
 * Tìm `kotlinc`. Trả `null` nếu máy không có Kotlin toolchain.
 *
 * ĐỪNG thêm lại đường tắt `kotlin <file>.kt`: bản đầu của script này ưu tiên lệnh `kotlin` vì
 * tưởng nó chạy thẳng file `.kt` như script. KHÔNG đúng — `kotlin` chỉ chạy class/jar đã biên
 * dịch (hoặc file `.kts`), nên với file `.kt` nó báo "could not find or load main class" và
 * script chết trước khi so được ca nào. Đo thật trên kotlinc 2.0.21 / JRE 21 ngày 2026-09-03,
 * lần đầu tiên script được chạy trên trình biên dịch thật.
 */
function timLenhKotlin(): 'kotlinc' | null {
  try {
    execFileSync('kotlinc', ['-version'], { stdio: 'ignore' })
    return 'kotlinc'
  } catch {
    return null
  }
}

function main(): void {
  const args = process.argv.slice(2)
  const viTriOut = args.indexOf('--out')
  // `--out` nay tro toi THU MUC (moi ca mot file), khong con la mot file .kt duy nhat.
  const thuMuc = viTriOut === -1 ? mkdtempSync(join(tmpdir(), 'dhcb-kotlin-')) : args[viTriOut + 1]!
  mkdirSync(thuMuc, { recursive: true })
  const cacFile = sinhCacFileKotlin()
  for (const f of cacFile) writeFileSync(join(thuMuc, f.ten), f.noiDung, 'utf8')
  console.log(`Da sinh ${CA_DOI_CHIEU.length} ca (${cacFile.length} file) vao: ${thuMuc}`)

  const lenh = timLenhKotlin()
  if (lenh === null) {
    console.log(
      '\nMay nay KHONG co `kotlinc`. Chep thu muc tren sang may co Kotlin toolchain roi chay:\n' +
        `  kotlinc ${join(thuMuc, '*.kt')} -include-runtime -d ca.jar && java -jar ca.jar\n` +
        'Roi chay lai script nay tren may do de tu so sanh.\n' +
        'Cho toi luc do, moi ca trong conformance.ts van phai giu daDoiChieu = false.',
    )
    process.exit(0)
  }

  const jar = join(thuMuc, 'ca.jar')
  const nguon = cacFile.map((f) => join(thuMuc, f.ten))
  execFileSync(lenh, [...nguon, '-include-runtime', '-d', jar], { stdio: 'inherit' })
  // Ep UTF-8: khong co hai co nay thi chu tieng Viet co dau ra '?' (do that 2026-09-03, ca K90
  // "Chao Nguyen Van A" thanh "Ch?o Nguy?n V?n A") — lech gia do bang ma, khong phai loi bo chay.
  const raw = execFileSync(
    'java',
    ['-Dfile.encoding=UTF-8', '-Dsun.stdout.encoding=UTF-8', '-jar', jar],
    { encoding: 'utf8' },
  )

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
        '(`kotlin -version`) vao muc "Bo chay Kotlin" cua docs/research/mon-lap-trinh.md, roi commit.',
    )
    process.exit(0)
  }
  console.log(
    `\n❌ ${lech}/${CA_DOI_CHIEU.length} ca LECH — sua bo chay hoac sua ky vong truoc khi soan noi dung.`,
  )
  process.exit(1)
}

main()
