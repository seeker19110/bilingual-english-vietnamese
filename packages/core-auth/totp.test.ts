import { describe, it, expect } from 'vitest'
import {
  generateTotpSecret,
  buildOtpAuthUri,
  generateTotpCode,
  verifyTotpCode,
  currentTimeStep,
  base32Encode,
  base32Decode,
} from './totp.js'

// Secret chuẩn của RFC 6238 phụ lục B: chuỗi ASCII "12345678901234567890" (20 byte).
const RFC_SECRET_ASCII = '12345678901234567890'
const RFC_SECRET_B32 = base32Encode(new TextEncoder().encode(RFC_SECRET_ASCII))

describe('Base32', () => {
  it('mã hoá secret RFC ra đúng chuỗi Base32 đã biết', () => {
    // Nếu dòng này sai thì mọi mã sinh ra đều sai — chốt luôn ở đây.
    expect(RFC_SECRET_B32).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ')
  })

  it('giải mã ngược lại đúng bản gốc', () => {
    expect(new TextDecoder().decode(base32Decode(RFC_SECRET_B32))).toBe(RFC_SECRET_ASCII)
  })

  it('bỏ qua khoảng trắng, dấu = và chữ thường (người dùng gõ tay)', () => {
    const a = base32Decode(RFC_SECRET_B32)
    expect(base32Decode(RFC_SECRET_B32.toLowerCase())).toEqual(a)
    expect(base32Decode('GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ')).toEqual(a)
    expect(base32Decode(`${RFC_SECRET_B32}======`)).toEqual(a)
  })

  it('ký tự không thuộc bảng chữ cái Base32 → báo lỗi rõ ràng', () => {
    expect(() => base32Decode('ABC1!')).toThrow(/không hợp lệ/)
  })

  it('vòng tròn với dữ liệu ngẫu nhiên mọi độ dài', () => {
    for (let len = 1; len <= 21; len++) {
      const bytes = crypto.getRandomValues(new Uint8Array(len))
      expect(base32Decode(base32Encode(bytes))).toEqual(bytes)
    }
  })
})

describe('vector chuẩn RFC 6238 (SHA-1)', () => {
  // Giá trị chính thức trong RFC là 8 chữ số; TOTP 6 chữ số = 6 chữ số cuối của chúng.
  const VECTORS: { unixTime: number; eightDigits: string }[] = [
    { unixTime: 59, eightDigits: '94287082' },
    { unixTime: 1111111109, eightDigits: '07081804' },
    { unixTime: 1111111111, eightDigits: '14050471' },
    { unixTime: 1234567890, eightDigits: '89005924' },
    { unixTime: 2000000000, eightDigits: '69279037' },
    { unixTime: 20000000000, eightDigits: '65353130' },
  ]

  it.each(VECTORS)('T=$unixTime → $eightDigits (6 số cuối)', async ({ unixTime, eightDigits }) => {
    const step = currentTimeStep(unixTime * 1000)
    expect(await generateTotpCode(RFC_SECRET_B32, step)).toBe(eightDigits.slice(-6))
  })
})

describe('verifyTotpCode', () => {
  const NOW = 1_700_000_000_000 // mốc thời gian cố định để test tất định

  async function codeAt(offsetSteps: number): Promise<string> {
    return generateTotpCode(RFC_SECRET_B32, currentTimeStep(NOW) + offsetSteps)
  }

  it('chấp nhận mã của bước hiện tại', async () => {
    const res = await verifyTotpCode(RFC_SECRET_B32, await codeAt(0), { nowMs: NOW })
    expect(res.valid).toBe(true)
    expect(res.timeStep).toBe(currentTimeStep(NOW))
  })

  it('chấp nhận lệch ±1 bước (đồng hồ điện thoại lệch, người dùng gõ chậm)', async () => {
    expect((await verifyTotpCode(RFC_SECRET_B32, await codeAt(-1), { nowMs: NOW })).valid).toBe(
      true,
    )
    expect((await verifyTotpCode(RFC_SECRET_B32, await codeAt(1), { nowMs: NOW })).valid).toBe(true)
  })

  it('TỪ CHỐI lệch quá ±1 bước', async () => {
    expect((await verifyTotpCode(RFC_SECRET_B32, await codeAt(-2), { nowMs: NOW })).valid).toBe(
      false,
    )
    expect((await verifyTotpCode(RFC_SECRET_B32, await codeAt(2), { nowMs: NOW })).valid).toBe(
      false,
    )
  })

  it('bỏ qua khoảng trắng người dùng dán kèm', async () => {
    const code = await codeAt(0)
    const spaced = `${code.slice(0, 3)} ${code.slice(3)}`
    expect((await verifyTotpCode(RFC_SECRET_B32, spaced, { nowMs: NOW })).valid).toBe(true)
  })

  it('định dạng sai → từ chối, không ném lỗi', async () => {
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 34', '١٢٣٤٥٦']) {
      const res = await verifyTotpCode(RFC_SECRET_B32, bad, { nowMs: NOW })
      expect(res.valid).toBe(false)
      expect(res.timeStep).toBeNull()
    }
  })

  // ── Chống DÙNG LẠI mã ────────────────────────────────────────────────────
  it('mã đã dùng KHÔNG dùng lại được trong cùng chu kỳ', async () => {
    const code = await codeAt(0)
    const first = await verifyTotpCode(RFC_SECRET_B32, code, { nowMs: NOW })
    expect(first.valid).toBe(true)

    const replay = await verifyTotpCode(RFC_SECRET_B32, code, {
      nowMs: NOW,
      lastUsedStep: first.timeStep,
    })
    expect(replay.valid).toBe(false)
  })

  it('mã của bước CŨ HƠN lần dùng gần nhất cũng bị từ chối', async () => {
    // Ca thật: kẻ tấn công bắt được mã ở bước trước rồi thử dùng trong cửa sổ ±1.
    const older = await codeAt(-1)
    const res = await verifyTotpCode(RFC_SECRET_B32, older, {
      nowMs: NOW,
      lastUsedStep: currentTimeStep(NOW),
    })
    expect(res.valid).toBe(false)
  })

  it('mã của bước MỚI vẫn dùng được sau khi đã dùng bước cũ', async () => {
    const res = await verifyTotpCode(RFC_SECRET_B32, await codeAt(1), {
      nowMs: NOW,
      lastUsedStep: currentTimeStep(NOW),
    })
    expect(res.valid).toBe(true)
  })

  it('sai secret → từ chối', async () => {
    const other = generateTotpSecret()
    expect((await verifyTotpCode(other, await codeAt(0), { nowMs: NOW })).valid).toBe(false)
  })
})

describe('generateTotpSecret', () => {
  it('sinh secret Base32 dùng được, mỗi lần một khác', () => {
    const a = generateTotpSecret()
    const b = generateTotpSecret()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Z2-7]+$/)
    expect(base32Decode(a).length).toBe(20) // 160 bit theo khuyến nghị RFC 4226
  })
})

describe('buildOtpAuthUri', () => {
  it('đủ tham số app xác thực cần', () => {
    const uri = buildOtpAuthUri('ABCDEFGH', 'lien@example.com')
    expect(uri.startsWith('otpauth://totp/')).toBe(true)
    expect(uri).toContain('secret=ABCDEFGH')
    expect(uri).toContain('issuer=DHCB')
    expect(uri).toContain('algorithm=SHA1')
    expect(uri).toContain('digits=6')
    expect(uri).toContain('period=30')
  })

  it('label có tiền tố issuer và được encode', () => {
    const uri = buildOtpAuthUri('S', 'a b+c@d.vn')
    expect(uri).toContain(`otpauth://totp/${encodeURIComponent('DHCB:a b+c@d.vn')}?`)
  })
})
