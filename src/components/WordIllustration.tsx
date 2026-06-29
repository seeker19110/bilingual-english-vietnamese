import React from 'react'

type IllFn = () => React.ReactElement

// Tạo ô màu sắc động
const colorSwatch =
  (fill: string, stroke = fill): IllFn =>
  () => (
    <>
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="16"
        fill={fill}
        stroke={stroke}
        strokeWidth="3"
      />
      <rect x="20" y="20" width="24" height="14" rx="7" fill="white" opacity="0.25" />
    </>
  )

// Hiển thị số
const numSvg =
  (n: number | string): IllFn =>
  () => (
    <>
      <rect x="10" y="10" width="80" height="80" rx="16" fill="#1e293b" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize={String(n).length > 2 ? 28 : 50}
        fontWeight="bold"
        fill="#34d399"
        fontFamily="monospace"
      >
        {n}
      </text>
    </>
  )

// Tất cả minh hoạ — key là chữ thường của từ tiếng Anh
const ILL: Record<string, IllFn> = {
  // ── Màu sắc ──────────────────────────────────────────────────
  red: colorSwatch('#ef4444', '#dc2626'),
  orange: colorSwatch('#f97316', '#ea580c'),
  yellow: colorSwatch('#eab308', '#ca8a04'),
  green: colorSwatch('#22c55e', '#16a34a'),
  blue: colorSwatch('#3b82f6', '#2563eb'),
  purple: colorSwatch('#a855f7', '#9333ea'),
  violet: colorSwatch('#8b5cf6', '#7c3aed'),
  pink: colorSwatch('#ec4899', '#db2777'),
  brown: colorSwatch('#a16207', '#854d0e'),
  black: colorSwatch('#27272a', '#18181b'),
  white: colorSwatch('#f4f4f5', '#a1a1aa'),
  gray: colorSwatch('#71717a', '#52525b'),
  grey: colorSwatch('#71717a', '#52525b'),
  cyan: colorSwatch('#06b6d4', '#0891b2'),

  // ── Số ───────────────────────────────────────────────────────
  zero: numSvg(0),
  one: numSvg(1),
  two: numSvg(2),
  three: numSvg(3),
  four: numSvg(4),
  five: numSvg(5),
  six: numSvg(6),
  seven: numSvg(7),
  eight: numSvg(8),
  nine: numSvg(9),
  ten: numSvg(10),
  eleven: numSvg(11),
  twelve: numSvg(12),
  twenty: numSvg(20),
  hundred: numSvg(100),
  thousand: numSvg('1k'),

  // ── Hình học ──────────────────────────────────────────────────
  circle: () => (
    <>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#34d399" strokeWidth="6" />
      <circle cx="50" cy="50" r="10" fill="#34d399" opacity="0.35" />
    </>
  ),
  square: () => (
    <rect
      x="12"
      y="12"
      width="76"
      height="76"
      rx="4"
      fill="none"
      stroke="#60a5fa"
      strokeWidth="6"
    />
  ),
  triangle: () => <polygon points="50,8 93,90 7,90" fill="none" stroke="#f59e0b" strokeWidth="5" />,
  rectangle: () => (
    <rect x="6" y="26" width="88" height="48" rx="4" fill="none" stroke="#a78bfa" strokeWidth="5" />
  ),
  star: () => (
    <polygon
      points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="2"
    />
  ),
  heart: () => (
    <path
      d="M50 82 C50 82 10 56 10 30 C10 15 22 8 32 8 C39 8 45 12 50 19
             C55 12 61 8 68 8 C78 8 90 15 90 30 C90 56 50 82 50 82Z"
      fill="#f43f5e"
    />
  ),
  diamond: () => (
    <polygon points="50,5 90,50 50,95 10,50" fill="none" stroke="#818cf8" strokeWidth="5" />
  ),

  // ── Thời tiết ─────────────────────────────────────────────────
  sun: () => {
    const rays = [0, 45, 90, 135, 180, 225, 270, 315]
    return (
      <>
        <circle cx="50" cy="50" r="22" fill="#fbbf24" />
        {rays.map((deg, i) => {
          const r = (Math.PI * deg) / 180
          return (
            <line
              key={i}
              x1={50 + 27 * Math.cos(r)}
              y1={50 + 27 * Math.sin(r)}
              x2={50 + 40 * Math.cos(r)}
              y2={50 + 40 * Math.sin(r)}
              stroke="#fbbf24"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )
        })}
      </>
    )
  },
  moon: () => <path d="M65 20 A30 30 0 1 0 65 80 A20 20 0 1 1 65 20Z" fill="#e2e8f0" />,
  cloud: () => (
    <>
      <ellipse cx="50" cy="60" rx="34" ry="19" fill="#94a3b8" />
      <ellipse cx="36" cy="52" rx="18" ry="15" fill="#94a3b8" />
      <ellipse cx="62" cy="46" rx="20" ry="18" fill="#94a3b8" />
    </>
  ),
  rain: () => (
    <>
      <ellipse cx="50" cy="34" rx="30" ry="17" fill="#64748b" />
      <ellipse cx="34" cy="28" rx="14" ry="12" fill="#64748b" />
      <ellipse cx="63" cy="25" rx="16" ry="14" fill="#64748b" />
      {(
        [
          [34, 58],
          [44, 65],
          [54, 58],
          [64, 65],
          [39, 73],
          [59, 73],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <line
          key={i}
          x1={x}
          y1={y - 5}
          x2={x - 3}
          y2={y + 8}
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  wind: () => (
    <>
      {[30, 45, 60].map((y, i) => (
        <path
          key={i}
          d={`M8 ${y} Q${50 - i * 5} ${y - 12} 88 ${y}`}
          stroke="#94a3b8"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  snow: () => (
    <>
      {(
        [
          [25, 30],
          [55, 20],
          [75, 40],
          [20, 65],
          [55, 60],
          [80, 72],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <text key={i} x={x} y={y} fontSize={12 + (i % 3) * 4} fill="white" opacity="0.85">
          ❄
        </text>
      ))}
    </>
  ),
  thunder: () => (
    <>
      <ellipse cx="48" cy="30" rx="30" ry="17" fill="#6b7280" />
      <ellipse cx="32" cy="24" rx="14" ry="12" fill="#6b7280" />
      <polygon points="55,45 42,62 52,62 38,85 62,58 51,58" fill="#fbbf24" />
    </>
  ),

  // ── Thực vật / thiên nhiên ────────────────────────────────────
  tree: () => (
    <>
      <rect x="44" y="54" width="12" height="36" rx="4" fill="#92400e" />
      <polygon points="50,5 78,40 22,40" fill="#22c55e" />
      <polygon points="50,22 82,54 18,54" fill="#16a34a" />
    </>
  ),
  flower: () => {
    const petals = [0, 60, 120, 180, 240, 300]
    return (
      <>
        <line x1="50" y1="95" x2="50" y2="55" stroke="#22c55e" strokeWidth="4" />
        <path d="M50 75 Q34 64 30 54 Q44 54 50 75Z" fill="#16a34a" />
        {petals.map((deg, i) => {
          const r = (Math.PI * deg) / 180
          const cx = 50 + 18 * Math.cos(r)
          const cy = 44 + 18 * Math.sin(r)
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx="10"
              ry="7"
              fill="#f9a8d4"
              transform={`rotate(${deg} ${cx} ${cy})`}
            />
          )
        })}
        <circle cx="50" cy="44" r="10" fill="#fbbf24" />
      </>
    )
  },
  mountain: () => (
    <>
      <polygon points="50,5 96,90 4,90" fill="#6b7280" />
      <polygon points="50,5 67,37 33,37" fill="white" opacity="0.8" />
      <polygon points="24,46 56,90 4,90" fill="#4b5563" />
    </>
  ),
  sea: () => (
    <>
      <rect x="0" y="0" width="100" height="100" fill="#0ea5e9" opacity="0.25" />
      <path d="M0 46 Q25 36 50 46 Q75 56 100 46 L100 100 L0 100Z" fill="#0ea5e9" opacity="0.5" />
      <path d="M0 58 Q25 48 50 58 Q75 68 100 58 L100 100 L0 100Z" fill="#0284c7" />
    </>
  ),
  river: () => (
    <path
      d="M15 10 Q35 35 20 60 Q8 80 30 90"
      stroke="#60a5fa"
      strokeWidth="20"
      fill="none"
      strokeLinecap="round"
      opacity="0.7"
    />
  ),

  // ── Động vật ──────────────────────────────────────────────────
  cat: () => (
    <>
      <ellipse cx="50" cy="63" rx="26" ry="20" fill="#94a3b8" />
      <circle cx="50" cy="38" r="20" fill="#94a3b8" />
      <polygon points="32,25 25,10 40,21" fill="#94a3b8" />
      <polygon points="68,25 75,10 60,21" fill="#94a3b8" />
      <ellipse cx="43" cy="37" rx="3" ry="4" fill="#1e293b" />
      <ellipse cx="57" cy="37" rx="3" ry="4" fill="#1e293b" />
      <circle cx="50" cy="44" r="2" fill="#f9a8d4" />
      {(
        [
          [50, 44, 28, 42],
          [50, 45, 28, 47],
          [50, 44, 72, 42],
          [50, 45, 72, 47],
        ] as number[][]
      ).map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e2e8f0" strokeWidth="1.5" />
      ))}
      <path
        d="M74 70 Q90 54 86 40"
        stroke="#94a3b8"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  dog: () => (
    <>
      <ellipse cx="50" cy="65" rx="28" ry="18" fill="#a78bfa" />
      <circle cx="50" cy="38" r="20" fill="#a78bfa" />
      <ellipse cx="30" cy="32" rx="10" ry="16" fill="#8b5cf6" transform="rotate(-15 30 32)" />
      <ellipse cx="70" cy="32" rx="10" ry="16" fill="#8b5cf6" transform="rotate(15 70 32)" />
      <circle cx="43" cy="36" r="4" fill="#1e293b" />
      <circle cx="57" cy="36" r="4" fill="#1e293b" />
      <circle cx="44" cy="35" r="1.5" fill="white" />
      <circle cx="58" cy="35" r="1.5" fill="white" />
      <ellipse cx="50" cy="44" rx="5" ry="4" fill="#1e293b" />
      <path d="M45 49 Q50 55 55 49" stroke="#7c3aed" strokeWidth="2" fill="none" />
      <path
        d="M78 58 Q96 44 92 30"
        stroke="#a78bfa"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  bird: () => (
    <>
      <ellipse cx="52" cy="58" rx="22" ry="15" fill="#fbbf24" />
      <circle cx="72" cy="40" r="14" fill="#fbbf24" />
      <polygon points="86,38 97,41 86,44" fill="#f97316" />
      <circle cx="76" cy="38" r="4" fill="#1e293b" />
      <circle cx="77" cy="37" r="1.5" fill="white" />
      <path d="M30 50 Q18 30 40 42" stroke="#d97706" strokeWidth="4" fill="#d97706" opacity="0.6" />
      <polygon points="30,60 12,54 12,66 30,66" fill="#d97706" />
    </>
  ),
  fish: () => (
    <>
      <ellipse cx="45" cy="50" rx="30" ry="15" fill="#60a5fa" />
      <polygon points="78,50 94,38 94,62" fill="#3b82f6" />
      <circle cx="22" cy="46" r="3.5" fill="#1e293b" />
      <circle cx="23" cy="45" r="1.5" fill="white" />
      <path d="M38 44 Q42 50 38 56" stroke="#93c5fd" strokeWidth="2" fill="none" />
    </>
  ),
  rabbit: () => (
    <>
      <ellipse cx="38" cy="22" rx="8" ry="20" fill="#e2e8f0" />
      <ellipse cx="62" cy="22" rx="8" ry="20" fill="#e2e8f0" />
      <ellipse cx="38" cy="22" rx="4" ry="16" fill="#fda4af" />
      <ellipse cx="62" cy="22" rx="4" ry="16" fill="#fda4af" />
      <circle cx="50" cy="42" r="18" fill="#e2e8f0" />
      <ellipse cx="50" cy="68" rx="22" ry="18" fill="#e2e8f0" />
      <circle cx="43" cy="40" r="3" fill="#f43f5e" />
      <circle cx="57" cy="40" r="3" fill="#f43f5e" />
      <circle cx="50" cy="47" r="2" fill="#f9a8d4" />
      <circle cx="74" cy="72" r="7" fill="white" />
    </>
  ),
  elephant: () => (
    <>
      <ellipse cx="52" cy="60" rx="32" ry="24" fill="#9ca3af" />
      <circle cx="30" cy="40" r="20" fill="#9ca3af" />
      <ellipse cx="18" cy="42" rx="10" ry="14" fill="#6b7280" />
      <path
        d="M18 48 Q6 62 13 76 Q17 83 22 75"
        stroke="#9ca3af"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="24" cy="35" r="3" fill="#1e293b" />
      <circle cx="25" cy="34" r="1" fill="white" />
      <path
        d="M16 52 Q4 58 7 67"
        stroke="#fef3c7"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {[32, 46, 60, 74].map((x, i) => (
        <rect key={i} x={x} y="79" width="11" height="15" rx="5" fill="#9ca3af" />
      ))}
    </>
  ),
  horse: () => (
    <>
      <ellipse cx="52" cy="62" rx="30" ry="17" fill="#92400e" />
      <path
        d="M30 50 Q28 30 38 22"
        stroke="#92400e"
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="42" cy="18" rx="16" ry="12" fill="#92400e" transform="rotate(-20 42 18)" />
      <path
        d="M30 48 Q24 34 34 22"
        stroke="#7c2d12"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="35" cy="14" r="3" fill="#1e293b" />
      {[28, 40, 58, 70].map((x, i) => (
        <rect key={i} x={x} y="76" width="8" height="18" rx="3" fill="#78350f" />
      ))}
      <path
        d="M82 62 Q96 56 90 80"
        stroke="#7c2d12"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  // ── Thực phẩm ─────────────────────────────────────────────────
  apple: () => (
    <>
      <ellipse cx="50" cy="56" rx="32" ry="33" fill="#ef4444" />
      <path
        d="M50 24 Q56 10 63 14"
        stroke="#22c55e"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="38" cy="46" rx="8" ry="12" fill="white" opacity="0.2" />
    </>
  ),
  banana: () => (
    <path
      d="M20 76 Q25 30 56 18 Q80 12 82 30 Q84 46 60 62 Q40 76 20 76Z"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="2"
    />
  ),
  egg: () => (
    <ellipse cx="50" cy="54" rx="24" ry="30" fill="#fef9c3" stroke="#fde68a" strokeWidth="2.5" />
  ),
  bread: () => (
    <>
      <rect x="12" y="38" width="76" height="42" rx="10" fill="#d97706" />
      <ellipse cx="50" cy="38" rx="38" ry="15" fill="#fbbf24" />
    </>
  ),
  milk: () => (
    <>
      <rect x="34" y="28" width="32" height="52" rx="8" fill="white" opacity="0.9" />
      <rect x="36" y="16" width="28" height="15" rx="4" fill="#e5e7eb" />
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="bold">
        MILK
      </text>
    </>
  ),
  water: () => (
    <path d="M50 8 Q72 36 72 56 A22 22 0 0 1 28 56 Q28 36 50 8Z" fill="#60a5fa" opacity="0.8" />
  ),
  coffee: () => (
    <>
      <rect x="20" y="40" width="50" height="40" rx="8" fill="#78350f" />
      <path d="M70 50 Q81 45 79 57 Q77 63 70 61" stroke="#92400e" strokeWidth="3" fill="none" />
      {[
        [35, 38],
        [45, 35],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} Q${x - 2} ${y - 10} ${x + 3} ${y - 18}`}
          stroke="#94a3b8"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  rice: () => (
    <>
      <ellipse cx="50" cy="58" rx="36" ry="22" fill="white" />
      {(
        [
          [36, 50],
          [44, 44],
          [54, 47],
          [62, 53],
          [40, 58],
          [55, 56],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="5"
          ry="2.5"
          fill="#fef9c3"
          transform={`rotate(${i * 30} ${x} ${y})`}
        />
      ))}
    </>
  ),

  // ── Đồ vật ────────────────────────────────────────────────────
  house: () => (
    <>
      <polygon points="50,8 92,42 8,42" fill="#ef4444" />
      <rect x="16" y="42" width="68" height="48" fill="#fef9c3" />
      <rect x="39" y="62" width="22" height="28" rx="11" fill="#92400e" />
      <rect x="20" y="52" width="18" height="16" rx="3" fill="#60a5fa" />
      <rect x="62" y="52" width="18" height="16" rx="3" fill="#60a5fa" />
      <line x1="29" y1="52" x2="29" y2="68" stroke="white" strokeWidth="1.5" />
      <line x1="20" y1="60" x2="38" y2="60" stroke="white" strokeWidth="1.5" />
      <line x1="71" y1="52" x2="71" y2="68" stroke="white" strokeWidth="1.5" />
      <line x1="62" y1="60" x2="80" y2="60" stroke="white" strokeWidth="1.5" />
      <rect x="64" y="18" width="10" height="20" fill="#9ca3af" />
    </>
  ),
  car: () => (
    <>
      <rect x="8" y="45" width="84" height="32" rx="10" fill="#3b82f6" />
      <rect x="22" y="28" width="52" height="22" rx="10" fill="#2563eb" />
      <rect x="26" y="31" width="20" height="16" rx="5" fill="#bae6fd" />
      <rect x="50" y="31" width="20" height="16" rx="5" fill="#bae6fd" />
      <circle cx="25" cy="77" r="13" fill="#1e293b" />
      <circle cx="25" cy="77" r="7" fill="#374151" />
      <circle cx="75" cy="77" r="13" fill="#1e293b" />
      <circle cx="75" cy="77" r="7" fill="#374151" />
      <rect x="85" y="50" width="8" height="10" rx="2" fill="#fbbf24" />
    </>
  ),
  book: () => (
    <>
      <rect x="30" y="15" width="48" height="70" rx="4" fill="#f9fafb" />
      <rect x="14" y="15" width="18" height="70" rx="4" fill="#3b82f6" />
      {[32, 40, 48, 56, 64, 72].map((y, i) => (
        <line key={i} x1="38" y1={y} x2="72" y2={y} stroke="#e5e7eb" strokeWidth="2" />
      ))}
    </>
  ),
  phone: () => (
    <>
      <rect
        x="28"
        y="8"
        width="44"
        height="84"
        rx="12"
        fill="#1e293b"
        stroke="#374151"
        strokeWidth="3"
      />
      <rect x="33" y="18" width="34" height="54" rx="6" fill="#0ea5e9" opacity="0.7" />
      <circle cx="50" cy="82" r="5" fill="#374151" />
    </>
  ),
  computer: () => (
    <>
      <rect
        x="12"
        y="12"
        width="76"
        height="52"
        rx="6"
        fill="#1e293b"
        stroke="#374151"
        strokeWidth="3"
      />
      <rect x="18" y="18" width="64" height="40" rx="4" fill="#0ea5e9" opacity="0.5" />
      <rect x="42" y="64" width="16" height="12" fill="#374151" />
      <rect x="28" y="76" width="44" height="6" rx="3" fill="#374151" />
    </>
  ),
  table: () => (
    <>
      <rect x="8" y="28" width="84" height="10" rx="5" fill="#92400e" />
      <rect x="14" y="38" width="10" height="46" rx="3" fill="#78350f" />
      <rect x="76" y="38" width="10" height="46" rx="3" fill="#78350f" />
    </>
  ),
  chair: () => (
    <>
      <rect x="20" y="14" width="60" height="8" rx="4" fill="#92400e" />
      <rect x="20" y="14" width="10" height="32" rx="4" fill="#78350f" />
      <rect x="70" y="14" width="10" height="32" rx="4" fill="#78350f" />
      <rect x="20" y="42" width="60" height="10" rx="4" fill="#92400e" />
      <rect x="22" y="52" width="8" height="36" rx="3" fill="#78350f" />
      <rect x="70" y="52" width="8" height="36" rx="3" fill="#78350f" />
    </>
  ),
  bed: () => (
    <>
      <rect x="8" y="20" width="84" height="20" rx="6" fill="#92400e" />
      <rect x="14" y="36" width="72" height="36" rx="6" fill="#e2e8f0" />
      <rect x="18" y="30" width="26" height="12" rx="6" fill="white" />
      <rect x="56" y="30" width="26" height="12" rx="6" fill="white" />
      <rect x="8" y="68" width="84" height="18" rx="6" fill="#78350f" />
    </>
  ),
  pencil: () => (
    <>
      <polygon points="50,5 60,10 60,80 50,93 40,80 40,10" fill="#fbbf24" />
      <polygon points="40,80 60,80 50,93" fill="#fca5a5" />
      <line x1="40" y1="78" x2="60" y2="78" stroke="#d97706" strokeWidth="2" />
      <rect x="41" y="8" width="18" height="12" fill="#9ca3af" />
    </>
  ),
  clock: () => {
    const ticks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
    return (
      <>
        <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#34d399" strokeWidth="4" />
        {ticks.map((deg, i) => {
          const r = (Math.PI * deg) / 180
          const r1 = i % 3 === 0 ? 30 : 33
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos(r)}
              y1={50 + r1 * Math.sin(r)}
              x2={50 + 37 * Math.cos(r)}
              y2={50 + 37 * Math.sin(r)}
              stroke="#4b5563"
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
            />
          )
        })}
        <line
          x1="50"
          y1="50"
          x2="30"
          y2="28"
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="50"
          x2="72"
          y2="30"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3" fill="#34d399" />
      </>
    )
  },

  // ── Cơ thể người ──────────────────────────────────────────────
  eye: () => (
    <>
      <path
        d="M5 50 Q30 15 50 15 Q70 15 95 50 Q70 85 50 85 Q30 85 5 50Z"
        fill="white"
        stroke="#9ca3af"
        strokeWidth="2"
      />
      <circle cx="50" cy="50" r="18" fill="#60a5fa" />
      <circle cx="50" cy="50" r="10" fill="#1e293b" />
      <circle cx="55" cy="44" r="4" fill="white" />
    </>
  ),
  nose: () => (
    <path
      d="M50 14 Q38 40 32 60 Q30 73 38 77 Q44 81 50 75 Q56 81 62 77
             Q70 73 68 60 Q62 40 50 14Z"
      fill="#fca5a5"
      stroke="#f87171"
      strokeWidth="2"
    />
  ),
  mouth: () => (
    <>
      <path d="M20 46 Q50 72 80 46" fill="#fecaca" />
      <path
        d="M20 46 Q50 72 80 46"
        stroke="#f87171"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {[30, 40, 50, 60, 70].map((x, i) => (
        <rect key={i} x={x} y="45" width="6" height="10" rx="1" fill="white" />
      ))}
    </>
  ),
  hand: () => (
    <>
      <rect x="28" y="50" width="44" height="34" rx="10" fill="#fca5a5" />
      {[30, 40, 52, 62].map((x, i) => (
        <rect key={i} x={x} y="22" width="8" height="32" rx="4" fill="#fca5a5" />
      ))}
      <rect
        x="20"
        y="34"
        width="10"
        height="24"
        rx="5"
        fill="#fca5a5"
        transform="rotate(-20 20 34)"
      />
    </>
  ),
  foot: () => (
    <>
      <rect x="22" y="38" width="56" height="42" rx="12" fill="#fca5a5" />
      {[26, 36, 46, 56, 65].map((x, i) => (
        <circle key={i} cx={x} cy="38" r={6 - i * 0.8} fill="#fca5a5" />
      ))}
    </>
  ),
  head: () => (
    <>
      <path d="M18 38 Q16 10 50 8 Q84 10 82 38 Q70 15 50 14 Q30 15 18 38Z" fill="#92400e" />
      <ellipse cx="50" cy="44" rx="32" ry="36" fill="#fca5a5" />
      <circle cx="38" cy="40" r="5" fill="#1e293b" />
      <circle cx="62" cy="40" r="5" fill="#1e293b" />
      <circle cx="40" cy="38" r="2" fill="white" />
      <circle cx="64" cy="38" r="2" fill="white" />
      <ellipse cx="50" cy="50" rx="4" ry="3" fill="#f87171" opacity="0.6" />
      <path
        d="M40 57 Q50 65 60 57"
        stroke="#f87171"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  // ── Giao thông / di chuyển ────────────────────────────────────
  bicycle: () => (
    <>
      <circle cx="25" cy="65" r="22" fill="none" stroke="#6b7280" strokeWidth="4" />
      <circle cx="75" cy="65" r="22" fill="none" stroke="#6b7280" strokeWidth="4" />
      <line x1="25" y1="65" x2="50" y2="35" stroke="#3b82f6" strokeWidth="4" />
      <line x1="50" y1="35" x2="75" y2="65" stroke="#3b82f6" strokeWidth="4" />
      <line x1="50" y1="35" x2="25" y2="65" stroke="#60a5fa" strokeWidth="3" />
      <line x1="50" y1="35" x2="56" y2="24" stroke="#9ca3af" strokeWidth="3" />
      <line x1="50" y1="24" x2="63" y2="24" stroke="#9ca3af" strokeWidth="3" />
      <line x1="50" y1="35" x2="38" y2="32" stroke="#9ca3af" strokeWidth="3" />
      <line x1="32" y1="32" x2="45" y2="32" stroke="#9ca3af" strokeWidth="3" />
    </>
  ),
  airplane: () => (
    <>
      <path d="M50 15 L75 60 L50 52 L25 60 Z" fill="#e2e8f0" />
      <path d="M30 55 L10 72 L26 68 L30 75 L50 60Z" fill="#cbd5e1" />
      <path d="M70 55 L90 72 L74 68 L70 75 L50 60Z" fill="#cbd5e1" />
      <circle cx="50" cy="40" r="5" fill="#60a5fa" />
    </>
  ),
  ship: () => (
    <>
      <path d="M10 55 L20 78 L80 78 L90 55Z" fill="#3b82f6" />
      <rect x="38" y="28" width="24" height="30" fill="#60a5fa" />
      <rect x="44" y="18" width="12" height="14" fill="#93c5fd" />
      <path d="M8 78 Q50 90 92 78" stroke="#1e40af" strokeWidth="3" fill="none" />
    </>
  ),

  // ── Khác ──────────────────────────────────────────────────────
  fire: () => (
    <>
      <path
        d="M50 10 Q65 30 60 46 Q76 30 70 52 Q82 40 78 58
               Q82 80 50 92 Q18 80 22 58 Q18 40 30 52
               Q24 30 40 46 Q35 30 50 10Z"
        fill="#f97316"
      />
      <path
        d="M50 32 Q58 46 55 56 Q63 46 62 58 Q65 72 50 82
               Q35 72 38 58 Q37 46 45 56 Q42 46 50 32Z"
        fill="#fbbf24"
      />
    </>
  ),
  music: () => (
    <>
      <path d="M38 72 L38 30 L76 18 L76 55" stroke="#a855f7" strokeWidth="4" fill="none" />
      <circle cx="32" cy="74" r="10" fill="#a855f7" />
      <circle cx="70" cy="57" r="10" fill="#a855f7" />
      <text x="72" y="24" fontSize="13" fill="#c084fc">
        ♪
      </text>
    </>
  ),
  school: () => (
    <>
      <rect x="12" y="35" width="76" height="55" fill="#fef9c3" />
      <polygon points="50,8 90,35 10,35" fill="#ef4444" />
      <rect x="42" y="65" width="16" height="25" rx="2" fill="#92400e" />
      <rect x="18" y="45" width="18" height="14" rx="2" fill="#60a5fa" />
      <rect x="64" y="45" width="18" height="14" rx="2" fill="#60a5fa" />
    </>
  ),
  money: () => (
    <>
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="#22c55e"
        opacity="0.2"
        stroke="#22c55e"
        strokeWidth="3"
      />
      <text x="50" y="62" textAnchor="middle" fontSize="44" fontWeight="bold" fill="#22c55e">
        $
      </text>
    </>
  ),
  key: () => (
    <>
      <circle cx="32" cy="40" r="20" fill="none" stroke="#fbbf24" strokeWidth="5" />
      <line
        x1="52"
        y1="40"
        x2="90"
        y2="40"
        stroke="#fbbf24"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="40"
        x2="80"
        y2="55"
        stroke="#fbbf24"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="68"
        y1="40"
        x2="68"
        y2="52"
        stroke="#fbbf24"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  ),
  door: () => (
    <>
      <rect
        x="22"
        y="10"
        width="56"
        height="82"
        rx="4"
        fill="#92400e"
        stroke="#78350f"
        strokeWidth="3"
      />
      <circle cx="65" cy="52" r="5" fill="#fbbf24" />
      <rect x="28" y="18" width="20" height="28" rx="2" fill="#78350f" opacity="0.5" />
      <rect x="52" y="18" width="20" height="28" rx="2" fill="#78350f" opacity="0.5" />
    </>
  ),
  window: () => (
    <>
      <rect
        x="12"
        y="12"
        width="76"
        height="76"
        rx="6"
        fill="#bae6fd"
        stroke="#60a5fa"
        strokeWidth="4"
      />
      <line x1="50" y1="12" x2="50" y2="88" stroke="#60a5fa" strokeWidth="4" />
      <line x1="12" y1="50" x2="88" y2="50" stroke="#60a5fa" strokeWidth="4" />
      <rect x="16" y="16" width="30" height="30" fill="white" opacity="0.3" />
    </>
  ),
  ball: () => (
    <>
      <circle cx="50" cy="50" r="38" fill="#ef4444" />
      <path
        d="M50 12 Q65 28 65 50 Q65 72 50 88"
        stroke="white"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M14 38 Q30 44 50 44 Q70 44 86 38"
        stroke="white"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M14 62 Q30 56 50 56 Q70 56 86 62"
        stroke="white"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
    </>
  ),
  umbrella: () => (
    <>
      <path d="M10 50 Q10 10 50 8 Q90 10 90 50Z" fill="#60a5fa" />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="85"
        stroke="#1e40af"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M50 82 Q44 92 38 88"
        stroke="#1e40af"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {[20, 50, 80].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1="50"
          x2={50 + (x - 50) * 0.3}
          y2="12"
          stroke="#93c5fd"
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}
    </>
  ),
}

interface Props {
  word: string
}

/** Hiển thị minh hoạ SVG nếu có. Trả về null nếu không có hình cho từ này. */
export default function WordIllustration({ word }: Props) {
  const IllFn = ILL[word.toLowerCase()]
  if (!IllFn) return null

  return (
    <div className="mt-3 flex justify-center">
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-2 inline-block">
        <svg
          viewBox="0 0 100 100"
          width="110"
          height="110"
          aria-label={word}
          role="img"
          xmlns="http://www.w3.org/2000/svg"
        >
          <IllFn />
        </svg>
      </div>
    </div>
  )
}
