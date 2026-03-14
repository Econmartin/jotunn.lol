/*
 * NOTE: SpotifyPlaylist
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P1
 *
 * Embedded Spotify playlist widget. Track count, last track added, triggering event.
 * Songs by survival time: <1min=Yakety Sax, 1-3min=Another One Bites the Dust,
 * 3-5min=My Heart Will Go On, 5-10min=Stayin' Alive, 10+min=Eye of the Tiger.
 * "Deaths soundtracked: N" counter.
 *
 * Data source: Spotify API + SpacetimeDB `reactions` table
 * Triggers: KillmailCreatedEvent (primary), JumpEvent (secondary)
 * SpacetimeDB table: `reactions` (type: "spotify")
 */

import { GlassCard } from "../GlassCard";

export function SpotifyPlaylist() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(130, 50%, 30%, 0.5)",
            border: "1px solid hsla(130, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🎵</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(130, 20%, 65%, 0.55)" }}>SOUNDTRACK</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(130, 20%, 75%, 0.7)" }}>Spotify playlist</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          SpotifyPlaylist — stub
        </div>
      </div>
    </GlassCard>
  );
}
