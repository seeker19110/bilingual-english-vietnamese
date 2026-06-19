import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import Layout from '../components/Layout'
import dictionaryData from '../data/dictionary.json'

// Cấu trúc 1 mục từ điển — khớp với dữ liệu trong src/data/dictionary.json
interface DictEntry {
  word: string    // từ tiếng Anh
  pos: string     // loại từ viết tắt: n, v, adj, adv, prep, conj, pron, interj, art, num
  vi: string      // nghĩa tiếng Việt
  ex_en: string   // câu ví dụ tiếng Anh
  ex_vi: string   // câu ví dụ dịch tiếng Việt
}

const ENTRIES = dictionaryData as DictEntry[]

// Nhãn tiếng Việt hiển thị cho từng loại từ
const POS_LABEL: Record<string, string> = {
  n: 'Danh từ',
  v: 'Động từ',
  adj: 'Tính từ',
  adv: 'Trạng từ',
  prep: 'Giới từ',
  conj: 'Liên từ',
  pron: 'Đại từ',
  interj: 'Thán từ',
  art: 'Mạo từ',
  num: 'Số từ',
  idiom: 'Thành ngữ',
}

// Giới hạn số kết quả hiển thị cùng lúc để tránh render quá nhiều phần tử
const MAX_RESULTS = 100

export default function Dictionary() {
  const [query, setQuery] = useState('')

  // Lọc + sắp xếp kết quả: từ bắt đầu bằng từ khóa được ưu tiên lên trước
  const { results, totalMatches } = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return { results: ENTRIES.slice(0, MAX_RESULTS), totalMatches: ENTRIES.length }
    }
    const starts: DictEntry[] = []
    const contains: DictEntry[] = []
    for (const e of ENTRIES) {
      if (e.word.startsWith(q)) starts.push(e)
      else if (e.word.includes(q)) contains.push(e)
    }
    const all = [...starts, ...contains]
    return { results: all.slice(0, MAX_RESULTS), totalMatches: all.length }
  }, [query])

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title="Từ điển" subtitle={`${ENTRIES.length.toLocaleString('vi-VN')} từ thông dụng`} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Ô tìm kiếm */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Gõ từ tiếng Anh cần tra..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500/50"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {query && (
          <p className="text-xs text-zinc-500 mb-3">
            Tìm thấy {totalMatches.toLocaleString('vi-VN')} từ
            {totalMatches > results.length ? ` — hiển thị ${results.length} từ đầu tiên` : ''}
          </p>
        )}

        {/* Danh sách kết quả */}
        <div className="space-y-2">
          {results.map(e => (
            <div key={e.word} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="font-semibold text-white">{e.word}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium shrink-0">
                  {POS_LABEL[e.pos] || e.pos}
                </span>
              </div>
              <p className="text-sm text-zinc-300 mb-2">{e.vi}</p>
              <div className="text-xs text-zinc-500 leading-relaxed space-y-0.5">
                <p>{e.ex_en}</p>
                <p className="text-zinc-600 italic">{e.ex_vi}</p>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-10">Không tìm thấy từ phù hợp.</p>
          )}
        </div>
      </main>
    </div>
  )
}
