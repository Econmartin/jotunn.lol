import { useQuery } from "@tanstack/react-query";
import type { CharacterObject } from "../lib/types";
import { JOTUNN, SUISCAN_BASE } from "../lib/constants";
import { getTribeInfo } from "../lib/datahub";
import { StatBadge } from "./StatBadge";

interface Props {
  character: CharacterObject | null;
  isLoading: boolean;
  error: Error | null;
}

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

export function CharacterCard({ character, isLoading, error }: Props) {
  const tribeId = character?.json.tribe_id ?? JOTUNN.tribeId;

  const tribe = useQuery({
    queryKey: ["tribe", tribeId],
    queryFn: () => getTribeInfo(tribeId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="hero-card">
        <div className="card-loading">Loading character data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero-card card-error">
        <div>Failed to load: {error.message}</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="hero-card">
        <div className="card-loading">Character not found</div>
      </div>
    );
  }

  const { json } = character;
  const tribeName = tribe.data
    ? `${tribe.data.name} [${tribe.data.nameShort}]`
    : `Tribe ${json.tribe_id}`;

  return (
    <div className="hero-card">
      <div className="hero-header">
        <div className="hero-name-row">
          <h2 className="hero-name">{json.metadata.name}</h2>
          <span className="hero-tribe">{tribeName}</span>
        </div>
        <div className="hero-stats">
          <StatBadge label="VERSION" value={character.version} />
          <StatBadge label="ITEM ID" value={json.key.item_id} />
          <StatBadge label="TENANT" value={json.key.tenant.toUpperCase()} />
          <StatBadge
            label="DYN FIELDS"
            value={character.dynamicFields.length}
          />
        </div>
      </div>

      {tribe.data && (
        <div className="tribe-detail">
          <Field label="Tribe" value={tribe.data.name} />
          <Field label="Tag" value={tribe.data.nameShort} />
          <Field
            label="Tax Rate"
            value={`${(tribe.data.taxRate * 100).toFixed(0)}%`}
          />
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
  );
}
