/*
 * NOTE: FuelTrend
 *
 * Type: UPDATED
 * Size: 2x1
 * Priority: P1
 *
 * Fuel level over time chart. X=time, Y=fuel. Trend line, burn rate, projected empty
 * time (dashed extension). Historical low/high markers. Red zone below 20%. Zoom
 * controls (1h, 6h, 24h, 7d).
 *
 * Data source: SpacetimeDB `fuel_readings` table + FuelEvent data
 * Triggers: FuelEvent, periodic snapshots every poll cycle
 * SpacetimeDB table: `fuel_readings`
 */

import { GlassCard } from "../GlassCard";

export function FuelTrend() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(40, 50%, 30%, 0.5)",
            border: "1px solid hsla(40, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📈</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(40, 20%, 65%, 0.55)" }}>FUEL TREND</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(40, 20%, 75%, 0.7)" }}>Fuel over time</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          FuelTrend — stub
        </div>
      </div>
    </GlassCard>
  );
}
