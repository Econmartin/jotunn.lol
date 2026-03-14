/*
 * NOTE: ChangeLog
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P0
 *
 * Field-level diffs on Jotunn's character object. Changed fields, old value
 * (strikethrough red) → new value (green). Timestamped. Clear changelog button.
 *
 * Data source: SpacetimeDB `snapshots` table, diffed against previous snapshot
 * Triggers: Character object version change
 * SpacetimeDB table: `snapshots`
 *
 * Note: Implementation exists at ../ChangeLog.tsx — this stub is for bento grid
 * slot reference only.
 */

import { GlassCard } from "../GlassCard";

export function ChangeLog() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(145, 50%, 30%, 0.5)",
            border: "1px solid hsla(145, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📝</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(145, 20%, 65%, 0.55)" }}>CHANGELOG</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(145, 20%, 75%, 0.7)" }}>Field diffs</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          ChangeLog — stub
        </div>
      </div>
    </GlassCard>
  );
}
