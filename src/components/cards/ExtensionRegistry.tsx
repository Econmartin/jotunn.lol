/*
 * NOTE: ExtensionRegistry
 *
 * Type: READ
 * Size: 1x1
 * Priority: P2
 *
 * Extensions authorized on Jotunn's assemblies. Assembly name, extension type,
 * package ID. Simple list with extension type badges.
 *
 * Data source: ExtensionAuthorizedEvent from SpacetimeDB + assembly dynamic fields
 * Triggers: Event-driven
 */

import { GlassCard } from "../GlassCard";

export function ExtensionRegistry() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(265, 50%, 30%, 0.5)",
            border: "1px solid hsla(265, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🔌</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(265, 20%, 65%, 0.55)" }}>EXTENSIONS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(265, 20%, 75%, 0.7)" }}>Extension registry</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          ExtensionRegistry — stub
        </div>
      </div>
    </GlassCard>
  );
}
