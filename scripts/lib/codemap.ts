// scripts/lib/codemap.ts — LOGIC THUẦN dựng & tra cứu "bản đồ code" của dự án.
//
// Mục đích: cho AI (và người) trả lời nhanh các câu hỏi kiến trúc trước khi sửa code:
//   • "Sửa file này thì ảnh hưởng những file nào?"  (đồ thị import, lan truyền ngược)
//   • "Hàm này ai đang gọi?"                        (đồ thị lời gọi hàm)
// Thay cho GitNexus (license PolyForm Noncommercial, xung đột với dự án có thu phí —
// xem PROGRESS.md mục "Quyết định quan trọng" ngày 2026-08-04).
//
// Tách khỏi scripts/codemap.ts (phần đọc đĩa/CLI) để test được bằng vitest với đồ thị dựng tay,
// không cần chạy TypeScript compiler thật trong test.

/** Một cạnh "file A import file B". Đường dẫn luôn tương đối gốc repo, dùng dấu `/`. */
export interface ImportEdge {
  from: string
  to: string
}

/** Một cạnh "hàm ở `from` gọi hàm `to`". Khoá hàm có dạng `đường/dẫn.ts#tênHàm`. */
export interface CallEdge {
  from: string
  to: string
}

export interface CodeGraph {
  /** Danh sách file đã quét (tương đối gốc repo). */
  files: string[]
  imports: ImportEdge[]
  calls: CallEdge[]
}

/** Khoá định danh một hàm trong đồ thị lời gọi. */
export function functionKey(file: string, name: string): string {
  return `${file}#${name}`
}

/** Tách khoá hàm ngược lại thành file + tên. Trả `null` nếu khoá không đúng dạng. */
export function parseFunctionKey(key: string): { file: string; name: string } | null {
  const hashAt = key.lastIndexOf('#')
  if (hashAt <= 0 || hashAt === key.length - 1) return null
  return { file: key.slice(0, hashAt), name: key.slice(hashAt + 1) }
}

/** Gom cạnh thành map `đích → danh sách nguồn` để tra ngược cho nhanh. */
function buildReverseIndex(edges: { from: string; to: string }[]): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const edge of edges) {
    const sources = index.get(edge.to)
    if (sources) sources.push(edge.from)
    else index.set(edge.to, [edge.from])
  }
  return index
}

/**
 * Tìm mọi file bị ảnh hưởng khi sửa `target` — tức các file import (trực tiếp hoặc gián tiếp) nó.
 *
 * `maxDepth` giới hạn số tầng lan truyền (mặc định không giới hạn). Đồ thị import CÓ THỂ có
 * chu trình (A import B, B import A) nên phải đánh dấu đã thăm, nếu không sẽ lặp vô hạn.
 * Kết quả KHÔNG chứa chính `target`, và sắp xếp theo khoảng cách tăng dần rồi theo tên.
 */
export function findImpactedFiles(
  graph: CodeGraph,
  target: string,
  maxDepth = Number.POSITIVE_INFINITY,
): { file: string; depth: number }[] {
  const importers = buildReverseIndex(graph.imports)
  const seen = new Set<string>([target])
  const result: { file: string; depth: number }[] = []
  let frontier = [target]
  let depth = 0

  while (frontier.length > 0 && depth < maxDepth) {
    depth += 1
    const next: string[] = []
    for (const file of frontier) {
      for (const importer of importers.get(file) ?? []) {
        if (seen.has(importer)) continue
        seen.add(importer)
        next.push(importer)
        result.push({ file: importer, depth })
      }
    }
    // Cùng một tầng thì sắp theo tên để kết quả ổn định giữa các lần chạy.
    next.sort()
    frontier = next
  }
  return result
}

/**
 * Tìm những hàm gọi tới `target` (khoá dạng `file#tên`).
 *
 * `maxDepth = 1` là "ai gọi trực tiếp"; lớn hơn thì truy ngược tiếp lên chuỗi lời gọi.
 * Đệ quy (hàm tự gọi mình) và chu trình lời gọi đều được chặn bằng tập đã thăm.
 */
export function findCallers(
  graph: CodeGraph,
  target: string,
  maxDepth = 1,
): { fn: string; depth: number }[] {
  const callers = buildReverseIndex(graph.calls)
  const seen = new Set<string>([target])
  const result: { fn: string; depth: number }[] = []
  let frontier = [target]
  let depth = 0

  while (frontier.length > 0 && depth < maxDepth) {
    depth += 1
    const next: string[] = []
    for (const fn of frontier) {
      for (const caller of callers.get(fn) ?? []) {
        if (seen.has(caller)) continue
        seen.add(caller)
        next.push(caller)
        result.push({ fn: caller, depth })
      }
    }
    next.sort()
    frontier = next
  }
  return result
}

/**
 * Tìm file "mồ côi": không file nào trong đồ thị import tới.
 *
 * CẢNH BÁO: mồ côi KHÔNG đồng nghĩa với code chết. Điểm vào (server.ts, trang route, script
 * chạy tay, file test, cấu hình) vốn dĩ không ai import — nên `entryPoints` dùng để loại chúng ra.
 * Luôn kiểm tra bằng mắt trước khi xoá bất cứ thứ gì trong danh sách này.
 */
export function findOrphanFiles(graph: CodeGraph, entryPoints: string[] = []): string[] {
  const imported = new Set(graph.imports.map((edge) => edge.to))
  const entries = new Set(entryPoints)
  return graph.files.filter((file) => !imported.has(file) && !entries.has(file)).sort()
}

/** Các file bị import nhiều nhất — sửa chúng là rủi ro nhất, nên có test kỹ nhất. */
export function findHotspots(graph: CodeGraph, limit = 10): { file: string; importedBy: number }[] {
  const counts = new Map<string, number>()
  for (const edge of graph.imports) {
    counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([file, importedBy]) => ({ file, importedBy }))
    .sort((a, b) => b.importedBy - a.importedBy || a.file.localeCompare(b.file))
    .slice(0, limit)
}

/**
 * Tìm chu trình import giữa các file (A → B → A). Chu trình không phải lúc nào cũng là lỗi,
 * nhưng thường gây khó hiểu và có thể làm giá trị lúc khởi tạo module bị `undefined`.
 * Trả về mỗi chu trình một lần, đã chuẩn hoá để không lặp cùng một vòng ở nhiều điểm bắt đầu.
 */
export function findImportCycles(graph: CodeGraph, limit = 20): string[][] {
  const outgoing = new Map<string, string[]>()
  for (const edge of graph.imports) {
    const targets = outgoing.get(edge.from)
    if (targets) targets.push(edge.to)
    else outgoing.set(edge.from, [edge.to])
  }

  const cycles: string[][] = []
  const seenCycles = new Set<string>()
  const visited = new Set<string>()
  const stack: string[] = []
  const onStack = new Set<string>()

  const walk = (file: string): void => {
    if (cycles.length >= limit) return
    visited.add(file)
    stack.push(file)
    onStack.add(file)

    for (const next of outgoing.get(file) ?? []) {
      if (onStack.has(next)) {
        const cycle = stack.slice(stack.indexOf(next))
        // Xoay vòng về phần tử nhỏ nhất để cùng một chu trình luôn cho cùng một chuỗi khoá.
        const smallestAt = cycle.indexOf([...cycle].sort()[0] as string)
        const normalized = [...cycle.slice(smallestAt), ...cycle.slice(0, smallestAt)]
        const key = normalized.join(' → ')
        if (!seenCycles.has(key)) {
          seenCycles.add(key)
          cycles.push(normalized)
        }
      } else if (!visited.has(next)) {
        walk(next)
      }
    }

    stack.pop()
    onStack.delete(file)
  }

  for (const file of [...graph.files].sort()) walk(file)
  return cycles.slice(0, limit)
}
