/**
 * @card FuelGauge
 * @description Fuel level bar gauge for the Network Node. Red when low, yellow mid, green high.
 *
 * @deps
 *   - src/components/GlassCard/              — glassmorphism wrapper (accentH=40 = orange)
 *   - src/hooks/useOwnedObjects.ts            — find Network Node address
 *   - src/hooks/useObjectWithDynamicFields.ts — fetch fuel from dynamic fields
 *   - src/lib/types.ts                        — DynamicField type
 *
 * @dataflow
 *   useOwnedObjects() → NN address → useObjectWithDynamicFields() → fuel value → FuelGauge
 */

import { useMemo } from "react";
import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { useObjectWithDynamicFields } from "../../hooks/useObjectWithDynamicFields";
import type { DynamicField } from "../../lib/types";
import { GlassCard } from "../../components/GlassCard";
import { cn } from "../../lib/utils";
import { MARTIAN_H } from "../../lib/constants";

function isNetworkNode(type: string, typeName: string): boolean {
  const combined = `${type} ${typeName}`.toLowerCase();
  return combined.includes("networknode") || combined.includes("network_node");
}

function getFuelFromDynamicFields(fields: DynamicField[]): number | null {
  for (const f of fields) {
    const nameStr  = JSON.stringify(f.name?.json ?? "").toLowerCase();
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
    return objects.find((o) => isNetworkNode(o.type, o.typeName))?.address ?? null;
  }, [objects]);

  const { data: nnObject, isLoading, error } = useObjectWithDynamicFields(nnAddress);
  const fuel = useMemo(() => (nnObject ? getFuelFromDynamicFields(nnObject.dynamicFields) : null), [nnObject]);

  const maxFuel = 1000;
  const pct     = fuel != null && maxFuel > 0 ? Math.min(100, (fuel / maxFuel) * 100) : null;
  const isLow   = pct != null && pct < 20;
  const isMid   = pct != null && pct >= 20 && pct < 50;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ background: `hsla(${MARTIAN_H}, 50%, 30%, 0.5)`, border: `1px solid hsla(${MARTIAN_H}, 50%, 50%, 0.25)` }}
          >⛽</div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H}, 20%, 65%, 0.55)` }}>FUEL</div>
            <div className="text-sm font-medium" style={{ color: `hsla(${MARTIAN_H}, 20%, 75%, 0.7)` }}>Fuel gauge</div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          {isLoading && (
            <div className="flex items-center justify-center min-h-[80px] text-[rgba(250,250,229,0.6)] text-sm">
              Loading fuel...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center min-h-[80px] text-red-400 text-sm">
              Error: {error.message}
            </div>
          )}
          {!nnAddress && !isLoading && !error && (
            <div className="text-[rgba(250,250,229,0.6)] text-sm">No Network Node found.</div>
          )}
          {nnObject && (
            <>
              {/* Fuel value — dynamic number, static styling */}
              <div className="text-2xl font-bold font-mono" style={{ color: `hsla(${MARTIAN_H}, 25%, 88%, 0.95)` }}>
                {fuel != null ? fuel.toLocaleString() : "—"}
              </div>

              {/* Bar track */}
              <div
                className={cn(
                  "h-3 rounded-[6px] overflow-hidden",
                  isLow && "[box-shadow:0_0_12px_hsla(0,70%,50%,0.4)]"
                )}
                style={{ background: `hsla(${MARTIAN_H}, 20%, 18%, 0.6)` }}
              >
                {/* Bar fill — width is dynamic (% from fuel data), gradient is conditional on state */}
                <div
                  style={{
                    width: pct != null ? `${pct}%` : "0%",
                    height: "100%",
                    borderRadius: 6,
                    background: isLow
                      ? "linear-gradient(90deg, hsl(0, 65%, 45%), hsl(25, 80%, 50%))"
                      : isMid
                        ? "linear-gradient(90deg, hsl(45, 85%, 45%), hsl(55, 90%, 50%))"
                        : "linear-gradient(90deg, hsl(140, 55%, 40%), hsl(95, 60%, 45%))",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {fuel != null && (
                <div className="text-xs" style={{ color: `hsla(${MARTIAN_H}, 15%, 55%, 0.8)` }}>
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
