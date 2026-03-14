/*
 * Full-width hero section: character + tribe info. Always visible, no expand.
 */

import { useQuery } from "@tanstack/react-query";
import { useCharacter } from "../hooks/useCharacter";
import { JOTUNN, SUISCAN_BASE } from "../lib/constants";
import { getTribeInfo } from "../lib/datahub";
import { StatBadge } from "./StatBadge";

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
    <div className="card-field" style={{ marginBottom: 4 }}>
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

export function HeroSection() {
  const { data: character, isLoading, error } = useCharacter();
  const tribeId = character?.json.tribe_id ?? JOTUNN.tribeId;

  const tribe = useQuery({
    queryKey: ["tribe", tribeId],
    queryFn: () => getTribeInfo(tribeId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <section
        style={{
          width: "100%",
          maxWidth: 1080,
          marginBottom: 24,
          padding: "24px 28px",
          background: `linear-gradient(160deg, hsla(25, 30%, 18%, 0.45) 0%, hsla(25, 25%, 8%, 0.55) 50%, hsla(25, 35%, 12%, 0.4) 100%)`,
          backdropFilter: "blur(40px) saturate(1.4)",
          WebkitBackdropFilter: "blur(40px) saturate(1.4)",
          border: "1.2px solid",
          borderTopColor: "hsla(25, 60%, 60%, 0.35)",
          borderLeftColor: "hsla(25, 50%, 55%, 0.22)",
          borderRightColor: "hsla(25, 40%, 40%, 0.15)",
          borderBottomColor: "hsla(25, 35%, 30%, 0.2)",
          borderRadius: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="card-loading">Loading character data...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        style={{
          width: "100%",
          maxWidth: 1080,
          marginBottom: 24,
          padding: "24px 28px",
          background: `linear-gradient(160deg, hsla(25, 30%, 18%, 0.45) 0%, hsla(25, 25%, 8%, 0.55) 50%, hsla(25, 35%, 12%, 0.4) 100%)`,
          backdropFilter: "blur(40px) saturate(1.4)",
          WebkitBackdropFilter: "blur(40px) saturate(1.4)",
          border: "1.2px solid hsla(25, 50%, 50%, 0.25)",
          borderRadius: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="card-error">Failed to load: {error.message}</div>
      </section>
    );
  }

  if (!character) {
    return (
      <section
        style={{
          width: "100%",
          maxWidth: 1080,
          marginBottom: 24,
          padding: "24px 28px",
          background: `linear-gradient(160deg, hsla(25, 30%, 18%, 0.45) 0%, hsla(25, 25%, 8%, 0.55) 50%, hsla(25, 35%, 12%, 0.4) 100%)`,
          backdropFilter: "blur(40px) saturate(1.4)",
          WebkitBackdropFilter: "blur(40px) saturate(1.4)",
          border: "1.2px solid hsla(25, 50%, 50%, 0.25)",
          borderRadius: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="card-loading">Character not found</div>
      </section>
    );
  }

  const { json } = character;
  const tribeName = tribe.data
    ? `${tribe.data.name} [${tribe.data.nameShort}]`
    : `Tribe ${json.tribe_id}`;

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1080,
        marginBottom: 24,
        padding: "24px 28px",
        background: `linear-gradient(160deg, hsla(25, 30%, 18%, 0.45) 0%, hsla(25, 25%, 8%, 0.55) 50%, hsla(25, 35%, 12%, 0.4) 100%)`,
        backdropFilter: "blur(40px) saturate(1.4)",
        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
        border: "1.2px solid",
        borderTopColor: "hsla(25, 60%, 60%, 0.35)",
        borderLeftColor: "hsla(25, 50%, 55%, 0.22)",
        borderRightColor: "hsla(25, 40%, 40%, 0.15)",
        borderBottomColor: "hsla(25, 35%, 30%, 0.2)",
        borderRadius: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 32px", alignItems: "flex-start" }}>
        {/* Name + tribe + stats */}
        <div className="hero-header" style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div className="hero-name-row">
            <h2 className="hero-name" style={{ margin: 0 }}>{json.metadata.name}</h2>
            <span className="hero-tribe">{tribeName}</span>
          </div>
          <div className="hero-stats" style={{ marginTop: 12 }}>
            <StatBadge label="VERSION" value={character.version} />
            <StatBadge label="ITEM ID" value={json.key.item_id} />
            <StatBadge label="TENANT" value={json.key.tenant.toUpperCase()} />
            <StatBadge label="DYN FIELDS" value={character.dynamicFields.length} />
          </div>
        </div>

        {/* Tribe detail */}
        {tribe.data && (
          <div className="tribe-detail" style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Field label="Tribe" value={tribe.data.name} />
            <Field label="Tag" value={tribe.data.nameShort} />
            <Field label="Tax Rate" value={`${(tribe.data.taxRate * 100).toFixed(0)}%`} />
            {tribe.data.description && (
              <Field label="Tribe Desc" value={tribe.data.description} />
            )}
          </div>
        )}

        {/* IDs + links */}
        <div className="hero-body" style={{ flex: "1 1 280px", minWidth: 0 }}>
          <Field label="Character ID" value={character.address} mono />
          <Field label="Wallet" value={json.character_address} mono />
          <div className="hero-links" style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
            <a
              href={`${SUISCAN_BASE}/object/${JOTUNN.characterId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "hsla(25, 70%, 65%, 0.95)", fontSize: 12 }}
            >
              View on Suiscan
            </a>
            <a
              href={`${SUISCAN_BASE}/account/${JOTUNN.wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "hsla(25, 70%, 65%, 0.95)", fontSize: 12 }}
            >
              Wallet on Suiscan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
