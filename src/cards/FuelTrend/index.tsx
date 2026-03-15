/**
 * @card FuelTrend
 * @description Sparkline of fuel readings over time from the snapshot Worker.
 *   Shows last 24h (288 readings at 5-min intervals), depletion rate,
 *   and estimated time-to-empty.
 *
 * @dataflow
 *   Cloudflare Worker cron → D1 snapshots → /api/history/fuel → FuelTrend
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { SvgIcon } from "../../components/SvgIcon";
import { useFuelTrend, type FuelReading } from "./hook";
import { MARTIAN_H } from "../../lib/constants";
import { SvgIcon } from "../../components/SvgIcon";

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ readings }: { readings: FuelReading[] }) {
  const W = 200;
  const SH = 48;
  if (readings.length < 2) return (
    <div className="flex items-center justify-center h-12 text-xs text-white/20 font-mono">
      collecting data…
    </div>
  );

  const vals = readings.map((r) => r.fuel);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const range = max - min || 1;
  const n = readings.length;

  const pts = readings
    .map((r, i) => {
      const x = (i / (n - 1)) * W;
      const y = SH - ((r.fuel - min) / range) * (SH - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Fill area under the line
  const firstX = 0;
  const lastX  = W;
  const fillPts = `${firstX},${SH} ${pts} ${lastX},${SH}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${SH}`}
      className="w-full"
      style={{ height: SH }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="fuel-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={`hsla(${MARTIAN_H},90%,55%,0.25)`} />
          <stop offset="100%" stopColor={`hsla(${MARTIAN_H},90%,55%,0.0)`} />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#fuel-fill)" />
      <polyline
        points={pts}
        fill="none"
        stroke={`hsla(${MARTIAN_H},90%,60%,0.7)`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Rate calculation ──────────────────────────────────────────────────────────

function calcRate(readings: FuelReading[]): { perHour: number | null; hoursLeft: number | null } {
  if (readings.length < 2) return { perHour: null, hoursLeft: null };

  // Use a window of up to the last 12 readings (~1 hour) for rate
  const window = readings.slice(-12);
  const oldest = window[0];
  const newest = window[window.length - 1];
  const dtMs   = newest.ts - oldest.ts;
  if (dtMs <= 0) return { perHour: null, hoursLeft: null };

  const dFuel  = oldest.fuel - newest.fuel; // positive = burning
  const perHour = (dFuel / dtMs) * 3_600_000;
  const hoursLeft = perHour > 0 ? newest.fuel / perHour : null;

  return { perHour, hoursLeft };
}

function fmtDuration(hours: number): string {
  if (hours >= 48) return `${Math.round(hours / 24)}d`;
  if (hours >= 1)  return `${Math.round(hours)}h`;
  return `${Math.round(hours * 60)}m`;
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function FuelTrend() {
  const isExpanded = useContext(CardExpandedContext);
  const { data: readings, isLoading, error } = useFuelTrend(isExpanded ? 576 : 288);

  const latest     = readings && readings.length > 0 ? readings[readings.length - 1].fuel : null;
  const { perHour, hoursLeft } = readings ? calcRate(readings) : { perHour: null, hoursLeft: null };
  const hasData    = readings && readings.length > 0;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <SvgIcon src="/assets/fuel_trend.svg" size={22} />
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H},20%,65%,0.5)` }}>
              FUEL TREND
            </div>
            <div className="text-xs font-medium" style={{ color: `hsla(${MARTIAN_H},20%,72%,0.7)` }}>
              {isLoading ? "Loading…" : hasData ? `${(readings?.length ?? 0)} readings` : "No data yet"}
            </div>
          </div>
          {hoursLeft !== null && (
            <div className="ml-auto text-right shrink-0">
              <div className="text-xs uppercase tracking-widest text-white/25">empty in</div>
              <div
                className="text-sm font-bold font-mono"
                style={{ color: hoursLeft < 24 ? "hsla(0,80%,65%,0.9)" : hoursLeft < 72 ? "hsla(40,90%,65%,0.9)" : "hsla(120,60%,55%,0.8)" }}
              >
                {fmtDuration(hoursLeft)}
              </div>
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="flex-1 flex flex-col justify-end gap-1.5 min-h-0">
          {error && (
            <div className="text-xs text-red-400/70 font-mono">Worker not reachable</div>
          )}
          {!error && !isLoading && !hasData && (
            <div className="text-xs text-white/20 font-mono">
              Start the Worker to collect readings
            </div>
          )}
          {hasData && <Sparkline readings={readings!} />}

          {/* Stats row */}
          {hasData && (
            <div className="flex gap-4 text-xs font-mono shrink-0">
              {latest !== null && (
                <span style={{ color: `hsla(${MARTIAN_H},40%,65%,0.8)` }}>
                  now <span className="text-white/70">{latest.toLocaleString()}</span>
                </span>
              )}
              {perHour !== null && perHour > 0 && (
                <span className="text-white/30">
                  −{perHour.toFixed(0)}/h
                </span>
              )}
              {isExpanded && readings && (
                <span className="ml-auto text-white/20">
                  {readings.length} pts · {Math.round((readings[readings.length - 1].ts - readings[0].ts) / 3_600_000)}h window
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
