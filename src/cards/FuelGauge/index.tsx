/**
 * @card FuelGauge
 * @description Fuel level bar gauge for the Network Node. Red when low, yellow mid, green high.
 *
 * @dataflow
 *   useCharacter() → metadata.assembly_id → useObjectWithDynamicFields(assemblyId)
 *   → json.fuel.quantity (top-level, NOT dynamic fields) → FuelGauge
 */

import { useMemo } from "react";
import { useCharacter } from "../../hooks/useCharacter";
import { useObjectWithDynamicFields } from "../../hooks/useObjectWithDynamicFields";
import { GlassCard } from "../../components/GlassCard";
import { cn } from "../../lib/utils";
import { MARTIAN_H } from "../../lib/constants";
import { SvgIcon } from "../../components/SvgIcon";

function parseFuel(json: Record<string, unknown>): { quantity: number | null; maxCapacity: number | null } {
  const fuel = json.fuel as Record<string, unknown> | null | undefined;
  if (!fuel) return { quantity: null, maxCapacity: null };
  const quantity    = fuel.quantity    != null ? parseInt(String(fuel.quantity),    10) : null;
  const maxCapacity = fuel.max_capacity != null ? parseInt(String(fuel.max_capacity), 10) : null;
  return {
    quantity:    Number.isNaN(quantity)    ? null : quantity,
    maxCapacity: Number.isNaN(maxCapacity) ? null : maxCapacity,
  };
}

export function FuelGauge() {
  const { data: character } = useCharacter();
  const assemblyId = character?.json.metadata.assembly_id ?? null;

  const { data: nnObject, isLoading, error } = useObjectWithDynamicFields(assemblyId);

  const { quantity: fuel, maxCapacity } = useMemo(
    () => (nnObject ? parseFuel(nnObject.json) : { quantity: null, maxCapacity: null }),
    [nnObject],
  );

  const maxRef  = maxCapacity ?? 100_000;
  const pct     = fuel != null ? Math.min(100, (fuel / maxRef) * 100) : null;
  const isLow   = pct != null && pct < 20;
  const isMid   = pct != null && pct >= 20 && pct < 50;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <SvgIcon src="/assets/fuel.svg" size={22} />
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H}, 20%, 65%, 0.55)` }}>FUEL</div>
            <div className="text-sm font-medium" style={{ color: `hsla(${MARTIAN_H}, 20%, 75%, 0.7)` }}>Network Node</div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          {isLoading && (
            <div className="flex items-center justify-center min-h-[80px] text-[rgba(250,250,229,0.6)] text-sm">
              Loading…
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center min-h-[80px] text-red-400 text-sm">
              {error.message}
            </div>
          )}
          {!assemblyId && !isLoading && !error && (
            <div className="text-[rgba(250,250,229,0.6)] text-sm">No assembly linked.</div>
          )}
          {assemblyId && !isLoading && !error && !nnObject && (
            <div className="text-[rgba(250,250,229,0.4)] text-sm">Node not found on chain.</div>
          )}
          {nnObject && (
            <>
              <div className="text-2xl font-bold font-mono" style={{ color: `hsla(${MARTIAN_H}, 25%, 88%, 0.95)` }}>
                {fuel != null ? fuel.toLocaleString() : "—"}
              </div>

              <div
                className={cn("h-3 rounded-[6px] overflow-hidden", isLow && "[box-shadow:0_0_12px_hsla(0,70%,50%,0.4)]")}
                style={{ background: `hsla(${MARTIAN_H}, 20%, 18%, 0.6)` }}
              >
                <div
                  style={{
                    width: pct != null ? `${pct}%` : "0%",
                    height: "100%",
                    borderRadius: 6,
                    background: isLow
                      ? "linear-gradient(90deg, hsl(0,65%,45%), hsl(25,80%,50%))"
                      : isMid
                        ? "linear-gradient(90deg, hsl(45,85%,45%), hsl(55,90%,50%))"
                        : "linear-gradient(90deg, hsl(140,55%,40%), hsl(95,60%,45%))",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {fuel != null && (
                <div className="text-xs" style={{ color: `hsla(${MARTIAN_H}, 15%, 55%, 0.8)` }}>
                  {pct != null ? `${pct.toFixed(0)}% · ${maxRef.toLocaleString()} cap` : "Fuel units"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
