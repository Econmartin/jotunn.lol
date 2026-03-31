/**
 * @card CharityDonate
 * @description Death-linked charity pledge via GlobalGiving.
 *   Concept: each time Jotunn dies, $0.01 is pledged.
 *   Accumulates until $10, then donates to the configured GlobalGiving project.
 *   Configure via VITE_GLOBAL_GIVING_API_KEY + VITE_GLOBAL_GIVING_PROJECT_ID.
 *
 * Collapsed: project name + pending balance.
 * Expanded: project image, funding progress, pledge math, donate button.
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";
import { useCharityDonate } from "./hook";

export function CharityDonate() {
  const isExpanded = useContext(CardExpandedContext);
  const {
    project, isLoading, hasKey,
    deathCount, totalPledged, sentAmount, pendingAmount,
    pledgePerDeath, sendThreshold, readyToSend, fundingPct,
  } = useCharityDonate();

  // Progress toward next $10 send
  const thresholdPct = Math.min(100, Math.round((pendingAmount / sendThreshold) * 100));

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `hsla(${MARTIAN_H},50%,28%,0.6)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
          >
            ❤️
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold tracking-widest uppercase"
                 style={{ color: `hsla(${MARTIAN_H},50%,65%,0.55)` }}>
              CHARITY
            </div>
            {isExpanded && project && (
              <div className="text-[10px] text-white/20 truncate">
                GlobalGiving · {project.organizationName}
              </div>
            )}
          </div>
          {readyToSend ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                  style={{ color: "#4ade80", borderColor: "#4ade8033" }}>
              ● READY
            </span>
          ) : (
            <span className="text-sm font-bold font-mono shrink-0" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
              ${pendingAmount.toFixed(2)}
            </span>
          )}
        </div>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            {isLoading && <div className="text-xs text-white/25">Loading…</div>}
            {!hasKey && !isLoading && (
              <div className="text-[10px] text-white/25">Add VITE_GLOBAL_GIVING_API_KEY to enable</div>
            )}
            {project && (
              <div className="text-sm font-medium leading-tight" style={{ color: "rgba(250,250,229,0.75)" }}>
                {project.title}
              </div>
            )}
            {/* Threshold progress */}
            <div className="h-1 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${thresholdPct}%`,
                  background: readyToSend
                    ? "linear-gradient(90deg, #4ade80, #22d3ee)"
                    : `linear-gradient(90deg, hsla(${MARTIAN_H},70%,40%,0.8), hsla(${MARTIAN_H},80%,55%,0.9))`,
                }}
              />
            </div>
            <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.3)" }}>
              {deathCount} death{deathCount !== 1 ? "s" : ""} × $0.01 · ${pendingAmount.toFixed(2)} pending
              {sentAmount > 0 && ` · $${sentAmount.toFixed(2)} sent`}
            </div>
          </div>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="flex-1 flex flex-col gap-3 overflow-auto min-h-0">
            {isLoading && (
              <div className="text-xs text-white/25 animate-pulse">Fetching project data…</div>
            )}
            {!hasKey && !isLoading && (
              <div className="text-[10px] text-white/30">Add VITE_GLOBAL_GIVING_API_KEY to enable.</div>
            )}

            {project && (
              <>
                {/* Project image */}
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full rounded-md object-cover shrink-0"
                    style={{ maxHeight: 80, border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                )}

                {/* Title + org */}
                <div>
                  <div className="text-sm font-semibold leading-tight text-white/80">{project.title}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{project.organizationName}</div>
                </div>

                {/* Description */}
                {project.summary && (
                  <div className="text-[11px] text-white/45 leading-relaxed">
                    {project.summary.slice(0, 280)}{project.summary.length > 280 ? "…" : ""}
                  </div>
                )}

                {/* GlobalGiving funding progress */}
                <div>
                  <div className="flex justify-between text-[9px] mb-1"
                       style={{ color: "rgba(250,250,229,0.25)" }}>
                    <span>PROJECT FUNDED</span>
                    <span>${project.funding.toLocaleString()} / ${project.goal.toLocaleString()} · {fundingPct}%</span>
                  </div>
                  <div className="h-1.5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${fundingPct}%`,
                        background: `linear-gradient(90deg, hsla(${MARTIAN_H},70%,40%,0.8), hsla(${MARTIAN_H},80%,55%,0.9))`,
                      }}
                    />
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: "rgba(250,250,229,0.18)" }}>
                    {project.numberOfDonations.toLocaleString()} donations
                  </div>
                </div>

                {/* Pledge math */}
                <div
                  className="rounded-md p-3 border"
                  style={{ background: "rgba(0,0,0,0.25)", borderColor: `hsla(${MARTIAN_H},60%,40%,0.2)` }}
                >
                  <div className="text-[9px] tracking-widest uppercase mb-2"
                       style={{ color: "rgba(250,250,229,0.2)" }}>
                    Pledge calculation
                  </div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/40">Deaths</span>
                    <span className="font-mono text-white/70">{deathCount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/40">Rate per death</span>
                    <span className="font-mono text-white/70">${pledgePerDeath.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/40">Total pledged</span>
                    <span className="font-mono text-white/70">${totalPledged.toFixed(2)}</span>
                  </div>
                  {sentAmount > 0 && (
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/40">Sent</span>
                      <span className="font-mono" style={{ color: "#4ade8099" }}>${sentAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] pt-1.5 border-t border-white/[0.07]">
                    <span className="font-bold text-white/60">Pending</span>
                    <span className="font-mono font-bold" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                      ${pendingAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Threshold progress */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] mb-1" style={{ color: "rgba(250,250,229,0.2)" }}>
                      <span>Next send at ${sendThreshold}.00</span>
                      <span>{thresholdPct}%</span>
                    </div>
                    <div className="h-1 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${thresholdPct}%`,
                          background: readyToSend
                            ? "linear-gradient(90deg, #4ade80, #22d3ee)"
                            : `hsla(${MARTIAN_H},70%,50%,0.7)`,
                        }}
                      />
                    </div>
                    {readyToSend && (
                      <div className="text-[9px] mt-1" style={{ color: "#4ade8088" }}>
                        Ready to send — payment gateway pending
                      </div>
                    )}
                  </div>
                </div>

                {/* Donate button */}
                <a
                  href={project.projectLink}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center font-bold tracking-[0.15em] py-2.5 rounded-lg"
                  style={{
                    background: `hsla(${MARTIAN_H},75%,32%,0.8)`,
                    border: `1px solid hsla(${MARTIAN_H},75%,55%,0.4)`,
                    color: `hsla(${MARTIAN_H},90%,80%,1)`,
                    textDecoration: "none",
                    fontSize: "12px",
                  }}
                >
                  DONATE NOW → GlobalGiving
                </a>
              </>
            )}

            {hasKey && !isLoading && !project && (
              <div className="text-[10px] text-white/30">
                Could not load project. Check API key or project ID.
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
