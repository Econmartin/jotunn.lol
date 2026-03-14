/*
 * NOTE: EventFeed
 *
 * Type: UPDATED
 * Size: 2x1
 * Priority: P0
 *
 * Chronological log of all on-chain events. Icon, human-readable label, category color,
 * summary text, timestamp. Expandable to full JSON. Category colors: character=blue,
 * combat=red, energy=amber, inventory=green. Newest on top.
 *
 * Data source: SpacetimeDB `events` table, populated by Event Poller
 * Triggers: Any event affecting Jotunn (TX_EVENTS_QUERY on wallet + character ID)
 * SpacetimeDB table: `events`
 *
 * Note: Implementation exists at ../EventFeed.tsx — this stub is for bento grid
 * slot reference only.
 */

import { GlassCard } from "../GlassCard";

export function EventFeed() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(205, 50%, 30%, 0.5)",
            border: "1px solid hsla(205, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📡</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(205, 20%, 65%, 0.55)" }}>EVENTS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(205, 20%, 75%, 0.7)" }}>Event feed</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          EventFeed — stub
        </div>
      </div>
    </GlassCard>
  );
}
