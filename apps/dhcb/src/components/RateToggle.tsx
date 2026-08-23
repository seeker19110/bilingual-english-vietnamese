import { useState } from 'react'
import { getRatePref, setRatePref, type Rate } from '../lib/tts'

const RATES: Rate[] = [0.75, 1, 1.25]

// Pill toggle chọn tốc độ phát TOÀN CỤC — bấm vào 1 trong 3 mức để đổi ngay.
export default function RateToggle() {
  const [rate, setRate] = useState<Rate>(getRatePref())

  function choose(r: Rate) {
    setRate(r)
    setRatePref(r)
  }

  return (
    <div
      role="group"
      title="Chọn tốc độ phát (áp dụng cho cả app)"
      className="tap-44-y flex rounded-full bg-zinc-800 p-0.5 text-[11px] leading-none shrink-0"
    >
      {RATES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => choose(r)}
          className={`px-2 py-1 rounded-full transition cursor-pointer ${
            rate === r
              ? 'bg-accent-500/30 text-accent-300 theme-light:text-accent-800'
              : 'text-zinc-400'
          }`}
        >
          {r}×
        </button>
      ))}
    </div>
  )
}
