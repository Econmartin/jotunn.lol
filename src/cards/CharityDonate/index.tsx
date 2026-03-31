/**
 * @card CharityDonate
 * @description Kill-linked charity pledge via Every.org.
 *   Concept: $1 per confirmed Jotunn kill pledged to charity.
 *   Configure charity via VITE_CHARITY_SLUG (default: doctors-without-borders).
 *
 * Collapsed: charity name + pledged amount meter.
 * Expanded: charity description + pledge math + DONATE NOW button.
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";
import { useCharityDonate } from "./hook";

export function CharityDonate() {
  const isExpanded = useContext(CardExpandedContext);
  const { nonprofit, isLoading, killCount, pledgedAmount, pledgePerKill, donateUrl, charitySlug } = useCharityDonate();

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
            {isExpanded && (
              <div className="text-[10px] text-white/20 truncate">
                Every.org · {charitySlug}
              </div>
            )}
          </div>
          <span className="text-sm font-bold font-mono shrink-0" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
            ${pledgedAmount}
          </span>
        </div>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            {isLoading && <div className="text-xs text-white/25">Loading…</div>}
            {nonprofit && (
              <>
                <div className="text-sm font-medium truncate" style={{ color: "rgba(250,250,229,0.75)" }}>
                  {nonprofit.name}
                </div>
                {nonprofit.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {nonprofit.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(250,250,229,0.3)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.3)" }}>
                  {killCount} kill{killCount !== 1 ? "s" : ""} × ${pledgePerKill} = ${pledgedAmount} pledged
                </div>
              </>
            )}
            {!isLoading && !nonprofit && (
              <div className="text-[10px] text-white/25">
                {charitySlug} · {killCount} kills · ${pledgedAmount}
              </div>
            )}
          </div>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="flex-1 flex flex-col gap-3 overflow-auto min-h-0">
            {isLoading && (
              <div className="text-xs text-white/25 animate-pulse">Fetching charity data…</div>
            )}

            {nonprofit && (
              <>
                {/* Charity name + logo */}
                <div className="flex items-start gap-3">
                  {nonprofit.logoUrl && (
                    <img
                      src={nonprofit.logoUrl}
                      alt={nonprofit.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white/80">{nonprofit.name}</div>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {nonprofit.tags.map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(250,250,229,0.35)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {nonprofit.description && (
                  <div className="text-[11px] text-white/50 leading-relaxed line-clamp-4">
                    {nonprofit.description.slice(0, 300)}{nonprofit.description.length > 300 ? "…" : ""}
                  </div>
                )}

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
                    <span className="text-white/40">Kills confirmed</span>
                    <span className="font-mono text-white/70">{killCount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/40">Rate per kill</span>
                    <span className="font-mono text-white/70">${pledgePerKill}.00</span>
                  </div>
                  <div className="flex justify-between text-[10px] pt-1.5 border-t border-white/[0.07]">
                    <span className="font-bold text-white/60">Total pledged</span>
                    <span className="font-mono font-bold" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                      ${pledgedAmount}.00
                    </span>
                  </div>
                </div>

                {/* Donate button */}
                <a
                  href={donateUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center font-bold tracking-[0.15em] py-2.5 rounded-lg transition-colors"
                  style={{
                    background: `hsla(${MARTIAN_H},75%,32%,0.8)`,
                    border: `1px solid hsla(${MARTIAN_H},75%,55%,0.4)`,
                    color: `hsla(${MARTIAN_H},90%,80%,1)`,
                    textDecoration: "none",
                    fontSize: "12px",
                  }}
                >
                  DONATE NOW → every.org
                </a>
              </>
            )}

            {!isLoading && !nonprofit && (
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-white/35">
                  Could not load charity data for "{charitySlug}".
                  Check VITE_CHARITY_SLUG or try again.
                </div>
                <div className="flex justify-between text-[10px] py-2 border-t border-white/[0.07]">
                  <span className="text-white/40">Pledged amount</span>
                  <span className="font-mono font-bold" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                    ${pledgedAmount}
                  </span>
                </div>
                <a
                  href={donateUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] block"
                  style={{ color: `hsla(${MARTIAN_H},70%,60%,0.7)` }}
                >
                  Donate on every.org →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
