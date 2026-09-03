// apps/dhcb/src/components/Home/HomeUniversalAiBar.tsx — Universal AI Ask Bar with Inline Quick Answer Modal
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Calculator,
  MessageSquare,
  Briefcase,
  Activity,
  Brain,
  Search,
  X,
  ArrowRight,
  Bot,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { startListening, isSTTSupported } from '../../lib/stt'
import { useToast } from '@core/ToastProvider'

interface PromptChip {
  id: string
  label: string
  icon: typeof Sparkles
  query: string
  route: string
  badgeColor: string
}

const PROMPT_CHIPS: PromptChip[] = [
  {
    id: 'speak',
    label: '🗣️ Luyện phát âm AI',
    icon: MessageSquare,
    query: 'Luyện phát âm với từ vựng',
    route: '/luyen-noi',
    badgeColor: 'hover:border-sky-500/50 hover:bg-sky-500/10 text-sky-300 theme-light:text-sky-800',
  },
  {
    id: 'math',
    label: '📐 Giải Toán & STEM',
    icon: Calculator,
    query: 'Tìm cực trị của hàm số bậc 3: y = x^3 - 3x + 2',
    route: '/mon-hoc/mathematics',
    badgeColor:
      'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-300 theme-light:text-blue-800',
  },
  {
    id: 'career',
    label: '💼 Phỏng vấn thử việc',
    icon: Briefcase,
    query: 'Mô phỏng câu hỏi phỏng vấn STAR cho vị trí Data Analyst',
    route: '/career/interview',
    badgeColor:
      'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300 theme-light:text-purple-800',
  },
  {
    id: 'simulators',
    label: '🔬 10 Simulators Đời Sống',
    icon: Activity,
    query: 'Cách tính tiền điện bậc thang EVN và tối ưu công suất',
    route: '/ung-dung-thuc-te',
    badgeColor:
      'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-300 theme-light:text-cyan-800',
  },
  {
    id: 'companion',
    label: '🧠 Socratic & Trí nhớ',
    icon: Brain,
    query: 'Cách xây dựng Cung điện Trí nhớ (Memory Palace) để học từ vựng',
    route: '/ban-dong-hanh',
    badgeColor:
      'hover:border-accent-500/50 hover:bg-accent-500/10 text-accent-300 theme-light:text-accent-800',
  },
]

export default function HomeUniversalAiBar() {
  const nav = useNavigate()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [quickAnswerOpen, setQuickAnswerOpen] = useState(false)
  const [quickAnswerLoading, setQuickAnswerLoading] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState('')
  const [activeDomainRoute, setActiveDomainRoute] = useState('')
  const [activeDomainLabel, setActiveDomainLabel] = useState('')
  const [aiAnswerContent, setAiAnswerContent] = useState<{
    summary: string
    socraticPoint: string
    formulaOrKey?: string
  } | null>(null)

  const stopVoiceRef = useRef<(() => void) | null>(null)

  const detectDomainAndAnswer = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase()
    if (!q) return

    setActiveQuestion(rawQuery)
    setQuickAnswerOpen(true)
    setQuickAnswerLoading(true)

    // Analyze intent domain
    let route = '/ban-dong-hanh'
    let domainName = 'Bạn Đồng Hành'
    let summary = ''
    let socraticPoint = ''
    let formulaOrKey: string | undefined = undefined

    if (
      q.includes('toán') ||
      q.includes('đạo hàm') ||
      q.includes('tích phân') ||
      q.includes('hàm số') ||
      q.includes('phương trình') ||
      q.includes('cực trị') ||
      q.includes('hình học')
    ) {
      route = '/mon-hoc/mathematics'
      domainName = 'Gia Sư Toán Học AI'
      summary =
        'Đối với dạng toán này, chìa khóa là xác định tập xác định D, tính đạo hàm bậc nhất f’(x), giải nghiệm f’(x) = 0 và lập bảng biến thiên để kết luận.'
      socraticPoint =
        'Gợi ý Socratic: Bạn hãy nhớ kiểm tra dấu của đạo hàm khi đi qua các nghiệm bội lẻ và bội chẵn!'
      formulaOrKey = "y' = 0 \\iff x = x_0; \\quad y'' (x_0) > 0 \\implies Cực tiểu"
    } else if (q.includes('vật lý') || q.includes('con lắc') || q.includes('dao động')) {
      route = '/mon-hoc/physics'
      domainName = 'Gia Sư Vật Lý AI'
      summary =
        'Dao động điều hòa tuân theo phương trình li độ x = A*cos(ωt + φ). Chu kỳ T = 2π/ω phụ thuộc vào đặc tính quán tính và lực hồi phục của hệ.'
      socraticPoint =
        'Gợi ý Socratic: Vận tốc đạt cực đại khi vật qua vị trí cân bằng và bằng 0 ở 2 biên!'
      formulaOrKey = 'T = 2\\pi \\sqrt{\\frac{m}{k}} = 2\\pi \\sqrt{\\frac{\\Delta l}{g}}'
    } else if (q.includes('hóa học') || q.includes('phản ứng') || q.includes('oxi hóa')) {
      route = '/mon-hoc/chemistry'
      domainName = 'Gia Sư Hóa Học AI'
      summary =
        'Phản ứng oxi hóa - khử bản chất là quá trình chuyển dịch electron. Chất khử cho electron (số oxi hóa tăng), chất oxi hóa nhận electron (số oxi hóa giảm).'
      socraticPoint = 'Quy tắc nhẩm nhanh: "Khử cho - O nhận; Khử tăng - O giảm".'
      formulaOrKey =
        'n_{e\\,cho} = n_{e\\,nhận} \\implies \\sum (n \\cdot \\Delta e)_{ox} = \\sum (n \\cdot \\Delta e)_{red}'
    } else if (q.includes('sinh học') || q.includes('di truyền') || q.includes('adn')) {
      route = '/mon-hoc/biology'
      domainName = 'Gia Sư Sinh Học AI'
      summary =
        'Quy luật di truyền Mendel: Phân ly độc lập khi các cặp gen quy định các tính trạng nằm trên các cặp NST tương đồng khác nhau.'
      socraticPoint =
        'Tỉ lệ phân ly kiểu hình F2 kinh điển là 9 : 3 : 3 : 1 cho phép lai 2 cặp tính trạng.'
      formulaOrKey = '(3 : 1)(3 : 1) = 9 : 3 : 3 : 1'
    } else if (
      q.includes('phỏng vấn') ||
      q.includes('cv') ||
      q.includes('sự nghiệp') ||
      q.includes('career')
    ) {
      route = '/career/interview'
      domainName = 'Cố Vấn Phỏng Vấn AI (STAR Model)'
      summary =
        'Trong phỏng vấn tuyển dụng, hãy luôn áp dụng mô hình STAR (Situation, Task, Action, Result) để chứng minh năng lực giải quyết vấn đề thực tế bằng số liệu định lượng.'
      socraticPoint =
        'Mẹo ứng tuyển: Luôn nhấn mạnh 70% thời lượng câu trả lời vào phần Action (Hành động cụ thể bạn đã làm) và Result (Kết quả đo lường được).'
      formulaOrKey =
        'STAR = Situation (Bối cảnh) → Task (Nhiệm vụ) → Action (Hành động) → Result (Kết quả)'
    } else if (
      q.includes('mô phỏng') ||
      q.includes('tiền điện') ||
      q.includes('lãi kép') ||
      q.includes('gps') ||
      q.includes('tdee')
    ) {
      route = '/ung-dung-thuc-te'
      domainName = 'Phòng Thí Nghiệm 10 Simulators'
      summary =
        'Mô hình tính tiền điện EVN áp dụng biểu giá lũy tiến 6 bậc. Bậc càng cao giá điện càng tăng, do đó việc phân bổ giờ cao điểm và sử dụng thiết bị inverter là cốt lõi.'
      socraticPoint =
        'Công thức lãi kép Einstein từng gọi là kỳ quan thứ 8: Thời gian đầu tư dài hạn sẽ tạo ra đường cong tăng trưởng hàm mũ.'
      formulaOrKey = 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt}'
    } else if (
      q.includes('phát âm') ||
      q.includes('nói') ||
      q.includes('speaking') ||
      q.includes('ipa')
    ) {
      route = '/luyen-noi'
      domainName = 'Gia Sư Luyện Phát Âm & IPA AI'
      summary =
        'Phát âm chuẩn tiếng Anh cần kiểm soát 3 yếu tố: Vị trí đặt lưỡi (Tongue placement), Độ mở khẩu hình (Jaw opening) và Dây thanh rung (Voicing).'
      socraticPoint =
        'Mẹo phản xạ: Hãy luyện tập với phương pháp Echo Shadowing - nói đè theo giọng người bản xứ với độ trễ 0.2s.'
      formulaOrKey = 'IPA Target Formants: F1 (Độ mở hàm) & F2 (Vị trí lưỡi trước/sau)'
    } else {
      route = '/ban-dong-hanh'
      domainName = 'Bạn Đồng Hành'
      summary = `Bạn Đồng Hành đã ghi nhận câu hỏi: "${rawQuery}". AI có thể đồng hành cùng bạn phân tích sâu hơn về học tập, lập kế hoạch công việc hoặc phản tỉnh nhận thức.`
      socraticPoint =
        'Bạn có thể đàm thoại trực tiếp bằng giọng nói thời gian thực với AI trong Live Studio!'
    }

    setActiveDomainRoute(route)
    setActiveDomainLabel(domainName)

    setTimeout(() => {
      setAiAnswerContent({
        summary,
        socraticPoint,
        formulaOrKey,
      })
      setQuickAnswerLoading(false)
    }, 450)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    detectDomainAndAnswer(query)
  }

  const toggleVoice = () => {
    if (isListening) {
      stopVoiceRef.current?.()
      setIsListening(false)
      return
    }

    if (!isSTTSupported()) {
      toast.info('Trình duyệt chưa hỗ trợ nhận dạng giọng nói trực tiếp')
      return
    }

    setIsListening(true)
    stopVoiceRef.current = startListening(
      'vi',
      () => {},
      (finalText) => {
        setIsListening(false)
        if (finalText.trim()) {
          setQuery(finalText)
          detectDomainAndAnswer(finalText)
        }
      },
      () => {
        setIsListening(false)
        toast.error('Lỗi nhận giọng nói, vui lòng thử lại')
      },
    )
  }

  return (
    <div className="w-full mb-4 animate-fade-up">
      {/* Universal Ask Bar */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center gap-2 bg-zinc-900/90 border rounded-2xl p-2 sm:p-2.5 transition-all duration-200 shadow-lg shadow-black/20 ${
          isListening
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-zinc-900'
            : 'border-zinc-800 focus-within:border-accent-500/80 focus-within:ring-2 focus-within:ring-accent-500/20'
        }`}
      >
        <div className="pl-2.5 text-zinc-400">
          {isListening ? (
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
            </span>
          ) : (
            <Search className="w-4 h-4 text-accent-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isListening
              ? 'Đang lắng nghe câu hỏi của bạn...'
              : 'Hỏi Bạn Đồng Hành AI (Toán, Tiếng Anh, Phỏng vấn, Simulators)...'
          }
          className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none min-w-0"
        />

        {/* Voice Command Button */}
        <button
          type="button"
          onClick={toggleVoice}
          aria-label={isListening ? 'Dừng lắng nghe' : 'Hỏi bằng giọng nói'}
          className={`tap-44 p-2 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 animate-pulse'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={!query.trim()}
          aria-label="Gửi câu hỏi tới AI"
          className={`tap-44 px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 text-xs font-semibold ${
            query.trim()
              ? 'bg-accent-500 hover:bg-accent-400 text-[#09090b] shadow-md shadow-accent-500/20 active:scale-95'
              : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Hỏi AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Prompt Starter Chips */}
      {/* Mask mờ dần ở mép phải = dấu hiệu "còn cuộn được nữa". Dùng mask thay vì lớp
          gradient màu để không phải đoán màu nền theo từng theme. */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 scrollbar-none [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
        <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider pl-1 shrink-0">
          Gợi ý nhanh:
        </span>
        {PROMPT_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => detectDomainAndAnswer(chip.query)}
            className={`tap-44 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-800/80 transition-all duration-200 shrink-0 shadow-sm active:scale-95 ${chip.badgeColor}`}
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Inline AI Quick Answer Modal */}
      {quickAnswerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-accent-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-400">
                    {activeDomainLabel}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">Phản Hồi Nhanh AI</h3>
                </div>
              </div>

              <button
                onClick={() => setQuickAnswerOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Echo */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300">
              <span className="font-semibold text-accent-300 mr-1.5">Câu hỏi:</span>
              <span>"{activeQuestion}"</span>
            </div>

            {/* AI Answer Stream / Content */}
            {quickAnswerLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-accent-400" />
                <span>Bạn Đồng Hành AI đang phân tích và trích xuất lời giải...</span>
              </div>
            ) : (
              aiAnswerContent && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-zinc-200">
                    <p>{aiAnswerContent.summary}</p>
                  </div>

                  {aiAnswerContent.formulaOrKey && (
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-amber-300 theme-light:text-amber-900 overflow-x-auto">
                      {aiAnswerContent.formulaOrKey}
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 theme-light:text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{aiAnswerContent.socraticPoint}</span>
                  </div>
                </div>
              )
            )}

            {/* Navigation CTA to Deep Specialized Room */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setQuickAnswerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setQuickAnswerOpen(false)
                  nav(activeDomainRoute)
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-[#09090b] font-semibold text-xs transition shadow-md shadow-accent-500/20 active:scale-95"
              >
                <span>Mở Chuyên Trang Học Sâu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
