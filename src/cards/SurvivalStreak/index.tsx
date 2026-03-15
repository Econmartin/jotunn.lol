/**
 * @card SurvivalStreak
 * @description Time survived since last on-chain death, plus K/D breakdown.
 *   Uses skull-crack SVG with a looping fill animation.
 *   Collapsed: skull + streak timer + K/D counts.
 *   Expanded:  kill/death breakdown by type (SHIP vs STRUCTURE).
 *
 * @dataflow
 *   useKillmails() → filter killer_id / victim_id === Jotunn → SurvivalStreak
 */

import { useState, useEffect, useContext, useId } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { useKillmails } from "./hook";
import { useCharacterCreated } from "../../hooks/useCharacterCreated";
import type { Killmail } from "../../hooks/useKillmails";
import { MARTIAN_H } from "../../lib/constants";

// Skull crack path (from skull-crack-svgrepo-com.svg, viewBox 0 0 512 512)
const SKULL_PATH =
  "M226.063 24.188L222 58.718l32.688 25.626 23.75-50.03c-18.145-9.142-35.272-9.715-52.375-10.127z" +
  "M166.75 61.093c-24.248 2.93-42.95 15.897-58.875 33.812h.03l96.407 62.594-37.562-96.406z" +
  "M300.875 88.75l18.656 85.5-91.092-23.875L269 233.938l-140.594-89.375c-3.966 4.875-7.7 9.97-11.22 15.28" +
  "-28.794 43.465-42.052 101.104-42.905 156.72 40.122 19.627 63.843 40.14 74.032 61.562" +
  " 9.157 19.25 5.475 39.06-6.343 54.25 25.214 23.382 68.638 37.63 113.155 38.344" +
  " 44.813.717 89.973-12.083 118.625-38.783-6.033-6.937-10.412-14.346-12.5-22.437" +
  "-2.8-10.85-.952-22.554 5.188-33.28 11.757-20.542 37.646-39.263 80.062-59.69" +
  "-.88-52.663-13.855-110.235-42.5-154.405-23.4-36.085-56.548-63.412-103.125-73.375z" +
  "m-119.28 168.844c27.75 0 50.25 22.5 50.25 50.25s-22.5 50.25-50.25 50.25" +
  "c-27.752 0-50.25-22.5-50.25-50.25s22.498-50.25 50.25-50.25z" +
  "m149.468 0c27.75 0 50.25 22.5 50.25 50.25s-22.5 50.25-50.25 50.25" +
  "-50.25-22.5-50.25-50.25 22.5-50.25 50.25-50.25z" +
  "m-74.75 86.125c13.74 29.005 24.652 58.023 30.062 87.03" +
  "-14.777 12.895-41.26 14.766-60.125 0 7.315-29.007 16.12-58.025 30.063-87.03z";

function SkullCrack({ size = 56, color }: { size?: number; color: string }) {
  const rawId = useId();
  const uid = `sk${rawId.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <>
      <style>{`
        @keyframes skull-fill-${uid} {
          0%   { transform: translateY(100%); }
          10%  { transform: translateY(100%); }
          65%  { transform: translateY(0%);   }
          85%  { transform: translateY(0%);   }
          100% { transform: translateY(100%); }
        }
      `}</style>
      <svg
        viewBox="0 0 512 512"
        width={size} height={size}
        className="block flex-shrink-0 overflow-visible"
      >
        <defs>
          <mask id={`${uid}-m`}>
            <rect width="512" height="512" fill="black" />
            <path d={SKULL_PATH} fill="white" />
          </mask>
        </defs>
        {/* Dim skull shape — martian stroke when not overridden by state color */}
        <path d={SKULL_PATH} fill="rgba(255,255,255,0.04)" stroke="rgba(255,97,10,0.35)" strokeWidth="6" />
        {/* Animated fill — rises bottom-to-top, loops */}
        <g mask={`url(#${uid}-m)`}>
          <rect
            x="0" y="0" width="512" height="512"
            fill={color}
            style={{
              animation: `skull-fill-${uid} 3s ease-in-out infinite`,
              transformBox: "fill-box" as React.CSSProperties["transformBox"],
            }}
          />
          {/* Shimmer line at fill surface */}
          <rect
            x="0" y="-4" width="512" height="8"
            fill="rgba(255,193,120,0.5)"
            style={{
              animation: `skull-fill-${uid} 3s ease-in-out infinite`,
              transformBox: "fill-box" as React.CSSProperties["transformBox"],
            }}
          />
        </g>
      </svg>
    </>
  );
}

function useLiveTimer(sinceMs: number | null): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (sinceMs === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sinceMs]);
  if (sinceMs === null) return "—";
  const elapsed = Math.max(0, now - sinceMs);
  const d = Math.floor(elapsed / 86_400_000);
  const h = Math.floor(elapsed / 3_600_000) % 24;
  const m = Math.floor(elapsed / 60_000) % 60;
  const s = Math.floor(elapsed / 1_000) % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function KDBar({ kills, deaths }: { kills: number; deaths: number }) {
  const total = kills + deaths;
  const killPct = total === 0 ? 50 : (kills / total) * 100;
  return (
    <div className="flex h-1 rounded-sm overflow-hidden bg-white/[0.06]">
      <div style={{ width: `${killPct}%` }} className="bg-green-400/60 transition-[width] duration-[600ms] ease-out" />
      <div className="flex-1 bg-red-400/50" />
    </div>
  );
}

function TypeBreakdown({ label, items, accentColor }: { label: string; items: Killmail[]; accentColor: string }) {
  const ships   = items.filter((k) => k.lossType === "SHIP").length;
  const structs = items.filter((k) => k.lossType === "STRUCTURE").length;
  return (
    <div className="px-[10px] py-2 rounded-[6px] bg-black/20 border border-white/[0.07]">
      <div className="text-xs tracking-widest uppercase mb-1.5" style={{ color: accentColor }}>{label}</div>
      <div className="flex gap-3">
        {[{ icon: "🚀", label: "Ships",      count: ships  },
          { icon: "🏗️", label: "Structures", count: structs }].map(({ icon, label: l, count }) => (
          <div key={l} className="flex-1 text-center">
            <div className="text-base">{icon}</div>
            <div className="text-xl font-extrabold font-mono" style={{ color: accentColor }}>{count}</div>
            <div className="text-xs text-white/35">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SurvivalStreak() {
  const { data, isLoading } = useKillmails();
  const createdAt  = useCharacterCreated();
  const isExpanded = useContext(CardExpandedContext);

  const kills  = data?.kills  ?? [];
  const deaths = data?.deaths ?? [];

  // Timer baseline: last death → character creation date → null (loading)
  const lastDeathMs = deaths.length
    ? Math.max(...deaths.map((d) => d.killTimestamp)) * 1000
    : null;
  const timerBase  = lastDeathMs ?? createdAt;
  const timerNote  = deaths.length > 0 ? "since last death" : "since character birth";

  const streakColor  = deaths.length > 0 ? "#f87171" : "#4ade80";
  const skullColor   = deaths.length > 0 ? "rgba(248,113,113,0.6)" : "rgba(74,222,128,0.4)";
  const streakLabel  = useLiveTimer(timerBase);

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-row gap-5">

        {/* ── Left: all content in a compact single row ─────── */}
        <div
          className="flex items-center gap-4"
          style={{ flex: isExpanded ? "0 0 auto" : "1 1 0%" }}
        >
          <SkullCrack size={44} color={skullColor} />

          <div className="flex flex-col gap-1 min-w-0">
            <div className="text-[9px] tracking-widest uppercase text-white/25">Survival Streak</div>
            <div
              className="text-2xl font-extrabold leading-none font-mono"
              style={{ color: streakColor, textShadow: `0 0 16px ${streakColor}55` }}
            >
              {isLoading ? "…" : streakLabel}
            </div>
            <div className="text-[9px] text-white/30">{timerNote}</div>
          </div>

          {/* K/D pills + bar */}
          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex gap-1.5">
              {[
                { label: "K", value: kills.length,  color: "#4ade80" },
                { label: "D", value: deaths.length, color: "#f87171" },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-2 py-0.5 rounded-[4px] text-center bg-white/[0.03] border border-white/[0.06] min-w-[36px]">
                  <div className="text-sm font-extrabold font-mono leading-none" style={{ color }}>{value}</div>
                  <div className="text-[8px] text-white/30 mt-px">{label}</div>
                </div>
              ))}
            </div>
            <KDBar kills={kills.length} deaths={deaths.length} />
          </div>
        </div>

        {/* ── Right: breakdown (expanded only) ─────────────── */}
        {isExpanded && (
          <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-5 flex flex-col gap-2.5 justify-center">
            <div className="text-xs tracking-widest uppercase text-white/25 mb-0.5">
              On-chain breakdown
            </div>

            <TypeBreakdown label="Kills (as killer)"  items={kills}  accentColor="#4ade80" />
            <TypeBreakdown label="Deaths (as victim)" items={deaths} accentColor="#f87171" />

            {deaths.length === 0 && kills.length === 0 && (
              <div className="text-xs text-white/30 italic text-center mt-2">
                No on-chain kill records yet.<br />The void is watching.
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
