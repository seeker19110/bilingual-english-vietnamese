// Test canh cổng: MỌI handler trong api/ đều phải được gắn route trong server.ts.
//
// Vì sao cần: handler viết xong + có test riêng vẫn khiến CI xanh, nhưng nếu quên thêm
// dòng `app.all('/api/xxx', ...)` trong server.ts thì request rơi vào SPA fallback và trả
// về index.html → UI báo lỗi kiểu "Unexpected token '<', \"<!doctype \"... is not valid JSON".
// Lỗi này đã xảy ra 2 lần thật (api/admin-price-promo.ts và api/admin-users.ts).

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(__dirname, '..')

// Handler có đường dẫn URL KHÁC tên file — khai báo tường minh ở đây.
const CUSTOM_PATH: Record<string, string> = {
  ai: 'agent', // api/ai.ts phục vụ /api/agent
}

// File trong api/ KHÔNG phải handler HTTP (không cần route). Thêm vào đây nếu có thêm.
const NOT_A_HANDLER = new Set<string>([])

function listHandlers(): string[] {
  return readdirSync(join(ROOT, 'api'))
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.endsWith('.d.ts'))
    .map((f) => f.replace(/\.ts$/, ''))
    .filter((name) => !NOT_A_HANDLER.has(name))
}

describe('server.ts đăng ký đủ route cho api/', () => {
  const server = readFileSync(join(ROOT, 'server.ts'), 'utf8')
  const handlers = listHandlers()

  it('tìm thấy danh sách handler (chống test rỗng vô nghĩa)', () => {
    expect(handlers.length).toBeGreaterThan(10)
  })

  it.each(handlers)('api/%s.ts được import trong server.ts', (name) => {
    // server.ts import theo kiểu ESM có đuôi .js (xem cấu hình tsconfig.server.json)
    expect(server).toContain(`from './api/${name}.js'`)
  })

  it.each(handlers)('api/%s.ts được gắn route trong server.ts', (name) => {
    const urlPath = CUSTOM_PATH[name] ?? name
    expect(server).toContain(`'/api/${urlPath}'`)
  })
})
