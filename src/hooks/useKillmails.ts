/**
 * @hook useKillmails
 * Fetches all on-chain Killmail objects and filters for Jotunn as killer or victim.
 * Paginates until exhausted (currently ~67 total on Stillness, grows slowly).
 *
 * @returns { kills, deaths, allKillmails, isLoading, error }
 */

import { useQuery } from "@tanstack/react-query";
import { graphqlQuery, TX_EVENTS_QUERY } from "../lib/graphql";
import { JOTUNN, WORLD_PACKAGE_ID, POLL_INTERVAL_MS } from "../lib/constants";

// Fallback to hardcoded Stillness package if env var not set
const PKG =
  WORLD_PACKAGE_ID ||
  "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";

export interface Killmail {
  address: string;
  killmailId: string;     // key.item_id
  killerId: string;       // item_id
  victimId: string;       // item_id
  lossType: "SHIP" | "STRUCTURE";
  solarSystemId: string;  // item_id (numeric string)
  killTimestamp: number;  // unix seconds
}

interface TxEventsResult {
  transactions: {
    nodes: Array<{
      digest: string;
      effects: {
        status: string;
        timestamp: string;
        events: { nodes: Array<{ contents: { json: Record<string, unknown>; type: { repr: string } }; timestamp: string }> };
      };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface RawKillmailPage {
  objects: {
    nodes: Array<{
      address: string;
      asMoveObject: {
        contents: {
          json: {
            id: string;
            key: { item_id: string };
            killer_id: { item_id: string };
            victim_id: { item_id: string };
            loss_type: { "@variant": string };
            solar_system_id: { item_id: string };
            kill_timestamp: string;
          };
        };
      };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

function buildQuery(after?: string) {
  const afterClause = after ? `, after: "${after}"` : "";
  return `
    query GetKillmails {
      objects(first: 50${afterClause}, filter: { type: "${PKG}::killmail::Killmail" }) {
        nodes {
          address
          asMoveObject {
            contents {
              json
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
}

async function fetchAllKillmails(): Promise<Killmail[]> {
  const all: Killmail[] = [];
  let cursor: string | null = null;

  while (true) {
    const data: RawKillmailPage = await graphqlQuery<RawKillmailPage>(buildQuery(cursor ?? undefined));
    const { nodes, pageInfo }: RawKillmailPage["objects"] = data.objects;

    for (const node of nodes) {
      const j = node.asMoveObject.contents.json;
      all.push({
        address: node.address,
        killmailId: j.key.item_id,
        killerId: j.killer_id.item_id,
        victimId: j.victim_id.item_id,
        lossType: j.loss_type["@variant"] as "SHIP" | "STRUCTURE",
        solarSystemId: j.solar_system_id.item_id,
        killTimestamp: parseInt(j.kill_timestamp, 10),
      });
    }

    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  return all;
}

function parseKillmailEvent(json: Record<string, unknown>): Killmail | null {
  try {
    const j = json as {
      killer_id?: { item_id: string };
      victim_id?: { item_id: string };
      solar_system_id?: { item_id: string };
      loss_type?: { "@variant": string };
      kill_timestamp?: string;
      key?: { item_id: string };
      id?: { item_id: string };
    };
    if (!j.killer_id?.item_id || !j.victim_id?.item_id) return null;
    const killmailId =
      j.key?.item_id ??
      j.id?.item_id ??
      `${j.killer_id.item_id}-${j.victim_id.item_id}-${j.kill_timestamp}`;
    return {
      address: "",
      killmailId,
      killerId: j.killer_id.item_id,
      victimId: j.victim_id.item_id,
      lossType: (j.loss_type?.["@variant"] ?? "SHIP") as "SHIP" | "STRUCTURE",
      solarSystemId: j.solar_system_id?.item_id ?? "",
      killTimestamp: parseInt(j.kill_timestamp ?? "0", 10),
    };
  } catch {
    return null;
  }
}

async function fetchKillsFromEvents(): Promise<Killmail[]> {
  const SUFFIX = "::killmail::KillmailCreatedEvent";

  async function forAddress(addr: string): Promise<Killmail[]> {
    const kills: Killmail[] = [];
    let after: string | null = null;
    let pages = 0;
    while (pages < 10) {
      const data: TxEventsResult = await graphqlQuery<TxEventsResult>(TX_EVENTS_QUERY, {
        address: addr,
        first: 50,
        after,
      });
      for (const tx of data.transactions.nodes) {
        for (const ev of tx.effects.events?.nodes ?? []) {
          if (!ev.contents.type.repr.endsWith(SUFFIX)) continue;
          const km = parseKillmailEvent(ev.contents.json);
          if (km) kills.push(km);
        }
      }
      if (!data.transactions.pageInfo.hasNextPage) break;
      after = data.transactions.pageInfo.endCursor;
      pages++;
    }
    return kills;
  }

  const [fromWallet, fromChar] = await Promise.all([
    forAddress(JOTUNN.wallet),
    forAddress(JOTUNN.characterId),
  ]);
  return [...fromWallet, ...fromChar];
}

export function useKillmails() {
  return useQuery({
    queryKey: ["killmails", JOTUNN.itemId],
    queryFn: async () => {
      const [objectKills, eventKills] = await Promise.all([
        fetchAllKillmails().catch(() => [] as Killmail[]),
        fetchKillsFromEvents().catch(() => [] as Killmail[]),
      ]);
      // Object-based records come first — they win on duplicate killmailId
      const seen = new Set<string>();
      const all: Killmail[] = [];
      for (const km of [...objectKills, ...eventKills]) {
        if (!seen.has(km.killmailId)) { seen.add(km.killmailId); all.push(km); }
      }
      const kills  = all.filter((k) => k.killerId === JOTUNN.itemId);
      const deaths = all.filter((k) => k.victimId === JOTUNN.itemId);
      return { kills, deaths, allKillmails: all };
    },
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });
}
