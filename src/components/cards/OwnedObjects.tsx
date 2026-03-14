/*
 * Owned Objects — READ card. useOwnedObjects (Sui GraphQL), filtered by WORLD_PACKAGE_ID.
 */

import { useOwnedObjects } from "../../hooks/useOwnedObjects";
import { SUISCAN_BASE } from "../../lib/constants";
import { GlassCard } from "../GlassCard";

export function OwnedObjects() {
  const { data: objects, isLoading, error } = useOwnedObjects();

  return (
    <GlassCard accentH={210} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(210, 50%, 30%, 0.5)",
            border: "1px solid hsla(210, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📦</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(210, 20%, 65%, 0.55)" }}>OBJECTS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(210, 20%, 75%, 0.7)" }}>Owned objects</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {isLoading && <div className="card-loading">Loading owned objects...</div>}
          {error && <div className="card-error">Error: {error.message}</div>}
          {objects && objects.length === 0 && (
            <p className="text-muted">No world-package objects owned by this wallet.</p>
          )}
          {objects && objects.length > 0 && (
            <div className="card-grid">
              {objects.map((obj) => (
                <div className="card" key={obj.address}>
                  <div className="card-header">
                    <h4>{obj.typeName}</h4>
                    <span className="card-type-tag">v{obj.version}</span>
                  </div>
                  <div className="card-field">
                    <span className="card-field-label">Address</span>
                    <a
                      className="card-field-value link-mono"
                      href={`${SUISCAN_BASE}/object/${obj.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {obj.address}
                    </a>
                  </div>
                  {Object.entries(obj.json)
                    .filter(([key]) => key !== "id")
                    .map(([key, val]) => (
                      <div className="card-field" key={key}>
                        <span className="card-field-label">{key}</span>
                        <span className="card-field-value">
                          {typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val ?? "")}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
