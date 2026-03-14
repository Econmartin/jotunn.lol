/*
 * NOTE: NameGraveyard
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P1
 *
 * All previous names for Jotunn's character and assemblies. Old name (crossed out) →
 * new name, timestamp. "Identity crisis counter" at top. Tombstone aesthetic,
 * strikethrough old names.
 *
 * Data source: SpacetimeDB `name_history` from MetadataChangedEvent
 * Triggers: MetadataChangedEvent involving Jotunn
 * SpacetimeDB table: `name_history`
 */

import { GlassCard } from "../GlassCard";

export function NameGraveyard() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(270, 50%, 30%, 0.5)",
            border: "1px solid hsla(270, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🪦</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(270, 20%, 65%, 0.55)" }}>NAME HISTORY</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(270, 20%, 75%, 0.7)" }}>Name graveyard</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          NameGraveyard — stub
        </div>
      </div>
    </GlassCard>
  );
}
