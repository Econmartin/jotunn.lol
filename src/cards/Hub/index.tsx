import { Link } from "react-router-dom";
import { GlassCard } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";

export function Hub() {
  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <Link
        to="/hub"
        className="relative z-[1] h-full flex flex-col items-center justify-center gap-3 no-underline"
        style={{ textDecoration: "none" }}
      >
        <div className="text-3xl">📡</div>
        <div>
          <div className="text-xs font-black tracking-[.2em] uppercase text-center" style={{ color: "#FF6600" }}>
            JOTUNN
            <span
              className="ml-1 px-1 rounded"
              style={{ background: "#FF6600", color: "#fff" }}
            >
              HUB
            </span>
          </div>
          <div className="text-[10px] text-center mt-1" style={{ color: "rgba(255,102,0,0.45)" }}>
            Unlock exclusive streams · 100 EVE
          </div>
        </div>
        <div
          className="text-[10px] font-bold tracking-wider px-3 py-1 rounded border"
          style={{ borderColor: "#FF660055", color: "#FF6600" }}
        >
          ▶ ENTER
        </div>
      </Link>
    </GlassCard>
  );
}
