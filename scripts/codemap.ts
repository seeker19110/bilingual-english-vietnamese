// scripts/codemap.ts — "bản đồ code" của dự án: đồ thị import + đồ thị lời gọi hàm.
//
// Dùng để trả lời TRƯỚC KHI SỬA CODE: "sửa file này gãy chỗ nào?", "hàm này ai gọi?".
// Đây là bản tự viết thay cho GitNexus (license PolyForm Noncommercial, xung đột với dự án
// có thu phí — xem PROGRESS.md ngày 2026-08-04). Logic thuần + test ở scripts/lib/codemap.ts.
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

import ts from 'typescript'

import {
  findCallers,
  findHotspots,
  findImpactedFiles,
  findImportCycles,
  findOrphanFiles,
  functionKey,
  type CallEdge,
  type CodeGraph,
  type ImportEdge,
} from './lib/codemap'

const REPO_ROOT = path.resolve(import.meta.dirname, '..')
const OUTPUT_FILE = path.join(REPO_ROOT, '.codemap', 'graph.json')

/** Thư mục được quét. Bỏ qua node_modules/dist vì không phải code của mình. */
const SCAN_ROOTS = ['apps/english/src', 'apps/hub/src', 'api', 'packages', 'scripts']
/** File điểm vào — vốn dĩ không ai import, không tính là "mồ côi". */
const ENTRY_POINTS = ['server.ts']

/** Đổi đường dẫn tuyệt đối thành tương đối gốc repo, luôn dùng `/` để ổn định giữa các máy. */
function toRepoPath(absolutePath: string): string {
  return path.relative(REPO_ROOT, absolutePath).split(path.sep).join('/')
}

function isScanned(repoPath: string): boolean {
  if (repoPath.startsWith('..') || repoPath.includes('node_modules')) return false
  if (ENTRY_POINTS.includes(repoPath)) return true
  return SCAN_ROOTS.some((root) => repoPath === root || repoPath.startsWith(`${root}/`))
}

/**
 * Tên hàm chứa một node — leo cây cha đến khai báo hàm/phương thức gần nhất.
 * Code nằm ở cấp module (không trong hàm nào) được gắn nhãn `<module>` để vẫn truy được nguồn gốc.
 */
function enclosingFunctionName(node: ts.Node): string {
  for (let current: ts.Node | undefined = node; current; current = current.parent) {
    if (ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)) {
      if (current.name) return current.name.getText()
    }
    // const foo = () => {...} / const foo = function () {...}
    if (
      (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) &&
      current.parent &&
      ts.isVariableDeclaration(current.parent) &&
      ts.isIdentifier(current.parent.name)
    ) {
      return current.parent.name.getText()
    }
  }
  return '<module>'
}

/** Dựng đồ thị bằng TypeScript compiler API — dùng type checker nên bám đúng khai báo thật. */
function buildGraph(): CodeGraph {
  const configPath = path.join(REPO_ROOT, 'tsconfig.json')
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, REPO_ROOT)

  // Quét rộng hơn `include` của tsconfig (vốn chỉ có apps/english/src + packages/core-ui)
  // để phủ cả api/, scripts/, apps/hub/ và server.ts trong cùng một chương trình.
  const rootNames = SCAN_ROOTS.flatMap((root) => {
    const absolute = path.join(REPO_ROOT, root)
    if (!existsSync(absolute)) return []
    return ts.sys.readDirectory(absolute, ['.ts', '.tsx'], ['node_modules', 'dist'])
  }).concat(ENTRY_POINTS.map((entry) => path.join(REPO_ROOT, entry)).filter(existsSync))

  const program = ts.createProgram(rootNames, {
    ...parsed.options,
    noEmit: true,
    // Không cần lỗi kiểu chính xác, chỉ cần phân giải được symbol → bỏ check .d.ts cho nhanh.
    skipLibCheck: true,
  })
  const checker = program.getTypeChecker()

  const files: string[] = []
  const imports: ImportEdge[] = []
  const calls: CallEdge[] = []
  const seenImports = new Set<string>()
  const seenCalls = new Set<string>()

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue
    const fromPath = toRepoPath(sourceFile.fileName)
    if (!isScanned(fromPath)) continue
    files.push(fromPath)

    const visit = (node: ts.Node): void => {
      // ── Cạnh import ──
      // Bắt CẢ 3 dạng, nếu thiếu dạng nào thì `impact` sẽ báo sót và cho cảm giác
      // an toàn giả (bài học: các trang route đều nạp bằng dynamic import nên ban
      // đầu `impact` tưởng "không ai import"):
      //   1. import tĩnh:   import X from './x'
      //   2. re-export:     export { X } from './x'
      //   3. import động:   import('./x')  — dùng ở App.tsx qua lazyWithRetry()
      let moduleSpecifier: ts.StringLiteral | undefined
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0]
        if (arg && ts.isStringLiteral(arg)) moduleSpecifier = arg
      } else if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        moduleSpecifier = node.moduleSpecifier
      }
      if (moduleSpecifier) {
        const resolved = ts.resolveModuleName(
          moduleSpecifier.text,
          sourceFile.fileName,
          program.getCompilerOptions(),
          ts.sys,
        ).resolvedModule
        if (resolved && !resolved.isExternalLibraryImport) {
          const toPath = toRepoPath(resolved.resolvedFileName)
          if (isScanned(toPath) && toPath !== fromPath) {
            const key = `${fromPath}\u0000${toPath}`
            if (!seenImports.has(key)) {
              seenImports.add(key)
              imports.push({ from: fromPath, to: toPath })
            }
          }
        }
      }

      // ── Cạnh lời gọi hàm ──
      if (ts.isCallExpression(node)) {
        const symbol = checker.getSymbolAtLocation(
          ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression,
        )
        // Hàm import vào là alias — phải lần về khai báo gốc mới biết nó nằm ở file nào.
        const resolvedSymbol =
          symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
        const declaration = resolvedSymbol?.declarations?.[0]
        if (declaration) {
          const targetFile = toRepoPath(declaration.getSourceFile().fileName)
          if (isScanned(targetFile)) {
            const from = functionKey(fromPath, enclosingFunctionName(node))
            const to = functionKey(targetFile, resolvedSymbol!.getName())
            if (from !== to) {
              const key = `${from}\u0000${to}`
              if (!seenCalls.has(key)) {
                seenCalls.add(key)
                calls.push({ from, to })
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }

  files.sort()
  return { files, imports, calls }
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
        `${graph.calls.length} cạnh lời gọi → ${toRepoPath(OUTPUT_FILE)}`,
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
