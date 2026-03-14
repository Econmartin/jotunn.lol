/*
 * NOTE: HardwareStatus
 *
 * Type: REACTION
 * Size: 1x1
 * Priority: P3
 *
 * Connected hardware devices dashboard. Device name, type, last signal, connection
 * status. Devices register via webhook bus and report back status. Connection
 * indicators, heartbeat pulse animation, "No devices connected" empty state.
 *
 * Data source: WebSocket connections from registered hardware devices
 * Triggers: Device heartbeat + event forwarding
 * SpacetimeDB table: `reactions` (type: "hardware")
 */

import { GlassCard } from "../GlassCard";

export function HardwareStatus() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(185, 50%, 30%, 0.5)",
            border: "1px solid hsla(185, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🖥️</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(185, 20%, 65%, 0.55)" }}>HARDWARE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(185, 20%, 75%, 0.7)" }}>Hardware status</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          HardwareStatus — stub
        </div>
      </div>
    </GlassCard>
  );
}
