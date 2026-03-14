/*
 * Fuel Gauge — READ card. Network Node → dynamic fields → fuel balance.
 */

import { useMemo } from "react";
import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { useObjectWithDynamicFields } from "../../hooks/useObjectWithDynamicFields";
import type { DynamicField } from "../../lib/types";
import { GlassCard } from "../GlassCard";

function isNetworkNode(type: string, typeName: string): boolean {
  const combined = `${type} ${typeName}`.toLowerCase();
  return combined.includes("networknode") || combined.includes("network_node");
}

/** Try to extract a numeric fuel value from dynamic fields. */
function getFuelFromDynamicFields(fields: DynamicField[]): number | null {
  for (const f of fields) {
    const nameStr = JSON.stringify(f.name?.json ?? "").toLowerCase();
    const typeRepr = (f.name?.type?.repr ?? "").toLowerCase();
    if (!nameStr.includes("fuel") && !typeRepr.includes("fuel")) continue;
    const contents = f.contents?.json;
    if (typeof contents === "number" && !Number.isNaN(contents)) return contents;
    if (contents && typeof contents === "object") {
      const v = (contents as Record<string, unknown>).value ?? (contents as Record<string, unknown>).balance ?? (contents as Record<string, unknown>).amount;
      if (typeof v === "number" && !Number.isNaN(v)) return v;
    }
  }
  return null;
}

export function FuelGauge() {
  const { data: objects } = useOwnedObjects();
  const nnAddress = useMemo(() => {
    if (!objects) return null;
    const nn = objects.find((o) => isNetworkNode(o.type, o.typeName));
    return nn?.address ?? null;
  }, [objects]);

  const { data: nnObject, isLoading, error } = useObjectWithDynamicFields(nnAddress);
  const fuel = useMemo(() => (nnObject ? getFuelFromDynamicFields(nnObject.dynamicFields) : null), [nnObject]);

  // Placeholder max for gauge percentage when we don't have a known max
  const maxFuel = 1000;
  const pct = fuel != null && maxFuel > 0 ? Math.min(100, (fuel / maxFuel) * 100) : null;
  const isLow = pct != null && pct < 20;
  const isMid = pct != null && pct >= 20 && pct < 50;

  return (
    <GlassCard accentH={40} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(40, 50%, 30%, 0.5)",
            border: "1px solid hsla(40, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>⛽</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(40, 20%, 65%, 0.55)" }}>FUEL</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(40, 20%, 75%, 0.7)" }}>Fuel gauge</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          {isLoading && <div className="card-loading">Loading fuel...</div>}
          {error && <div className="card-error">Error: {error.message}</div>}
          {!nnAddress && !isLoading && !error && (
            <div className="text-muted">No Network Node found.</div>
          )}
          {nnObject && (
            <>
              <div style={{ fontSize: 24, fontWeight: 700, color: "hsla(40, 25%, 88%, 0.95)", fontFamily: "monospace" }}>
                {fuel != null ? fuel.toLocaleString() : "—"}
              </div>
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  background: "hsla(40, 20%, 18%, 0.6)",
                  overflow: "hidden",
                  boxShadow: isLow ? "0 0 12px hsla(0, 70%, 50%, 0.4)" : undefined,
                }}
              >
                <div
                  style={{
                    width: pct != null ? `${pct}%` : "0%",
                    height: "100%",
                    borderRadius: 6,
                    background:
                      isLow
                        ? "linear-gradient(90deg, hsl(0, 65%, 45%), hsl(25, 80%, 50%))"
                        : isMid
                          ? "linear-gradient(90deg, hsl(45, 85%, 45%), hsl(55, 90%, 50%))"
                          : "linear-gradient(90deg, hsl(140, 55%, 40%), hsl(95, 60%, 45%))",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              {fuel != null && (
                <div style={{ fontSize: 10, color: "hsla(40, 15%, 55%, 0.8)" }}>
                  {pct != null && maxFuel !== fuel ? `~${pct.toFixed(0)}% of ref max` : "Fuel units"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
