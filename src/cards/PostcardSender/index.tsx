/**
 * @card PostcardSender
 * @description Physical kill-milestone postcards via Lob.com.
 *   Milestones: 1st, 5th, 10th, 25th, 50th kill.
 *   Test mode (VITE_LOB_TEST_API_KEY): no real mail, full Lob preview PDF.
 *
 * Collapsed: kill counter + next milestone progress.
 * Expanded: milestone tracker (left) + sent postcard log (right).
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";
import { usePostcardSender } from "./hook";

const MILESTONES = [1, 5, 10, 25, 50];

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function PostcardSender() {
  const isExpanded = useContext(CardExpandedContext);
  const { killCount, nextMilestone, sentMilestones, sent, hasKey, hasAddress } = usePostcardSender();

  const prevMilestone = sentMilestones.length
    ? Math.max(...sentMilestones.filter((m) => m <= killCount))
    : 0;
  const pct = nextMilestone
    ? Math.round(((killCount - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `hsla(${MARTIAN_H},50%,28%,0.6)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
          >
            📮
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold tracking-widest uppercase"
                 style={{ color: `hsla(${MARTIAN_H},50%,65%,0.55)` }}>
              POSTCARD
            </div>
            {isExpanded && (
              <div className="text-[10px] text-white/20">
                Kill milestones → physical mail via PostGrid
              </div>
            )}
          </div>
          {hasKey && hasAddress && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                  style={{ color: "#4ade80", borderColor: "#4ade8033" }}>
              ● READY
            </span>
          )}
        </div>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                {killCount}
              </span>
              <span className="text-[10px] text-white/30">
                {nextMilestone ? `next: ${nextMilestone} kills` : "all milestones hit"}
              </span>
            </div>
            {nextMilestone && (
              <div className="h-1.5 rounded overflow-hidden" style={{ background: `hsla(${MARTIAN_H},20%,18%,0.6)` }}>
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, hsla(${MARTIAN_H},70%,40%,0.8), hsla(${MARTIAN_H},80%,55%,0.9))`,
                  }}
                />
              </div>
            )}
            <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.3)" }}>
              {sent.length > 0
                ? `${sent.length} postcard${sent.length === 1 ? "" : "s"} sent`
                : (!hasKey || !hasAddress) ? "Add VITE_POSTGRID_API_KEY + address vars to enable" : "Watching for first kill milestone…"}
            </div>
          </div>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="flex-1 flex flex-row gap-4 min-h-0">

            {/* Left: milestone tracker */}
            <div className="flex flex-col gap-2 shrink-0" style={{ flex: "0 0 140px" }}>
              <div className="text-[9px] tracking-widest uppercase mb-1"
                   style={{ color: "rgba(250,250,229,0.2)" }}>
                Milestones
              </div>
              {MILESTONES.map((m) => {
                const sent = sentMilestones.includes(m);
                const isCurrent = nextMilestone === m;
                return (
                  <div key={m} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{
                        background: sent
                          ? "rgba(74,222,128,0.2)"
                          : isCurrent
                            ? `hsla(${MARTIAN_H},60%,28%,0.5)`
                            : "rgba(255,255,255,0.05)",
                        border: `1px solid ${sent ? "rgba(74,222,128,0.4)" : isCurrent ? `hsla(${MARTIAN_H},60%,50%,0.3)` : "rgba(255,255,255,0.08)"}`,
                        color: sent ? "#4ade80" : isCurrent ? `hsla(${MARTIAN_H},80%,65%,0.9)` : "rgba(250,250,229,0.2)",
                      }}
                    >
                      {sent ? "✓" : m}
                    </div>
                    <div className="text-[10px]" style={{ color: sent ? "rgba(74,222,128,0.7)" : isCurrent ? "rgba(250,250,229,0.6)" : "rgba(250,250,229,0.2)" }}>
                      {m} kill{m > 1 ? "s" : ""}
                    </div>
                    {isCurrent && (
                      <div className="flex-1 h-1 rounded overflow-hidden ml-1"
                           style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${pct}%`,
                            background: `hsla(${MARTIAN_H},70%,50%,0.7)`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Kill counter */}
              <div className="mt-auto pt-3 border-t border-white/[0.06]">
                <div className="text-[9px] text-white/20 tracking-widest mb-0.5">KILLS</div>
                <div className="text-xl font-bold font-mono" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                  {killCount}
                </div>
              </div>

              {!hasKey && (
                <div className="text-[9px] text-amber-400/50 leading-snug">
                  Add VITE_LOB_TEST_API_KEY to send postcards
                </div>
              )}
            </div>

            {/* Right: sent log */}
            <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-4 overflow-auto flex flex-col gap-2">
              <div className="text-[9px] tracking-widest uppercase"
                   style={{ color: "rgba(250,250,229,0.2)" }}>
                Sent postcards
              </div>
              {sent.length === 0 ? (
                <div className="text-[10px] text-white/25 italic">
                  No postcards sent yet. Postcards auto-send when kill milestones are hit.
                </div>
              ) : (
                sent.slice().reverse().map((record) => (
                  <div
                    key={record.id}
                    className="border border-white/[0.07] rounded-md p-2.5 bg-white/[0.02]"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold" style={{ color: `hsla(${MARTIAN_H},70%,65%,0.9)` }}>
                        #{record.milestone} kill milestone
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded border"
                        style={{
                          color: record.status === "sent" ? "#4ade80" : record.status === "error" ? "#f87171" : "rgba(250,250,229,0.4)",
                          borderColor: record.status === "sent" ? "#4ade8033" : record.status === "error" ? "#f8717133" : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[9px] text-white/30">{timeAgo(record.sentAt)}</div>
                    {record.error && (
                      <div className="text-[9px] text-red-400/60 mt-1">{record.error}</div>
                    )}
                    {record.previewUrl && (
                      <a
                        href={record.previewUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[9px] mt-1 block"
                        style={{ color: `hsla(${MARTIAN_H},70%,60%,0.7)` }}
                      >
                        View preview →
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
