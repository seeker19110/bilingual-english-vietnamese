// apps/english/src/pages/AppliedKnowledge.tsx — Kho Ứng Dụng Tri Thức Vào Đời Sống (Applied Knowledge Hub)
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  BookOpen,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  Cpu,
  Feather,
  Scale,
  Flame,
  CheckCircle2,
  Briefcase,
  Play,
  Layers,
  ArrowRight,
  DollarSign,
  HeartPulse,
  Compass,
  Radio,
  Clock,
  CheckSquare,
  Globe,
  Sliders,
} from 'lucide-react'
import Layout from '../components/Layout'
import {
  APPLIED_KNOWLEDGE_DATA,
  type SubjectId,
  type GradeTier,
} from '../data/appliedKnowledgeData'

const SUBJECT_FILTER_CONFIG: Array<{
  id: SubjectId
  label: string
  icon: typeof BookOpen
  color: string
}> = [
  { id: 'all', label: 'Tất cả môn', icon: Layers, color: 'text-zinc-300' },
  { id: 'mathematics', label: 'Toán học', icon: Calculator, color: 'text-blue-400' },
  { id: 'physics', label: 'Vật lý', icon: Zap, color: 'text-purple-400' },
  { id: 'chemistry', label: 'Hóa học', icon: FlaskConical, color: 'text-amber-400' },
  { id: 'biology', label: 'Sinh học', icon: Dna, color: 'text-rose-400' },
  { id: 'informatics', label: 'Tin học & AI', icon: Cpu, color: 'text-cyan-400' },
  { id: 'literature', label: 'Ngữ văn', icon: Feather, color: 'text-emerald-400' },
  { id: 'economics_law', label: 'Kinh tế & Pháp luật', icon: Scale, color: 'text-orange-400' },
  { id: 'history_geography', label: 'Lịch sử & Địa lý', icon: Globe, color: 'text-teal-400' },
]

const TIER_FILTER_CONFIG: Array<{ id: GradeTier; label: string }> = [
  { id: 'all', label: 'Mọi cấp học' },
  { id: 'elementary', label: 'Cấp 1 (Tiểu học)' },
  { id: 'secondary', label: 'Cấp 2 (THCS)' },
  { id: 'highschool', label: 'Cấp 3 (THPT)' },
]

type ActiveTab = 'library' | 'simulators' | 'ai_mentor' | 'projects'

export default function AppliedKnowledge() {
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('library')
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('all')
  const [selectedTier, setSelectedTier] = useState<GradeTier>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSimulator, setActiveSimulator] = useState<string>('profit')

  // State Simulator 1: Tối ưu hóa Lợi nhuận (Đạo hàm)
  const [prodCost, setProdCost] = useState(20) // Giá vốn 20k
  const [sellingPrice, setSellingPrice] = useState(45) // Giá bán 45k
  const [marketDemandBase, setMarketDemandBase] = useState(200) // Nhu cầu gốc 200 khách

  // State Simulator 2: Tiền điện gia đình (Vật lý)
  const [acHours, setAcHours] = useState(8)
  const [acTemp, setAcTemp] = useState(26)
  const [waterHeaterMins, setWaterHeaterMins] = useState(30)
  const [laptopHours, setLaptopHours] = useState(6)

  // State Simulator 3: BMR / Dinh dưỡng (Sinh học)
  const [weightKg, setWeightKg] = useState(60)
  const [heightCm, setHeightCm] = useState(165)
  const [age, setAge] = useState(18)
  const [activityLevel, setActivityLevel] = useState(1.375) // Nhẹ nhàng

  // State Simulator 4: Lãi kép (Toán Cấp số nhân)
  const [initialCapital, setInitialCapital] = useState(10) // 10 triệu
  const [monthlySavings, setMonthlySavings] = useState(2) // 2 triệu/tháng
  const [annualInterest, setAnnualInterest] = useState(10) // 10%/năm
  const [years, setYears] = useState(10) // 10 năm

  // State Simulator 5: GPS Relativity (Thuyết tương đối Einstein)
  const [gpsDays, setGpsDays] = useState(1) // Số ngày hoạt động

  // State Simulator 6: Pha chế dung dịch (Hóa học nồng độ %)
  const [targetAlcoholVolume, setTargetAlcoholVolume] = useState(500) // 500ml cồn 70
  const [sourceAlcoholDeg, setSourceAlcoholDeg] = useState(90) // Cồn 90 độ gốc
  const [targetAlcoholDeg, setTargetAlcoholDeg] = useState(70) // Cồn 70 độ đích

  // State Simulator 7: Đo chiều cao bằng lượng giác
  const [trigAngleDeg, setTrigAngleDeg] = useState(45) // Góc ngắm 45 độ
  const [trigDistanceM, setTrigDistanceM] = useState(25) // Khoảng cách 25m
  const [eyeHeightM, setEyeHeightM] = useState(1.6) // Chiều cao mắt

  // State Simulator 8: Dopamine & Tập trung
  const [tiktokMins, setTiktokMins] = useState(60)
  const [exerciseMins, setExerciseMins] = useState(30)
  const [deepWorkHours, setDeepWorkHours] = useState(3)

  // AI Q&A State
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [isAnswering, setIsAnswering] = useState(false)

  // Lọc danh sách bài học ứng dụng
  const filteredItems = useMemo(() => {
    return APPLIED_KNOWLEDGE_DATA.filter((item) => {
      const matchSubject = selectedSubject === 'all' || item.subjectId === selectedSubject
      const matchTier = selectedTier === 'all' || item.tier === selectedTier || item.tier === 'all'
      const matchSearch =
        !searchQuery.trim() ||
        item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.academicConcept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.realWorldProblems.some((p) =>
          (p.title + p.description).toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        item.industryApplications.some((ind) =>
          (ind.industry + ind.jobTitle).toLowerCase().includes(searchQuery.toLowerCase()),
        )
      return matchSubject && matchTier && matchSearch
    })
  }, [selectedSubject, selectedTier, searchQuery])

  // Tính toán Simulator 1 (Toán Đạo Hàm & Lợi Nhuận)
  const profitSimResult = useMemo(() => {
    const demand = Math.max(10, Math.round(marketDemandBase - 2.5 * (sellingPrice - 30)))
    const revenue = sellingPrice * demand * 1000
    const cost = prodCost * demand * 1000 + 1000000
    const profit = revenue - cost
    const optimalPrice = Math.round(55 + 0.5 * prodCost)
    return { demand, revenue, cost, profit, optimalPrice }
  }, [prodCost, sellingPrice, marketDemandBase])

  // Tính toán Simulator 2 (Vật lý Tiền điện)
  const electricitySimResult = useMemo(() => {
    const acPowerKw = acTemp < 22 ? 1.2 : acTemp <= 25 ? 0.9 : 0.65
    const acMonthlyKwh = acPowerKw * acHours * 30
    const waterHeaterKwh = 2.5 * (waterHeaterMins / 60) * 30
    const laptopKwh = 0.08 * laptopHours * 30
    const baseKwh = 60

    const totalKwh = Math.round(acMonthlyKwh + waterHeaterKwh + laptopKwh + baseKwh)
    const totalCost = Math.round(totalKwh * 2450)
    const optimizedCost = Math.round(
      (0.65 * acHours * 30 + waterHeaterKwh * 0.8 + laptopKwh + baseKwh) * 2450,
    )
    const potentialSaving = Math.max(0, totalCost - optimizedCost)

    return { totalKwh, totalCost, potentialSaving }
  }, [acHours, acTemp, waterHeaterMins, laptopHours])

  // Tính toán Simulator 3 (Sinh học BMR & TDEE)
  const nutritionSimResult = useMemo(() => {
    const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
    const tdee = Math.round(bmr * activityLevel)
    const deficitCalories = Math.round(tdee - 400)
    const proteinGrams = Math.round(weightKg * 1.8)
    const fatGrams = Math.round((tdee * 0.25) / 9)
    const carbGrams = Math.round((deficitCalories - proteinGrams * 4 - fatGrams * 9) / 4)

    return { bmr, tdee, deficitCalories, proteinGrams, fatGrams, carbGrams }
  }, [weightKg, heightCm, age, activityLevel])

  // Tính toán Simulator 4 (Toán Cấp số nhân & Lãi kép)
  const compoundSimResult = useMemo(() => {
    const r = annualInterest / 100 / 12
    const n = years * 12
    const P = initialCapital * 1000000
    const PMT = monthlySavings * 1000000

    const fvCapitalOnly = P * Math.pow(1 + r, n)
    const fvSavings = r > 0 ? PMT * ((Math.pow(1 + r, n) - 1) / r) : PMT * n
    const totalWealth = Math.round(fvCapitalOnly + fvSavings)
    const totalDeposited = Math.round(P + PMT * n)
    const totalInterest = Math.max(0, totalWealth - totalDeposited)

    return { totalWealth, totalDeposited, totalInterest }
  }, [initialCapital, monthlySavings, annualInterest, years])

  // Tính toán Simulator 5 (GPS Relativity)
  const gpsSimResult = useMemo(() => {
    const microSecPerDay = 38.6 // Vệ tinh chạy nhanh hơn 38.6 micro-giây/ngày
    const totalMicroSec = (gpsDays * microSecPerDay).toFixed(1)
    // Sai số vị trí: c * delta_t = 300.000 km/s * 38.6 us ~ 11.58 km/ngày
    const driftKm = (gpsDays * 11.58).toFixed(1)
    return { totalMicroSec, driftKm }
  }, [gpsDays])

  // Tính toán Simulator 6 (Pha chế nồng độ C%)
  const mixingSimResult = useMemo(() => {
    // V1 * C1 = V2 * C2 => V1 = (V2 * C2) / C1
    const requiredSourceVolume = Math.round(
      (targetAlcoholVolume * targetAlcoholDeg) / sourceAlcoholDeg,
    )
    const requiredWaterVolume = Math.max(0, targetAlcoholVolume - requiredSourceVolume)
    return { requiredSourceVolume, requiredWaterVolume }
  }, [targetAlcoholVolume, sourceAlcoholDeg, targetAlcoholDeg])

  // Tính toán Simulator 7 (Lượng giác đo chiều cao)
  const trigSimResult = useMemo(() => {
    const angleRad = (trigAngleDeg * Math.PI) / 180
    const calculatedHeight = (trigDistanceM * Math.tan(angleRad) + eyeHeightM).toFixed(2)
    return { calculatedHeight }
  }, [trigAngleDeg, trigDistanceM, eyeHeightM])

  // Tính toán Simulator 8 (Dopamine & Tập trung)
  const dopamineSimResult = useMemo(() => {
    // Thang điểm tập trung: + deepWork, + exercise, - tiktok
    const score = Math.min(
      100,
      Math.max(10, Math.round(50 + deepWorkHours * 12 + exerciseMins * 0.4 - tiktokMins * 0.35)),
    )
    const level =
      score >= 75
        ? 'Rất cao (Flow State)'
        : score >= 50
          ? 'Ổn định'
          : 'Kiệt sức Dopamine (Brain Fog)'
    return { score, level }
  }, [tiktokMins, exerciseMins, deepWorkHours])

  // Xử lý hỏi AI "Học cái này làm gì trong đời?"
  const handleAskAi = (questionText?: string) => {
    const q = questionText || aiQuestion
    if (!q.trim()) return
    setIsAnswering(true)
    setAiQuestion(q)

    setTimeout(() => {
      let ans = ''
      const lower = q.toLowerCase()
      if (lower.includes('số phức')) {
        ans = `**1. Bản chất đời thường:** Số thực chỉ có 1 chiều (như tiền nong), nhưng cuộc sống có những thứ luôn dao động và có 2 thành phần cùng lúc: **Độ lớn** và **Pha/Góc**.\n\n**2. Ứng dụng thực tế ngoài đời:**\n• **Lưới điện xoay chiều:** Điện áp và cường độ dòng điện trong nhà luôn lệch pha nhau. Kỹ sư điện bắt buộc dùng số phức $z = a + bi$ để tính toán công suất tải, nếu không mạng lưới điện quốc gia sẽ sụp đổ.\n• **Tai nghe chống ồn (ANC):** Dùng phép biến đổi Fourier (hoàn toàn trên số phức) phân tích sóng âm để phát sóng ngược pha triệt tiêu tiếng ồn trong vài mili-giây.\n• **Đồ họa Game 3D:** Xoay camera trong Liên Quân/PUBG mượt mà không bị méo góc nhờ Quaternion (mở rộng của số phức).\n\n**3. Ngành nghề sử dụng:** Kỹ sư Điện tử viễn thông, Lập trình viên Game 3D, Kỹ sư Âm thanh (Lương 25 - 60 triệu/tháng).`
      } else if (lower.includes('đạo hàm') || lower.includes('cực trị')) {
        ans = `**1. Bản chất đời thường:** Đạo hàm là chiếc đồng hồ đo tốc độ thay đổi tức thời. Nó giúp bạn tìm ra điểm "ngọt ngào nhất" (lãi cao nhất, tốn ít chi phí nhất, đi nhanh nhất).\n\n**2. Ứng dụng thực tế ngoài đời:**\n• **Trí tuệ nhân tạo (AI):** ChatGPT và xe tự hành Tesla học hỏi bằng thuật toán *Gradient Descent* (chính là đạo hàm liên tục để giảm sai số về 0).\n• **Kinh doanh & Bán lẻ:** Tìm mức giá bán tối ưu để tổng lợi nhuận ròng đạt cực đại.\n• **Sản xuất bao bì:** Thiết kế vỏ lon nước ngọt 330ml tốn ít nhôm nhất thế giới.\n\n**3. Ngành nghề sử dụng:** AI Engineer, Quantitative Finance Analyst, Quản lý chuỗi cung ứng.`
      } else if (lower.includes('văn') || lower.includes('thơ')) {
        ans = `**1. Bản chất đời thường:** Học Văn không phải là chép văn mẫu, mà là rèn luyện **năng lực thấu cảm tâm lý người khác** và **nghệ thuật thuyết phục**.\n\n**2. Ứng dụng thực tế ngoài đời:**\n• **Thiết kế ứng dụng (UI/UX):** Muốn làm app triệu người dùng, bạn phải hiểu nỗi đau và cảm xúc người dùng (như phân tích tâm lý nhân vật Chí Phèo/Lão Hạc).\n• **Viết Prompt cho AI:** Người giỏi hành văn sẽ ra lệnh cho AI chính xác, gãy gọn và hiệu quả gấp 3 lần người viết mơ hồ.\n• **Đàm phán tăng lương & Bán hàng:** Cấu trúc văn nghị luận (Luận điểm -> Luận cứ -> Kêu gọi hành động) là nền tảng của mọi bài thuyết trình gọi vốn triệu USD.\n\n**3. Ngành nghề sử dụng:** Product Manager, Copywriter, Giám đốc truyền thông, Founder Startup.`
      } else {
        ans = `**1. Bản chất đời thường:** Mọi kiến thức trường học đều sinh ra để giải quyết một nhu cầu sinh tồn, sản xuất hoặc quản trị của nhân loại.\n\n**2. Ứng dụng thực tế:** Khi kết hợp kiến thức này với công nghệ và kinh tế, bạn có thể tự động hóa công việc, tối ưu hóa sức khỏe bản thân và đưa ra các quyết định đầu tư/sự nghiệp sáng suốt hơn.\n\n**3. Lời khuyên:** Hãy thử mở tab "Phòng Thí Nghiệm Đời Thực" để trực tiếp tương tác với các mô phỏng toán - lý - hóa - sinh!`
      }
      setAiAnswer(ans)
      setIsAnswering(false)
    }, 350)
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/')} />

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-8">
        {/* Header giới thiệu */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Applied Knowledge Platform — Tri Thức Đi Vào Cuộc Sống
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Học Để Làm Gì Ngoài Đời Thực?
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400">
            Hệ thống hóa toàn bộ kiến thức phổ thông từ Lớp 1 đến Lớp 12 thành công cụ giải quyết
            bài toán tiền bạc, sức khỏe, công nghệ, nghề nghiệp & khởi nghiệp.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 4 TAB ĐIỀU HƯỚNG CHÍNH                                   */}
        {/* ======================================================== */}
        <div className="flex justify-center">
          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'library'
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Kho Tri Thức Ứng Dụng
            </button>
            <button
              onClick={() => setActiveTab('simulators')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'simulators'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Phòng Thí Nghiệm Đời Thực (8 Sandbox)
            </button>
            <button
              onClick={() => setActiveTab('ai_mentor')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'ai_mentor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Hỏi Gia Sư AI
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              Dự Án Tự Làm Tại Nhà
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: KHO TRI THỨC ỨNG DỤNG                             */}
        {/* ======================================================== */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Bộ lọc 2 tầng */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto w-full sm:w-auto">
                  {TIER_FILTER_CONFIG.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedTier === tier.id
                          ? 'bg-accent-500 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm bài học, vấn đề thực tế..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {SUBJECT_FILTER_CONFIG.map((sub) => {
                  const Icon = sub.icon
                  const active = selectedSubject === sub.id
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border whitespace-nowrap transition ${
                        active
                          ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${sub.color}`} />
                      {sub.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Danh sách thẻ */}
            <div className="grid grid-cols-1 gap-6">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 sm:p-6 space-y-5 transition-all shadow-md hover:shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-accent-500/10 border border-accent-500/30 text-accent-400 font-semibold">
                          {item.subjectName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                          {item.tierLabel} ({item.gradeSpan})
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{item.topic}</h3>
                    </div>

                    {item.simulatorType && (
                      <button
                        onClick={() => {
                          setActiveTab('simulators')
                          setActiveSimulator(item.simulatorType!)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-accent-300 text-xs font-semibold transition border border-zinc-700"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Mở Mô Phỏng
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <div className="text-xs font-bold text-accent-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Bản Chất Trực Quan (Dễ Hiểu)
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {item.intuitiveExplanation}
                    </p>
                    <div className="text-xs text-zinc-500 font-mono pt-1">
                      Lý thuyết chuẩn: {item.academicConcept}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Các Bài Toán Thực Tế Cuộc Sống Giải Quyết Được
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.realWorldProblems.map((prob, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1.5 hover:border-zinc-700 transition"
                        >
                          <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {prob.title}
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {prob.description}
                          </p>
                          <div className="text-xs text-emerald-400/90 font-medium pt-1">
                            ✓ Lợi ích: {prob.practicalBenefit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      Ứng Dụng Công Nghiệp & Nghề Nghiệp Tương Lai
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.industryApplications.map((app, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-blue-950/15 border border-blue-500/20 space-y-1"
                        >
                          <div className="text-xs font-bold text-blue-300">{app.industry}</div>
                          <div className="text-xs font-semibold text-white">{app.jobTitle}</div>
                          <p className="text-xs text-zinc-400">{app.howItIsUsed}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PHÒNG THÍ NGHIỆM ĐỜI THỰC (8 SIMULATORS)          */}
        {/* ======================================================== */}
        {activeTab === 'simulators' && (
          <div className="space-y-6">
            {/* Lựa chọn 8 Simulators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'profit',
                  label: 'Tối ưu Lợi nhuận',
                  sub: 'Toán · Đạo hàm',
                  icon: Calculator,
                  color: 'text-blue-400',
                },
                {
                  id: 'electricity',
                  label: 'Tiền điện gia đình',
                  sub: 'Vật lý · Công suất',
                  icon: Zap,
                  color: 'text-purple-400',
                },
                {
                  id: 'nutrition',
                  label: 'Dinh dưỡng BMR',
                  sub: 'Sinh học · Trao đổi chất',
                  icon: HeartPulse,
                  color: 'text-rose-400',
                },
                {
                  id: 'compound',
                  label: 'Lãi kép 10 năm',
                  sub: 'Toán · Cấp số nhân',
                  icon: DollarSign,
                  color: 'text-emerald-400',
                },
                {
                  id: 'gps_relativity',
                  label: 'Sai số Vệ tinh GPS',
                  sub: 'Vật lý · Thuyết tương đối',
                  icon: Radio,
                  color: 'text-cyan-400',
                },
                {
                  id: 'solution_mixing',
                  label: 'Pha chế Cồn 70°',
                  sub: 'Hóa học · Nồng độ C%',
                  icon: FlaskConical,
                  color: 'text-amber-400',
                },
                {
                  id: 'trigonometry_height',
                  label: 'Đo chiều cao tòa nhà',
                  sub: 'Toán · Lượng giác',
                  icon: Compass,
                  color: 'text-teal-400',
                },
                {
                  id: 'dopamine_focus',
                  label: 'Quản lý Dopamine',
                  sub: 'Sinh học · Hệ thần kinh',
                  icon: BrainIcon,
                  color: 'text-fuchsia-400',
                },
              ].map((sim) => {
                const Icon = sim.icon
                const active = activeSimulator === sim.id
                return (
                  <button
                    key={sim.id}
                    onClick={() => setActiveSimulator(sim.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      active
                        ? 'bg-zinc-800 border-zinc-500 text-white shadow-lg'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 font-semibold text-xs sm:text-sm ${sim.color}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" /> {sim.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">{sim.sub}</div>
                  </button>
                )
              })}
            </div>

            {/* SIMULATOR 1: TỐI ƯU LỢI NHUẬN */}
            {activeSimulator === 'profit' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-blue-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Calculator className="w-5 h-5" />
                    Mô Phỏng 1: Định Giá Bán Tối Ưu Lợi Nhuận Bằng Đạo Hàm
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Profit&apos;(Price) = 0
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Giá vốn mỗi sản phẩm (k VNĐ):</label>
                    <div className="text-sm font-bold text-white">{prodCost}.000 đ</div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={prodCost}
                      onChange={(e) => setProdCost(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Giá bán dự kiến (k VNĐ):</label>
                    <div className="text-sm font-bold text-blue-400">{sellingPrice}.000 đ</div>
                    <input
                      type="range"
                      min="25"
                      max="100"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Dung lượng thị trường mục tiêu:</label>
                    <div className="text-sm font-bold text-white">
                      {marketDemandBase} khách/ngày
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={marketDemandBase}
                      onChange={(e) => setMarketDemandBase(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Lượng bán ước tính</div>
                    <div className="text-lg font-bold text-white">
                      {profitSimResult.demand} ly/ngày
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Doanh thu ngày</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {(profitSimResult.revenue / 1000).toLocaleString()}k đ
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Lợi nhuận ròng/ngày</div>
                    <div
                      className={`text-lg font-bold ${profitSimResult.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {(profitSimResult.profit / 1000).toLocaleString()}k đ
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/40 text-center">
                    <div className="text-xs text-blue-300 font-semibold">
                      Giá bán tối ưu (Cực trị)
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {profitSimResult.optimalPrice}.000 đ
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 2: TIỀN ĐIỆN GIA ĐÌNH */}
            {activeSimulator === 'electricity' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-purple-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Zap className="w-5 h-5" />
                    Mô Phỏng 2: Tính Toán Tiền Điện Gia Đình (Vật Lý Công Suất P * t)
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono">
                    A = P * t (kWh)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Nhiệt độ Điều hòa:</label>
                    <div className="text-sm font-bold text-purple-300">{acTemp} °C</div>
                    <input
                      type="range"
                      min="18"
                      max="30"
                      value={acTemp}
                      onChange={(e) => setAcTemp(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Giờ bật Điều hòa/ngày:</label>
                    <div className="text-sm font-bold text-white">{acHours} giờ</div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={acHours}
                      onChange={(e) => setAcHours(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Bình nóng lạnh:</label>
                    <div className="text-sm font-bold text-white">{waterHeaterMins} phút</div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={waterHeaterMins}
                      onChange={(e) => setWaterHeaterMins(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Laptop / PC:</label>
                    <div className="text-sm font-bold text-white">{laptopHours} giờ</div>
                    <input
                      type="range"
                      min="1"
                      max="18"
                      value={laptopHours}
                      onChange={(e) => setLaptopHours(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Tổng điện tiêu thụ tháng</div>
                    <div className="text-xl font-bold text-white">
                      {electricitySimResult.totalKwh} kWh
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Hóa đơn tiền điện ước tính</div>
                    <div className="text-xl font-bold text-purple-400">
                      {electricitySimResult.totalCost.toLocaleString()} đ/tháng
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center">
                    <div className="text-xs text-emerald-300 font-semibold">
                      Tiềm năng tiết kiệm (26°C + Quạt)
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      -{electricitySimResult.potentialSaving.toLocaleString()} đ
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 3: DINH DƯỠNG BMR */}
            {activeSimulator === 'nutrition' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-rose-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <HeartPulse className="w-5 h-5" />
                    Mô Phỏng 3: Phân Tích Trao Đổi Chất (BMR/TDEE) & Macro Dinh Dưỡng
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono">
                    Calo In &lt; Calo Out
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Cân nặng (kg):</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Chiều cao (cm):</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Tuổi:</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Mức vận động:</label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white"
                    >
                      <option value={1.2}>Ít vận động</option>
                      <option value={1.375}>Vận động nhẹ</option>
                      <option value={1.55}>Vận động vừa</option>
                      <option value={1.725}>Vận động nhiều</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">BMR Cơ bản</div>
                    <div className="text-lg font-bold text-white">
                      {nutritionSimResult.bmr} kcal
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">TDEE Hàng ngày</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {nutritionSimResult.tdee} kcal
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center">
                    <div className="text-xs text-rose-300 font-semibold">Calo giảm mỡ</div>
                    <div className="text-lg font-bold text-rose-400">
                      {nutritionSimResult.deficitCalories} kcal
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Đạm (Protein)</div>
                    <div className="text-lg font-bold text-amber-400">
                      {nutritionSimResult.proteinGrams}g
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 4: LÃI KÉP 10 NĂM */}
            {activeSimulator === 'compound' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <DollarSign className="w-5 h-5" />
                    Mô Phỏng 4: Sức Mạnh Lãi Kép & Kế Hoạch Tài Chính (Cấp Số Nhân)
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    A = P(1+r)^n
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Vốn gốc ban đầu (Triệu):</label>
                    <input
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Góp thêm mỗi tháng (Triệu):</label>
                    <input
                      type="number"
                      value={monthlySavings}
                      onChange={(e) => setMonthlySavings(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Lãi suất (%/năm):</label>
                    <input
                      type="number"
                      value={annualInterest}
                      onChange={(e) => setAnnualInterest(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-emerald-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Số năm tích lũy:</label>
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Tổng vốn tự đóng</div>
                    <div className="text-lg font-bold text-zinc-300">
                      {(compoundSimResult.totalDeposited / 1000000).toFixed(1)} Triệu đ
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Tiền lãi sinh ra</div>
                    <div className="text-lg font-bold text-cyan-400">
                      +{(compoundSimResult.totalInterest / 1000000).toFixed(1)} Triệu đ
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center">
                    <div className="text-xs text-emerald-300 font-semibold">Tổng tài sản</div>
                    <div className="text-xl font-bold text-emerald-400">
                      {(compoundSimResult.totalWealth / 1000000).toFixed(1)} Triệu đ
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 5: GPS RELATIVITY */}
            {activeSimulator === 'gps_relativity' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-cyan-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Radio className="w-5 h-5" />
                    Mô Phỏng 5: Thuyết Tương Đối Einstein & Độ Lệch Vị Trí Vệ Tinh GPS
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    Δt = +38.6 μs / ngày
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">
                    Số ngày vệ tinh hoạt động liên tục (không bù trừ Einstein):
                  </label>
                  <div className="text-base font-bold text-cyan-300">{gpsDays} ngày</div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={gpsDays}
                    onChange={(e) => setGpsDays(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">
                      Đồng hồ vệ tinh chạy nhanh hơn mặt đất
                    </div>
                    <div className="text-xl font-bold text-white">
                      +{gpsSimResult.totalMicroSec} micro-giây
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center">
                    <div className="text-xs text-rose-300 font-semibold">
                      Sai lệch vị trí trên Google Maps
                    </div>
                    <div className="text-2xl font-bold text-rose-400">
                      +{gpsSimResult.driftKm} Kilomet (km)
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
                  💡 <strong>Thực tế chứng minh:</strong> Nếu không áp dụng phương trình thuyết
                  tương đối của Einstein để chỉnh chậm đồng hồ vệ tinh trước khi phóng, bản đồ định
                  vị trên điện thoại của bạn sẽ bị trôi dạt{' '}
                  <strong>{gpsSimResult.driftKm} km</strong> sau {gpsDays} ngày!
                </p>
              </div>
            )}

            {/* SIMULATOR 6: PHA CHẾ DUNG DỊCH (HÓA HỌC) */}
            {activeSimulator === 'solution_mixing' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <FlaskConical className="w-5 h-5" />
                    Mô Phỏng 6: Pha Chế Cồn Sát Khuẩn 70° Chuẩn Y Tế (Nồng Độ Dung Dịch C%)
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                    V1 * C1 = V2 * C2
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">
                      Thể tích dung dịch cần tạo (ml):
                    </label>
                    <input
                      type="number"
                      value={targetAlcoholVolume}
                      onChange={(e) => setTargetAlcoholVolume(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Độ cồn chai gốc có sẵn (°):</label>
                    <input
                      type="number"
                      value={sourceAlcoholDeg}
                      onChange={(e) => setSourceAlcoholDeg(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Độ cồn mong muốn đạt được (°):</label>
                    <input
                      type="number"
                      value={targetAlcoholDeg}
                      onChange={(e) => setTargetAlcoholDeg(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-amber-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/40 text-center">
                    <div className="text-xs text-amber-300 font-semibold">
                      Lượng Cồn {sourceAlcoholDeg}° cần đong
                    </div>
                    <div className="text-2xl font-bold text-amber-400">
                      {mixingSimResult.requiredSourceVolume} ml
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-950/25 border border-blue-500/40 text-center">
                    <div className="text-xs text-blue-300 font-semibold">
                      Lượng Nước tinh khiết thêm vào
                    </div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {mixingSimResult.requiredWaterVolume} ml
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 7: ĐO CHIỀU CAO BẰNG LƯỢNG GIÁC */}
            {activeSimulator === 'trigonometry_height' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-teal-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Compass className="w-5 h-5" />
                    Mô Phỏng 7: Đo Chiều Cao Tòa Nhà / Cột Cờ Bằng Lượng Giác
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-mono">
                    h = d * tan(α) + h_mắt
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Góc ngắm đo được (Độ °):</label>
                    <div className="text-sm font-bold text-teal-300">{trigAngleDeg}°</div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={trigAngleDeg}
                      onChange={(e) => setTrigAngleDeg(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">
                      Khoảng cách đến chân công trình (Mét):
                    </label>
                    <div className="text-sm font-bold text-white">{trigDistanceM} mét</div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={trigDistanceM}
                      onChange={(e) => setTrigDistanceM(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Chiều cao mắt người ngắm (Mét):</label>
                    <input
                      type="number"
                      step="0.05"
                      value={eyeHeightM}
                      onChange={(e) => setEyeHeightM(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm font-bold text-white"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 text-center">
                  <div className="text-xs text-teal-300 font-semibold">
                    Chiều cao thực tế của công trình
                  </div>
                  <div className="text-3xl font-bold text-teal-400">
                    {trigSimResult.calculatedHeight} Mét
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 8: DOPAMINE & TẬP TRUNG */}
            {activeSimulator === 'dopamine_focus' && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-fuchsia-500/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-fuchsia-400 font-bold">
                    <Clock className="w-5 h-5" />
                    Mô Phỏng 8: Quản Lý Dopamine & Mức Độ Tập Trung Não Bộ
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-fuchsia-500/20 text-fuchsia-300 font-mono">
                    Dopamine Baseline
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">
                      Lướt TikTok / Reels (Phút/ngày):
                    </label>
                    <div className="text-sm font-bold text-rose-400">{tiktokMins} phút</div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="10"
                      value={tiktokMins}
                      onChange={(e) => setTiktokMins(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Tập thể dục / Vận động (Phút):</label>
                    <div className="text-sm font-bold text-emerald-400">{exerciseMins} phút</div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={exerciseMins}
                      onChange={(e) => setExerciseMins(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Học tập / Làm việc sâu (Giờ):</label>
                    <div className="text-sm font-bold text-cyan-400">{deepWorkHours} giờ</div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={deepWorkHours}
                      onChange={(e) => setDeepWorkHours(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                    <div className="text-xs text-zinc-500">Chỉ số tập trung não bộ</div>
                    <div className="text-2xl font-bold text-white">
                      {dopamineSimResult.score} / 100
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/40 text-center">
                    <div className="text-xs text-fuchsia-300 font-semibold">
                      Trạng thái tinh thần
                    </div>
                    <div className="text-xl font-bold text-fuchsia-400">
                      {dopamineSimResult.level}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HỎI GIA SƯ AI THỰC TẾ                            */}
        {/* ======================================================== */}
        {activeTab === 'ai_mentor' && (
          <div className="bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Trợ Lý AI: Giải Mã Bản Chất Đời Thực Của Mọi Bài Học
                </h2>
                <p className="text-xs text-zinc-400">
                  Hỏi bất kỳ điều gì bạn cảm thấy trừu tượng và không biết học để làm gì
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                placeholder="Ví dụ: Học số phức để làm gì? / Đạo hàm áp dụng vào AI thế nào?..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={isAnswering || !aiQuestion.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                {isAnswering ? 'Đang giải mã...' : 'Giải mã'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-500">Câu hỏi phổ biến:</span>
              {[
                'Học Số Phức Toán 12 để làm gì?',
                'Đạo hàm ứng dụng trong AI thế nào?',
                'Học Văn giúp gì cho ngành IT?',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAskAi(tag)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-indigo-900/40 border border-zinc-700/60 text-zinc-300 transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {aiAnswer && (
              <div className="p-4 rounded-xl bg-zinc-950/90 border border-indigo-500/40 text-sm space-y-3">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Sparkles className="w-4 h-4" /> Lời giải mã từ Gia Sư AI
                </div>
                <div className="text-zinc-300 leading-relaxed whitespace-pre-line">{aiAnswer}</div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DỰ ÁN THỰC CHIẾN TỰ LÀM TẠI NHÀ (MINI PROJECTS)  */}
        {/* ======================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Thư Viện Dự Án Thực Chiến (K12 Mini Capstone Projects)
              </h2>
              <span className="text-xs text-zinc-400">15–30 phút thực hành tại nhà</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {APPLIED_KNOWLEDGE_DATA.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-3 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                      {item.subjectName}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ⏱ {item.miniProject.durationMinutes} phút
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base">{item.miniProject.title}</h3>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-zinc-400">Các bước thực hiện:</div>
                    <ul className="text-xs text-zinc-300 space-y-1">
                      {item.miniProject.instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-amber-300/90 font-medium pt-2 border-t border-zinc-800">
                    🎯 Sản phẩm bàn giao: {item.miniProject.deliverable}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function BrainIcon(props: React.ComponentProps<typeof Dna>) {
  return <Dna {...props} />
}
