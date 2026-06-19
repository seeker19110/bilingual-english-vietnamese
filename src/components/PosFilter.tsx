interface Props {
  value: string            // loại từ đang chọn ('' = tất cả)
  onChange: (pos: string) => void
}

// Danh sách nút lọc — khớp các mã pos trong dictionary.json
const FILTERS: { value: string; label: string }[] = [
  { value: '',     label: 'Tất cả' },
  { value: 'n',    label: 'Danh từ' },
  { value: 'v',    label: 'Động từ' },
  { value: 'adj',  label: 'Tính từ' },
  { value: 'adv',  label: 'Trạng từ' },
  { value: 'prep', label: 'Giới từ' },
  { value: 'pron', label: 'Đại từ' },
]

// Hàng nút lọc nhanh theo loại từ. Component "controlled": cha giữ state, đây chỉ hiển thị + báo thay đổi.
export default function PosFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 mb-3">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition border ${
            value === f.value
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
