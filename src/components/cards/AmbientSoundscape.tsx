/*
 * NOTE: AmbientSoundscape
 *
 * Type: REACTION
 * Size: 1x1
 * Priority: P1
 *
 * Persistent ambient sound layer. Mood shifts with game state: Normal=calm space
 * ambient, Fuel<50%=deeper bass drone, Fuel<20%=alarm+heartbeat, Grid collapse=silence
 * then klaxon, Kill=explosion then silence+rebuild, Item minted=cheerful chime. Sound
 * on/off toggle, current mood label, volume slider, equalizer visualization.
 *
 * Data source: Local state driven by current event context
 * Triggers: Fuel level changes, killmail, grid collapse, item events
 * SpacetimeDB table: None (client-side audio state)
 */

import { GlassCard } from "../GlassCard";

export function AmbientSoundscape() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(250, 50%, 30%, 0.5)",
            border: "1px solid hsla(250, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🔊</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(250, 20%, 65%, 0.55)" }}>SOUNDSCAPE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(250, 20%, 75%, 0.7)" }}>Ambient sound</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          AmbientSoundscape — stub
        </div>
      </div>
    </GlassCard>
  );
}
