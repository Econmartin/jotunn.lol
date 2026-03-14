/*
 * NOTE: DeathCertificates
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P2
 *
 * Gallery of generated death certificate/tombstone images. Each: name, survival time,
 * cause of death (attacker info), system, timestamp. Scrollable gallery. Click to
 * expand, share button.
 *
 * Data source: AI image generation triggered by KillmailCreatedEvent
 * Triggers: KillmailCreatedEvent involving Jotunn
 * SpacetimeDB table: `reactions` (type: "death_cert", stores image URLs)
 */

import { GlassCard } from "../GlassCard";

export function DeathCertificates() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(350, 50%, 30%, 0.5)",
            border: "1px solid hsla(350, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📜</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(350, 20%, 65%, 0.55)" }}>CERTIFICATES</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(350, 20%, 75%, 0.7)" }}>Death certificates</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          DeathCertificates — stub
        </div>
      </div>
    </GlassCard>
  );
}
