/*
 * NOTE: Achievements
 *
 * Type: UPDATED
 * Size: 2x1
 * Priority: P1
 *
 * Trophy case of unlockable achievements. Greyed until earned, then revealed with
 * unlock timestamp. Achievements include: "Speed Run", "Hoarder", "Glass Cannon",
 * "Frequent Flyer", "Phoenix", "The Collector", "Blackout King", "Cockroach",
 * "Taxman", "Ghost Ship". Grid of badges, locked=dark, unlocked=glowing. Toast on
 * new unlock.
 *
 * Data source: SpacetimeDB `achievements` table, computed from event combinations
 * Triggers: Achievement engine evaluates on each new event
 * SpacetimeDB table: `achievements`
 */

import { GlassCard } from "../GlassCard";

export function Achievements() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(50, 50%, 30%, 0.5)",
            border: "1px solid hsla(50, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🏆</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(50, 20%, 65%, 0.55)" }}>ACHIEVEMENTS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(50, 20%, 75%, 0.7)" }}>Trophy case</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          Achievements — stub
        </div>
      </div>
    </GlassCard>
  );
}
