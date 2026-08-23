// apps/dhcb/src/components/ReferralVip/ReferralVipBanner.tsx — Banner mời bạn nhận VIP nổi bật.
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import ReferralVipModal from './ReferralVipModal.js'

export default function ReferralVipBanner() {
  const [isOpenModal, setIsOpenModal] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-950/80 p-4 sm:p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-amber-500/60 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Chương Trình VIP Bạn Bè
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  Tặng 7 Ngày VIP Miễn Phí
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Mời Bạn Cùng Học — Cả Hai Cùng Nhận VIP Toàn Năng
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                Tặng bạn bè 7 ngày VIP trải nghiệm toàn bộ Gia sư AI, Đấu trường PvP. Bạn nhận thêm
                +7 đến +30 ngày VIP tích lũy!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpenModal(true)}
            className="tap-44 w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Lấy Mã Mời VIP</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpenModal && <ReferralVipModal onClose={() => setIsOpenModal(false)} />}
    </>
  )
}
