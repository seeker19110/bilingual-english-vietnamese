import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Target,
  BookMarked,
  MessageCircle,
  Mic,
  PenLine,
  Headphones,
  Flame,
  Brain,
  Award,
  Volume2,
  Sparkles,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { useLang } from '../context/useLang'

type IconType = typeof BookOpen

interface Feature {
  icon: IconType
  titleVi: string
  titleEn: string
  descVi: string
  descEn: string
}

// Tính năng chính — mô tả ngắn gọn lại từ getModes() (Home.tsx) và mục 1 CLAUDE.md, dùng
// riêng cho trang giới thiệu nên viết tay (không import từ Home.tsx vì đó là hàm nội bộ
// trang, không export).
const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    titleVi: 'Từ điển 10.000+ từ',
    titleEn: '10,000+ word dictionary',
    descVi: 'Tra nhanh loại từ, nghĩa tiếng Việt, ví dụ minh họa có phát âm.',
    descEn: 'Look up part of speech, meaning, and example sentences with audio.',
  },
  {
    icon: Target,
    titleVi: 'Học theo lộ trình CEFR A1–C2',
    titleEn: 'CEFR A1–C2 learning path',
    descVi: 'Mỗi ngày 5–20 từ mới (tự chọn tốc độ) theo vòng tròn chủ đề liên quan.',
    descEn: 'Learn 5–20 new words a day (pick your pace) in related topic circles.',
  },
  {
    icon: BookMarked,
    titleVi: 'Nghe – Đọc – Kể Truyện',
    titleEn: 'Listen – Read – Tell Stories',
    descVi: 'Cổ tích, ngụ ngôn, truyện dân gian Việt Nam — giọng đọc chuẩn, song ngữ.',
    descEn: 'Fairy tales, fables, Vietnamese folk stories — native voices, bilingual text.',
  },
  {
    icon: MessageCircle,
    titleVi: 'Chat với gia sư AI',
    titleEn: 'Chat with an AI tutor',
    descVi: 'Trò chuyện theo tình huống, sửa lỗi và giải thích ngay bằng tiếng mẹ đẻ.',
    descEn: 'Situational conversation — errors corrected and explained in your native tongue.',
  },
  {
    icon: Mic,
    titleVi: 'Luyện nói song ngữ',
    titleEn: 'Bilingual speaking practice',
    descVi: 'Nói → AI nghe → trả lời bằng giọng ngôn ngữ đích → sửa lỗi bằng giọng tiếng mẹ đẻ.',
    descEn: 'Speak → AI listens → replies in the target voice → corrects in your native voice.',
  },
  {
    icon: PenLine,
    titleVi: 'Luyện viết & chấm điểm',
    titleEn: 'Writing practice & scoring',
    descVi: 'Nộp bài, AI chấm kiểu IELTS, chỉ lỗi cụ thể và ước lượng band điểm.',
    descEn: 'Submit an essay, get IELTS-style scoring, specific corrections and a band estimate.',
  },
  {
    icon: Headphones,
    titleVi: 'Luyện nghe theo cấp',
    titleEn: 'Level-based listening practice',
    descVi: 'Trắc nghiệm và gõ lại câu nghe được, độ khó tăng dần theo cấp CEFR.',
    descEn: 'Multiple choice and dictation, difficulty increasing with your CEFR level.',
  },
  {
    icon: Flame,
    titleVi: 'Streak & huy hiệu',
    titleEn: 'Streaks & achievements',
    descVi: 'Giữ chuỗi ngày học liên tiếp, mở khóa huy hiệu khi đạt mốc.',
    descEn: 'Keep a daily streak going and unlock achievements at milestones.',
  },
] as const

interface Tip {
  titleVi: string
  titleEn: string
  bodyVi: string
  bodyEn: string
}

const TIPS: Tip[] = [
  {
    titleVi: 'Học đều đặn, dù chỉ ít mỗi ngày',
    titleEn: 'Study a little every day',
    bodyVi:
      'Ghi nhớ ngôn ngữ hiệu quả hơn nhiều khi lặp lại đều đặn thay vì học dồn 1 buổi rồi nghỉ dài. Streak ở trang chủ giúp bạn theo dõi và duy trì thói quen này.',
    bodyEn:
      'Language sticks much better with steady repetition than one long cram session followed by a long break. The streak on the home page helps you track and keep this habit.',
  },
  {
    titleVi: 'Để hệ thống nhắc bạn ôn đúng lúc sắp quên',
    titleEn: 'Let the system remind you before you forget',
    bodyVi:
      'Mục "Ôn SRS" ở mỗi cấp lộ trình tự tính thời điểm ôn tối ưu cho từng từ theo nguyên lý lặp lại ngắt quãng (spaced repetition) — ôn đúng lúc thay vì ôn tràn lan.',
    bodyEn:
      'The "SRS review" tab in each level calculates the best time to review each word using spaced repetition — reviewing right before you\'d forget, not all at once.',
  },
  {
    titleVi: 'Nghe trước, nói sau',
    titleEn: 'Listen first, speak second',
    bodyVi:
      'Làm quen ngữ điệu và cách phát âm tự nhiên qua mục Nghe/Truyện trước khi luyện nói — bạn sẽ bắt chước đúng hơn thay vì đoán mò cách đọc.',
    bodyEn:
      "Get used to natural rhythm and pronunciation through Listening/Stories before speaking practice — you'll imitate more accurately instead of guessing.",
  },
  {
    titleVi: 'Nói ra thành tiếng, đừng chỉ đọc thầm',
    titleEn: "Speak out loud, don't just read silently",
    bodyVi:
      'Luyện nói song ngữ chỉ hiệu quả khi bạn thực sự phát âm — não bộ và cơ miệng cần luyện phản xạ thật, không thể thay thế bằng đọc mắt.',
    bodyEn:
      'Speaking practice only works if you actually vocalize — your brain and mouth need real reflex training that reading silently cannot replace.',
  },
  {
    titleVi: 'Chọn tốc độ học vừa sức',
    titleEn: 'Pick a pace that fits you',
    bodyVi:
      'Vào Hồ sơ để chọn 5/10/20 từ mới/ngày. Học ít mà nhớ chắc luôn tốt hơn học nhiều mà quên nhanh — đổi tốc độ bất cứ lúc nào, không ảnh hưởng từ đã học.',
    bodyEn:
      "Go to Profile to pick 5/10/20 new words/day. Learning fewer words solidly beats cramming many and forgetting fast — change pace anytime, it won't affect words already learned.",
  },
  {
    titleVi: 'Làm bài kiểm tra cuối mỗi cấp',
    titleEn: 'Take the test at the end of each level',
    bodyVi:
      'Trước khi lên cấp CEFR tiếp theo, hãy làm bài kiểm tra để chắc chắn kiến thức đã vững — tránh học chồng lỗ hổng.',
    bodyEn:
      'Before moving to the next CEFR level, take the test to confirm your knowledge is solid — this avoids building on gaps.',
  },
] as const

export default function About() {
  const { lang } = useLang()
  const isA = lang === 'vi'
  const nav = useNavigate()

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title={isA ? 'Giới thiệu Gia sư AI' : 'About AI Tutor'}
          subtitle={
            isA
              ? 'Gia sư ngôn ngữ AI hai chiều Việt ⇄ Anh — học mọi lúc, giá rẻ, sát đời sống.'
              : 'A two-way Vietnamese ⇄ English AI tutor — learn anytime, affordable, close to real life.'
          }
        />

        {/* Điểm khác biệt */}
        <section className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
            <p className="text-sm text-zinc-300">
              <strong className="text-white">
                {isA ? 'Điểm khác biệt: ' : "What's different: "}
              </strong>
              {isA ? (
                <>
                  AI không chỉ sửa lỗi bằng chữ — mà còn{' '}
                  <strong className="text-white">
                    đọc to lời giải thích bằng giọng tiếng mẹ đẻ của bạn
                  </strong>
                  , trong khi hội thoại chính vẫn bằng giọng chuẩn của ngôn ngữ bạn đang học. Nội
                  dung sát với đời sống Việt Nam, giá rẻ.
                </>
              ) : (
                <>
                  The AI doesn't just correct mistakes in text — it also{' '}
                  <strong className="text-white">
                    reads the explanation aloud in your native voice
                  </strong>
                  , while the main conversation stays in the target language's native voice. Content
                  stays close to real Vietnamese life, at a low cost.
                </>
              )}
            </p>
          </div>
        </section>

        {/* Tính năng chính */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-3">
            {isA ? 'Tính năng chính' : 'Key features'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.titleVi}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-accent-400" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{isA ? f.titleVi : f.titleEn}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{isA ? f.descVi : f.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Học sao cho hiệu quả */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-400" aria-hidden="true" />
            {isA ? 'Học sao cho hiệu quả' : 'Tips for effective learning'}
          </h2>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <div
                key={tip.titleVi}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4"
              >
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-500/15 text-accent-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {isA ? tip.titleVi : tip.titleEn}
                </p>
                <p className="text-xs text-zinc-400 mt-1.5 pl-7">{isA ? tip.bodyVi : tip.bodyEn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ghi nhận huy hiệu — nối sang trang Nhiệm vụ để biết thêm cách kiếm thưởng.
            Nội dung cụ thể hoá thứ tự ưu tiên (streak + challenge trước) vì đó là 2 việc
            tốn ít thời gian nhất/ngày nhưng cộng dồn huy hiệu nhanh nhất — xem đối chiếu
            với data/achievements.ts. */}
        <section className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-amber-300" aria-hidden="true" />
          </div>
          <div className="text-xs text-zinc-400">
            <p>
              {isA
                ? 'Càng học đều, càng kiếm được nhiều huy hiệu và ngày dùng gói Pro/VIP miễn phí — xem chi tiết ở mục Nhiệm vụ trong Hồ sơ.'
                : 'The more consistently you study, the more achievements and free Pro/VIP days you earn — see the Quests section in your Profile.'}
            </p>
            <p className="mt-1.5">
              {isA ? (
                <>
                  <strong className="text-zinc-300">Nhanh nhất:</strong> giữ streak học mỗi ngày +
                  làm challenge 1 phút đều đặn — 2 việc tốn ít thời gian nhất nhưng lên huy hiệu
                  nhanh nhất. Từ vựng và các cấp CEFR tự cộng dồn theo lộ trình học bình thường.
                </>
              ) : (
                <>
                  <strong className="text-zinc-300">Fastest path:</strong> keep a daily streak + do
                  the 1-minute challenge every day — the two lowest-effort habits that unlock
                  achievements the quickest. Vocabulary and CEFR levels build up naturally as you
                  study.
                </>
              )}
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={() => nav('/')}
          className="tap-44 w-full flex items-center justify-center gap-2 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold py-3.5 transition active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          {isA ? 'Bắt đầu học ngay' : 'Start learning now'}
        </button>
      </main>
    </div>
  )
}
