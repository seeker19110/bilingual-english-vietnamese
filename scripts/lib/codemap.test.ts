// scripts/lib/codemap.test.ts — test logic thuần của bản đồ code.
// Dựng đồ thị bằng tay để test nhanh, không chạy TypeScript compiler thật.

import { describe, expect, it } from 'vitest'

import {
  findCallers,
  findHotspots,
  findImpactedFiles,
  findImportCycles,
  findOrphanFiles,
  functionKey,
  parseFunctionKey,
  type CodeGraph,
} from './codemap'

/** a.ts ← b.ts ← c.ts (c import b, b import a); d.ts đứng riêng. */
const chainGraph: CodeGraph = {
  files: ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
  imports: [
    { from: 'b.ts', to: 'a.ts' },
    { from: 'c.ts', to: 'b.ts' },
  ],
  calls: [],
}

describe('functionKey / parseFunctionKey', () => {
  it('đi vòng tròn giữ nguyên file và tên', () => {
    const key = functionKey('api/usage.ts', 'countUsage')
    expect(key).toBe('api/usage.ts#countUsage')
    expect(parseFunctionKey(key)).toEqual({ file: 'api/usage.ts', name: 'countUsage' })
  })

  it('trả null khi khoá sai dạng', () => {
    expect(parseFunctionKey('khong-co-dau-thang')).toBeNull()
    expect(parseFunctionKey('#thieu-file')).toBeNull()
    expect(parseFunctionKey('thieu-ten#')).toBeNull()
  })
})

describe('findImpactedFiles', () => {
  it('lan truyền ngược nhiều tầng và ghi đúng độ sâu', () => {
    expect(findImpactedFiles(chainGraph, 'a.ts')).toEqual([
      { file: 'b.ts', depth: 1 },
      { file: 'c.ts', depth: 2 },
    ])
  })

  it('tôn trọng maxDepth', () => {
    expect(findImpactedFiles(chainGraph, 'a.ts', 1)).toEqual([{ file: 'b.ts', depth: 1 }])
  })

  it('trả rỗng khi không ai import', () => {
    expect(findImpactedFiles(chainGraph, 'd.ts')).toEqual([])
    expect(findImpactedFiles(chainGraph, 'khong-ton-tai.ts')).toEqual([])
  })

  it('không lặp vô hạn khi đồ thị có chu trình', () => {
    const cyclic: CodeGraph = {
      files: ['a.ts', 'b.ts'],
      imports: [
        { from: 'a.ts', to: 'b.ts' },
        { from: 'b.ts', to: 'a.ts' },
      ],
      calls: [],
    }
    expect(findImpactedFiles(cyclic, 'a.ts')).toEqual([{ file: 'b.ts', depth: 1 }])
  })

  it('không kể chính file đích vào kết quả', () => {
    const selfImport: CodeGraph = {
      files: ['a.ts'],
      imports: [{ from: 'a.ts', to: 'a.ts' }],
      calls: [],
    }
    expect(findImpactedFiles(selfImport, 'a.ts')).toEqual([])
  })
})

describe('findCallers', () => {
  const graph: CodeGraph = {
    files: ['a.ts', 'b.ts'],
    imports: [],
    calls: [
      { from: 'b.ts#middle', to: 'a.ts#leaf' },
      { from: 'b.ts#top', to: 'b.ts#middle' },
      { from: 'a.ts#leaf', to: 'a.ts#leaf' }, // đệ quy: phải bị chặn, không lặp vô hạn
    ],
  }

  it('mặc định chỉ trả người gọi trực tiếp', () => {
    expect(findCallers(graph, 'a.ts#leaf')).toEqual([{ fn: 'b.ts#middle', depth: 1 }])
  })

  it('truy ngược nhiều tầng khi tăng maxDepth', () => {
    expect(findCallers(graph, 'a.ts#leaf', 2)).toEqual([
      { fn: 'b.ts#middle', depth: 1 },
      { fn: 'b.ts#top', depth: 2 },
    ])
  })

  it('trả rỗng cho hàm không ai gọi', () => {
    expect(findCallers(graph, 'b.ts#top')).toEqual([])
  })
})

describe('findOrphanFiles', () => {
  it('liệt kê file không ai import', () => {
    expect(findOrphanFiles(chainGraph)).toEqual(['c.ts', 'd.ts'])
  })

  it('loại điểm vào ra khỏi danh sách mồ côi', () => {
    expect(findOrphanFiles(chainGraph, ['c.ts'])).toEqual(['d.ts'])
  })
})

describe('findHotspots', () => {
  it('sắp theo số lượt bị import giảm dần', () => {
    const graph: CodeGraph = {
      files: ['core.ts', 'x.ts', 'y.ts', 'z.ts'],
      imports: [
        { from: 'x.ts', to: 'core.ts' },
        { from: 'y.ts', to: 'core.ts' },
        { from: 'z.ts', to: 'x.ts' },
      ],
      calls: [],
    }
    expect(findHotspots(graph)).toEqual([
      { file: 'core.ts', importedBy: 2 },
      { file: 'x.ts', importedBy: 1 },
    ])
  })

  it('tôn trọng limit', () => {
    const graph: CodeGraph = {
      files: ['a.ts', 'b.ts', 'c.ts'],
      imports: [
        { from: 'c.ts', to: 'a.ts' },
        { from: 'c.ts', to: 'b.ts' },
      ],
      calls: [],
    }
    expect(findHotspots(graph, 1)).toHaveLength(1)
  })

  it('trả rỗng khi chưa có cạnh import nào', () => {
    expect(findHotspots({ files: ['a.ts'], imports: [], calls: [] })).toEqual([])
  })
})

describe('findImportCycles', () => {
  it('không báo chu trình cho đồ thị chuỗi thẳng', () => {
    expect(findImportCycles(chainGraph)).toEqual([])
  })

  it('phát hiện chu trình 2 file', () => {
    const graph: CodeGraph = {
      files: ['a.ts', 'b.ts'],
      imports: [
        { from: 'a.ts', to: 'b.ts' },
        { from: 'b.ts', to: 'a.ts' },
      ],
      calls: [],
    }
    expect(findImportCycles(graph)).toEqual([['a.ts', 'b.ts']])
  })

  it('báo cùng một chu trình đúng một lần dù bắt đầu từ điểm nào', () => {
    const graph: CodeGraph = {
      files: ['a.ts', 'b.ts', 'c.ts'],
      imports: [
        { from: 'a.ts', to: 'b.ts' },
        { from: 'b.ts', to: 'c.ts' },
        { from: 'c.ts', to: 'a.ts' },
      ],
      calls: [],
    }
    expect(findImportCycles(graph)).toEqual([['a.ts', 'b.ts', 'c.ts']])
  })
})
