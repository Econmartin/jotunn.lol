/*
 * Tribe Detail — READ card. getTribeInfo(tribe_id) from Datahub; tribe_id from useCharacter.
 */

import { useQuery } from "@tanstack/react-query";
import { useCharacter } from "../../hooks/useCharacter";
import { JOTUNN } from "../../lib/constants";
import { getTribeInfo } from "../../lib/datahub";
import { GlassCard } from "../GlassCard";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-field">
      <span className="card-field-label">{label}</span>
      <span className="card-field-value">{value}</span>
    </div>
  );
}

export function TribeDetail() {
  const { data: character, isLoading, error } = useCharacter();
  const tribeId = character?.json.tribe_id ?? JOTUNN.tribeId;

  const tribe = useQuery({
    queryKey: ["tribe", tribeId],
    queryFn: () => getTribeInfo(tribeId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <GlassCard accentH={185} style={{ height: "100%", width: "100%" }}>
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "hsla(185, 50%, 30%, 0.5)",
              border: "1px solid hsla(185, 50%, 50%, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>🏴</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(185, 20%, 65%, 0.55)" }}>TRIBE</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(185, 20%, 75%, 0.7)" }}>Loading...</div>
            </div>
          </div>
          <div className="card-loading" style={{ flex: 1 }}>Loading tribe...</div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard accentH={185} style={{ height: "100%", width: "100%" }}>
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "hsla(185, 50%, 30%, 0.5)",
              border: "1px solid hsla(185, 50%, 50%, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>🏴</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(185, 20%, 65%, 0.55)" }}>TRIBE</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(185, 20%, 75%, 0.7)" }}>Error</div>
            </div>
          </div>
          <div className="card-error" style={{ flex: 1 }}>{error.message}</div>
        </div>
      </GlassCard>
    );
  }

  const tribeData = tribe.data;
  const title = tribeData ? tribeData.name : `Tribe ${tribeId}`;

  return (
    <GlassCard accentH={185} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(185, 50%, 30%, 0.5)",
            border: "1px solid hsla(185, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🏴</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(185, 20%, 65%, 0.55)" }}>TRIBE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(185, 20%, 75%, 0.7)" }}>{title}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {tribeData ? (
            <>
              <Field label="Name" value={tribeData.name} />
              <Field label="Tag" value={tribeData.nameShort} />
              <Field label="Tax Rate" value={`${(tribeData.taxRate * 100).toFixed(0)}%`} />
              {tribeData.description && <Field label="Description" value={tribeData.description} />}
              {tribeData.tribeUrl && (
                <div className="card-field">
                  <span className="card-field-label">URL</span>
                  <a
                    className="card-field-value"
                    href={tribeData.tribeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tribeData.tribeUrl}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="card-loading">Tribe {tribeId} not found</div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
