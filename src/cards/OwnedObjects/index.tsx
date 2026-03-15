/**
 * @card OwnedObjects
 * @description Grid of world-package objects owned by the wallet with expandable fields.
 *   Collapsed: header only (count badge).
 *   Expanded:  header left, object grid right.
 *
 * @deps
 *   - src/components/GlassCard/   — glassmorphism wrapper
 *   - src/hooks/useOwnedObjects.ts — paginated Sui GraphQL owned objects
 *   - src/lib/constants.ts         — SUISCAN_BASE, WORLD_PACKAGE_ID filter
 *
 * @dataflow
 *   Sui GraphQL → useOwnedObjects() → OwnedObjects
 */

import { useContext } from "react";
import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { SUISCAN_BASE, MARTIAN_H } from "../../lib/constants";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { SvgIcon } from "../../components/SvgIcon";

const H = MARTIAN_H;
const FIELD   = { display: "flex", justifyContent: "space-between", gap: 8, padding: "2px 0", lineHeight: 1.4 } as const;
const F_LABEL = { color: "rgba(250,250,229,0.5)", whiteSpace: "nowrap" as const, flexShrink: 0, fontSize: "10px" };
const F_VALUE = { textAlign: "right" as const, wordBreak: "break-all" as const, color: "#FAFAE5", fontSize: "10px" };

export function OwnedObjects() {
  const { data: objects, isLoading, error } = useOwnedObjects();
  const isExpanded = useContext(CardExpandedContext);

  const header = (
    <div className="flex items-center gap-2 shrink-0">
      <SvgIcon src="/assets/object.svg" size={22} />
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
          /* Collapsed: header + subtle count, no object data */
          <div className="h-full flex flex-col justify-center gap-2">
            {header}
            {isLoading && <div className="text-xs" style={{ color: "rgba(250,250,229,0.4)" }}>Loading…</div>}
            {error    && <div className="text-xs text-red-400">Error: {error.message}</div>}
            {objects && (
              <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>
                {objects.length === 0 ? "No objects found" : `${objects.length} on-chain object${objects.length !== 1 ? "s" : ""} · click to inspect`}
              </div>
            )}
          </div>
        ) : (
          /* Expanded: header left, grid right */
          <div className="h-full flex flex-row gap-4">
            <div className="flex flex-col gap-2 justify-start pt-1 shrink-0" style={{ flex: "0 0 160px" }}>
              {header}
              {isLoading && <div className="text-xs" style={{ color: "rgba(250,250,229,0.4)" }}>Loading…</div>}
              {error    && <div className="text-xs text-red-400">Error: {error.message}</div>}
              {objects && <div className="text-xs" style={{ color: "rgba(250,250,229,0.35)" }}>{objects.length} object{objects.length !== 1 ? "s" : ""}</div>}
            </div>

            <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-4 overflow-auto">
              {objects && objects.length === 0 && (
                <div className="text-xs" style={{ color: "rgba(250,250,229,0.4)" }}>No world-package objects.</div>
              )}
              {objects && objects.length > 0 && (
                <div className="flex flex-col gap-3">
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
            </div>
          </div>
        )}

      </div>
    </GlassCard>
  );
}
