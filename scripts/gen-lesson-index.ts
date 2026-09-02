// gen-lesson-index — sinh `packages/subject-programming/lessonsLazy.ts` từ registry bài học.
//
// VÌ SAO CẦN: `lessons.ts` import TĨNH 150+ file unit rồi gộp thành một mảng. Với Vite, bất kỳ
// trang nào chỉ cần TIÊU ĐỀ một bài (trang bậc, trang khoá, ôn thẻ…) cũng kéo trọn ~3 MB
// (843 kB gzip) nội dung của mọi bài. File sinh ra ở đây tách làm hai:
//   1. `LESSON_INDEX` — chỉ mục NHẸ (id · unitId · title · language · số thẻ SRS) đủ cho mọi
//      màn liệt kê, không có nội dung bài.
//   2. `UNIT_LOADERS` — mỗi unit một `import()` động → Vite cắt mỗi unit một chunk riêng, chỉ
//      tải khi mở đúng bài đó.
//
// Nguồn sự thật vẫn là `lessons.ts` (server và test dùng bản đồng bộ). File sinh ra KHÔNG được
// sửa tay; `lessonsLazy.test.ts` canh cho nó không lệch registry — lệch thì chạy lại:
//   npm run gen:lesson-index
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'
import { PROGRAMMING_LESSONS } from '@dhcb/subject-programming/lessons'
import { buildLessonIndex } from '@dhcb/subject-programming/lessonIndex'

const here = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.resolve(here, '../packages/subject-programming')
const registryPath = path.join(pkgDir, 'lessons.ts')
const outPath = path.join(pkgDir, 'lessonsLazy.ts')

/** Đọc các dòng `import { X_LESSONS } from './lessons/<file>.js'` của registry, giữ đúng thứ tự. */
export function parseRegistryImports(source: string): { exportName: string; file: string }[] {
  const re = /^import \{ ([A-Z0-9_]+_LESSONS) \} from '\.\/lessons\/([a-z0-9_-]+)\.js'$/gm
  return [...source.matchAll(re)].map((m) => ({ exportName: m[1]!, file: m[2]! }))
}

async function main(): Promise<void> {
  const imports = parseRegistryImports(readFileSync(registryPath, 'utf8'))
  if (imports.length === 0) throw new Error('Không đọc được dòng import nào trong lessons.ts')

  // Mỗi file unit → unitId của các bài trong đó (thực tế mỗi file đúng MỘT unit, nhưng
  // không giả định — gom theo unit để nếu sau này một unit tách hai file vẫn đúng).
  const filesOfUnit = new Map<string, { exportName: string; file: string }[]>()
  for (const entry of imports) {
    const mod = (await import(path.join(pkgDir, 'lessons', `${entry.file}.ts`))) as Record<
      string,
      { unitId: string }[]
    >
    const lessons = mod[entry.exportName]
    if (!lessons) throw new Error(`${entry.file}.ts không export ${entry.exportName}`)
    for (const unitId of new Set(lessons.map((l) => l.unitId))) {
      const list = filesOfUnit.get(unitId) ?? []
      if (!list.some((x) => x.file === entry.file)) list.push(entry)
      filesOfUnit.set(unitId, list)
    }
  }

  const index = buildLessonIndex(PROGRAMMING_LESSONS)
  const loaderLines = [...filesOfUnit.entries()].map(([unitId, files]) => {
    const parts = files.map(
      (f) => `import('./lessons/${f.file}.js').then((m) => m.${f.exportName})`,
    )
    const body =
      parts.length === 1 ? parts[0]! : `Promise.all([${parts.join(', ')}]).then((xs) => xs.flat())`
    return `  '${unitId}': () => ${body},`
  })

  const out = `// lessonsLazy — FILE SINH TỰ ĐỘNG bởi scripts/gen-lesson-index.ts. KHÔNG SỬA TAY.
// Chạy lại khi thêm/đổi bài học:  npm run gen:lesson-index
// (lessonsLazy.test.ts canh cho file này không lệch registry lessons.ts.)
//
// Chỉ mục NHẸ + bảng nạp lười theo unit — xem giải thích ở đầu scripts/gen-lesson-index.ts.
import type { ProgrammingLesson } from './lessonTypes.js'
import type { LessonSummary } from './lessonIndex.js'

export type { LessonSummary } from './lessonIndex.js'

/** Chỉ mục mọi bài đã soạn, THEO ĐÚNG thứ tự registry (không có nội dung bài). */
export const LESSON_INDEX: readonly LessonSummary[] = ${JSON.stringify(index, null, 2)}

/** Mỗi unit một import() động — Vite cắt thành chunk riêng, chỉ tải khi cần. */
export const UNIT_LOADERS: Readonly<Record<string, () => Promise<ProgrammingLesson[]>>> = {
${loaderLines.join('\n')}
}
`
  // Format bằng đúng cấu hình Prettier của repo để cổng `format:check` không đỏ vì file sinh.
  const prettierConfig = (await prettier.resolveConfig(outPath)) ?? {}
  writeFileSync(outPath, await prettier.format(out, { ...prettierConfig, filepath: outPath }))
  console.log(
    `Đã sinh ${path.relative(process.cwd(), outPath)}: ${index.length} bài · ${filesOfUnit.size} unit`,
  )
}

// Chỉ chạy khi gọi trực tiếp (test import parseRegistryImports mà không sinh file).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
}
