/**
 * @card TribeChangeAlert
 * @description Watches tribe_id on the character object.
 *   Collapsed: tribe tag + "stable" / "⚡ changed!" badge.
 *   Expanded:  previous tribe → current tribe with timestamp.
 *
 * @dataflow
 *   useCharacter() → tribe_id → localStorage diff → TribeChangeAlert
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { useTribeChangeAlert } from "./hook";
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

export function TribeChangeAlert() {
  const {
    currentTribeName, currentTribeTag,
    previousTribeName,
    changedAt, changed,
    history,
  } = useTribeChangeAlert();

  const isExpanded = useContext(CardExpandedContext);
  const accentColor = changed ? "#fbbf24" : "#5eead4";

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-row gap-5">

        {/* ── Left: status ─────────────────────────────────── */}
        <div
          className="flex flex-col justify-center gap-1.5"
          style={{ flex: isExpanded ? "0 0 150px" : "1 1 0%" }}
        >
          <div className="flex items-center gap-2">
            <SvgIcon src="/assets/tribe.svg" size={18} />
            <div className="text-xs tracking-widest uppercase text-white/25">Tribe Allegiance</div>
          </div>
          {isExpanded && (
            <div className="text-xs text-white/20 -mt-0.5 mb-0.5">
              Watching tribe_id · seeds history from chain on first load
            </div>
          )}

          <div className="text-sm font-bold text-white/85">
            {currentTribeName}
          </div>

          <div className="text-xs font-mono" style={{ color: accentColor }}>
            {currentTribeTag}
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-[5px] px-2 py-[3px] rounded self-start",
              changed
                ? "bg-amber-400/[0.12] border border-amber-400/30"
                : "bg-teal-300/[0.08] border border-teal-300/20"
            )}
          >
            <span className="text-xs">{changed ? "⚡" : "●"}</span>
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: accentColor }}
            >
              {changed ? "CHANGED" : "STABLE"}
            </span>
          </div>

          {changed && changedAt && (
            <div className="text-xs text-white/35">
              Detected {timeAgo(changedAt)}
            </div>
          )}
        </div>

        {/* ── Right: history (expanded only) ───────────────── */}
        {isExpanded && (
          <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-5 flex flex-col gap-2 justify-center">
            <div className="text-xs tracking-widest uppercase text-white/25">
              Allegiance history
            </div>

            {changed && previousTribeName && (
              <div className="px-[10px] py-2 rounded-[6px] bg-amber-400/[0.08] border border-amber-400/20">
                <div className="text-xs text-white/35 mb-1">Previous</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 line-through">{previousTribeName}</span>
                  <span className="text-xs">→</span>
                  <span className="text-xs font-bold text-amber-400">{currentTribeName}</span>
                </div>
                {changedAt && (
                  <div className="text-xs text-white/30 mt-[3px]">{timeAgo(changedAt)}</div>
                )}
              </div>
            )}

            {!changed && (
              <div className="text-xs text-white/40 italic">
                No tribe changes detected since tracking began.
              </div>
            )}

            <div className="text-xs tracking-widest uppercase text-white/20 mt-1">
              Snapshots stored: {history.length}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
