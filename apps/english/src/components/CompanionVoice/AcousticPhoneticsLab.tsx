import { useState } from 'react'
import { Activity, Mic, RefreshCw } from 'lucide-react'
import { useToast } from '@core/ToastProvider'
import type { AcousticPhoneticsReport } from '../../../../../packages/core-contracts/realtimeMultimodal'

export default function AcousticPhoneticsLab() {
  const [targetSentence, setTargetSentence] = useState('Think outside the box')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<AcousticPhoneticsReport | null>(null)
  const toast = useToast()

  const runAcousticAnalysis = async (sentence: string, spoken?: string) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/acoustic-phonetics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || 'dev_token'}`,
        },
        body: JSON.stringify({
          targetSentence: sentence,
          spokenTranscript: spoken || sentence,
          pcmAudioLengthMs: 2400,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as AcousticPhoneticsReport
        setReport(data)
        toast.success('Đã hoàn tất phân tích âm học GOP chi tiết!')
      } else {
        toast.error('Lỗi khi gửi dữ liệu phân tích âm học.')
      }
    } catch {
      toast.error('Không thể kết nối API phân tích âm học.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900/90 to-zinc-950 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-indigo-800/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-100">Acoustic Phonetics &amp; GOP Lab</h3>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                Phoneme Engine V4
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Chẩn đoán âm học cấp độ âm vị, formant &amp; độ lệch cao độ F0
            </p>
          </div>
        </div>

        <button
          onClick={() => runAcousticAnalysis(targetSentence)}
          disabled={isAnalyzing}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Đang đo...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" /> Đo Âm Vị
            </>
          )}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Câu mẫu luyện tập */}
        <div className="flex flex-wrap gap-2">
          {[
            'Think outside the box',
            'Three thousand feathers',
            'She sells seashells',
            'Red leather yellow leather',
          ].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setTargetSentence(sample)
                runAcousticAnalysis(sample)
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                targetSentence === sample
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                  : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {sample}
            </button>
          ))}
        </div>

        {report && (
          <div className="space-y-4 animate-fadeIn">
            {/* Điểm tổng quan */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">Điểm GOP Tổng</div>
                <div className="mt-1 text-lg font-bold text-emerald-400">
                  {report.overallGopScore} / 100
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">Độ trôi chảy</div>
                <div className="mt-1 text-lg font-bold text-cyan-400">{report.fluencyScore} %</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">Tốc độ (WPM)</div>
                <div className="mt-1 text-lg font-bold text-indigo-400">
                  {report.speechRateWpm} wpm
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">Ngữ điệu Prosody</div>
                <div className="mt-1 text-lg font-bold text-purple-400">
                  {report.prosodyScore} %
                </div>
              </div>
            </div>

            {/* Danh sách âm vị chi tiết */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
              <div className="text-xs font-semibold text-zinc-300 mb-2">
                Phân tích Độ chính xác Âm vị (Phoneme Breakdown)
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {report.phonemes.map((ph, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-2.5 ${
                      ph.gopScore >= 80
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                        : ph.gopScore >= 60
                          ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                          : 'border-red-500/30 bg-red-950/20 text-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm">{ph.targetIpa}</span>
                      <span className="text-xs font-bold">{ph.gopScore}%</span>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-400">
                      Thời lượng: {ph.durationMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mẹo điều chỉnh cơ miệng */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs text-indigo-200">
              <span className="font-semibold text-indigo-300">💡 Mẹo điều chỉnh: </span>
              {report.correctiveDrillRecommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
