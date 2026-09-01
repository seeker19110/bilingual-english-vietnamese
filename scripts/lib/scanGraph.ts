// Phần QUÉT của codemap: đọc mã nguồn bằng TypeScript compiler API rồi dựng
// đồ thị import + đồ thị lời gọi hàm.
//
// Tách khỏi scripts/codemap.ts (vốn chỉ còn phần CLI + đọc/ghi file) để nhận
// `rootDir`/`scanRoots` qua tham số — nhờ vậy test được bằng repo giả trong thư
// mục tạm, thay vì phải quét cả dự án thật. Xem scanGraph.test.ts.

import { existsSync } from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { functionKey, type CallEdge, type CodeGraph, type ImportEdge } from './codemap'

export interface ScanOptions {
  /** Gốc repo — mọi đường dẫn trong đồ thị đều tương đối so với nó. */
  rootDir: string
  /** Thư mục được quét (tương đối `rootDir`). Bỏ node_modules/dist vì không phải code của mình. */
  scanRoots: string[]
  /** File điểm vào — vốn dĩ không ai import, không tính là "mồ côi". */
  entryPoints?: string[]
}

/** Dựng đồ thị bằng TypeScript compiler API — dùng type checker nên bám đúng khai báo thật. */
export function scanGraph({ rootDir, scanRoots, entryPoints = [] }: ScanOptions): CodeGraph {
  /** Đổi đường dẫn tuyệt đối thành tương đối gốc repo, luôn dùng `/` để ổn định giữa các máy. */
  const toRepoPath = (absolutePath: string): string =>
    path.relative(rootDir, absolutePath).split(path.sep).join('/')

  const isScanned = (repoPath: string): boolean => {
    if (repoPath.startsWith('..') || repoPath.includes('node_modules')) return false
    if (entryPoints.includes(repoPath)) return true
    return scanRoots.some((root) => repoPath === root || repoPath.startsWith(`${root}/`))
  }

  // Quét rộng hơn `include` của tsconfig (vốn chỉ có apps/dhcb/src + packages/core-ui)
  // để phủ cả api/, scripts/, apps/hub/ và server.ts trong cùng một chương trình.
  const rootNames = scanRoots
    .flatMap((root) => {
      const absolute = path.join(rootDir, root)
      if (!existsSync(absolute)) return []
      return ts.sys.readDirectory(absolute, ['.ts', '.tsx'], ['node_modules', 'dist'])
    })
    .concat(entryPoints.map((entry) => path.join(rootDir, entry)).filter(existsSync))

  if (rootNames.length === 0) return { files: [], imports: [], calls: [] }

  // tsconfig là tuỳ chọn: repo thật có, repo giả trong test thì không — thiếu vẫn quét được.
  const configPath = path.join(rootDir, 'tsconfig.json')
  const baseOptions = existsSync(configPath)
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configPath, ts.sys.readFile).config,
        ts.sys,
        rootDir,
      ).options
    : {}

  const program = ts.createProgram(rootNames, {
    ...baseOptions,
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
      //   4. worker:        new Worker(new URL('./x', import.meta.url)) — 5 file trong
      //      apps/dhcb/src/workers/ từng bị `orphans` báo mồ côi nhầm vì thiếu dạng này.
      let moduleSpecifier: ts.StringLiteral | undefined
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0]
        if (arg && ts.isStringLiteral(arg)) moduleSpecifier = arg
      } else if (isNewUrlWithImportMetaUrl(node)) {
        moduleSpecifier = node.arguments[0]
      } else if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        moduleSpecifier = node.moduleSpecifier
      }
      if (moduleSpecifier) {
        // Alias workspace `@dhcb/<ten-goi>/<duong-dan>` chua (va se khong) khai bao trong
        // tsconfig `paths` -- ts.resolveModuleName khong biet nen phai tu phan giai truoc:
        // `@dhcb/X/Y` -> `packages/X/Y.ts` (thu `.tsx` neu `.ts` khong ton tai).
        const dhcbTarget = resolveDhcbAlias(moduleSpecifier.text, rootDir)
        const resolvedFileName =
          dhcbTarget ??
          (() => {
            const resolved = ts.resolveModuleName(
              moduleSpecifier!.text,
              sourceFile.fileName,
              program.getCompilerOptions(),
              ts.sys,
            ).resolvedModule
            return resolved && !resolved.isExternalLibraryImport
              ? resolved.resolvedFileName
              : undefined
          })()
        if (resolvedFileName) {
          const toPath = toRepoPath(resolvedFileName)
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

/**
 * Phan giai alias workspace `@dhcb/<ten-goi>/<duong-dan>` -> `packages/<ten-goi>/<duong-dan>.ts`
 * (thu `.tsx` neu `.ts` khong ton tai). Chua vao tsconfig `paths` vi cac goi @dhcb/* dang duoc
 * tach dan (xem ADR-0001) -- tu phan giai bang tay o day de codemap theo kip ngay khi co import
 * moi, khong phai doi cap nhat tsconfig. Tra ve `undefined` neu khong khop dinh dang hoac file
 * khong ton tai (coi nhu module ngoai, giong module npm binh thuong).
 */
export function resolveDhcbAlias(moduleSpecifier: string, rootDir: string): string | undefined {
  const match = /^@dhcb\/([^/]+)\/(.+)$/.exec(moduleSpecifier)
  if (!match) return undefined
  const [, packageName, relativePath] = match
  if (!packageName || !relativePath) return undefined
  const base = path.join(rootDir, 'packages', packageName, relativePath)
  for (const ext of ['.ts', '.tsx']) {
    const candidate = `${base}${ext}`
    if (existsSync(candidate)) return candidate
  }
  return undefined
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

/** `new URL('<chuỗi>', import.meta.url)` — cách Vite tham chiếu file worker/asset theo module. */
function isNewUrlWithImportMetaUrl(
  node: ts.Node,
): node is ts.NewExpression & { arguments: [ts.StringLiteral, ts.Expression] } {
  if (!ts.isNewExpression(node) || !node.arguments || node.arguments.length < 2) return false
  if (!ts.isIdentifier(node.expression) || node.expression.text !== 'URL') return false
  const [first, second] = node.arguments
  if (!first || !second || !ts.isStringLiteral(first)) return false
  return (
    ts.isPropertyAccessExpression(second) &&
    ts.isMetaProperty(second.expression) &&
    second.expression.keywordToken === ts.SyntaxKind.ImportKeyword &&
    second.name.text === 'url'
  )
}
