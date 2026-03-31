/**
 * @card Inventory
 * @description Cargo hold contents from the StorageUnit object.
 *   Fetches: wallet-owned StorageUnit → dynamic fields (containers) → items.
 *   Type names resolved via: https://world-api-stillness.live.tech.evefrontier.com/v2/types/{id}
 *
 *   Collapsed: capacity bar + item count + top item names.
 *   Expanded:  table with Name, Group, Qty, Vol/u, Total — sorted by total volume.
 */

import { useState, useEffect, useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H, SUISCAN_BASE } from "../../lib/constants";
import { useInventory } from "../../hooks/useInventory";
import { getGameTypeInfo, type GameTypeInfo } from "../../lib/datahub";

function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M m³`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}k m³`;
  return `${v} m³`;
}

export function Inventory() {
  const isExpanded = useContext(CardExpandedContext);
  const { storageInfo, isLoading, error, storageUnitAddr } = useInventory();

  // Resolve type names from the EVE Frontier API
  const [typeNames, setTypeNames] = useState<Record<string, GameTypeInfo | null>>({});

  const allItems = storageInfo?.containers.flatMap((c) => c.items) ?? [];

  // Merge same typeId across containers
  const mergedItems = Object.values(
    allItems.reduce<Record<string, { typeId: string; quantity: number; volume: number; totalVol: number }>>(
      (acc, item) => {
        if (acc[item.typeId]) {
          acc[item.typeId].quantity += item.quantity;
          acc[item.typeId].totalVol += item.totalVol;
        } else {
          acc[item.typeId] = { typeId: item.typeId, quantity: item.quantity, volume: item.volume, totalVol: item.totalVol };
        }
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.totalVol - a.totalVol);

  // Fetch type names for all unique typeIds (batched, cached in datahub.ts)
  useEffect(() => {
    if (mergedItems.length === 0) return;
    const unresolved = mergedItems.filter((i) => !(i.typeId in typeNames));
    if (unresolved.length === 0) return;

    Promise.allSettled(
      unresolved.map((i) =>
        getGameTypeInfo(parseInt(i.typeId, 10)).then((info) => ({ typeId: i.typeId, info })),
      ),
    ).then((results) => {
      const updates: Record<string, GameTypeInfo | null> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          updates[r.value.typeId] = r.value.info;
        }
      }
      setTypeNames((prev) => ({ ...prev, ...updates }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedItems.length]);

  const volPct = storageInfo && storageInfo.maxVolume > 0
    ? Math.min(100, (storageInfo.totalVolume / storageInfo.maxVolume) * 100)
    : null;
  const isNearFull = volPct != null && volPct > 80;

  const statusRaw   = storageInfo?.status?.toUpperCase();
  const statusColor = statusRaw?.includes("ONLINE") ? "#4ade80" : statusRaw?.includes("OFFLINE") ? "#f87171" : "rgba(250,250,229,0.4)";

  const capBar = (height: string) => volPct != null ? (
    <div className={`${height} rounded overflow-hidden`} style={{ background: `hsla(${MARTIAN_H},20%,18%,0.6)` }}>
      <div style={{
        width: `${volPct}%`, height: "100%", transition: "width 0.3s ease",
        background: isNearFull
          ? "linear-gradient(90deg, hsl(0,65%,45%), hsl(25,80%,50%))"
          : "linear-gradient(90deg, hsl(140,55%,40%), hsl(95,60%,45%))",
      }} />
    </div>
  ) : null;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `hsla(${MARTIAN_H},50%,28%,0.5)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
          >
            📦
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>
              CARGO HOLD
            </div>
            {isExpanded && storageUnitAddr && (
              <a
                href={`${SUISCAN_BASE}/object/${storageUnitAddr}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[10px] truncate block"
                style={{ color: `hsla(${MARTIAN_H},70%,65%,0.6)` }}
              >
                {storageUnitAddr.slice(0, 12)}…
              </a>
            )}
          </div>
          {storageInfo?.status && (
            <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border shrink-0"
                  style={{ color: statusColor, borderColor: statusColor + "55" }}>
              {statusRaw}
            </span>
          )}
        </div>

        {/* Loading / error / not found */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>
            Loading…
          </div>
        )}
        {error && <div className="text-xs text-red-400/70">{error.message}</div>}
        {!isLoading && !storageUnitAddr && !error && (
          <div className="flex-1 flex items-center justify-center text-xs text-center" style={{ color: "rgba(250,250,229,0.25)" }}>
            No StorageUnit found in wallet or events
          </div>
        )}

        {/* Collapsed */}
        {storageInfo && !isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold font-mono" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                {storageInfo.totalItems.toLocaleString()}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(250,250,229,0.35)" }}>
                items · {mergedItems.length} types
              </span>
            </div>
            {capBar("h-1.5")}
            <div className="flex justify-between text-[9px]">
              <span style={{ color: "rgba(250,250,229,0.25)" }}>{fmtVol(storageInfo.totalVolume)} used</span>
              <span style={{ color: "rgba(250,250,229,0.2)" }}>{fmtVol(storageInfo.maxVolume)} cap</span>
            </div>
            {/* Top 2 items with names */}
            {mergedItems.slice(0, 2).map((item) => {
              const info = typeNames[item.typeId];
              return (
                <div key={item.typeId} className="flex justify-between text-[10px]">
                  <span className="truncate" style={{ color: "rgba(250,250,229,0.5)" }}>
                    {info ? info.name : `#${item.typeId}`}
                  </span>
                  <span className="font-mono ml-2 shrink-0" style={{ color: "rgba(250,250,229,0.35)" }}>
                    ×{item.quantity.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Expanded */}
        {storageInfo && isExpanded && (
          <div className="flex-1 flex flex-row gap-4 min-h-0">

            {/* Left: capacity summary */}
            <div className="flex flex-col gap-2 shrink-0" style={{ flex: "0 0 130px" }}>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(250,250,229,0.2)" }}>Capacity</div>
              {capBar("h-1.5")}
              {volPct != null && (
                <>
                  <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,229,0.6)" }}>
                    {fmtVol(storageInfo.totalVolume)}
                  </div>
                  <div className="text-[9px]" style={{ color: "rgba(250,250,229,0.25)" }}>
                    of {fmtVol(storageInfo.maxVolume)}
                  </div>
                </>
              )}
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                <div className="text-[9px] tracking-widest uppercase mb-1" style={{ color: "rgba(250,250,229,0.2)" }}>Items</div>
                <div className="text-xl font-bold font-mono" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                  {storageInfo.totalItems.toLocaleString()}
                </div>
                <div className="text-[9px]" style={{ color: "rgba(250,250,229,0.3)" }}>
                  {mergedItems.length} type{mergedItems.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="mt-auto text-[9px]" style={{ color: "rgba(250,250,229,0.15)" }}>
                {storageInfo.containers.length} container{storageInfo.containers.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Right: item table with resolved names */}
            <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-4 overflow-auto">
              {mergedItems.length === 0 ? (
                <div className="text-[10px] text-white/25 italic">No items in cargo hold</div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid gap-x-3 mb-1.5 pb-1 border-b border-white/[0.06]"
                       style={{ gridTemplateColumns: "1fr auto auto auto auto" }}>
                    <span className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(250,250,229,0.2)" }}>Name</span>
                    <span className="text-[9px] tracking-widest uppercase text-right" style={{ color: "rgba(250,250,229,0.2)" }}>Group</span>
                    <span className="text-[9px] tracking-widest uppercase text-right" style={{ color: "rgba(250,250,229,0.2)" }}>Qty</span>
                    <span className="text-[9px] tracking-widest uppercase text-right" style={{ color: "rgba(250,250,229,0.2)" }}>m³/u</span>
                    <span className="text-[9px] tracking-widest uppercase text-right" style={{ color: "rgba(250,250,229,0.2)" }}>Total</span>
                  </div>
                  {mergedItems.map((item) => {
                    const info = typeNames[item.typeId];
                    const pending = !(item.typeId in typeNames);
                    return (
                      <div
                        key={item.typeId}
                        className="grid gap-x-3 py-0.5 border-b border-white/[0.03] items-baseline"
                        style={{ gridTemplateColumns: "1fr auto auto auto auto" }}
                      >
                        <span className="text-[10px] truncate" style={{ color: pending ? "rgba(250,250,229,0.3)" : info ? "rgba(250,250,229,0.75)" : `hsla(${MARTIAN_H},50%,60%,0.6)` }}>
                          {pending ? "…" : info ? info.name : `#${item.typeId}`}
                        </span>
                        <span className="text-[9px] text-right truncate max-w-[80px]" style={{ color: "rgba(250,250,229,0.3)" }}>
                          {info?.groupName ?? ""}
                        </span>
                        <span className="text-[10px] font-mono text-right" style={{ color: "rgba(250,250,229,0.7)" }}>
                          {item.quantity.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono text-right" style={{ color: "rgba(250,250,229,0.3)" }}>
                          {item.volume}
                        </span>
                        <span className="text-[10px] font-mono text-right" style={{ color: "rgba(250,250,229,0.5)" }}>
                          {fmtVol(item.totalVol)}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
