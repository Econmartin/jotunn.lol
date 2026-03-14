/*
 * NOTE: ItemLedger
 *
 * Type: UPDATED
 * Size: 1x1
 * Priority: P0
 *
 * Running ledger of items gained vs lost. Item name (enriched via Datahub
 * /v2/types/{id}), direction (in/out), timestamp. Net balance prominently. Two-column:
 * green (gained) vs red (lost). Running totals by category.
 *
 * Data source: SpacetimeDB `item_ledger` from ItemMintedEvent / ItemBurnedEvent /
 *              ItemDepositedEvent / ItemWithdrawnEvent
 * Triggers: Any inventory event involving Jotunn's assemblies
 * SpacetimeDB table: `item_ledger`
 */

import { GlassCard } from "../GlassCard";

export function ItemLedger() {
  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(150, 50%, 30%, 0.5)",
            border: "1px solid hsla(150, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📒</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(150, 20%, 65%, 0.55)" }}>ITEMS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(150, 20%, 75%, 0.7)" }}>Item ledger</div>
          </div>
        </div>
        {/* Body placeholder */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "monospace" }}>
          ItemLedger — stub
        </div>
      </div>
    </GlassCard>
  );
}
