/*
 * NOTE: CommentaryBot
 *
 * Type: REACTION
 * Size: 1x1
 * Priority: P2
 *
 * AI sports commentator narrating events live. Latest audio clip with play button,
 * transcript below. Auto-posted to X as audio snippets. Examples: "Jotunn's fuel
 * dropping... he's at 15%... this could be it folks", "ANOTHER KILL! That's death
 * #23!". Audio player widget, waveform visualization.
 *
 * Data source: AI text (OpenAI) + TTS (ElevenLabs / OpenAI TTS)
 * Triggers: Any significant event
 * SpacetimeDB table: `reactions` (type: "commentary")
 */

import { GlassCard } from "../GlassCard";

export function CommentaryBot() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(30, 50%, 30%, 0.5)",
            border: "1px solid hsla(30, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🎙️</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(30, 20%, 65%, 0.55)" }}>COMMENTARY</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(30, 20%, 75%, 0.7)" }}>Commentary bot</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          CommentaryBot — stub
        </div>
      </div>
    </GlassCard>
  );
}
