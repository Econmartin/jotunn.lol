/*
 * NOTE: SocialPosts
 *
 * Type: REACTION
 * Size: 1x1
 * Priority: P1
 *
 * Log of social media posts fired by events. Platform, message, timestamp, link to
 * post. Configurable rules per platform. Platform icons, preview of message, toggle
 * per platform.
 *
 * Data source: SpacetimeDB `reactions` (type: "social")
 * Triggers: Configurable — killmail, fuel low, grid collapse, milestone achievements
 * SpacetimeDB table: `reactions`
 * APIs: X/Twitter API, Discord webhook, Telegram Bot API
 */

import { GlassCard } from "../GlassCard";

export function SocialPosts() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(215, 50%, 30%, 0.5)",
            border: "1px solid hsla(215, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📣</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(215, 20%, 65%, 0.55)" }}>SOCIAL</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(215, 20%, 75%, 0.7)" }}>Social posts</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          SocialPosts — stub
        </div>
      </div>
    </GlassCard>
  );
}
