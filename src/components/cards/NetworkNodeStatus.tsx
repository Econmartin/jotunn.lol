/*
 * Network Node Status — READ card. Network Node object(s) → dynamic fields.
 */

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { fetchObjectWithDynamicFields, type ObjectWithDynamicFields } from "../../hooks/useObjectWithDynamicFields";
import { SUISCAN_BASE } from "../../lib/constants";
import { GlassCard } from "../GlassCard";

function isNetworkNode(type: string, typeName: string): boolean {
  const combined = `${type} ${typeName}`.toLowerCase();
  return combined.includes("networknode") || combined.includes("network_node");
}

function NodeCard({ obj }: { obj: ObjectWithDynamicFields | null }) {
  if (!obj) return null;
  const name = (obj.json?.metadata as { name?: string } | undefined)?.name ?? obj.address.slice(0, 10) + "…";
  const production = (obj.json as Record<string, unknown>).production_on ?? (obj.json as Record<string, unknown>).is_producing;
  const fuelField = obj.dynamicFields.find(
    (f) =>
      JSON.stringify(f.name?.json ?? "").toLowerCase().includes("fuel") ||
      (f.name?.type?.repr ?? "").toLowerCase().includes("fuel"),
  );
  const fuelVal = fuelField?.contents?.json;
  const fuel = typeof fuelVal === "number" ? fuelVal : (fuelVal as Record<string, unknown>)?.value ?? (fuelVal as Record<string, unknown>)?.balance;

  return (
    <div
      style={{
        padding: "8px 10px",
        background: "hsla(45, 25%, 12%, 0.4)",
        borderRadius: 6,
        border: "1px solid hsla(45, 30%, 30%, 0.25)",
        marginBottom: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "hsla(45, 20%, 85%, 0.95)" }}>{name}</span>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: production ? "hsl(140, 60%, 50%)" : "hsla(0, 0%, 50%, 0.5)",
          }}
          title={production ? "Producing" : "Off"}
        />
      </div>
      <div style={{ fontSize: 10, color: "hsla(45, 15%, 60%, 0.85)" }}>
        Fuel: {fuel != null ? String(fuel) : "—"} · v{obj.version}
      </div>
      <a
        href={`${SUISCAN_BASE}/object/${obj.address}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 10, color: "hsla(45, 60%, 60%, 0.9)" }}
      >
        View on Suiscan
      </a>
    </div>
  );
}

export function NetworkNodeStatus() {
  const { data: objects, isLoading, error } = useOwnedObjects();
  const nnAddresses = useMemo(() => {
    if (!objects) return [];
    return objects.filter((o) => isNetworkNode(o.type, o.typeName)).map((o) => o.address);
  }, [objects]);

  const queries = useQueries({
    queries: nnAddresses.map((address) => ({
      queryKey: ["object-with-dynamic-fields", address],
      queryFn: () => fetchObjectWithDynamicFields(address),
      enabled: !!address,
    })),
  });

  const nodes = queries.map((q) => q.data).filter(Boolean) as ObjectWithDynamicFields[];

  return (
    <GlassCard accentH={45} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(45, 50%, 30%, 0.5)",
            border: "1px solid hsla(45, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🔋</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(45, 20%, 65%, 0.55)" }}>NETWORK NODE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(45, 20%, 75%, 0.7)" }}>Node status</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {isLoading && <div className="card-loading">Loading nodes...</div>}
          {error && <div className="card-error">Error: {error.message}</div>}
          {!isLoading && !error && nnAddresses.length === 0 && (
            <p className="text-muted">No Network Nodes found.</p>
          )}
          {queries.some((q) => q.isLoading) && nnAddresses.length > 0 && nodes.length === 0 && (
            <div className="card-loading">Loading node details...</div>
          )}
          {nodes.map((obj) => (
            <NodeCard key={obj.address} obj={obj} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
