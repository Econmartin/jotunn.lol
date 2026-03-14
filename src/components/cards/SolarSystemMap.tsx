/*
 * NOTE: SolarSystemMap
 *
 * Type: READ
 * Size: 2x2
 * Priority: P1
 *
 * 2D/3D visualization of solar systems. Jotunn's current position highlighted (pulsing
 * dot). Nearby system names on hover. Jump trail when gate events available. Canvas or
 * SVG. Could use Three.js for 3D.
 *
 * Data source: Frontier Datahub /v2/solarsystems + Jotunn's location (from assembly
 *              location_hash)
 * Triggers: On load + when JumpEvent fires
 */

import { GlassCard } from "../GlassCard";

export function SolarSystemMap() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(220, 50%, 30%, 0.5)",
            border: "1px solid hsla(220, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🌌</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(220, 20%, 65%, 0.55)" }}>MAP</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(220, 20%, 75%, 0.7)" }}>Solar system map</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          SolarSystemMap — stub
        </div>
      </div>
    </GlassCard>
  );
}
