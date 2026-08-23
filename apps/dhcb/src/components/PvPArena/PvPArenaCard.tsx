// apps/dhcb/src/components/PvPArena/PvPArenaCard.tsx — Thẻ hiển thị Đấu Trường 1v1 PvP.
import { useState } from 'react'
import { Swords } from 'lucide-react'
import PvPArenaLobbyModal from './PvPArenaLobbyModal.js'

export default function PvPArenaCard() {
  const [isOpenModal, setIsOpenModal] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-zinc-950/70 to-orange-950/30 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-amber-500/60 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wide uppercase">
                  PvP 1v1 Live Arena
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  Elo Rating & Ghost Matchmaking
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                Đấu Trường Đối Kháng 1v1 (Speed Vocab & Grammar Clash)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-0.5 leading-relaxed">
                Thi đấu phản xạ từ vựng 5s, bắt lỗi ngữ pháp cấp tốc, tích lũy điểm Rank Elo và leo
                Top Bảng xếp hạng tuần.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpenModal(true)}
            className="tap-44 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <Swords className="w-4 h-4" />
            <span>Vào Đấu Trường</span>
          </button>
        </div>
      </div>

      {isOpenModal && <PvPArenaLobbyModal onClose={() => setIsOpenModal(false)} />}
    </>
  )
}
