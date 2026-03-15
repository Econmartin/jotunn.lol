/**
 * @card VersionBump
 * @description Watches the character's on-chain version number for changes.
 *   Collapsed: version number + "stable" / "updated!" badge.
 *   Expanded:  version history with timestamps.
 *
 * @dataflow
 *   useCharacter() → version → localStorage diff → VersionBump
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { useVersionBump } from "./hook";
import { cn } from "../../lib/utils";
import { MARTIAN_H } from "../../lib/constants";
import { SvgIcon } from "../../components/SvgIcon";

function timeAgo(ms: number): string {
  const elapsed = Date.now() - ms;
  const m = Math.floor(elapsed / 60_000);
  const h = Math.floor(elapsed / 3_600_000);
  const d = Math.floor(elapsed / 86_400_000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

export function VersionBump() {
  const { currentVersion, previousVersion, bumped, history, totalBumps } = useVersionBump();
  const isExpanded = useContext(CardExpandedContext);

  const accentColor = bumped ? "#ffb16d" : "#82220c";

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-row gap-5">

        {/* ── Left: version display ─────────────────────────── */}
        <div
          className="flex flex-col justify-center gap-1.5"
          style={{ flex: isExpanded ? "0 0 100px" : "1 1 0%" }}
        >
          <div className="flex items-center gap-2">
            <SvgIcon src="/assets/chain.svg" size={18} />
            <div className="text-xs tracking-widest uppercase text-white/25">Chain Version</div>
          </div>
          {isExpanded && (
            <div className="text-xs text-white/20 leading-relaxed -mt-1 mb-0.5">
              Sui object version — increments on any on-chain state change<br />
              (tribe join/leave, name update, etc). Stable = unchanged since last poll.
            </div>
          )}

          <div
            className="text-4xl font-extrabold leading-none font-mono"
            style={{
              color: accentColor,
              textShadow: `0 0 24px ${accentColor}44`,
            }}
          >
            {currentVersion !== null ? currentVersion : "—"}
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-[5px] px-2 py-[3px] rounded self-start",
              bumped
                ? "bg-purple-400/[0.12] border border-purple-400/30"
                : "bg-green-300/[0.08] border border-green-300/20"
            )}
          >
            <span className="text-xs">{bumped ? "⬆" : "●"}</span>
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: accentColor }}
            >
              {bumped ? "UPDATED" : "STABLE"}
            </span>
          </div>

          {bumped && previousVersion !== null && (
            <div className="text-xs font-mono text-white/40">
              <span className="line-through text-white/25">v{previousVersion}</span>
              {" → "}
              <span className="text-purple-400">v{currentVersion}</span>
            </div>
          )}

          <div className="text-xs text-white/30">
            {totalBumps} bump{totalBumps !== 1 ? "s" : ""} tracked
          </div>
        </div>

        {/* ── Right: history (expanded only) ───────────────── */}
        {isExpanded && (
          <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-5 flex flex-col gap-1.5 justify-center">
            <div className="text-xs tracking-widest uppercase text-white/25 mb-1">
              Version history
            </div>

            <div className="flex flex-col gap-[3px] overflow-auto max-h-[180px]">
              {[...history].reverse().slice(0, 15).map((rec, i) => (
                <div
                  key={rec.version}
                  className={cn(
                    "flex justify-between items-center px-2 py-1 rounded",
                    i === 0
                      ? "bg-purple-400/[0.08] border border-purple-400/20"
                      : "bg-white/[0.03] border border-white/[0.05]"
                  )}
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: i === 0 ? "#c084fc" : "rgba(255,255,255,0.55)" }}
                  >
                    v{rec.version}
                  </span>
                  <span className="text-xs text-white/30">
                    {timeAgo(rec.detectedAt)}
                  </span>
                </div>
              ))}
            </div>

            {history.length === 0 && (
              <div className="text-xs text-white/30 italic">
                Tracking will begin on next poll.
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
