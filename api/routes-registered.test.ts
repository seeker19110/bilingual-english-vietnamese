// Test canh cổng: MỌI handler trong api/ (và các package đã tách ở GĐ1 — xem
// docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md) đều phải được gắn route trong
// server.ts.
//
// Vì sao cần: handler viết xong + có test riêng vẫn khiến CI xanh, nhưng nếu quên thêm
// dòng `app.all('/api/xxx', ...)` trong server.ts thì request rơi vào SPA fallback và trả
// về index.html → UI báo lỗi kiểu "Unexpected token '<', \"<!doctype \"... is not valid JSON".
// Lỗi này đã xảy ra 2 lần thật (api/admin-price-promo.ts và api/admin-users.ts).
//
// [Cập nhật GĐ1 PR-3/4] api/tts.ts, api/stt.ts, api/ai.ts, api/auth.ts đã dời sang
// packages/core-ai/ + packages/core-auth/ cùng với các file THƯ VIỆN (aiConfig, authService,
// security, ...) không phải handler HTTP. Khác với api/ (thư viện nằm ở api/_lib/, một thư mục
// con tách biệt nên readdirSync(api) không quét nhầm), các package này để handler và thư viện
// NẰM CHUNG một cấp — không thể tự suy ra "mọi file .ts đều là handler" như với api/, nên phải
// khai báo TƯỜNG MINH danh sách handler của từng package dưới đây.

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(__dirname, '..')

type HandlerEntry = { importPath: string; urlPath: string }

// Handler có đường dẫn URL KHÁC tên file — khai báo tường minh ở đây.
const CUSTOM_PATH: Record<string, string> = {
  ai: 'agent', // api/ai.ts phục vụ /api/agent
}

// File trong api/ KHÔNG phải handler HTTP (không cần route). Thêm vào đây nếu có thêm.
const NOT_A_HANDLER = new Set<string>([])

function listApiHandlers(): HandlerEntry[] {
  return readdirSync(join(ROOT, 'api'))
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.endsWith('.d.ts'))
    .map((f) => f.replace(/\.ts$/, ''))
    .filter((name) => !NOT_A_HANDLER.has(name))
    .map((name) => ({
      importPath: `./api/${name}.js`,
      urlPath: `/api/${CUSTOM_PATH[name] ?? name}`,
    }))
}

// Handler HTTP thật trong các package đã tách khỏi api/ — CHỈ liệt kê file thật sự có
// `export default async function handler(req: Request)`, KHÔNG phải mọi file trong thư mục
// (packages/core-ai, packages/core-auth còn chứa nhiều file thư viện không phải route).
const PACKAGE_HANDLERS: HandlerEntry[] = [
  { importPath: './packages/core-ai/tts.js', urlPath: '/api/tts' },
  { importPath: './packages/core-ai/stt.js', urlPath: '/api/stt' },
  { importPath: './packages/core-ai/ai.js', urlPath: '/api/agent' },
  { importPath: './packages/core-auth/auth.js', urlPath: '/api/auth' },
]

describe('server.ts đăng ký đủ route cho api/ + packages/', () => {
  const server = readFileSync(join(ROOT, 'server.ts'), 'utf8')
  const handlers = [...listApiHandlers(), ...PACKAGE_HANDLERS]

  it('tìm thấy danh sách handler (chống test rỗng vô nghĩa)', () => {
    expect(handlers.length).toBeGreaterThan(10)
  })

  it.each(handlers)('$importPath được import trong server.ts', ({ importPath }) => {
    // server.ts import theo kiểu ESM có đuôi .js (xem cấu hình tsconfig.server.json)
    expect(server).toContain(`from '${importPath}'`)
  })

  it.each(handlers)('$importPath được gắn route trong server.ts', ({ urlPath }) => {
    expect(server).toContain(`'${urlPath}'`)
  })
})
