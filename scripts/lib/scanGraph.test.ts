// Test cho phần QUÉT của codemap (dựng đồ thị bằng TypeScript compiler API).
//
// Vì sao cần: bản đầu bỏ sót `import('./x')` nên `impact` báo "không ai import Login.tsx"
// trong khi App.tsx nạp nó qua lazyWithRetry(). Cổng merge (CLAUDE.md mục 9) lại dựa vào
// lệnh này, nên báo sót tạo CẢM GIÁC AN TOÀN GIẢ. Test dưới đây khoá cả 3 dạng import lại.
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { scanGraph } from './scanGraph'
import type { CodeGraph } from './codemap'

let root: string
let graph: CodeGraph

/** Ghi file trong repo giả, tự tạo thư mục cha. */
function write(relativePath: string, content: string): void {
  const absolute = path.join(root, relativePath)
  mkdirSync(path.dirname(absolute), { recursive: true })
  writeFileSync(absolute, content, 'utf8')
}

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), 'codemap-test-'))

  write('src/target.ts', 'export function target(): number {\n  return 1\n}\n')
  // 1. import tĩnh + có lời gọi hàm xuyên file
  write(
    'src/staticImport.ts',
    "import { target } from './target'\n\nexport function callsTarget(): number {\n  return target()\n}\n",
  )
  // 2. re-export
  write('src/reExport.ts', "export { target } from './target'\n")
  // 3. import động — ca từng bị bỏ sót
  write(
    'src/dynamicImport.ts',
    "export async function lazyTarget(): Promise<unknown> {\n  return import('./target')\n}\n",
  )
  // Thư viện ngoài: KHÔNG được thành cạnh
  write('src/external.ts', "import path from 'node:path'\n\nexport const sep = path.sep\n")
  // Ngoài scanRoots: KHÔNG được xuất hiện trong đồ thị
  write('outside/ignored.ts', "import { target } from '../src/target'\n\nexport const x = target\n")
  // Điểm vào: không ai import nhưng vẫn phải nằm trong đồ thị
  write('server.ts', "import { target } from './src/target'\n\nexport const boot = target\n")

  graph = scanGraph({ rootDir: root, scanRoots: ['src'], entryPoints: ['server.ts'] })
}, 30000)

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

const hasImport = (from: string, to: string): boolean =>
  graph.imports.some((edge) => edge.from === from && edge.to === to)

describe('scanGraph — cạnh import', () => {
  it('bắt import tĩnh', () => {
    expect(hasImport('src/staticImport.ts', 'src/target.ts')).toBe(true)
  })

  it('bắt re-export', () => {
    expect(hasImport('src/reExport.ts', 'src/target.ts')).toBe(true)
  })

  it('bắt import động — hồi quy cho lỗi bỏ sót trang route nạp lazy', () => {
    expect(hasImport('src/dynamicImport.ts', 'src/target.ts')).toBe(true)
  })

  it('bỏ qua thư viện ngoài', () => {
    expect(graph.imports.some((edge) => edge.from === 'src/external.ts')).toBe(false)
  })

  it('bắt import từ file điểm vào', () => {
    expect(hasImport('server.ts', 'src/target.ts')).toBe(true)
  })
})

describe('scanGraph — phạm vi quét', () => {
  it('chỉ gồm file trong scanRoots và entryPoints', () => {
    expect(graph.files).toContain('src/target.ts')
    expect(graph.files).toContain('server.ts')
    expect(graph.files).not.toContain('outside/ignored.ts')
  })

  it('không tạo cạnh từ file ngoài phạm vi', () => {
    expect(graph.imports.some((edge) => edge.from === 'outside/ignored.ts')).toBe(false)
  })

  it('danh sách file đã sắp xếp, không trùng', () => {
    expect(graph.files).toEqual([...graph.files].sort())
    expect(new Set(graph.files).size).toBe(graph.files.length)
  })
})

describe('scanGraph — cạnh lời gọi hàm', () => {
  it('lần được lời gọi xuyên file về đúng khai báo gốc', () => {
    expect(
      graph.calls.some(
        (edge) =>
          edge.from === 'src/staticImport.ts#callsTarget' && edge.to === 'src/target.ts#target',
      ),
    ).toBe(true)
  })
})

describe('scanGraph — ca biên', () => {
  it('scanRoots rỗng cho đồ thị rỗng, không ném lỗi', () => {
    const empty = scanGraph({ rootDir: root, scanRoots: [], entryPoints: [] })
    expect(empty).toEqual({ files: [], imports: [], calls: [] })
  })

  it('thư mục không tồn tại thì bỏ qua, không ném lỗi', () => {
    const missing = scanGraph({ rootDir: root, scanRoots: ['khong-co-that'], entryPoints: [] })
    expect(missing.files).toEqual([])
  })
})
