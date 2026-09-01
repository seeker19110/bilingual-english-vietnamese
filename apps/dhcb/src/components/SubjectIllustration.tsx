// apps/dhcb/src/components/SubjectIllustration.tsx
// Hình ảnh động SVG SMIL thuần tuý theo từng môn học — không dùng thư viện ngoài.
// Mỗi illustration chỉ dùng màu từ palette môn học (xem Subjects.tsx SUBJECT_COLORS).

interface IllustrationProps {
  className?: string
}

// ──────────────────────────────────────────────────────────────────────────────
// TOÁN HỌC — đồ thị sin/cos với điểm chuyển động
// ──────────────────────────────────────────────────────────────────────────────
function MathIllustration({ className = '' }: IllustrationProps) {
  const id = 'math-ill'
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-wave`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lưới nền */}
      {[20, 40, 60, 80, 100, 120, 140].map((y) => (
        <line
          key={`hy${y}`}
          x1="5"
          y1={y}
          x2="195"
          y2={y}
          stroke="#3b82f6"
          strokeWidth="0.4"
          opacity="0.12"
        />
      ))}
      {[25, 50, 75, 100, 125, 150, 175].map((x) => (
        <line
          key={`vx${x}`}
          x1={x}
          y1="5"
          x2={x}
          y2="155"
          stroke="#3b82f6"
          strokeWidth="0.4"
          opacity="0.12"
        />
      ))}

      {/* Trục */}
      <line x1="8" y1="80" x2="192" y2="80" stroke="#93c5fd" strokeWidth="1.5" opacity="0.5" />
      <line x1="100" y1="8" x2="100" y2="152" stroke="#93c5fd" strokeWidth="1.5" opacity="0.5" />
      <polygon points="192,77 199,80 192,83" fill="#93c5fd" opacity="0.5" />
      <polygon points="97,8 100,1 103,8" fill="#93c5fd" opacity="0.5" />
      <text x="193" y="78" fontSize="9" fill="#93c5fd" opacity="0.7">
        x
      </text>
      <text x="103" y="9" fontSize="9" fill="#93c5fd" opacity="0.7">
        y
      </text>

      {/* Đường cong sin — vẽ dần từ trái sang phải */}
      <path
        d="M 8,80 C 25,80 25,30 50,30 C 75,30 75,130 100,130 C 125,130 125,30 150,30 C 175,30 175,130 192,80"
        stroke={`url(#${id}-wave)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        filter={`url(#${id}-glow)`}
        strokeDasharray="420"
        strokeDashoffset="420"
      >
        <animate attributeName="stroke-dashoffset" from="420" to="0" dur="2.2s" fill="freeze" />
      </path>

      {/* Điểm chạy dọc đường cong */}
      <circle r="5" fill="#60a5fa" filter={`url(#${id}-glow)`}>
        <animateMotion
          path="M 8,80 C 25,80 25,30 50,30 C 75,30 75,130 100,130 C 125,130 125,30 150,30 C 175,30 175,130 192,80"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle r="3" fill="#bfdbfe">
        <animateMotion
          path="M 8,80 C 25,80 25,30 50,30 C 75,30 75,130 100,130 C 125,130 125,30 150,30 C 175,30 175,130 192,80"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Nhãn công thức */}
      <text x="10" y="150" fontSize="9" fill="#60a5fa" opacity="0.7" fontFamily="monospace">
        y = sin(x)
      </text>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// VẬT LÝ — nguyên tử với electron quay quỹ đạo
// ──────────────────────────────────────────────────────────────────────────────
function PhysicsIllustration({ className = '' }: IllustrationProps) {
  const id = 'phys-ill'
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id={`${id}-nucleus`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Quỹ đạo 1 — nằm ngang */}
      <ellipse cx="100" cy="80" rx="80" ry="22" stroke="#a78bfa" strokeWidth="1.2" opacity="0.4" />

      {/* Quỹ đạo 2 — xoay 60° */}
      <ellipse
        cx="100"
        cy="80"
        rx="80"
        ry="22"
        stroke="#8b5cf6"
        strokeWidth="1.2"
        opacity="0.4"
        transform="rotate(60 100 80)"
      />

      {/* Quỹ đạo 3 — xoay 120° */}
      <ellipse
        cx="100"
        cy="80"
        rx="80"
        ry="22"
        stroke="#7c3aed"
        strokeWidth="1.2"
        opacity="0.4"
        transform="rotate(120 100 80)"
      />

      {/* Hạt nhân */}
      <circle cx="100" cy="80" r="14" fill={`url(#${id}-nucleus)`} filter={`url(#${id}-glow)`} />
      <circle cx="100" cy="80" r="14" fill="none" stroke="#e9d5ff" strokeWidth="1" opacity="0.6" />
      <text x="100" y="84" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">
        +
      </text>

      {/* Electron 1 — quỹ đạo nằm ngang */}
      <circle r="5" fill="#c4b5fd" filter={`url(#${id}-glow)`}>
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href={`#${id}-orbit1`} />
        </animateMotion>
      </circle>
      <ellipse
        id={`${id}-orbit1`}
        cx="100"
        cy="80"
        rx="80"
        ry="22"
        fill="none"
        style={{ display: 'none' }}
      />

      {/* Electron 2 — quỹ đạo 60° */}
      <circle r="4.5" fill="#a78bfa" filter={`url(#${id}-glow)`}>
        <animateMotion dur="4s" repeatCount="indefinite" begin="-1.5s">
          <mpath href={`#${id}-orbit2`} />
        </animateMotion>
      </circle>
      <ellipse
        id={`${id}-orbit2`}
        cx="100"
        cy="80"
        rx="80"
        ry="22"
        transform="rotate(60 100 80)"
        fill="none"
        style={{ display: 'none' }}
      />

      {/* Electron 3 — quỹ đạo 120° */}
      <circle r="4" fill="#8b5cf6" filter={`url(#${id}-glow)`}>
        <animateMotion dur="2.5s" repeatCount="indefinite" begin="-0.8s">
          <mpath href={`#${id}-orbit3`} />
        </animateMotion>
      </circle>
      <ellipse
        id={`${id}-orbit3`}
        cx="100"
        cy="80"
        rx="80"
        ry="22"
        transform="rotate(120 100 80)"
        fill="none"
        style={{ display: 'none' }}
      />

      {/* Nhãn */}
      <text x="10" y="150" fontSize="9" fill="#a78bfa" opacity="0.7" fontFamily="monospace">
        atom · electron
      </text>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// HÓA HỌC — phân tử nước H₂O với liên kết dao động
// ──────────────────────────────────────────────────────────────────────────────
function ChemistryIllustration({ className = '' }: IllustrationProps) {
  const id = 'chem-ill'
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id={`${id}-O`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
        <radialGradient id={`${id}-H`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-glow-sm`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Liên kết O-H trái — dao động */}
      <line
        x1="100"
        y1="80"
        x2="52"
        y2="48"
        stroke="#fcd34d"
        strokeWidth="3"
        opacity="0.7"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="-5 100 80"
          to="5 100 80"
          dur="1.6s"
          repeatCount="indefinite"
          additive="sum"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          keyTimes="0; 0.5; 1"
          values="-5 100 80; 5 100 80; -5 100 80"
        />
      </line>
      {/* Liên kết O-H phải — dao động ngược pha */}
      <line
        x1="100"
        y1="80"
        x2="148"
        y2="48"
        stroke="#fcd34d"
        strokeWidth="3"
        opacity="0.7"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="5 100 80"
          to="-5 100 80"
          dur="1.6s"
          repeatCount="indefinite"
          additive="sum"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          keyTimes="0; 0.5; 1"
          values="5 100 80; -5 100 80; 5 100 80"
        />
      </line>

      {/* Nguyên tử H trái */}
      <circle cx="52" cy="48" r="18" fill={`url(#${id}-H)`} filter={`url(#${id}-glow-sm)`}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-5 100 80; 5 100 80; -5 100 80"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        fontSize="12"
        fill="white"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-5 100 80; 5 100 80; -5 100 80"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <tspan x="52" y="50">
          H
        </tspan>
      </text>

      {/* Nguyên tử H phải */}
      <circle cx="148" cy="48" r="18" fill={`url(#${id}-H)`} filter={`url(#${id}-glow-sm)`}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="5 100 80; -5 100 80; 5 100 80"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        fontSize="12"
        fill="white"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="5 100 80; -5 100 80; 5 100 80"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <tspan x="148" y="50">
          H
        </tspan>
      </text>

      {/* Nguyên tử O (trung tâm) */}
      <circle cx="100" cy="80" r="26" fill={`url(#${id}-O)`} filter={`url(#${id}-glow)`} />
      <text x="100" y="84" fontSize="15" fill="white" fontWeight="bold" textAnchor="middle">
        O
      </text>

      {/* Cặp electron tự do */}
      <circle cx="88" cy="108" r="3" fill="#fed7aa" opacity="0.8">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="112" cy="108" r="3" fill="#fed7aa" opacity="0.8">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Nhãn phân tử & góc liên kết */}
      <text
        x="100"
        y="135"
        fontSize="10"
        fill="#fb923c"
        opacity="0.9"
        fontWeight="bold"
        textAnchor="middle"
      >
        H₂O — 104.5°
      </text>
      <text x="10" y="152" fontSize="9" fill="#fb923c" opacity="0.6" fontFamily="monospace">
        cộng hóa trị
      </text>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// SINH HỌC — chuỗi DNA xoắn kép cuộn đều
// ──────────────────────────────────────────────────────────────────────────────
function BiologyIllustration({ className = '' }: IllustrationProps) {
  const id = 'bio-ill'
  // Tạo các cặp base pair
  const basePairs = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7 // 0..1
    const y = 15 + t * 130
    const phase = t * Math.PI * 4
    const x1 = 100 + Math.cos(phase) * 55
    const x2 = 100 - Math.cos(phase) * 55
    const midOpacity = Math.abs(Math.cos(phase)) < 0.3 ? 0.9 : 0.4
    return { i, y, x1, x2, midOpacity }
  })

  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-strand1`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id={`${id}-strand2`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Toàn bộ xoắn trượt lên */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0,0"
          to="0,-20"
          dur="3s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1"
          keyTimes="0;1"
          additive="sum"
        />

        {/* Sợi 1 — xoắn trái */}
        <path
          d="M 100,15 C 155,35 145,60 100,75 C 55,90 45,115 100,130 C 155,145 145,160 100,160"
          stroke={`url(#${id}-strand1)`}
          strokeWidth="4"
          strokeLinecap="round"
          filter={`url(#${id}-glow)`}
        />

        {/* Sợi 2 — xoắn phải */}
        <path
          d="M 100,15 C 45,35 55,60 100,75 C 145,90 155,115 100,130 C 45,145 55,160 100,160"
          stroke={`url(#${id}-strand2)`}
          strokeWidth="4"
          strokeLinecap="round"
          filter={`url(#${id}-glow)`}
        />

        {/* Cầu nối base pair */}
        {basePairs.map(({ i, y, x1, x2, midOpacity }) => (
          <line
            key={i}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="#fda4af"
            strokeWidth="1.8"
            opacity={midOpacity}
            strokeLinecap="round"
          />
        ))}

        {/* Nút atom tại đầu sợi */}
        {basePairs.map(({ i, y, x1, x2 }) => (
          <g key={`node-${i}`}>
            <circle cx={x1} cy={y} r="4" fill="#f43f5e" filter={`url(#${id}-glow)`} />
            <circle cx={x2} cy={y} r="4" fill="#fb7185" filter={`url(#${id}-glow)`} />
          </g>
        ))}
      </g>

      {/* Nhãn */}
      <text x="10" y="155" fontSize="9" fill="#fb7185" opacity="0.7" fontFamily="monospace">
        DNA double helix
      </text>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TIẾNG ANH — sách mở với bong bóng hội thoại
// ──────────────────────────────────────────────────────────────────────────────
function EnglishIllustration({ className = '' }: IllustrationProps) {
  const id = 'eng-ill'
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-book`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`${id}-page`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Quyển sách mở */}
      {/* Bìa trái */}
      <path
        d="M 30,35 L 100,45 L 100,130 L 30,120 Z"
        fill={`url(#${id}-book)`}
        opacity="0.85"
        filter={`url(#${id}-glow)`}
      />
      {/* Bìa phải */}
      <path d="M 170,35 L 100,45 L 100,130 L 170,120 Z" fill={`url(#${id}-book)`} opacity="0.7" />
      {/* Trang trái */}
      <path d="M 35,40 L 97,49 L 97,125 L 35,116 Z" fill={`url(#${id}-page)`} opacity="0.95" />
      {/* Trang phải */}
      <path d="M 165,40 L 103,49 L 103,125 L 165,116 Z" fill={`url(#${id}-page)`} opacity="0.9" />
      {/* Gáy sách */}
      <line x1="100" y1="45" x2="100" y2="130" stroke="#059669" strokeWidth="2" opacity="0.7" />

      {/* Dòng chữ trên trang trái */}
      {[58, 68, 78, 88, 98].map((y) => (
        <line
          key={y}
          x1="42"
          y1={y}
          x2="91"
          y2={y + 2}
          stroke="#059669"
          strokeWidth="1.5"
          opacity="0.35"
        />
      ))}
      {/* Dòng chữ trên trang phải */}
      {[58, 68, 78, 88, 98].map((y) => (
        <line
          key={y}
          x1="109"
          y1={y}
          x2="158"
          y2={y + 2}
          stroke="#059669"
          strokeWidth="1.5"
          opacity="0.25"
        />
      ))}

      {/* Bong bóng hội thoại lớn */}
      <rect
        x="108"
        y="10"
        width="72"
        height="36"
        rx="10"
        fill="#10b981"
        opacity="0.9"
        filter={`url(#${id}-glow)`}
      >
        <animate
          attributeName="opacity"
          values="0.7;0.95;0.7"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </rect>
      <polygon points="128,46 118,56 138,46" fill="#10b981" opacity="0.9">
        <animate
          attributeName="opacity"
          values="0.7;0.95;0.7"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </polygon>
      {/* Chữ "Hello!" trong bong bóng */}
      <text x="144" y="33" fontSize="14" fill="white" fontWeight="bold" textAnchor="middle">
        Hello!
      </text>

      {/* Bong bóng hội thoại nhỏ — bên trái */}
      <rect x="20" y="5" width="58" height="26" rx="8" fill="#059669" opacity="0.75">
        <animate
          attributeName="opacity"
          values="0.5;0.85;0.5"
          dur="3s"
          repeatCount="indefinite"
          begin="-1.2s"
        />
      </rect>
      <polygon points="40,31 30,40 50,31" fill="#059669" opacity="0.75">
        <animate
          attributeName="opacity"
          values="0.5;0.85;0.5"
          dur="3s"
          repeatCount="indefinite"
          begin="-1.2s"
        />
      </polygon>
      <text x="49" y="23" fontSize="11" fill="white" fontWeight="600" textAnchor="middle">
        Xin chào
      </text>

      {/* Dấu chấm nhắn đang gõ — ba chấm nhịp nhàng */}
      <circle cx="115" cy="138" r="4" fill="#34d399">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="1.2s"
          repeatCount="indefinite"
          begin="0s"
        />
        <animate attributeName="r" values="3;5;3" dur="1.2s" repeatCount="indefinite" begin="0s" />
      </circle>
      <circle cx="130" cy="138" r="4" fill="#34d399">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="1.2s"
          repeatCount="indefinite"
          begin="0.4s"
        />
        <animate
          attributeName="r"
          values="3;5;3"
          dur="1.2s"
          repeatCount="indefinite"
          begin="0.4s"
        />
      </circle>
      <circle cx="145" cy="138" r="4" fill="#34d399">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="1.2s"
          repeatCount="indefinite"
          begin="0.8s"
        />
        <animate
          attributeName="r"
          values="3;5;3"
          dur="1.2s"
          repeatCount="indefinite"
          begin="0.8s"
        />
      </circle>

      {/* Nhãn */}
      <text x="10" y="155" fontSize="9" fill="#34d399" opacity="0.7" fontFamily="monospace">
        bilingual · interactive
      </text>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// LẬP TRÌNH — màn hình terminal với code chạy
// ──────────────────────────────────────────────────────────────────────────────
function ProgrammingIllustration({ className = '' }: IllustrationProps) {
  const id = 'prog-ill'
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-screen`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Màn hình terminal */}
      <rect x="15" y="20" width="170" height="120" rx="10" fill={`url(#${id}-screen)`} />
      <rect
        x="15"
        y="20"
        width="170"
        height="120"
        rx="10"
        stroke="#4f46e5"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Thanh tiêu đề */}
      <rect x="15" y="20" width="170" height="22" rx="10" fill="#1e1b4b" />
      <rect x="15" y="32" width="170" height="10" fill="#1e1b4b" />
      {/* Nút điều khiển */}
      <circle cx="30" cy="31" r="4" fill="#f43f5e" opacity="0.8" />
      <circle cx="44" cy="31" r="4" fill="#f59e0b" opacity="0.8" />
      <circle cx="58" cy="31" r="4" fill="#22c55e" opacity="0.8" />

      {/* Dòng code */}
      <text x="24" y="60" fontSize="9" fill="#818cf8" fontFamily="monospace">
        <tspan fill="#f472b6">def </tspan>
        <tspan fill="#a5f3fc">solve</tspan>
        <tspan fill="#e2e8f0">(n):</tspan>
      </text>
      <text x="24" y="73" fontSize="9" fill="#818cf8" fontFamily="monospace">
        {'  '}
        <tspan fill="#f472b6">return </tspan>
        <tspan fill="#86efac">n * (n+1) // 2</tspan>
      </text>
      <text x="24" y="86" fontSize="9" fill="#818cf8" fontFamily="monospace">
        <tspan fill="#94a3b8"># Output:</tspan>
      </text>
      <text x="24" y="99" fontSize="9" fill="#818cf8" fontFamily="monospace">
        <tspan fill="#4ade80">{'>'} </tspan>
        <tspan fill="#e2e8f0">solve(100)</tspan>
      </text>
      <text x="24" y="112" fontSize="9" fill="#818cf8" fontFamily="monospace">
        <tspan fill="#fbbf24">5050</tspan>
      </text>

      {/* Con trỏ nhấp nháy */}
      <rect x="24" y="117" width="7" height="10" rx="1" fill="#818cf8">
        <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* Nhãn */}
      <text x="10" y="155" fontSize="9" fill="#818cf8" opacity="0.7" fontFamily="monospace">
        Python · Logic
      </text>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Export chính — chọn illustration theo subjectId
// ──────────────────────────────────────────────────────────────────────────────
interface SubjectIllustrationProps {
  subjectId: string
  /** 'sm' = 80px, 'md' = 120px, 'lg' = 180px, 'hero' = 200px */
  size?: 'sm' | 'md' | 'lg' | 'hero'
  className?: string
}

const SIZE_MAP: Record<NonNullable<SubjectIllustrationProps['size']>, string> = {
  sm: 'w-20 h-16',
  md: 'w-28 h-[90px]',
  lg: 'w-44 h-[140px]',
  hero: 'w-52 h-[165px]',
}

export default function SubjectIllustration({
  subjectId,
  size = 'md',
  className = '',
}: SubjectIllustrationProps) {
  const sizeClass = SIZE_MAP[size]
  const combined = `${sizeClass} ${className}`.trim()

  switch (subjectId) {
    case 'mathematics':
      return <MathIllustration className={combined} />
    case 'physics':
      return <PhysicsIllustration className={combined} />
    case 'chemistry':
      return <ChemistryIllustration className={combined} />
    case 'biology':
      return <BiologyIllustration className={combined} />
    case 'english':
      return <EnglishIllustration className={combined} />
    case 'programming':
      return <ProgrammingIllustration className={combined} />
    default:
      return <MathIllustration className={combined} />
  }
}
