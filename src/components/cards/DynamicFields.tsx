/*
 * Dynamic Fields — READ card. useCharacter → dynamicFields from CHARACTER_QUERY.
 */

import { useState } from "react";
import { useCharacter } from "../../hooks/useCharacter";
import type { DynamicField } from "../../lib/types";
import { GlassCard } from "../GlassCard";

function FieldRow({ field, defaultOpen }: { field: DynamicField; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const nameRepr = typeof field.name?.json === "object" ? JSON.stringify(field.name.json) : String(field.name?.json ?? "");
  const typeRepr = field.name?.type?.repr ?? "";
  const valueStr = JSON.stringify(field.contents?.json ?? {}, null, 2);

  return (
    <div
      style={{
        border: "1px solid hsla(215, 30%, 35%, 0.25)",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "hsla(215, 25%, 14%, 0.5)",
          border: "none",
          color: "hsla(215, 20%, 80%, 0.9)",
          fontSize: 11,
          fontFamily: "monospace",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ opacity: 0.7 }}>{open ? "▼" : "▶"}</span>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameRepr}</span>
        <span style={{ fontSize: 10, color: "hsla(215, 20%, 55%, 0.8)" }}>{typeRepr.split("::").pop() ?? typeRepr}</span>
      </button>
      {open && (
        <pre
          style={{
            margin: 0,
            padding: 10,
            fontSize: 10,
            fontFamily: "monospace",
            background: "hsla(215, 20%, 8%, 0.6)",
            color: "hsla(215, 25%, 75%, 0.85)",
            overflow: "auto",
            maxHeight: 120,
            borderTop: "1px solid hsla(215, 30%, 25%, 0.2)",
          }}
        >
          {valueStr}
        </pre>
      )}
    </div>
  );
}

export function DynamicFields() {
  const { data: character, isLoading, error } = useCharacter();
  const fields = character?.dynamicFields ?? [];

  return (
    <GlassCard accentH={215} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(215, 50%, 30%, 0.5)",
            border: "1px solid hsla(215, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🧬</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(215, 20%, 65%, 0.55)" }}>DYNAMIC FIELDS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(215, 20%, 75%, 0.7)" }}>Raw fields ({fields.length})</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {isLoading && <div className="card-loading">Loading character...</div>}
          {error && <div className="card-error">Error: {error.message}</div>}
          {!isLoading && !error && fields.length === 0 && (
            <p className="text-muted">No dynamic fields.</p>
          )}
          {fields.length > 0 && fields.map((field, i) => <FieldRow key={i} field={field} defaultOpen={i === 0} />)}
        </div>
      </div>
    </GlassCard>
  );
}
