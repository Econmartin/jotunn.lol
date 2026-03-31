/**
 * @card NetworkNode
 * @description Full display of the linked Network Node object.
 *   Collapsed: fuel bar + burn status + energy dot.
 *   Expanded:  two-column — fuel/energy gauges (left) + all fields (right).
 *
 * @dataflow
 *   useCharacter() → metadata.assembly_id → useObjectWithDynamicFields(assemblyId)
 *   → fuel quantity/capacity/burn rate, energy production, all other fields
 */

import { useMemo, useContext } from "react";
import { useObjectWithDynamicFields } from "../../hooks/useObjectWithDynamicFields";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H, SUISCAN_BASE, JOTUNN, FUEL_RATES } from "../../lib/constants";

// ── Parsers ───────────────────────────────────────────────────────────────────

function toInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") { const n = parseInt(v, 10); return Number.isNaN(n) ? null : n; }
  return null;
}

interface FuelInfo {
  quantity:       number | null;
  maxCapacity:    number | null;
  burnRateMs:     number | null; // ms per tick (= 1hr)
  fuelTypeId:     string | null;
  isBurning:      boolean;
  burnStartTime:  number | null; // epoch ms of last on-chain write
  prevElapsedMs:  number | null;
}

function parseFuel(json: Record<string, unknown>): FuelInfo {
  const f = json.fuel as Record<string, unknown> | null | undefined;
  if (!f) return { quantity: null, maxCapacity: null, burnRateMs: null, fuelTypeId: null, isBurning: false, burnStartTime: null, prevElapsedMs: null };
  return {
    quantity:      toInt(f.quantity),
    maxCapacity:   toInt(f.max_capacity),
    burnRateMs:    toInt(f.burn_rate_in_ms),
    fuelTypeId:    f.type_id != null ? String(f.type_id) : null,
    isBurning:     f.is_burning === true || f.is_burning === "true",
    burnStartTime: toInt(f.burn_start_time),
    prevElapsedMs: toInt(f.previous_cycle_elapsed_time),
  };
}

interface EnergyInfo {
  current: number | null;
  max:     number | null;
  reserved: number | null;
}

function parseEnergy(json: Record<string, unknown>): EnergyInfo {
  const e = json.energy_source as Record<string, unknown> | null | undefined;
  if (!e) return { current: null, max: null, reserved: null };
  return {
    current:  toInt(e.current_energy_production),
    max:      toInt(e.max_energy_production),
    reserved: toInt(e.total_reserved_energy),
  };
}

function parseStatus(json: Record<string, unknown>): { label: string; color: string } | null {
  const raw = json.status ?? json.assembly_status ?? json.state;
  if (!raw) return null;
  const s = typeof raw === "object" ? ((raw as Record<string, unknown>)["@variant"] ?? JSON.stringify(raw)) : String(raw);
  const upper = String(s).toUpperCase();
  if (upper.includes("ONLINE") || upper.includes("ACTIVE")) return { label: upper, color: "#4ade80" };
  if (upper.includes("OFFLINE") || upper.includes("INACTIVE")) return { label: upper, color: "#f87171" };
  return { label: upper, color: "rgba(250,250,229,0.5)" };
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "< 1m";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 1) return `${d}d`;
  if (d === 1) return `1d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatFieldValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

// Keys rendered as dedicated gauges — skip in the raw field list
const SKIP_KEYS = new Set(["id", "fuel", "energy_source"]);

// ── Component ─────────────────────────────────────────────────────────────────

export function FuelGauge() {
  const isExpanded = useContext(CardExpandedContext);
  const assemblyId = JOTUNN.networkNodeId;

  const { data: nnObject, isLoading, error } = useObjectWithDynamicFields(assemblyId);

  const { quantity: fuel, maxCapacity, burnRateMs, fuelTypeId, isBurning, burnStartTime, prevElapsedMs } = useMemo(
    () => (nnObject ? parseFuel(nnObject.json) : { quantity: null, maxCapacity: null, burnRateMs: null, fuelTypeId: null, isBurning: false, burnStartTime: null, prevElapsedMs: null }),
    [nnObject],
  );

  // Units consumed per tick (1hr tick). Fuel type determines this, not connected buildings.
  const ratePerHour = fuelTypeId ? (FUEL_RATES[fuelTypeId] ?? 1) : 1;
  const energy = useMemo(() => (nnObject ? parseEnergy(nnObject.json) : { current: null, max: null, reserved: null }), [nnObject]);
  const status = nnObject ? parseStatus(nnObject.json) : null;


  const maxRef = maxCapacity ?? 100_000;
  const fuelPct = fuel != null ? Math.min(100, (fuel / maxRef) * 100) : null;
  const isLow   = fuelPct != null && fuelPct < 20;
  const isMid   = fuelPct != null && fuelPct >= 20 && fuelPct < 50;

  const energyPct = energy.current != null && energy.max ? Math.round((energy.current / energy.max) * 100) : null;

  // Depletion ETA
  // burn_rate_in_ms = tick interval (1hr). ratePerHour units consumed per tick.
  // On-chain quantity is lazily written at burn_start_time — account for elapsed.
  const depletionMs = useMemo(() => {
    if (!isBurning || fuel == null || !burnRateMs) return null;
    const elapsed = burnStartTime ? Math.max(0, Date.now() - burnStartTime) : (prevElapsedMs ?? 0);
    const unitsConsumed = (elapsed / burnRateMs) * ratePerHour;
    const actualFuel = Math.max(0, fuel - unitsConsumed);
    if (actualFuel <= 0) return 0;
    return (actualFuel / ratePerHour) * burnRateMs;
  }, [isBurning, fuel, burnRateMs, burnStartTime, prevElapsedMs, ratePerHour]);

  const extraFields = useMemo(() => {
    if (!nnObject) return [];
    return Object.entries(nnObject.json).filter(([k]) => !SKIP_KEYS.has(k));
  }, [nnObject]);

  const header = (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: `hsla(${MARTIAN_H}, 50%, 30%, 0.5)`, border: `1px solid hsla(${MARTIAN_H}, 50%, 50%, 0.25)` }}
      >🔌</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H}, 20%, 65%, 0.55)` }}>NETWORK NODE</div>
        <div className="text-xs font-medium truncate" style={{ color: `hsla(${MARTIAN_H}, 20%, 75%, 0.7)` }}>
          {assemblyId ? assemblyId.slice(0, 10) + "…" : "Not linked"}
        </div>
      </div>
      {status && isExpanded && (
        <span
          className="ml-auto text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border shrink-0"
          style={{ color: status.color, borderColor: status.color + "55" }}
        >
          {status.label}
        </span>
      )}
    </div>
  );

  // Fuel gauge bar
  const fuelBar = fuel != null ? (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span style={{ color: `hsla(${MARTIAN_H}, 25%, 88%, 0.95)` }}>{fuel.toLocaleString()}</span>
        {fuelPct != null && <span style={{ color: "rgba(250,250,229,0.4)" }}>{fuelPct.toFixed(0)}%</span>}
      </div>
      <div
        className="h-2 rounded overflow-hidden"
        style={{ background: `hsla(${MARTIAN_H}, 20%, 18%, 0.6)`, boxShadow: isLow ? "0 0 10px hsla(0,70%,50%,0.3)" : "none" }}
      >
        <div
          style={{
            width: fuelPct != null ? `${fuelPct}%` : "0%",
            height: "100%",
            background: isLow
              ? "linear-gradient(90deg, hsl(0,65%,45%), hsl(25,80%,50%))"
              : isMid
                ? "linear-gradient(90deg, hsl(45,85%,45%), hsl(55,90%,50%))"
                : "linear-gradient(90deg, hsl(140,55%,40%), hsl(95,60%,45%))",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] mt-0.5">
        <span style={{ color: `hsla(${MARTIAN_H}, 15%, 55%, 0.6)` }}>
          FUEL · {maxRef.toLocaleString()} cap
        </span>
        {isBurning && depletionMs != null && (
          <span style={{ color: isLow ? "#f87171" : "rgba(250,250,229,0.35)" }}>
            ~{formatDuration(depletionMs)} left
          </span>
        )}
        {!isBurning && (
          <span style={{ color: "rgba(250,250,229,0.2)" }}>not burning</span>
        )}
      </div>
    </div>
  ) : null;

  // Energy bar (small)
  const energyBar = energyPct != null ? (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span style={{ color: "rgba(250,250,229,0.4)" }}>ENERGY</span>
        <span className="font-mono" style={{ color: energyPct > 0 ? "#60a5fa" : "rgba(250,250,229,0.25)" }}>
          {energy.current?.toLocaleString() ?? "—"} / {energy.max?.toLocaleString() ?? "—"}
        </span>
      </div>
      <div className="h-1.5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          style={{
            width: `${energyPct}%`,
            height: "100%",
            background: energyPct > 0
              ? "linear-gradient(90deg, hsl(220,80%,45%), hsl(200,90%,55%))"
              : "transparent",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  ) : null;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">
        {header}

        {isLoading && (
          <div className="flex items-center justify-center flex-1 text-xs" style={{ color: "rgba(250,250,229,0.4)" }}>
            Loading…
          </div>
        )}
        {error && <div className="text-xs text-red-400/70">{error.message}</div>}
        {!assemblyId && !isLoading && !error && (
          <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>
            No Network Node linked to this character.
          </div>
        )}

        {/* Collapsed */}
        {nnObject && !isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            {fuelBar ?? <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>Fuel data unavailable</div>}
            {energyBar}
          </div>
        )}

        {/* Expanded */}
        {nnObject && isExpanded && (
          <div className="flex-1 flex flex-row gap-4 min-h-0">
            {/* Left: gauges */}
            <div className="flex flex-col justify-center gap-3 shrink-0" style={{ flex: "0 0 155px" }}>
              {fuelBar ?? <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>Fuel unavailable</div>}
              {energyBar}
              {burnRateMs && (
                <div className="text-[9px]" style={{ color: "rgba(250,250,229,0.2)" }}>
                  Burn rate: {ratePerHour}/hr
                </div>
              )}
            </div>

            {/* Right: all other fields */}
            <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-4 overflow-auto flex flex-col gap-0.5">
              <a
                href={`${SUISCAN_BASE}/object/${assemblyId}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[10px] break-all mb-1.5 block"
                style={{ color: `hsla(${MARTIAN_H}, 70%, 65%, 0.7)` }}
              >
                {assemblyId}
              </a>
              {extraFields.map(([key, val]) => (
                <div key={key} className="flex justify-between gap-2 py-px border-b border-white/[0.04]">
                  <span className="text-[10px] shrink-0" style={{ color: "rgba(250,250,229,0.4)" }}>{key}</span>
                  <span className="text-[10px] text-right break-all font-mono" style={{ color: "rgba(250,250,229,0.75)" }}>
                    {formatFieldValue(val)}
                  </span>
                </div>
              ))}
              {extraFields.length === 0 && (
                <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.3)" }}>No additional fields.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
