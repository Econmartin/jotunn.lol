/*
 * Assembly Status — READ card. useOwnedObjects filtered to assembly types.
 */

import { useMemo } from "react";
import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { SUISCAN_BASE } from "../../lib/constants";
import type { OwnedObject } from "../../lib/types";
import { GlassCard } from "../GlassCard";

const ASSEMBLY_TYPE_SUBSTRINGS = ["SmartGate", "SSU", "Turret", "NetworkNode", "Smart Gate", "Network Node"];

function isAssemblyType(type: string, typeName: string): boolean {
  const combined = `${type} ${typeName}`.toLowerCase();
  return ASSEMBLY_TYPE_SUBSTRINGS.some(
    (s) => combined.includes(s.toLowerCase().replace(/\s/g, "")) || combined.includes(s.toLowerCase())
  );
}

function getTypeIcon(typeName: string): string {
  if (typeName.toLowerCase().includes("network")) return "🔌";
  if (typeName.toLowerCase().includes("gate")) return "🚪";
  if (typeName.toLowerCase().includes("ssu") || typeName.toLowerCase().includes("storage")) return "📦";
  if (typeName.toLowerCase().includes("turret")) return "🔫";
  return "🏗️";
}

function getStatusColor(obj: OwnedObject): "green" | "amber" | "red" | "gray" {
  const j = obj.json as Record<string, unknown>;
  const status = (j?.status as string)?.toLowerCase?.();
  const isOnline = j?.is_online ?? j?.online;
  const anchored = j?.anchored;
  if (status === "online" || isOnline === true) return "green";
  if (status === "anchored" || anchored === true) return "amber";
  if (status === "offline" || isOnline === false) return "red";
  return "gray";
}

export function AssemblyStatus() {
  const { data: objects, isLoading, error } = useOwnedObjects();

  const assemblies = useMemo(() => {
    if (!objects) return [];
    return objects.filter((o) => isAssemblyType(o.type, o.typeName));
  }, [objects]);

  return (
    <GlassCard accentH={185} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(185, 50%, 30%, 0.5)",
            border: "1px solid hsla(185, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🏗️</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(185, 20%, 65%, 0.55)" }}>ASSEMBLIES</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(185, 20%, 75%, 0.7)" }}>Assembly status</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {isLoading && <div className="card-loading">Loading assemblies...</div>}
          {error && <div className="card-error">Error: {error.message}</div>}
          {!isLoading && !error && assemblies.length === 0 && (
            <p className="text-muted">No assemblies found.</p>
          )}
          {assemblies.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assemblies.map((obj) => {
                const statusColor = getStatusColor(obj);
                const name = (obj.json as { metadata?: { name?: string } })?.metadata?.name ?? obj.typeName;
                return (
                  <div
                    key={obj.address}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: "hsla(185, 25%, 12%, 0.4)",
                      borderRadius: 6,
                      border: "1px solid hsla(185, 30%, 30%, 0.25)",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{getTypeIcon(obj.typeName)}</span>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background:
                          statusColor === "green"
                            ? "hsl(140, 60%, 50%)"
                            : statusColor === "amber"
                              ? "hsl(45, 90%, 50%)"
                              : statusColor === "red"
                                ? "hsl(0, 65%, 50%)"
                                : "hsla(0, 0%, 50%, 0.5)",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(210, 20%, 85%, 0.9)" }}>{name}</div>
                      <div style={{ fontSize: 10, color: "hsla(210, 15%, 60%, 0.7)" }}>{obj.typeName} · v{obj.version}</div>
                    </div>
                    <a
                      href={`${SUISCAN_BASE}/object/${obj.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 10, color: "hsla(185, 60%, 65%, 0.9)" }}
                    >
                      View
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
