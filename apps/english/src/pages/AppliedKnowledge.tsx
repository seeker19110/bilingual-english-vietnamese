// apps/english/src/pages/AppliedKnowledge.tsx — Interactive Applied Knowledge & Simulation Lab
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  TrendingUp,
  Zap,
  Radio,
  Car,
  FlaskConical,
  Activity,
  HeartPulse,
  Dna,
  Calculator,
  Search,
  BookOpen,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import {
  APPLIED_KNOWLEDGE_DATABASE,
  type SchoolLevel,
  type SubjectCategory,
} from '../data/appliedKnowledgeData'
import {
  calculateProfitOptimization,
  calculateCompoundInterest,
  calculateLoanAmortization,
  calculateEvnElectricityBill,
  calculateGpsRelativity,
  calculateBrakingDistance,
  calculateAlcoholDilution,
  calculateTdeeAndMacro,
  predictOffspringBloodTypes,
  COMMON_PH_ITEMS,
  getPhComparison,
  type BloodType,
} from '../lib/simulators'

export default function AppliedKnowledge() {
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState<'simulators' | 'library' | 'explainer' | 'projects'>(
    'simulators',
  )

  // FILTER STATES FOR LIBRARY
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | 'all'>('all')
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'all'>('all')

  // SIMULATOR SELECTION
  const [activeSimulator, setActiveSimulator] = useState<
    | 'profit'
    | 'compound_interest'
    | 'loan'
    | 'evn_electric'
    | 'gps_relativity'
    | 'braking'
    | 'alcohol_dilution'
    | 'ph_scale'
    | 'tdee_macro'
    | 'blood_genetics'
  >('profit')

  // SIMULATOR 1: PROFIT OPTIMIZATION
  const [simFixedCost, setSimFixedCost] = useState(1000000)
  const [simUnitCost, setSimUnitCost] = useState(15000)
  const [simBaseDemand, setSimBaseDemand] = useState(500)
  const [simElasticity, setSimElasticity] = useState(0.005)
  const profitSimResult = calculateProfitOptimization(
    simFixedCost,
    simUnitCost,
    simBaseDemand,
    simElasticity,
    10000,
    150000,
  )

  // SIMULATOR 2: COMPOUND INTEREST
  const [ciInitial, setCiInitial] = useState(10000000)
  const [ciMonthly, setCiMonthly] = useState(3000000)
  const [ciRate, setCiRate] = useState(10)
  const [ciInflation, setCiInflation] = useState(4)
  const [ciYears, setCiYears] = useState(10)
  const compoundSimResult = calculateCompoundInterest(
    ciInitial,
    ciMonthly,
    ciRate,
    ciInflation,
    ciYears,
  )

  // SIMULATOR 3: LOAN AMORTIZATION
  const [loanAmount, setLoanAmount] = useState(1000000000)
  const [loanRate, setLoanRate] = useState(9.5)
  const [loanYears, setLoanYears] = useState(20)
  const loanSimResult = calculateLoanAmortization(loanAmount, loanRate, loanYears)

  // SIMULATOR 4: EVN ELECTRICITY
  const [acHours, setAcHours] = useState(8)
  const [acTemp, setAcTemp] = useState(20)
  const [heaterMins, setHeaterMins] = useState(30)
  const [pcHours, setPcHours] = useState(8)
  const [otherKwh, setOtherKwh] = useState(80)
  const evnSimResult = calculateEvnElectricityBill(acHours, acTemp, heaterMins, pcHours, otherKwh)

  // SIMULATOR 5: GPS RELATIVITY
  const [gpsDays, setGpsDays] = useState(3)
  const gpsSimResult = calculateGpsRelativity(gpsDays)

  // SIMULATOR 6: BRAKING DISTANCE
  const [carSpeed, setCarSpeed] = useState(60)
  const [reactionTime, setReactionTime] = useState(1.0)
  const [roadFriction, setRoadFriction] = useState(0.7)
  const brakingSimResult = calculateBrakingDistance(carSpeed, reactionTime, roadFriction)

  // SIMULATOR 7: ALCOHOL DILUTION
  const [targetAlcoholVol, setTargetAlcoholVol] = useState(500)
  const [initialAlcoholDeg, setInitialAlcoholDeg] = useState(90)
  const alcoholSimResult = calculateAlcoholDilution(targetAlcoholVol, initialAlcoholDeg)

  // SIMULATOR 8: PH SCALE
  const [selectedPh1, setSelectedPh1] = useState(1.5)
  const [selectedPh2, setSelectedPh2] = useState(7.0)
  const phDifferenceRatio = getPhComparison(selectedPh1, selectedPh2)

  // SIMULATOR 9: TDEE & MACRO
  const [userWeight, setUserWeight] = useState(65)
  const [userHeight, setUserHeight] = useState(170)
  const [userAge, setUserAge] = useState(24)
  const [userGender, setUserGender] = useState<'male' | 'female'>('male')
  const [userActivity, setUserActivity] = useState(1.375)
  const [userGoal, setUserGoal] = useState<'fat_loss' | 'maintenance' | 'muscle_gain'>('fat_loss')
  const tdeeSimResult = calculateTdeeAndMacro(
    userWeight,
    userHeight,
    userAge,
    userGender,
    userActivity,
    userGoal,
  )

  // SIMULATOR 10: BLOOD GENETICS
  const [fatherBlood, setFatherBlood] = useState<BloodType>('A')
  const [motherBlood, setMotherBlood] = useState<BloodType>('B')
  const bloodSimResult = predictOffspringBloodTypes(fatherBlood, motherBlood)

  // AI EXPLAINER STATE
  const [explainerQuery, setExplainerQuery] = useState('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)

  const handleAskExplainer = (queryText: string) => {
    const q = queryText.trim()
    if (!q) return
    setExplainerQuery(q)
    setIsExplaining(true)
    setTimeout(() => {
      if (q.toLowerCase().includes('tiền điện') || q.toLowerCase().includes('điều hòa')) {
        setAiAnswer(
          '**Nguyên lý Vật lý ứng dụng:** Điều hòa hoạt động theo chu trình Carnot ngược và bơm nhiệt. Khi bạn cài đặt 18°C, chênh lệch nhiệt độ giữa trong phòng và ngoài trời (~35°C) quá lớn, máy nén Inverter phải chạy 100% công suất liên tục, tiêu tốn khoảng 1.5 - 1.8 kWh mỗi giờ. Nếu bạn cài đặt 26-27°C kèm theo một quạt gió nhỏ, máy nén chỉ cần duy trì công suất thấp (~0.6 - 0.75 kWh), giúp tiết kiệm hơn 40% điện năng mà cảm giác mát vẫn dịu nhẹ, không bị khô da hay sốc nhiệt.',
        )
      } else if (q.toLowerCase().includes('đạo hàm') || q.toLowerCase().includes('ai')) {
        setAiAnswer(
          '**Toán học trong Trí tuệ Nhân tạo:** Đạo hàm và Gradient chính là linh hồn của mạng nơ-ron sâu (Deep Learning). Trong quá trình huấn luyện AI, một hàm mất mát (Loss function) đo lường mức độ sai số giữa câu trả lời của AI và đáp án đúng. Thuật toán Gradient Descent tính đạo hàm riêng của hàm mất mát theo từng trọng số kết nối để biết cần tăng hay giảm trọng số theo hướng nào. Nhờ đạo hàm, ChatGPT có thể tự điều chỉnh hàng trăm tỷ tham số để ngày càng thông minh hơn.',
        )
      } else if (q.toLowerCase().includes('lãi kép') || q.toLowerCase().includes('tiết kiệm')) {
        setAiAnswer(
          '**Toán học trong Tài chính Cá nhân:** Lãi kép bản chất là dãy số cấp số nhân với công thức $A = P(1+r)^n$. Bí quyết không nằm ở số tiền ban đầu $P$, mà nằm ở số mũ thời gian $n$. Một người bắt đầu đầu tư 2 triệu/tháng từ năm 20 tuổi đến 30 tuổi rồi dừng lại (tổng nộp 240 triệu) sẽ có khối tài sản lúc 60 tuổi lớn hơn một người bắt đầu từ năm 30 tuổi và nộp liên tục đến năm 60 tuổi (tổng nộp 720 triệu). Đó là lý do Albert Einstein gọi lãi kép là kỳ quan thứ 8 của thế giới.',
        )
      } else {
        setAiAnswer(
          `**Phân tích liên môn cho câu hỏi "${q}":** Mọi kiến thức phổ thông đều là viên gạch giải quyết bài toán đời sống. Ví dụ: Toán học cung cấp tư duy tối ưu hóa và định lượng rủi ro; Vật lý giải thích cơ chế vận hành năng lượng và chuyển động xung quanh ta; Hóa học bảo vệ sức khỏe và lựa chọn vật liệu tiêu dùng an toàn; Sinh học tối ưu hóa thể trạng và cơ thể sống. Khi kết hợp các môn này, bạn có bộ công cụ đa chiều để ra quyết định thông minh trong công việc và cuộc sống.`,
        )
      }
      setIsExplaining(false)
    }, 400)
  }

  // Filtered knowledge library
  const filteredLibrary = APPLIED_KNOWLEDGE_DATABASE.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel
    const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject
    return matchesSearch && matchesLevel && matchesSubject
  })

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/')} />

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-[calc(2.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Ứng Dụng Thực Tế & Mô Phỏng Đời Sống"
          subtitle="Khám phá vì sao chúng ta học những kiến thức này: Biến công thức SGK thành công cụ giải quyết bài toán thực tế, tài chính, sức khỏe và công nghệ"
        />

        {/* TABS NAVIGATION */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('simulators')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'simulators'
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Phòng Thí Nghiệm Mô Phỏng (10 Simulators)
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'library'
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Kho Tri Thức Ứng Dụng (K12)
          </button>
          <button
            onClick={() => setActiveTab('explainer')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'explainer'
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Giải Đáp Bản Chất Đời Sống
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Dự Án Mini Tự Làm Tại Nhà
          </button>
        </div>

        {/* TAB 1: INTERACTIVE SIMULATORS LAB */}
        {activeTab === 'simulators' && (
          <div className="space-y-6">
            {/* Simulator Picker */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setActiveSimulator('profit')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'profit'
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Toán
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">1. Tối ưu Lợi nhuận</div>
              </button>

              <button
                onClick={() => setActiveSimulator('compound_interest')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'compound_interest'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Calculator className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Tài chính
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">2. Lãi kép & FIRE</div>
              </button>

              <button
                onClick={() => setActiveSimulator('loan')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'loan'
                    ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Vay vốn
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">3. Trả góp Mua nhà</div>
              </button>

              <button
                onClick={() => setActiveSimulator('evn_electric')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'evn_electric'
                    ? 'bg-yellow-950/60 border-yellow-500 text-white shadow-lg shadow-yellow-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono">
                    Vật lý
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">4. Tiền điện EVN</div>
              </button>

              <button
                onClick={() => setActiveSimulator('gps_relativity')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'gps_relativity'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    Vũ trụ
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">5. GPS & Einstein</div>
              </button>

              <button
                onClick={() => setActiveSimulator('braking')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'braking'
                    ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Car className="w-5 h-5 text-red-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">
                    An toàn
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">6. Phanh & Động năng</div>
              </button>

              <button
                onClick={() => setActiveSimulator('alcohol_dilution')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'alcohol_dilution'
                    ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FlaskConical className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    Hóa học
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">7. Pha Cồn 70°</div>
              </button>

              <button
                onClick={() => setActiveSimulator('ph_scale')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'ph_scale'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    Axit-Bazơ
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">8. Thang Đo pH</div>
              </button>

              <button
                onClick={() => setActiveSimulator('tdee_macro')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'tdee_macro'
                    ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <HeartPulse className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                    Dinh dưỡng
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">9. BMR / TDEE Macro</div>
              </button>

              <button
                onClick={() => setActiveSimulator('blood_genetics')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  activeSimulator === 'blood_genetics'
                    ? 'bg-teal-950/60 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Dna className="w-5 h-5 text-teal-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                    Di truyền
                  </span>
                </div>
                <div className="text-xs font-bold mt-2">10. Nhóm Máu Men-đen</div>
              </button>
            </div>

            {/* SIMULATOR 1: PROFIT OPTIMIZATION */}
            {activeSimulator === 'profit' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Mô Phỏng 1: Tối Ưu Hóa Giá Bán Bằng Đạo Hàm Bậc 1 ($P'(x) = 0$)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Toán Giải Tích Lớp 12 & Ứng dụng trong Dynamic Pricing của Grab, Shopee,
                      Airlines
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                    Max Profit
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Controls */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Chi phí cố định mặt bằng & nhân công ($F$):</span>
                        <span className="font-bold text-zinc-200">
                          {(simFixedCost / 1000000).toFixed(1)} Triệu đ / ngày
                        </span>
                      </div>
                      <input
                        type="range"
                        min="200000"
                        max="5000000"
                        step="100000"
                        value={simFixedCost}
                        onChange={(e) => setSimFixedCost(+e.target.value)}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Giá vốn mỗi đơn vị sản phẩm ($c$):</span>
                        <span className="font-bold text-zinc-200">
                          {simUnitCost.toLocaleString()} đ
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="50000"
                        step="1000"
                        value={simUnitCost}
                        onChange={(e) => setSimUnitCost(+e.target.value)}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Lượng khách cơ sở ở giá vốn ($Q_0$):</span>
                        <span className="font-bold text-zinc-200">
                          {simBaseDemand} khách / ngày
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1500"
                        step="50"
                        value={simBaseDemand}
                        onChange={(e) => setSimBaseDemand(+e.target.value)}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Độ nhạy giá của khách hàng (Elasticity $k$):</span>
                        <span className="font-bold text-zinc-200">
                          Mất {(simElasticity * 1000).toFixed(1)} khách / tăng 1k
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.001"
                        max="0.015"
                        step="0.001"
                        value={simElasticity}
                        onChange={(e) => setSimElasticity(+e.target.value)}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Results Display */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Giá bán tối ưu toán học:</div>
                      <div className="text-2xl font-black text-blue-400 mt-1">
                        {profitSimResult.optimalPrice.toLocaleString()} đ / ly
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Dự kiến bán ra:{' '}
                        <span className="font-bold text-zinc-300">
                          {profitSimResult.unitsSold} đơn
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                      <div className="p-2.5 rounded-lg bg-zinc-900">
                        <div className="text-[11px] text-zinc-400">Doanh thu dự kiến:</div>
                        <div className="text-sm font-bold text-zinc-200">
                          {(profitSimResult.totalRevenue / 1000000).toFixed(2)} Tr đ
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                        <div className="text-[11px] text-emerald-400">Lợi nhuận ròng MAX:</div>
                        <div className="text-sm font-bold text-emerald-300">
                          {(profitSimResult.maxProfit / 1000000).toFixed(2)} Tr đ
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 bg-blue-950/30 p-2.5 rounded-lg border border-blue-500/20">
                      💡 <strong>Nguyên lý Đạo hàm:</strong> Lợi nhuận $P(x) = (x - c)(Q_0 - k(x -
                      c)) - F$. Đạo hàm triệt tiêu $P'(x) = 0$ tại chênh lệch giá $x - c = Q_0 /
                      (2k)$.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 2: COMPOUND INTEREST */}
            {activeSimulator === 'compound_interest' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Mô Phỏng 2: Sức Mạnh Lãi Kép Cấp Số Nhân & Kế Hoạch FIRE ($A = P(1+r)^n$)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Toán Đại Số Lớp 11 & Chiến lược Tự Do Tài Chính (FIRE)
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Exponential Growth
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Vốn ban đầu ($P$):</span>
                        <span className="font-bold text-zinc-200">
                          {(ciInitial / 1000000).toFixed(0)} Triệu đ
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000000"
                        step="5000000"
                        value={ciInitial}
                        onChange={(e) => setCiInitial(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Tích lũy định kỳ mỗi tháng ($PMT$):</span>
                        <span className="font-bold text-zinc-200">
                          {(ciMonthly / 1000000).toFixed(1)} Triệu đ / tháng
                        </span>
                      </div>
                      <input
                        type="range"
                        min="500000"
                        max="20000000"
                        step="500000"
                        value={ciMonthly}
                        onChange={(e) => setCiMonthly(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Lãi suất đầu tư hàng năm kỳ vọng ($r$):</span>
                        <span className="font-bold text-zinc-200">{ciRate}% / năm</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="18"
                        step="0.5"
                        value={ciRate}
                        onChange={(e) => setCiRate(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Tỷ lệ lạm phát kỳ vọng/năm ($i$):</span>
                        <span className="font-bold text-zinc-200">{ciInflation}% / năm</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="0.5"
                        value={ciInflation}
                        onChange={(e) => setCiInflation(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Số năm đầu tư ($n$):</span>
                        <span className="font-bold text-zinc-200">{ciYears} năm</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="30"
                        step="1"
                        value={ciYears}
                        onChange={(e) => setCiYears(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Tổng tài sản tích lũy sau {ciYears} năm:
                      </div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        {(compoundSimResult.totalWealth / 1000000).toFixed(1)} Triệu đ
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Giá trị quy đổi sức mua (đã trừ lạm phát {ciInflation}%):{' '}
                        <span className="font-bold text-zinc-300">
                          {(compoundSimResult.realWealth / 1000000).toFixed(1)} Tr đ
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                      <div className="p-2.5 rounded-lg bg-zinc-900">
                        <div className="text-[11px] text-zinc-400">Tiền túi bạn nộp vào:</div>
                        <div className="text-sm font-bold text-zinc-300">
                          {(compoundSimResult.totalContributed / 1000000).toFixed(1)} Tr đ
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                        <div className="text-[11px] text-emerald-400">Tiền lãi kép đẻ ra:</div>
                        <div className="text-sm font-bold text-emerald-300">
                          +{(compoundSimResult.totalInterest / 1000000).toFixed(1)} Tr đ
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                      📈 <strong>Nhận định:</strong> Tiền lãi chiếm{' '}
                      <span className="font-bold text-emerald-300">
                        {(
                          (compoundSimResult.totalInterest / compoundSimResult.totalWealth) *
                          100
                        ).toFixed(0)}
                        %
                      </span>{' '}
                      tổng tài sản của bạn nhờ thời gian $n$ tạo đà số mũ!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 3: LOAN AMORTIZATION */}
            {activeSimulator === 'loan' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Mô Phỏng 3: Trả Góp Khoản Vay Mua Nhà / Xe Theo Dư Nợ Giảm Dần
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Toán Tài Chính & Phương thức tính toán của hệ thống Ngân hàng
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    Loan Amortization
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Số tiền vay ngân hàng:</span>
                        <span className="font-bold text-zinc-200">
                          {(loanAmount / 1000000000).toFixed(2)} Tỷ đồng
                        </span>
                      </div>
                      <input
                        type="range"
                        min="200000000"
                        max="5000000000"
                        step="100000000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(+e.target.value)}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Lãi suất vay ưu đãi/năm:</span>
                        <span className="font-bold text-zinc-200">{loanRate}% / năm</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="16"
                        step="0.25"
                        value={loanRate}
                        onChange={(e) => setLoanRate(+e.target.value)}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Thời hạn vay:</span>
                        <span className="font-bold text-zinc-200">{loanYears} năm</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="30"
                        step="1"
                        value={loanYears}
                        onChange={(e) => setLoanYears(+e.target.value)}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Số tiền phải trả cố định mỗi tháng:
                      </div>
                      <div className="text-2xl font-black text-amber-400 mt-1">
                        {(loanSimResult.monthlyPayment / 1000000).toFixed(2)} Triệu đ / tháng
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Tháng đầu: Gốc {(loanSimResult.firstMonthPrincipal / 1000000).toFixed(2)} Tr
                        + Lãi {(loanSimResult.firstMonthInterest / 1000000).toFixed(2)} Tr
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                      <div className="p-2.5 rounded-lg bg-zinc-900">
                        <div className="text-[11px] text-zinc-400">Tổng tiền trả gốc + lãi:</div>
                        <div className="text-sm font-bold text-zinc-300">
                          {(loanSimResult.totalPayment / 1000000000).toFixed(2)} Tỷ đ
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                        <div className="text-[11px] text-rose-400">Tổng lãi trả cho NH:</div>
                        <div className="text-sm font-bold text-rose-300">
                          {(loanSimResult.totalInterestPaid / 1000000000).toFixed(2)} Tỷ đ
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                      💡 <strong>Kinh nghiệm vay:</strong> Kéo dài thời gian vay làm giảm áp lực trả
                      tháng nhưng tổng tiền lãi trả cho ngân hàng có thể gần bằng số tiền gốc ban
                      đầu!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 4: EVN ELECTRICITY BILL */}
            {activeSimulator === 'evn_electric' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-yellow-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Mô Phỏng 4: Công Suất Điện & Tối Ưu Hóa Đơn EVN 6 Bậc ($A = P \\cdot t$)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Vật Lý Điện Học Lớp 9 & Biểu giá điện bậc thang sinh hoạt EVN
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 font-mono font-bold">
                    6-Tier EVN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Thời gian bật điều hòa:</span>
                        <span className="font-bold text-zinc-200">{acHours} giờ / ngày</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="1"
                        value={acHours}
                        onChange={(e) => setAcHours(+e.target.value)}
                        className="w-full accent-yellow-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Nhiệt độ cài đặt điều hòa:</span>
                        <span
                          className={`font-bold ${
                            acTemp <= 21
                              ? 'text-red-400'
                              : acTemp <= 25
                                ? 'text-yellow-300'
                                : 'text-emerald-400'
                          }`}
                        >
                          {acTemp}°C {acTemp >= 26 ? '(Rất tiết kiệm)' : '(Rất ngốn điện)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="29"
                        step="1"
                        value={acTemp}
                        onChange={(e) => setAcTemp(+e.target.value)}
                        className="w-full accent-yellow-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Thời gian bật bình nóng lạnh:</span>
                        <span className="font-bold text-zinc-200">{heaterMins} phút / ngày</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="10"
                        value={heaterMins}
                        onChange={(e) => setHeaterMins(+e.target.value)}
                        className="w-full accent-yellow-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Sử dụng máy tính / TV:</span>
                        <span className="font-bold text-zinc-200">{pcHours} giờ / ngày</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="16"
                        step="1"
                        value={pcHours}
                        onChange={(e) => setPcHours(+e.target.value)}
                        className="w-full accent-yellow-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Tủ lạnh, đèn & thiết bị khác:</span>
                        <span className="font-bold text-zinc-200">{otherKwh} kWh / tháng</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        step="10"
                        value={otherKwh}
                        onChange={(e) => setOtherKwh(+e.target.value)}
                        className="w-full accent-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Tổng điện năng tiêu thụ:{' '}
                        <span className="font-bold text-yellow-300">
                          {evnSimResult.totalKwh} kWh / tháng
                        </span>
                      </div>
                      <div className="text-2xl font-black text-yellow-400 mt-1">
                        {evnSimResult.totalBill.toLocaleString()} đ / tháng
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        (Đã gồm 8% thuế VAT: {evnSimResult.vat.toLocaleString()} đ)
                      </div>
                    </div>

                    {evnSimResult.acSavingPotentialMoney > 0 && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                        🌿 <strong>Giải pháp tiết kiệm:</strong> Nếu tăng điều hòa lên 26°C kèm
                        quạt, bạn sẽ cắt giảm được{' '}
                        <strong>{evnSimResult.acSavingPotentialKwh} kWh</strong> điện và tiết kiệm{' '}
                        <strong>
                          {evnSimResult.acSavingPotentialMoney.toLocaleString()} đ / tháng
                        </strong>
                        !
                      </div>
                    )}

                    <div className="text-xs text-zinc-400 bg-yellow-950/30 p-2.5 rounded-lg border border-yellow-500/20">
                      ⚡ <strong>Bản chất:</strong> Giá điện tính theo lũy tiến (Bậc 6 lên đến 3.151
                      đ/kWh). Càng dùng nhiều thì các số điện cuối càng phải trả ở mức giá đắt gấp
                      đôi bậc 1!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 5: GPS RELATIVITY */}
            {activeSimulator === 'gps_relativity' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-cyan-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                      <Radio className="w-5 h-5" />
                      Mô Phỏng 5: Thuyết Tương Đối Einstein & Độ Trôi Vị Trí Vệ Tinh GPS
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Vật Lý Hiện Đại Lớp 12 & Công nghệ Định Vị Toàn Cầu
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    Δt = +38.6 μs / ngày
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Số ngày vệ tinh bay không bù trừ hiệu ứng Einstein:</span>
                        <span className="font-bold text-cyan-300">{gpsDays} ngày</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={gpsDays}
                        onChange={(e) => setGpsDays(+e.target.value)}
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    <div className="space-y-2 text-xs text-zinc-400">
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-rose-400 font-bold">
                          • Thuyết tương đối hẹp (Do vận tốc $v = 14.000$ km/h):
                        </span>
                        <div>
                          Làm đồng hồ vệ tinh chạy CHẬM hơn {Math.abs(gpsSimResult.srDilationUs)}{' '}
                          μs.
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-emerald-400 font-bold">
                          • Thuyết tương đối rộng (Do trọng lực yếu ở độ cao 20.000 km):
                        </span>
                        <div>
                          Làm đồng hồ vệ tinh chạy NHANH hơn {gpsSimResult.grDilationUs} μs.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Tổng chênh lệch thời gian đồng hồ:
                      </div>
                      <div className="text-2xl font-black text-cyan-400 mt-1">
                        +{gpsSimResult.netDilationUs} micro-giây
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Tốc độ ánh sáng $c = 300.000$ km/s
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40">
                      <div className="text-xs text-rose-300 font-bold">
                        🚨 Độ sai lệch vị trí trên Google Maps:
                      </div>
                      <div className="text-xl font-extrabold text-rose-400 mt-1">
                        {gpsSimResult.positionDriftKm} km
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Nếu không có công thức Einstein, bạn đặt xe ở Hà Nội nhưng bản đồ sẽ chỉ
                        sang tận Hải Dương hoặc Bắc Ninh!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 6: BRAKING DISTANCE */}
            {activeSimulator === 'braking' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-red-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Mô Phỏng 6: Khoảng Cách Phanh Xe & Động Năng Va Chạm ($E_k = \\frac{1}
                      {2}mv^2$)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Vật Lý Động Học Lớp 10 & Quy tắc an toàn giao thông đường bộ
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                    Stopping Distance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Vận tốc di chuyển của xe ($v$):</span>
                        <span className="font-bold text-zinc-200">{carSpeed} km/h</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="140"
                        step="5"
                        value={carSpeed}
                        onChange={(e) => setCarSpeed(+e.target.value)}
                        className="w-full accent-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Thời gian phản xạ người lái (t_phản_xạ):</span>
                        <span
                          className={`font-bold ${
                            reactionTime <= 0.8
                              ? 'text-emerald-400'
                              : reactionTime <= 1.2
                                ? 'text-yellow-300'
                                : 'text-red-400'
                          }`}
                        >
                          {reactionTime}s{' '}
                          {reactionTime >= 1.5 ? '(Nguy hiểm: dùng ĐT/mệt mỏi)' : '(Tỉnh táo)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={reactionTime}
                        onChange={(e) => setReactionTime(+e.target.value)}
                        className="w-full accent-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Hệ số ma sát mặt đường ($\mu$):</span>
                        <span className="font-bold text-zinc-200">
                          {roadFriction >= 0.7
                            ? 'Đường nhựa khô ráo (0.7 - 0.8)'
                            : roadFriction >= 0.4
                              ? 'Đường mưa ướt (0.4 - 0.5)'
                              : 'Đường trơn trượt (0.3)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="0.85"
                        step="0.05"
                        value={roadFriction}
                        onChange={(e) => setRoadFriction(+e.target.value)}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Tổng khoảng cách dừng xe tối thiểu:
                      </div>
                      <div className="text-3xl font-black text-red-400 mt-1">
                        {brakingSimResult.totalStoppingDistanceM} mét
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        (Quãng đường phản xạ: {brakingSimResult.reactionDistanceM}m + Quãng đường
                        phanh trượt: {brakingSimResult.brakingDistanceM}m)
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                      <div className="text-xs text-zinc-400">
                        Động năng chiếc xe 1.5 tấn cần triệt tiêu:
                      </div>
                      <div className="text-base font-bold text-amber-300">
                        {brakingSimResult.initialKineticEnergyKj.toLocaleString()} kJ
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Vận tốc tăng gấp đôi thì động năng và quãng đường phanh tăng gấp 4 lần
                        ($v^2$)!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 7: ALCOHOL DILUTION */}
            {activeSimulator === 'alcohol_dilution' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-purple-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-purple-400 flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      Mô Phỏng 7: Nồng Độ Dung Dịch & Công Thức Pha Cồn 70° ($C_1 V_1 = C_2 V_2$)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Hóa Học Lớp 8-9 & Quy chuẩn sát khuẩn y tế chuẩn WHO
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                    $C_1 V_1 = C_2 V_2$
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Thể tích cồn 70° mong muốn pha chế:</span>
                        <span className="font-bold text-purple-300">{targetAlcoholVol} ml</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="50"
                        value={targetAlcoholVol}
                        onChange={(e) => setTargetAlcoholVol(+e.target.value)}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Nồng độ cồn nguyên liệu ban đầu:</span>
                        <span className="font-bold text-zinc-200">Cồn {initialAlcoholDeg}°</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {[90, 96].map((deg) => (
                          <button
                            key={deg}
                            onClick={() => setInitialAlcoholDeg(deg)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                              initialAlcoholDeg === deg
                                ? 'bg-purple-600 text-white border-purple-400'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            Cồn {deg}°
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Công thức pha chế chính xác:</div>
                      <div className="text-xl font-bold text-purple-300 mt-2 space-y-1">
                        <div>
                          • Lấy:{' '}
                          <span className="text-white font-black">
                            {alcoholSimResult.initialAlcoholVolumeMl} ml
                          </span>{' '}
                          cồn {initialAlcoholDeg}°
                        </div>
                        <div>
                          • Thêm:{' '}
                          <span className="text-cyan-400 font-black">
                            {alcoholSimResult.waterToAddMl} ml
                          </span>{' '}
                          nước đun sôi để nguội
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs text-zinc-300">
                      🧪 <strong>Vì sao cồn 70° tốt hơn 90°?</strong>{' '}
                      {alcoholSimResult.scientificReason}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 8: PH SCALE */}
            {activeSimulator === 'ph_scale' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-indigo-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-indigo-400 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Mô Phỏng 8: Thang Đo pH & Nồng Độ Ion [H+] = 10^(-pH)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Hóa Học Lớp 11 & Cơ chế trung hòa axit dịch vị dạ dày
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                    Logarithmic Scale
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs text-zinc-400 font-semibold">
                      Chọn Chất A và Chất B để so sánh nồng độ ion axit [H+]:
                    </label>
                    <div className="space-y-1.5">
                      {COMMON_PH_ITEMS.map((item) => (
                        <div
                          key={item.name}
                          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                        >
                          <div className="text-xs font-medium text-zinc-300">{item.name}</div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                item.ph < 4
                                  ? 'bg-red-500/20 text-red-400'
                                  : item.ph < 7
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : item.ph === 7
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-cyan-500/20 text-cyan-300'
                              }`}
                            >
                              pH {item.ph}
                            </span>
                            <button
                              onClick={() => setSelectedPh1(item.ph)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                selectedPh1 === item.ph
                                  ? 'bg-indigo-600 text-white border-indigo-400'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              Chất A
                            </button>
                            <button
                              onClick={() => setSelectedPh2(item.ph)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                selectedPh2 === item.ph
                                  ? 'bg-purple-600 text-white border-purple-400'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              Chất B
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Chênh lệch nồng độ axit giữa Chất A (pH {selectedPh1}) và Chất B (pH{' '}
                        {selectedPh2}):
                      </div>
                      <div className="text-3xl font-black text-indigo-400 mt-2">
                        {phDifferenceRatio.toLocaleString()} lần
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Chênh lệch |{selectedPh1} - {selectedPh2}| ={' '}
                        {Math.abs(selectedPh1 - selectedPh2).toFixed(1)} đơn vị pH tương đương chênh
                        lệch nồng độ ion [H+] gấp 10^
                        {Math.abs(selectedPh1 - selectedPh2).toFixed(1)}.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-zinc-300">
                      💡 <strong>Nguyên lý Logarit:</strong> Vì thang đo pH là hàm logarit cơ số 10
                      (-log[H+]), mỗi bước nhảy 1 đơn vị pH là nồng độ ion axit thay đổi gấp{' '}
                      <strong>10 lần</strong>!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 9: TDEE & MACRO */}
            {activeSimulator === 'tdee_macro' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-rose-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                      <HeartPulse className="w-5 h-5" />
                      Mô Phỏng 9: Chuyển Hóa Năng Lượng Tế Bào BMR/TDEE & Phân Bổ Macro
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Sinh Học Chuyển Hóa Lớp 10 & Khoa học dinh dưỡng giảm mỡ tăng cơ
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                    Mifflin-St Jeor
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400">Cân nặng (kg)</label>
                        <input
                          type="number"
                          value={userWeight}
                          onChange={(e) => setUserWeight(+e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">Chiều cao (cm)</label>
                        <input
                          type="number"
                          value={userHeight}
                          onChange={(e) => setUserHeight(+e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">Độ tuổi</label>
                        <input
                          type="number"
                          value={userAge}
                          onChange={(e) => setUserAge(+e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setUserGender('male')}
                        className={`py-2 rounded-lg text-xs font-bold border ${
                          userGender === 'male'
                            ? 'bg-rose-600 text-white border-rose-400'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        Nam giới
                      </button>
                      <button
                        onClick={() => setUserGender('female')}
                        className={`py-2 rounded-lg text-xs font-bold border ${
                          userGender === 'female'
                            ? 'bg-rose-600 text-white border-rose-400'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        Nữ giới
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400">Mức độ vận động thể lực:</label>
                      <select
                        value={userActivity}
                        onChange={(e) => setUserActivity(+e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200"
                      >
                        <option value={1.2}>Ít vận động (Dân văn phòng / học sinh)</option>
                        <option value={1.375}>Vận động nhẹ (Tập thể thao 1-3 buổi/tuần)</option>
                        <option value={1.55}>Vận động vừa (Tập thể thao 3-5 buổi/tuần)</option>
                        <option value={1.725}>Vận động nhiều (Tập nặng 6-7 buổi/tuần)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400">Mục tiêu thể hình:</label>
                      <div className="grid grid-cols-3 gap-1.5 mt-1">
                        {(['fat_loss', 'maintenance', 'muscle_gain'] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => setUserGoal(g)}
                            className={`py-1.5 rounded-lg text-[11px] font-bold border transition ${
                              userGoal === g
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            {g === 'fat_loss'
                              ? 'Giảm mỡ'
                              : g === 'maintenance'
                                ? 'Giữ cân'
                                : 'Tăng cơ'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Calo mục tiêu mỗi ngày:</div>
                      <div className="text-3xl font-black text-rose-400 mt-1">
                        {tdeeSimResult.targetCalories.toLocaleString()} kcal
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        (BMR chuyển hóa cơ bản: {tdeeSimResult.bmr} kcal | TDEE duy trì:{' '}
                        {tdeeSimResult.tdee} kcal)
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center">
                      <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30">
                        <div className="text-[10px] text-blue-300">Đạm (Protein)</div>
                        <div className="text-sm font-bold text-blue-400">
                          {tdeeSimResult.proteinGrams}g
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                        <div className="text-[10px] text-amber-300">Đường bột (Carb)</div>
                        <div className="text-sm font-bold text-amber-400">
                          {tdeeSimResult.carbGrams}g
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                        <div className="text-[10px] text-rose-300">Chất béo (Fat)</div>
                        <div className="text-sm font-bold text-rose-400">
                          {tdeeSimResult.fatGrams}g
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 10: BLOOD GENETICS */}
            {activeSimulator === 'blood_genetics' && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-teal-500/40 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-teal-400 flex items-center gap-2">
                      <Dna className="w-5 h-5" />
                      Mô Phỏng 10: Di Truyền Học Men-đen & Dự Đoán Nhóm Máu Đời Con
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Sinh Học Di Truyền Lớp 12 & Ứng dụng y học huyết học
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                    $I^A, I^B, I^O$ Alleles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-400">Nhóm máu của Bố:</label>
                      <div className="grid grid-cols-4 gap-2 mt-1">
                        {(['A', 'B', 'AB', 'O'] as BloodType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFatherBlood(type)}
                            className={`py-2 rounded-lg text-xs font-bold border transition ${
                              fatherBlood === type
                                ? 'bg-teal-600 text-white border-teal-400'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            Loại {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400">Nhóm máu của Mẹ:</label>
                      <div className="grid grid-cols-4 gap-2 mt-1">
                        {(['A', 'B', 'AB', 'O'] as BloodType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setMotherBlood(type)}
                            className={`py-2 rounded-lg text-xs font-bold border transition ${
                              motherBlood === type
                                ? 'bg-teal-600 text-white border-teal-400'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            Loại {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Xác suất nhóm máu thế hệ con:</div>
                      <div className="space-y-2 mt-3">
                        {bloodSimResult.map((res) => (
                          <div key={res.bloodType} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span>Nhóm máu {res.bloodType}</span>
                              <span className="text-teal-400">{res.percentage}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-teal-500 transition-all duration-500"
                                style={{ width: `${res.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 bg-teal-950/30 p-2.5 rounded-lg border border-teal-500/20">
                      🧬 <strong>Quy luật Men-đen:</strong> $I^A$ và $I^B$ là các allele đồng trội,
                      còn $I^O$ là allele lặn. Người nhóm máu O bắt buộc phải nhận 2 allele $I^O$ từ
                      cả bố và mẹ!
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLIED KNOWLEDGE LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm theo chủ đề, từ khóa đời sống (tiền điện, lãi kép, GPS, cồn 70, AI, giảm cân)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm placeholder-zinc-500 focus:outline-none focus:border-accent-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLevel('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedLevel === 'all'
                      ? 'bg-accent-500 text-white'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  Tất cả cấp học
                </button>
                <button
                  onClick={() => setSelectedLevel('secondary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedLevel === 'secondary'
                      ? 'bg-accent-500 text-white'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  Cấp 2 (THCS)
                </button>
                <button
                  onClick={() => setSelectedLevel('high_school')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedLevel === 'high_school'
                      ? 'bg-accent-500 text-white'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  Cấp 3 (THPT)
                </button>
              </div>

              {/* Subject pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/60 items-center">
                <span className="text-xs text-zinc-500 mr-1">Môn học:</span>
                {[
                  { id: 'all', label: 'Tất cả môn' },
                  { id: 'math', label: 'Toán học' },
                  { id: 'physics', label: 'Vật lý' },
                  { id: 'chemistry', label: 'Hóa học' },
                  { id: 'biology', label: 'Sinh học' },
                  { id: 'informatics', label: 'Tin học & AI' },
                  { id: 'economics_law', label: 'Kinh tế & Pháp luật' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s.id as SubjectCategory | 'all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      selectedSubject === s.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Knowledge Cards */}
            <div className="space-y-4">
              {filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-accent-500/20 text-accent-400 font-mono">
                          {item.gradeLabel}
                        </span>
                        <span className="text-xs text-zinc-400">• {item.topic}</span>
                      </div>
                      <h4 className="text-base font-bold text-zinc-100">{item.title}</h4>
                    </div>
                  </div>

                  {/* 4-Layer Framework */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                      <div className="text-amber-400 font-bold flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4" /> Bản chất đời sống:
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{item.intuitivePrinciple}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                      <div className="text-blue-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Bài toán giải quyết:
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{item.realWorldProblem}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-300">
                        Ứng dụng công nghiệp & Nghề nghiệp:{' '}
                      </span>
                      <span className="text-zinc-300">{item.industryCareerApp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI EXPLAINER */}
        {activeTab === 'explainer' && (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent-500/20 text-accent-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">Trợ Lý AI Giải Đáp Bản Chất Đời Sống</h3>
                <p className="text-xs text-zinc-400">
                  Đặt bất kỳ câu hỏi nào về tính ứng dụng của kiến thức vào cuộc sống
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: 'Tại sao bật điều hòa 27 độ lại tiết kiệm tiền?', 'Đạo hàm dùng ở đâu trong AI?'..."
                value={explainerQuery}
                onChange={(e) => setExplainerQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskExplainer(explainerQuery)}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-accent-500"
              />
              <button
                onClick={() => handleAskExplainer(explainerQuery)}
                disabled={isExplaining || !explainerQuery.trim()}
                className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-sm transition"
              >
                {isExplaining ? 'Đang suy nghĩ...' : 'Hỏi AI'}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500 self-center">Gợi ý câu hỏi:</span>
              {[
                'Bật điều hòa 27 độ tiết kiệm tiền thế nào?',
                'Đạo hàm ứng dụng trong AI ra sao?',
                'Lãi kép 10 năm tạo ra bao nhiêu tiền?',
                'Vì sao cồn 70 độ diệt khuẩn tốt hơn 90 độ?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskExplainer(prompt)}
                  className="px-3 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* AI Answer Box */}
            {aiAnswer && (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-accent-500/40 text-sm space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-accent-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Phân tích chuyên sâu từ Đồng Hành AI
                </div>
                <div className="text-zinc-200 leading-relaxed whitespace-pre-line">{aiAnswer}</div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CAPSTONE MINI PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Thư Viện Thử Thách & Dự Án Tự Làm Tại Nhà (Hands-on Mini Projects)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Các dự án thực chiến 15–30 phút giúp học sinh và gia đình ứng dụng lý thuyết vào
                thực tế
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {APPLIED_KNOWLEDGE_DATABASE.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        ⏱️ {item.miniProject.duration}
                      </span>
                      <span className="text-xs text-zinc-500">{item.gradeLabel}</span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100">{item.miniProject.title}</h4>
                    <div className="space-y-1.5 pt-1">
                      {item.miniProject.steps.map((step, idx) => (
                        <div key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-amber-300/90 font-medium">
                    🎯 <strong>Sản phẩm bàn giao:</strong> {item.miniProject.deliverable}
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
