/*
 * NOTE: RivalComparison
 *
 * Type: READ
 * Size: 2x1
 * Priority: P2
 *
 * "Tale of the tape" side-by-side: Jotunn vs rival. Deaths, items, fuel efficiency,
 * grid uptime, assemblies owned, tribe. Boxing-style, stats bars showing who's ahead.
 *
 * Data source: Second player's character + objects via same hooks with different address
 * Triggers: Poll every 60s
 */

import { GlassCard } from "../GlassCard";

export function RivalComparison() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(350, 50%, 30%, 0.5)",
            border: "1px solid hsla(350, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🥊</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(350, 20%, 65%, 0.55)" }}>RIVALRY</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(350, 20%, 75%, 0.7)" }}>Rival comparison</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          RivalComparison — stub
        </div>
      </div>
    </GlassCard>
  );
}
