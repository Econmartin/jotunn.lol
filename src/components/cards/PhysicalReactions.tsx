/*
 * NOTE: PhysicalReactions
 *
 * Type: REACTION
 * Size: 1x1
 * Priority: P3
 *
 * Log of physical-world reactions. Type (fax, pizza, t-shirt, carrier pigeon), target,
 * timestamp, delivery status. Delivery status tracker aesthetic. Package icons.
 * Humorous status messages.
 *
 * Data source: SpacetimeDB `reactions` (type: "physical")
 * Triggers: Milestone events (death #10, #25, #50)
 * SpacetimeDB table: `reactions`
 * APIs: Twilio (SMS/fax), Printful (t-shirts), pizza delivery APIs
 */

import { GlassCard } from "../GlassCard";

export function PhysicalReactions() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(45, 50%, 30%, 0.5)",
            border: "1px solid hsla(45, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📦</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(45, 20%, 65%, 0.55)" }}>IRL REACTIONS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(45, 20%, 75%, 0.7)" }}>Physical reactions</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          PhysicalReactions — stub
        </div>
      </div>
    </GlassCard>
  );
}
