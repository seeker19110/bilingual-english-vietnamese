// scripts/codemap.ts — "bản đồ code" của dự án: đồ thị import + đồ thị lời gọi hàm.
//
// Dùng để trả lời TRƯỚC KHI SỬA CODE: "sửa file này gãy chỗ nào?", "hàm này ai gọi?".
// Đây là bản tự viết thay cho GitNexus (license PolyForm Noncommercial, xung đột với dự án
// có thu phí — xem PROGRESS.md ngày 2026-08-04).
//
// File này chỉ còn phần CLI + đọc/ghi .codemap/graph.json. Hai phần có test nằm ở:
//   scripts/lib/scanGraph.ts — QUÉT mã nguồn dựng đồ thị (nhận rootDir nên test được)
//   scripts/lib/codemap.ts   — LOGIC thuần trên đồ thị (impact/callers/cycles/…)
//
// Cách dùng:
//   npm run codemap                              # quét lại, ghi .codemap/graph.json
//   npm run codemap -- impact api/_lib/usage.ts  # file nào bị ảnh hưởng nếu sửa file này
//   npm run codemap -- callers api/_lib/usage.ts#checkUsage
//   npm run codemap -- hotspots                  # file bị import nhiều nhất (sửa = rủi ro cao)
//   npm run codemap -- cycles                    # chu trình import
//   npm run codemap -- orphans                   # file không ai import (KIỂM TRA TAY trước khi xoá)
//
// Lệnh tra cứu tự quét lại nếu chưa có .codemap/graph.json.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  findCallers,
  findHotspots,
  findImpactedFiles,
  findImportCycles,
  findOrphanFiles,
  type CodeGraph,
} from './lib/codemap'
import { scanGraph } from './lib/scanGraph'

const REPO_ROOT = path.resolve(import.meta.dirname, '..')
const OUTPUT_FILE = path.join(REPO_ROOT, '.codemap', 'graph.json')

/** Thư mục được quét. Bỏ qua node_modules/dist vì không phải code của mình. */
const SCAN_ROOTS = ['apps/english/src', 'apps/hub/src', 'api', 'packages', 'scripts']
/** File điểm vào — vốn dĩ không ai import, không tính là "mồ côi". */
const ENTRY_POINTS = ['server.ts']

/** Dựng lại đồ thị từ mã nguồn thật của repo này. */
function buildGraph(): CodeGraph {
  return scanGraph({ rootDir: REPO_ROOT, scanRoots: SCAN_ROOTS, entryPoints: ENTRY_POINTS })
}

function saveGraph(graph: CodeGraph): void {
  mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  writeFileSync(OUTPUT_FILE, JSON.stringify(graph), 'utf8')
}

/** Đọc đồ thị đã lưu; chưa có thì quét mới rồi lưu lại. */
function loadGraph(): CodeGraph {
  if (!existsSync(OUTPUT_FILE)) {
    console.log('Chưa có bản đồ — đang quét lần đầu (mất khoảng 1 phút)...')
    const graph = buildGraph()
    saveGraph(graph)
    return graph
  }
  return JSON.parse(readFileSync(OUTPUT_FILE, 'utf8')) as CodeGraph
}

function printUsage(): void {
  console.log(`Bản đồ code — tra cứu kiến trúc trước khi sửa

  npm run codemap                       Quét lại toàn dự án, ghi .codemap/graph.json
  npm run codemap -- impact <file>      File nào bị ảnh hưởng nếu sửa <file>
  npm run codemap -- callers <file#hàm> Hàm nào đang gọi tới hàm này
  npm run codemap -- hotspots           File bị import nhiều nhất (sửa = rủi ro cao nhất)
  npm run codemap -- cycles             Chu trình import
  npm run codemap -- orphans            File không ai import (KIỂM TRA TAY trước khi xoá)

Tuỳ chọn: --depth <n> cho impact/callers (mặc định impact = không giới hạn, callers = 1).`)
}

function readDepthFlag(args: string[], fallback: number): number {
  const at = args.indexOf('--depth')
  if (at === -1) return fallback
  const raw = args[at + 1]
  const value = Number(raw)
  if (!raw || !Number.isInteger(value) || value < 1) {
    console.error(`--depth phải là số nguyên ≥ 1 (nhận được: ${raw ?? 'không có'})`)
    process.exit(1)
  }
  return value
}

function main(): void {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log('Đang quét toàn dự án...')
    const graph = buildGraph()
    saveGraph(graph)
    console.log(
      `Xong: ${graph.files.length} file · ${graph.imports.length} cạnh import · ` +
        `${graph.calls.length} cạnh lời gọi → ${path.relative(REPO_ROOT, OUTPUT_FILE)}`,
    )
    return
  }

  if (command === '--help' || command === '-h') {
    printUsage()
    return
  }

  const graph = loadGraph()

  switch (command) {
    case 'impact': {
      const target = args[1]
      if (!target) {
        console.error('Thiếu đường dẫn file. Ví dụ: npm run codemap -- impact api/_lib/usage.ts')
        process.exit(1)
      }
      if (!graph.files.includes(target)) {
        console.error(`Không có file "${target}" trong bản đồ. Đường dẫn phải tương đối gốc repo.`)
        process.exit(1)
      }
      const impacted = findImpactedFiles(graph, target, readDepthFlag(args, Infinity))
      if (impacted.length === 0) {
        console.log(`Không file nào import "${target}".`)
        return
      }
      console.log(`${impacted.length} file bị ảnh hưởng khi sửa "${target}":`)
      for (const { file, depth } of impacted) console.log(`  ${'·'.repeat(depth)} ${file}`)
      return
    }

    case 'callers': {
      const target = args[1]
      if (!target?.includes('#')) {
        console.error('Cần dạng <file>#<tênHàm>. Ví dụ: api/_lib/usage.ts#checkUsage')
        process.exit(1)
      }
      const callers = findCallers(graph, target, readDepthFlag(args, 1))
      if (callers.length === 0) {
        console.log(`Không hàm nào gọi "${target}" (hoặc chỉ được gọi gián tiếp — thử --depth 3).`)
        return
      }
      console.log(`${callers.length} hàm gọi tới "${target}":`)
      for (const { fn, depth } of callers) console.log(`  ${'·'.repeat(depth)} ${fn}`)
      return
    }

    case 'hotspots': {
      console.log('File bị import nhiều nhất (sửa = rủi ro cao nhất, nên có test kỹ nhất):')
      for (const { file, importedBy } of findHotspots(graph)) {
        console.log(`  ${String(importedBy).padStart(4)} ← ${file}`)
      }
      return
    }

    case 'cycles': {
      const cycles = findImportCycles(graph)
      if (cycles.length === 0) {
        console.log('Không có chu trình import.')
        return
      }
      console.log(`${cycles.length} chu trình import:`)
      for (const cycle of cycles) console.log(`  ${[...cycle, cycle[0]].join(' → ')}`)
      return
    }

    case 'orphans': {
      const orphans = findOrphanFiles(graph, ENTRY_POINTS)
      console.log(
        `${orphans.length} file không ai import. LƯU Ý: test, script chạy tay, trang route ` +
          'vốn dĩ không ai import — KIỂM TRA TAY trước khi xoá bất cứ thứ gì.',
      )
      for (const file of orphans) console.log(`  ${file}`)
      return
    }

    default:
      console.error(`Lệnh không hợp lệ: "${command}"\n`)
      printUsage()
      process.exit(1)
  }
}

main()
