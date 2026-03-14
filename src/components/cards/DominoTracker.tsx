/*
 * NOTE: DominoTracker
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P2
 *
 * Cascade visualization when multiple assemblies release energy in sequence. Which
 * assemblies went dark and in what order. Horizontal timeline with falling domino
 * icons. Animated sequence replay. Red pulse per assembly.
 *
 * Data source: SpacetimeDB `events` filtered to EnergyReleasedEvent sequences
 * Triggers: Multiple EnergyReleasedEvent firing within a short window
 * SpacetimeDB table: `events` (filtered view)
 */

import { GlassCard } from "../GlassCard";

export function DominoTracker() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(15, 50%, 30%, 0.5)",
            border: "1px solid hsla(15, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🁣</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(15, 20%, 65%, 0.55)" }}>CASCADE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(15, 20%, 75%, 0.7)" }}>Domino tracker</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          DominoTracker — stub
        </div>
      </div>
    </GlassCard>
  );
}
