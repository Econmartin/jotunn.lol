import { Link } from "react-router-dom";
import { GlassCard } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";

export function Slot() {
  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <Link
        to="/slots"
        className="relative z-[1] h-full flex flex-col items-center justify-center gap-3 no-underline"
        style={{ textDecoration: "none" }}
      >
        <div className="text-3xl">🎰</div>
        <div>
          <div className="text-xs font-black tracking-[.2em] uppercase text-center" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
            SLOTTY JÖTUNN
          </div>
          <div className="text-[10px] text-center mt-1" style={{ color: `hsla(${MARTIAN_H},40%,55%,0.45)` }}>
            Provably fair · Real EVE · On-chain
          </div>
        </div>
        <div
          className="text-[10px] font-bold tracking-wider px-3 py-1 rounded border"
          style={{ borderColor: `hsla(${MARTIAN_H},60%,50%,0.35)`, color: `hsla(${MARTIAN_H},80%,65%,0.8)` }}
        >
          ▶ PLAY
        </div>
      </Link>
    </GlassCard>
  );
}
