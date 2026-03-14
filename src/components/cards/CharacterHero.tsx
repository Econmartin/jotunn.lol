/*
 * Character Hero — READ card. useCharacter + getTribeInfo (Sui GraphQL + Datahub).
 */

import { useQuery } from "@tanstack/react-query";
import { useCharacter } from "../../hooks/useCharacter";
import { JOTUNN, SUISCAN_BASE } from "../../lib/constants";
import { getTribeInfo } from "../../lib/datahub";
import { StatBadge } from "../StatBadge";
import { GlassCard } from "../GlassCard";

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="card-field">
      <span className="card-field-label">{label}</span>
      <span
        className="card-field-value"
        style={
          mono ? { fontFamily: "monospace", fontSize: "0.75rem" } : undefined
        }
      >
        {value}
      </span>
    </div>
  );
}

export function CharacterHero() {
  const { data: character, isLoading, error } = useCharacter();
  const tribeId = character?.json.tribe_id ?? JOTUNN.tribeId;

  const tribe = useQuery({
    queryKey: ["tribe", tribeId],
    queryFn: () => getTribeInfo(tribeId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "hsla(210, 50%, 30%, 0.5)",
              border: "1px solid hsla(210, 50%, 50%, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>🧊</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(210, 20%, 65%, 0.55)" }}>CHARACTER</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(210, 20%, 75%, 0.7)" }}>Loading...</div>
            </div>
          </div>
          <div className="card-loading" style={{ flex: 1 }}>Loading character data...</div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "hsla(210, 50%, 30%, 0.5)",
              border: "1px solid hsla(210, 50%, 50%, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>🧊</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(210, 20%, 65%, 0.55)" }}>CHARACTER</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(210, 20%, 75%, 0.7)" }}>Error</div>
            </div>
          </div>
          <div className="card-error" style={{ flex: 1 }}>Failed to load: {error.message}</div>
        </div>
      </GlassCard>
    );
  }

  if (!character) {
    return (
      <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "hsla(210, 50%, 30%, 0.5)",
              border: "1px solid hsla(210, 50%, 50%, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>🧊</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(210, 20%, 65%, 0.55)" }}>CHARACTER</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(210, 20%, 75%, 0.7)" }}>Not found</div>
            </div>
          </div>
          <div className="card-loading" style={{ flex: 1 }}>Character not found</div>
        </div>
      </GlassCard>
    );
  }

  const { json } = character;
  const tribeName = tribe.data
    ? `${tribe.data.name} [${tribe.data.nameShort}]`
    : `Tribe ${json.tribe_id}`;

  return (
    <GlassCard accentH={25} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
        <div className="hero-header">
          <div className="hero-name-row">
            <h2 className="hero-name">{json.metadata.name}</h2>
            <span className="hero-tribe">{tribeName}</span>
          </div>
          <div className="hero-stats">
            <StatBadge label="VERSION" value={character.version} />
            <StatBadge label="ITEM ID" value={json.key.item_id} />
            <StatBadge label="TENANT" value={json.key.tenant.toUpperCase()} />
            <StatBadge label="DYN FIELDS" value={character.dynamicFields.length} />
          </div>
        </div>

        {tribe.data && (
          <div className="tribe-detail">
            <Field label="Tribe" value={tribe.data.name} />
            <Field label="Tag" value={tribe.data.nameShort} />
            <Field label="Tax Rate" value={`${(tribe.data.taxRate * 100).toFixed(0)}%`} />
            {tribe.data.description && (
              <Field label="Tribe Desc" value={tribe.data.description} />
            )}
          </div>
        )}

        <div className="hero-body">
          <Field label="Character ID" value={character.address} mono />
          <Field label="Wallet" value={json.character_address} mono />
          <Field label="Owner Cap" value={json.owner_cap_id} mono />
          <Field label="Digest" value={character.digest} mono />
          {json.metadata.description && (
            <Field label="Description" value={json.metadata.description} />
          )}
        </div>

        <div className="hero-links">
          <a
            href={`${SUISCAN_BASE}/object/${JOTUNN.characterId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Suiscan
          </a>
          <a
            href={`${SUISCAN_BASE}/account/${JOTUNN.wallet}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Wallet on Suiscan
          </a>
        </div>
      </div>
    </GlassCard>
  );
}
