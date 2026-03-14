/*
 * NOTE: Newspaper
 *
 * Type: UPDATED
 * Size: 2x2
 * Priority: P2
 *
 * "THE STILLNESS TIMES" — auto-generated newspaper front page. Headline, AI-written
 * article, date stamp. Archive of past editions. Guest editorials from "insurance
 * company". Classifieds. Newspaper layout: columns, serif headline, dateline, yellowed
 * parchment background.
 *
 * Data source: AI-generated from SpacetimeDB events (OpenAI/Claude API)
 * Triggers: Major events (killmail, grid collapse, milestone achievements)
 * SpacetimeDB table: `reactions` (stores generated articles)
 */

import { GlassCard } from "../GlassCard";

export function Newspaper() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(35, 50%, 30%, 0.5)",
            border: "1px solid hsla(35, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📰</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(35, 20%, 65%, 0.55)" }}>PRESS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(35, 20%, 75%, 0.7)" }}>The Stillness Times</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          Newspaper — stub
        </div>
      </div>
    </GlassCard>
  );
}
