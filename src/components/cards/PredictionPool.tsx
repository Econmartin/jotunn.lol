/*
 * NOTE: PredictionPool
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P2
 *
 * Visitors predict: time until next death, items lost today, will grid survive the
 * night. Leaderboard of most accurate predictors. Mock betting (no real money).
 * Prediction form, countdown to resolution, accuracy percentages.
 *
 * Data source: SpacetimeDB `predictions` table, visitor-submitted
 * Triggers: Visitor submits prediction; event resolves it
 * SpacetimeDB table: `predictions`
 */

import { GlassCard } from "../GlassCard";

export function PredictionPool() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(280, 50%, 30%, 0.5)",
            border: "1px solid hsla(280, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🔮</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(280, 20%, 65%, 0.55)" }}>PREDICTIONS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(280, 20%, 75%, 0.7)" }}>Prediction pool</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          PredictionPool — stub
        </div>
      </div>
    </GlassCard>
  );
}
