/*
 * NOTE: TimeLapseReplay
 *
 * Type: UPDATED
 * Size: 2x1
 * Priority: P3
 *
 * Replay entire session at 10x/50x/100x speed with all visual effects firing in
 * sequence. Export as video for social. Scrub bar with event markers. Video player
 * UI, play/pause/speed controls.
 *
 * Data source: SpacetimeDB `events` table (full history)
 * Triggers: User-initiated playback
 * SpacetimeDB table: `events` (read-only replay)
 */

import { GlassCard } from "../GlassCard";

export function TimeLapseReplay() {
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
          }}>⏱️</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(220, 20%, 65%, 0.55)" }}>REPLAY</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(220, 20%, 75%, 0.7)" }}>Time-lapse replay</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          TimeLapseReplay — stub
        </div>
      </div>
    </GlassCard>
  );
}
