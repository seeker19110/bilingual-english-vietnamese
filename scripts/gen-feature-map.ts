// scripts/gen-feature-map.ts — Sinh `docs/FEATURE-MAP.md`: bản đồ TÍNH NĂNG của nền tảng
// (route giao diện ↔ endpoint API ↔ gói/bảng liên quan).
//
// Vì sao SINH TỰ ĐỘNG chứ không viết tay: audit toàn diện 2026-09-05 (F11) cần một nguồn để đối
// chiếu chéo tính năng, nhưng một bản đồ chép tay sẽ lệch khỏi code đúng như `AUDIT.md` đã lệch
// (F6). Bản đồ này đọc thẳng `apps/dhcb/src/App.tsx` + `apps/server/src/routes.ts`, nên chạy lại
// là đúng lại. Chạy: `npm run gen:feature-map`.

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const REPO_ROOT = path.resolve(import.meta.dirname, '..')

/** Mọi `path="..."` khai trong cây route của app chính. */
export function extractRoutes(appSource: string): string[] {
  const found = [...appSource.matchAll(/path="([^"]+)"/g)].map((m) => m[1] as string)
  return [...new Set(found)].sort()
}

/** Mọi đường dẫn '/api/...' gắn trong bảng route của server. */
export function extractApiPaths(routesSource: string): string[] {
  const found = [...routesSource.matchAll(/'(\/api\/[^']*)'/g)].map((m) => m[1] as string)
  return [...new Set(found)].sort()
}

/** Gom route theo trụ (đoạn đầu của đường dẫn) để bảng đọc được. */
export function groupByPillar(paths: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const p of paths) {
    const head = p.replace(/^\//, '').split('/')[0] || '(gốc)'
    const list = groups.get(head) ?? []
    list.push(p)
    groups.set(head, list)
  }
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}

function render(routes: string[], apis: string[]): string {
  const lines: string[] = []
  lines.push('<!-- FILE NÀY ĐƯỢC SINH TỰ ĐỘNG — đừng sửa tay. Chạy: npm run gen:feature-map -->')
  lines.push('')
  lines.push('# FEATURE-MAP — bản đồ tính năng nền tảng DHCB')
  lines.push('')
  lines.push(
    'Nguồn: `apps/dhcb/src/App.tsx` (route giao diện) + `apps/server/src/routes.ts` (endpoint API).',
  )
  lines.push(
    'Dùng để **đối chiếu chéo tính năng** trong audit toàn diện (Nhóm 12): một tính năng có màn hình',
  )
  lines.push(
    'mà không có API, hoặc có API mà không màn hình nào gọi, là dấu hiệu việc làm dở dang.',
  )
  lines.push('')
  lines.push(`Tổng: **${routes.length} route giao diện** · **${apis.length} endpoint API**.`)
  lines.push('')
  lines.push('## Route giao diện theo trụ')
  lines.push('')
  for (const [pillar, list] of groupByPillar(routes)) {
    lines.push(`### \`/${pillar}\` — ${list.length} route`)
    lines.push('')
    for (const r of list) lines.push(`- \`${r}\``)
    lines.push('')
  }
  lines.push('## Endpoint API theo trụ')
  lines.push('')
  for (const [pillar, list] of groupByPillar(apis.map((a) => a.replace(/^\/api/, '')))) {
    lines.push(`### \`/api/${pillar}\` — ${list.length} endpoint`)
    lines.push('')
    for (const a of list) lines.push(`- \`/api${a}\``)
    lines.push('')
  }
  return lines.join('\n')
}

function main(): void {
  const app = readFileSync(path.join(REPO_ROOT, 'apps/dhcb/src/App.tsx'), 'utf8')
  const routes = readFileSync(path.join(REPO_ROOT, 'apps/server/src/routes.ts'), 'utf8')
  const out = path.join(REPO_ROOT, 'docs/FEATURE-MAP.md')
  writeFileSync(out, render(extractRoutes(app), extractApiPaths(routes)), 'utf8')
  console.log(`Đã ghi ${out}`)
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) main()
