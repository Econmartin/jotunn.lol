/*
 * NOTE: GateNetwork
 *
 * Type: READ
 * Size: 1x1
 * Priority: P2
 *
 * Visualization of linked gates. Active routes as connections between systems.
 * Infrastructure health score. Mini node graph, animated connections, fading on unlink.
 *
 * Data source: GateLinkedEvent / GateUnlinkedEvent from SpacetimeDB + owned gate objects
 * Triggers: Poll + event-driven
 */

import { GlassCard } from "../GlassCard";

export function GateNetwork() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(190, 50%, 30%, 0.5)",
            border: "1px solid hsla(190, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🔗</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(190, 20%, 65%, 0.55)" }}>GATES</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(190, 20%, 75%, 0.7)" }}>Gate network</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          GateNetwork — stub
        </div>
      </div>
    </GlassCard>
  );
}
