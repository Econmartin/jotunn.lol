/*
 * Character Hero — READ card. useCharacter + getTribeInfo (Sui GraphQL + Datahub).
 * Always shown in "expanded" mode inside HeroSection.
 * Two-column: left = name + badges, right = detail rows.
 */

import { useQuery } from "@tanstack/react-query";
import { useCharacter } from "../../hooks/useCharacter";
import { JOTUNN, SUISCAN_BASE, MARTIAN_H } from "../../lib/constants";
import { getTribeInfo } from "../../lib/datahub";
import { GlassCard } from "../GlassCard";

const H = MARTIAN_H;

function Row({ label, value, mono = false, link }: { label: string; value: string; mono?: boolean; link?: string }) {
  return (
    <div className="flex justify-between gap-2 py-[3px] border-b border-white/[0.04]">
      <span className="text-[10px] shrink-0" style={{ color: "rgba(250,250,229,0.4)" }}>{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
           style={{ color: `hsla(${H}, 70%, 65%, 0.8)`, fontSize: "10px", textAlign: "right", wordBreak: "break-all", fontFamily: mono ? "monospace" : undefined }}>
          {value}
        </a>
      ) : (
        <span className="text-[10px] text-right break-all"
              style={{ color: "rgba(250,250,229,0.75)", fontFamily: mono ? "monospace" : undefined }}>
          {value}
        </span>
      )}
    </div>
  );
}

export function CharacterHero() {
  const { data: character, isLoading, error } = useCharacter();
  const tribeId = character?.json.tribe_id ?? JOTUNN.tribeId;

  const { data: tribe } = useQuery({
    queryKey: ["tribe", tribeId],
    queryFn: () => getTribeInfo(tribeId),
    staleTime: Infinity,
  });

  const name    = character?.json.metadata.name ?? JOTUNN.name;
  const wallet  = character?.json.character_address ?? JOTUNN.wallet;
  const charId  = character?.address ?? JOTUNN.characterId;
  const itemId  = character?.json.key.item_id ?? JOTUNN.itemId;
  const tenant  = character?.json.key.tenant ?? "stillness";
  const taxRate = tribe ? `${(tribe.taxRate * 100).toFixed(0)}%` : "—";

  return (
    <GlassCard accentH={H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-row gap-4">

        {/* ── Left: name + badges ───────────────────────────── */}
        <div className="flex flex-col justify-center gap-2 shrink-0" style={{ flex: "0 0 180px" }}>
          <div className="text-[9px] tracking-[0.12em] uppercase" style={{ color: `hsla(${H}, 20%, 60%, 0.5)` }}>
            Character
          </div>
          <div className="text-[13px] font-bold leading-tight" style={{ color: "rgba(250,250,229,0.95)" }}>
            {isLoading ? "…" : name}
          </div>
          {error && <div className="text-[10px] text-red-400">Failed to load</div>}

          <div className="flex gap-1 flex-wrap">
            {[
              { label: "STILLNESS" },
              { label: `TAX ${taxRate}` },
            ].map(({ label }) => (
              <span key={label}
                    className="text-[9px] font-bold py-px px-1.5 rounded-[3px] tracking-[0.06em] font-mono"
                    style={{
                      background: `hsla(${H}, 60%, 50%, 0.12)`,
                      border: `1px solid hsla(${H}, 60%, 50%, 0.3)`,
                      color: `hsla(${H}, 60%, 65%, 0.85)`,
                    }}>
                {label}
              </span>
            ))}
          </div>

          {tribe?.description && (
            <div className="text-[9px] leading-[1.5] mt-1" style={{ color: "rgba(250,250,229,0.35)" }}>
              {tribe.description}
            </div>
          )}
        </div>

        {/* ── Right: detail rows ────────────────────────────── */}
        <div className="flex-1 min-w-0 border-l border-white/[0.07] pl-4 flex flex-col justify-center gap-0">
          <Row label="Item ID" value={itemId} mono />
          <Row label="Tenant"  value={tenant.toUpperCase()} mono />
          <Row label="Wallet"  value={wallet} mono link={`${SUISCAN_BASE}/account/${wallet}`} />
          <Row label="Char ID" value={charId} mono link={`${SUISCAN_BASE}/object/${JOTUNN.characterId}`} />
        </div>

      </div>
    </GlassCard>
  );
}
