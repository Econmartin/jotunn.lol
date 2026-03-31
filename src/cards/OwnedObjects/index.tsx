/**
 * @card OwnedObjects
 * @description Grid of world-package objects owned by the wallet.
 *   Collapsed: header + count.
 *   Expanded: owned objects + inferred objects from character dynamic fields and events.
 */

import { useContext, useMemo } from "react";
import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { useEvents } from "../../hooks/useEvents";
import { useObjectWithDynamicFields } from "../../hooks/useObjectWithDynamicFields";
import { SUISCAN_BASE, MARTIAN_H, JOTUNN } from "../../lib/constants";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";

const H = MARTIAN_H;
const FIELD   = { display: "flex", justifyContent: "space-between", gap: 8, padding: "2px 0", lineHeight: 1.4 } as const;
const F_LABEL = { color: "rgba(250,250,229,0.5)", whiteSpace: "nowrap" as const, flexShrink: 0, fontSize: "10px" };
const F_VALUE = { textAlign: "right" as const, wordBreak: "break-all" as const, color: "#FAFAE5", fontSize: "10px" };

const INFERRED_EVENT_TYPES = [
  "StorageUnitCreatedEvent",
  "NetworkNodeCreatedEvent",
  "OwnerCapCreatedEvent",
];

interface InferredRef {
  label: string;
  id: string;
  source: string;
}

export function OwnedObjects() {
  const { data: objects, isLoading, error } = useOwnedObjects();
  const isExpanded = useContext(CardExpandedContext);

  const { data: events } = useEvents();
  const { data: charObject } = useObjectWithDynamicFields(JOTUNN.characterId);

  // Build inferred references from events and character dynamic fields
  const inferredRefs = useMemo((): InferredRef[] => {
    const refs: InferredRef[] = [];

    // From events
    if (events) {
      for (const ev of events) {
        if (!INFERRED_EVENT_TYPES.includes(ev.eventTypeName)) continue;
        const j = ev.json as Record<string, unknown>;
        const id = (j.assembly_id ?? j.object_id ?? j.owner_cap_id ?? j.id) as string | undefined;
        if (id && typeof id === "string") {
          refs.push({ label: ev.eventTypeName.replace("Event", ""), id, source: "event" });
        }
      }
    }

    // From character dynamic fields
    if (charObject?.dynamicFields) {
      for (const df of charObject.dynamicFields) {
        const name = typeof df.name?.json === "string" ? df.name.json : JSON.stringify(df.name?.json ?? "");
        const val = df.contents?.json as Record<string, unknown> | undefined;
        if (val && typeof val === "object") {
          const id = (val.id ?? val.assembly_id ?? val.object_id) as string | undefined;
          if (id && typeof id === "string" && id.startsWith("0x")) {
            refs.push({ label: `DynField: ${name}`, id, source: "character" });
          }
        }
      }
    }

    // Deduplicate by id
    const seen = new Set<string>();
    return refs.filter((r) => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  }, [events, charObject]);

  const header = (
    <div className="flex items-center gap-2 shrink-0">
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `hsla(${H}, 50%, 30%, 0.5)`,
        border: `1px solid hsla(${H}, 50%, 50%, 0.25)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>📦</div>
      <div>
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${H}, 20%, 65%, 0.55)` }}>OBJECTS</div>
        <div className="text-sm font-medium" style={{ color: `hsla(${H}, 20%, 75%, 0.7)` }}>
          Owned objects{objects ? ` · ${objects.length}` : ""}
        </div>
      </div>
    </div>
  );

  return (
    <GlassCard accentH={H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {!isExpanded ? (
          <div className="h-full flex flex-col justify-center gap-2">
            {header}
            {isLoading && <div className="text-xs" style={{ color: "rgba(250,250,229,0.4)" }}>Loading…</div>}
            {error    && <div className="text-xs text-red-400">Error: {error.message}</div>}
            {objects && (
              <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>
                {objects.length === 0 ? "No objects found" : `${objects.length} wallet-owned · ${inferredRefs.length} referenced · click to inspect`}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-row gap-4">
            <div className="flex flex-col gap-2 justify-start pt-1 shrink-0" style={{ flex: "0 0 160px" }}>
              {header}
              {isLoading && <div className="text-xs" style={{ color: "rgba(250,250,229,0.4)" }}>Loading…</div>}
              {error    && <div className="text-xs text-red-400">Error: {error.message}</div>}
              {objects && <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>{objects.length} wallet-owned</div>}
              {inferredRefs.length > 0 && (
                <div className="text-xs" style={{ color: "rgba(250,250,229,0.25)" }}>{inferredRefs.length} referenced</div>
              )}
            </div>

            <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-4 overflow-auto">
              {/* Wallet-owned objects */}
              {objects && objects.length === 0 && (
                <div className="text-xs mb-3" style={{ color: "rgba(250,250,229,0.4)" }}>No wallet-owned world-package objects.</div>
              )}
              {objects && objects.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {objects.map((obj) => (
                    <div key={obj.address} className="border border-white/10 rounded-md p-3 bg-white/[0.02]">
                      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
                        <span className="text-[11px] font-semibold" style={{ color: "#FAFAE5" }}>{obj.typeName}</span>
                        <span className="text-[9px] px-1.5 py-0.5 border border-white/10 rounded" style={{ color: "rgba(250,250,229,0.5)" }}>v{obj.version}</span>
                      </div>
                      <div style={FIELD}>
                        <span style={F_LABEL}>Address</span>
                        <a href={`${SUISCAN_BASE}/object/${obj.address}`} target="_blank" rel="noopener noreferrer"
                           style={{ ...F_VALUE, color: `hsla(${H}, 70%, 65%, 0.8)` }}>
                          {obj.address}
                        </a>
                      </div>
                      {Object.entries(obj.json)
                        .filter(([key]) => key !== "id")
                        .map(([key, val]) => (
                          <div style={FIELD} key={key}>
                            <span style={F_LABEL}>{key}</span>
                            <span style={F_VALUE}>{typeof val === "object" ? JSON.stringify(val) : String(val ?? "")}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Inferred on-chain references */}
              {inferredRefs.length > 0 && (
                <>
                  <div className="text-[9px] tracking-widest uppercase mb-2 pt-2 border-t border-white/[0.06]"
                       style={{ color: "rgba(250,250,229,0.25)" }}>
                    On-chain references (events / character fields)
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {inferredRefs.map((r) => (
                      <div key={r.id} className="flex justify-between items-center gap-2 py-1 border-b border-white/[0.04]">
                        <span className="text-[10px] shrink-0" style={{ color: "rgba(250,250,229,0.4)" }}>{r.label}</span>
                        <a
                          href={`${SUISCAN_BASE}/object/${r.id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[10px] break-all"
                          style={{ color: `hsla(${H}, 60%, 60%, 0.7)` }}
                        >
                          {r.id}
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
